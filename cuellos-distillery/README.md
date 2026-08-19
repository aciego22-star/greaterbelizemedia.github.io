# Cuello's Distillery Ltd. — Website Concept V1.1

**"The Spirit of Orange Walk"** — a nine-page, bilingual (EN/ES), mobile-first concept
website for Cuello's Distillery Ltd., Orange Walk Town, Belize.
Developed by [Austere Automations](https://austereautomations.com/).

> **Status: meeting-ready concept.** The current Cuello's production website
> remains live and untouched. This concept deploys to a temporary
> Austere-controlled Netlify domain only. Do not connect it to the production
> domain until every item in `CLIENT-CONFIRMATION-CHECKLIST.md` is resolved.

## What changed in V1.1

- Home hero is now a **four-slide carousel** (full lineup, Trafalgar Gin,
  CZAR Vodka, brand video slot) with autoplay, swipe, keyboard, dots and a
  pause control. Slide 1 stays visible without JavaScript.
- The four-product rail became a **nine-product marquee** — a slow,
  seamless right-to-left showcase of the full range, pausable, keyboard- and
  screen-reader-safe, swipe-friendly on touch, static under reduced motion.
- **Contact and Trade forms removed.** Both pages now use action panels:
  WhatsApp (prefilled message), email (prefilled subject + body), call, and
  locations. The WhatsApp number lives in one place: `assets/js/config.js`.
- **Footer centred** on every page and every breakpoint.
- **Copy audit**: all unapproved product descriptions, tasting/serving
  claims, invented cocktail recipes and invented news stories were removed
  or neutralized. Cocktails is now "Serving inspiration" with an official-
  recipes-coming-soon panel; News uses neutral photo cards.
- Placeholder social icons removed — only verified links will be shown.

## Pages

| File | Page |
|---|---|
| `index.html` | Home (hero carousel · nine-product marquee) |
| `our-story.html` | Our Story |
| `our-spirits.html` | Our Spirits (9 products, drawer) |
| `cocktails.html` | Cocktails & Serving Inspiration |
| `news-events.html` | News & Events (neutral photo cards) |
| `gallery.html` | Gallery (filterable, lightbox, video-ready) |
| `locations.html` | Where to Find Us (3 offices) |
| `trade.html` | Trade & Distribution (action panel) |
| `contact.html` | Contact (action panel) |
| `404.html` | Not-found page |

## Architecture

- **Static HTML + shared CSS + modular vanilla JS.** No build step, no
  framework. Fonts (Fraunces + Manrope) self-hosted in `assets/fonts/`.
- **`assets/js/config.js`** — central configuration: WhatsApp number
  (PROVISIONAL — see checklist), email, hero-video path.
- **`assets/js/data.js`** — products, cocktails (empty until official
  recipes arrive), news cards, gallery manifest.
- **`assets/js/i18n.js`** — every EN/ES string, including the prefilled
  WhatsApp/email messages. Language persists across pages via localStorage
  and never resets the age confirmation.
- **`assets/js/carousel.js`** — hero carousel. **`marquee.js`** — product
  marquee. **`age-gate.js`** — 18+ gateway. **`gallery.js`**, **`spirits.js`**,
  **`main.js`** — as labelled.
- Header/footer markup is generated identically on each page; if you edit
  one, apply the change to all ten HTML files.

## Editing quick reference

| Change | Where |
|---|---|
| WhatsApp number / email | `assets/js/config.js` (single source) |
| Prefilled WhatsApp/email messages | `assets/js/i18n.js` (`contact.*` / `trade.*` keys) |
| Product names / descriptions | `assets/js/data.js` → `PRODUCTS` |
| Marquee order | `assets/js/data.js` → `MARQUEE_ORDER` (cards themselves are static HTML in `index.html`) |
| Official cocktail recipes | `assets/js/data.js` → `COCKTAILS` (page renders them automatically once added) |
| News cards | `assets/js/data.js` → `NEWS` |
| Gallery photos & videos | `assets/js/data.js` → `GALLERY` |
| Any interface/editorial text, EN or ES | `assets/js/i18n.js` |
| Colours, spacing, typography | `assets/css/main.css` (`:root` tokens) |

### Hero video (slide 4) — ACTIVE, with sound
`assets/video/cuello-hero-video.mp4` (46 s, social framing removed, audio
kept) plays on the fourth hero slide: only while its slide is active, never
behind the age gate, never looping on its own — it advances the carousel
when it ends. **Sound**: unmuted autoplay is attempted first (the age-gate
click provides the user gesture most browsers require); if a browser still
refuses, playback falls back to muted and the on-slide speaker toggle lets
the visitor turn sound on with one tap. If the file is ever removed, the
slide removes itself automatically.
Poster: `assets/img/gallery/cuello-hero-video-poster.webp`.

Both supplied videos also appear in the Gallery under the **Videos** filter
(tap-to-play in the lightbox, stops on close). The hero video carries its
audio there too; the portrait beach video is silent. The audio is the
source recording's social-app music — rights must be confirmed (checklist).

### Adding a gallery video
1. Place the MP4 in `assets/video/` and a poster image in
   `assets/img/gallery/` (full + `-640` WebP).
2. Add to `GALLERY` in `data.js`:
   ```js
   { id: "my-video", type: "video", src: "assets/video/my-video.mp4",
     poster: "assets/img/gallery/my-poster", w: 1280, h: 720,
     category: "events",
     caption: { en: "…", es: "…" }, alt: { en: "…", es: "…" } }
   ```
   The "Videos" filter chip appears automatically. Videos use native
   controls, `playsinline`, `preload="none"`, never autoplay, and stop when
   the lightbox closes.

## Netlify deployment

Drag the contents of this folder (or the release ZIP) onto
[app.netlify.com/drop](https://app.netlify.com/drop) — `netlify.toml` sets
caching headers; no build command, **no form configuration needed** (the
site has no forms — enquiries go straight to WhatsApp, email and phone).

### Before production launch
- Confirm the WhatsApp number accepts WhatsApp (see checklist) — until
  then the `wa.me` links point at the main-office landline number as a
  provisional concept value.
- Replace the placeholder domain `https://cuellos-distillery-v1.netlify.app/`
  in every page's canonical/OG tags, `sitemap.xml` and `robots.txt`.
- Work through `CLIENT-CONFIRMATION-CHECKLIST.md`.

## Internal information tiers

1. **Verified public information** (presented as fact): company name; the
   slogan; the nine product names as shown on supplied packaging; the Rums
   of Belize trademark; "distilled, blended & bottled in Orange Walk Town"
   (printed on the labels); the three office addresses, phones and email.
2. **Design/copy treatment** (safe wording): "a longstanding Belizean
   distillery", undated timeline, neutral photo captions.
3. **Client confirmation required** — everything in
   `CLIENT-CONFIRMATION-CHECKLIST.md`. None of it is displayed as fact.

## Foundation for a future AI Employee
No AI features are installed or simulated (per brief). Structured content
data, centralized bilingual strings, and typed WhatsApp/email pathways give
a future AI Employee clean integration points.
