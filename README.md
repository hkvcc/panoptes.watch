# panoptes.watch

Content repository. Currently hosts the **business observability** SEO campaign
(20 articles, 2 per day), written by a scheduled low-cost Claude agent and
auto-merged into `main`.

- Campaign pack and state: `seo/business-observability/`
- Agent procedure: `seo/business-observability/RUNBOOK.md`
- Articles (publication-ready Markdown): `content/blog/`
- Validator (run before every merge, and in CI): `python3 scripts/validate_seo.py`

Articles merged into `main` are status `ready`, not live. They become `live` only
once their canonical URL is verified to resolve. Internal links are only added to
live pages; pending links are queued in each record's `next_link_update_tasks`.
