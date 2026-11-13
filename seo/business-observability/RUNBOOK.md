# Daily SEO agent runbook (business observability campaign)

This file is the operating procedure for the scheduled cloud agent. The scheduled
task's prompt just says "follow RUNBOOK.md", so edit this file (not the schedule)
to change behaviour.

> **Merging into `main` deploys panoptes.watch to production** (Cloudflare Pages).
> Everything you merge is public within minutes. Act accordingly.

**Authority order:** this runbook → `AUTHORING.md` (site content rules, which are
non-negotiable) → `seo/business-observability/config.json` → `AGENT_HANDOFF.md`
(editorial rules) → `briefs.json` → `publication_calendar.csv` (intended order only).

Where the handoff and this runbook differ, this runbook wins. In particular:
**URLs are `/resources/<slug>/`, not `/blog/<slug>/`** (`config.json` → `url_map`),
and BO-01 is already `covered` by the existing `/business-observability/` page, which
is the pillar for every "link to BO-01" instruction.

## Files

| Path | Purpose |
|---|---|
| `seo/business-observability/config.json` | Domain, voice, url_map, overlap watchlist |
| `seo/business-observability/records/BO-XX.json` | One state record per brief (JSON contract; `markdown` holds the `.astro` source path) |
| `src/pages/resources/<slug>.astro` | The article (uses `ArticleLayout`) |
| `src/data/site.ts` → `RESOURCES` | Register every new article here (append at the end) |
| `src/pages/resources/index.astro` → `META` | Hub card for every new article |
| `seo/business-observability/RUN_LOG.md` | Append-only log, one section per run |
| `scripts/validate_seo.py` | Campaign gate; must pass with the build before merging |

Record `status` values: `queued` → `ready` (merged into main) → `live` (canonical
URL fetched and confirmed). Also `held` (failed QA; `hold_reason`; retried later),
`merged` (consolidated into another brief, `merged_into`), and `covered` (an existing
site page already serves this intent, `covered_by`).

## Each run, in order

1. **Sync and install.** `git fetch origin main && git checkout -B seo/run-<YYYY-MM-DD> origin/main && npm ci`.
2. **Stop check.** If no record is `queued` or `held` and no record has open
   `next_link_update_tasks`, append a one-line RUN_LOG entry, disable your own
   scheduled task with `update_trigger` (`enabled: false`, id in
   `config.json` → `scheduled_task_id`), and end the run without a PR.
3. **Liveness refresh.** For every `ready` record, fetch its `canonical_url`. If it
   returns the article (HTTP 200, matching H1), set `status: live`. If you cannot
   fetch, leave it `ready`. Never guess.
4. **Pick work.** Next up-to-2 briefs by `priority_order` with status `held` or
   `queued` (held first). Cannibalisation check first:
   - Read every live page listed for that brief in `config.json` →
     `cannibalisation_watchlist`, and skim `src/pages/resources/` for overlap.
   - WebSearch the keyword; compare intent with sibling briefs (highest-risk:
     BO-02/04/10/11 and BO-06/09).
   - If an existing page already serves the intent, set `covered` + `covered_by`.
     If another brief should absorb it, set `merged` + `merged_into`. Record the
     evidence in `qa_findings` and take the next brief instead.
     Never write near-duplicates to hit quota.
5. **Research.** Fetch every `external_references` URL in the brief. Cite only URLs
   that resolved **and** support the sentence they are attached to; list them in
   `validated_external_urls` (exact strings used in `href`). Read
   `PRODUCT_TRUTH.md` (and `config.json` → `positioning_note`) before saying
   anything about Panoptes. It is proposed, not validated: capabilities are design
   intent only. Follow
   AUTHORING.md rules 1–5 (no invented customers, stats, results; unconfirmed
   capabilities in "designed to" language; third-party products only as examples).
