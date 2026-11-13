/**
 * POST /api/contact — Cloudflare Pages Function for the demo and contact forms.
 *
 * Accepts JSON (sent by the enhanced client script) or form-encoded / multipart
 * bodies (plain HTML form posts without JavaScript).
 *   - JSON in      → JSON out: { ok: true } | { ok: false, error, message, fields? }
 *   - Form post in → 303 redirect to /demo/ or /contact/ with ?sent=1 or ?error=<code>
 *
 * Protections: payload size limit, origin check, honeypot field, minimum
 * time-to-submit, strict server-side validation (shared schema), and optional
 * Cloudflare Turnstile verification when TURNSTILE_SECRET_KEY is set.
 *
 * Delivery: Resend HTTP API (RESEND_API_KEY) and/or a generic JSON webhook
 * (CONTACT_WEBHOOK_URL). Success is only reported when at least one configured
 * destination returned a 2xx. With no destination configured → 503.
 *
 * See deployment/forms.md for configuration.
 */
import {
  HONEYPOT, LIMITS, TIMESTAMP, ROLE_OPTIONS, SIZE_OPTIONS, INTEREST_OPTIONS, TOPIC_OPTIONS,
  normalise, validate, labelFor,
  type FieldErrors, type Submission,
} from '../../src/components/forms/schema';

/* ---------- Local types (no @cloudflare/workers-types dependency) ---------- */
export interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  CONTACT_WEBHOOK_URL?: string;
  CONTACT_WEBHOOK_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  /** Optional comma-separated list of exact origins that replaces the defaults. */
  ALLOWED_ORIGINS?: string;
}
interface PagesContext<E> {
  request: Request;
  env: E;
  waitUntil(promise: Promise<unknown>): void;
}
type PagesFunction<E> = (context: PagesContext<E>) => Response | Promise<Response>;

type ErrorCode = 'invalid' | 'spam' | 'origin' | 'too-large' | 'unsupported' | 'unavailable' | 'delivery' | 'verification';

const DEFAULT_TO = 'sales@panoptes.watch';
const DEFAULT_FROM = 'Panoptes Website <website@panoptes.watch>';
const FALLBACK = 'Please email sales@panoptes.watch directly.';

/* ---------- Helpers ---------- */
const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });

/** Exported for tests. */
export function isAllowedOrigin(origin: string, env: Env): boolean {
  let url: URL;
  try { url = new URL(origin); } catch { return false; }
  if (env.ALLOWED_ORIGINS) {
    return env.ALLOWED_ORIGINS.split(',').map((s) => s.trim().replace(/\/$/, '')).includes(url.origin);
  }
  const host = url.hostname;
  if (url.protocol === 'https:' && (host === 'panoptes.watch' || host === 'www.panoptes.watch')) return true;
  if (url.protocol === 'https:' && host.endsWith('.pages.dev')) return true; // Cloudflare Pages previews
  if (url.protocol === 'http:' && (host === 'localhost' || host === '127.0.0.1')) return true;
  return false;
}

function requestOrigin(request: Request): string | null {
  const o = request.headers.get('origin');
  if (o && o !== 'null') return o;
  const r = request.headers.get('referer');
  if (r) { try { return new URL(r).origin; } catch { return null; } }
  return null;
}

/** Strip control characters (incl. CR/LF) from single-line values. */
const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();

async function readBody(request: Request): Promise<{ raw: Record<string, unknown>; isJson: boolean } | ErrorCode> {
  const type = (request.headers.get('content-type') || '').toLowerCase();
  const declared = Number(request.headers.get('content-length') || '0');
  if (declared > LIMITS.body) return 'too-large';
  const text = await request.text();
  if (new TextEncoder().encode(text).length > LIMITS.body) return 'too-large';

  if (type.includes('application/json')) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return 'invalid';
      return { raw: parsed as Record<string, unknown>, isJson: true };
    } catch { return 'invalid'; }
  }
  if (type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data')) {
    let fd: FormData;
    try {
      // Re-wrap the already-read text so we can use the platform parser for both encodings.
      fd = await new Request('https://form.invalid/', { method: 'POST', headers: { 'content-type': type }, body: text }).formData();
    } catch { return 'invalid'; }
    const raw: Record<string, unknown> = {};
    for (const [k, v] of fd.entries()) {
      if (typeof v !== 'string') continue; // ignore file uploads entirely
      if (k === 'interests') raw.interests = [...((raw.interests as string[]) || []), v];
      else raw[k] = v;
    }
    return { raw, isJson: false };
  }
  return 'unsupported';
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch { return false; }
}

