# Legal details used on panoptes.watch

Reference for every value in the legal hub (`/legal/`), privacy notice (`/privacy/`), website terms of use (`/terms/`) and cookie notice (`/cookies/`).

All values live in **`src/data/legal.ts`**. Change a value there, run `npm run build`, and all four pages update. Keep this file in step with it. This file describes what the code **actually publishes**; if the two ever disagree, the code is what visitors see.

Last updated on the pages: **13 November 2026** (`lastUpdated: '2026-11-13'`)

None of these pages has been reviewed by legal counsel. While `reviewed` is `false` in `legal.ts`, every page shows a "Draft — pending legal review" notice and the `/legal/` hub lists the documents as drafts.

## 1. Company identity (not set — still needed)

These are facts about the business, and only the business can supply them. In `src/data/legal.ts` all four are **`null`**, so the pages name the operator simply as "Panoptes" and the draft notice at the top of each page lists them as outstanding. A made-up or unverified company name, number or address would make the notices false and could match a real, unrelated company.

| Field | Published value | `legal.ts` key | Where to find it |
|---|---|---|---|
| Legal entity name | Not set | `entityName` | Certificate of incorporation |
| Country of incorporation | Not set | `country` | Certificate of incorporation |
| Company registration number | Not set | `companyNumber` | Official company registry record |
| Registered office address | Not set | `registeredOffice` | Official company registry record |

Once set, the operator sentence reads: "operated by **[entity name]**, a company registered in [country] under company number [number], with its registered office at [address]". Many jurisdictions (including the UK) require a company to show its registered name, number and registered office on its website, so the site shouldn't go live as a company without these.

### Unconfirmed values found in an earlier draft of this file — confirm before use

An earlier version of this file listed the values below in the identity table, while its own text said the identity details "have not been filled in" and `legal.ts` had them as `null`. They are **not** used anywhere on the site and have **not** been verified. They are kept here only so nothing is lost. Do not copy them into `legal.ts` until the business has confirmed each one against official documents (for example a certificate of incorporation or a registry extract).

| Field | Unconfirmed value from the earlier draft |
|---|---|
| Legal entity name | Panoptes Watch LLC |
| Country of incorporation | The Cayman Islands (a British Overseas Territory) |
| Company registration number | CR-458220 |
| Registered office address | Suite 5304, 3rd Floor, 18 Forum Lane, Camana Bay, Grand Cayman, KY1-1106, Cayman Islands |
| Governing law (§3 of the earlier draft) | The Cayman Islands |
| Courts with jurisdiction (earlier draft) | The courts of the Cayman Islands |

If these are confirmed, the governing law, courts, the UK/EU GDPR framing of the privacy notice, the ICO references and the international-transfer wording all need legal review together; they were written on the assumption of a UK-based business.

## 2. Review status

| Field | Value | `legal.ts` key | Effect |
|---|---|---|---|
| Reviewed by counsel | No | `reviewed: false` | Draft notice on every legal page; hub says "Draft — pending legal review". Set to `true` only after review. |

## 3. Values now in place (as published)

