/**
 * Shared form schema for the demo and contact forms.
 *
 * Imported by BOTH the browser (src/components/forms/form-client.ts) and the
 * Cloudflare Pages Function (functions/api/contact.ts), so client-side and
 * server-side validation can never drift apart. Keep this file free of DOM,
 * Node and Workers APIs — plain TypeScript only.
 */

export type FormKind = 'demo' | 'contact';
export type Option = { value: string; label: string };

export const ROLE_OPTIONS: Option[] = [
  { value: 'executive', label: 'Executive / founder' },
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Finance' },
  { value: 'revenue', label: 'Revenue / sales' },
  { value: 'customer-experience', label: 'Customer experience' },
  { value: 'data', label: 'Data / analytics' },
  { value: 'engineering', label: 'Engineering / IT' },
  { value: 'other', label: 'Other' },
];

export const SIZE_OPTIONS: Option[] = [
  { value: '1-49', label: '1–49 people' },
  { value: '50-199', label: '50–199 people' },
  { value: '200-999', label: '200–999 people' },
  { value: '1000-4999', label: '1,000–4,999 people' },
  { value: '5000+', label: '5,000+ people' },
];

export const INTEREST_OPTIONS: Option[] = [
  { value: 'revenue-leakage', label: 'Revenue leakage' },
  { value: 'bottlenecks', label: 'Operational bottlenecks' },
  { value: 'journeys', label: 'Customer journeys' },
  { value: 'sla', label: 'SLA and commitment monitoring' },
  { value: 'anomalies', label: 'Anomalies and root cause' },
  { value: 'executive-view', label: 'Executive operating view' },
  { value: 'integrations', label: 'Integrations and API' },
  { value: 'security', label: 'Security and governance' },
];

export const TOPIC_OPTIONS: Option[] = [
  { value: 'sales', label: 'Sales' },
  { value: 'partnerships', label: 'Partnerships' },
  { value: 'press', label: 'Press' },
  { value: 'other', label: 'Other' },
];

export const LIMITS = {
  name: 120,
  email: 254,
  company: 160,
  messageMin: 10,
  message: 5000,
  /** Maximum accepted request body in bytes (enforced by the function). */
  body: 16 * 1024,
  /** Minimum milliseconds between page load and submit (bot heuristic). */
  minFillMs: 3000,
} as const;

/** Name of the hidden honeypot input. Humans never see or fill it. */
export const HONEYPOT = 'website';
/** Name of the hidden field holding the page-load timestamp (ms since epoch). */
export const TIMESTAMP = '_ts';

/** Pragmatic email check: one @, no spaces, a dot in the domain, sane lengths. */
export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

/** Normalised submission after parsing JSON or form-encoded input. */
export interface Submission {
  form: FormKind;
  name: string;
  email: string;
  company: string;
  role: string;
  size: string;
  interests: string[];
  topic: string;
  message: string;
  consent: boolean;
}

export type FieldErrors = Partial<Record<keyof Submission, string>>;

const inEnum = (opts: Option[], v: string) => opts.some((o) => o.value === v);
export const labelFor = (opts: Option[], v: string) => opts.find((o) => o.value === v)?.label ?? v;

/** Coerce loosely-typed input (FormData entries or JSON) into a Submission. */
export function normalise(raw: Record<string, unknown>): Submission {
  const s = (k: string) => {
    const v = raw[k];
    return typeof v === 'string' ? v.trim() : '';
  };
  const list = (k: string): string[] => {
    const v = raw[k];
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean);
    if (typeof v === 'string' && v.trim()) return [v.trim()];
    return [];
  };
  const c = raw.consent;
  return {
    form: s('form') === 'demo' ? 'demo' : 'contact',
    name: s('name'),
    email: s('email'),
    company: s('company'),
    role: s('role'),
    size: s('size'),
    interests: list('interests'),
    topic: s('topic'),
    message: s('message'),
    consent: c === true || c === 'on' || c === 'true' || c === 'yes' || c === '1',
  };
}

/**
 * Validate a submission. Returns an object of human-readable messages keyed by
 * field; an empty object means the submission is valid.
 */
export function validate(sub: Submission): FieldErrors {
  const e: FieldErrors = {};
  if (!sub.name) e.name = 'Please enter your name.';
  else if (sub.name.length > LIMITS.name) e.name = `Please keep your name under ${LIMITS.name} characters.`;

  if (!sub.email) e.email = sub.form === 'demo' ? 'Please enter your work email.' : 'Please enter your email address.';
  else if (sub.email.length > LIMITS.email || !EMAIL_RE.test(sub.email)) e.email = 'Please enter a valid email address, for example name@company.com.';

  if (sub.company.length > LIMITS.company) e.company = `Please keep the company name under ${LIMITS.company} characters.`;

  if (sub.form === 'demo') {
    if (!sub.company) e.company = 'Please enter your company.';
    if (!sub.role) e.role = 'Please choose the role closest to yours.';
    else if (!inEnum(ROLE_OPTIONS, sub.role)) e.role = 'Please choose a role from the list.';
    if (!sub.size) e.size = 'Please choose a company size.';
    else if (!inEnum(SIZE_OPTIONS, sub.size)) e.size = 'Please choose a company size from the list.';
    if (sub.interests.length > INTEREST_OPTIONS.length || sub.interests.some((i) => !inEnum(INTEREST_OPTIONS, i))) e.interests = 'Please choose areas of interest from the list.';
    if (sub.message.length > LIMITS.message) e.message = `Please keep your message under ${LIMITS.message} characters.`;
  } else {
    if (!sub.topic) e.topic = 'Please choose a topic.';
    else if (!inEnum(TOPIC_OPTIONS, sub.topic)) e.topic = 'Please choose a topic from the list.';
    if (!sub.message) e.message = 'Please write a short message.';
    else if (sub.message.length < LIMITS.messageMin) e.message = `Please add a little more detail (at least ${LIMITS.messageMin} characters).`;
    else if (sub.message.length > LIMITS.message) e.message = `Please keep your message under ${LIMITS.message} characters.`;
  }

  if (!sub.consent) e.consent = 'Please confirm we may use these details to reply to you.';
  return e;
}
