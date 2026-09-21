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
| `phone` / `phoneDisplay` | `+5018022332` / `802-2332` |
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
  mascot.webp             hero mascot, 1114x824, transparent
  mascot-400.webp         same at 557w, for the srcset
  mascot.png              quantised fallback for browsers without WebP
  favicon-48.png          48, 96 and 192px: every size Google might pick is a
  favicon-96.png          multiple of 48, which is what its guidance asks for
  favicon-192.png
  apple-touch-icon.png    180px
  icon-192.png            manifest icons
  icon-512.png
  og-image.jpg            1200x630 social sharing image
  qr.svg                  standalone QR, if you need the code on its own
  qr-path.txt             the generated path data, pasted inline into both pages
  mascot-sleep*.webp/png  the sleeping mascot, only fetched when the restaurant is shut
  mascot-coffee*.webp/png the morning mascot, only fetched during the coffee window
  mascot-qr.png           320px copy for the QR centre
  snore.mp3               6.9s, fetched only when somebody taps the sleeping mascot
tools/extract-mascot.py   cuts the mascot out of logo-source.jpg and builds every icon
tools/make-sleeping-mascot.py  derives the sleeping mascot from the awake one
tools/make-coffee-mascot.py    derives the morning mascot from the awake one
tools/mascot_lib.py            the arm, face and seam-fill machinery both share
tools/make-qr.py          regenerates the QR (only if the URL ever changes)
tools/make-snore.py       synthesises assets/snore.mp3
tools/make-og-image.js    re-renders og-image.jpg from tools/og-image.html
tools/og-image.html       the sharing card, rendered at 1200x630
tools/archivo-black-latin.woff2  the card's headline font, build-time only
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

That one command rewrites the mascot (WebP at two widths plus a PNG fallback),
the small copy that sits in the middle of the QR, and every app icon. Replace
`logo-source.jpg` and re-run it if the artwork is ever updated, then re-run
`tools/make-sleeping-mascot.py` and `tools/make-og-image.js`, which both derive
from it, and update the mascot's `width`/`height` and `srcset` widths in
`index.html` and `print.html` to the new pixel size the script prints.

The script needs one hand-set value: `MASCOT_SEED`, a point inside the mascot in
source-image pixels. The mascot sits somewhere different each time the logo is
redrawn and the image centre is not reliably inside it, so the script exits
rather than guess.

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

`/favicon.ico` sits at the site root, because Google checks that path before
anything the page declares. Google's rule is that the icon must be a square
that is a multiple of 48px, so every size it could land on here is one: the
page declares 48, 96 and 192px PNGs, and the .ico carries 96 and 48 alongside
the 32 and 16 that browser tabs render more crisply.

**Order inside the .ico matters.** Pillow writes the directory smallest first,
which put a 16x16 in front, and anything that takes the first entry would have
been handed a size that fails Google's rule. `tools/extract-mascot.py` writes
the directory by hand instead, largest first, so a reader gets a compliant icon
whether it takes the first entry or the biggest. The same applies to
`site.webmanifest`: its first icon is a 192, not the 64px one that used to sit
there.

All of them are square and none are blocked by `robots.txt`.

**Do not move or rename these files.** Google caches favicons by URL and
re-crawls them on its own schedule, so changing the path drops the icon out of
search results until it comes back round. Regenerate them in place with
`tools/extract-mascot.py` instead.

It will not appear in search results the day you deploy: the page has to be
indexed first, and Google then fetches the icon separately. Days to weeks is
normal.

## Opening hours

Monday to Thursday 10:00 AM to 8:00 PM, Friday to Sunday 8:00 AM to 8:00 PM.

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

### Three times of day

The page has three states, not two, driven by one `[data-phase]` attribute on
`<html>`:

| phase | when | mascot | callout |
|---|---|---|---|
| `open` | trading | arms up, wide awake | we're open, or closing soon in the last two hours |
| `dawn` | 7am until opening | one arm down, coffee in hand, heavy lids | opening soon |
| `night` | everything else | arms down, eyes closed, z's | none |

