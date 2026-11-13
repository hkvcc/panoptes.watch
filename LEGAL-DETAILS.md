# Legal details used on panoptes.watch

Reference for every value in the privacy notice (`/privacy/`), website terms of use (`/terms/`) and cookie notice (`/cookies/`).

All values live in **`src/data/legal.ts`**. Change a value there, run `npm run build`, and all three pages update. Keep this file in step with it.

Last updated on the pages: **4 November 2026**

## 1. Company identity (still needed)

These are facts about the business, and only the business can supply them. They have **not** been filled in: a made-up company number or address would make the legal notices false and could match a real, unrelated company. Until they are set, the pages name the operator simply as "Panoptes", and the review notice at the top of each page lists them as outstanding.

| Field | Value | Used on | Where to find it |
|---|---|---|---|
| Legal entity name | Panoptes Watch LLC | Privacy, Terms, Cookies | Certificate of incorporation, e.g. "Panoptes Ltd" |
| Country of incorporation | The Cayman Islands (a British Overseas Territory) | Privacy, Terms | e.g. "England and Wales" |
| Company registration number | CR-458220 | Privacy, Terms | Companies House record (8 characters for UK companies) |
| Registered office address | Suite 5304, 3rd Floor, 18 Forum Lane, Camana Bay, Grand Cayman, KY1-1106, Cayman Islands | Privacy, Terms | Companies House record |

To fill them in, edit `entityName`, `country`, `companyNumber` and `registeredOffice` in `src/data/legal.ts`. The operator sentence becomes, for example: "operated by **Panoptes Ltd**, a company registered in England and Wales under company number 12345678, with its registered office at …".

UK companies are legally required to show their registered name, company number and registered office on their website, so the site shouldn't go live as a company without these.

## 2. Values now in place

| Field | Value | Used on | Basis |
|---|---|---|---|
| Last updated | 4 November 2026 | All three | Date these values were set. |
| Privacy contact | sales@panoptes.watch, with "Privacy" in the subject line | Privacy | The only confirmed mailbox. Consider creating `privacy@panoptes.watch` and changing `privacyEmail`. |
| Governing law | The Cayman Islands (a British Overseas Territory)  | Terms | Assumes a UK-based business (the site is written in British English). Change it if the company is incorporated elsewhere. |
| Courts with jurisdiction | The courts of The Cayman Islands (a British Overseas Territory)  | Terms | Follows the governing law. Consumers keep any mandatory right to sue where they live; the terms already say so. |
| Email delivery provider | Resend (Resend, Inc.) | Privacy | The form function (`functions/api/contact.ts`) sends through the Resend API. |
| Mailbox provider | "the provider that hosts our business email" | Privacy | The site can't tell which provider hosts your inbox, so the wording is generic but accurate. You can name it, e.g. Google Workspace or Microsoft 365. |
| Webhook recipient | Not mentioned | Privacy | No webhook is configured. If you set `CONTACT_WEBHOOK_URL`, add the receiving system to the "Who we share it with" section. |
| Purpose of the consent checkbox | Only to let us respond to the enquiry; no mailing lists or marketing; any future newsletter would be a separate opt-in | Privacy | Matches the checkbox wording in both forms. |
| Enquiry retention period | 24 months after last contact | Privacy | A common, defensible period for sales enquiries. Shorten it if your internal policy differs. |
| International transfer safeguards | UK adequacy regulations / EU adequacy decisions (including the EU–US Data Privacy Framework and UK Extension where the recipient is certified); otherwise EU Standard Contractual Clauses with the UK International Data Transfer Addendum | Privacy | The standard mechanisms for Cloudflare and Resend, both US-based. Check each provider's current certification and data processing addendum. |
| EU representative | Not appointed; Article 27 exemption for occasional, small-scale processing | Privacy | Reasonable for a B2B marketing site that receives occasional EU enquiries. Revisit if you actively market to or process significant EU data. |
| Cloudflare security cookies | Wording says whether they appear depends on the protection Cloudflare applies to each request | Cookies | True whichever Cloudflare features (Bot Fight Mode, challenges, WAF) are switched on, so the notice doesn't need changing when settings change. |

## 3. Still to do before relying on these pages

- **Legal review.** Each page still shows a "Draft — pending legal review" notice, because the text hasn't been reviewed by counsel. To remove it once reviewed, delete the `draft` attribute in `src/pages/privacy.astro`, `terms.astro` and `cookies.astro`.
- **Data processing agreements.** Accept Cloudflare's and Resend's data processing addenda (both offer them in their account settings) so the transfer and processor statements are backed by contracts.
- **ICO registration.** UK organisations that process personal data usually need to pay the ICO data protection fee. Confirm your status.
- **Keep the notice true.** If you add analytics, a newsletter, a webhook or any third-party script, update `src/data/legal.ts` and the relevant page sections first.