| Field | Published value | Used on | Basis |
|---|---|---|---|
| Last updated | 13 November 2026 | All four | Date of the latest revision (structure, cross-links, accuracy fixes). |
| Privacy contact | sales@panoptes.watch, with "Privacy" in the subject line (the mailto links prefill it) | Privacy, Hub | The only confirmed mailbox. Consider creating `privacy@panoptes.watch` and changing `privacyEmail`. |
| Governing law | England and Wales — **provisional** | Terms | Assumes a UK-based business (the site is written in British English and the privacy notice uses UK GDPR). Must be confirmed once the company identity is known; see §1. |
| Courts with jurisdiction | The courts of England and Wales — **provisional** | Terms | Follows the governing law. Consumers keep any mandatory right to sue where they live; the terms already say so. |
| Email delivery provider | Resend (Resend, Inc.) | Privacy | `functions/api/contact.ts` sends through the Resend API when `RESEND_API_KEY` is set. |
| Mailbox provider | "the provider that hosts our business email" | Privacy | The site can't tell which provider hosts the inbox, so the wording is generic but accurate. You can name it. |
| Webhook recipient | Not mentioned | Privacy | The function supports `CONTACT_WEBHOOK_URL`, which forwards the full submission. It is not known to be configured. If you set it, add the receiving system to "Who we share it with" first. |
| Bot-detection widget | "The forms do not currently load … Cloudflare Turnstile" | Privacy | No widget is in the page code and the CSP would block it. The function's server-side check only runs if `TURNSTILE_SECRET_KEY` is set (which must not be done before the widget is added — see `deployment/forms.md`). Adding Turnstile needs a privacy and cookie notice update and a CSP change. |
| What the forwarded email contains | Form fields, consent tick, time, sending site address, Cloudflare country; not IP or user agent | Privacy | Matches `composeEmail()` in the function. |
| Purpose of the consent checkbox | Only to let us respond to the enquiry; no mailing lists or marketing; any future newsletter would be a separate opt-in | Privacy | Matches the checkbox wording in both forms. |
| Enquiry retention period | 24 months after last contact | Privacy | A policy choice, not a legal requirement. Confirm it matches what the business actually does with its inbox. |
| International transfer safeguards | UK adequacy regulations / EU adequacy decisions (including the EU–US Data Privacy Framework and UK Extension where the recipient is certified); otherwise EU SCCs with the UK Addendum | Privacy | The standard mechanisms for Cloudflare and Resend, both US-based. Check each provider's current certification and data processing addendum. |
| EU representative | Not appointed; Article 27 exemption for occasional, small-scale processing | Privacy | Reasonable for a B2B marketing site that receives occasional EU enquiries. Needs legal confirmation. |
| Cloudflare security cookies | Wording says whether they appear depends on the protection Cloudflare applies to each request | Cookies | True whichever Cloudflare features (Bot Fight Mode, challenges, WAF) are switched on. |
| Share links, copy link, site search | Ordinary links; clipboard only; search runs in the browser against a same-origin file | Privacy, Cookies | Matches the planned blog implementation (no third-party scripts, plain outbound links, same-origin `/blog/search-index.json`). Re-check if that changes. |

## 4. Consent banner: why there isn't one

The site sets no cookies of its own. The only browser storage it writes is the local storage key `panoptes-theme` (`light`/`dark`), and only when the visitor uses the theme switch (`src/scripts/site.ts`). Under PECR / the ePrivacy Directive, storage that is strictly necessary to provide something the user has explicitly asked for is exempt from consent; remembering a chosen theme falls in that category. Cloudflare's security cookies, where set, are strictly necessary for security. There are no analytics, advertising or other third-party scripts, and the CSP (`public/_headers`) only allows scripts, fonts, images and network requests from the site's own origin. A consent banner is therefore not required. This needs re-assessing the moment any analytics, embed, widget or non-essential cookie is added.

## 5. Documents deliberately not published

- **Customer terms, data processing agreement, product subprocessor list, SLA, acceptable use policy.** No verified product contract exists to publish. The hub says customer agreements, including data processing terms, are agreed in writing with each customer and are not published, and gives the contact address.
- **Accessibility statement.** Not published, because the site has not been audited against WCAG and no honest conformance level can be stated. Recommended once an audit has been done (a statement can also be published before then if it says plainly that the site has not yet been assessed and how to report a problem).
- **Version history / archived versions.** Not kept on the site; the hub says so.

## 6. Still to do before relying on these pages

- **Confirm company identity** (§1), then confirm governing law and courts.
- **Legal review.** Then set `reviewed: true` in `src/data/legal.ts`.
- **Data processing agreements.** Accept Cloudflare's and Resend's data processing addenda so the statement that providers "are bound by contractual obligations" is backed by contracts.
- **Data protection registration.** UK organisations that process personal data usually need to pay the ICO data protection fee. Confirm the position for the actual jurisdiction.
- **Keep the notices true.** If you add analytics, a newsletter, a webhook, Turnstile or any third-party script, update `src/data/legal.ts`, the relevant page sections and the CSP first.
