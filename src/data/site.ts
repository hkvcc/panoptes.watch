export const SITE = {
  name: 'Panoptes',
  origin: 'https://panoptes.watch',
  tagline: 'Observability for your entire business.',
  description:
    'Panoptes is the Business Observability platform: a connected, continuously updated view of how your business actually operates — revenue, customers, workflows and outcomes.',
  salesEmail: 'sales@panoptes.watch',
  defaultOg: '/social/og-default.png',
};

export type NavLink = { label: string; href: string; desc?: string; icon?: string };
export type NavGroup = { label: string; href: string; intro: string; columns: { title?: string; href?: string; links: NavLink[] }[]; feature?: { title: string; text: string; href: string; cta: string; eyebrow?: string; label?: string } };

export const PLATFORM: NavLink[] = [
  { label: 'Business Graph', href: '/platform/business-graph/', desc: 'Entities, relationships and dependencies', icon: 'graph' },
  { label: 'Command Center', href: '/platform/command-center/', desc: 'One cockpit for business operations', icon: 'command' },
  { label: 'Business Health', href: '/platform/business-health/', desc: 'Objectives, indicators and expectations', icon: 'health' },
  { label: 'Process Intelligence', href: '/platform/process-intelligence/', desc: 'Stages, throughput and bottlenecks', icon: 'process' },
  { label: 'Journey Intelligence', href: '/platform/journey-intelligence/', desc: 'End-to-end journeys across systems', icon: 'journey' },
  { label: 'Anomaly Detection', href: '/platform/anomaly-detection/', desc: 'Meaningful change, surfaced early', icon: 'anomaly' },
  { label: 'Root Cause Analysis', href: '/platform/root-cause-analysis/', desc: 'From symptom to contributing change', icon: 'rootcause' },
  { label: 'AI Intelligence', href: '/platform/ai-intelligence/', desc: 'Assisted investigation and explanation', icon: 'ai' },
  { label: 'Actions & Automation', href: '/platform/actions-automation/', desc: 'Ownership, routing and follow-through', icon: 'actions' },
];

export const SOLUTIONS: NavLink[] = [
  { label: 'Executives', href: '/solutions/executives/', desc: 'One honest picture of the whole business', icon: 'compass' },
  { label: 'Operations', href: '/solutions/operations/', desc: 'Flow, capacity and service commitments', icon: 'process' },
  { label: 'Finance', href: '/solutions/finance/', desc: 'Money movement, leakage and cost drivers', icon: 'finance' },
  { label: 'Revenue', href: '/solutions/revenue/', desc: 'Pipeline-to-cash conversion and risk', icon: 'revenue' },
  { label: 'Customer Experience', href: '/solutions/customer-experience/', desc: 'Journeys, friction and promises kept', icon: 'customers' },
];

/** Solutions by industry (/solutions/industries/…). Page content lives in src/components/industries/data.ts. */
export const INDUSTRIES: NavLink[] = [
  { label: 'Financial Services & Fintech', href: '/solutions/industries/financial-services/', desc: 'Payments, onboarding and reconciliation', icon: 'finance' },
  { label: 'SaaS & Subscription', href: '/solutions/industries/saas/', desc: 'Trial to activation to renewal', icon: 'layers' },
  { label: 'E-commerce & Retail', href: '/solutions/industries/ecommerce-retail/', desc: 'Checkout, fulfilment and returns', icon: 'cart' },
  { label: 'Marketplaces', href: '/solutions/industries/marketplaces/', desc: 'Both sides of supply and demand', icon: 'users' },
  { label: 'Logistics & Supply Chain', href: '/solutions/industries/logistics-supply-chain/', desc: 'Orders, shipments and promised dates', icon: 'delivery' },
  { label: 'Insurance', href: '/solutions/industries/insurance/', desc: 'Quotes, policies and claims', icon: 'shield' },
];

export const USE_CASES: NavLink[] = [
  { label: 'Revenue Leakage', href: '/use-cases/revenue-leakage/', desc: 'Find where earned revenue goes missing', icon: 'revenue' },
  { label: 'Operational Bottlenecks', href: '/use-cases/operational-bottlenecks/', desc: 'See where work waits, and why', icon: 'clock' },
  { label: 'Customer Journey Friction', href: '/use-cases/customer-journey-friction/', desc: 'Locate the step where customers stall', icon: 'journey' },
  { label: 'Business Anomalies', href: '/use-cases/business-anomalies/', desc: 'Separate real change from noise', icon: 'anomaly' },
  { label: 'SLA Monitoring', href: '/use-cases/sla-monitoring/', desc: 'Watch commitments before they break', icon: 'target' },
  { label: 'Operational Efficiency', href: '/use-cases/operational-efficiency/', desc: 'Cost, effort and rework, in context', icon: 'spark' },
];