function composeEmail(sub: Submission, meta: { origin: string; ip: string | null; country: string | null }) {
  const kind = sub.form === 'demo' ? 'Demo request' : `Contact (${labelFor(TOPIC_OPTIONS, sub.topic)})`;
  const subject = oneLine(`[Website] ${kind} — ${sub.name}${sub.company ? `, ${sub.company}` : ''}`).slice(0, 200);
  const lines: [string, string][] = [
    ['Form', sub.form === 'demo' ? 'Book a Demo' : 'Contact'],
    ['Name', oneLine(sub.name)],
    ['Email', oneLine(sub.email)],
    ['Company', oneLine(sub.company) || '—'],
  ];
  if (sub.form === 'demo') {
    lines.push(['Role', labelFor(ROLE_OPTIONS, sub.role)]);
    lines.push(['Company size', labelFor(SIZE_OPTIONS, sub.size)]);
    lines.push(['Interests', sub.interests.map((i) => labelFor(INTEREST_OPTIONS, i)).join(', ') || '—']);
  } else {
    lines.push(['Topic', labelFor(TOPIC_OPTIONS, sub.topic)]);
  }
  lines.push(['Consent', sub.consent ? 'Yes' : 'No']);
  const text = [
    ...lines.map(([k, v]) => `${k}: ${v}`),
    '',
    'Message:',
    sub.message || '—',
    '',
    '---',
    `Submitted from ${meta.origin} at ${new Date().toISOString()}`,
    meta.country ? `Country (Cloudflare): ${meta.country}` : '',
  ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
  return { subject, text };
}

async function deliver(env: Env, sub: Submission, meta: Parameters<typeof composeEmail>[1]): Promise<'sent' | 'unavailable' | 'failed'> {
  const hasResend = !!env.RESEND_API_KEY;
  const hasWebhook = !!env.CONTACT_WEBHOOK_URL;
  if (!hasResend && !hasWebhook) return 'unavailable';

  const { subject, text } = composeEmail(sub, meta);
  const attempts: Promise<boolean>[] = [];

  if (hasResend) {
    attempts.push((async () => {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
          body: JSON.stringify({
            from: env.CONTACT_FROM || DEFAULT_FROM,
            to: (env.CONTACT_TO || DEFAULT_TO).split(',').map((s) => s.trim()).filter(Boolean),
            reply_to: sub.email,
            subject,
            text,
          }),
        });
        // Status only: Resend error bodies can echo submitted values such as the visitor's email address.
        if (!res.ok) console.error('Resend delivery failed', res.status);
        return res.ok;
      } catch (err) { console.error('Resend delivery error', String(err)); return false; }
    })());
  }

  if (hasWebhook) {
    attempts.push((async () => {
      try {
        const payload = JSON.stringify({ type: `website.${sub.form}`, submittedAt: new Date().toISOString(), subject, text, submission: sub });
        const headers: Record<string, string> = { 'content-type': 'application/json' };
        if (env.CONTACT_WEBHOOK_SECRET) headers['x-panoptes-signature'] = await hmacHex(env.CONTACT_WEBHOOK_SECRET, payload);
        const res = await fetch(env.CONTACT_WEBHOOK_URL!, { method: 'POST', headers, body: payload });
        if (!res.ok) console.error('Webhook delivery failed', res.status);
        return res.ok;
      } catch (err) { console.error('Webhook delivery error', String(err)); return false; }
    })());
  }

  const results = await Promise.all(attempts);
  return results.some(Boolean) ? 'sent' : 'failed';
}

