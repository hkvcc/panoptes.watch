# Legal details used on panoptes.watch

Reference for every value used in the legal pages:

| Page | Path | Source file |
|---|---|---|
| Legal hub (company information and document index) | `/legal/` | `src/pages/legal/index.astro` |
| Privacy notice | `/privacy/` | `src/pages/privacy.astro` |
| Cookie notice | `/cookies/` | `src/pages/cookies.astro` |
| Website service providers | `/legal/subprocessors/` | `src/pages/legal/subprocessors.astro` |
| Website terms of use | `/terms/` | `src/pages/terms.astro` |
| Acceptable use policy | `/legal/acceptable-use/` | `src/pages/legal/acceptable-use.astro` |

Shared values live in **`src/data/legal.ts`** (`LEGAL`), and the document list used by the hub and the "Related legal documents" links lives in `LEGAL_DOCS` in the same file. Change a value there, run `npm run build`, and every page updates. Keep this file in step with it. This file describes what the code **actually publishes**; if the two ever disagree, the code is what visitors see.

All pages use the shared layout `src/components/company/DocPage.astro` (breadcrumbs, "On this page" contents, last-updated date, related-documents links).

Last updated on the pages: **13 November 2026** (`lastUpdated: '2026-11-13'`).

## 1. Company identity

| Field | Published value | `legal.ts` key |
|---|---|---|
| Legal entity name | Panoptes Watch LLC | `entityName` |
| Legal form | A limited liability company | `entityType` |
| Country of registration | The Cayman Islands | `country` |
| Registration number | CR-458220 | `companyNumber` |
| Registered office | Suite 5304, 3rd Floor, 18 Forum Lane, Camana Bay, Grand Cayman, KY1-1106, Cayman Islands | `registeredOffice` |

`operatorHtml()` in `legal.ts` turns these into the sentence used at the start of each document: "**Panoptes Watch LLC**, a limited liability company registered in the Cayman Islands under registration number CR-458220, with its registered office at … ("Panoptes", "we", "us" or "our")". The hub also shows them as a company information block, and the privacy notice, cookie notice, terms and hub give the registered office as the postal contact address.

## 2. Values in place

| Field | Published value | Used on | Basis |
|---|---|---|---|
| Last updated | 13 November 2026 | All | Date of the latest revision. |
| Privacy contact | sales@panoptes.watch, with "Privacy" in the subject line (the mailto links prefill it) | Privacy, Cookies, Service providers, Hub | The only confirmed mailbox (`privacyEmail`). Consider creating `privacy@panoptes.watch` and changing the key. |
| Legal contact | sales@panoptes.watch (`legalEmail`) | Terms, Acceptable use | Same mailbox; change the key if a dedicated address is created. |
| Governing law | The Cayman Islands | Terms | Follows the company's place of registration. |
| Courts | The courts of the Cayman Islands (exclusive), without removing a consumer's mandatory local protections or right to sue locally | Terms | Follows the governing law. |
| Liability cap | USD 100 total, in connection with the free website | Terms | Policy choice for a free website; does not apply to liability that cannot legally be limited, or to consumers' mandatory rights. |
| Primary privacy framework | Cayman Islands Data Protection Act (2021 Revision); complaints to the Office of the Ombudsman | Privacy | The controller is established in the Cayman Islands. |
| Additional frameworks | UK GDPR, EU GDPR and Swiss FADP where they apply (legal-bases table, rights, complaints to ICO / national authority / FDPIC); US state laws phrased conditionally ("where such a law applies") | Privacy | Visitors and enquirers may be in these places. The US section only states what is true for every visitor: no selling, no sharing for targeted advertising, no sensitive data collected. |
| UK / EU representative | Not appointed; relies on the exemption for occasional, small-scale processing without sensitive data | Privacy | Appropriate while the only processing of UK/EU personal data is occasional website enquiries. Re-assess if Panoptes starts marketing to, or contracting with, UK/EU customers at scale. |
| Email delivery provider | Resend (Resend, Inc.) | Privacy, Service providers | `functions/api/contact.ts` sends through the Resend API when `RESEND_API_KEY` is set. |
| Hosting provider | Cloudflare, Inc. (Pages, Pages Functions, security) | Privacy, Cookies, Service providers | The site is deployed on Cloudflare Pages (`deployment/cloudflare-pages.md`). |
| Mailbox provider | "the provider that hosts our business email" | Privacy, Service providers | The site cannot tell which provider hosts the inbox, so the wording is generic but accurate. You can name it (`mailboxProvider`) and add it to the service providers table. |
| Webhook recipient | Not mentioned | Privacy, Service providers | The function supports `CONTACT_WEBHOOK_URL`, which forwards the full submission. It is not known to be configured. If you set it, add the receiving system to the privacy notice's sharing section and the service providers table first. |
| Bot-detection widget | "The forms do not currently load … Cloudflare Turnstile" | Privacy | No widget is in the page code and the CSP would block it. The function's server-side check only runs if `TURNSTILE_SECRET_KEY` is set (which must not be done before the widget is added — see `deployment/forms.md`). Adding Turnstile needs a privacy and cookie notice update and a CSP change. |
| What the forwarded email contains | Form fields, consent tick, time, sending site address, Cloudflare country; not IP or user agent | Privacy, Service providers | Matches `composeEmail()` in the function. |
| Purpose of the consent checkbox | Only to let us respond to the enquiry; no mailing lists or marketing; any future newsletter would be a separate opt-in | Privacy | Matches the checkbox wording in `ContactForm.astro` and `DemoForm.astro`. |
| Enquiry retention period | 24 months after last contact | Privacy | A policy choice. Make sure the business actually deletes old enquiries from its inbox on that basis. |
| Provider terms | "under the terms they offer their business customers, which limit how they may use it" | Privacy, Service providers | Deliberately does not claim individually signed contracts. If you accept Cloudflare's and Resend's data processing addenda, the wording remains true. |
| International transfer safeguards | Adequacy (including the EU–US Data Privacy Framework, UK Extension and Swiss–US framework where the recipient is certified); standard contractual clauses in the provider's data processing terms, with the UK Addendum; for transfers out of the Cayman Islands, the other conditions the Data Protection Act allows | Privacy, Service providers | Cloudflare and Resend are US-based. Check each provider's current certification and data processing terms from time to time. |
| Cloudflare security cookies | Whether they appear depends on the protection Cloudflare applies to each request | Cookies | True whichever Cloudflare features (Bot Fight Mode, challenges, WAF) are switched on. |
| Share links, copy link, blog search | Ordinary links; clipboard only; search runs in the browser against same-origin `/blog/search-index.json` | Privacy, Cookies, Service providers | Matches `ShareLinks.astro` and `BlogBrowser.astro`. Re-check if that changes. |
| Product subprocessors | Not listed; provided to customers under their agreement | Service providers, Hub | No product subprocessor list is published on the website. |

