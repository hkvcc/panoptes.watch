// Fictional data and rendering for the Anomaly Detection chart explorer.
// Shared by the server render (initial state) and the client script (interaction).

export type View = 'raw' | 'band' | 'segment';
export interface State { view: View; k: number; sustained: boolean }

const DAYS = 56;
const SIGMA = 0.42;
const INCIDENT_START = 50;
const rand = (i: number) => { const x = Math.sin(i * 91.17 + 7.3) * 43758.5453; return x - Math.floor(x); };
const isWeekend = (d: number) => d % 7 === 5 || d % 7 === 6;

/** Expected value for a segment on a given day: base level plus a weekly pattern. */
const expected = (base: number, weekendDip: number) => Array.from({ length: DAYS }, (_, d) => base - (isWeekend(d) ? weekendDip : 0) + (d % 7 === 0 ? 0.3 : 0));

function series(base: number, dip: number, seed: number, incident: number[]) {
  const e = expected(base, dip);
  const a = e.map((v, d) => {
    let noise = (rand(d + seed) - 0.5) * 1.5;
    if (rand(d * 3 + seed) > 0.93) noise *= 2.1; // occasional larger wobble
    return v + noise - (d >= INCIDENT_START ? incident[d - INCIDENT_START] ?? 0 : 0);
  });
  return { e, a };
}

export const SEGMENTS = {
  routeA: { label: 'Cards · route A', share: 0.6, ...series(95.2, 1.2, 11, [0, 0.1, 0, 0.2, 0, 0.1]) },
  routeB: { label: 'Cards · route B', share: 0.25, ...series(94.6, 1.6, 29, [3.4, 5.1, 5.6, 5.2, 5.8, 5.5]) },
  wallet: { label: 'Wallets', share: 0.15, ...series(96.4, 0.6, 47, [0, 0, 0.2, 0, 0.1, 0]) },
};
const keys = Object.keys(SEGMENTS) as (keyof typeof SEGMENTS)[];
export const OVERALL = {
  e: Array.from({ length: DAYS }, (_, d) => keys.reduce((s, k) => s + SEGMENTS[k].e[d] * SEGMENTS[k].share, 0)),
  a: Array.from({ length: DAYS }, (_, d) => keys.reduce((s, k) => s + SEGMENTS[k].a[d] * SEGMENTS[k].share, 0)),
};

/** Indices of readings outside expected ± k·σ; optionally only when two consecutive readings breach. */
export function flagged(e: number[], a: number[], k: number, sustained: boolean, sigma = SIGMA) {
  const out = a.map((v, i) => Math.abs(v - e[i]) > k * sigma);
  return out.map((o, i) => o && (!sustained || out[i - 1] || out[i + 1])).flatMap((o, i) => (o ? [i] : []));
}

export function summary(s: State) {
  const seg = s.view === 'segment';
  const src = seg ? SEGMENTS.routeB : OVERALL;
  const sig = seg ? SIGMA * 2 : SIGMA;
  const f = s.view === 'raw' ? [] : flagged(src.e, src.a, s.k, s.sustained, sig);
  const real = f.filter((i) => i >= INCIDENT_START).length;
  return { total: f.length, real, noise: f.length - real, perWeek: (f.length - real) / 7, flagged: f };
}

const f1 = (n: number) => Math.round(n * 10) / 10;

/** Render the chart as an SVG string at a given pixel width (text stays legible on small screens). */
export function renderChart(s: State, width = 760): string {
  const W = Math.max(300, Math.round(width)), H = W < 520 ? 260 : 320;
  const X0 = 40, X1 = W - 12, Y0 = 14, Y1 = H - 34;
  const [lo, hi] = s.view === 'segment' ? [87, 98] : [91.5, 96.5];
  const sx = (i: number) => f1(X0 + (i / (DAYS - 1)) * (X1 - X0));
  const sy = (v: number) => f1(Y1 - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (Y1 - Y0));
  const line = (arr: number[]) => 'M' + arr.map((v, i) => `${sx(i)} ${sy(v)}`).join('L');
  const band = (e: number[], w: number) => 'M' + e.map((v, i) => `${sx(i)} ${sy(v + w)}`).join('L') + 'L' + e.map((v, i) => `${sx(i)} ${sy(v - w)}`).reverse().join('L') + 'Z';
  let g = '';
  // weekends + incident window
  for (let d = 0; d < DAYS; d++) if (d % 7 === 5) g += `<rect x="${sx(d) - 3}" y="${Y0}" width="${f1(sx(d + 1) - sx(d) + 6)}" height="${Y1 - Y0}" class="ax-we"/>`;
  g += `<rect x="${sx(INCIDENT_START) - 4}" y="${Y0}" width="${f1(X1 - sx(INCIDENT_START) + 4)}" height="${Y1 - Y0}" class="ax-inc"/>`;
  for (let v = Math.ceil(lo); v <= hi; v += s.view === 'segment' ? 2 : 1) g += `<path d="M${X0} ${sy(v)}H${X1}" class="ax-grid"/><text x="${X0 - 6}" y="${sy(v) + 4}" text-anchor="end" class="ax-tick">${v}%</text>`;
  [0, 14, 28, 42, 55].forEach((d) => (g += `<text x="${sx(d)}" y="${H - 12}" text-anchor="${d === 0 ? 'start' : d === 55 ? 'end' : 'middle'}" class="ax-tick">${d === 55 ? 'today' : `wk ${d / 7 + 1}`}</text>`));
  if (s.view === 'segment') {
    const k = s.k * SIGMA * 2;
    g += `<path d="${band(SEGMENTS.routeB.e, k)}" class="ax-band"/>`;
    g += `<path d="${line(SEGMENTS.wallet.a)}" class="ax-line ax-l3"/>`;
    g += `<path d="${line(SEGMENTS.routeA.a)}" class="ax-line ax-l2"/>`;
    g += `<path d="${line(SEGMENTS.routeB.a)}" class="ax-line ax-l1"/>`;
  } else {
    if (s.view === 'band') {
      g += `<path d="${band(OVERALL.e, s.k * SIGMA)}" class="ax-band"/>`;
      g += `<path d="${line(OVERALL.e)}" class="ax-exp"/>`;
    }
    g += `<path d="${line(OVERALL.a)}" class="ax-line ax-l1"/>`;
  }
  const src = s.view === 'segment' ? SEGMENTS.routeB : OVERALL;
  const sum = summary(s);
  sum.flagged.forEach((i) => (g += `<circle cx="${sx(i)}" cy="${sy(src.a[i])}" r="5" class="${i >= INCIDENT_START ? 'ax-hit' : 'ax-noise'}"/>`));
  g += `<text x="${X1 - 6}" y="${Y0 + 16}" text-anchor="end" class="ax-inc-l">incident window</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${ariaFor(s, sum)}">${g}</svg>`;
}

function ariaFor(s: State, sum: ReturnType<typeof summary>) {
  if (s.view === 'raw') return 'Raw daily card payment completion over eight weeks, with weekend dips and a drop in the final week. No expectation shown.';
  const what = s.view === 'segment' ? 'Card payment completion by route; route B shown with its expected band' : 'Overall card payment completion with its expected band';
  return `${what}. ${sum.total} readings flagged: ${sum.real} in the incident window, ${sum.noise} likely noise.`;
}
