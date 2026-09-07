#!/usr/bin/env python3
"""
belize_signals.py — mode 2 of the prospecting tool.

Opposite logic to prospect.py: find businesses that DO have a website and
that show evidence of targeting Belizean customers, so a sales team can
qualify and contact them manually.

Usage:
    python3 belize_signals.py "Chetumal, Quintana Roo, Mexico" "hospital"
    python3 belize_signals.py "Cancun, Quintana Roo, Mexico" "hotel" --stage discover
    python3 belize_signals.py --self-test        # offline check of the logic

Two stages:
    discover  — Google Places search -> candidates_{city}_{category}.csv
                (businesses that have a website). Needs GOOGLE_PLACES_API_KEY.
    analyze   — read that CSV, visit each website, look for Belize signals
                and a published contact email -> belize_signals_{city}_{category}.csv
    both      — discover then analyze (the default)

This tool only READS public web pages. It never sends email, never posts
anything, respects robots.txt, pauses between requests, and never touches
social media platforms.
"""

import argparse
import csv
import os
import re
import sys
import time
import unicodedata
import urllib.robotparser
from collections import namedtuple
from urllib.parse import urljoin, urlparse

import requests

from places_search import fetch_places, safe_filename_part

# BeautifulSoup is only needed for the analyze stage, so a missing install
# should not stop someone from running discovery.
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


# ---------------------------------------------------------------------------
# Belize-targeting signals
# ---------------------------------------------------------------------------

# Ordered strongest evidence first — that order is used when reporting.
# Patterns run against accent-stripped lowercase text, so "Beliceño"
# is matched by "beliceno".
KEYWORD_PATTERNS = [
    ("Belize City", r"\bbelize city\b"),
    ("Orange Walk", r"\borange walk\b"),
    ("+501 (Belize phone code)", r"\+\s?501[\s\-.)]?\d"),
    ("Belizean/Beliceño", r"\bbelize(?:an|ans)\b|\bbelice[nñ][oa]s?\b"),
    ("Belize", r"\bbelize\b"),
    ("Belice", r"\bbelice\b"),
    ("Corozal", r"\bcorozal\b"),
]

# Used to tell Spanish pages from English ones without any AI call.
# Deliberately words that belong to one language only.
ES_STOPWORDS = {
    "de", "la", "el", "los", "las", "del", "que", "en", "para", "con", "por",
    "una", "unos", "unas", "es", "son", "su", "sus", "como", "mas", "pero",
    "este", "esta", "estos", "estas", "nuestro", "nuestra", "nuestros",
    "nuestras", "servicios", "todos", "muy", "tambien", "donde", "cuando",
    "desde", "hasta", "sobre", "somos", "tiene", "puede", "atencion", "salud",
}
EN_STOPWORDS = {
    "the", "and", "of", "to", "in", "for", "with", "our", "we", "you", "your",
    "is", "are", "this", "that", "from", "have", "has", "will", "can", "about",
    "more", "all", "been", "they", "their", "what", "which", "when", "where",
    "how", "at", "by", "on", "as", "an", "be", "or", "but", "if", "please",
}
MIN_TOKENS_FOR_LANGUAGE = 120   # ignore near-empty pages when judging language
LANGUAGE_MARGIN = 1.5           # one language must beat the other by this much

Page = namedtuple("Page", "url html text")


# ---------------------------------------------------------------------------
# Text helpers
# ---------------------------------------------------------------------------

def normalize_keep_length(text):
    """Lowercase and strip accents WITHOUT changing the string's length.

    Keeping the length identical means a match found in the normalized text
    has the same position in the original, so evidence snippets can be cut
    from the original (accents and capitals intact).
    """
    out = []
    for ch in text:
        decomposed = unicodedata.normalize("NFKD", ch)
        base = "".join(c for c in decomposed if not unicodedata.combining(c))
        base = base or ch          # a lone combining mark decomposes to nothing
        lowered = base.lower()
        out.append(lowered[0])     # first char keeps the 1-to-1 length mapping
    return "".join(out)


