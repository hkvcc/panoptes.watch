# Daily site-growth runbook (scheduled maintainer)

This is the operating procedure for the scheduled cloud agent ("the maintainer"). The
scheduled task's prompt only says "follow RUNBOOK.md", so to change behaviour, edit
this file, not the schedule.

> **Merging into `main` deploys panoptes.watch to production** (Cloudflare Pages).
> Everything you merge is public within minutes. Act accordingly.

**Every run ships at least one real improvement and at most two new items.** New
items come from two queues:

1. **Campaign briefs** `BO-01…BO-20`: blog articles. Records are in `records/BO-XX.json`
   and briefs in `briefs.json`.
2. **Growth backlog** `seo/growth/backlog.json`, items `GR-NNN`. These are knowledge
   explainers, blog articles, industry, use-case and role pages, and glossary terms,
   grouped into topic clusters around existing hub pages.

**Authority order:**
1. this runbook
2. `AUTHORING.md` (site content rules and the "Blog" section; non-negotiable)
3. `seo/business-observability/config.json`
4. `PRODUCT_TRUTH.md`
5. `AGENT_HANDOFF.md` (editorial rules, which also apply to backlog items)
6. `briefs.json` / `backlog.json`

BO-01 is `covered` by `/business-observability/`. That page is the pillar for every
"link to BO-01" instruction.

## Files

| Path | Purpose |
|---|---|
| `seo/business-observability/config.json` | Voice, authors and byline rule, categories, url_map, overlap watchlist |
| `seo/business-observability/PRODUCT_TRUTH.md` | What may be said about Panoptes (proposed; design intent only) |
| `seo/business-observability/records/BO-XX.json` | One state record per campaign brief |
| `seo/growth/backlog.json` | Growth backlog: clusters and items, with status kept on each item |
| `src/data/authors.ts` | Registered blog authors (`kieran-lovell`, `florian-andrews`) |
| `seo/business-observability/RUN_LOG.md` | Append-only log, one section per run |
| `scripts/validate_seo.py` | Campaign and backlog gate (bylines, records, backlog, daily cap) |
| `scripts/seo-audit.mjs` | Built-HTML gate: one H1, title ≤ 60, description 120–160, alt text, heading order |

**Campaign record `status` values:**
- `queued` → `ready` (merged into main) → `live` (canonical URL fetched and confirmed)
- `held` (failed QA; `hold_reason`; retried later)
- `merged` (`merged_into`)
- `covered` (`covered_by`)

**Backlog item `status` values:**
- `queued` → `shipped` (set `shipped_on`, `qa_findings`)
- `held` (`hold_reason`)
- `covered` (`covered_by` = the existing route that already serves the intent, with evidence in `qa_findings`)

## Bylines (blog posts only)

Blog bylines **alternate** between the registered authors in `config.json` → `authors`.

- Sort all published posts in `content/blog/` by `(published, filename)`. The next
  post's `author` is the slug of the author who did **not** write the last post.
- If you write two posts in one run, assign them in filename order, alternating.
- Use the author slug (`kieran-lovell` / `florian-andrews`), never a display name.
  Never invent a person or add a biography fact.
- `validate_seo.py` fails the run if two consecutive posts published on or after
  `start_date` share an author.

Pages that are not blog posts (knowledge, industry, use-case, role, glossary) carry no byline.

**Scope note.** The scheduled task's prompt may mention a growth backlog
(`seo/growth/backlog.json`) and `npm run audit:seo`. If either does not exist in the
repo, skip it, record it in RUN_LOG as `not_run (missing)`, and carry on with the
campaign briefs. Missing optional items are never a reason to ship nothing.

## Each run, in order

1. **Sync and install.**
   `git fetch origin main && git checkout -B seo/run-<YYYY-MM-DD> origin/main && npm ci`.
2. **Liveness refresh.** For every `ready` campaign record, fetch its `canonical_url`.
   - If it returns the article (HTTP 200, matching H1), set `status: live`.
   - If you cannot fetch it, leave it `ready`. Never guess.
3. **Pick work (1–2 items).**
   - **Slot A:** the next campaign brief by `priority_order` with status `held` or
     `queued` (held first).
   - **Slot B:** the next backlog item by `priority` with status `held` or `queued`
     (held first).
   - When the campaign queue is empty, both slots come from the backlog. Prefer a
     different `type` or `cluster` from slot A, so each run broadens the site.
   - **Cannibalisation check first, for every candidate:**
     - Read the pages listed for it in `config.json` → `cannibalisation_watchlist`
       (campaign) or its `nearest_existing_page` (backlog).
     - Read the existing `content/blog/` posts, `src/pages/resources/**` and any
       page with a similar H1.
     - WebSearch the keyword to confirm the intent.
     - If an existing page already serves the intent, mark the candidate
       `covered` / `merged` with evidence and take the next candidate.
     - Never write near-duplicates to hit quota.
   - If a candidate fails QA later (step 7), take the next one. Try at most 4
     candidates in total.
