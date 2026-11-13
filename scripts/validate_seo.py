#!/usr/bin/env python3
"""Validate the business-observability SEO campaign state before merging.

Checks records against the JSON contract, article front matter, heading rules,
the "no links to non-live pages" policy and the 2-per-day publishing cap.
Exit code 1 on any error. Standard library only.
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CAMPAIGN = ROOT / "seo" / "business-observability"
STATUSES = {"queued", "held", "ready", "live", "merged"}
RECORD_KEYS = {
    "id", "keyword", "status", "markdown", "metadata", "validated_external_urls",
    "validated_internal_urls", "qa_findings", "canonical_url", "publish_timestamp",
    "next_link_update_tasks", "hold_reason", "merged_into", "owner",
}
FRONT_KEYS = {
    "id", "title", "meta_description", "slug", "canonical_url", "primary_keyword",
    "author", "reviewed", "image_alt",
}
QA_RESULTS = {"pass", "fail", "not_run"}

errors, warnings = [], []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def parse_front_matter(text):
    if not text.startswith("---\n"):
        return None, text
    end = text.find("\n---\n", 4)
    if end == -1:
        return None, text
    fm = {}
    for line in text[4:end].splitlines():
        m = re.match(r'^([a-z_]+):\s*"?(.*?)"?\s*$', line)
        if m:
            fm[m.group(1)] = m.group(2)
    return fm, text[end + 5:]


def strip_code(body):
    return re.sub(r"```.*?```", "", body, flags=re.S)


def main():
    config = json.loads((CAMPAIGN / "config.json").read_text())
    briefs = {b["id"]: b for b in json.loads((CAMPAIGN / "briefs.json").read_text())["briefs"]}
    base = config["canonical_base"].rstrip("/")
    existing = {p.rstrip("/") + "/" for p in config.get("existing_pages", [])}

    records = {}
    for path in sorted((CAMPAIGN / "records").glob("BO-*.json")):
        rec = json.loads(path.read_text())
        rid = rec.get("id")
        if rid != path.stem:
            err(f"{path.name}: id {rid!r} does not match filename")
        if rid not in briefs:
            err(f"{path.name}: no brief with id {rid}")
        missing = RECORD_KEYS - rec.keys()
        if missing:
            err(f"{rid}: missing keys {sorted(missing)}")
        if rec.get("status") not in STATUSES:
            err(f"{rid}: bad status {rec.get('status')!r}")
        records[rid] = rec
    if set(records) != set(briefs):
        err(f"records/briefs mismatch: {sorted(set(briefs) ^ set(records))}")

    live_slugs = {briefs[r]["slug"] for r, rec in records.items() if rec.get("status") == "live"}
    allowed_internal = live_slugs | existing
    all_slugs = {b["slug"] for b in briefs.values()}

    per_day = Counter()
    for rid, rec in records.items():
        st = rec.get("status")
        for f in rec.get("qa_findings") or []:
            if f.get("result") not in QA_RESULTS:
                err(f"{rid}: qa_finding {f.get('check')!r} has bad result {f.get('result')!r}")
        if st == "held" and not rec.get("hold_reason"):
            err(f"{rid}: held without hold_reason")
        if st == "merged":
            tgt = rec.get("merged_into")
            if tgt not in briefs or tgt == rid:
                err(f"{rid}: merged without valid merged_into")
            if not rec.get("qa_findings"):
                err(f"{rid}: merged without evidence in qa_findings")
        if st not in {"ready", "live"}:
            continue

        # Shipped article checks
        for k in ("markdown", "metadata", "canonical_url", "publish_timestamp"):
            if not rec.get(k):
                err(f"{rid}: status {st} but {k} empty")
        if not rec.get("validated_external_urls"):
            warn(f"{rid}: no validated external URLs")
        if not rec.get("qa_findings"):
            err(f"{rid}: shipped without qa_findings")
        if any(f.get("result") == "fail" for f in rec.get("qa_findings") or []):
            err(f"{rid}: shipped with a failing QA check")
        ts = rec.get("publish_timestamp") or ""
        if ts:
            per_day[ts[:10]] += 1
        expected_url = base + briefs[rid]["slug"]
        if rec.get("canonical_url") and rec["canonical_url"] != expected_url:
            err(f"{rid}: canonical_url {rec['canonical_url']} != {expected_url}")

        md_path = ROOT / (rec.get("markdown") or "")
        if not rec.get("markdown") or not md_path.is_file():
            err(f"{rid}: markdown file {rec.get('markdown')!r} not found")
            continue
        text = md_path.read_text()
        fm, body = parse_front_matter(text)
        if fm is None:
            err(f"{rid}: missing front matter")
            continue
        if FRONT_KEYS - fm.keys():
            err(f"{rid}: front matter missing {sorted(FRONT_KEYS - fm.keys())}")
        if fm.get("id") != rid:
            err(f"{rid}: front matter id {fm.get('id')!r}")
        if fm.get("slug") != briefs[rid]["slug"]:
            err(f"{rid}: front matter slug {fm.get('slug')!r} != brief slug")
        if "REPLACE_" in text or "TODO" in text or "lorem ipsum" in text.lower():
            err(f"{rid}: placeholder text left in article")
        tl = len(fm.get("title", ""))
        if not 30 <= tl <= 70:
            warn(f"{rid}: SEO title length {tl}")
        ml = len(fm.get("meta_description", ""))
        if not 110 <= ml <= 170:
            warn(f"{rid}: meta description length {ml}")

        prose = strip_code(body)
        h1 = re.findall(r"^# \S", prose, flags=re.M)
        if len(h1) != 1:
            err(f"{rid}: expected exactly one H1, found {len(h1)}")
        if len(re.findall(r"^## \S", prose, flags=re.M)) < 3:
            err(f"{rid}: fewer than 3 H2 sections")

        words = len(re.findall(r"\b[\w'-]+\b", re.sub(r"\]\([^)]*\)", "]", prose)))
        lo, hi = (int(x) for x in briefs[rid]["target_length_words"].split("-"))
        if words < lo * 0.85 or words > hi * 1.25:
            err(f"{rid}: {words} words, brief range {lo}-{hi}")
        elif not lo <= words <= hi:
            warn(f"{rid}: {words} words, brief range {lo}-{hi}")

        validated_ext = set(rec.get("validated_external_urls") or [])
        for url in re.findall(r"\]\(([^)\s]+)", prose):
            if url.startswith("http"):
                if url.startswith(base):
                    path = url[len(base):]
                    if path in all_slugs and path not in allowed_internal:
                        err(f"{rid}: links to non-live campaign page {path}")
                elif url not in validated_ext:
                    err(f"{rid}: external link not in validated_external_urls: {url}")
            elif url.startswith("/"):
                norm = url.split("#")[0].rstrip("/") + "/"
                if norm not in allowed_internal:
                    err(f"{rid}: internal link to non-live/unknown page {url}")

    for day, n in per_day.items():
        if n > config.get("max_articles_per_run", 2):
            err(f"{n} articles published on {day} (cap {config.get('max_articles_per_run', 2)})")

    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    shipped = sum(r.get("status") in {"ready", "live"} for r in records.values())
    print(f"{len(records)} records, {shipped} shipped, {len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
