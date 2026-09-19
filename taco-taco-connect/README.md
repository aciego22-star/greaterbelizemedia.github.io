# Taco Taco Connect

A standalone, mobile-first digital connect page for **Taco Taco Mexican Restaurant**,
11 Aloe Vera Ave, Belmopan, Belize, built for deployment to
**https://connect.tacotaco.bz**.

This is an independent project. It shares Taco Taco's branding but has no code,
build step or dependency in common with the main tacotaco.bz site.

---

## Contact details

Every link is live. They all come from one `BUSINESS` object at the top of the
inline `<script>` near the end of `index.html`, which feeds the hero button, the
link cards, the social rows, the footer and the structured data. Change a number
there and it changes everywhere.

| Key | Value |
|---|---|
| `whatsapp` | `5016134677` |
| `phone` / `phoneDisplay` | `+5018022322` / `802-2322` |
| `facebook` | `https://www.facebook.com/share/1Lk9sxpoox/` |
| `instagram` | `https://www.instagram.com/tacotacomexicanrestaurant/` |
| `tiktok` | `https://www.tiktok.com/@tacotacomexicanfood` |
| `website` | `https://tacotaco.bz` |
| `menu` | `https://tacotaco.bz/#menu` |

Two of those are worth a second look before this runs for long:

- **Facebook** is a `/share/` redirect link, which is what the Share sheet hands
  you. It works, but those links are tied to a share session rather than to the
  page itself. A permanent page URL (`facebook.com/YourPageName` or
  `facebook.com/profile.php?id=…`) is the safer thing to ship. Two share links
  were supplied; this is the first of them.
- **Instagram** arrived with a `?stkn=` share token on it. That token is personal
  and expires, so it was stripped. The plain profile URL above is the one that
  keeps working.

Opening hours live in the `HOURS` table right below `BUSINESS`, indexed Sunday
first to match `Date.getDay()`.

A value left as a placeholder (anything containing `XXXX` or `PLACEHOLDER`) is
still handled the way it was: hidden on the live domain, shown greyed out and
labelled on `localhost` and Netlify previews. That safety net stays in place for
whatever you change next.

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
   before any cards are printed**, the QR encodes an `https://` URL.

`netlify.toml` already sets caching, security headers and a couple of redirects.
Note the caching rule: `/assets/*` is cached for a year, but HTML is
`must-revalidate`, so a printed card never pins visitors to a stale page.

---

## Files