`dawn` is defined as *from seven until today's opening time*, not as a list of
days, which is why correcting the Friday to Sunday opening from six to eight
needed no code change: those days now get a one hour window from seven, and
Monday to Thursday still get three. Change the hours and the window follows.

`data-open` still carries open/closed for the status chip and anything that only
cares whether you can order. `data-phase` carries the mood. They are not the
same question: at half past eight on a Monday the restaurant is closed but the
mascot is very much awake.

The whole page goes with him. After close a second ground layer fades in over
the day gradient, taking it into the plum and ember range a Belmopan sky
actually goes at dusk; a moon and a scatter of stars come up behind the orbit,
and the tacos drifting down the page slow to about two fifths of their daytime
pace. It is a fade rather than a swap because at eight o'clock the page is
already open in somebody's hand. It does not fade on load, though: the script
reads the clock after first paint, and without the `can-dusk` guard a visitor
arriving at ten at night would watch the page start bright orange and sink.

Everything keys off the one `[data-open]` attribute on `<html>`, so there is a
single source of truth for the hour and no second clock to drift.

Two colour tokens exist that look like one. `--on-warm` is ink on a cream
surface, a link card or the language pill, and stays dark at every hour.
`--on-ground` is type sitting directly on the page gradient, and that one goes
cream after dark. They were the same value until the night palette needed them
apart, which is worth remembering before reaching for either.

### Language

The page reads the visitor's phone. `navigator.language` starting with `es`
gets Spanish, everything else gets English, so a phone set to `es-MX`,
`es-ES`, `es-419` or plain `es` all land in Spanish and `fr-FR` or `pt-BR`
fall back to English rather than to nothing.

Order of precedence: a `?lang=` in the URL wins, then a choice the visitor
made before, then the phone. **That middle one is worth remembering when you
test:** tap EN once on your own phone and that choice is saved, and the page
will keep showing you English no matter what your phone is set to. It is
stored under `tt-connect-lang`. To see the detection behave, open the page in
a private tab.

The EN/ES switch stays because an explicit choice should beat a guess: a
Spanish speaker on a borrowed English phone, or the other way round, needs a
way through.

### The callout

A small badge announces the moment rather than the hours: **Opening soon** in
gold through the coffee window, **We're open, stop on by** in green while
trading, and **Closing soon, last call** in red for the final two hours.
Nothing at night, which is what gives the other three meaning.

It pops in, holds about five and a half seconds, pops out and comes back
somewhere else, touring three spots. The mascot fills the middle three quarters
of the orbit and the side margins are narrower than the badge, so the only
positions that do not cover his face are above him and below him; top right is
out because that is where the coffee is. That leaves top left, bottom right and
bottom left.

Three things keep it from costing anything. It is `pointer-events:none`, so a
tap always reaches whatever is under it, which matters because the one control
it must never interfere with is the WhatsApp button. It is absolutely
positioned inside the orbit, so nothing reflows when it moves. And it is
`aria-hidden`, because the status chip already states the same thing once and a
looping element that keeps re-announcing itself is miserable on a screen
reader.

It runs on a timer rather than a long keyframe, because a timer is the readable
version and can be stopped: it stops when the tab is hidden, and it does not
run at all for a visitor who asked for reduced motion. For them the badge is
simply there, in one place, not flickering.

`LAST_CALL` is the number of minutes before closing that "soon" starts, and it
reads the hours table, so it follows if the hours change.

### The morning mascot

`tools/make-coffee-mascot.py` builds him from the awake artwork. Three decisions
are worth knowing before touching it.

**The raised arm does not move.** Every rotation that brings the right fist down
to mug height pushes the elbow past the right edge of the canvas, and widening
the canvas would give this pose a different aspect ratio from the other two,
which would jump the hero layout when the clock rolls over. A mug held up in the
hand that is already up costs nothing. Only the left arm comes down, which is
what stops the pose reading as a cheer.

**The lids are clipped to the eye whites**, not drawn as free shapes, so they
follow the real outline and land correctly whatever the logo does next. They
cover the top 55% and leave the pupils showing, which is what separates
"heavy-lidded" from "asleep" at a glance.

