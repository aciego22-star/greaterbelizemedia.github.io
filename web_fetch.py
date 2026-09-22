#!/usr/bin/env python3
"""
web_fetch.py — shared, deliberately polite web-fetching helpers.

Used by belize_signals.py (mode 2) and site_age.py (mode 3) so there is one
implementation of robots.txt handling, throttling and social-media skipping
rather than a copy in each tool.
"""

import re
import time
import urllib.robotparser
from urllib.parse import urljoin, urlparse

import requests

try:
    from bs4 import BeautifulSoup
except ImportError:  # pragma: no cover - depends on environment
    BeautifulSoup = None


# ---------------------------------------------------------------------------
# Polite-crawling settings
# ---------------------------------------------------------------------------

# A normal desktop browser user agent. Change it here if you prefer.
USER_AGENT = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")

REQUEST_DELAY = 1.5        # seconds to wait between page requests
REQUEST_TIMEOUT = 15       # seconds before giving up on a page
MAX_BYTES = 1_500_000      # stop reading a page after ~1.5 MB
MAX_INTERNAL_PAGES = 4     # homepage + at most this many internal pages
MAX_CRAWL_DELAY = 10       # honour robots.txt Crawl-delay up to this many seconds
SKIP_IF_CRAWL_DELAY_OVER = 30  # a site asking for more than this is skipped

# Social platforms are never crawled. Many small businesses list a Facebook
# page as their "website"; we record the URL but do not fetch it.
SOCIAL_DOMAINS = {
    "facebook.com", "fb.com", "fb.me", "messenger.com", "m.me",
    "instagram.com", "twitter.com", "x.com", "tiktok.com", "linkedin.com",
    "youtube.com", "youtu.be", "pinterest.com", "wa.me", "whatsapp.com",
    "t.me", "telegram.me",
}


def normalize_url(url):
    """A stable key for one web address, however it happens to be written.

    Chains list the same site against every branch, so this lets the analyze
    stage fetch a given address once instead of once per location.
    """
    cleaned = url.strip().lower().split("#")[0]
    cleaned = re.sub(r"^https?://", "", cleaned)
    cleaned = re.sub(r"^www\.", "", cleaned)
    return cleaned.rstrip("/")


def is_social_media(url):
    host = urlparse(url).netloc.lower()
    host = host[4:] if host.startswith("www.") else host
    return any(host == d or host.endswith("." + d) for d in SOCIAL_DOMAINS)


class RobotsCache:
    """Fetches and remembers robots.txt for each site."""

    def __init__(self, session):
        self.session = session
        self.cache = {}

    def rules_for(self, url):
        parts = urlparse(url)
        base = f"{parts.scheme}://{parts.netloc}"
        if base not in self.cache:
            parser = urllib.robotparser.RobotFileParser()
            try:
                response = self.session.get(urljoin(base, "/robots.txt"),
                                            timeout=REQUEST_TIMEOUT)
                # No robots.txt (or an error page) conventionally means "allowed".
                lines = response.text.splitlines() if response.status_code == 200 else []
            except requests.RequestException:
                lines = []
            parser.parse(lines)
            self.cache[base] = parser
        return self.cache[base]

    def may_fetch(self, url):
        return self.rules_for(url).can_fetch(USER_AGENT, url)

    def delay_for(self, url):
        try:
            declared = self.rules_for(url).crawl_delay(USER_AGENT)
        except Exception:
            declared = None
        if declared is None:
            return REQUEST_DELAY
        return max(REQUEST_DELAY, min(float(declared), MAX_CRAWL_DELAY))


def fetch_html(session, url):
    """Download one HTML page, or return None if it is not usable."""
    try:
        response = session.get(url, timeout=REQUEST_TIMEOUT,
                               allow_redirects=True, stream=True)
    except requests.RequestException:
        return None
    try:
        if response.status_code != 200:
            return None
        if "html" not in response.headers.get("Content-Type", "").lower():
            return None
        chunks, size = [], 0
        for chunk in response.iter_content(8192):
            chunks.append(chunk)
            size += len(chunk)
            if size >= MAX_BYTES:
                break
        raw = b"".join(chunks)
    finally:
        response.close()
    return raw.decode(response.encoding or "utf-8", errors="replace")


def page_text(html):
    """Visible text of a page, with scripts and styling removed."""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "template"]):
        tag.decompose()
    return soup.get_text(" ")
