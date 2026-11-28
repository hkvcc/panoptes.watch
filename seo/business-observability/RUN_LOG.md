# Run log

Append-only. One section per scheduled run.

## 2026-11-25

- **Shipped:** BO-02 `/blog/business-observability-platform/` (Kieran Lovell); GR-003 `/blog/weekly-business-review/` (Florian Andrews). Both `ready` until the canonical URLs can be fetched after deploy.
- **Held:** BO-03 (needs vendor evidence from Gartner/Dynatrace/IBM pages; hosts unreachable from this session).
- **Covered/merged:** none. **Link updates:** none possible; BO-02 queued link tasks for BO-03, BO-04, BO-16.
- **Backlog:** 50 queued items remain; no replenishment needed. GR-003 marked shipped.
- **Checks not run:** external source verification for all brief references (network egress blocked: dynatrace.com, docs.dynatrace.com, ibm.com, gartner.com, wikipedia.org, opentelemetry.io fail DNS), so both articles cite no external URLs; automated spellcheck; liveness refresh (no ready records existed).
- **Human follow-ups:** allow the above hosts in the cloud environment's network settings so held/queued briefs with external references can be verified; confirm both pages live after deploy.

## 2026-11-26

- **Shipped:** GR-001 `/resources/knowledge/what-is-cost-to-serve/` (knowledge, no byline); GR-007 `/blog/variance-analysis-operational-causes/` (Kieran Lovell). Both shipped, to be confirmed live after deploy.
- **Drafted, not shipped:** BO-05 `real-time-business-monitoring` is committed as `draft: true` (author Florian Andrews per author_map, dated 2026-11-27). `validate_seo.py` requires author_map (Florian) but byline alternation after GR-003 (Florian) requires Kieran, so it could not ship today. Record stays `queued`.
- **Held:** BO-03 (vendor sources still unreachable), BO-04 (overlaps BO-02; Dynatrace/OTel sources unreachable).
- **Link updates:** /use-cases/operational-efficiency/ links to cost to serve. BO-02 links to BO-05 deferred until BO-05 is live.
- **Backlog:** 50 queued/held items remain; no replenishment needed.
- **Checks not run:** external source verification (egress proxy returns 403 for gartner, dynatrace, ibm, opentelemetry, wikipedia, learn.microsoft), WebSearch, spellcheck, liveness refresh (BO-02 and GR-003 URLs cannot be fetched from this session).
- **Human follow-ups:** `scripts/validate_seo.py` on main crashes (`NameError: authors` at the check_bylines call; should use `config.get("authors")`). Fix it, and reconcile the author_map in config.json with alternation. Allow blocked hosts in the network settings. Confirm pages are live.

## 2026-11-27

- **Shipped:** BO-05 `/blog/real-time-business-monitoring/` (Florian Andrews; draft from 2026-11-26 published, alternation now correct after Kieran's GR-007); GR-002 `/use-cases/order-exceptions/` (use case, no byline). Both to be confirmed live after deploy.
- **Held/covered:** none. BO-03 and BO-04 remain held (vendor sources unreachable).
- **Link updates:** BO-02 now links to BO-05; `what-is-order-to-cash` links to order exceptions; use-case hub text no longer says "six".
- **Backlog:** 49 queued items remain; no replenishment needed.
- **Checks not run:** external source verification (proxy 403), WebSearch, liveness refresh. `scripts/validate_seo.py` on main crashes (`NameError: authors`), so it was run from a scratch copy with `authors = config.get("authors")`; repo script not edited.
- **Human follow-ups:** fix the validator one-liner; allow blocked hosts; confirm both pages live.

## 2026-11-28

- **Shipped:** GR-004 `/resources/knowledge/what-is-days-sales-outstanding/` (knowledge, no byline); GR-012 `/blog/cross-functional-handoffs/` (Kieran Lovell; alternation after Florian's BO-05). To be confirmed live after deploy.
- **Held:** BO-03, BO-04 (vendor sources still unreachable: curl returns no connection for dynatrace.com, ibm.com, opentelemetry.io, wikipedia.org). BO-06 not shipped: `config.json` author_map assigns it to Florian, but byline alternation requires Kieran after BO-05, so it cannot satisfy both checks. It also overlaps `/resources/business-process-monitoring/`, so it needs an identity/correlation-ID angle. Record stays `queued`.
- **Covered/merged:** none. **Link updates:** `what-is-order-to-cash` now links to the DSO page; DSO page added to the knowledge nav list (`src/data/site.ts`).
- **Backlog:** 47 queued/held items remain; no replenishment needed.
- **Checks not run:** external source verification (egress blocked), WebSearch, liveness refresh (BO-02 and BO-05 fetched, HTTP 200 with matching H1, set to live), spellcheck. `validate_seo.py` crashes on main (`NameError: authors`); run from a scratch copy with `authors = config.get("authors")`, repo script not edited.
- **Human follow-ups:** fix the validator one-liner; reconcile `author_map` with alternation (BO-06 conflict); allow blocked hosts in network settings; confirm both pages live.