export const INTEGRATIONS: NavLink[] = [
  { label: 'Integrations Overview', href: '/integrations/', desc: 'Ecosystem directory and architecture', icon: 'plug' },
  { label: 'Data Sources', href: '/integrations/data-sources/', desc: 'Systems of record, events and warehouses', icon: 'database' },
  { label: 'API & Events', href: '/integrations/api/', desc: 'Send business events and query the model', icon: 'api' },
  { label: 'Security & Governance', href: '/integrations/security-governance/', desc: 'Access, ownership and auditability', icon: 'shield' },
];

export const RESOURCES: NavLink[] = [
  { label: 'What Is Business Observability?', href: '/resources/what-is-business-observability/', icon: 'book' },
  { label: 'Business Observability vs BI', href: '/resources/business-observability-vs-bi/', icon: 'chart' },
  { label: 'vs System Observability', href: '/resources/business-observability-vs-system-observability/', icon: 'layers' },
  { label: 'From Dashboards to Decisions', href: '/resources/from-dashboards-to-decisions/', icon: 'target' },
  { label: 'Why Dashboards Miss the Full Picture', href: '/resources/why-dashboards-miss-the-full-picture/', icon: 'eye' },
  { label: 'Business Process Monitoring', href: '/resources/business-process-monitoring/', icon: 'process' },
  { label: 'Understanding Bottlenecks', href: '/resources/understanding-business-bottlenecks/', icon: 'clock' },
  { label: 'Business Health Metrics', href: '/resources/business-health-metrics/', icon: 'health' },
  { label: 'Building a Business Operating Model', href: '/resources/building-a-business-operating-model/', icon: 'graph' },
  { label: 'How Business Events Connect to Outcomes', href: '/resources/how-business-events-connect-to-outcomes/', icon: 'event' },
  { label: 'Glossary', href: '/resources/business-observability-glossary/', icon: 'list' },
];

/** Knowledge center: short "What is…" explainers (/resources/knowledge/…). */
export const KNOWLEDGE: NavLink[] = [
  { label: 'What is process mining?', href: '/resources/knowledge/what-is-process-mining/', desc: 'Event logs, discovered processes and limits', icon: 'process' },
  { label: 'What is customer journey analytics?', href: '/resources/knowledge/what-is-customer-journey-analytics/', desc: 'Journeys across channels and systems', icon: 'journey' },
  { label: 'What is operational intelligence?', href: '/resources/knowledge/what-is-operational-intelligence/', desc: 'Analysis of operations as they run', icon: 'signal' },
  { label: 'What is decision intelligence?', href: '/resources/knowledge/what-is-decision-intelligence/', desc: 'Engineering how decisions are made', icon: 'target' },
  { label: 'What is order to cash?', href: '/resources/knowledge/what-is-order-to-cash/', desc: 'The O2C process, stages and measures', icon: 'revenue' },
  { label: 'What is a semantic layer?', href: '/resources/knowledge/what-is-a-semantic-layer/', desc: 'One definition for every metric', icon: 'database' },
];

export const BLOG: NavLink = { label: 'Blog', href: '/blog/', desc: 'Articles and analysis on business observability', icon: 'book' };

/** Menus and footer show at most this many links per list; the hub pages list everything, so lists can grow freely. */
const NAV_MAX = 6;

// Guides shown in the Resources mega-menu (looked up by href so appended guides do not shift it).
const NAV_GUIDES = ['what-is-business-observability', 'business-observability-vs-bi', 'business-observability-vs-system-observability', 'business-process-monitoring', 'business-health-metrics', 'business-observability-glossary']
  .map((slug) => RESOURCES.find((r) => r.href === `/resources/${slug}/`))
  .filter((r): r is NavLink => !!r);