def make_snippet(text, start, end, width=70):
    """Return ~160 characters of context around a match, on one line."""
    left = max(0, start - width)
    right = min(len(text), end + width)
    body = re.sub(r"\s+", " ", text[left:right]).strip()
    return ("..." if left > 0 else "") + body + ("..." if right < len(text) else "")


def language_of(text):
    """Very simple rule-based language guess: 'es', 'en' or 'unknown'."""
    tokens = re.findall(r"[a-z]+", normalize_keep_length(text))
    if len(tokens) < MIN_TOKENS_FOR_LANGUAGE:
        return "unknown"
    total = len(tokens)
    es = sum(1 for t in tokens if t in ES_STOPWORDS) / total
    en = sum(1 for t in tokens if t in EN_STOPWORDS) / total
    if es > en * LANGUAGE_MARGIN and es > 0.04:
        return "es"
    if en > es * LANGUAGE_MARGIN and en > 0.04:
        return "en"
    return "unknown"


# ---------------------------------------------------------------------------
# Signal detection (pure functions — no network, so they can be self-tested)
# ---------------------------------------------------------------------------

def find_keyword_signals(pages):
    """Look for Belize keywords across all fetched pages.

    Returns a list of (label, evidence_snippet), strongest signal first,
    with each keyword reported at most once.
    """
    found = {}
    for page in pages:
        normalized = normalize_keep_length(page.text)
        for label, pattern in KEYWORD_PATTERNS:
            if label in found:
                continue
            match = re.search(pattern, normalized)
            if match:
                found[label] = make_snippet(page.text, match.start(), match.end())
    # Keep KEYWORD_PATTERNS order (strongest first).
    return [(label, found[label]) for label, _ in KEYWORD_PATTERNS if label in found]


def find_english_signals(pages):
    """English content on an otherwise Spanish site.

    Two variants: an actual English page we fetched, and a link to an
    English version of the site (hreflang="en" or an /en/ path).
    """
    if not pages:
        return []
    home = pages[0]
    if language_of(home.text) != "es":
        return []          # only meaningful when the site itself is Spanish

    signals = []
    for page in pages[1:]:
        if language_of(page.text) == "en":
            opening = re.sub(r"\s+", " ", page.text).strip()[:140]
            signals.append(("English page on a Spanish site",
                            f"{page.url} -> {opening}..."))
            break

    if re.search(r'hreflang=["\']en(?:-[A-Za-z]{2})?["\']', home.html, re.I):
        signals.append(("English version linked (hreflang)",
                        f"{home.url} declares an English alternate version"))
    elif re.search(r'href=["\'][^"\']*(?:/en/|/english|/ingles)', home.html, re.I):
        signals.append(("English version linked (/en path)",
                        f"{home.url} links to an English section"))
    return signals


# Obvious non-business addresses that appear in page source.
EMAIL_NOISE = ("wixpress.com", "sentry.io", "sentry-next", "example.com",
               "example.org", "example.net", "domain.com", "yourdomain",
               "yoursite", "yourname", "email@email", "test.com", "user@")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")


def extract_email(pages, site_host):
    """Return the business's published contact email, or '' if none is listed.

    Preference: a mailto: link on the site's own domain, then any mailto:,
    then an address in the page text. Never guesses or builds an address.
    """
    candidates = []   # (score, email)
    for page in pages:
        for mailto in re.findall(r'mailto:([^"\'?>\s]+)', page.html, re.I):
            candidates.append((3, mailto.strip()))
        for found in EMAIL_RE.findall(page.text):
            candidates.append((1, found.strip()))

    best = None
    for score, email in candidates:
        email = email.strip(".,;:()<>").lower()
        if not EMAIL_RE.fullmatch(email):
            continue
        low = email.lower()
        if any(noise in low for noise in EMAIL_NOISE):
            continue
        if re.search(r"\.(png|jpe?g|gif|webp|svg|ico)$", low):
            continue
        domain = low.split("@")[-1]
        # Same-domain addresses are the most likely genuine business contact.
        if site_host and (domain == site_host or site_host.endswith("." + domain)
                          or domain.endswith("." + site_host)):
            score += 2
        if best is None or score > best[0]:
            best = (score, email)
    return best[1] if best else ""


