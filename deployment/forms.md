# Website forms: `/api/contact`

The **Book a Demo** (`/demo/`) and **Contact** (`/contact/`) forms post to one Cloudflare Pages Function, `functions/api/contact.ts`. The rest of the site is static.

## How it works

```
Browser ──POST /api/contact──▶ Pages Function ──▶ Resend email API   (RESEND_API_KEY)
                                              └─▶ generic JSON webhook (CONTACT_WEBHOOK_URL)
```

| Piece | File |
|---|---|
| Shared field rules (enums, lengths, email check). Used by **both** browser and function, so they cannot drift | `src/components/forms/schema.ts` |
| Form markup | `src/components/forms/DemoForm.astro`, `ContactForm.astro`, `FormShell.astro` |
| Progressive-enhancement script | `src/components/forms/form-client.ts` |
| Server function | `functions/api/contact.ts` (types declared locally, so no extra dependencies) |

**With JavaScript** (the normal case), the script validates inline. It sets `aria-invalid`, shows each error text (already linked through `aria-describedby`) and focuses the first invalid field. It then posts JSON with `Accept: application/json`, shows a pending state and reports the result in the form's `role="status"` region. Success is shown **only** when the function returns `{ "ok": true }`. Any other outcome shows an error that tells the person to email **sales@panoptes.watch**. That includes 503, 404 (Functions not deployed), network failure and non-JSON replies.

**Without JavaScript**, the form posts normally (`method="post" action="/api/contact"`, form-encoded). Native `required`, `maxlength` and `type="email"` give basic validation. The function replies with a **303 redirect**:

| Outcome | Redirect |
|---|---|
| Delivered | `/demo/?sent=1` or `/contact/?sent=1` |
| Failed | `/demo/?error=<code>` or `/contact/?error=<code>` |

Codes: `invalid`, `spam`, `origin`, `too-large`, `unsupported`, `verification`, `unavailable`, `delivery`. When the page loads with these parameters, the form script shows the matching message and removes the query string. (A visitor with JavaScript fully disabled is redirected correctly but sees no inline message, because that message needs the script.)

The function accepts `application/json`, `application/x-www-form-urlencoded` and `multipart/form-data`. It ignores file parts. `GET` and other methods get `405` (`onRequest`). `OPTIONS` gets `204`.

### JSON responses

| Status | Body | When |
|---|---|---|
| 200 | `{ "ok": true }` | At least one configured destination returned 2xx |
| 400 | `{ "ok": false, "error": "invalid", "fields": { … } }` | Validation failed; `fields` has per-field messages |
| 400 | `error: "spam"` | Honeypot filled, or submitted too fast / without a timestamp |
| 400 | `error: "verification"` | Turnstile enabled and token missing or invalid |
| 403 | `error: "origin"` | Origin/Referer not allowed |
| 413 | `error: "too-large"` | Body larger than 16 KB |
| 415 | `error: "unsupported"` | Other content types |
| 502 | `error: "delivery"` | Every configured destination failed |
| 503 | `error: "unavailable"` | **No destination configured** |

## Environment variables

Set these under **Cloudflare dashboard → Workers & Pages → your project → Settings → Variables and Secrets**. Set them for **Production** and, if previews should send mail, for **Preview** too. Use the **Secret** type for keys. Redeploy after changing variables, because they apply to new deployments.

| Variable | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | One of these two | Resend API key (secret). Sends a plain-text email for each submission |
| `CONTACT_WEBHOOK_URL` | One of these two | A URL that receives a JSON POST: `{ type, submittedAt, subject, text, submission }` |
| `CONTACT_TO` | No | Recipient(s), comma-separated. Default `sales@panoptes.watch` |
| `CONTACT_FROM` | No | Sender. Default `Panoptes Website <website@panoptes.watch>`. The domain must be verified in Resend |
| `CONTACT_WEBHOOK_SECRET` | No | Adds `x-panoptes-signature: sha256=<hex HMAC-SHA256 of body>` to webhook calls |
| `TURNSTILE_SECRET_KEY` | No | Turns on server-side Cloudflare Turnstile verification (see below) |
| `ALLOWED_ORIGINS` | No | Comma-separated exact origins that **replace** the built-in allow-list |

If **neither** `RESEND_API_KEY` nor `CONTACT_WEBHOOK_URL` is set, every submission returns **503**. Visitors are then told to email sales@panoptes.watch, so the form never pretends to work.

If both destinations are set, both are attempted. The request succeeds if at least one returns 2xx. Failures are logged with `console.error`; view them under **Deployments → (deployment) → Functions → Real-time logs**.

The email sets `reply_to` to the visitor's address, so you can answer straight from the inbox.

`.dev.vars.example` at the repo root lists the variables for local use.

## Resend setup

