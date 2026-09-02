#!/usr/bin/env python3
"""The Seafood Seasons page.

This is a plain-language summary of standing Belize fisheries regulation. It is
NOT a NATFISH product catalogue, and every string is written so that a
regulatory open season can never be read as a stock statement. The permitted
status wording is fixed in SEASON_STATUS below and in natfish-seasons.js.
"""
from build_icons import icon

FISHERIES_SOURCE = "https://fisheries.gov.bz/regulations/"
LAST_REVIEW = "18 August 2026"

# Lobster and conch only. Nassau grouper, whelks, Florida stone crab and shrimp
# were removed at the client's instruction: NATFISH does not buy them from its
# fishers and cannot sell them, so listing their seasons here invited enquiries
# the co-operative cannot answer.
#
# open_from / open_to are month-day. A pair where open_from is later in the year
# than open_to wraps across the new year, as both of these do.
SEASONS = [
    {
        "key": "lobster",
        "icon": "lobster",
        "name": "Caribbean Spiny Lobster",
        "open_from": "07-01",
        "open_to": "02-29",
        "open_label": "1 July to 28 February (29 February in a leap year)",
        "closed_label": "1 March to 30 June",
        "facts": [
            ("Minimum carapace length", "3 inches"),
            ("Minimum tail weight", "4 ounces"),
        ],
        "note": None,
    },
    {
        "key": "conch",
        "icon": "conch",
        "name": "Queen Conch",
        "open_from": "10-01",
        "open_to": "06-30",
        "open_label": "1 October to 30 June",
        "closed_label": "1 July to 30 September",
        "quota": True,
        "facts": [
            ("Minimum shell length", "7 inches"),
            ("Minimum market-clean weight", "3 ounces"),
            ("Minimum fillet weight", "2.75 ounces"),
        ],
        "note": "The season may close earlier than the date shown when the national catch quota is reached.",
    },
]

PAGE_NOTE = (
    "Season dates summarise standing Belize Fisheries regulations and may "
    "change through quota closures or official management notices. A regulatory "
    "open season does not guarantee NATFISH product availability. Please "
    "contact NATFISH before making purchasing arrangements."
)


def season_card(s):
    facts = "\n            ".join(
        f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in s["facts"]
    )

    quota = ' data-season-quota="true"' if s.get("quota") else ""
    note = (
        f'<p class="season-card__note">{s["note"]}</p>' if s.get("note") else ""
    )
    return f"""<article class="season-card reveal" data-season
                 data-open-from="{s['open_from']}" data-open-to="{s['open_to']}"{quota}>
          <div class="season-card__head">
            <span class="season-card__icon">{icon(s['icon'])}</span>
            <h3>{s['name']}</h3>
          </div>
          <p class="season-status" data-season-status>Contact NATFISH for availability</p>
          <p class="season-card__contact">Contact NATFISH for availability</p>
          <dl class="season-facts">
            <div><dt>Standard open season</dt><dd>{s['open_label']}</dd></div>
            <div><dt>Closed season</dt><dd>{s['closed_label']}</dd></div>
            {facts}
          </dl>
          {note}
        </article>"""


def cards():
    return "\n          ".join(season_card(s) for s in SEASONS)