**The grin is left alone.** Erasing it means interpolating the face tone across
the whole lower half; the sleeping pose gets away with that because everything
else there has changed too, but on an otherwise crisp face it reads as a smear.
He is pleased about the coffee.

The mug is the one element with no source in the artwork, so it is drawn: flat
fills inside a heavy outline, which is the grammar the rest of the logo already
uses, and brand colours. Its steam is CSS on the page, like the z's, so it
drifts and no crawler ever sees it.

`tools/mascot_lib.py` holds what this and the sleeping tool share: the arms cut
from the corners and rotated about the shoulder, the face found in the artwork
rather than measured, and the seam fill. It was extracted from the sleeping tool
without changing a line of its logic, and the sleeping images it produces are
byte-identical to the ones from before the split.

### The snore

Tap the sleeping mascot and he snores. The whole figure is the button, with a
badge in the corner so it reads as tappable, and it only exists while he is
asleep: the script sets `hidden` the moment he wakes, which takes it out of the
tab order and the accessibility tree as well as off the screen.

The audio element is built on the first tap and not before, so the 41 KB costs
nothing for the many visitors who never ask for it, and nothing is fetched at
all during opening hours. `play()` is allowed to fail and is expected to: a
phone on silent, a tab the browser has muted, a battery saver. That is why the
animation is not conditional on it. **The tap always does something visible** -
he takes one deep breath and the z's puff out - because a large share of the
phones reaching this page are muted, and a tap that appears to do nothing reads
as a broken page.

A tap runs for about seven seconds: three breaths of 2.31s. It is one file of
three rather than one breath looped, because an mp3 is not reliably gapless
across browsers and the seam would tick, and because three identical breaths
sound like a machine. The `BREATHS` table in the generator varies the pitch,
length and weight of each one; add or remove an entry to change how long a tap
lasts, and keep `SNORE_MS` in `index.html` a little longer than the total the
script prints.

`tools/make-snore.py` synthesises the sound rather than buying one. A licensed
sample means an account, a receipt and a renewal for seven seconds of audio, and
a real snore recorded off a person sounds like a person rather than a cartoon
taco. The rattle is the whole trick: a snore reads as a snore because a low buzz
is chopped by the soft palate around thirty times a second, and `RATTLE_HZ` is
the first thing to change if it sounds wrong. To use a real recording instead,
drop it in at `assets/snore.mp3`; the page only ever asks for that one path.

`tools/make-sleeping-mascot.py` derives that image from the awake one, so it can
be rebuilt whenever the artwork changes. Only the arms are measured by hand,
two corner boxes and the two shoulders they pivot about; the eyes, the moustache
and the grin are found in the artwork, so a redraw usually needs four numbers
updated rather than a dozen. Run it with `--debug` to write
`mascot-sleep-debug.png`, which paints what it found.

Four things in it are worth knowing before touching the numbers. The arms are
cut from the top corners (where the artwork has nothing else) and rotated about
the shoulder; the cut is dilated first or the anti-aliased rim of the raised
fists is left behind as a ghost, and the rotated arms composite behind the body,
which is where a resting arm sits. The face is one connected mass of dark
linework, eye outlines, moustache and mouth all touching, so the moustache is
found by elimination rather than by a flood fill: it is the dark blob left once
the eyes and everything at or below the teeth are taken away. The eyes and grin
are removed by interpolating each row between its nearest clean pixels left and
right rather than by inpainting, which dragged the dark moustache across the
mouth; at the corners of the smile the only face tone is on one side, so that
one is carried across rather than leaving a white sliver of the grin behind. And
the moustache is left alone, because the face stops reading as Taco Taco without
it, which is also why the grin is bounded by the moustache's own lower edge,
column by column: a single ellipse is too narrow where the smile curls up.

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
through a `srcset`, so a standard-density phone pulls the 557w WebP (45 KB) and a
retina screen the 1114w (92 KB), roughly 80 KB and 127 KB over the wire in total.
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
