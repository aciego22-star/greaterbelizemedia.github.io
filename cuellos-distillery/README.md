# Cuello's Distillery Ltd. — Website Concept V1

**"The Spirit of Orange Walk"** — a nine-page, bilingual (EN/ES), mobile-first concept
website for Cuello's Distillery Ltd., Orange Walk Town, Belize.
Developed by [Austere Automations](https://austereautomations.com/).

> **Status: meeting-ready V1 concept.** The current Cuello's production website
> remains live and untouched. This concept deploys to a temporary
> Austere-controlled Netlify domain only. Do not connect it to the production
> domain until every item in `CLIENT-CONFIRMATION-CHECKLIST.md` is resolved.

---

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `our-story.html` | Our Story |
| `our-spirits.html` | Our Spirits (9 products, interactive drawer) |
| `cocktails.html` | Cocktails & Recipes (concept serves) |
| `news-events.html` | News & Events (sample stories, data-driven) |
| `gallery.html` | Gallery (filterable, lightbox, video-ready) |
| `locations.html` | Where to Find Us (3 offices) |
| `trade.html` | Trade & Distribution (Netlify form) |
| `contact.html` | Contact (Netlify form) |
| `404.html` | Not-found page (Netlify serves it automatically) |

## Architecture

- **Static HTML + shared CSS + modular vanilla JS.** No build step, no framework,
  no external dependencies. Fonts (Fraunces + Manrope) are self-hosted in
  `assets/fonts/`.
- **All content data** (products, cocktails, news, gallery manifest) lives in
  `assets/js/data.js`. Edit that one file to update those sections.
- **All EN/ES interface copy** lives in `assets/js/i18n.js` as a single
  dictionary. Elements are tagged `data-i18n="key"`. Language choice persists
  across pages via `localStorage` and updates the `<html lang>` attribute.
- **Age gate** (`assets/js/age-gate.js`): full-screen accessible 18+ gateway on
  every page. Confirmation persists in `localStorage` ("remember me") or
  `sessionStorage`; if storage is unavailable it degrades to per-page memory.
  Focus is trapped while open, page scroll is locked, focus returns on close.
  The footer "Reset age verification" link re-opens it. Page content stays in
  the HTML, so search engines index normally. A `<noscript>` banner carries the
  age message and contact details without JavaScript.
- The header/footer markup is repeated identically on each page (generated from
  shared templates). If you edit the header or footer, apply the same change to
  all ten HTML files.

## Editing quick reference

| Change | Where |
|---|---|
| Product name / description / accent colour | `assets/js/data.js` → `PRODUCTS` |
| Product sizes & ABV (once confirmed) | `assets/js/data.js` (replace the `common.tbc` usage in `assets/js/spirits.js` spec list with real fields) |
| Cocktail cards / official recipes | `assets/js/data.js` → `COCKTAILS` |
| News stories | `assets/js/data.js` → `NEWS` (set `featured: true` for the lead story; remove the `news.sampleBadge` badge logic in `main.js` when publishing real stories) |
| Gallery photos & videos | `assets/js/data.js` → `GALLERY` (see `ASSET-REPLACEMENT-GUIDE.md`) |
| Any interface/editorial text, EN or ES | `assets/js/i18n.js` |
| Colours, spacing, typography | `assets/css/main.css` (`:root` custom properties) |

### Adding a gallery video
1. Place the MP4 in `assets/video/` and a poster image in `assets/img/gallery/`
   (full size + `-640` variant, WebP).
2. Add to `GALLERY` in `data.js`:
   ```js
   { id: "my-video", type: "video", src: "assets/video/my-video.mp4",
     poster: "assets/img/gallery/my-poster", w: 1280, h: 720,
     category: "events",
     caption: { en: "…", es: "…" }, alt: { en: "…", es: "…" } }
   ```
   The "Videos" filter chip appears automatically. Videos never autoplay; they
   play only when the visitor opens them in the lightbox, and stop when it closes.

### Activating a hero video
Drop the file at `assets/video/cuello-hero-video.mp4`, then in `index.html`
swap the hero `<img>` for the commented-out `<video>` block directly below it
(poster, mute, loop, playsinline and a pause control are already wired).

## Netlify deployment

1. Drag-and-drop the contents of this folder (or the release ZIP) onto
   [app.netlify.com/drop](https://app.netlify.com/drop), or connect the repo
   and set the publish directory to this folder.
2. `netlify.toml` sets caching headers; no build command is needed.

### Netlify Forms — REQUIRED post-deploy configuration
The `contact` and `trade-enquiry` forms use Netlify Forms (`data-netlify`,
honeypot spam protection, AJAX submit with success/error states and a mailto
fallback). **Submissions are collected by Netlify but nobody is notified until
you configure it:**

1. Netlify dashboard → *Site* → *Forms* → verify both forms were detected
   after the first deploy.
2. *Forms → Notifications* → add an **email notification** to
   `mainoffice@cuellosdistilleryltd.bz` (and/or an Austere address) for each form.
3. Submit a test on the live site and confirm receipt end-to-end.
Until this is done, the on-page success message only means "stored in Netlify".

### Before production launch
- Replace the placeholder domain `https://cuellos-distillery-v1.netlify.app/`
  in: every page's `<link rel="canonical">` + OG/Twitter URL tags,
  `sitemap.xml`, and `robots.txt`.
- Work through `CLIENT-CONFIRMATION-CHECKLIST.md` (facts, Spanish review,
  assets, social links).

## Internal information tiers

1. **Verified public information** (presented as fact): company name; Orange
   Walk heritage positioning; the slogan; the nine product names; the Rums of
   Belize trademark; the three office addresses, phone numbers and the
   `mainoffice@` email.
2. **Design/copy treatment** (safe wording, no factual claims): "for
   generations", concept serves without measures, sample news stories (badged),
   timeline without dates.
3. **Client confirmation required** — everything in
   `CLIENT-CONFIRMATION-CHECKLIST.md`. None of it is displayed as fact on the
   site.

## Foundation for a future AI Employee
No AI features are installed or simulated in V1 (per brief). The groundwork an
AI Employee would need is in place: structured content data (`data.js`),
centralized bilingual strings (`i18n.js`), typed enquiry forms with clear
categories, and clean per-page URLs.
