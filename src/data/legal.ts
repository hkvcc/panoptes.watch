// Single source for the details used in the legal hub (/legal/) and the privacy, terms and cookie notices.
// Each value and the reasoning behind it is recorded in LEGAL-DETAILS.md — keep the two in step.

export const LEGAL = {
  // Company identity: facts only the business can supply. Leave null until confirmed;
  // the pages then name the operator as "Panoptes" without registration details.
  // Do NOT fill these from the "unconfirmed values" in LEGAL-DETAILS.md without documentary proof.
  entityName: null as string | null,          // e.g. "Example Ltd" (from the certificate of incorporation)
  country: null as string | null,             // jurisdiction of incorporation
  companyNumber: null as string | null,       // official registry number
  registeredOffice: null as string | null,    // full postal address of the registered office

  // Review status. While false, every legal page shows a "Draft — pending legal review" notice
  // and the /legal/ hub lists the documents as drafts. Set to true only after counsel has reviewed them.
  reviewed: false,

  // Policy and operational choices.
  lastUpdated: '2026-11-13',
  privacyEmail: 'sales@panoptes.watch',
  governingLaw: 'England and Wales',           // provisional — see LEGAL-DETAILS.md §3
  courts: 'the courts of England and Wales',  // provisional — follows governingLaw
  emailProvider: 'Resend (Resend, Inc.)',
  mailboxProvider: 'the provider that hosts our business email',
  enquiryRetention: '24 months',
};

export const lastUpdatedLabel = new Date(LEGAL.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** The website's legal documents, as indexed on /legal/ and cross-linked from each document. */
export const LEGAL_DOCS = [
  {
    title: 'Privacy notice',
    href: '/privacy/',
    icon: 'shield',
    scope: 'How this website handles personal data: form submissions and emails, request data processed by our hosting provider, who processes it for us, how long we keep it and your rights.',
  },
  {
    title: 'Website terms of use',
    href: '/terms/',
    icon: 'book',
    scope: 'The rules for using panoptes.watch and its content, including illustrative data, product vision, brand assets and liability. They do not cover use of the Panoptes product.',
  },
  {
    title: 'Cookie notice',
    href: '/cookies/',
    icon: 'layers',
    scope: 'The cookies and browser storage this website uses: no cookies of its own, one local storage key for your theme choice, and security cookies our hosting provider may set.',
  },
] as const;

/** "Example Ltd, a company registered in … (“Panoptes”, “we”, “us”)" — or the plain trading name until identity details exist. */
export function operatorHtml(define = true): string {
  const { entityName, country, companyNumber, registeredOffice } = LEGAL;
  const suffix = define ? ' (“Panoptes”, “we”, “us”)' : '';
  if (!entityName) return `<strong>Panoptes</strong>${suffix}`;
  const parts = [`<strong>${entityName}</strong>`];
  if (country && companyNumber) parts.push(`, a company registered in ${country} under company number ${companyNumber}`);
  if (registeredOffice) parts.push(`, with its registered office at ${registeredOffice}`);
  return `${parts.join('')}${suffix}`;
}

/** Identity fields still missing — shown in the pages' review notice so nothing goes live silently incomplete. */
export const missingIdentity = (
  [['Legal entity name', LEGAL.entityName], ['Country of incorporation', LEGAL.country], ['Company registration number', LEGAL.companyNumber], ['Registered office address', LEGAL.registeredOffice]] as const
).filter(([, v]) => !v).map(([k]) => k);