# A contact person is only recorded when the page explicitly labels one.
CONTACT_LABEL_RE = re.compile(
    # The label may be written in any case; the name that follows must stay
    # case-sensitive so ordinary words are not mistaken for a person.
    r"(?i:contacto|contact|atenci[oó]n|responsable|gerente|director[ao]?|"
    r"encargad[oa]|propietari[oa]|owner|manager)\s*[:\-–]\s*"
    r"([A-ZÁÉÍÓÚÑ][\wáéíóúñ.]+"
    r"(?:\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñ.]+){1,3})")
HONORIFIC_RE = re.compile(
    r"\b(?:Dr|Dra|Lic|Ing|Mtro|Mtra|C\.P|Q\.F\.B)\.?\s+"
    r"([A-ZÁÉÍÓÚÑ][\wáéíóúñ]+"
    r"(?:\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñ]+){1,2})")
NOT_A_NAME = {"nosotros", "contacto", "servicios", "telefono", "email", "correo",
              "horario", "lunes", "martes", "direccion", "ubicacion", "inicio",
              "aviso", "privacidad", "whatsapp", "facebook", "clinica", "hospital"}


def extract_contact_person(pages):
    """Return a publicly listed contact name, or '' — never a guess."""
    for page in pages:
        for pattern in (CONTACT_LABEL_RE, HONORIFIC_RE):
            match = pattern.search(page.text)
            if not match:
                continue
            name = re.sub(r"\s+", " ", match.group(1)).strip(" .,;:")
            words = normalize_keep_length(name).split()
            if not words or any(w in NOT_A_NAME for w in words):
                continue
            if len(name) <= 60:
                return name
    return ""


def analyze_pages(site_url, pages):
    """Combine every check into one result dictionary for a single business."""
    host = urlparse(site_url).netloc.lower().removeprefix("www.")
    signals = find_keyword_signals(pages) + find_english_signals(pages)
    return {
        "signal": "yes" if signals else "no",
        "keywords": "; ".join(label for label, _ in signals),
        "evidence": signals[0][1] if signals else "",
        "email": extract_email(pages, host),
        "contact_person": extract_contact_person(pages),
    }


# ---------------------------------------------------------------------------
# Fetching
# ---------------------------------------------------------------------------

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


# Internal pages worth visiting, most useful first.
LINK_PRIORITIES = [
    (4, re.compile(r"contac?t|contacto|contactanos", re.I)),
    (3, re.compile(r"/en/|/en$|english|/ingles", re.I)),
    (2, re.compile(r"about|nosotros|quienes|acerca|sobre-nosotros", re.I)),
    (1, re.compile(r"services|servicios|sucursales|ubicacion", re.I)),
]
SKIP_LINK_RE = re.compile(r"\.(pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?|mp4)$", re.I)


def pick_internal_links(home_url, html):
    """Choose the most promising same-site pages to visit next."""
    soup = BeautifulSoup(html, "html.parser")
    home_host = urlparse(home_url).netloc.lower().removeprefix("www.")
    scored = {}
    for anchor in soup.find_all("a", href=True):
        href = anchor["href"].strip()
        if href.startswith(("mailto:", "tel:", "javascript:", "#")):
            continue
        absolute = urljoin(home_url, href).split("#")[0]
        parts = urlparse(absolute)
        if parts.scheme not in ("http", "https"):
            continue
        if parts.netloc.lower().removeprefix("www.") != home_host:
            continue          # same site only
        if SKIP_LINK_RE.search(parts.path) or absolute == home_url:
            continue
        for score, pattern in LINK_PRIORITIES:
            if pattern.search(parts.path or "/"):
                scored[absolute] = max(scored.get(absolute, 0), score)
                break
    ranked = sorted(scored.items(), key=lambda kv: -kv[1])
    return [url for url, _ in ranked[:MAX_INTERNAL_PAGES]]


