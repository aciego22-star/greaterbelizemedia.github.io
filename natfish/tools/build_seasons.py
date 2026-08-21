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

# open_from / open_to are month-day. A pair where open_from is later in the year
# than open_to wraps across the new year (lobster, conch, stone crab).
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
    {
        "key": "grouper",
        "icon": "steward",
        "name": "Nassau Grouper",
        "open_from": "04-01",
        "open_to": "11-30",
        "open_label": "1 April to 30 November",
        "closed_label": "1 December to 31 March",
        "facts": [("Legal size range", "20 to 30 inches")],
        "note": None,
    },
    {
        "key": "whelk",
        "icon": "crate-fish",
        "name": "Whelks",
        "open_from": "10-01",
        "open_to": "12-31",
        "open_label": "1 October to 31 December",
        "closed_label": "1 January to 30 September",
        "facts": [("Licence", "A special licence is required to fish whelks.")],
        "note": None,
    },
    {
        "key": "stonecrab",
        "icon": "handling",
        "name": "Florida Stone Crab",
        "open_from": "10-01",
        "open_to": "06-30",
        "open_label": "1 October to 30 June",
        "closed_label": "1 July to 30 September",
        "facts": [("Licence", "A special licence is required to fish and to export stone crab.")],
        "note": None,
    },
    {
        "key": "shrimp",
        "icon": "net",
        "name": "Shrimp",
        "no_season": True,
        "facts": [],
        "note": None,
    },
]

SHRIMP_COPY = (
    "Belize's shrimp industry is primarily aquaculture-based. Harvesting and "
    "availability may therefore depend on production and supplier schedules "
    "rather than the same national calendar used for lobster and conch. "
    "Contact NATFISH to confirm current availability and sourcing."
)

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

    if s.get("no_season"):
        # No statutory shrimp season exists, so none is invented.
        return f"""<article class="season-card season-card--note reveal">
          <div class="season-card__head">
            <span class="season-card__icon">{icon(s['icon'])}</span>
            <h3>{s['name']}</h3>
          </div>
          <p class="season-status season-status--varies">Availability varies</p>
          <p class="season-card__body">{SHRIMP_COPY}</p>
        </article>"""

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
