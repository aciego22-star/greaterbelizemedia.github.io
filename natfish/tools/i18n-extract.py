#!/usr/bin/env python3
"""Collect every translatable string from the built pages.

Strings are keyed by their own English text, which is what the runtime looks
up, so extraction and translation can never drift apart. Run after generating
the pages and before writing natfish-strings.js.

    python3 tools/i18n-extract.py            # list strings
    python3 tools/i18n-extract.py --missing  # only those with no Spanish yet
"""
import pathlib
import re
import sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = sorted(p for p in ROOT.glob("*.html") if p.name != "natfish-preview.html")

SKIP_TAGS = {"script", "style", "noscript"}
ATTRS = ("alt", "aria-label", "title", "placeholder")

# Names, addresses and machine values are the same in both languages. The legal
# name stays English in Spanish too, and so do the Linnaean species names.
LEAVE_ALONE = re.compile(
    r"^(NATFISH|Austere Automations|Belize|Belize City|2026|"
    r"nationalfishermen@gmail\.com|deniseobrien125@gmail\.com|"
    r"\+501 227-3165|\+501 227-8039|\+501 611-4831|"
    r"#1 Angel Lane, Belize City, Belize|"
    r"National Fishermen Producers Cooperative Society Ltd\.?|"
    r"Panulirus argus|Strombus gigas|Pterois volitans|"
    r"English|Espanol|[\d\s.,:/|·&-]*)$"
)


def translatable(text):
    text = " ".join(text.split())
    if not text or LEAVE_ALONE.match(text):
        return None
    if not re.search(r"[A-Za-z]{2}", text):
        return None
    return text


class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.found = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in SKIP_TAGS:
            self.skip += 1
        for name, value in attrs:
            if name in ATTRS and value:
                t = translatable(value)
                if t:
                    self.found.append(t)

    def handle_endtag(self, tag):
        if tag in SKIP_TAGS and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if self.skip:
            return
        t = translatable(data)
        if t:
            self.found.append(t)


def collect():
    seen = {}
    for page in PAGES:
        c = Collector()
        c.feed(page.read_text(encoding="utf-8"))
        for s in c.found:
            seen.setdefault(s, []).append(page.name)
    return seen


def main():
    strings = collect()

    try:
        sys.path.insert(0, str(ROOT / "tools"))
        from natfish_es import ES
    except ImportError:
        ES = {}

    missing = [s for s in strings if s not in ES]
    only_missing = "--missing" in sys.argv

    for s in sorted(strings, key=lambda x: (-len(x), x)):
        if only_missing and s in ES:
            continue
        print(repr(s) + ": ,")

    print(f"\n# {len(strings)} strings, {len(missing)} without Spanish",
          file=sys.stderr)


if __name__ == "__main__":
    main()