export const NAV: NavGroup[] = [
  {
    label: 'Platform', href: '/platform/', intro: 'The capabilities that make a business observable.',
    columns: [{ title: 'Capabilities', links: PLATFORM }],
    feature: { title: 'How Panoptes works', text: 'Connect → Model → Observe → Understand → Act. A walkthrough of the full loop.', href: '/how-it-works/', cta: 'See how it works' },
  },
  {
    label: 'Solutions', href: '/solutions/', intro: 'Business observability for the people who run the business.',
    columns: [{ title: 'By role', links: SOLUTIONS.slice(0, NAV_MAX) }, { title: 'By industry', href: '/solutions/industries/', links: INDUSTRIES.slice(0, NAV_MAX) }],
    feature: { title: 'What is Business Observability?', text: 'The category, explained in one page: what it is, what it is not, and why it matters now.', href: '/business-observability/', cta: 'Read the overview' },
  },
  {
    label: 'Use Cases', href: '/use-cases/', intro: 'Concrete problems, told as investigations.',
    columns: [{ title: 'Use cases', links: USE_CASES.slice(0, NAV_MAX) }],
  },
  {
    label: 'Integrations', href: '/integrations/', intro: 'Bring fragmented systems into one model.',
    columns: [{ title: 'Connect', links: INTEGRATIONS }],
  },
  {
    label: 'Resources', href: '/resources/', intro: 'Guides, articles and analysis on business observability.',
    columns: [
      { title: 'Guides', href: '/resources/', links: NAV_GUIDES },
      { title: 'Knowledge center', href: '/resources/knowledge/', links: KNOWLEDGE.slice(0, NAV_MAX) },
    ],
    feature: { eyebrow: 'Blog', label: BLOG.label, title: 'Articles and analysis', text: 'Writing on business observability: how operations, revenue and customer outcomes connect.', href: BLOG.href, cta: 'Read the blog' },
  },
  {
    label: 'Company', href: '/company/', intro: 'Why Panoptes exists.',
    columns: [{ links: [
      { label: 'About Panoptes', href: '/company/', desc: 'Mission and the idea behind the name', icon: 'eye' },
      { label: 'Vision', href: '/company/vision/', desc: 'Toward a Business Operating System', icon: 'compass' },
      { label: 'Team', href: '/company/team/', desc: 'The people building Panoptes', icon: 'users' },
      { label: 'Trust', href: '/trust/', desc: 'Security, governance and legal in one place', icon: 'shield' },
      { label: 'Contact', href: '/contact/', desc: 'Talk to the team', icon: 'mail' },
    ] }],
  },
];

type FooterLink = { label: string; href: string };
const pick = (links: NavLink[]): FooterLink[] => links.map(({ label, href }) => ({ label, href }));

export const FOOTER: { title: string; links: FooterLink[] }[] = [
  { title: 'Platform', links: [{ label: 'Platform overview', href: '/platform/' }, { label: 'How it works', href: '/how-it-works/' }, ...pick(PLATFORM)] },
  { title: 'Solutions', links: [{ label: 'All solutions', href: '/solutions/' }, ...pick(SOLUTIONS.slice(0, NAV_MAX))] },
  { title: 'Industries', links: [{ label: 'All industries', href: '/solutions/industries/' }, ...pick(INDUSTRIES.slice(0, NAV_MAX))] },
  { title: 'Use cases', links: [{ label: 'All use cases', href: '/use-cases/' }, ...pick(USE_CASES.slice(0, NAV_MAX))] },
  { title: 'Integrations', links: [{ label: 'Overview', href: '/integrations/' }, ...pick(INTEGRATIONS.slice(1))] },
  { title: 'Resources', links: [{ label: 'Blog', href: BLOG.href }, { label: 'Business observability', href: '/business-observability/' }, { label: 'Guides', href: '/resources/' }, { label: 'Knowledge center', href: '/resources/knowledge/' }, { label: 'Glossary', href: '/resources/business-observability-glossary/' }] },
  { title: 'Company', links: [{ label: 'About', href: '/company/' }, { label: 'Vision', href: '/company/vision/' }, { label: 'Team', href: '/company/team/' }, { label: 'Trust', href: '/trust/' }, { label: 'Contact', href: '/contact/' }, { label: 'Book a demo', href: '/demo/' }] },
];

/** Footer bottom bar: legal links (not repeated in the columns above). Security lives under Company → Trust. */
export const FOOTER_LEGAL: FooterLink[] = [
  { label: 'Privacy notice', href: '/privacy/' },
  { label: 'Terms of use', href: '/terms/' },
  { label: 'Cookie notice', href: '/cookies/' },
  { label: 'Acceptable use', href: '/legal/acceptable-use/' },
  { label: 'Subprocessors', href: '/legal/subprocessors/' },
  { label: 'Legal', href: '/legal/' },
];
