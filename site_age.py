#!/usr/bin/env python3
"""
site_age.py — mode 3 of the prospecting tool.

Finds businesses whose website looks like it was built before 2020, so they
can be approached about a rebuild.

Usage:
    python3 site_age.py "Belize City, Belize" "hotel"
    python3 site_age.py --input candidates_belize_all.csv --output site_age_belize.csv
    python3 site_age.py --self-test          # offline check of the logic

Input is the candidates_{city}_{category}.csv written by
belize_signals.py --stage discover, so discovery is shared between modes.

Two kinds of evidence are combined:

  1. The Internet Archive — when the site was first and last captured, and
     whether today's homepage still matches its 2019 capture.
  2. The live homepage itself — design and tooling choices that date it
     (no mobile viewport, Flash, an old copyright year, dead analytics...).

An old first-capture date only proves the DOMAIN is old, not that the
current site is. The verdict therefore leans on the live-page signals and
uses the archive dates as corroboration.

Only public pages are read. robots.txt is respected, requests are spaced
out, social media is skipped, and nothing is ever submitted or sent.
"""

import argparse
import csv
import difflib
import os
import re
import sys
import time

import requests

from places_search import safe_filename_part
from web_fetch import (
    REQUEST_TIMEOUT, USER_AGENT, RobotsCache, fetch_html, is_social_media,
    normalize_url, page_text,
)

CDX_URL = "https://web.archive.org/cdx/search/cdx"
SNAPSHOT_URL = "https://web.archive.org/web/{stamp}id_/{url}"
ARCHIVE_DELAY = 2.0      # the Internet Archive is a free service — go gently
CUTOFF_YEAR = 2020       # "built before 2020"
SIMILARITY_MATCH = 0.80  # how alike two pages must be to count as unchanged


# ---------------------------------------------------------------------------
# Pure helpers (no network, so the self-test can cover them)
# ---------------------------------------------------------------------------

COPYRIGHT_RE = re.compile(
    r"(?:©|&copy;|\(c\)|copyright)[^0-9]{0,25}"
    r"((?:19|20)\d{2})(?:\s*[-–—]\s*((?:19|20)\d{2}))?", re.I)


def extract_copyright_year(text):
    """Latest year stated in a copyright line, or None.

    The newest year wins: a footer reading "2015-2024" means the site was
    touched in 2024, which counts in the owner's favour.
    """
    years = []
    for match in COPYRIGHT_RE.finditer(text):
        years.append(int(match.group(2) or match.group(1)))
    return max(years) if years else None


GENERATOR_RE = re.compile(
    r"<meta[^>]+name=[\"']generator[\"'][^>]+content=[\"']([^\"']+)", re.I)
# Tools and versions that place a build firmly in the past.
DATED_GENERATORS = re.compile(
    r"wordpress\s*[1-4]\.|joomla!?\s*[123]\.|drupal\s*[1-7]\b|frontpage|"
    r"dreamweaver|adobe\s*muse|golive|microsoft\s*word|netobjects|"
    r"rapidweaver\s*[1-6]\.", re.I)
JQUERY_RE = re.compile(r"jquery[^\"'>]*?[/-](\d+)\.(\d+)[\d.]*(?:\.min)?\.js", re.I)


def analyze_html(html, final_url):
    """Read dating signals out of one homepage."""
    text = re.sub(r"<[^>]+>", " ", html)
    generator = ""
    match = GENERATOR_RE.search(html)
    if match:
        generator = match.group(1).strip()[:60]

    jquery_major = None
    jq = JQUERY_RE.search(html)
    if jq:
        jquery_major = int(jq.group(1))

    return {
        "has_viewport": bool(re.search(r"name=[\"']viewport[\"']", html, re.I)),
        "flash": bool(re.search(r"\.swf\b|shockwave-flash", html, re.I)),
        "legacy_tags": bool(re.search(r"<(?:font|center|marquee|frameset)\b|bgcolor=",
                                      html, re.I)),
        "copyright_year": extract_copyright_year(text),
        "ua_analytics": bool(re.search(r"\bUA-\d{4,}-\d+", html)),
        "generator": generator,
        "dated_generator": bool(generator and DATED_GENERATORS.search(generator)),
        "jquery_major": jquery_major,
        "ie_compat": bool(re.search(r"X-UA-Compatible", html, re.I)),
        "https": final_url.lower().startswith("https://"),
    }


