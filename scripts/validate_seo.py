#!/usr/bin/env python3
"""Validate the daily site-growth work (SEO campaign + growth backlog) before merging to main.

Merging to main deploys panoptes.watch, so this is a publishing gate. It checks
the per-article records (JSON contract), each shipped Markdown article in
content/blog/, internal links against real routes and blog posts, external links
against the validated list, byline alternation/category, the growth backlog
(seo/growth/backlog.json) and the combined 2-items-per-day cap. The site's
own `npm test` and `npm run build` enforce the front-matter schema
(src/lib/blog-schema.ts); run them too. Exit code 1 on any error. Stdlib only.
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CAMPAIGN = ROOT / "seo" / "business-observability"
BACKLOG = ROOT / "seo" / "growth" / "backlog.json"
SITE_TS = ROOT / "src" / "data" / "site.ts"
GLOSSARY = ROOT / "src" / "pages" / "resources" / "business-observability-glossary.astro"
GR_TYPES = {"knowledge", "blog", "industry", "use-case", "role", "glossary"}
GR_STATUSES = {"queued", "held", "shipped", "covered"}
# Where each page type must be registered so hubs and navigation pick it up.
GR_REGISTRY = {"knowledge": "KNOWLEDGE", "industry": "INDUSTRIES", "use-case": "USE_CASES", "role": "SOLUTIONS"}
PAGES = ROOT / "src" / "pages"
STATUSES = {"queued", "held", "ready", "live", "merged", "covered"}
RECORD_KEYS = {
    "id", "keyword", "status", "markdown", "metadata", "validated_external_urls",
    "validated_internal_urls", "qa_findings", "canonical_url", "publish_timestamp",
    "next_link_update_tasks", "hold_reason", "merged_into", "covered_by", "owner",
}
FRONT_KEYS = {
    "id", "title", "meta_description", "slug", "canonical_url", "primary_keyword",
    "author", "reviewed", "published", "category",
}
QA_RESULTS = {"pass", "fail", "not_run"}
BANNED = ["TODO", "lorem ipsum", "REPLACE_", "unlock insights", "supercharge", "seamless", "revolutionise"]

errors, warnings = [], []
err, warn = errors.append, warnings.append


def routes(content_dir):
    out = set()
    for p in PAGES.rglob("*.astro"):
        rel = "/" + p.relative_to(PAGES).as_posix()[:-len(".astro")]
        if "[" in rel:
            continue
        rel = re.sub(r"/index$", "/", rel)
        out.add(rel if rel.endswith("/") else rel + "/")
    for p in content_dir.glob("*.md"):
        if not p.name.startswith("_"):
            fm, _ = parse_front_matter(p.read_text())
            if not (fm or {}).get("draft") == "true":
                out.add(f"/blog/{p.stem}/")
    return out


def parse_front_matter(text):
    if not text.startswith("---\n"):
        return None, text
    end = text.find("\n---\n", 4)
    if end == -1:
        return None, text
    fm = {}
    for line in text[4:end].splitlines():
        m = re.match(r'^([a-z_]+):\s*(.*?)\s*$', line)
        if m:
            v = m.group(2)
            if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
                v = v[1:-1]
            fm[m.group(1)] = v
    return fm, text[end + 5:]


def strip_code(body):
    return re.sub(r"```.*?```", "", body, flags=re.S)


def check_bylines(content_dir, authors, start_date):
    """Posts published on/after start_date must alternate authors, in (published, filename) order."""
    if not authors:
        return
    posts = []
    for p in sorted(content_dir.glob("*.md")):
        if p.name.startswith("_"):
            continue
        fm, _ = parse_front_matter(p.read_text())
        fm = fm or {}
        if fm.get("draft") == "true":
            continue
        posts.append(((fm.get("published") or fm.get("reviewed") or "")[:10], p.stem, fm.get("author")))
    posts.sort()
    for i, (date, slug, author) in enumerate(posts):
        if date < start_date:
            continue
        if author not in authors:
            err(f"blog/{slug}: author {author!r} not in config authors {authors}")
        elif i and posts[i - 1][2] == author:
            err(f"blog/{slug}: byline should alternate; previous post {posts[i - 1][1]!r} is also by {author!r} "
                f"(next author must be the one who did not write the last post)")


def check_backlog(route_set):
    """Validates seo/growth/backlog.json; returns shipped-item counts per day."""
    shipped_per_day = Counter()
    if not BACKLOG.is_file():
        warn("seo/growth/backlog.json not found")
        return shipped_per_day
    data = json.loads(BACKLOG.read_text())
    items = data.get("items") or []
    site_ts = SITE_TS.read_text()
    glossary = GLOSSARY.read_text() if GLOSSARY.is_file() else ""
    seen = {"id": set(), "priority": set(), "url": set(), "keyword": set()}
    for it in items:
        gid = it.get("id", "?")
        for k in seen:
            v = it.get(k)
            v = v.lower() if isinstance(v, str) and k == "keyword" else v
            if v in seen[k] and not (k == "url" and it.get("type") == "glossary"):
                err(f"{gid}: duplicate {k} {v!r}")
            seen[k].add(v)
        if it.get("type") not in GR_TYPES:
            err(f"{gid}: bad type {it.get('type')!r}")
        st = it.get("status")
        if st not in GR_STATUSES:
            err(f"{gid}: bad status {st!r}")
        if len(it.get("meta_title") or "") > 49 and it.get("type") != "glossary":
            err(f"{gid}: meta_title over 49 chars")
        for f in it.get("qa_findings") or []:
            if f.get("result") not in QA_RESULTS:
                err(f"{gid}: qa_finding {f.get('check')!r} has bad result {f.get('result')!r}")
        if st == "held" and not it.get("hold_reason"):
            err(f"{gid}: held without hold_reason")
        if st == "covered" and (it.get("covered_by") not in route_set or not it.get("qa_findings")):
            err(f"{gid}: covered needs covered_by (a site route) and evidence in qa_findings")
        if st != "shipped":
            continue
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", it.get("shipped_on") or ""):
            err(f"{gid}: shipped without shipped_on (YYYY-MM-DD)")
        else:
            shipped_per_day[it["shipped_on"]] += 1
        if not it.get("qa_findings") or any(f.get("result") == "fail" for f in it["qa_findings"]):
            err(f"{gid}: shipped without passing qa_findings")
        t, url = it.get("type"), it.get("url", "")
        if t == "glossary":
            for term in it.get("terms") or []:
                if f"term: '{term}'" not in glossary and f'term: "{term}"' not in glossary:
                    err(f"{gid}: glossary term {term!r} not found in the glossary TERMS")
            continue
        if url not in route_set:
            err(f"{gid}: shipped but {url} is not a built route")
        reg = GR_REGISTRY.get(t)
        if reg:
            m = re.search(rf"export const {reg}\b.*?\n\];", site_ts, flags=re.S)
            if not m or f"href: '{url}'" not in m.group(0):
                err(f"{gid}: {url} is not registered in {reg} in src/data/site.ts")
    return shipped_per_day


def main():
    config = json.loads((CAMPAIGN / "config.json").read_text())
    briefs = {b["id"]: b for b in json.loads((CAMPAIGN / "briefs.json").read_text())["briefs"]}
    origin = config["canonical_base"].rstrip("/")
    url_map = config["url_map"]
    cap = config.get("max_articles_per_run", 2)
    content_dir = ROOT / config.get("content_dir", "content/blog")
    author_map = config.get("author_map") or {}
    categories = set(config.get("categories") or [])
    route_set = routes(content_dir)

    records = {}
    for path in sorted((CAMPAIGN / "records").glob("BO-*.json")):
        rec = json.loads(path.read_text())
        rid = rec.get("id")
        if rid != path.stem:
            err(f"{path.name}: id {rid!r} does not match filename")
        if rid not in briefs or rid not in url_map:
            err(f"{path.name}: no brief/url_map entry for {rid}")
        missing = RECORD_KEYS - rec.keys()
        if missing:
            err(f"{rid}: missing keys {sorted(missing)}")
        if rec.get("status") not in STATUSES:
            err(f"{rid}: bad status {rec.get('status')!r}")
        records[rid] = rec
    if set(records) != set(briefs):
        err(f"records/briefs mismatch: {sorted(set(briefs) ^ set(records))}")

    per_day = Counter()
    for rid, rec in records.items():
        st = rec.get("status")
        for f in rec.get("qa_findings") or []:
            if f.get("result") not in QA_RESULTS:
                err(f"{rid}: qa_finding {f.get('check')!r} has bad result {f.get('result')!r}")
        if st == "held" and not rec.get("hold_reason"):
            err(f"{rid}: held without hold_reason")
        if st == "merged":
            if rec.get("merged_into") not in briefs or rec.get("merged_into") == rid:
                err(f"{rid}: merged without valid merged_into")
            if not rec.get("qa_findings"):
                err(f"{rid}: merged without evidence in qa_findings")
        if st == "covered":
            if rec.get("covered_by") not in route_set:
                err(f"{rid}: covered_by {rec.get('covered_by')!r} is not a site route")
            if not rec.get("qa_findings"):
                err(f"{rid}: covered without evidence in qa_findings")
        if st not in {"ready", "live"}:
            continue

        # ---- shipped article checks ----
        path = url_map[rid]
        file_slug = path.strip("/").split("/")[-1]
        expected_file = f"{config.get('content_dir', 'content/blog')}/{file_slug}.md"
        for k in ("markdown", "metadata", "canonical_url", "publish_timestamp"):
            if not rec.get(k):
                err(f"{rid}: status {st} but {k} empty")
        if rec.get("canonical_url") != origin + path:
            err(f"{rid}: canonical_url {rec.get('canonical_url')} != {origin + path}")
        if rec.get("markdown") != expected_file:
            err(f"{rid}: markdown should be {expected_file!r}, got {rec.get('markdown')!r}")
        if not rec.get("qa_findings"):
            err(f"{rid}: shipped without qa_findings")
        if any(f.get("result") == "fail" for f in rec.get("qa_findings") or []):
            err(f"{rid}: shipped with a failing QA check")
        if (rec.get("publish_timestamp") or "")[:10]:
            per_day[rec["publish_timestamp"][:10]] += 1

        md = ROOT / expected_file
        if not md.is_file():
            err(f"{rid}: {expected_file} not found")
            continue
        text = md.read_text()
        fm, body = parse_front_matter(text)
        if fm is None:
            err(f"{rid}: missing front matter")
            continue
        if FRONT_KEYS - fm.keys():
            err(f"{rid}: front matter missing {sorted(FRONT_KEYS - fm.keys())}")
        if fm.get("id") != rid:
            err(f"{rid}: front matter id {fm.get('id')!r}")
        if fm.get("slug") != path or fm.get("canonical_url") != origin + path:
            err(f"{rid}: front matter slug/canonical_url do not match {path}")
        if fm.get("draft") == "true":
            err(f"{rid}: shipped record but article is a draft")
        if rid in author_map and fm.get("author") != author_map[rid]:
            err(f"{rid}: author {fm.get('author')!r} should be {author_map[rid]!r} (config author_map)")
        if categories and fm.get("category") not in categories:
            err(f"{rid}: category {fm.get('category')!r} not in config categories")
        for bad in BANNED:
            if bad.lower() in text.lower():
                err(f"{rid}: contains banned/placeholder text {bad!r}")
        tl, ml = len(fm.get("title", "")), len(fm.get("meta_description", ""))
        if "Panoptes" in fm.get("title", "") and tl > 60 or "Panoptes" not in fm.get("title", "") and tl > 49:
            err(f"{rid}: SEO title is {tl} chars; max 49 (site appends ' | Panoptes'), or 60 if it names Panoptes")
        elif tl < 25:
            warn(f"{rid}: SEO title length {tl}")
        if not 110 <= ml <= 170:
            warn(f"{rid}: meta description length {ml}")

        prose = strip_code(body)
        if len(re.findall(r"^# \S", prose, flags=re.M)) != 1:
            err(f"{rid}: expected exactly one '# ' H1")
        if len(re.findall(r"^## \S", prose, flags=re.M)) < 3:
            err(f"{rid}: fewer than 3 '## ' sections")
        n = len(re.findall(r"\b[\w'’-]+\b", re.sub(r"\]\([^)]*\)", "]", prose)))
        lo, hi = (int(x) for x in briefs[rid]["target_length_words"].split("-"))
        if n < lo * 0.85 or n > hi * 1.25:
            err(f"{rid}: {n} words, brief range {lo}-{hi}")
        elif not lo <= n <= hi:
            warn(f"{rid}: {n} words, brief range {lo}-{hi}")

        validated_ext = set(rec.get("validated_external_urls") or [])
        if not validated_ext:
            warn(f"{rid}: no validated external URLs")
        links = re.findall(r"\]\(([^)\s]+)", prose) + re.findall(r'href="([^"]+)"', prose)
        for href in links:
            if href.startswith(("http://", "https://")):
                if href.startswith(origin):
                    err(f"{rid}: use a relative internal link, not {href}")
                elif href not in validated_ext:
                    err(f"{rid}: external link not in validated_external_urls: {href}")
                continue
            if href.startswith(("#", "mailto:")):
                continue
            target = href.split("#")[0]
            if not target.endswith("/"):
                err(f"{rid}: internal link without trailing slash: {href}")
            elif target not in route_set:
                err(f"{rid}: internal link to non-existent page {href}")

    check_bylines(content_dir, authors, config.get("start_date", "0000-00-00"))
    for day, n in check_backlog(route_set).items():
        per_day[day] += n
    for day, n in per_day.items():
        if n > cap:
            err(f"{n} items shipped on {day} (cap {cap} per run/day across campaign and backlog)")

    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    shipped = sum(r.get("status") in {"ready", "live"} for r in records.values())
    print(f"{len(records)} campaign records, {shipped} shipped, {len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