4. **Research.** Fetch every `external_references` URL. Cite only URLs that resolved
   **and** support the sentence they're attached to.
   - Campaign: list those URLs in the record's `validated_external_urls`.
   - Backlog: list them in a `qa_findings` note.
   - Read `PRODUCT_TRUTH.md` and `config.json` → `positioning_note` before saying
     anything about Panoptes. Capabilities are design intent ("is designed to").
   - Follow AUTHORING.md content rules: no fabricated statistics, customers, quotes,
     certifications, prices or results. Label illustrative numbers as illustrative.
5. **Build the item.** Use the recipe for its type below. Every page needs:
   - exactly one H1 containing the keyword naturally;
   - H2/H3 in order, with no skipped levels;
   - a title of at most 49 characters (the site appends " | Panoptes");
   - a meta description of 140–160 characters;
   - descriptive alt text on informative images, and `alt=""`/`aria-hidden` on decorative ones;
   - 3–5 internal links to routes that exist, including the cluster's pillar page and `/demo/` or `/contact/` for the CTA;
   - an FAQ only where the questions are genuine.
6. **Link maintenance (every run).**
   - For campaign records whose `next_link_update_tasks` target now exists, add the
     link (set `updated:` to today) and remove the task.
   - For the item you shipped, add one natural link to it from its cluster pillar
     or from a related existing page/post. Pages that list items from `site.ts`
     update automatically, so do this only where it adds real value.
7. **QA.** Run every check from AGENT_HANDOFF.md step 7 that you can actually do.
   Record each one as `{"check", "result": "pass|fail|not_run", "note"}`. Anything not
   performed is `not_run` with the reason, never `pass`. If a claim is unsupported or
   a check fails and you can't fix it, set `held` with `hold_reason`, remove that
   item's files from the branch, and go back to step 3 for the next candidate.
8. **Update state.**
   - **Campaign:** set `status: ready`, `markdown`, `metadata` (title, meta_description,
     h1, slug, author, category, tags, word_count), `canonical_url`,
     `publish_timestamp` (ISO 8601 UTC) and `validated_internal_urls`.
   - **Backlog:** set `status: shipped`, `shipped_on` (YYYY-MM-DD) and `qa_findings`.
9. **Replenish the backlog** when fewer than 10 backlog items are `queued`/`held`:
   - Research and append up to 5 new items with the same schema: next free `GR-NNN`,
     next `priority` numbers, verified `external_references`, `serp_notes`,
     `nearest_existing_page` and a cannibalisation note.
   - Favour the thinnest clusters.
   - This doesn't count as the run's "one thing".
10. **Guarantee one improvement.** If no new item survived QA after 4 candidates,
    ship one genuine maintenance improvement instead and log why. Pick the first that applies:
    - (a) fix a broken or weak internal link, or add missing cross-links between cluster pages;
    - (b) refresh the oldest blog post: tighten it, add links to newer pages, set `updated:`;
    - (c) add 2–3 missing glossary terms that existing pages already use.

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
    npm run audit:seo
    ```
13. **Ship (auto-merge).**
    - Commit, `git push -u origin seo/run-<date>`, then open a PR to `main` titled
      `Site growth: <ids> (<date>)` with the RUN_LOG section as the body.
    - Squash-merge it with the GitHub `merge_pull_request` tool and delete the branch.
    - If the merge fails, rebase on `origin/main`, re-run the gate and retry once. If
      it still fails, leave the PR open and say so in the summary.
    - Never force-push `main`.

The maintainer does **not** disable its own schedule. When both queues are empty
(which replenishment should prevent), it ships a maintenance improvement (step 10)
and says in the summary that the backlog needs human attention.

## Recipes by item type

### Blog post (`blog`, and all campaign briefs)
- File: `content/blog/<slug>.md`, made from `content/blog/_template.md` (delete the
  comments). Adding the file is the whole publishing step: listing, author page, RSS,
  sitemap and search update automatically.
- Front matter (campaign keys shown; backlog posts omit `id`/`slug`/`canonical_url`):

  ```yaml
  ---
  id: "BO-03"
  title: "Business Observability Tools, Compared"   # ≤ 49 chars
  meta_description: "140–160 chars; also the standfirst and card text"
  slug: "/blog/business-observability-tools/"
  canonical_url: "https://panoptes.watch/blog/business-observability-tools/"
  primary_keyword: "business observability tools"
  author: "kieran-lovell"       # alternate; see "Bylines"
  reviewed: "YYYY-MM-DD"        # today
  published: "YYYY-MM-DD"       # today
  category: "Buying and evaluation"   # one of config.json → categories
  tags: ["…", "…"]              # 2–5, reuse existing tags
  ---
  ```
- Body: exactly one `# H1` (sentence case), a `##` per outline item, `###` below.
  FAQs as `## Frequently asked questions` with 3–5 `###` questions. Answer the search
  intent in the first 100 words. Include the original asset (a table, checklist or
  worked example, or an SVG in `public/diagrams/` following AUTHORING.md).