def crawl_site(session, robots, url):
    """Fetch a site's homepage plus a few internal pages.

    Returns (pages, status). status is 'ok' or a short reason the site was
    not crawled, which is recorded in the CSV so a blank result is never
    mistaken for "checked and found nothing".
    """
    if is_social_media(url):
        return [], "social media profile"
    if not robots.may_fetch(url):
        return [], "robots.txt disallowed"

    delay = robots.delay_for(url)
    try:
        declared = robots.rules_for(url).crawl_delay(USER_AGENT)
        if declared is not None and float(declared) > SKIP_IF_CRAWL_DELAY_OVER:
            return [], f"robots.txt Crawl-delay {declared}s too long"
    except Exception:
        pass

    html = fetch_html(session, url)
    if html is None:
        return [], "homepage unreachable or blocked"

    pages = [Page(url, html, page_text(html))]
    for link in pick_internal_links(url, html):
        if not robots.may_fetch(link):
            continue
        time.sleep(delay)
        sub_html = fetch_html(session, link)
        if sub_html:
            pages.append(Page(link, sub_html, page_text(sub_html)))
    return pages, "ok"


# ---------------------------------------------------------------------------
# Stages
# ---------------------------------------------------------------------------

CANDIDATE_HEADER = ["Business Name", "Address", "Phone", "Website", "City", "Category"]
OUTPUT_HEADER = ["Business Name", "Address", "Phone", "Website", "Email",
                 "Contact Person", "City", "Category", "Belize Signal Found",
                 "Keyword Matched", "Evidence Snippet"]


def candidates_path(city, category):
    return f"candidates_{safe_filename_part(city)}_{safe_filename_part(category)}.csv"


def output_path(city, category):
    return (f"belize_signals_{safe_filename_part(city)}_"
            f"{safe_filename_part(category)}.csv")


def stage_discover(city, category):
    """Places search -> businesses that HAVE a website."""
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY")
    if not api_key:
        print("GOOGLE_PLACES_API_KEY is not set.")
        print('Set it first, e.g.:  export GOOGLE_PLACES_API_KEY="your-key-here"')
        sys.exit(1)

    query = f"{category} in {city}"
    print(f'Searching Google Places for: "{query}" ...')
    places = fetch_places(api_key, query)
    if not places:
        print("No results.")
        return None, 0, 0

    with_site = [p for p in places if p.get("websiteUri")]
    social = sum(1 for p in with_site if is_social_media(p["websiteUri"]))

    path = candidates_path(city, category)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(CANDIDATE_HEADER)
        for place in with_site:
            writer.writerow([
                place.get("displayName", {}).get("text", ""),
                place.get("formattedAddress", ""),
                place.get("nationalPhoneNumber", ""),
                place.get("websiteUri", ""),
                city,
                category,
            ])

    print()
    print(f"Businesses found:        {len(places)}")
    print(f"Have a website:          {len(with_site)}")
    print(f"  of those, social only: {social} (recorded, never crawled)")
    print(f"Candidates saved to:     {path}")
    return path, len(places), len(with_site)


