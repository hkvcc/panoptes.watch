# Daily SEO agent runbook (business observability campaign)

This file is the operating procedure for the scheduled cloud agent. The scheduled
task's prompt just says "follow RUNBOOK.md", so edit this file (not the schedule)
to change behaviour.

**Authority order:** this runbook → `config.json` → `AGENT_HANDOFF.md` (full editorial
rules, which you must follow) → `briefs.json` (per-article briefs) →
`publication_calendar.csv` (intended order only).

## Files

| Path | Purpose |
|---|---|
| `seo/business-observability/config.json` | Domain, voice, limits, known existing pages |
| `seo/business-observability/records/BO-XX.json` | One state record per brief (the JSON contract) |
| `content/blog/<slug>.md` | Publication-ready article (front matter + Markdown) |
| `seo/business-observability/RUN_LOG.md` | Append-only log, one section per run |
| `scripts/validate_seo.py` | Must pass before merging |

Record `status` values: `queued` → `ready` (merged into main, publication-ready) →
`live` (canonical URL fetched and resolves). Also `held` (failed QA; `hold_reason`
set; retried on a later run) and `merged` (cannibalisation: consolidated into
`merged_into`, never written as its own page).

## Each run, in order

1. **Sync.** `git fetch origin main && git checkout -B seo/run-<YYYY-MM-DD> origin/main`.
   If `main` is ahead of what you expect, trust `main`.
2. **Stop check.** If no record is `queued` or `held` and there are no open
   `next_link_update_tasks`, write a one-line RUN_LOG entry, then disable your own
   scheduled task with `update_trigger` (`enabled: false`, trigger id in
   `config.json` → `scheduled_task_id`) and end the run.
3. **Liveness refresh.** For every `ready` record, fetch `canonical_url` (WebFetch).
   If it returns the article (HTTP 200, matching H1), set `status: live`.
   If fetching is impossible, leave it `ready` — never guess.
4. **Pick work.** Take the next up-to-`max_articles_per_run` (2) briefs by
   `priority_order` whose status is `held` or `queued` (held first). Before writing,
   apply the cannibalisation check from AGENT_HANDOFF.md step 2 (WebSearch the
   keyword, compare with sibling briefs and existing records; highest-risk overlaps
   BO-02/04/10/11 and BO-06/09). If a brief should be consolidated, set
   `status: merged`, `merged_into: BO-XX`, add a qa_finding with the evidence, and
   take the next brief instead. Never write near-duplicates to hit quota.
5. **Research.** Open every `external_references` URL in the brief (WebFetch). Only
   cite URLs that resolved and actually support the sentence you attach them to.
   Record them in `validated_external_urls`. Never invent sources, quotes, statistics,
   vendors, prices, customers, tests or results. Label hypothetical examples as such.
6. **Write** `content/blog/<last slug segment>.md` following the brief (H2 outline,
   word range, original asset, 3–5 FAQs, answer intent in the first 100 words,
   2–4 contextual external citations). Front matter, exactly these keys:

   ```yaml
   ---
   id: "BO-01"
   title: "SEO title, ~50-60 chars"
   meta_description: "~140-160 chars"
   slug: "/blog/business-observability/"
   canonical_url: "https://panoptes.watch/blog/business-observability/"
   primary_keyword: "business observability"
   author: "Panoptes Editorial Team"
   reviewed: "YYYY-MM-DD"
   image_alt: "Describe the diagram/asset"
   ---
   ```

   Then exactly one `# H1`. **Internal links:** only to records with `status: live`
   or to paths in `config.json` → `existing_pages`. For every brief link target that
   is not yet live, add a `next_link_update_tasks` entry
   (`{"target": "BO-XX", "anchor": "...", "section": "..."}`) instead of a link.
   CTA: plain text unless its destination is a live/existing page.
7. **Link maintenance.** For any record (including older ones) whose
   `next_link_update_tasks` now point at a `live` target, add the contextual link
   to that article and remove the task. Add reciprocal links where natural
   (handoff step 5). Max ~5 internal links per article.
8. **QA.** Run every check in handoff step 7 you can actually perform. Record each
   in `qa_findings` as `{"check": "...", "result": "pass|fail|not_run", "note": "..."}`.
   Anything you could not perform is `not_run` with the reason — never `pass`.
   If any claim is unsupported or a check fails, fix it; if you cannot, set
   `status: held` with `hold_reason`, and do not ship that article this run.
9. **Update records** for shipped articles: `status: ready`, `markdown` (repo path),
   `metadata` (title, meta_description, h1, slug, author, reviewed, image_alt,
   word_count), `canonical_url`, `publish_timestamp` (ISO 8601, UTC, time of merge),
   `validated_internal_urls`.
10. **Log.** Append a section to `RUN_LOG.md`: date, articles shipped/held/merged,
    link updates made, checks not run, and any human follow-ups.
11. **Validate.** `python3 scripts/validate_seo.py`. Fix until it passes. Do not
    edit or weaken the validator to make it pass.
12. **Ship (auto-merge).** Commit, `git push -u origin seo/run-<date>`, open a PR to
    `main` titled `SEO: <ids> (<date>)` with the RUN_LOG section as the body, then
    squash-merge it yourself with the GitHub `merge_pull_request` tool and delete
    the branch. If the merge fails (conflict, protection), rebase on `origin/main`,
    re-validate, retry once; otherwise leave the PR open and say so in the log.
    Never force-push to `main`.

## Hard limits

- At most 2 new articles per run. Quality over quota: shipping 0–1 is fine.
- Never claim a page is live, a test was run, or a source says something it does not.
- Never touch files outside `content/blog/`, `seo/business-observability/` (except
  this runbook, the briefs and the validator, which are human-owned).
