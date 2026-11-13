// Illustrative sample data for the interactive Command Center demo.
// Entirely fictional — used to demonstrate the product concept, not real results.

export type Severity = 'crit' | 'warn' | 'ok';
export interface Range {
  id: '24h' | '7d' | '30d';
  label: string;
  health: number;
  healthDelta: string;
  revenue: { actual: number[]; expected: number[]; total: string; vsExpected: string };
  throughput: { value: string; delta: string; spark: number[] };
  journey: { value: string; delta: string; spark: number[] };
  signals: number;
  domains: { name: string; score: number; status: Severity }[];
  stages: { name: string; wait: number; target: number }[];
}

export const RANGES: Range[] = [
  {
    id: '24h', label: '24h', health: 82, healthDelta: '−4 vs prior day',
    revenue: {
      expected: [40, 42, 45, 50, 58, 66, 72, 76, 78, 77, 74, 70],
      actual: [41, 43, 45, 49, 55, 58, 61, 66, 71, 72, 70, 67],
      total: '$1.42M', vsExpected: '−5.8% vs expected',
    },
    throughput: { value: '3,912', delta: '+2.1%', spark: [30, 34, 33, 38, 40, 39, 44, 46] },
    journey: { value: '71.4%', delta: '−3.2 pts', spark: [76, 75, 76, 74, 73, 72, 71, 71] },
    signals: 7,
    domains: [
      { name: 'Revenue', score: 74, status: 'warn' }, { name: 'Customers', score: 81, status: 'ok' },
      { name: 'Operations', score: 79, status: 'warn' }, { name: 'Delivery', score: 93, status: 'ok' },
    ],
    stages: [
      { name: 'Application', wait: 0.4, target: 1 }, { name: 'Verification', wait: 6.8, target: 4 },
      { name: 'Approval', wait: 2.1, target: 3 }, { name: 'Activation', wait: 0.9, target: 2 },
    ],
  },
  {
    id: '7d', label: '7d', health: 85, healthDelta: '−1 vs prior week',
    revenue: {
      expected: [52, 55, 57, 58, 60, 63, 61, 64, 66, 68, 69, 70],
      actual: [53, 55, 58, 58, 61, 62, 60, 61, 62, 63, 64, 64],
      total: '$9.86M', vsExpected: '−3.1% vs expected',
    },
    throughput: { value: '27,480', delta: '+4.6%', spark: [31, 33, 36, 35, 38, 41, 42, 45] },
    journey: { value: '73.9%', delta: '−1.4 pts', spark: [75, 76, 75, 75, 74, 74, 74, 74] },
    signals: 12,
    domains: [
      { name: 'Revenue', score: 80, status: 'warn' }, { name: 'Customers', score: 84, status: 'ok' },
      { name: 'Operations', score: 82, status: 'ok' }, { name: 'Delivery', score: 91, status: 'ok' },
    ],
    stages: [
      { name: 'Application', wait: 0.5, target: 1 }, { name: 'Verification', wait: 5.2, target: 4 },
      { name: 'Approval', wait: 2.4, target: 3 }, { name: 'Activation', wait: 1.1, target: 2 },
    ],
  },
  {
    id: '30d', label: '30d', health: 88, healthDelta: '+2 vs prior month',
    revenue: {
      expected: [48, 50, 53, 55, 57, 59, 61, 63, 65, 66, 68, 70],
      actual: [49, 52, 54, 57, 58, 61, 63, 64, 65, 66, 67, 68],
      total: '$41.3M', vsExpected: '−0.9% vs expected',
    },
    throughput: { value: '118,204', delta: '+6.3%', spark: [28, 30, 33, 34, 37, 39, 41, 44] },
    journey: { value: '75.2%', delta: '+0.6 pts', spark: [74, 74, 75, 74, 75, 75, 76, 75] },
    signals: 19,
    domains: [
      { name: 'Revenue', score: 86, status: 'ok' }, { name: 'Customers', score: 87, status: 'ok' },
      { name: 'Operations', score: 84, status: 'ok' }, { name: 'Delivery', score: 94, status: 'ok' },
    ],
    stages: [
      { name: 'Application', wait: 0.5, target: 1 }, { name: 'Verification', wait: 4.3, target: 4 },
      { name: 'Approval', wait: 2.6, target: 3 }, { name: 'Activation', wait: 1.2, target: 2 },
    ],
  },
];

