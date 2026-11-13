/**
 * Integration directory data.
 *
 * Third-party product names here are ILLUSTRATIVE EXAMPLES of the ecosystem
 * Panoptes is designed to connect to. They are not claims of an available,
 * certified, native or partner integration. Every entry carries the status
 * "Evaluated per deployment". No third-party logos are used — tiles show a
 * monogram and our own category icon.
 */

export type CategoryId =
  | 'crm' | 'payments' | 'finance-erp' | 'data-warehouses' | 'databases'
  | 'customer-support' | 'product-analytics' | 'workflow-automation' | 'event-streams';

export interface Category {
  id: CategoryId;
  label: string;
  /** File name (without .svg) in /public/icons/integrations/ */
  icon: string;
  /** One line on what this category contributes to the business model. */
  contributes: string;
  entities: string[];
  events: string[];
  answers: string;
}

export interface DirectoryEntry {
  name: string;
  category: CategoryId;
  /** 'example' = an example third-party system; 'pattern' = a generic integration pattern. */
  kind: 'example' | 'pattern';
  /** What is typically read from this kind of system. */
  detail: string;
  /** Extra search terms. */
  keywords?: string;
}

export const STATUS_LABEL = 'Evaluated per deployment';

export const CATEGORIES: Category[] = [
  {
    id: 'crm', label: 'CRM', icon: 'crm',
    contributes: 'Accounts, contacts, opportunities and the stages a deal moves through.',
    entities: ['Account', 'Contact', 'Opportunity', 'Owner team'],
    events: ['Stage changed', 'Deal won / lost', 'Renewal date set'],
    answers: 'Where is pipeline stalling, and which accounts are exposed to a delivery problem?',
  },
  {
    id: 'payments', label: 'Payments', icon: 'payments',
    contributes: 'Payment attempts, outcomes, refunds, disputes and payouts by method and route.',
    entities: ['Payment', 'Payment method', 'Refund', 'Dispute', 'Payout'],
    events: ['Payment attempted', 'Payment failed / succeeded', 'Refund issued', 'Dispute opened'],
    answers: 'Is intent turning into cash, and which payment route changed when it stopped?',
  },
  {
    id: 'finance-erp', label: 'Finance & ERP', icon: 'finance-erp',
    contributes: 'Invoices, credit notes, ledger postings, purchase orders and cost centres.',
    entities: ['Invoice', 'Ledger entry', 'Purchase order', 'Cost centre', 'Supplier'],
    events: ['Invoice issued', 'Invoice overdue', 'Payment reconciled', 'Period closed'],
    answers: 'What is billed but not collected, and how do operational changes reach margin?',
  },
  {
    id: 'data-warehouses', label: 'Data Warehouses', icon: 'data-warehouses',
    contributes: 'Curated, joined history from many systems — ideal for baselines and backfill.',
    entities: ['Modelled tables', 'Daily snapshots', 'Dimension tables'],
    events: ['Scheduled extracts', 'Change data from incremental models'],
    answers: 'What does “normal” look like over the last two years, before live signals arrive?',
  },
  {
    id: 'databases', label: 'Databases', icon: 'databases',
    contributes: 'Operational records from your own applications: orders, cases, accounts and their states.',
    entities: ['Order', 'Application', 'Case', 'Shipment', 'Account'],
    events: ['Row inserted / updated', 'Status column changed', 'Change data capture'],
    answers: 'Which internal workflow stage is accumulating work right now?',
  },
  {
    id: 'customer-support', label: 'Customer Support', icon: 'customer-support',
    contributes: 'Tickets, conversations, queues, priorities and service commitments.',
    entities: ['Ticket', 'Conversation', 'Queue', 'Service commitment'],
    events: ['Ticket opened', 'Escalated', 'First response', 'Resolved / reopened'],
    answers: 'Which customers feel an operational problem, and are commitments about to be missed?',
  },
  {
    id: 'product-analytics', label: 'Product Analytics', icon: 'product-analytics',
    contributes: 'Behavioural events that show how customers move through product journeys.',
    entities: ['Journey', 'Journey step', 'Cohort', 'Feature'],
    events: ['Step reached', 'Journey abandoned', 'Feature adopted', 'Release shipped'],
    answers: 'At which step do customers stall, and what changed just before they did?',
  },
  {
    id: 'workflow-automation', label: 'Workflow Automation', icon: 'workflow-automation',
    contributes: 'Signals from the automations that already glue tools together — and a route for actions back out.',
    entities: ['Automation', 'Run', 'Hand-off'],
    events: ['Run started / failed', 'Step completed', 'Record handed off'],
    answers: 'Is a silent automation failure the reason work stopped moving between teams?',
  },
  {
    id: 'event-streams', label: 'APIs & Event Streams', icon: 'event-streams',
    contributes: 'Business events published by your own services, in near real time.',
    entities: ['Any modelled entity', 'Custom business objects'],
    events: ['Order placed', 'Verification completed', 'Shipment dispatched', 'Any domain event'],
    answers: 'What is happening in workflows that no off-the-shelf system records?',
  },
];