- Voice: `config.json` → `brand_voice` and `brand_voice_guardrails`.
- If a link target doesn't exist yet, add a `next_link_update_tasks` entry instead
  of a link.

### Knowledge explainer (`knowledge`)
- File: `src/pages/resources/knowledge/<slug>.astro`. Copy the structure of
  `what-is-a-semantic-layer.astro` (`KnowledgeArticle` props: `title` = the H1
  question, `metaTitle` ≤ 49, `description`, `crumb`, `dek`, `definition`, `term`,
  `faqs`, `related`). Use H2s phrased as the questions people search.
- Register it: append to `KNOWLEDGE` in `src/data/site.ts` (`label` "What is X?",
  `href`, short `desc`, an existing `icon`). The knowledge hub, resources hub and
  schema list it automatically, and the menu shows only the first 6.
- Optionally add it to a group in `src/pages/resources/knowledge/index.astro`;
  otherwise it appears under the ungrouped list.

### Industry page (`industry`)
- Add an entry to `INDUSTRY_DATA` in `src/components/industries/data.ts` that
  follows the `Industry` type in `types.ts`. All scenarios and indicators are
  illustrative; for regulated sectors, no compliance claims.
- Create `src/pages/solutions/industries/<slug>.astro` by copying `saas.astro`.
- Register it: append to `INDUSTRIES` in `src/data/site.ts`. The industries hub,
  `/solutions/` and the home page list it automatically.

### Use-case page (`use-case`)
- Create `src/pages/use-cases/<slug>.astro` by copying the structure and components
  of an existing use case (e.g. `revenue-leakage.astro`). Keep the investigation
  framing and label illustrative data.
- Register it: append to `USE_CASES` in `src/data/site.ts`, and add a card or link to
  it on `src/pages/use-cases/index.astro` next to the existing ones (that hub is
  hand-written).

### Role page (`role`)
- Create `src/pages/solutions/<slug>.astro` by copying an existing role page (e.g.
  `finance.astro`).
- Register it: append to `SOLUTIONS` in `src/data/site.ts`, and add it to the role
  list on `src/pages/solutions/index.astro` (hand-written).

### Glossary terms (`glossary`)
- Add each of the item's `terms` to the `TERMS` array in
  `src/pages/resources/business-observability-glossary.astro`, using the existing
  shape `{ id, term, def, see? }`. `term` must match the backlog's spelling exactly,
  because the validator checks it. Definitions are neutral and 1–3 sentences, linking
  to a site page where one exists.

## Hard limits

- At most 2 new items per run (campaign and backlog combined; the validator enforces
  this per day). 1 is fine. Quality over quota.
- You may touch only:
  - new files for the item (per its recipe);
  - the registration lists in `src/data/site.ts` (`KNOWLEDGE`, `INDUSTRIES`,
    `USE_CASES`, `SOLUTIONS`; append only);
  - `src/components/industries/data.ts` (append only);
  - the glossary `TERMS` array;
  - the use-case and solutions hub lists described above;
  - link additions in existing content (step 6);
  - new SVGs in `public/diagrams/` or images in `public/blog/`;
  - `seo/business-observability/records/`, `RUN_LOG.md` and `seo/growth/backlog.json`
    (status fields; append-only for new items).
- Do not edit:
  - this runbook, `PRODUCT_TRUTH.md`, `briefs.json`, `AGENT_HANDOFF.md` or `config.json`
    (these are human-owned);
  - layouts, components (other than the data file above), styles, tests, scripts or
    legal pages;
  - non-campaign blog posts, except to add links (step 6) or refresh content (step 10b).
- Never add a person, customer, certification, price, integration partner or
  statistic that isn't sourced.
- Never claim a page is live, a test was run, or a source says something it doesn't.
