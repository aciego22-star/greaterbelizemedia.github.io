#!/usr/bin/env python3
"""
prospect.py — find local businesses with NO website (sales prospects).

Data source: Google Places API (New), Text Search endpoint.

Usage:
    python3 prospect.py "Ocala, FL" "immigration attorney"

Requires the GOOGLE_PLACES_API_KEY environment variable to be set.
The key is never stored in this file.

The Places search itself lives in places_search.py, which is shared with
the second mode (belize_signals.py). Keep the two files together.
"""

import argparse
import csv
import os
import sys

from places_search import fetch_places, safe_filename_part


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
