/**
 * Progressive enhancement for forms marked with [data-form].
 *
 * Without JavaScript the form posts normally to /api/contact, which validates
 * and answers with a 303 redirect back to the page (?sent=1 or ?error=<code>).
 * With JavaScript we validate inline with the shared schema, post JSON and show
 * the outcome in the form's role="status" region without leaving the page.
 */
import { normalise, validate, HONEYPOT, TIMESTAMP, type FieldErrors } from './schema';

const EMAIL = 'sales@panoptes.watch';
const MAILTO = `<a href="mailto:${EMAIL}">${EMAIL}</a>`;

const QUERY_MESSAGES: Record<string, string> = {
  invalid: 'Some fields were missing or invalid, so your message was not sent. Please check the form and try again.',
  spam: `We could not accept that submission. Please email ${MAILTO} directly.`,
  origin: `We could not accept that submission. Please email ${MAILTO} directly.`,
  'too-large': `Your message was too long to send through the form. Please email ${MAILTO} directly.`,
  unsupported: `We could not read that submission. Please email ${MAILTO} directly.`,
  verification: `We could not verify that submission. Please try again, or email ${MAILTO}.`,
  unavailable: `The form is temporarily unavailable and your message was not sent. Please email ${MAILTO} directly.`,
  delivery: `We could not send your message just now. Please email ${MAILTO} directly.`,
};
const GENERIC_ERROR = `Something went wrong and your message was not sent. Please email ${MAILTO} directly.`;

function setStatus(el: HTMLElement, state: 'success' | 'error' | 'pending' | null, html = '') {
  if (state) el.dataset.state = state; else delete el.dataset.state;
  el.innerHTML = html;
}

function fieldControls(form: HTMLFormElement, name: string): HTMLElement[] {
  return [...form.querySelectorAll<HTMLElement>(`[name="${name}"]`)];
}

function clearError(form: HTMLFormElement, name: string) {
  const err = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
  if (err) err.textContent = '';
  fieldControls(form, name).forEach((c) => c.removeAttribute('aria-invalid'));
  form.querySelector(`[data-group="${name}"]`)?.removeAttribute('data-invalid');
}

function showErrors(form: HTMLFormElement, errors: FieldErrors): HTMLElement | null {
  let first: HTMLElement | null = null;
  // Walk fields in DOM order so focus goes to the first visible problem.
  const names = [...new Set([...form.querySelectorAll<HTMLElement>('[data-error-for]')].map((e) => e.dataset.errorFor!))];
  for (const name of names) {
    const msg = errors[name as keyof FieldErrors];
    if (!msg) { clearError(form, name); continue; }
    const err = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (err) err.textContent = msg;
    const controls = fieldControls(form, name);
    const group = form.querySelector<HTMLElement>(`[data-group="${name}"]`);
    if (group) group.dataset.invalid = 'true';
    else controls.forEach((c) => c.setAttribute('aria-invalid', 'true'));
    if (!first && controls[0]) first = controls[0];
  }
  return first;
}

function collect(form: HTMLFormElement): Record<string, unknown> {
  const fd = new FormData(form);
  const raw: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v !== 'string') continue;
    if (k === 'interests') raw.interests = [...((raw.interests as string[]) || []), v];
    else raw[k] = v;
  }
  raw.consent = fd.get('consent') === 'on';
  return raw;
}

function enhance(form: HTMLFormElement) {
  const status = form.querySelector<HTMLElement>('.form-status');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const ts = form.querySelector<HTMLInputElement>(`input[name="${TIMESTAMP}"]`);
  if (!status || !submit) return;
  if (ts) ts.value = String(Date.now());
  form.noValidate = true;
  const submitLabel = submit.innerHTML;

  // Clear a field's error as soon as the person edits it.
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name && t.name !== HONEYPOT) clearError(form, t.name);
  });
  form.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name) clearError(form, t.name);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.dataset.busy) return;
    const raw = collect(form);
    const errors = validate(normalise(raw));
    const first = showErrors(form, errors);
    const count = Object.keys(errors).length;
    if (count) {
      setStatus(status, 'error', `Please correct ${count === 1 ? 'the highlighted field' : `the ${count} highlighted fields`} and try again.`);
      first?.focus();
      return;
    }

    form.dataset.busy = 'true';
    form.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    submit.textContent = 'Sending…';
    setStatus(status, 'pending', 'Sending your message…');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(raw),
      });
      let data: { ok?: boolean; message?: string; error?: string; fields?: FieldErrors } = {};
      try { data = await res.json(); } catch { /* non-JSON (e.g. function not deployed) */ }

      if (res.ok && data.ok === true) {
        form.reset();
        if (ts) ts.value = String(Date.now());
        setStatus(status, 'success', form.dataset.success || 'Thank you — your message has been sent. We will reply by email.');
        status.focus();
        return;
      }
      if (data.fields && Object.keys(data.fields).length) {
        const f = showErrors(form, data.fields);
        setStatus(status, 'error', 'Please correct the highlighted fields and try again.');
        f?.focus();
        return;
      }
      const code = data.error && QUERY_MESSAGES[data.error] ? data.error : null;
      setStatus(status, 'error', code ? QUERY_MESSAGES[code] : GENERIC_ERROR);
      status.focus();
    } catch {
      setStatus(status, 'error', `We could not reach the server, so your message was not sent. Please check your connection, or email ${MAILTO} directly.`);
      status.focus();
    } finally {
      delete form.dataset.busy;
      form.removeAttribute('aria-busy');
      submit.disabled = false;
      submit.innerHTML = submitLabel;
    }
  });
}

/** Show the result of a no-JS post that redirected back with ?sent=1 / ?error=… */
function showQueryResult(form: HTMLFormElement) {
  const status = form.querySelector<HTMLElement>('.form-status');
  if (!status) return;
  const q = new URLSearchParams(location.search);
  if (q.get('sent') === '1') setStatus(status, 'success', form.dataset.success || 'Thank you — your message has been sent.');
  else if (q.has('error')) setStatus(status, 'error', QUERY_MESSAGES[q.get('error')!] || GENERIC_ERROR);
  else return;
  status.scrollIntoView({ block: 'center' });
  status.focus({ preventScroll: true });
  // Remove the query so a refresh does not repeat the message.
  history.replaceState(null, '', location.pathname + location.hash);
}

document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
  enhance(form);
  showQueryResult(form);
});
