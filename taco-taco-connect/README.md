# Taco Taco Connect

A standalone, mobile-first digital connect page for **Taco Taco Mexican Restaurant**,
11 Aloe Vera Ave, West Belmopan, Belize — built for deployment to
**https://connect.tacotaco.bz**.

This is an independent project. It shares Taco Taco's branding but has no code,
build step or dependency in common with the main tacotaco.bz site.

---

## ⚠️ Before you deploy: five values must be filled in

The page ships with five contact values left as placeholders, because they could
not be verified from the main site (see *Unverified data* below). **Open
`index.html`, find the `BUSINESS` object at the top of the inline `<script>` near
the end of the file, and replace these:**

| Key | What it needs | Example |
|---|---|---|
| `whatsapp` | Ordering number, digits only, country code first, no `+` or spaces | `5016123456` |
| `phone` | Dialable number for the `tel:` link | `+5016123456` |
| `phoneDisplay` | How the number is written on the main site | `+501 612-3456` |
| `facebook` | Full page URL | `https://www.facebook.com/tacotacobz` |
| `instagram` | Full profile URL | `https://www.instagram.com/tacotacobz` |
| `tiktok` | Full profile URL | `https://www.tiktok.com/@tacotacobz` |

Also confirm `menu` points at the real menu page or anchor on tacotaco.bz. It
currently defaults to `https://tacotaco.bz/#menu`.

**Until a value is filled in, that link does not go live.** On the real domain the
whole card is removed, so a customer can never tap a dead or wrong link. On
`localhost` or a `*.netlify.app` preview the card is shown greyed out and labelled
"link not set", and the browser console lists everything still outstanding. That
is deliberate: a wrong phone number on a restaurant page is worse than a missing
one.

Nothing else needs editing. There is one `BUSINESS` object and it feeds the hero
CTA, the link cards, the social rows, the footer and the structured data.

---

## Deploying to Netlify

Static files, no build step.

1. **New site → import this repository** (or drag the `taco-taco-connect` folder
   into Netlify Drop).
2. Settings:
   - Base directory: `taco-taco-connect`
   - Build command: *(leave empty)*
   - Publish directory: `taco-taco-connect`
3. **Domain settings → Add custom domain → `connect.tacotaco.bz`**, then add the
   `CNAME` record Netlify shows you at your DNS provider.
4. Let Netlify provision the Let's Encrypt certificate. **HTTPS must be working
   before any cards are printed** — the QR encodes an `https://` URL.

`netlify.toml` already sets caching, security headers and a couple of redirects.
Note the caching rule: `/assets/*` is cached for a year, but HTML is
`must-revalidate`, so a printed card never pins visitors to a stale page.

---

## Files

```
index.html                the whole page — markup, styles and script in one file
print.html                print-ready cards (5 formats, EN/ES)
assets/
  logo-source.jpg         the supplied Taco Taco artwork; everything below is cut from it
  mascot.webp             hero mascot, 784x620, transparent
  mascot-400.webp         same at 392w, for the srcset
  mascot.png              quantised fallback for browsers without WebP
  favicon.png             64px app icon
  apple-touch-icon.png    180px
  icon-192.png            manifest icons
  icon-512.png
  og-image.jpg            1200x630 social sharing image
  qr.svg                  standalone QR, if you need the code on its own
  qr-path.txt             the generated path data, pasted inline into both pages
tools/extract-mascot.py   cuts the mascot out of logo-source.jpg and builds every icon
tools/make-qr.py          regenerates the QR (only if the URL ever changes)
netlify.toml              deploy config, headers, redirects
site.webmanifest, robots.txt, sitemap.xml
```

### The mascot and icons

All of it is cut from the official Taco Taco artwork at
`assets/logo-source.jpg` by `tools/extract-mascot.py`:

```
pip install opencv-python-headless numpy pillow
python3 tools/extract-mascot.py assets/logo-source.jpg
```

That one command rewrites the mascot (WebP at two widths plus a PNG fallback)
and every app icon. Replace `logo-source.jpg` and re-run it if the artwork is
ever updated.

Two things in that script are worth knowing before you touch it. The source is a
JPEG, so the mascot's black linework has softened edges and a plain flood fill
walks straight through the right boot and eats the leg — the script pre-marks the
linework as an impermeable wall to stop that. And the mascot overlaps the white
"sticker" edging of the TACO wordmarks behind it, which a fill happily keeps; that
edging is removed afterwards using the one property that separates it from the
mascot's own whites (eyes, teeth, cuffs): it touches the background, they are
sealed inside the outline.

The app icons use the mascot's **head** on a gold tile, not the whole figure. The
full figure is unreadable by 32px, and the dark sombrero needs a light ground —
green, gold, orange and cream were compared at 16px before settling on gold.

---

## The Taco Orbit

The hero is the signature element: the mascot floats above a glowing
yellow-to-orange gradient ring, with line-art tacos, limes, chillies, corn and
cilantro drifting at three different depths.

