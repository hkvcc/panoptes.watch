# Daily SEO agent runbook (business observability campaign)

This file is the operating procedure for the scheduled cloud agent. The scheduled
task's prompt just says "follow RUNBOOK.md", so edit this file (not the schedule)
to change behaviour.

> **Merging into `main` deploys panoptes.watch to production** (Cloudflare Pages).
> Everything you merge is public within minutes. Act accordingly.

**Authority order:** this runbook → `AUTHORING.md` (site content rules and the
"Blog" section, non-negotiable) → `seo/business-observability/config.json` →
`PRODUCT_TRUTH.md` → `AGENT_HANDOFF.md` (editorial rules) → `briefs.json` →
`publication_calendar.csv` (intended order only).

BO-01 is already `covered` by the existing `/business-observability/` page, which is
the pillar for every "link to BO-01" instruction.

## Files

| Path | Purpose |
|---|---|
| `seo/business-observability/config.json` | Voice, author_map, categories, url_map, overlap watchlist |
| `seo/business-observability/PRODUCT_TRUTH.md` | What may be said about Panoptes (proposed; design intent only) |
| `seo/business-observability/records/BO-XX.json` | One state record per brief (JSON contract) |
| `content/blog/<slug>.md` | The article. Adding it is the whole publishing step |
| `content/blog/_template.md`, `src/lib/blog-schema.ts` | Front-matter template and schema (unknown keys fail the build) |
| `seo/business-observability/RUN_LOG.md` | Append-only log, one section per run |
| `scripts/validate_seo.py` | Campaign gate |

Record `status` values: `queued` → `ready` (merged into main) → `live` (canonical
URL fetched and confirmed). Also `held` (failed QA; `hold_reason`; retried later),
`merged` (consolidated into another brief, `merged_into`), and `covered` (an existing
site page already serves this intent, `covered_by`).

**Scope note.** The scheduled task's prompt may mention a growth backlog
(`seo/growth/backlog.json`) and `npm run audit:seo`. If either does not exist in the
repo, skip it, record it in RUN_LOG as `not_run (missing)`, and carry on with the
campaign briefs. Missing optional items are never a reason to ship nothing.

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
     `cannibalisation_watchlist`, plus the existing `content/blog/` posts and
     `src/pages/resources/` guides.
   - WebSearch the keyword; compare intent with sibling briefs (highest-risk:
     BO-02/04/10/11 and BO-06/09).
   - If an existing page already serves the intent, set `covered` + `covered_by`.
     If another brief should absorb it, set `merged` + `merged_into`. Record the
     evidence in `qa_findings` and take the next brief instead.
     Never write near-duplicates to hit quota.
5. **Research.** Fetch every `external_references` URL in the brief. Cite only URLs
   that resolved **and** support the sentence they are attached to; list them in
   `validated_external_urls` (exact strings used in links). Read `PRODUCT_TRUTH.md`
   and `config.json` → `positioning_note` before saying anything about Panoptes. It
   is proposed, not validated: capabilities are design intent only. Follow
   AUTHORING.md content rules 1–9.
6. **Write** `content/blog/<last segment of url_map path>.md` from
   `content/blog/_template.md` (delete the template's comments). Front matter:

   ```yaml
   ---
   id: "BO-03"
   title: "SEO title, max 49 chars"  # site appends " | Panoptes"; build fails if longer
   meta_description: "~140-160 chars; also the standfirst and card text"
   slug: "/blog/business-observability-tools/"
   canonical_url: "https://panoptes.watch/blog/business-observability-tools/"
   primary_keyword: "business observability tools"
   author: "kieran-lovell"           # slug from config.json → author_map[id]
   reviewed: "YYYY-MM-DD"            # today
   published: "YYYY-MM-DD"           # today
   category: "Buying and evaluation" # one of config.json → categories
   tags: ["…", "…"]                  # 2–5, reuse existing tags where possible
   ---
   ```

   No other keys unless the template allows them (`cover` needs a real file in
   `public/blog/` plus `image_alt`; omit both unless you made one).
   - **Voice:** `config.json` → `brand_voice` and `brand_voice_guardrails`. Modern,
     upbeat and AI-first in perspective, but every claim concrete and sourced.
   - Body: exactly one `# H1` (the brief's working H1, sentence case), then a `##`
     per brief outline item, `###` below. FAQs as `## Frequently asked questions`
     with 3–5 `###` genuine questions.
   - Answer the search intent in the first 100 words. Hit the brief word range.
   - The brief's original-value asset as a Markdown table/list, or an SVG in
     `public/diagrams/` following AUTHORING.md's SVG conventions. Label
     illustrative data and hypothetical examples as such.
   - Internal links: 3–5, relative, trailing slash, only to routes that exist
     (`src/pages/**` or published `content/blog/*.md`). Include
     `/business-observability/` where natural and `/demo/` for the CTA. If a
     brief's link target is not written yet, add a `next_link_update_tasks` entry
     `{"target": "BO-XX", "anchor": "...", "section": "..."}` instead.
7. **Link maintenance.** For any record whose `next_link_update_tasks` target now
   exists, add the contextual link in that article (set `updated:` to today) and
   remove the task. Add natural reciprocal links from older campaign posts.
8. **QA.** Run every check from AGENT_HANDOFF.md step 7 that you can actually do.
   Record each in `qa_findings` as `{"check", "result": "pass|fail|not_run", "note"}`.
   Anything not performed is `not_run` with the reason, never `pass`. If a claim is
   unsupported or a check fails and you cannot fix it, set `held` with
   `hold_reason` and remove that article file from this run.
9. **Update records** for shipped articles: `status: ready`,
   `markdown: "content/blog/<slug>.md"`, `metadata` (title, meta_description, h1,
   slug, author, category, tags, word_count), `canonical_url`, `publish_timestamp`
   (ISO 8601 UTC), `validated_internal_urls`.
10. **Log.** Append a section to `RUN_LOG.md`: date, shipped/held/merged/covered,
    link updates, checks not run, human follow-ups.
11. **Gate.** All of these must pass. Fix the content until they do; never edit
    the validator, tests, schema, build scripts or link checker to get a pass.
    ```
    python3 scripts/validate_seo.py
    npm test
    npm run build
    npm run check:links
    ```
12. **Ship (auto-merge).** Commit, `git push -u origin seo/run-<date>`, open a PR to
    `main` titled `SEO: <ids> (<date>)` with the RUN_LOG section as the body, then
    squash-merge it with the GitHub `merge_pull_request` tool and delete the branch.
    If the merge fails, rebase on `origin/main`, re-run the gate, retry once; if it
    still fails, leave the PR open and say so in the summary. Never force-push `main`.

## Hard limits

- At most 2 new articles per run. Shipping 0 or 1 is fine; quality over quota.
- Only touch: `content/blog/<campaign slug>.md`, new SVGs in `public/diagrams/`
  or images in `public/blog/`, and `seo/business-observability/` (except this
  runbook, `PRODUCT_TRUTH.md`, `briefs.json`, `AGENT_HANDOFF.md` and `config.json`,
  which are human-owned). Do not edit pages, layouts, components, styles, tests
  or non-campaign blog posts.
- Never claim a page is live, a test was run, or a source says something it does not.