6. **Write** `src/pages/resources/<slug>.astro`. Copy the structure of
   `src/pages/resources/business-process-monitoring.astro`:
   - `ArticleLayout` props: `title` (the H1, sentence case), `metaTitle`
     (~50–60 chars), `description` (~140–160 chars), `eyebrow`, `dek`,
     `related` (2–3 hrefs that exist in `RESOURCES`), `published` (today, ISO).
   - Body is HTML: `<p>`, `<h2>` per brief outline item (sentence case), `<h3>`,
     `<table>`, `<div class="callout">`, `<ul>`. No `<h1>`. FAQs as an `<h2>` with
     `<h3>` questions (3–5, genuine questions).
   - Answer the search intent in the first 100 words. Hit the brief word range.
   - The brief's original-value asset as an HTML table/list, or an SVG in
     `public/diagrams/` that follows AUTHORING.md's SVG conventions, shown with
     `RbDiagram` like the template. Illustrative data must be labelled as such.
   - Internal links: 3–5, relative, trailing slash, only to routes that exist in
     `src/pages` (existing pages and earlier campaign articles are all fine).
     Include `/business-observability/` where natural, plus `/demo/` for a CTA.
     If a brief's link target is not written yet, add a `next_link_update_tasks`
     entry `{"target": "BO-XX", "anchor": "...", "section": "..."}`.
   - British English. No generic SaaS filler.
7. **Register** the article: append `{ label, href, icon }` to `RESOURCES` in
   `src/data/site.ts` (icon from `public/icons/ui/`), and add a `META` entry in
   `src/pages/resources/index.astro` (title, desc, mins, group, topics).
8. **Link maintenance.** For any record whose `next_link_update_tasks` target now
   exists as a page, add the contextual link in that article and remove the task.
   Add natural reciprocal links from older campaign articles to the new ones.
9. **QA.** Run every check from AGENT_HANDOFF.md step 7 that you can actually do.
   Record each in `qa_findings` as `{"check", "result": "pass|fail|not_run", "note"}`.
   Anything not performed is `not_run` with the reason, never `pass`. If a claim is
   unsupported or a check fails and you cannot fix it, set `held` with
   `hold_reason`, and remove that article's page and registrations from this run.
10. **Update records** for shipped articles: `status: ready`,
    `markdown: "src/pages/resources/<slug>.astro"`, `metadata` (title, metaTitle,
    description, slug, published, word_count), `canonical_url`
    (`https://panoptes.watch` + url_map path), `publish_timestamp` (ISO 8601 UTC),
    `validated_internal_urls`.
11. **Log.** Append a section to `RUN_LOG.md`: date, shipped/held/merged/covered,
    link updates, checks not run, human follow-ups.
12. **Gate.** All three must pass. Fix the content until they do; never edit the
    validator, the build scripts or the link checker to get a pass.
    ```
    python3 scripts/validate_seo.py
    npm run build
    npm run check:links
    ```
13. **Ship (auto-merge).** Commit, `git push -u origin seo/run-<date>`, open a PR to
    `main` titled `SEO: <ids> (<date>)` with the RUN_LOG section as the body, then
    squash-merge it with the GitHub `merge_pull_request` tool and delete the branch.
    If the merge fails, rebase on `origin/main`, re-run the gate, retry once; if it
    still fails, leave the PR open and say so in the summary. Never force-push `main`.

## Hard limits

- At most 2 new articles per run. Shipping 0 or 1 is fine; quality over quota.
- Only touch: `src/pages/resources/<new or campaign slug>.astro`, `RESOURCES` in
  `src/data/site.ts`, `META` in `src/pages/resources/index.astro`, new SVGs in
  `public/diagrams/`, and `seo/business-observability/` (except this runbook, `PRODUCT_TRUTH.md`,
  `briefs.json`, `AGENT_HANDOFF.md` and `config.json`, which are human-owned).
  Do not edit existing non-campaign pages, layouts, components or styles.
- Never claim a page is live, a test was run, or a source says something it does not.