export interface Signal {
  id: string; title: string; scope: string; severity: Severity; metric: string; age: string;
  chain: string[]; timeline: { t: string; text: string; kind: 'change' | 'signal' | 'event' }[];
  finding: string; status: string; owner: string;
}

export const SIGNALS: Signal[] = [
  {
    id: 'pay', title: 'Card payment completion dropped', scope: 'Checkout · EU cards', severity: 'crit', metric: '−6.8 pts', age: '14m',
    chain: ['Customer', 'Order', 'Payment', 'Fulfilment', 'Revenue'],
    timeline: [
      { t: '09:12', text: 'Payment provider routing rule updated for EU cards', kind: 'change' },
      { t: '09:40', text: 'Authentication challenges rise from 18% to 31% of attempts', kind: 'signal' },
      { t: '10:05', text: 'Completion rate falls below expected band (−6.8 pts)', kind: 'signal' },
      { t: '10:18', text: 'Orders awaiting payment exceed 3× normal level', kind: 'event' },
    ],
    finding: 'The decline is concentrated in EU card payments that were routed through the updated rule. It began 28 minutes after the change. Correlated, not yet verified as cause.',
    status: 'Investigating', owner: 'Payments Ops',
  },
  {
    id: 'onb', title: 'Onboarding verification wait time up', scope: 'Business onboarding workflow', severity: 'warn', metric: '+41%', age: '2h',
    chain: ['Application', 'Verification', 'Approval', 'Activation', 'First revenue'],
    timeline: [
      { t: 'Mon', text: 'Verification queue staffing reduced for planned training', kind: 'change' },
      { t: 'Tue', text: 'Median verification wait rises from 4.1h to 5.8h', kind: 'signal' },
      { t: 'Wed', text: 'Applications awaiting documents increase 22%', kind: 'signal' },
      { t: 'Thu', text: 'Time-to-first-revenue for new accounts extends by 1.4 days', kind: 'event' },
    ],
    finding: 'Wait time growth sits in one stage — Verification — and is pushing out first revenue for newly onboarded accounts. Capacity and document-request rates both changed this week.',
    status: 'Owner assigned', owner: 'Onboarding Lead',
  },
  {
    id: 'ref', title: 'Refund requests above expected', scope: 'Product line · Pro annual', severity: 'warn', metric: '2.1×', age: '5h',
    chain: ['Release', 'Plan change', 'Invoice', 'Refund', 'Net revenue'],
    timeline: [
      { t: '08:00', text: 'Pricing page copy updated for annual plans', kind: 'change' },
      { t: '11:30', text: 'Plan downgrades within 48h of purchase increase', kind: 'signal' },
      { t: '13:10', text: 'Refund tickets mention "billing period" 3× more often', kind: 'signal' },
      { t: '14:00', text: 'Refunded value reaches 2.1× daily expectation', kind: 'event' },
    ],
    finding: 'Refunds cluster among customers who purchased after the pricing copy change, and support conversations reference billing-period confusion. A plausible link worth confirming with the pricing team.',
    status: 'Needs review', owner: 'Revenue Ops',
  },
  {
    id: 'sla', title: 'Fulfilment SLA at risk', scope: 'Warehouse North · next-day', severity: 'warn', metric: '92.4% / 95%', age: '38m',
    chain: ['Order', 'Pick', 'Pack', 'Dispatch', 'Delivery promise'],
    timeline: [
      { t: '06:00', text: 'Inbound volume 18% above forecast', kind: 'event' },
      { t: '09:30', text: 'Pick-to-pack wait exceeds 45 minutes', kind: 'signal' },
      { t: '11:00', text: 'Projected next-day attainment falls to 92.4%', kind: 'signal' },
      { t: '11:05', text: 'Cut-off for same-day dispatch approaches in 3h', kind: 'event' },
    ],
    finding: 'Volume above forecast is creating a queue between pick and pack. At current throughput, roughly 340 orders would miss the next-day promise unless capacity shifts before cut-off.',
    status: 'Action proposed', owner: 'Fulfilment Ops',
  },
];

/** Builds an SVG path for a series inside a w×h box. */
export function linePath(values: number[], w: number, h: number, min = 30, max = 85): string {
  const step = w / (values.length - 1);
  return values.map((v, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)} ${(h - ((v - min) / (max - min)) * h).toFixed(1)}`).join(' ');
}
export function areaPath(values: number[], w: number, h: number, min = 30, max = 85): string {
  return `${linePath(values, w, h, min, max)} L${w} ${h} L0 ${h} Z`;
}