def score_site(signals, first_year, unchanged):
    """Turn the signals into a score, a verdict and readable evidence."""
    score, evidence = 0, []

    def add(points, note):
        nonlocal score
        score += points
        evidence.append(note)

    if not signals["has_viewport"]:
        add(3, "no mobile viewport tag (not responsive)")
    if signals["flash"]:
        add(3, "Flash content (Flash died end of 2020)")
    if signals["legacy_tags"]:
        add(3, "1990s/2000s HTML tags")
    year = signals["copyright_year"]
    if year is not None:
        if year < CUTOFF_YEAR:
            add(3, f"copyright {year}")
        elif year <= 2022:
            add(1, f"copyright {year}")
    if signals["ua_analytics"]:
        add(2, "Universal Analytics UA- tag (shut down July 2023)")
    if signals["dated_generator"]:
        add(2, f"dated builder: {signals['generator']}")
    if signals["jquery_major"] == 1:
        add(2, "jQuery 1.x")
    elif signals["jquery_major"] == 2:
        add(1, "jQuery 2.x")
    if signals["ie_compat"]:
        add(1, "Internet Explorer compatibility tag")
    if not signals["https"]:
        add(2, "no HTTPS")
    if first_year and first_year < CUTOFF_YEAR:
        add(2, f"first archived {first_year}")
    if unchanged == "yes":
        add(3, "homepage unchanged since its 2019 capture")

    if score >= 6:
        verdict = "likely pre-2020 build"
    elif score >= 3:
        verdict = "possibly dated"
    else:
        verdict = "modern"
    return score, verdict, "; ".join(evidence)


def parse_cdx(payload):
    """First timestamp from a CDX JSON response, or None."""
    try:
        rows = payload if isinstance(payload, list) else []
    except Exception:
        return None
    if len(rows) < 2:
        return None
    for row in rows[1:]:
        if row and re.fullmatch(r"\d{14}", str(row[0])):
            return str(row[0])
    return None


def similarity(a, b):
    """Rough closeness of two page texts, 0.0 to 1.0."""
    clean = lambda s: re.sub(r"\s+", " ", s or "").strip().lower()[:3000]
    return difflib.SequenceMatcher(None, clean(a), clean(b)).ratio()


def page_title(html):
    match = re.search(r"<title[^>]*>(.*?)</title>", html or "", re.I | re.S)
    return re.sub(r"\s+", " ", match.group(1)).strip()[:200] if match else ""


# ---------------------------------------------------------------------------
# Network
# ---------------------------------------------------------------------------

def archive_dates(session, url):
    """(first_year, last_year, error) from the Internet Archive."""
    target = normalize_url(url)
    params = {"url": target, "output": "json", "fl": "timestamp",
              "filter": "statuscode:200", "limit": "1"}
    try:
        first = session.get(CDX_URL, params=params, timeout=REQUEST_TIMEOUT)
        time.sleep(ARCHIVE_DELAY)
        params["limit"] = "-1"
        last = session.get(CDX_URL, params=params, timeout=REQUEST_TIMEOUT)
        time.sleep(ARCHIVE_DELAY)
    except requests.RequestException as exc:
        return None, None, f"archive unreachable ({type(exc).__name__})"
    try:
        first_ts = parse_cdx(first.json())
        last_ts = parse_cdx(last.json())
    except ValueError:
        return None, None, "archive returned no usable data"
    return (int(first_ts[:4]) if first_ts else None,
            int(last_ts[:4]) if last_ts else None, "")


