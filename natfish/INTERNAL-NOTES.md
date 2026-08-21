# NATFISH website internal notes

**Internal only. Not linked from any page and not to be shared with the client.**

Eight-page site, V2. No canonical or Open Graph URL is set anywhere, so nothing ties the site to a
preview domain until a real one is approved.

---

## 1. What changed in V2

The client accepted the V1 concept and supplied real material. V2 replaces the concept photography and
the directory-sourced contact details with client-verified content.

| Area | V1 | V2 |
|---|---|---|
| Legal name | apostrophe-and-hyphen spelling | `National Fishermen Producers Cooperative Society Ltd.` |
| Photography | ten generated concept images | ten client photographs + four packaging recreations |
| Contact | one directory phone, one BTL email, a temporary WhatsApp routing number | three verified numbers, two verified emails, verified street address |
| Products | "lobster, conch, other on enquiry" | the six-product catalogue |
| Food safety | nothing stated | "operate in accordance with HACCP and U.S. FDA regulations" |
| Facts | registration date only | registration date, 636 members, seven-member committee, export markets |

The V1 temporary WhatsApp routing number and the BTL email are gone from the whole project, including
comments. Both are covered by an assertion in the QA sweep, so they cannot creep back in.

---

## 2. CLIENT CONFIRMATION REQUIRED

Nothing in this list is stated as fact on a public page.

### Blocking before launch

| # | Item | Status in the build |
|---|---|---|
| 1 | **"Belizean Pride" brand name** | Legible on the packaging photographs on Seafood & Services and in the Gallery. It comes from NATFISH's own pamphlet, but it is a *recreation* of that pamphlet, so confirm the brand is current and correctly spelled before launch. |
| 2 | **Which products are currently sellable** | All six are listed as the catalogue. Confirm none has been discontinued. |
| 3 | Whether NATFISH handles Nassau grouper, whelks, stone crab or shrimp | Listed on Seafood Seasons as *national regulatory seasons only*, never as NATFISH products. |
| 4 | Spanish review | See §6. |

### Deliberately removed from the supplied material

The four packaging recreations carried printed text that the recreation invented. It is cropped out,
not blurred, so the cartons read as clean product photography:

| File | Removed |
|---|---|
| `02-belizean-pride-orange-lobster-tails` | `BELIZE MINISTRY OF FISHERIES / INSPECTED / LICENCE NUMBER C-122`, `NET WEIGHT 10kg (22lb)` |
| `03-belizean-pride-raw-lobster-tails` | `Seafood Inspection Service / Inspected and Approved for Export Only / EST. NO.`, `NET WEIGHT 10kg (22lb)` |
| `04-wild-caught-frozen-conch` | `SEAFOOD BELIZE INSPECTED` roundel, `NET WEIGHT 5 Pounds / 2.27kg` |

A recreated government licence number is a certification claim, and the net weights are package
specifications. Neither was supplied as fact. `01-belizean-pride-lobster-cases` is uncropped: its only
legible text is the brand line, and its two seals rendered as illegible marks.

**If NATFISH confirms the real licence number, establishment number and pack weights, the full
packaging shots can be restored — but the right fix is real product photography, not a recreation.**

The final two supplied recreations (`05-natfish-processing-room-wide`, `06-natfish-processing-table-close`)
are **not built into the site at all.** They reconstruct scenes that authentic photographs 03 and 08
already cover, and an authentic photograph should always beat a reconstruction of the same subject.

### Still absent, because nothing supports them

- Prices, package weights, grades, sizes, minimum order quantities, guaranteed availability.
- Certifications held. The site says NATFISH *works to operate in accordance with* HACCP and U.S. FDA
  regulations, which is exactly what the client supplied. It never says certified, approved or
  compliant.
- Export volumes, capacity, cold-chain or freight services.
- Employee numbers, staff names or photographs of named people. The only named person on the site is
  the General Manager, on the Contact page, as the client instructed.
- Whether the electronic traceability system is currently active. The site says NATFISH **has
  participated in** traceability initiatives, which the sources support, and nothing about today.

### Questions for the client

1. Is "Belizean Pride" the current brand, and is the packaging artwork current?
2. What are the real establishment and licence numbers, and may they be published?
3. Are all six products currently available, and are there pack sizes we may publish?
4. Which export markets are active *now*, as opposed to historically?
5. Is the electronic traceability system still active, and how should it be described?
6. Who approves website content and imagery?
7. Is the old nationalfisherscoop.com domain still in use, and what is the launch domain?
8. Can NATFISH supply a photograph of lionfish fillet, head meat and whole cooked lobster? Those three
   catalogue cards currently carry a species mark rather than a photograph.

---

## 3. Verified contact details

Used consistently in page copy, footers, structured data, enquiry drafts and `tel:`/`mailto:` links.

| Field | Value |
|---|---|
| Legal name | `National Fishermen Producers Cooperative Society Ltd.` |
| General Manager | Ms. Denise O'Brien, `deniseobrien125@gmail.com` (Contact page only) |
| Primary office | `+501 227-3165` |
| Secondary office | `+501 227-8039` |
| Mobile / WhatsApp | `+501 611-4831` |
| General and orders | `nationalfishermen@gmail.com` |
| Address | `#1 Angel Lane, Belize City, Belize` |

`nationalfishermen@gmail.com` drives every primary CTA. The General Manager's address appears only on
the Contact page, tied to her card, so it never becomes the default reply-to for routine enquiries.

---

## 4. Imagery

