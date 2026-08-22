#!/usr/bin/env python3
"""
prospect.py — find local businesses with NO website (sales prospects).

Data source: Google Places API (New), Text Search endpoint.

Usage:
    python3 prospect.py "Ocala, FL" "immigration attorney"

Requires the GOOGLE_PLACES_API_KEY environment variable to be set.
The key is never stored in this file.
"""

import argparse
import csv
import os
import re
import sys
import time

import requests

# The Text Search endpoint for Places API (New).
SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"

# Cost control: ask Google for ONLY these fields — nothing else.
# (nextPageToken is a response-level field needed for pagination;
# it is not place data and adds no billing cost.)
FIELD_MASK = ",".join([
    "places.displayName",
    "places.formattedAddress",
    "places.nationalPhoneNumber",
    "places.websiteUri",
    "nextPageToken",
])

MAX_PAGES = 3          # 3 pages x 20 results = at most 60 businesses per run
PAGE_TOKEN_DELAY = 2   # seconds to wait before using a nextPageToken


def fetch_places(api_key, query):
    """Call Text Search, following nextPageToken for up to MAX_PAGES pages.

    Returns a list of place dicts. If a later page fails, whatever was
    already collected is kept and returned.
    """
    places = []
    page_token = None

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": FIELD_MASK,
    }

    for page in range(1, MAX_PAGES + 1):
        body = {"textQuery": query, "pageSize": 20}
        if page_token:
            # Google wants a short pause before a page token is used.
            time.sleep(PAGE_TOKEN_DELAY)
            body["pageToken"] = page_token

        try:
            response = requests.post(SEARCH_URL, json=body, headers=headers, timeout=30)
        except requests.RequestException as exc:
            print(f"Network error while calling the Places API: {exc}")
            break  # keep whatever we already collected

        if not response.ok:
            # Google reports errors as {"error": {"message": ...}}.
            try:
                message = response.json()["error"]["message"]
            except (ValueError, KeyError):
                message = response.text
            print(f"Places API error (HTTP {response.status_code}): {message}")
            break

        data = response.json()
        page_places = data.get("places", [])
        places.extend(page_places)
        print(f"Page {page}: {len(page_places)} businesses")

        page_token = data.get("nextPageToken")
        if not page_token:
            break  # no more pages of results

    return places


def safe_filename_part(text):
    """Turn text like 'Ocala, FL' into 'Ocala_FL' so it is safe in a filename."""
    return re.sub(r"[^A-Za-z0-9]+", "_", text).strip("_")


def main():
    parser = argparse.ArgumentParser(
        description="Find local businesses with no website (sales prospects)."
    )
    parser.add_argument("city", help='City to search, e.g. "Ocala, FL"')
    parser.add_argument("vertical", help='Business type, e.g. "immigration attorney"')
    args = parser.parse_args()

    api_key = os.environ.get("GOOGLE_PLACES_API_KEY")
    if not api_key:
        print("GOOGLE_PLACES_API_KEY is not set.")
        print('Set it first, e.g.:  export GOOGLE_PLACES_API_KEY="your-key-here"')
        sys.exit(1)

    query = f"{args.vertical} in {args.city}"
    print(f'Searching Google Places for: "{query}" ...')

    places = fetch_places(api_key, query)
    if not places:
        print("No results — nothing to write.")
        sys.exit(1)

    # A business is a prospect when its websiteUri is missing or empty.
    prospects = [p for p in places if not p.get("websiteUri")]

    out_name = (
        f"prospects_{safe_filename_part(args.city)}_"
        f"{safe_filename_part(args.vertical)}.csv"
    )
    with open(out_name, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Business Name", "Address", "Phone", "Vertical", "City"])
        for place in prospects:
            writer.writerow([
                place.get("displayName", {}).get("text", ""),
                place.get("formattedAddress", ""),
                place.get("nationalPhoneNumber", ""),  # may be absent -> blank
                args.vertical,
                args.city,
            ])

    total = len(places)
    count = len(prospects)
    print()
    print(f"Total businesses found:  {total}")
    print(f"No website (prospects):  {count}")
    print(f"Percentage with no site: {100 * count / total:.1f}%")
    print(f"Prospects saved to:      {out_name}")


if __name__ == "__main__":
    main()
