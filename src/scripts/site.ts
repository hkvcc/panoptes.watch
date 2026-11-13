// Site-wide progressive enhancements. Every page works without this script;
// it adds theme switching, menus, tabs, reveal transitions, copy-to-clipboard and lightbox.

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Theme ---------- */
function applyTheme(t: 'light' | 'dark', persist = true) {
  document.documentElement.setAttribute('data-theme', t);
  if (persist) { try { localStorage.setItem('panoptes-theme', t); } catch { /* storage unavailable */ } }
  $$('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'));
}
applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
$$('[data-theme-toggle]').forEach((btn) =>
  btn.addEventListener('click', () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')),
);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  let stored: string | null = null;
  try { stored = localStorage.getItem('panoptes-theme'); } catch { /* ignore */ }
  if (!stored) applyTheme(e.matches ? 'dark' : 'light', false);
});

/* ---------- Header ---------- */
const header = $('[data-header]');
const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

/* ---------- Desktop mega menu (disclosure pattern) ---------- */
const triggers = $$<HTMLButtonElement>('[data-nav-trigger]');
const closeAll = (except?: HTMLButtonElement) => triggers.forEach((t) => {
  if (t === except) return;
  t.setAttribute('aria-expanded', 'false');
  const p = document.getElementById(t.getAttribute('aria-controls')!); if (p) p.hidden = true;
});
const open = (t: HTMLButtonElement) => {
  closeAll(t);
  t.setAttribute('aria-expanded', 'true');
  const p = document.getElementById(t.getAttribute('aria-controls')!); if (p) p.hidden = false;
};
let hoverTimer: number | undefined;
triggers.forEach((t, i) => {
  const item = t.closest('[data-nav-item]')!;
  t.addEventListener('click', () => (t.getAttribute('aria-expanded') === 'true' ? closeAll() : open(t)));
  t.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); open(t); $<HTMLAnchorElement>('a', document.getElementById(t.getAttribute('aria-controls')!)!)?.focus(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); triggers[(i + 1) % triggers.length].focus(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); triggers[(i - 1 + triggers.length) % triggers.length].focus(); }
  });
  if (matchMedia('(hover: hover)').matches) {
    item.addEventListener('mouseenter', () => { clearTimeout(hoverTimer); hoverTimer = window.setTimeout(() => open(t), 80); });
    item.addEventListener('mouseleave', () => { clearTimeout(hoverTimer); hoverTimer = window.setTimeout(() => closeAll(), 160); });
  }
  item.addEventListener('focusout', (e) => { if (!item.contains((e as FocusEvent).relatedTarget as Node)) { t.setAttribute('aria-expanded', 'false'); const p = document.getElementById(t.getAttribute('aria-controls')!); if (p) p.hidden = true; } });
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const openT = triggers.find((t) => t.getAttribute('aria-expanded') === 'true');
  if (openT) { closeAll(); openT.focus(); }
  if (burger?.getAttribute('aria-expanded') === 'true') { toggleMobile(false); burger.focus(); }
});
document.addEventListener('click', (e) => { if (!(e.target as Element).closest('[data-nav-item]')) closeAll(); });

/* ---------- Mobile nav ---------- */
const burger = $<HTMLButtonElement>('[data-burger]');
const mobileNav = $('[data-mobile-nav]');
function toggleMobile(force?: boolean) {
  if (!burger || !mobileNav) return;
  const next = force ?? burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', String(next));
  burger.setAttribute('aria-label', next ? 'Close menu' : 'Open menu');
  mobileNav.hidden = !next;
  document.body.style.overflow = next ? 'hidden' : '';
}
burger?.addEventListener('click', () => toggleMobile());
matchMedia('(min-width: 1081px)').addEventListener('change', (e) => { if (e.matches) toggleMobile(false); });

