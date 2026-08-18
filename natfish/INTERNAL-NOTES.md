# NATFISH website internal notes

**Internal only. Not linked from any page and not to be shared with the client.**

Eight-page concept build. No canonical or Open Graph URL is set anywhere, so nothing ties the site to a
preview domain until a real one is approved.

---

## 1. CLIENT CONFIRMATION REQUIRED

Nothing in this list is stated on a public page. Each item is either omitted or written as
"confirmed directly with NATFISH".

### Blocking before launch

| # | Item | Status in the build |
|---|---|---|
| 1 | **WhatsApp number** | `+501 610-8859` is a **temporary concept routing number**. It appears only inside the `wa.me` link on `contact.html`, never as displayed text. |
| 2 | Exact street address | `Angel Lane, Belize City` shown with no street number |
| 3 | Telephone | `+501 227-3165` from the public directory, labelled a telephone line and **never** as WhatsApp |
| 4 | Email | `natfish@btl.net` from the public directory |
| 5 | Use of "NATFISH" as the public digital name | Used as the primary wordmark throughout |

**Item 1 is the first thing to replace.** Search `assets/js` and `contact.html` for `5016108859`. The
code comment sitting beside the link reads:

> TEMPORARY CONCEPT WHATSAPP NUMBER — REPLACE WITH CLIENT-CONFIRMED NATFISH NUMBER BEFORE PUBLIC LAUNCH.

### Deliberately absent from the site

Asked for, not published, because nothing in the research supports them:

- Member numbers, employee numbers, staff or management names.
- Facilities, receiving locations, branches, outlets or processing capacity.
- Any product beyond lobster and conch. Everything else reads "availability upon enquiry".
- Prices, packaging, grades, sizes, minimum order quantities, guaranteed availability.
- Export markets or destination countries.
- Certifications, food-safety standards or permitted claim wording.
- Cold storage, freight, shipping, logistics or any operational service.
- Whether the electronic traceability system is currently active. The site says NATFISH **has
  participated in** traceability initiatives, which the sources support, and nothing about today.

### Questions for the client

1. Which seafood products and formats does NATFISH currently sell?
2. Which are sold locally and which are exported? Which markets are active?
3. What certifications or standards may we publish, and in what words?
4. Is the electronic traceability system still active, and how should it be described?
5. Which receiving locations, branches or outlets are active?
6. Confirm address, telephone, email and the correct WhatsApp number.
7. Who approves website content and imagery?
8. What photographs, brochures, event images or video can NATFISH supply?
9. Is the old nationalfisherscoop.com domain still in use?
10. What information does NATFISH need from a serious wholesale or export buyer?

---

## 2. Logo

Source artwork: the supplied transparent PNG, 1774x861 after trimming. Never recoloured, never
filtered, alpha preserved. Regenerate with `python3 tools/process-logo.py <source.png>`.

| Asset | Where it is used |
|---|---|
| `natfish-logo.png` (+`@2x`) | Full logo, mark and wordmark and legal name. Footer light panel and the About page identity panel. |
| `natfish-logo-mark.png` (+`@2x`) | Compact lockup, mark and NATFISH wordmark. Site header on all eight pages. |
| `natfish-icon.png`, `favicon.png` | Square crop of the circular mark. Favicon and touch icon. |

**Why two lockups.** The two legal-name lines occupy 6.1% of the artwork's height. At any sticky-header
size they render under 5px tall and cannot be read, so putting the full logo in the header would show
the legal name without making it legible. The header therefore carries the compact lockup, and the full
logo runs large in the footer and on About where the legal name genuinely reads. The legal name is also
present as selectable text in the footer, page copy and every `<title>`, so it never depends on the
image alone.

In the dark footer the full logo sits on a white panel rather than being inverted or recoloured.

---

## 3. Imagery

All photography is concept imagery, not client-owned. Alt text describes only what is visible and never
asserts that a person, vessel, facility or piece of equipment belongs to NATFISH.

- The **Gallery** captions every photograph "Concept image used for the website presentation".
- **About** and **Responsible Fisheries** carry a short note under their image-led sections, since those
  are where the worker, processing-room and traceability shots appear.
- Pages carrying only seascape or product photography do not repeat the disclaimer.

**The fabricated storefront image has been removed entirely.** Its signage showed a phone number
contradicting the verified `227-3165`, invented opening hours, and a five-species catch list. The asset
files are deleted and nothing references it.

**Video.** The Ocean Link documentary is third-party material, credited on screen as such on the Gallery
page. It is not presented as NATFISH-owned production, and it loads only when the visitor clicks play.

---

## 4. Forms and enquiries

There are **no forms anywhere on the site**. Buyer enquiries are handled by two links on
`contact.html#buyer-enquiry`:

- **Send an Email** opens a `mailto:` to `natfish@btl.net` with the subject `NATFISH Buyer Enquiry` and
  a prefilled, fully editable body.
