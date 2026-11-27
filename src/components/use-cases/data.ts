/** Shared metadata for the use-case page group (overview filters, cross-links). */
import { PLATFORM, SOLUTIONS, USE_CASES } from '../../data/site';

export type Domain = 'revenue' | 'operations' | 'customers' | 'finance';
export const DOMAINS: { id: Domain; label: string }[] = [
  { id: 'revenue', label: 'Revenue' },
  { id: 'operations', label: 'Operations' },
  { id: 'customers', label: 'Customers' },
  { id: 'finance', label: 'Finance' },
];

export type CaseMeta = {
  slug: string;
  label: string;
  icon: string;
  question: string;
  summary: string;
  domains: Domain[];
  roles: string[]; // solution slugs
  caps: string[]; // platform slugs
  scenario: string; // fictional company type
};

export const CASES: CaseMeta[] = [
  {
    slug: 'revenue-leakage', label: 'Revenue leakage', icon: 'revenue',
    question: 'Where does earned revenue go missing between intent and cash?',
    summary: 'Payment attempts rise but collected revenue does not. Find the step, route or segment where money stops arriving.',
    domains: ['revenue', 'finance'], roles: ['finance', 'revenue', 'executives'],
    caps: ['journey-intelligence', 'anomaly-detection', 'root-cause-analysis', 'actions-automation'],
    scenario: 'A subscription software company',
  },
  {
    slug: 'operational-bottlenecks', label: 'Operational bottlenecks', icon: 'clock',
    question: 'Where is work waiting, and why has it started waiting there?',
    summary: 'End-to-end time grows but no team looks slow. Locate the stage where arrivals outpace completions.',
    domains: ['operations', 'customers'], roles: ['operations', 'executives', 'customer-experience'],
    caps: ['process-intelligence', 'business-graph', 'command-center', 'actions-automation'],
    scenario: 'A business lending platform',
  },
  {
    slug: 'customer-journey-friction', label: 'Customer journey friction', icon: 'journey',
    question: 'At which step do customers stall, and for whom?',
    summary: 'Conversion slips by a few points overall. Find the single step and segment where it actually broke.',
    domains: ['customers', 'revenue'], roles: ['customer-experience', 'revenue', 'executives'],
    caps: ['journey-intelligence', 'anomaly-detection', 'root-cause-analysis', 'business-graph'],
    scenario: 'A direct-to-consumer insurance provider',
  },
  {
    slug: 'business-anomalies', label: 'Business anomalies', icon: 'anomaly',
    question: 'Is this change real, expected, or noise — and does it matter?',
    summary: 'Metrics move every day. Separate meaningful deviation from seasonality and known events, then route what matters.',
    domains: ['operations', 'finance', 'customers'], roles: ['executives', 'operations', 'finance'],
    caps: ['anomaly-detection', 'business-health', 'root-cause-analysis', 'command-center'],
    scenario: 'An online homeware retailer',
  },
  {
    slug: 'sla-monitoring', label: 'SLA monitoring', icon: 'target',
    question: 'Which commitments are about to break, before they do?',
    summary: 'Monthly attainment looks green while customers feel repeated misses. Watch time-to-breach on open work instead.',
    domains: ['operations', 'customers'], roles: ['operations', 'customer-experience', 'executives'],
    caps: ['business-health', 'process-intelligence', 'command-center', 'actions-automation'],
    scenario: 'A regional logistics operator',
  },
  {
    slug: 'operational-efficiency', label: 'Operational efficiency', icon: 'spark',
    question: 'Why does each unit of work cost more than it used to?',
    summary: 'Cost per order rises while volume is flat. Break unit cost into process steps and find the rework.',
    domains: ['operations', 'finance'], roles: ['operations', 'finance', 'executives'],
    caps: ['process-intelligence', 'business-graph', 'business-health', 'actions-automation'],
    scenario: 'A wholesale food distributor',
  },
  {
    slug: 'order-exceptions', label: 'Order exceptions', icon: 'clock',
    question: 'Which orders stopped moving between systems, and why?',
    summary: 'Shipped orders with no invoice. Rank exceptions by stage, age and value, then trace the spike to a change.',
    domains: ['operations', 'finance'], roles: ['operations', 'finance', 'revenue'],
    caps: ['journey-intelligence', 'anomaly-detection', 'root-cause-analysis', 'actions-automation'],
    scenario: 'A business selling through a portal and a sales team',
  },
];

const bySlug = (list: { href: string }[], base: string, slug: string) => list.find((l) => l.href === `${base}${slug}/`);
export const cap = (slug: string) => bySlug(PLATFORM, '/platform/', slug)!;
export const role = (slug: string) => bySlug(SOLUTIONS, '/solutions/', slug)!;
export const useCase = (slug: string) => bySlug(USE_CASES, '/use-cases/', slug)!;
export const caseMeta = (slug: string) => CASES.find((c) => c.slug === slug)!;
