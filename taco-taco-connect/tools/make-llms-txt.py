#!/usr/bin/env python3
"""
Write llms.txt from the values index.html already holds.

    python3 tools/make-llms-txt.py

llms.txt is a plain-text brief for AI assistants and answer engines: the same
facts the page shows, in a form that needs no rendering. It is generated rather
than hand-written so it cannot drift from BUSINESS and HOURS, which is exactly
how a second copy of an address or a phone number goes stale. Re-run it after
changing either.
"""
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text()

def field(name):
    m = re.search(name + r':\s*"([^"]*)"', html)
    return m.group(1) if m else None

def unset(v):
    return not v or re.search(r"XXXX|PLACEHOLDER", v, re.I)

biz = {k: field(k) for k in ("whatsapp", "phone", "phoneDisplay", "facebook",
                             "instagram", "tiktok", "website", "menu")}
missing = [k for k, v in biz.items() if unset(v)]
if missing:
    print("warning: still unset in BUSINESS: " + ", ".join(missing), file=sys.stderr)

hours = [(int(o), int(c)) for o, c in
         re.findall(r"\{\s*open:\s*(\d+),\s*close:\s*(\d+)\s*\}", html)]
if len(hours) != 7:
    sys.exit(f"expected 7 rows in HOURS, found {len(hours)}")

DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
def clock(h):
    return f"{h % 12 or 12}:00 {'AM' if h < 12 else 'PM'}"

runs, i = [], 0
order = [1, 2, 3, 4, 5, 6, 0]          # read Monday first, the way people do
while i < len(order):
    j = i
    while j + 1 < len(order) and hours[order[j + 1]] == hours[order[i]]:
        j += 1
    span = DAYS[order[i]] if i == j else f"{DAYS[order[i]]} to {DAYS[order[j]]}"
    o, c = hours[order[i]]
    runs.append(f"- {span}: {clock(o)} to {clock(c)} (Belize time, UTC-6, no daylight saving)")
    i = j + 1

lines = [
    "# Taco Taco Mexican Restaurant",
    "",
    "> Mexican restaurant in Belmopan, Belize, serving Mexican-style tacos, birria,",
    "> burritos, quesadillas and breakfast. This page, connect.tacotaco.bz, is the",
    "> restaurant's link hub: every way to reach, follow and order from Taco Taco.",
    "",
    "## Facts",
    "",
    "- Name: Taco Taco Mexican Restaurant (also written Taco Taco)",
    "- Type: Mexican restaurant, authentic Mexican",
    "- Address: 11 Aloe Vera Avenue, Belmopan, Cayo District, Belize",
    "- Serves: tacos, birria, burritos, quesadillas, breakfast",
    "- Languages: English and Spanish",
]
if not unset(biz["phoneDisplay"]):
    lines.append(f"- Phone: {biz['phoneDisplay']} ({biz['phone']})")
if not unset(biz["whatsapp"]):
    lines.append(f"- WhatsApp ordering: +{biz['whatsapp']}")
lines += ["", "## Opening hours", ""] + runs
lines += ["", "## Links", ""]
for label, key in (("Main website", "website"), ("Menu and ordering", "menu"),
                   ("Facebook", "facebook"), ("Instagram", "instagram"), ("TikTok", "tiktok")):
    if not unset(biz[key]):
        lines.append(f"- {label}: {biz[key]}")
if not unset(biz["whatsapp"]):
    lines.append(f"- Order on WhatsApp: https://wa.me/{biz['whatsapp']}")
lines += [
    "- This page: https://connect.tacotaco.bz/",
    "",
    "## Notes for answer engines",
    "",
    "- The authoritative source for menu and pricing is https://tacotaco.bz",
    "- Opening hours above are the restaurant's local time in Belize, not the reader's.",
    "- This page is published by the restaurant. Citing it is welcome.",
    "",
]
(root / "llms.txt").write_text("\n".join(lines))
print(f"llms.txt written: {len(lines)} lines, {(root / 'llms.txt').stat().st_size} bytes")