async function hmacHex(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  return 'sha256=' + [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const MESSAGES: Record<ErrorCode, [number, string]> = {
  invalid: [400, 'Some fields are missing or invalid. Please check the form and try again.'],
  spam: [400, `We could not accept this submission. ${FALLBACK}`],
  origin: [403, `This form can only be submitted from panoptes.watch. ${FALLBACK}`],
  'too-large': [413, `Your message is too long to send through the form. ${FALLBACK}`],
  unsupported: [415, `Unsupported submission format. ${FALLBACK}`],
  verification: [400, `We could not verify this submission. Please reload the page and try again, or email sales@panoptes.watch.`],
  unavailable: [503, `The form is temporarily unavailable. ${FALLBACK}`],
  delivery: [502, `We could not send your message just now. ${FALLBACK}`],
};

/* ---------- Handlers ---------- */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const wantsJson = (request.headers.get('content-type') || '').toLowerCase().includes('application/json')
    || (request.headers.get('accept') || '').includes('application/json');
  let formKind: 'demo' | 'contact' = 'contact';

  const fail = (code: ErrorCode, fields?: FieldErrors): Response => {
    const [status, message] = MESSAGES[code];
    if (wantsJson) return json(status, { ok: false, error: code, message, ...(fields ? { fields } : {}) });
    return new Response(null, { status: 303, headers: { location: `/${formKind}/?error=${code}`, 'cache-control': 'no-store' } });
  };

  // 1. Origin check (browsers always send Origin on cross-site and same-site POSTs).
  const origin = requestOrigin(request);
  if (!origin || !isAllowedOrigin(origin, env)) return fail('origin');

  // 2. Size + parse.
  const parsed = await readBody(request);
  if (typeof parsed === 'string') return fail(parsed);
  const { raw, isJson } = parsed;
  formKind = raw.form === 'demo' ? 'demo' : 'contact';

  // 3. Honeypot: any value means an automated submission. We answer with a
  //    generic 400 (not a fake success) so a real person whose browser
  //    autofilled the hidden field still sees how to reach us.
  const hp = raw[HONEYPOT];
  if (typeof hp === 'string' ? hp.trim() !== '' : hp != null && hp !== false) return fail('spam');

  // 4. Minimum time-to-submit. The client script stamps the page-load time.
  //    JSON posts always come from that script, so the stamp is required there;
  //    form-encoded posts without JS have no stamp and are allowed through.
  const ts = Number(raw[TIMESTAMP]);
  if (raw[TIMESTAMP] != null && raw[TIMESTAMP] !== '') {
    if (!Number.isFinite(ts) || Date.now() - ts < LIMITS.minFillMs) return fail('spam');
  } else if (isJson) {
    return fail('spam');
  }

  // 5. Validation.
  const sub = normalise(raw);
  const errors = validate(sub);
  if (Object.keys(errors).length) return fail('invalid', errors);

  // 6. Optional Turnstile.
  if (env.TURNSTILE_SECRET_KEY) {
    const token = typeof raw['cf-turnstile-response'] === 'string' ? (raw['cf-turnstile-response'] as string) : '';
    const ok = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, request.headers.get('cf-connecting-ip'));
    if (!ok) return fail('verification');
  }

  // 7. Delivery.
  const result = await deliver(env, sub, {
    origin,
    ip: request.headers.get('cf-connecting-ip'),
    country: request.headers.get('cf-ipcountry'),
  });
  if (result === 'unavailable') return fail('unavailable');
  if (result === 'failed') return fail('delivery');

  if (wantsJson) return json(200, { ok: true });
  return new Response(null, { status: 303, headers: { location: `/${formKind}/?sent=1`, 'cache-control': 'no-store' } });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  // Method-specific handlers normally take precedence; delegate defensively anyway.
  if (request.method === 'POST') return onRequestPost(context);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { allow: 'POST, OPTIONS' } });
  return json(405, { ok: false, error: 'method-not-allowed', message: 'Use POST.' }, { allow: 'POST' });
};