def unchanged_since_2019(session, url, live_html):
    """'yes' / 'no' / '' — is today's homepage still the 2019 one?"""
    if not live_html:
        return ""
    try:
        response = session.get(
            SNAPSHOT_URL.format(stamp="20191231000000", url=url),
            timeout=REQUEST_TIMEOUT, allow_redirects=True)
        time.sleep(ARCHIVE_DELAY)
    except requests.RequestException:
        return ""
    if response.status_code != 200 or not response.text:
        return ""
    old_html = response.text
    if page_title(old_html) and page_title(old_html) == page_title(live_html):
        return "yes"
    try:
        ratio = similarity(page_text(old_html), page_text(live_html))
    except Exception:
        return ""
    return "yes" if ratio >= SIMILARITY_MATCH else "no"


OUTPUT_HEADER = ["Business Name", "Address", "Phone", "Website", "City",
                 "Category", "First Archived", "Last Archived",
                 "Unchanged Since 2019", "Mobile Friendly", "Copyright Year",
                 "Generator/Platform", "Staleness Score", "Verdict", "Evidence"]


def run(rows, out_name):
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})
    robots = RobotsCache(session)
    cache, tally = {}, {}

    with open(out_name, "w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(OUTPUT_HEADER)

        for index, row in enumerate(rows, start=1):
            website = row.get("Website", "")
            key = normalize_url(website)
            print(f"[{index}/{len(rows)}] {row.get('Business Name','')} — {website}")

            if key in cache:
                result = cache[key]
                print("    (same website as an earlier row — reusing result)")
            else:
                result = inspect_site(session, robots, website)
                cache[key] = result
                if result["verdict"] != "not checked":
                    print(f"    {result['verdict']} (score {result['score']})")

            tally[result["verdict"]] = tally.get(result["verdict"], 0) + 1
            writer.writerow([
                row.get("Business Name", ""), row.get("Address", ""),
                row.get("Phone", ""), website, row.get("City", ""),
                row.get("Category", ""), result["first"], result["last"],
                result["unchanged"], result["mobile"], result["copyright"],
                result["generator"], result["score"], result["verdict"],
                result["evidence"],
            ])

    print()
    for verdict, count in sorted(tally.items(), key=lambda kv: -kv[1]):
        print(f"{verdict:<24} {count}")
    print(f"Saved to: {out_name}")


def inspect_site(session, robots, website):
    """Everything we can learn about one website."""
    blank = {"first": "", "last": "", "unchanged": "", "mobile": "",
             "copyright": "", "generator": "", "score": "", "verdict": "not checked"}
    if not website:
        return {**blank, "evidence": "[not checked: no website]"}
    if is_social_media(website):
        return {**blank, "evidence": "[not checked: social media profile]"}
    if not robots.may_fetch(website):
        return {**blank, "evidence": "[not checked: robots.txt disallowed]"}

    live_html = fetch_html(session, website)
    first, last, archive_error = archive_dates(session, website)

    if live_html is None:
        note = archive_error or "homepage unreachable"
        return {**blank, "first": first or "", "last": last or "",
                "evidence": f"[not checked: {note}]"}

    unchanged = "" if archive_error else unchanged_since_2019(session, website, live_html)
    signals = analyze_html(live_html, website)
    score, verdict, evidence = score_site(signals, first, unchanged)
    if archive_error:
        evidence = (evidence + "; " if evidence else "") + f"[{archive_error}]"
    return {
        "first": first or "", "last": last or "", "unchanged": unchanged,
        "mobile": "yes" if signals["has_viewport"] else "no",
        "copyright": signals["copyright_year"] or "",
        "generator": signals["generator"], "score": score,
        "verdict": verdict, "evidence": evidence,
    }


# ---------------------------------------------------------------------------

def self_test():
    failures = []

    def check(name, condition, detail=""):
        print(f"  {'PASS' if condition else 'FAIL'}  {name}" + ("" if condition else f" {detail}"))
        if not condition:
            failures.append(name)

    print("Site age self-test")

    old_page = """<html><head><title>Sunrise Lodge</title>
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="generator" content="WordPress 4.9.8">
      <script src="/js/jquery-1.11.3.min.js"></script>
      <script>ga('create','UA-12345678-1','auto');</script></head>
      <body bgcolor="#ffffff"><center><font size="2">Welcome</font></center>
      <p>&copy; 2016 Sunrise Lodge</p></body></html>"""
    sig = analyze_html(old_page, "http://sunrise.bz/")
    score, verdict, evidence = score_site(sig, 2011, "")
    check("dated page scores high", score >= 6, f"score={score}")
    check("dated page verdict", verdict == "likely pre-2020 build", verdict)
    check("no viewport detected", sig["has_viewport"] is False)
    check("copyright year read", sig["copyright_year"] == 2016, str(sig["copyright_year"]))
    check("UA- analytics detected", sig["ua_analytics"])
    check("jQuery 1.x detected", sig["jquery_major"] == 1, str(sig["jquery_major"]))
    check("dated builder detected", sig["dated_generator"], sig["generator"])
    check("evidence is readable", "no mobile viewport tag" in evidence, evidence)

    modern = """<html><head><title>Reef Co</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script src="https://cdn/gtag/js?id=G-ABC123"></script></head>
      <body><p>&copy; 2026 Reef Co</p></body></html>"""
    sig = analyze_html(modern, "https://reef.bz/")
    score, verdict, _ = score_site(sig, 2021, "")
    check("modern page scores zero", score == 0, f"score={score}")
    check("modern page verdict", verdict == "modern", verdict)

    # A recently-updated page on an old domain must not be called pre-2020.
    sig = analyze_html(modern, "https://reef.bz/")
    score, verdict, _ = score_site(sig, 2003, "")
    check("old domain alone is not enough", verdict != "likely pre-2020 build",
          f"{verdict} score={score}")

    check("copyright range takes the later year",
          extract_copyright_year("&copy; 2015-2019 Someone") == 2019)
    check("newest copyright year wins",
          extract_copyright_year("© 2014 ... © 2025") == 2025)
    check("no copyright line returns None",
          extract_copyright_year("no year here") is None)

    check("CDX response parsed",
          parse_cdx([["timestamp"], ["20081002123456"]]) == "20081002123456")
    check("empty CDX response handled", parse_cdx([["timestamp"]]) is None)

    check("identical pages look unchanged", similarity("hello world", "hello world") == 1.0)
    check("different pages do not", similarity("hello world", "totally other text") < 0.8)
    check("title extracted", page_title("<title> Sunrise  Lodge </title>") == "Sunrise Lodge")

    check("unchanged-since-2019 adds weight",
          score_site(analyze_html(modern, "https://reef.bz/"), 2015, "yes")[0] > 0)

    print()
    if failures:
        print(f"{len(failures)} check(s) FAILED: {', '.join(failures)}")
        sys.exit(1)
    print("All checks passed.")


def main():
    parser = argparse.ArgumentParser(
        description="Flag business websites that look like pre-2020 builds.")
    parser.add_argument("city", nargs="?", help='e.g. "Belize City, Belize"')
    parser.add_argument("category", nargs="?", help='e.g. "hotel"')
    parser.add_argument("--input", help="a candidates CSV to read instead")
    parser.add_argument("--output", help="where to write the results")
    parser.add_argument("--self-test", action="store_true",
                        help="check the logic offline and exit")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return

    if args.input:
        path = args.input
        out_name = args.output or f"site_age_{os.path.basename(path)}"
    elif args.city and args.category:
        path = (f"candidates_{safe_filename_part(args.city)}_"
                f"{safe_filename_part(args.category)}.csv")
        out_name = args.output or (f"site_age_{safe_filename_part(args.city)}_"
                                   f"{safe_filename_part(args.category)}.csv")
    else:
        parser.error("give a city and category, or --input (or use --self-test)")

    if not os.path.exists(path):
        print(f"No such file: {path}\nRun belize_signals.py --stage discover first.")
        sys.exit(1)
    with open(path, newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    if not rows:
        print(f"{path} is empty.")
        return
    print(f"Checking {len(rows)} businesses from {path} ...")
    run(rows, out_name)


if __name__ == "__main__":
    main()