It is pure CSS — a conic gradient masked into a ring, `transform` on a handful of
composited layers, and keyframes. No WebGL, no animation library, no canvas.
On desktop the pointer drives a light parallax (a single rAF-throttled handler);
on touch devices the layers move on their own. Cards lean up to 3.5° toward the
cursor on desktop and depress on tap.

`prefers-reduced-motion: reduce` disables all of it and restores an explicit
resting pose for every layer, so the static state is a composed image rather than
a collapsed one.

---

## Print cards

`print.html` produces five formats, all on A4 with dashed cut guides:

The mascot appears on the table card, tent and poster; the business card and the
insert leave it out, because neither has room for it once the QR is at a
scannable size.

| Format | Card size | Per A4 | QR |
|---|---|---|---|
| Countertop / table card | 88 × 118 mm | 2 | 32 mm |
| Table tent (folds) | 180 × 124 mm | 2 panels | 40 mm |
| Business card | 85 × 55 mm | 8 | 26 mm |
| Packaging insert | 58 × 58 mm | 9 | 30 mm |
| Poster | full A4 | 1 | 70 mm |

Print at **100% scale**, **Background graphics on**, margins **None**.

**QR sizing is deliberate and verified.** The code is 33 modules plus 4 of quiet
zone (41 across) and needs roughly 0.6 mm per module to scan reliably off paper.
Every format above lands between 0.63 mm and 1.71 mm per module; all five were
rendered and decoded as a check. An earlier draft scaled the QR with the card and
put the business card at 0.45 mm and the insert at 0.42 mm, where the code stopped
decoding — so **if you resize a card, re-check the QR** rather than letting it
scale along with it.

The QR encodes `https://connect.tacotaco.bz/` at error-correction level H, which
is what allows the small taco emblem in the centre (13% of the area, well inside
what level H recovers). Printed cards outlive deploys, so **this URL must never
change**. If it ever has to, run `pip install segno && python3 tools/make-qr.py`
and re-paste `assets/qr-path.txt` into both HTML files — and reprint everything.

---

## English / Spanish

Every visible string is hand-translated and lives in the `I18N` object in
`index.html` (and a smaller one in `print.html`); nothing relies on browser
translation. The switch updates the text, the `<html lang>`, the page title, the
meta description, `aria-label`s and the WhatsApp pre-filled message.

Language is chosen by `?lang=es` in the URL, then a saved choice, then the
browser's language, defaulting to English. The choice is remembered across both
pages.

Adding a string: add the key to **both** `en` and `es`, then put
`data-i18n="yourkey"` on the element. Use `data-i18n-label` for `aria-label` and
`data-i18n-alt` for image alt text.

---

## Analytics

No analytics provider is installed — the page just emits events, so you can drop
in whatever you use later without touching the markup.

Every tracked element carries `data-track="<event name>"`, and one delegated
listener forwards the event to `dataLayer` (GTM), `gtag`, Plausible and Fathom if
any of them are present, and also fires a `connect:track` DOM event.

```
connect_whatsapp_click     connect_facebook_click     connect_call_click
connect_menu_click         connect_instagram_click    connect_maps_click
connect_website_click      connect_tiktok_click       connect_print_click
connect_language_switch
```

Both the hero CTA and the WhatsApp card report `connect_whatsapp_click`; each
event carries the destination URL and the current page language.

To add GA4, put the gtag snippet in `<head>` — everything else is already wired.

---

## Performance

First view is **4 requests**: the HTML (18.7 KB gzipped, 15.6 KB brotli), the
mascot, and the Archivo Black webfont from Google Fonts. The mascot is served
through a `srcset`, so a standard-density phone pulls the 392w WebP (23 KB) and a
retina screen the 784w (47 KB) — roughly 58 KB and 82 KB over the wire in total.
Everything else — all icons, the QR, the background texture, the entire orbit —
is inline SVG or CSS. No images to lazy-load, no video, no framework.

The font is loaded non-blocking and the page renders in the system stack until it
arrives, so nothing waits on it.

---

## Unverified data

`tacotaco.bz` is blocked by the network policy of the environment this was built
in, and the restaurant has no public listing that could be trusted as a source.
So the following came from the project brief and are treated as verified: the
business name, the street address, the website URL, "Mexicali-style", and the menu
categories named in the brand copy.

The WhatsApp number, phone number, Facebook, Instagram and TikTok URLs, and the
exact menu path **could not be verified and were not guessed**. They are the
placeholders listed at the top of this file.

The artwork is the real thing — supplied directly and stored at
`assets/logo-source.jpg`.

Two values *are* derived rather than copied, and are worth a glance before launch:

- **Maps link** — built as a Google Maps search for the business name and address
  rather than a Place ID. It works, but if Taco Taco has a Google Business
  Profile, its share link is better and should replace `BUSINESS.maps`.
- **Structured data** — the `Restaurant` JSON-LD carries only the name, address,
  website and cuisine. Phone and social profiles are added automatically once you
  fill them in. Opening hours are deliberately absent, and the page never claims
  the restaurant is currently open, because nothing here checks hours.
