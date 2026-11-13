// Single source for the details used in the legal hub (/legal/) and every legal document.
// Each value and the reasoning behind it is recorded in LEGAL-DETAILS.md — keep the two in step.

export const LEGAL = {
  // Company identity (from the company's registration records).
  entityName: 'Panoptes Watch LLC',
  entityType: 'a limited liability company',
  country: 'the Cayman Islands',
  companyNumber: 'CR-458220',
  registeredOffice: 'Suite 5304, 3rd Floor, 18 Forum Lane, Camana Bay, Grand Cayman, KY1-1106, Cayman Islands',

  // Policy and operational choices.
  lastUpdated: '2026-11-13',
  privacyEmail: 'sales@panoptes.watch',
  legalEmail: 'sales@panoptes.watch',
  governingLaw: 'the Cayman Islands',
  courts: 'the courts of the Cayman Islands',
  emailProvider: 'Resend (Resend, Inc.)',
  mailboxProvider: 'the provider that hosts our business email',
  enquiryRetention: '24 months',
};

export const lastUpdatedLabel = new Date(LEGAL.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export type LegalDoc = { title: string; href: string; icon: string; group: 'Privacy' | 'Website terms and policies'; scope: string };

/** The website's legal documents, as indexed on /legal/ and cross-linked from each document. */
export const LEGAL_DOCS: readonly LegalDoc[] = [
  {
    title: 'Privacy notice',
    href: '/privacy/',
    icon: 'shield',
    group: 'Privacy',
    scope: 'What personal data this website handles — form submissions, emails and the request data our host processes — why, who processes it for us, how long we keep it and the rights you have.',
  },
  {
    title: 'Cookie notice',
    href: '/cookies/',
    icon: 'layers',
    group: 'Privacy',
    scope: 'The cookies and browser storage this website uses: no cookies of its own, one local storage key for your theme choice, and security cookies our hosting provider may set.',
  },
  {
    title: 'Website service providers',
    href: '/legal/subprocessors/',
    icon: 'plug',
    group: 'Privacy',
    scope: 'The third parties that process personal data for this website, what each one does, where it is based and which data it handles.',
  },
  {
    title: 'Website terms of use',
    href: '/terms/',
    icon: 'book',
    group: 'Website terms and policies',
    scope: 'The rules for using panoptes.watch and its content, including illustrative data, product vision, brand assets, liability and governing law. They do not cover use of the Panoptes product.',
  },
  {
    title: 'Acceptable use policy',
    href: '/legal/acceptable-use/',
    icon: 'lock',
    group: 'Website terms and policies',
    scope: 'What you may not do when using this website or any Panoptes service, how we respond to misuse and how to report it.',
  },
];

/** "Panoptes Watch LLC, a limited liability company registered in the Cayman Islands … (“Panoptes”, “we”, “us”)". */
export function operatorHtml(define = true): string {
  const { entityName, entityType, country, companyNumber, registeredOffice } = LEGAL;
  const suffix = define ? ' (“Panoptes”, “we”, “us” or “our”)' : '';
  return `<strong>${entityName}</strong>, ${entityType} registered in ${country} under registration number ${companyNumber}, with its registered office at ${registeredOffice}${suffix}`;
}
