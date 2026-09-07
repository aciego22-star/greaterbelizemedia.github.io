#!/usr/bin/env python3
"""
places_search.py — shared Google Places (New) Text Search helpers.

Both modes of the prospecting tool use this:
  * prospect.py        — find businesses with NO website
  * belize_signals.py  — find businesses WITH websites that target Belize

The API key is always read from the GOOGLE_PLACES_API_KEY environment
variable by the calling script; it is never stored in this file.
"""

import re
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

MAX_PAGES = 5          # 5 pages x 20 results = at most 100 businesses per run
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
