# Prospecting tools

Two command-line tools that use the Google Places API (New) to build sales
prospect lists. Both read the API key from the `GOOGLE_PLACES_API_KEY`
environment variable — the key is never stored in any file here.

## Setup (once)

```bash
pip install -r requirements.txt
export GOOGLE_PLACES_API_KEY="your-key-here"
```

On Windows, use `setx GOOGLE_PLACES_API_KEY "your-key-here"` once, then open a
new Command Prompt.

Keep `places_search.py` in the same folder as the two tools — both import it.

---

## Mode 1 — `prospect.py`: businesses with NO website

```bash
python3 prospect.py "Ocala, FL" "immigration attorney"
```

Searches `"{vertical} in {city}"`, follows Google's pagination up to 5 pages
(about 60 results in practice), and writes every business whose listing has no
website to `prospects_{city}_{vertical}.csv`, then prints how many were found,
how many had no website, and the percentage.

## Mode 2 — `belize_signals.py`: businesses WITH websites that target Belize

```bash
python3 belize_signals.py "Chetumal, Quintana Roo, Mexico" "dental clinic"
```

Opposite logic. It keeps businesses that *do* have a website, visits each site,
and looks for evidence that the business markets to Belizean customers.

It runs in two stages, so the quick API part and the slow crawling part can be
run separately:

```bash
# stage 1 only — Places search, writes candidates_{city}_{category}.csv
python3 belize_signals.py "Chetumal, Quintana Roo, Mexico" "hotel" --stage discover

# stage 2 only — reads that file, visits the websites
python3 belize_signals.py "Chetumal, Quintana Roo, Mexico" "hotel" --stage analyze

# both, one after the other (the default)
python3 belize_signals.py "Chetumal, Quintana Roo, Mexico" "hotel"
```

Stage 2 needs unrestricted internet access. If you run it somewhere that
filters outbound traffic, every row comes back
`[not crawled: homepage unreachable or blocked]`.

### What counts as a Belize signal

| Signal | Example |
| --- | --- |
| Belize / Belice / Belizean / Beliceño / Beliceña | "pacientes beliceños" |
| `+501` (Belize country code) | "+501 622-1234" |
| Belize City, Orange Walk, Corozal | "servicio a Orange Walk" |
| An English page on an otherwise Spanish site | `/en/services` in English |
| A link to an English version (`hreflang="en"` or an `/en/` path) | — |

Matching ignores accents and capitals, so `BELICEÑOS` and `beliceno` both hit.
The CSV records which keyword matched and a short snippet of the surrounding
text as evidence, so every flag can be checked by hand.

### Output columns

`belize_signals_{city}_{category}.csv`:

Business Name, Address, Phone, Website, Email, Contact Person, City, Category,
Belize Signal Found, Keyword Matched, Evidence Snippet

Rows that could not be checked say why in the Evidence column — for example
`[not crawled: social media profile]` — so a blank result is never confused with
"we looked and found nothing".

### How it behaves on other people's websites

* Reads public pages only. It never submits forms, logs in, or posts anything.
* **Never sends email.** Outreach is done manually by a person.
* Respects `robots.txt`, including `Crawl-delay`; skips sites that disallow it.
* Waits 1.5 seconds between requests and fetches at most 5 pages per site
  (homepage plus contact/about/services pages).
* Never touches social media platforms. If a business lists a Facebook page as
  its website, the URL is recorded but the page is not fetched.
* Emails are only recorded when the business publishes them on its own site.
  Addresses are never guessed or constructed.

When your team contacts these businesses, follow the marketing rules that apply
in the destination country.

### Checking the tool still works

```bash
python3 belize_signals.py --self-test
```

Runs 16 offline checks of the keyword, language, email, contact-name, social
media and robots.txt logic. No network or API key needed.

---

## Cost

Both tools request only four fields (name, address, phone, website), which keeps
every search in the cheapest Places API billing tier. A search costs a fraction
of a cent; a run of about 60 results costs a few cents.