def stage_analyze(city, category):
    """Visit each candidate website and look for Belize signals."""
    if BeautifulSoup is None:
        print("This stage needs beautifulsoup4:  pip install -r requirements.txt")
        sys.exit(1)

    path = candidates_path(city, category)
    if not os.path.exists(path):
        print(f"No candidate file: {path}\nRun the discover stage first.")
        sys.exit(1)

    with open(path, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        print(f"{path} has no candidates.")
        return

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT,
                            "Accept-Language": "es-MX,es;q=0.9,en;q=0.8"})
    robots = RobotsCache(session)

    counts = {"ok": 0, "skipped": 0, "signal": 0}
    keyword_tally = {}
    out_name = output_path(city, category)

    with open(out_name, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(OUTPUT_HEADER)

        for index, row in enumerate(rows, start=1):
            website = row["Website"]
            print(f"[{index}/{len(rows)}] {row['Business Name']} — {website}")
            pages, status = crawl_site(session, robots, website)

            if status == "ok":
                counts["ok"] += 1
                result = analyze_pages(website, pages)
            else:
                counts["skipped"] += 1
                # A bracketed note keeps "could not check" distinct from
                # "checked and found nothing".
                result = {"signal": "no", "keywords": "", "email": "",
                          "contact_person": "",
                          "evidence": f"[not crawled: {status}]"}

            if result["signal"] == "yes":
                counts["signal"] += 1
                for label in result["keywords"].split("; "):
                    keyword_tally[label] = keyword_tally.get(label, 0) + 1
                print(f"    BELIZE SIGNAL: {result['keywords']}")

            writer.writerow([
                row["Business Name"], row["Address"], row["Phone"], website,
                result["email"], result["contact_person"], row["City"],
                row["Category"], result["signal"], result["keywords"],
                result["evidence"],
            ])
            time.sleep(REQUEST_DELAY)

    print()
    print(f"Websites checked:        {counts['ok']}")
    print(f"Not crawled (skipped):   {counts['skipped']}")
    print(f"Belize signal found:     {counts['signal']}")
    for label, count in sorted(keyword_tally.items(), key=lambda kv: -kv[1]):
        print(f"    {label}: {count}")
    print(f"Results saved to:        {out_name}")


# ---------------------------------------------------------------------------
# Offline self-test
# ---------------------------------------------------------------------------

def self_test():
    """Check the detection logic on built-in examples. No network needed."""
    if BeautifulSoup is None:
        print("Self-test needs beautifulsoup4:  pip install -r requirements.txt")
        sys.exit(1)

    def page(url, html):
        return Page(url, html, page_text(html))

    spanish_filler = ("Somos una clinica con mas de veinte anos de servicios "
                      "para la salud de nuestros pacientes en la region. ") * 12
    english_filler = ("We are a clinic with more than twenty years of services "
                      "for the health of our patients in this region. ") * 12
    failures = []

    def check(name, condition, detail=""):
        if condition:
            print(f"  PASS  {name}")
        else:
            print(f"  FAIL  {name} {detail}")
            failures.append(name)

    print("Belize signal self-test")

    # 1. Spanish accented keyword.
    pages = [page("https://x.mx/", f"<html><body><p>{spanish_filler} "
                                   "Atendemos a pacientes beliceños todos los dias."
                                   "</p></body></html>")]
    result = analyze_pages("https://x.mx/", pages)
    check("Beliceños detected", result["signal"] == "yes"
          and "Belizean/Beliceño" in result["keywords"], result["keywords"])
    check("evidence snippet captured", "belice" in result["evidence"].lower(),
          result["evidence"])

    # 2. Belize phone code.
    pages = [page("https://y.mx/", "<html><body><p>Llamenos al +501 622-1234 "
                                   "desde Belice.</p></body></html>")]
    result = analyze_pages("https://y.mx/", pages)
    check("+501 detected", "+501 (Belize phone code)" in result["keywords"],
          result["keywords"])

    # 3. Belizean towns.
    pages = [page("https://z.mx/", "<html><body><p>Servicio a Corozal y "
                                   "Orange Walk cada semana.</p></body></html>")]
    result = analyze_pages("https://z.mx/", pages)
    check("Orange Walk ranked above Corozal",
          result["keywords"].startswith("Orange Walk"), result["keywords"])

    # 4. English page on a Spanish site.
    pages = [
        page("https://w.mx/", f"<html><body><p>{spanish_filler}</p></body></html>"),
        page("https://w.mx/en/services",
             f"<html><body><p>{english_filler}</p></body></html>"),
    ]
    result = analyze_pages("https://w.mx/", pages)
    check("English page on Spanish site detected",
          "English page on a Spanish site" in result["keywords"], result["keywords"])

    # 5. A wholly Spanish site with no Belize mention stays clean.
    pages = [page("https://q.mx/", f"<html><body><p>{spanish_filler}</p></body></html>")]
    result = analyze_pages("https://q.mx/", pages)
    check("no false positive on plain Spanish site", result["signal"] == "no",
          result["keywords"])

    # 6. Email preference and noise filtering.
    pages = [page("https://clinica.mx/contacto",
                  '<html><body><a href="mailto:noreply@wixpress.com">x</a>'
                  '<a href="mailto:Contacto@Clinica.mx">write</a>'
                  '<p>alt: ventas@gmail.com logo@2x.png</p></body></html>')]
    result = analyze_pages("https://clinica.mx/", pages)
    check("same-domain mailto preferred", result["email"] == "contacto@clinica.mx",
          result["email"])

    # 7. No email published -> blank, never invented.
    pages = [page("https://noemail.mx/", "<html><body><p>Solo telefono.</p></body></html>")]
    result = analyze_pages("https://noemail.mx/", pages)
    check("blank when no email published", result["email"] == "", result["email"])

    # 8. Contact person only when labelled.
    pages = [page("https://c.mx/", "<html><body><p>Contacto: Maria Lopez Cruz</p>"
                                   "</body></html>")]
    check("labelled contact person found",
          analyze_pages("https://c.mx/", pages)["contact_person"] == "Maria Lopez Cruz")
    pages = [page("https://c.mx/", "<html><body><p>Contacto: Servicios</p></body></html>")]
    check("page word not mistaken for a name",
          analyze_pages("https://c.mx/", pages)["contact_person"] == "")

    # 9. Social media is never crawled.
    check("facebook.com recognised as social",
          is_social_media("https://www.facebook.com/clinica"))
    check("business site not treated as social",
          not is_social_media("https://clinica.com.mx/"))

    # 10. Missing robots.txt means crawling is allowed.
    parser = urllib.robotparser.RobotFileParser()
    parser.parse([])
    check("empty robots.txt allows fetching",
          parser.can_fetch(USER_AGENT, "https://any.mx/page"))
    parser = urllib.robotparser.RobotFileParser()
    parser.parse(["User-agent: *", "Disallow: /"])
    check("robots.txt disallow is honoured",
          not parser.can_fetch(USER_AGENT, "https://any.mx/page"))

    # 11. Internal link picking prefers contact pages and stays on-site.
    html = ('<html><body>'
            '<a href="/servicios">s</a><a href="/contacto">c</a>'
            '<a href="https://facebook.com/x">f</a><a href="/brochure.pdf">p</a>'
            '</body></html>')
    links = pick_internal_links("https://site.mx/", html)
    check("contact page picked first",
          links and links[0].endswith("/contacto"), str(links))
    check("off-site and PDF links excluded",
          all("facebook" not in l and not l.endswith(".pdf") for l in links), str(links))

    print()
    if failures:
        print(f"{len(failures)} check(s) FAILED: {', '.join(failures)}")
        sys.exit(1)
    print("All checks passed.")


# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Find businesses whose websites show Belize-targeting signals."
    )
    parser.add_argument("city", nargs="?",
                        help='e.g. "Chetumal, Quintana Roo, Mexico"')
    parser.add_argument("category", nargs="?", help='e.g. "dental clinic"')
    parser.add_argument("--stage", choices=["discover", "analyze", "both"],
                        default="both", help="which stage to run (default: both)")
    parser.add_argument("--self-test", action="store_true",
                        help="check the detection logic offline and exit")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return
    if not args.city or not args.category:
        parser.error("city and category are required (or use --self-test)")

    if args.stage in ("discover", "both"):
        path, _, with_site = stage_discover(args.city, args.category)
        if args.stage == "both" and (path is None or with_site == 0):
            return
    if args.stage in ("analyze", "both"):
        stage_analyze(args.city, args.category)


if __name__ == "__main__":
    main()