## 3. Consent banner: why there isn't one

The site sets no cookies of its own. The only browser storage it writes is the local storage key `panoptes-theme` (`light`/`dark`), and only when the visitor uses the theme switch (`src/scripts/site.ts`). The Cayman Islands Data Protection Act has no cookie-specific rule, so the cookie notice applies the strictest standard likely to apply to visitors — the UK PECR and the EU ePrivacy Directive — to everyone. Under those rules, storage that is strictly necessary to provide something the user has explicitly asked for is exempt from consent; remembering a chosen theme falls in that category. Cloudflare's security cookies, where set, are strictly necessary for security. There are no analytics, advertising or other third-party scripts, and the CSP (`public/_headers`) only allows scripts, fonts, images and network requests from the site's own origin. A consent banner is therefore not required. Re-assess this the moment any analytics, embed, widget or non-essential cookie is added.

## 4. Documents deliberately not published

- **Customer terms, data processing agreement, product subprocessor list, SLA.** These are provided to customers under their agreement. The hub says so and gives the contact address.
- **Accessibility statement.** Not published, because the site has not been audited against WCAG and no honest conformance level can be stated. A statement can be published before an audit if it says plainly that the site has not yet been assessed and how to report a problem.
- **Archived versions.** Not kept on the site; the hub says earlier versions are available on request.

## 5. Keep the notices true

The legal pages describe how the website actually works. Before you change any of the following, update `src/data/legal.ts`, the affected page sections and, where relevant, the CSP in `public/_headers`:

- **Adding a third-party script, analytics, embed, chat widget or font host** — privacy notice ("What we do not collect", sharing, US section), cookie notice (summary table, "What we do not use", consent-banner reasoning in §3 above), service providers table, CSP.
- **Turning on `CONTACT_WEBHOOK_URL`** — add the receiving system to the privacy notice's sharing section and the service providers table.
- **Adding Cloudflare Turnstile** — update the privacy notice's Turnstile paragraph, the cookie notice and the CSP, then set `TURNSTILE_SECRET_KEY`.
- **Changing email provider or naming the mailbox provider** — `emailProvider` / `mailboxProvider` and the service providers table.
- **Starting a newsletter or marketing emails** — needs a separate opt-in and updates to the privacy notice's purposes and consent wording.
- **Adding new browser storage** (localStorage, sessionStorage, cookies) — cookie notice storage table.
- **Changing the company's details, registered office or contact address** — the identity keys in `legal.ts` and §1 above.

Whenever a document changes, update `lastUpdated` in `legal.ts` and the date at the top of this file.