1. Create an account at resend.com, then go to **Domains → Add domain** → `panoptes.watch`, or a subdomain such as `mail.panoptes.watch`.
2. Add the DNS records Resend shows (SPF/MX and DKIM, plus DMARC if you don't have one yet) in Cloudflare DNS, then wait for **Verified**.
3. Create an API key with **Sending access** only, restricted to that domain. Store it as the `RESEND_API_KEY` secret.
4. Make sure `CONTACT_FROM` uses the verified domain, e.g. `Panoptes Website <website@panoptes.watch>`. Resend rejects unverified senders, and the function then returns 502.

## Deploying: Functions need Git integration or Wrangler

- **Git integration** (recommended): Cloudflare detects `functions/` at the project root and deploys `/api/contact` with every build.
- **Wrangler CLI**: run this from the **project root** so `functions/` is picked up:
  ```bash
  npm run build
  npx wrangler@latest pages deploy dist --project-name panoptes-watch
  npx wrangler@latest pages secret put RESEND_API_KEY --project-name panoptes-watch
  ```
- **Dashboard drag-and-drop / ZIP upload does NOT deploy Functions.** Only the static files go live, so `/api/contact` returns 404/405 and the forms show their "email sales@panoptes.watch directly" error state.

Wrangler is not a project dependency; `npx wrangler@latest` downloads it on demand.

The function imports `../../src/components/forms/schema.ts`. Wrangler's bundler (esbuild) includes it automatically. Keep that file free of DOM, Node or Astro imports.

## Local testing

```bash
cp .dev.vars.example .dev.vars        # edit; .dev.vars is git-ignored
npm run build
npx wrangler@latest pages dev dist    # serves dist/ + functions/ on http://localhost:8788
```

`localhost` and `127.0.0.1` origins are allowed by default. To test the 503 path, leave both destinations unset. To test without sending real email, point `CONTACT_WEBHOOK_URL` at a request-inspection service and leave `RESEND_API_KEY` unset.

Quick checks:

```bash
# 405
curl -i http://localhost:8788/api/contact
# 403 (no Origin)
curl -i -X POST -H 'content-type: application/json' -d '{}' http://localhost:8788/api/contact
# 400 with field errors
curl -i -X POST -H 'origin: http://localhost:8788' -H 'content-type: application/json' \
  -d "{\"form\":\"contact\",\"_ts\":\"$(($(date +%s)*1000-10000))\"}" http://localhost:8788/api/contact
```

Type-check the function with `npx tsc --noEmit -p functions`.

## Abuse protections

| Protection | Behaviour |
|---|---|
| **Origin check** | `Origin` (or `Referer` as a fallback) must be `https://panoptes.watch`, `https://www.panoptes.watch`, any `https://*.pages.dev` preview, or `http://localhost` / `http://127.0.0.1` on any port. Requests with neither header are rejected (403). Set `ALLOWED_ORIGINS` to tighten this, e.g. to remove `*.pages.dev` or name your exact project preview domain. This stops casual cross-site posting, not a determined script, because headers can be forged outside browsers. |
| **Payload limit** | Requests over 16 KB are rejected (413), checked against both `Content-Length` and the actual body. Field limits: name 120, email 254, company 160, message 10–5000 characters. |
| **Honeypot** | A visually hidden `website` field that people never fill. If it contains anything, the request is **rejected with a generic 400** (`spam`), not a fake success. This is deliberate: if a real person's browser autofills it, they see a message telling them to email sales@panoptes.watch, rather than being told their message was sent. Nothing is delivered. |
| **Minimum time to submit** | The script stamps `_ts` (page-load time, in ms) into a hidden field. Submissions under **3 seconds** after load are rejected as `spam`. JSON posts (only ever sent by the script) **must** include `_ts`. Form-encoded posts without JavaScript have no stamp and are allowed, relying on the other checks. |
| **Strict validation** | Required fields, lengths, email format and enum values (role, company size, interests, topic) are validated on the server with the same rules as the client. Unknown values are rejected. |
| **Turnstile (optional)** | See below. |
| **Rate limiting** | Not done in the function, which has no storage. Add a Cloudflare **WAF rate-limiting rule** on `/api/contact`, e.g. 5 requests per minute per IP. |

### Enabling Cloudflare Turnstile

The server side is ready. When `TURNSTILE_SECRET_KEY` is set, every submission must include a valid `cf-turnstile-response` token, which is verified against `https://challenges.cloudflare.com/turnstile/v0/siteverify`. **Do not set the secret until the widget is on the page**, or every submission fails with `verification`.

1. Create a Turnstile widget in the Cloudflare dashboard for `panoptes.watch`. Note the site key and the secret key.
2. Add the widget inside `FormShell.astro`, before the status region:
   ```html
   <div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>
   <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
   ```
   The widget adds a `cf-turnstile-response` field. `form-client.ts` collects every form field, so the token is sent automatically. After a failed submission, call `turnstile.reset()` so a new token is issued.
3. **Change the Content-Security-Policy** in `public/_headers`. It currently allows only `'self'`:
   - `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com`
   - add `frame-src https://challenges.cloudflare.com`
   - `connect-src 'self' https://challenges.cloudflare.com`
4. Set `TURNSTILE_SECRET_KEY` as a secret and redeploy.

## Privacy

Submissions are not stored by the function. They are only forwarded to the configured destinations. The email includes the Cloudflare country header (`cf-ipcountry`) for context, but not the IP address or user agent. Both forms have a required consent checkbox linking to `/privacy/`. Keep the privacy notice in line with your chosen providers (Resend as a processor, plus any webhook destination).
