// Single source for the details used in the privacy, terms and cookie notices.
// Each value and the reasoning behind it is recorded in LEGAL-DETAILS.md — keep the two in step.

export const LEGAL = {
  // Company identity: facts only the business can supply. Leave null until confirmed;
  // the pages then name the operator as "Panoptes" without registration details.
  entityName: null as string | null,          // e.g. "Panoptes Ltd"
  country: null as string | null,             // e.g. "England and Wales"
  companyNumber: null as string | null,       // Companies House number
  registeredOffice: null as string | null,    // full postal address

  // Policy and operational choices.
  lastUpdated: '2026-11-04',
  privacyEmail: 'sales@panoptes.watch',
  governingLaw: 'England and Wales',
  courts: 'the courts of England and Wales',
  emailProvider: 'Resend (Resend, Inc.)',
  mailboxProvider: 'the provider that hosts our business email',
  enquiryRetention: '24 months',
};

export const lastUpdatedLabel = new Date(LEGAL.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** "Panoptes Ltd, a company registered in … (“Panoptes”, “we”, “us”)" — or the plain trading name until identity details exist. */
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