```
index.html                the whole page, markup, styles and script in one file
print.html                print-ready cards (5 formats, EN/ES)
assets/
  logo-source.jpg         the supplied Taco Taco artwork; everything below is cut from it
  mascot.webp             hero mascot, 784x620, transparent
  mascot-400.webp         same at 392w, for the srcset
  mascot.png              quantised fallback for browsers without WebP
  favicon.png             64px app icon
  favicon-96.png          96px and 192px, the sizes Google prefers
  favicon-192.png
  apple-touch-icon.png    180px
  icon-192.png            manifest icons
  icon-512.png
  og-image.jpg            1200x630 social sharing image
  qr.svg                  standalone QR, if you need the code on its own
  qr-path.txt             the generated path data, pasted inline into both pages
  mascot-sleep*.webp/png  the sleeping mascot, only fetched when the restaurant is shut
  mascot-qr.png           320px copy for the QR centre
tools/extract-mascot.py   cuts the mascot out of logo-source.jpg and builds every icon
tools/make-sleeping-mascot.py  derives the sleeping mascot from the awake one
tools/make-qr.py          regenerates the QR (only if the URL ever changes)
tools/make-llms-txt.py    rewrites llms.txt from BUSINESS and HOURS
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
walks straight through the right boot and eats the leg, the script pre-marks the
linework as an impermeable wall to stop that. And the mascot overlaps the white
"sticker" edging of the TACO wordmarks behind it, which a fill happily keeps; that
edging is removed afterwards using the one property that separates it from the
mascot's own whites (eyes, teeth, cuffs): it touches the background, they are
sealed inside the outline.

The app icons use the mascot's **head** on a gold tile, not the whole figure. The
full figure is unreadable by 32px, and the dark sombrero needs a light ground 
green, gold, orange and cream were compared at 16px before settling on gold.

---

## Colour and the taco field

The whole document sits on one gradient, painted by `.page::before`: the logo's
red at the top, through orange to gold across the middle, and back to red at the
foot. There is no second background and no fade band. The deep Taco Taco green is
still everywhere, but as the *surface* colour, not the ground: every panel in the
lower half is solid green, which is what gives the page its contrast now that the
colour runs top to bottom.

That flip is why some things are styled the way they are. On the orange, text is
deep green and the link cards are solid cream, because translucent white over a
saturated ground muddies both the surface and the type on it. Inside the green
panels the original cream-on-dark treatment stands. Social buttons are cream
tiles carrying each brand's own colour, which is also what stops TikTok's
near-black mark from disappearing.

`.taco-field` sits between the ground and the content, spanning the full document
height, and holds two things: a tiled layer of the logo's outlines that drifts
diagonally (travelling exactly one tile, so the loop is seamless), and 22 loose
tacos, limes, chillies and corn that turn slowly, alternating direction, the
whole way down the page. Both are transform animations on composited layers.

The z-order is the part to be careful with: `.page` is the stacking context, the
ground is at `-3`, the taco field at `-2`, and everything else stacks normally
above them. The zones deliberately do **not** create their own stacking contexts,
because that is what would trap the taco field behind a section's background.

## The Taco Orbit

The hero is the signature element: the mascot floats above a bright ring, with
line-art produce drifting at three different depths behind it (separate from the
page-wide taco field, and closer in). The ring was a glowing gold gradient when
the page ran on near black; on the orange it would have vanished, so the ring
became the bright element (cream and white with a deep shadow) and the ground
became the warm one.

It is pure CSS, a conic gradient masked into a ring, `transform` on a handful of
composited layers, and keyframes. No WebGL, no animation library, no canvas.
On desktop the pointer drives a light parallax (a single rAF-throttled handler);
on touch devices the layers move on their own. Cards lean up to 3.5° toward the
cursor on desktop and depress on tap.

`prefers-reduced-motion: reduce` disables all of it, the page-wide taco field and
the bobbing social buttons included, and restores an explicit resting pose for
every layer, so the static state is a composed image rather than a collapsed one.

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
decoding, so **if you resize a card, re-check the QR** rather than letting it
scale along with it.

The QR encodes `https://connect.tacotaco.bz/` at error-correction level H, which
is what allows the mascot in the centre (13% of the area, well inside what level H
recovers). The white plate behind it is what costs modules; the artwork inside
costs nothing extra. Every format was re-decoded after the mascot went in. Printed cards outlive deploys, so **this URL must never
change**. If it ever has to, run `pip install segno && python3 tools/make-qr.py`
and re-paste `assets/qr-path.txt` into both HTML files, and reprint everything.

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

## Search, answer engines and AI

The page is one URL, `https://connect.tacotaco.bz/`, and everything points at it:
canonical, Open Graph, sitemap, the QR payload and the structured data all agree.

**Findability.** `robots` allows a full-size image and an untruncated snippet.
The Spanish version lives at `?lang=es`, declared as an `hreflang` pair with
`x-default`; because it is the same document, the script re-points the canonical,
`og:url` and `og:locale` at whichever of the two is actually being viewed, so the
pair resolves instead of one swallowing the other. The sitemap declares the same
pair. One `h1`, no skipped heading levels.

**Structured data** is a linked `@graph` rather than a lone node: `Restaurant`,
`WebSite`, `WebPage` and two `ImageObject`s, cross-referenced by `@id` so an
engine that finds any one of them can resolve the rest. The phone, opening hours,
social profiles, menu and a pair of `OrderAction`s (WhatsApp and phone) are filled
in at runtime from the same `BUSINESS` and `HOURS` tables the visible page reads,
so the machine-readable copy cannot drift from the human one.

Deliberately absent: **coordinates, price range and any rating**. None are
verified, and structured data is exactly where inventing them does damage, since
it is the copy machines trust. If you get the restaurant's Google Business
Profile, its coordinates and price range can be added from there.

**`llms.txt`** at the root is a plain-text brief for AI assistants: the same
facts, in a form that needs no rendering. It is generated by
`tools/make-llms-txt.py` from the page's own config, not hand-written, so it
cannot go stale. Re-run it after changing a number or a link.

**`robots.txt` explicitly welcomes the AI crawlers** (GPTBot, ClaudeBot,
PerplexityBot, Google-Extended, Applebot-Extended and others). That is the one
setting here that is a business decision rather than a technical one: it makes
the brand quotable inside AI answers. Delete those blocks to opt back out.

**Experience.** A skip link jumps keyboard users past the tall hero straight to
the links. Touch targets are 44px, the page holds at 320px wide, and the whole
thing is a handful of requests with no framework.

Nothing here adds a question-and-answer section, by request.

## Favicon