```
assets/img/official/    ten client photographs. Documentary. Alt text names NATFISH directly.
assets/img/products/    four packaging recreations. Generic captions, no date, no named person.
```

Regenerate with:

```
python3 tools/process-v2-images.py <authentic-dir> <recreations-dir>
```

WebP + JPEG at 480 / 800 / 1400 on the long edge, never upscaled past what was supplied, metadata
stripped. `tools/v2_dims.py` is generated by that script and feeds real `width`/`height` onto every
`<img>`.

**Seven of the ten client photographs are portrait.** That drove several layout decisions and is the
thing most likely to be undone by accident later:

- The gallery is a **column masonry**, not a fixed grid. Every photograph keeps its own height, so
  nothing is cropped or letterboxed. Reverting it to a 4:3 grid re-crops all ten.
- `picture()` tags tall files `is-portrait` and writes the file's true shape into `--ratio`. The
  stylesheet gives those a matching frame instead of cover-cropping them into a landscape box.
- The four process steps use a 3:4 frame on every screen.

The concept-image disclaimer is **gone** from the authentic photographs, per the brief. The recreation
note remains on Seafood & Services and in the Gallery's product section.

**Video.** The Ocean Link documentary is third-party material, credited on screen on the Gallery page.
It loads only when the visitor clicks play.

---

## 5. Page architecture

```
index.html               Home, gateway with a rotating hero
about.html               About NATFISH
seafood-services.html    Seafood & Services, the six-product catalogue
seafood-seasons.html     Seafood Seasons (regulatory guide)
responsible.html         Responsible Fisheries
news.html                What's New at NATFISH
gallery.html             Gallery, photos and video
contact.html             Contact & Buyer Enquiries  (#buyer-enquiry)
```

### Seafood Seasons is a regulatory guide, not a catalogue

The page summarises **standing Belize fisheries regulation**. It is not a statement of NATFISH stock.
The permitted status strings are fixed in `assets/js/natfish-seasons.js`:

- "Within the standard regulatory season"
- "Standard closed period"
- "Subject to national quota and current Fisheries notices" (always shown for conch, including inside
  the open period, because the quota can close it early)
- "Contact NATFISH for availability"

**Never** add "in stock", "available now", "order now" or any guarantee of availability. No statutory
shrimp season exists, so shrimp carries an availability-varies note rather than invented dates.

Last regulatory review: **18 August 2026**, sourced from <https://fisheries.gov.bz/regulations/>.
Re-check that source and update `LAST_REVIEW` before each client review; quota closures are announced
in-season and will not appear here automatically.

### Forms

There are **no forms anywhere on the site.** Buyer enquiries are two links on
`contact.html#buyer-enquiry`: a `mailto:` to `nationalfishermen@gmail.com` and a `wa.me` link to
`5016114831`, both carrying a prefilled, fully editable draft that includes the six-product pick list.
Nothing is captured server-side. Enabling Netlify Forms later would mean reintroducing a real
`<form>`, a hidden `form-name` input and a background POST.

---

## 6. English and Spanish

| Piece | File |
|---|---|
| Runtime | `assets/js/natfish-i18n.js` |
| Spanish strings (generated) | `assets/js/natfish-strings.js` |
| Spanish source of truth | `tools/natfish_es.py` |
| Extract + build | `tools/i18n-extract.py`, `tools/i18n-build.py` |

Strings are keyed by their **own English text**, so a missing translation leaves the English standing
rather than rendering blank. Detection order is `?lang=`, then the stored choice
(`natfish.language` in localStorage), then the browser language, then English.

After editing any page copy, re-run:

```
python3 tools/i18n-build.py     # reports anything without Spanish
```

Currently **370 Spanish strings, 0 missing.**

**CONCEPT-STAGE TRANSLATION.** The Spanish should receive a final review from a Belizean Spanish
speaker designated by NATFISH before launch, particularly the fisheries and cooperative vocabulary
("veda", "caracol reina", "langosta espinosa", "manejo pesquero", "Comité Administrativo"), which
should be checked against the wording the Belize Fisheries Department itself uses. The legal name,
"NATFISH", "Austere Automations" and the Linnaean species names are never translated.

The header switches to the hamburger at **1280px**. That is measured, not guessed: Spanish labels make
the nav wider than English, and below 1280 the logo, language control, nav and buyer button no longer
fit with usable spacing.

---

## 7. Build

Static HTML, no build step, no framework, no external fonts or scripts.

```
tools/build_shell.py         shared head, header, footer, picture(), contact constants
tools/build_pages.py         the eight pages; run this after editing either
tools/build_icons.py         the inline SVG icon family
tools/build_seasons.py       the Seafood Seasons card data
tools/process-v2-images.py   regenerates the photography set
tools/process-logo.py        regenerates the three logo lockups
tools/bundle-preview.py      builds the single-file artifact preview
tools/make-netlify-zip.sh    builds the deployable zip, excluding this file and tools/
```

The eight HTML files are generated. **Edit the generators, not the HTML**, or the next
`python3 tools/build_pages.py` will overwrite the change.

`netlify.toml` 301-redirects the three retired V1 URLs: `/cooperative.html` to `/about.html`,
`/seafood.html` to `/seafood-services.html`, and `/buyers.html` to `/contact.html#buyer-enquiry`.

The rotating hero advances every 7 seconds, supports swipe, pauses on a hidden tab, and does not
rotate at all under `prefers-reduced-motion`. It has no visible controls, by client instruction in V1.