- **Enquire on WhatsApp** opens `wa.me` with a prefilled, editable message.

Nothing is captured server-side and no enquiry is stored anywhere. If a visitor abandons the handoff the
enquiry is lost, so the telephone and email links remain the reliable route. Enabling Netlify Forms
later would mean reintroducing a real `<form>`, a hidden `form-name` input and a background POST.

---

## 5. Page architecture

```
index.html               Home, gateway with a rotating hero
about.html               About NATFISH
seafood-services.html    Seafood & Services
seafood-seasons.html     Seafood Seasons (regulatory guide)
responsible.html         Responsible Fisheries
news.html                What's New at NATFISH
gallery.html             Gallery, photos and video
contact.html             Contact & Buyer Enquiries  (#buyer-enquiry)
```

### Seafood Seasons is a regulatory guide, not a catalogue

The page summarises **standing Belize fisheries regulation**. It is not a
statement of NATFISH stock, and the wording is deliberately constrained so it
can never be read as one. The permitted status strings are fixed in
`assets/js/natfish-seasons.js`:

- "Within the standard regulatory season"
- "Standard closed period"
- "Subject to national quota and current Fisheries notices" (always shown for
  conch, including inside the open period, because the quota can close it early)
- "Contact NATFISH for availability"

**Never** add "in stock", "available now", "order now" or any guarantee of
availability. No statutory shrimp season exists, so shrimp carries an
availability-varies note rather than invented dates.

Last regulatory review: **18 August 2026**, sourced from
<https://fisheries.gov.bz/regulations/>. Re-check that source and update
`LAST_REVIEW` before each client review; quota closures are announced in-season
and will not appear here automatically.

**CLIENT CONFIRMATION REQUIRED:** whether NATFISH actually handles Nassau
grouper, whelks, stone crab or shrimp. The page lists them as national
regulatory seasons only and never as NATFISH products.

---

## 5a. English and Spanish

A real bilingual system, not a translation widget and not a second site.

| Piece | File |
|---|---|
| Runtime | `assets/js/natfish-i18n.js` |
| Spanish strings (generated) | `assets/js/natfish-strings.js` |
| Spanish source of truth | `tools/natfish_es.py` |
| Extract + build | `tools/i18n-extract.py`, `tools/i18n-build.py` |

Strings are keyed by their **own English text**, so a missing translation leaves
the English standing rather than rendering blank, and extraction can never drift
out of sync with the markup. Detection order is `?lang=`, then the stored
choice (`natfish.language` in localStorage), then the browser language, then
English.

After editing any page copy, re-run:

```
python3 tools/i18n-build.py     # reports anything without Spanish
```

**CONCEPT-STAGE TRANSLATION.** The Spanish should receive a final review from a
Belizean Spanish speaker designated by NATFISH before launch, particularly the
fisheries vocabulary ("veda", "caracol reina", "cuota nacional"), which should
be checked against the wording the Belize Fisheries Department itself uses. The
legal name, "NATFISH" and "Austere Automations" are never translated.

The header switches to the hamburger at **1280px**. That is measured, not
guessed: Spanish labels make the nav 885px wide against 819px in English, and
below 1280 the logo, language control, nav and buyer button no longer fit with
usable spacing.

`netlify.toml` 301-redirects the three retired V1 URLs: `/cooperative.html` to `/about.html`,
`/seafood.html` to `/seafood-services.html`, and `/buyers.html` to `/contact.html#buyer-enquiry`.

The rotating hero advances every 7 seconds, offers previous / pause / next plus slide dots, supports
swipe and arrow keys, announces manual changes to screen readers, pauses on a hidden tab, and **stops
permanently once the visitor touches any control**. Under `prefers-reduced-motion` it does not rotate at
all and the controls still work.

---

## 6. Build

Static HTML, no build step, no framework, no external fonts or scripts. Hosts anywhere that serves
files.

```
tools/process-logo.py       regenerates the three logo lockups from the source artwork
tools/process-images.py     regenerates the photography set (WebP + JPEG, 800w + 1400w)
tools/bundle-preview.py     builds the single-file preview
tools/make-netlify-zip.sh   builds the deployable zip, excluding this file and tools/
```

The seven pages were generated from a shared template so header, footer and nav stay identical. They are
plain static HTML now and should be edited directly; a change to the header, footer or nav has to be
repeated across all seven files.

Verified in Chromium at 320, 360, 375, 390, 393, 414, 430, 768, 1024, 1100, 1140, 1141, 1200, 1240,
1241, 1366, 1440 and 1920 px: no horizontal overflow, no console errors, no failed requests, one `h1`
per page, every internal link and anchor resolving, no `<form>` element and no preview-domain URL on any
page. Carousel, lightbox, video facade, keyboard focus order and both enquiry links tested.
