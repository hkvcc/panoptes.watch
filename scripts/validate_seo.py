#!/usr/bin/env python3
"""Validate the business-observability SEO campaign before merging to main.

Merging to main deploys panoptes.watch, so this is a publishing gate. It checks
the per-article records (JSON contract), each shipped Astro article, internal
links against real routes in src/pages, external links against the validated
list, hub/nav registration, and the 2-per-day cap. Run it together with
`npm run build && npm run check:links`. Exit code 1 on any error. Stdlib only.
"""
import json
import re
import sys
from collections import Counter
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CAMPAIGN = ROOT / "seo" / "business-observability"
PAGES = ROOT / "src" / "pages"
STATUSES = {"queued", "held", "ready", "live", "merged", "covered"}
RECORD_KEYS = {
    "id", "keyword", "status", "markdown", "metadata", "validated_external_urls",
    "validated_internal_urls", "qa_findings", "canonical_url", "publish_timestamp",
    "next_link_update_tasks", "hold_reason", "merged_into", "covered_by", "owner",
}
QA_RESULTS = {"pass", "fail", "not_run"}
BANNED = ["TODO", "lorem ipsum", "REPLACE_", "unlock insights", "supercharge", "seamless"]

errors, warnings = [], []
err, warn = errors.append, warnings.append


def routes():
    out = set()
    for p in PAGES.rglob("*.astro"):
        rel = "/" + p.relative_to(PAGES).as_posix()[:-len(".astro")]
        if "[" in rel:
            continue
        rel = re.sub(r"/index$", "/", rel)
        out.add(rel if rel.endswith("/") else rel + "/")
    return out


def prop(src, name):
    m = re.search(r'\b%s="([^"]*)"' % name, src)
    return unescape(m.group(1)) if m else None


def body_of(src):
    # drop Astro frontmatter, then keep what is inside <ArticleLayout ...> ... </ArticleLayout>
    src = re.sub(r"\A---.*?\n---\n", "", src, flags=re.S)
    m = re.search(r"<ArticleLayout\b.*?>(.*)</ArticleLayout>", src, flags=re.S)
    return m.group(1) if m else ""


def words(html):
    text = re.sub(r"<(script|style)\b.*?</\1>", " ", html, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\{[^{}]*\}", " ", text)
    return len(re.findall(r"[A-Za-z0-9][\w'’-]*", unescape(text)))


def main():
    config = json.loads((CAMPAIGN / "config.json").read_text())
    briefs = {b["id"]: b for b in json.loads((CAMPAIGN / "briefs.json").read_text())["briefs"]}
    origin = config["canonical_base"].rstrip("/")
    url_map = config["url_map"]
    cap = config.get("max_articles_per_run", 2)
    route_set = routes()
    site_ts = (ROOT / "src/data/site.ts").read_text()
    hub = (PAGES / "resources/index.astro").read_text()

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
        for k in ("markdown", "metadata", "canonical_url", "publish_timestamp"):
            if not rec.get(k):
                err(f"{rid}: status {st} but {k} empty")
        if rec.get("canonical_url") != origin + path:
            err(f"{rid}: canonical_url {rec.get('canonical_url')} != {origin + path}")
        if not rec.get("qa_findings"):
            err(f"{rid}: shipped without qa_findings")
        if any(f.get("result") == "fail" for f in rec.get("qa_findings") or []):
            err(f"{rid}: shipped with a failing QA check")
        if (rec.get("publish_timestamp") or "")[:10]:
            per_day[rec["publish_timestamp"][:10]] += 1
        if path not in route_set:
            err(f"{rid}: no page for {path} in src/pages")
            continue
        expected_file = f"src/pages{path.rstrip('/')}.astro"
        if rec.get("markdown") != expected_file:
            err(f"{rid}: markdown should be {expected_file!r}, got {rec.get('markdown')!r}")
        src = (ROOT / expected_file).read_text()
        if "ArticleLayout" not in src:
            err(f"{rid}: article does not use ArticleLayout")
        for bad in BANNED:
            if bad.lower() in src.lower():
                err(f"{rid}: contains banned/placeholder text {bad!r}")
        title, meta_title, desc = prop(src, "title"), prop(src, "metaTitle"), prop(src, "description")
        if not title or not desc or not prop(src, "dek") or not prop(src, "published"):
            err(f"{rid}: ArticleLayout needs title, description, dek and published")
        seo_title = meta_title or title or ""
        if not 30 <= len(seo_title) <= 75:
            warn(f"{rid}: SEO title length {len(seo_title)}")
        if desc and not 110 <= len(desc) <= 170:
            warn(f"{rid}: meta description length {len(desc)}")

        body = body_of(src)
        if re.search(r"<h1\b", body):
            err(f"{rid}: body must not contain <h1> (ArticleLayout renders it)")
        if len(re.findall(r"<h2\b", body)) < 3:
            err(f"{rid}: fewer than 3 <h2> sections")
        n = words(body)
        lo, hi = (int(x) for x in briefs[rid]["target_length_words"].split("-"))
        if n < lo * 0.85 or n > hi * 1.25:
            err(f"{rid}: {n} words, brief range {lo}-{hi}")
        elif not lo <= n <= hi:
            warn(f"{rid}: {n} words, brief range {lo}-{hi}")

        validated_ext = set(rec.get("validated_external_urls") or [])
        if not validated_ext:
            warn(f"{rid}: no validated external URLs")
        for href in re.findall(r'href="([^"]+)"', body):
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

        if f"href: '{path}'" not in site_ts:
            err(f"{rid}: {path} not registered in RESOURCES (src/data/site.ts)")
        if f"'{path}'" not in hub:
            err(f"{rid}: {path} has no META entry in src/pages/resources/index.astro")

    for day, n in per_day.items():
        if n > cap:
            err(f"{n} articles published on {day} (cap {cap})")

    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    shipped = sum(r.get("status") in {"ready", "live"} for r in records.values())
    print(f"{len(records)} records, {shipped} shipped, {len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
