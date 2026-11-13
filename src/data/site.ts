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
export type NavGroup = { label: string; href: string; intro: string; columns: { title?: string; links: NavLink[] }[]; feature?: { title: string; text: string; href: string; cta: string; eyebrow?: string; label?: string } };

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

export const BLOG: NavLink = { label: 'Blog', href: '/blog/', desc: 'Articles and analysis on business observability', icon: 'book' };

export const NAV: NavGroup[] = [
  {
    label: 'Platform', href: '/platform/', intro: 'The capabilities that make a business observable.',
    columns: [{ title: 'Capabilities', links: PLATFORM }],
    feature: { title: 'How Panoptes works', text: 'Connect → Model → Observe → Understand → Act. A walkthrough of the full loop.', href: '/how-it-works/', cta: 'See how it works' },
  },
  {
    label: 'Solutions', href: '/solutions/', intro: 'Business observability for the people who run the business.',
    columns: [{ title: 'By role', links: SOLUTIONS }],
    feature: { title: 'What is Business Observability?', text: 'The category, explained in one page: what it is, what it is not, and why it matters now.', href: '/business-observability/', cta: 'Read the overview' },
  },
  {
    label: 'Use Cases', href: '/use-cases/', intro: 'Concrete problems, told as investigations.',
    columns: [{ title: 'Use cases', links: USE_CASES }],
  },
  {
    label: 'Integrations', href: '/integrations/', intro: 'Bring fragmented systems into one model.',
    columns: [{ title: 'Connect', links: INTEGRATIONS }],
  },
  {
    label: 'Resources', href: '/resources/', intro: 'Guides, articles and analysis on business observability.',
    columns: [{ title: 'Guides', links: RESOURCES.slice(0, 6) }, { title: 'Deep dives', links: RESOURCES.slice(6) }],
    feature: { eyebrow: 'Blog', label: BLOG.label, title: 'Articles and analysis', text: 'Writing on business observability: how operations, revenue and customer outcomes connect.', href: BLOG.href, cta: 'Read the blog' },
  },
  {
    label: 'Company', href: '/company/', intro: 'Why Panoptes exists.',
    columns: [{ links: [
      { label: 'About Panoptes', href: '/company/', desc: 'Mission and the idea behind the name', icon: 'eye' },
      { label: 'Vision', href: '/company/vision/', desc: 'Toward a Business Operating System', icon: 'compass' },
      { label: 'Contact', href: '/company/contact/', desc: 'Talk to the team', icon: 'mail' },
    ] }],
  },
];

type FooterLink = { label: string; href: string };
const pick = (links: NavLink[]): FooterLink[] => links.map(({ label, href }) => ({ label, href }));

export const FOOTER: { title: string; links: FooterLink[] }[] = [
  { title: 'Platform', links: [{ label: 'Platform overview', href: '/platform/' }, { label: 'How it works', href: '/how-it-works/' }, ...pick(PLATFORM)] },
  { title: 'Solutions', links: [{ label: 'All solutions', href: '/solutions/' }, ...pick(SOLUTIONS)] },
  { title: 'Use cases', links: [{ label: 'All use cases', href: '/use-cases/' }, ...pick(USE_CASES)] },
  { title: 'Integrations', links: [{ label: 'Overview', href: '/integrations/' }, ...pick(INTEGRATIONS.slice(1))] },
  { title: 'Resources', links: [{ label: 'Blog', href: BLOG.href }, { label: 'Business observability', href: '/business-observability/' }, { label: 'Resources hub', href: '/resources/' }, { label: 'Glossary', href: '/resources/business-observability-glossary/' }] },
  { title: 'Company', links: [{ label: 'About', href: '/company/' }, { label: 'Vision', href: '/company/vision/' }, { label: 'Contact', href: '/contact/' }, { label: 'Book a demo', href: '/demo/' }] },
];

/** Footer bottom bar: legal and trust links (not repeated in the columns above). */
export const FOOTER_LEGAL: FooterLink[] = [
  { label: 'Privacy notice', href: '/privacy/' },
  { label: 'Terms of use', href: '/terms/' },
  { label: 'Cookie notice', href: '/cookies/' },
  { label: 'Legal', href: '/legal/' },
  { label: 'Security', href: '/integrations/security-governance/' },
  { label: 'Sitemap', href: '/sitemap.xml' },
];