/* ---------- Reveal on scroll ---------- */
const revealEls = $$('.reveal');
if ('IntersectionObserver' in window && !reducedMotion()) {
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealEls.forEach((el) => io.observe(el));
} else revealEls.forEach((el) => el.classList.add('is-visible'));

/* ---------- Tabs (WAI-ARIA, automatic activation) ---------- */
$$('[data-tabs]').forEach((root) => {
  const tabs = $$<HTMLButtonElement>(':scope > [role="tablist"] > [role="tab"]', root);
  const select = (tab: HTMLButtonElement, focus = true) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls')!); if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
    root.dispatchEvent(new CustomEvent('tabchange', { detail: tab.id }));
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t, false));
    t.addEventListener('keydown', (e) => {
      const k = e.key; let n = -1;
      if (k === 'ArrowRight') n = (i + 1) % tabs.length;
      if (k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      if (k === 'Home') n = 0;
      if (k === 'End') n = tabs.length - 1;
      if (n > -1) { e.preventDefault(); select(tabs[n]); }
    });
  });
});

/* ---------- Copy email ---------- */
$$<HTMLButtonElement>('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
  const text = btn.dataset.copy!; const label = $('.ce-label', btn);
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text }); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.append(ta); ta.select(); try { ok = document.execCommand('copy'); } catch { ok = false; } ta.remove();
  }
  if (label) { label.textContent = ok ? 'Copied' : 'Press ⌘C'; setTimeout(() => (label.textContent = 'Copy'), 2000); }
}));

/* ---------- Lightbox ---------- */
let dialog: HTMLDialogElement | null = null;
const DIAGRAM_VARS = ['--d-bg', '--d-surface', '--d-surface-2', '--d-line', '--d-text', '--d-muted', '--d-accent', '--d-accent-2', '--d-soft', '--d-ok', '--d-warn', '--d-crit'];
$$<HTMLButtonElement>('[data-lightbox]').forEach((btn) => btn.addEventListener('click', () => {
  const tpl = document.getElementById(btn.dataset.lightbox!) as HTMLTemplateElement | null;
  if (!tpl) return;
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-modal', 'true');
    dialog.innerHTML = '<div class="lb-head"><span class="lb-title"></span><button type="button" class="icon-btn" data-close aria-label="Close enlarged view"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="lb-body"></div>';
    document.body.append(dialog);
    dialog.addEventListener('click', (e) => { if (e.target === dialog || (e.target as Element).closest('[data-close]')) dialog!.close(); });
    dialog.addEventListener('close', () => { document.body.style.overflow = ''; lastTrigger?.focus(); });
  }
  lastTrigger = btn;
  $('.lb-title', dialog)!.textContent = tpl.dataset.title ?? '';
  const body = $('.lb-body', dialog)!; body.replaceChildren(tpl.content.cloneNode(true));
  // Carry the trigger's diagram palette into the dialog, so a dark product screen
  // or a diagram from a dark section enlarges in the colours it was shown in.
  const cs = getComputedStyle(btn);
  for (const v of DIAGRAM_VARS) dialog.style.setProperty(v, cs.getPropertyValue(v));
  dialog.setAttribute('aria-label', tpl.dataset.title ?? 'Enlarged image');
  document.body.style.overflow = 'hidden';
  dialog.showModal();
}));
let lastTrigger: HTMLElement | null = null;

/* ---------- Article TOC: highlight current section; collapse on small screens ---------- */
const tocLinks = $$<HTMLAnchorElement>('[data-toc-link]');
if (tocLinks.length) {
  const box = tocLinks[0].closest('details');
  if (box && matchMedia('(max-width: 960px)').matches) box.open = false;
  const map = new Map(tocLinks.map((a) => [a.hash.slice(1), a]));
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { tocLinks.forEach((a) => a.classList.remove('active')); map.get(en.target.id)?.classList.add('active'); }
  }), { rootMargin: '-20% 0px -70% 0px' });
  map.forEach((_a, id) => { const h = document.getElementById(id); if (h) io.observe(h); });
}