`/favicon.ico` sits at the site root with 16, 32 and 48px frames inside it,
because Google checks that path before anything the page declares, and renders
whatever it finds at 48x48. The page also declares 96px and 192px PNGs, both
multiples of 48, which is what Google's own guidance asks for. All of them are
square and none are blocked by `robots.txt`.

**Do not move or rename these files.** Google caches favicons by URL and
re-crawls them on its own schedule, so changing the path drops the icon out of
search results until it comes back round. Regenerate them in place with
`tools/extract-mascot.py` instead.

It will not appear in search results the day you deploy: the page has to be
indexed first, and Google then fetches the icon separately. Days to weeks is
normal.

## Opening hours

Monday to Thursday 10:00 AM to 8:00 PM, Friday to Sunday 6:00 AM to 8:00 PM.

They appear in four places, all fed by the same `HOURS` table: the panel under
the link cards, the `openingHoursSpecification` in the structured data (built by
collapsing consecutive days with matching hours into one entry), the live chip in
the hero, and whether the mascot is awake or asleep.

When the restaurant is shut the mascot falls asleep: arms down, eyes closed, a
small open mouth and a z drifting up from it, and the hero's float slows to
something more like breathing. The moment it opens he is back to normal. The
sleeping artwork is a second image, only fetched when it is actually needed, and
a browser that cannot work out the time never shows it, because the awake mascot
is the default.

`tools/make-sleeping-mascot.py` derives that image from the awake one, so it can
be rebuilt whenever the artwork changes. Three things in it are worth knowing
before touching the numbers. The arms are cut from the top corners (where the
artwork has nothing else) and rotated about the shoulder; the cut is dilated
first or the anti-aliased rim of the raised fists is left behind as a ghost, and
the rotated arms composite behind the body, which is where a resting arm sits.
The eyes and grin are removed by interpolating each row between its nearest
clean pixels left and right rather than by inpainting, which dragged the dark
moustache across the mouth; the interpolation also refuses to run when the
nearest clean pixel is the shell's outline or the background, which is what was
putting a dark streak across the chin. And the moustache is left alone, because
the face stops reading as Taco Taco without it.

The status chip is computed in **America/Belize**, never the visitor's own timezone.
Belize is UTC-6 year round with no daylight saving, so the restaurant's clock is
the only correct one, and a QR code gets scanned by people whose phones are set
to anywhere. If the browser cannot resolve that timezone the chip hides itself
rather than guessing: a wrong "Open now" sends somebody to a closed restaurant.
It refreshes every minute, so it stays right across an opening or closing time
without a reload.

## Analytics

No analytics provider is installed, the page just emits events, so you can drop
in whatever you use later without touching the markup.

Every tracked element carries `data-track="<event name>"`, and one delegated
listener forwards the event to `dataLayer` (GTM), `gtag`, Plausible and Fathom if
any of them are present, and also fires a `connect:track` DOM event.

```
connect_whatsapp_click     connect_facebook_click     connect_call_click
connect_menu_click         connect_instagram_click    connect_maps_click
connect_website_click      connect_tiktok_click       connect_print_click
connect_language_switch    connect_austere_click
```

Both the hero CTA and the WhatsApp card report `connect_whatsapp_click`; each
event carries the destination URL and the current page language.

To add GA4, put the gtag snippet in `<head>`, everything else is already wired.

---

## Performance

First view is **4 requests**: the HTML (18.7 KB gzipped, 15.6 KB brotli), the
mascot, and the Archivo Black webfont from Google Fonts. The mascot is served
through a `srcset`, so a standard-density phone pulls the 392w WebP (23 KB) and a
retina screen the 784w (47 KB), roughly 58 KB and 82 KB over the wire in total.
Everything else, all icons, the QR, the background texture, the entire orbit 
is inline SVG or CSS. No images to lazy-load, no video, no framework.

The font is loaded non-blocking and the page renders in the system stack until it
arrives, so nothing waits on it.

---

## Sources

The business name, address, website, "Mexicali-style", the menu categories, the
phone and WhatsApp numbers, the three social links and the opening hours were all
supplied directly. The artwork is the real logo, stored at
`assets/logo-source.jpg`.

Two values are derived rather than supplied, and are worth a glance:

- **Maps link** is built as a Google Maps search for the business name and
  address rather than a Place ID. It works, but if Taco Taco has a Google
  Business Profile, its share link is better and should replace `BUSINESS.maps`.
- **Menu link** points at `https://tacotaco.bz/#menu`. Confirm that anchor exists
  once the revised main site goes up.

The footer credits Austere Automations and links to
`austereautomations.com/website-development-belize`.