export const ENTRIES: DirectoryEntry[] = [
  // CRM
  { name: 'Salesforce', category: 'crm', kind: 'example', detail: 'Accounts, opportunities, stage history and owners.', keywords: 'sales cloud pipeline' },
  { name: 'HubSpot', category: 'crm', kind: 'example', detail: 'Companies, deals, lifecycle stages and pipelines.', keywords: 'marketing deals' },
  { name: 'Microsoft Dynamics 365', category: 'crm', kind: 'example', detail: 'Accounts, opportunities and sales stages.', keywords: 'dynamics crm' },
  { name: 'Pipedrive', category: 'crm', kind: 'example', detail: 'Deals, stages and activities by pipeline.', keywords: 'deals pipeline' },
  // Payments
  { name: 'Stripe', category: 'payments', kind: 'example', detail: 'Payment intents, charges, refunds, disputes and payouts.', keywords: 'cards subscriptions billing' },
  { name: 'Adyen', category: 'payments', kind: 'example', detail: 'Authorisations, captures, refunds and chargebacks by method.', keywords: 'acquiring cards' },
  { name: 'Braintree', category: 'payments', kind: 'example', detail: 'Transactions, settlement status and disputes.', keywords: 'cards paypal' },
  { name: 'Checkout.com', category: 'payments', kind: 'example', detail: 'Payments, refunds and disputes by processing route.', keywords: 'acquiring cards' },
  { name: 'GoCardless', category: 'payments', kind: 'example', detail: 'Mandates, bank debits, failures and retries.', keywords: 'direct debit bank' },
  // Finance & ERP
  { name: 'NetSuite', category: 'finance-erp', kind: 'example', detail: 'Invoices, payments, journals and subsidiaries.', keywords: 'oracle erp ledger' },
  { name: 'SAP', category: 'finance-erp', kind: 'example', detail: 'Financial documents, orders and cost centres.', keywords: 's/4hana erp ledger' },
  { name: 'Xero', category: 'finance-erp', kind: 'example', detail: 'Invoices, bills, payments and bank reconciliation.', keywords: 'accounting ledger' },
  { name: 'QuickBooks', category: 'finance-erp', kind: 'example', detail: 'Invoices, payments, expenses and accounts.', keywords: 'accounting intuit' },
  { name: 'Sage Intacct', category: 'finance-erp', kind: 'example', detail: 'AR, AP, general ledger and dimensions.', keywords: 'accounting ledger' },
  // Data warehouses
  { name: 'Snowflake', category: 'data-warehouses', kind: 'example', detail: 'Modelled tables and history for baselines and backfill.', keywords: 'warehouse sql' },
  { name: 'Google BigQuery', category: 'data-warehouses', kind: 'example', detail: 'Curated datasets and scheduled extracts.', keywords: 'bigquery gcp warehouse sql' },
  { name: 'Amazon Redshift', category: 'data-warehouses', kind: 'example', detail: 'Joined history and incremental models.', keywords: 'redshift aws warehouse sql' },
  { name: 'Databricks', category: 'data-warehouses', kind: 'example', detail: 'Lakehouse tables and curated views.', keywords: 'lakehouse delta spark' },
  // Databases
  { name: 'PostgreSQL', category: 'databases', kind: 'example', detail: 'Application tables via read replica or change data capture.', keywords: 'postgres sql cdc' },
  { name: 'MySQL', category: 'databases', kind: 'example', detail: 'Operational records via read replica or binlog capture.', keywords: 'mariadb sql cdc' },
  { name: 'Microsoft SQL Server', category: 'databases', kind: 'example', detail: 'Line-of-business tables and status columns.', keywords: 'sql server mssql' },
  { name: 'MongoDB', category: 'databases', kind: 'example', detail: 'Document collections and change streams.', keywords: 'nosql document' },
  // Customer support
  { name: 'Zendesk', category: 'customer-support', kind: 'example', detail: 'Tickets, groups, priorities and SLA policies.', keywords: 'helpdesk tickets' },
  { name: 'Intercom', category: 'customer-support', kind: 'example', detail: 'Conversations, teams and response times.', keywords: 'chat messaging' },
  { name: 'Freshdesk', category: 'customer-support', kind: 'example', detail: 'Tickets, statuses and service levels.', keywords: 'helpdesk tickets' },
  { name: 'Help Scout', category: 'customer-support', kind: 'example', detail: 'Conversations, mailboxes and tags.', keywords: 'helpdesk email' },
  // Product analytics
  { name: 'Amplitude', category: 'product-analytics', kind: 'example', detail: 'Behavioural events and funnel steps.', keywords: 'funnels events' },
  { name: 'Mixpanel', category: 'product-analytics', kind: 'example', detail: 'Events, funnels and cohorts.', keywords: 'funnels events' },
  { name: 'Segment', category: 'product-analytics', kind: 'example', detail: 'Tracked events routed from one collection point.', keywords: 'cdp twilio events' },
  { name: 'PostHog', category: 'product-analytics', kind: 'example', detail: 'Product events, funnels and feature flags.', keywords: 'funnels flags events' },
  // Workflow automation
  { name: 'Zapier', category: 'workflow-automation', kind: 'example', detail: 'Forward app events as business events; receive actions.', keywords: 'no-code zaps' },
  { name: 'Make', category: 'workflow-automation', kind: 'example', detail: 'Scenario runs and hand-offs between tools.', keywords: 'no-code scenarios integromat' },
  { name: 'n8n', category: 'workflow-automation', kind: 'example', detail: 'Self-hosted workflow runs and webhooks.', keywords: 'self-hosted workflows' },
  // APIs & event streams
  { name: 'Apache Kafka', category: 'event-streams', kind: 'example', detail: 'Domain events consumed from topics.', keywords: 'kafka confluent streaming topics' },
  { name: 'Amazon Kinesis', category: 'event-streams', kind: 'example', detail: 'Business events from data streams.', keywords: 'kinesis aws streaming' },
  { name: 'Google Cloud Pub/Sub', category: 'event-streams', kind: 'example', detail: 'Events consumed from subscriptions.', keywords: 'pubsub gcp streaming' },
  { name: 'Inbound webhooks', category: 'event-streams', kind: 'pattern', detail: 'Any system that can POST an event when something happens.', keywords: 'webhook http push' },
  { name: 'REST events API', category: 'event-streams', kind: 'pattern', detail: 'Send business events and query the model directly (preview design).', keywords: 'api rest http json' },
  { name: 'Scheduled file drops', category: 'event-streams', kind: 'pattern', detail: 'CSV or Parquet extracts on a schedule, e.g. over SFTP.', keywords: 'csv sftp batch files parquet' },
];

/** Two-letter monogram for a tile, e.g. "Google BigQuery" → "GB", "n8n" → "N8". */
export function monogram(name: string): string {
  const words = name.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase();
}
