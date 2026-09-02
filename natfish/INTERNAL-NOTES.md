# NATFISH website internal notes

**Internal only. Not linked from any page and not to be shared with the client.**

Nine-page site, V2. No canonical or Open Graph URL is set anywhere, so nothing ties the site to a
preview domain until a real one is approved.

---

## 1. What changed in V2

The client accepted the V1 concept and supplied real material. V2 replaces the concept photography and
the directory-sourced contact details with client-verified content.

| Area | V1 | V2 |
|---|---|---|
| Legal name | apostrophe spelling | `National Fishermen Producers Co-operative Society Ltd.` |
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
| 5 | **The NATFISH AI activation gate** | Half met. The intended embed **has** been supplied and is wired in. Still outstanding: separate confirmation that the Chatbase order flow itself is ready to conduct an order conversation. Nothing in this repository can establish that. **Confirm before the site goes public.** See §3c. |
| 6 | **A live order test** | None was run. No real order, email, webhook or lead was sent to NATFISH during testing. Every automated test that exercises the assistant stubs Chatbase locally; nothing left the machine. Authorise a test explicitly when you want one. |

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
| Legal name | `National Fishermen Producers Co-operative Society Ltd.` |
| General Manager | Ms. Denise O'Brien, `deniseobrien125@gmail.com` (Contact page only) |
| Primary office | `+501 227-3165` |
| Secondary office | `+501 227-8039` |
| Mobile / WhatsApp | `+501 628-1449` |
| General and orders | `nationalfishermen@gmail.com` |
| Address | `#1 Angel Lane, Belize City, Belize` |

`nationalfishermen@gmail.com` drives every primary CTA. The General Manager's address appears only on
the Contact page, tied to her card, so it never becomes the default reply-to for routine enquiries.

---

## 3a. Logo

Source of truth: `assets/img/natfish-logo-approved-final.png`, the client-approved artwork exactly as
supplied (1789x879, RGB). Regenerate every derivative with:

```
python3 tools/process-logo.py
```

| Asset | Where it is used |
|---|---|
| `natfish-logo-400/800/1200.png` | The complete lockup, via one srcset. Header on all nine pages, footer panel, About identity panel. |
| `natfish-icon.png` (180px) | Apple touch icon. Square crop of the circular emblem. |
| `favicon.png` (48px) | Browser tab. Same crop. |

**One lockup now, not two.** The earlier build carried a compact header lockup with the two
organization-name lines erased, because at header scale they fall to about 5px. The client has since
asked for the approved logo whole and unclipped in every placement, so the compact lockup is gone.

**The consequence is worth knowing before the client sees it.** The approved artwork is 2.035:1 with
three tiers of text. At the header's 62px (50px on a phone, 46px below 380px) the organization-name
lines render around 5px tall: present, unclipped, correctly proportioned, but not readable. Nothing can
change that except a taller header or a compact lockup, and the client has ruled out both. The name is
therefore also carried as **real selectable text** in the footer, in the About identity panel and in
every `<title>`, so nothing depends on reading it off the image. It is fully legible in the footer and
on About, where the logo runs at 300-380px.

**Two mechanical operations are applied to the artwork, and only these:**

1. **De-matting.** The supplied file is opaque RGB on white, but the About identity panel is sand, where
   a white rectangle would box the logo. The white is flood-filled to transparent inward from the four
   corners, so only background actually connected to the edge is cleared. A global white-to-transparent
   would punch holes through the lobster's pale speckles; this cannot. `process-logo.py` fails the build
   if the cleared area falls outside 25-85% of the frame.
   *Side effect:* the enclosed counters inside letters stay white, so the lockup must sit on a light
   panel. It already does everywhere.
2. **A square crop, for the icons only.** A tab is square and the logo is 2:1. The crop is
   `(30, 150, 697, 817)` - the emblem with the whole lobster, hand and sleeve, stopping 1px short of the
   wordmark's "N" at x=698. The logo itself is never cropped.

`aspect-ratio: 1789 / 879` is pinned in CSS on both `.logo img` and `.logo-full`. Without it, `width:
auto` resolves against whichever srcset derivative loaded, and integer rounding in the 400px tier
rendered the box at 2.030:1. Do not remove it.

**Hyphenation: settled.** The approved logo artwork reads "Co-operative", and the client has confirmed
that the artwork is the source of truth. The whole project now uses
**National Fishermen Producers Co-operative Society Ltd.** and the word is hyphenated in body copy too,
so nothing on a page contradicts the logo beside it. "Producers" carries no apostrophe. The QA sweep
fails on either the unhyphenated formal name or an apostrophe after "Producers".

Spanish is unaffected: "cooperativa" is the Spanish word and is not hyphenated. The English legal name
stays English inside Spanish copy, hyphen included.

---

## 3b. Homepage hero

Four images, in this order, set by the client:

| # | File | Subject | Provenance |
|---|---|---|---|
| 1 | `hero-lobster-diver-dock` | A diver walking up a dock with a string of spiny lobster and his fins. **Default slide.** | Client-supplied |
| 2 | `hero-2-boat-leaving-harbour` | A boat heading out of the harbour. | V1 concept pack |
| 3 | `hero-lobster-boat-catch` | Two fishers aboard a skiff, the hull full of lobster. | Client-supplied |
| 4 | `hero-trade-show-stand` | A Belizean Pride trade show stand, four people behind a table of lobster and conch cartons. | Client-supplied |

Slides 1 and 3 replaced the fisher with the conch catch and the two fishers at sunrise, at the
client's request. Their derivatives were **deleted**, not just unreferenced: the packaging step
refuses to ship an image nothing points at. Slide 4 was added afterwards to make four.

The carousel reads nothing from a slide count - `natfish.js` takes `.hero__slide` as it finds it -
so a fifth is a line in `HERO_SLIDES` plus an entry in `PAIRS`, `HERO_PAIRS`, `ALT` and `SHORT`.

**Two provenances, two folders, two alt-text rules.** Slides 1, 3 and 4 are the client's own
photography and sit in `assets/img/official/`. Slide 2 is from the original V1 concept pack and stays
in `assets/img/concept/`. That distinction matters and is easy to lose: the same concept pack produced
the storefront image that had to be destroyed for carrying a fabricated telephone number. Concept alt
text never says a person, vessel or catch belongs to NATFISH; the folder name is what keeps the next
person from reaching for a concept image as if it were documentary. `img_dir()` routes by the
`HERO_PAIRS` set, not by the `hero-` prefix.

**CLIENT CONFIRMATION REQUIRED.** The alt text for slides 1, 3 and 4 describes what is visible and
stops there - it does not state that the people, vessel or catch are NATFISH's. If Ms Denise confirms
these are NATFISH members and staff, and that the people photographed consented to the use, the alt
text can name NATFISH the way the processing-room photographs already do. `heroqa.js` asserts that no
hero alt text contains the string "NATFISH", so lifting that restriction is a deliberate act, not a
drift.

Slide 4 is the one that most invites an unsupported claim, so it is worth being explicit about what
the picture does and does not establish. The stand is unmistakably a Belizean Pride stand, and
Belizean Pride is NATFISH's own brand, so the alt text names the brand. It does **not** name the
event, the host country, the year, or any buyer or market, because none of those are supported - and
the site's standing rule is that no export market is asserted anywhere. The photograph does contain
readable detail a viewer may draw their own conclusions from (an adjacent exhibitor's seamoss panel,
flags on the display); none of it is described, captioned or relied on. If Ms Denise wants the event
named, she needs to supply the name and date and it becomes a News item, not hero alt text.

### Responsive pairs, and why the hero is art-directed

The client supplied slides 1, 3 and 4 as **pre-cropped pairs**: a 2400x1080 landscape frame and a
1080x1920 portrait frame of the same photograph. Both crops are published, and the browser picks
between them with a `media` query on the `<source>` - real art direction, not one file with a focal
point.

The switch is at **600px, not the 900px layout breakpoint**. Between the two the hero has already
stacked, but the frame there is still a wide band (768 x 380 on a tablet, about 2:1), and a 9:16
portrait file dropped into a 2:1 band keeps only a third of its height. The landscape crop is the
better source for that shape, so the art direction switches where the *frame* turns portrait-ish, not
where the layout stacks.

Both crops of slide 1 are preloaded, each behind its own `media`, so a phone fetches only the portrait
file and a desktop only the landscape one. Without `media` the browser speculatively fetches one and
then the other - two full hero downloads on first paint. Slides 2 and 3 are lazy: they sit behind
`opacity: 0` for at least seven seconds.

Regenerate with
`python3 tools/process-hero-images.py <pairs-dir> <v1-image-pack-dir>`.

**No overlay, by design.** The hero is a split layout: the headline, copy and buttons sit on their own
navy panel beside the photograph on desktop and above it on a phone. Nothing is ever drawn over a face,
so no darkening gradient is needed and none is applied. Do not add one; it would only make the
photographs murkier for no readability gain.

### Frame sizes and focal points

The phone frame is **`clamp(340px, 108vw, 430px)`** below 600px - roughly square, 421px tall at 390px
wide. It was a 300px band. The band existed for landscape sources; against the client's portrait crop
it showed barely a third of the picture, cutting the lobster - the whole subject - off the bottom of
both photographs. The taller frame is what makes their crop appear as they composed it. It is capped
at 430px so the photograph still fits on the first screen at every phone size down to 320x568, which
`herofold.js` asserts. Between 600 and 900px the older `clamp(300px, 62vw, 380px)` band still applies,
where the landscape crop is being served.

Focal points apply to **slide 2 and the two water shots only**. Every pair slide is served a crop the
client composed for the frame it is filling, so on a desktop they all keep the default centre -
overriding it would undo their framing. On a phone the frame is not the crop's own 9:16, so about 60%
of the height shows and the window has to be placed:

- **Slides 1 and 3** are pushed down to `50% 72%`, landing on 0.28-0.89 of the file: below the head,
  above the feet. That is the one window holding the fisher's face and the catch in the same frame;
  centred, the lobster - the whole subject - falls off the bottom of both photographs.
- **Slide 4 stays centred.** Its subject runs from the banner at the top to the cartons on the table,
  and the centred window lands on 0.20-0.80, which holds the banner, all four people and the cartons
  together. Pushing it down would cut the banner off.
- **Slide 2** is the one single-source image left and keeps its own per-breakpoint focal point.

Verified at 360, 390 and 430.

One `sizes` subtlety worth keeping: below 600px slide 2's 1.78 landscape file is `cover`-cropped into
a roughly square frame, so the *painted* width is about 1.9 viewport widths. A plain `100vw` hint made
the browser pick a tier half the width it was going to paint, which was visibly soft, hence the
`190vw` term in `HERO_SIZES_SINGLE`.

Rotation is 7s. It pauses on keyboard focus entering the hero and behind a hidden tab, stops on a
horizontal swipe, and does not run at all under `prefers-reduced-motion`. It deliberately does **not**
pause on hover any more - see "The hero looked like it rotated every few minutes" in §3c. There are
still **no visible controls** - the client had them removed in V1 because the control strip broke the
mobile hero layout.

---

## 3c. NATFISH AI

Nine pages now: `natfish-ai.html` joined the set, immediately before Contact in the nav, the mobile
drawer and the footer.

### The embed the client supplied

The client supplied Chatbase's **iframe** embed, not the script/bubble one:

```html
<iframe src="https://www.chatbase.co/chatbot-iframe/eqR-QbTH69GbLMJsTuw8I"
        width="100%" style="height: 100%; min-height: 700px"
        frameborder="0" allow="microphone"></iframe>
```

**Those are two different products and the difference drove a rewrite of
`assets/js/natfish-ai.js`.** The script embed ships its own floating bubble and
a JavaScript API (`chatbase("open")`); the iframe embed ships neither. There is
no way to open, close, query or talk to an iframe embed from the host page. So:

- The **floating panel is ours** and the chat inside it is Chatbase's iframe at
  Chatbase's URL, unmodified. Opening and closing is showing and hiding our
  panel. Nothing is drawn to look like a chat.
- **natfish-ai.html runs the same embed inline**, at `#ai-embed`, which is what
  this embed form is designed for. Every trigger on that page scrolls to it
  instead of opening a second copy of the same conversation.
- The id lives in one constant and the URL is built in one place:

```js
var AGENT_ID = "eqR-QbTH69GbLMJsTuw8I";
var IFRAME_BASE = "https://www.chatbase.co/chatbot-iframe/";
```

**Nothing is appended to that URL** - no query parameter, no fragment, no
hidden instruction. The agent's behaviour is configured in Chatbase and nowhere
else. The frame is given its `src` on first intent (a click, or the in-page
block scrolling into view), so a visitor who never asks for the assistant never
sends a request to chatbase.co.

Closing the panel hides it and **keeps the iframe**, so a visitor who closes and
reopens is still in the same conversation. Escape closes it and returns focus to
whatever opened it.

### What could not be verified from here

The live embed URL was **not** loaded. This build container's network policy
denies `chatbase.co` at the proxy (`ERR_TUNNEL_CONNECTION_FAILED`), so the frame
cannot be fetched from here at all. What *is* verified is that the site requests
exactly the supplied URL, exactly once, only on intent. Whether Chatbase serves
it depends on the agent's domain allow-list, which can only be settled on the
real deployment anyway.

**No message was ever sent to the agent.** Every automated test stubs the
Chatbase host locally, so nothing left the machine and no conversation was
started. No test order was submitted.

### One-time Chatbase dashboard settings

| # | Setting | Why |
|---|---|---|
| 1 | ~~Turn the default chat bubble off~~ | **No longer applicable.** That was a consequence of the script embed shipping its own launcher. The iframe embed has no bubble, so Chatbase's launcher and the NATFISH pill can no longer collide. |
| 2 | **Allow the launch domain** | Still required, and now the most likely cause of a blank frame on first deploy: the embed refuses to load on domains that are not on the agent's list. Add the Netlify domain, and the final domain when it exists. |
| 3 | Set the initial greeting | "Hi, I am NATFISH AI, the digital employee for National Fishermen Producers Co-operative Society Ltd. How may I assist you today?" |
| 4 | Set the widget privacy notice | "You are chatting with an AI. Do not share payment, banking, password, ID or other sensitive information. NATFISH confirms prices, availability and orders." |
| 5 | Confirm the agent answers in Spanish | There is deliberately no second agent and no canned Spanish opener. The agent replies in whichever language it is addressed in. |

### How the triggers work

Every "Ask NATFISH AI" control is a real `<a>` with a real destination, never `href="#"`. The script
upgrades it in place. That ordering matters: with JavaScript off, with the embed blocked, or before
the id is supplied, the control still takes the visitor somewhere useful instead of doing nothing.

- The floating pill falls back to `natfish-ai.html`, where the embed runs in the page itself - so
  with JavaScript off the visitor still reaches a working chat window.
- The buttons on `natfish-ai.html` fall back to `#ai-embed`, the block a few sections up.
- Everything else falls back to `natfish-ai.html#ai-embed`.

A fragment is allowed here where a bare `href="#"` is not: the rule is "no dead controls", and the
automated check now verifies that any fragment names an element that actually exists on that page.

There is no loading dance any more, because there is nothing to wait for: an iframe has no readiness
signal to poll. A click docks the pill, then shows the panel, and the frame loads inside it exactly as
a browser loads any iframe.

### The launcher

One pill, in the shared footer markup rather than injected by script, so it is present at first paint
and cannot shift the layout. Navy-to-teal, the logo mark in a white circle, roughly 66px tall on
desktop and 61px on a phone after the badge was enlarged, positioned against
`env(safe-area-inset-*)`.

Its motion is described in full in the next section; this one is only about the element. Nothing about
scale, opacity or colour is animated. Note that a permanently animating element cannot be clicked by
Playwright's default stability check, which is why the automated tests force the click and assert the
pause separately.

### The launcher's motion

The pill **swims in a wrap**: a slow, linear, one-directional drift from off
screen left, across the foot of the viewport, off screen right, and around
again - it never reverses. It cruises at **28px/s** with a **14px** rise and
fall over 2.9s; both were raised from a faster drift and a shallower bob at the
client's request, because against a slow crossing a shallow bob is invisible
and the rise and fall is what reads as swimming rather than sliding. The loop's
endpoints are computed so that the instant its tail clears the right edge its
nose is at the left edge, so it leaves and re-enters in the same moment, with no
off-screen dwell. Two speeds cannot share one transform, so the outer anchor
drifts and the inner `.ai-pill__body` bobs. Do not collapse them back into one
element.

The drift runs at **one constant 28px/s across the whole lap**, entry and exit
included, on a two-stop linear keyframe. On a 390px phone that is **20.3
seconds** from the launcher appearing at the left edge to its nose leaving at
the right, which is the figure the client timed on their own phone and asked to
keep exactly: *"I currently count 20 seconds ... Any faster or slower breaks
it."* Treat 28px/s as a fixed requirement, not a tuning knob.

There is a known cost, and it was accepted deliberately. A wrap has to travel
`viewport + pill`, but only `viewport - pill` of that is fully on screen. On a
390px phone carrying a 179px pill those are 569px and 179px, so at one even
speed the launcher is **fully visible for about 37% of each lap** - roughly 7.6
seconds of the 20, with about 6.3s of it a sliver or off frame. On a 1440px
desktop the same speed gives a 58s lap that is 77% fully visible.

An earlier revision reduced that dead time with a four-stop keyframe: the middle
76% of the lap carried the visible crossing at 28px/s while the outer 12% each
side flicked the launcher off frame and back, taking full visibility to 81-82%.
It worked, but it changed the cadence the client had timed, so it was reverted
on request. If the dead stretch is ever raised as a complaint again, that
piecewise keyframe is the fix - but it cannot be reinstated without asking,
because the even 20-second crossing is itself an approved decision. `transit.js`
asserts the 390px lap at 20s +/- 1 and `wrapqa.js` asserts the constant speed,
so an accidental drift back to the piecewise version fails the suite.

Note also that the first report of *"the pill is not showing on desktop nor
mobile"* turned out to be a stale browser cache on the client's side, not the
dead time - see section 7 on cache busting. The visibility measurements above
are real, but they were not the cause of that complaint.

`placeInLoop` inverts that two-stop keyframe. Because the whole lap is linear,
the inversion is a single division and is exact at every offset, which is what
both callers need - the left margin at first paint and the docked right margin
when the panel closes. All the
geometry (`--ai-out-left`, `--ai-out-right`, `--ai-travel`, `--ai-dur`,
`--ai-delay`) is measured by `natfish-ai.js` and re-measured on resize and on
language change (the Spanish label is wider); on a re-measure the pill's
current position is read first and re-entered into the new loop, so it stays
where the visitor last saw it. The off-screen excursion cannot create
horizontal overflow because the pill is `position: fixed`, which never extends
the document's scrollable area - asserted in the tests anyway.

On click the pill **docks**: it glides to the right margin over 0.55s and only
then does the panel open, tied to `transitionend` rather than a matching
duration. It stays docked while the panel is open - a launcher that swam away
from an open chat would be absurd - and when the panel is **closed it swims
off again from that spot**: the script re-enters the loop at the docked
offset, so it continues rightward, wraps, and carries on. Two mechanisms place
it within the loop, chosen by whether the animation is already running: a
running animation is wound directly with the Web Animations API (a negative
`animation-delay` is measured from the animation's original start, so after
minutes on the page it lands somewhere arbitrary), while the delay is used
only for an animation that has not started yet - first paint, and the restart
after undocking.

One deliberate interaction with focus: Escape closes the panel and returns
focus to the pill, and a focused pill pauses (a drifting keyboard target is a
hard target), so after a keyboard close it holds still until focus moves on,
then swims. After a pointer close it swims immediately.

Under `prefers-reduced-motion` there is no swim and no bob: the pill rests at
the right margin, docking is a no-op, and closing the panel leaves it resting
where it already was.

### The freeze after the first interaction, and its real cause

**Symptom reported from a phone: after opening NATFISH AI once, the whole site
stopped responding to taps.** It was reproduced, and it was not the chat - it
was one missing CSS rule.

`.ai-panel` sets `display: flex`. The browser's own `[hidden]` rule is
`display: none` at *user-agent* level, so **any** author rule that sets
`display` on the same element beats it. `panel.hidden = true` therefore did
nothing at all: once a visitor had opened the assistant even once, the closed
panel stayed laid out at 88% of the height of a phone screen - invisible at
`opacity: 0`, and swallowing every tap over that area for the rest of the
visit. The page was dead from the first interaction onward, exactly as
reported.

The fix is one rule, and it is the first thing in the panel's CSS:

```css
.ai-panel[hidden],
.ai-backdrop[hidden] { display: none; }
```

The same trap is why `.ai-backdrop` deliberately sets no `display` of its own.
`escape.js` now asserts the closed panel's rendered area is zero and that a tap
at the centre of the page reaches the page, so this cannot come back quietly.
Nothing else in the site uses the `hidden` property - the lightbox toggles a
class - so nothing else was affected.

**Three softer failures were found alongside it, and all three are fixed.** Any
one of them would have made the panel feel like a trap even with `hidden`
working:

1. **Nothing caught a tap beside the sheet.** A visitor's first instinct on a
   phone is to tap outside a sheet to dismiss it, and that did nothing. There
   is now a real `.ai-backdrop` - dimmed below 560px, transparent above it,
   where the panel is a corner card rather than a takeover.
2. **Escape stopped working the moment the visitor tapped into the chat.** The
   key event then belongs to the cross-origin Chatbase iframe and the host page
   never sees it - and tapping into the chat is the whole point of opening it.
   Escape is now a convenience, not the way out.
3. **`100vh` on a phone is the *large* viewport**, ignoring the browser's own
   toolbars, so the top of the sheet - and with it the only close control -
   could sit off the visible screen. Heights now use `dvh` with a `vh`
   fallback, and the close control is a 52px circle.

One related detail: closing by **tap** no longer sends focus back to the
launcher. A focused pill deliberately holds still, and on a touch screen
nothing ever moves focus away again, so the fish would have stopped swimming
for the rest of the visit. Keyboard closes still restore focus, which is what
a keyboard user needs.

### The hero looked like it rotated every few minutes

**Reported: on desktop the hero images change roughly every seven minutes
rather than every seven seconds.** Measured, and the interval itself was never
wrong - `ROTATE_MS` is 7000 and, with the cursor away from the hero, the slides
advance at a clean 7.0s.

The cause was **pause-on-hover**. The hero measures 1440x540 on a 1440x900
desktop, about **60% of the screen on first paint**, and `mouseenter` on that
whole region stopped the timer. A cursor resting anywhere in the top 60% of the
window - which is exactly where a cursor sits while someone reads, or after
scrolling - held the rotation indefinitely. It advanced only during the moments
the pointer happened to be elsewhere, which is precisely the reported symptom.

Hover-pause earns its place on a carousel the visitor can operate. This one has
none: the visible controls were removed in Phase 4 at the client's request, the
slides carry nothing but background imagery, and the headline, copy and buttons
sit in a fixed layer above them. There is nothing to hover toward and nothing
that moves out from under the pointer, so the pause bought nothing and cost the
rotation. It is gone.

**Kept:** pause while the keyboard is inside the hero (narrow, and someone
tabbing the hero's buttons is genuinely engaged), no rotation behind a hidden
tab, `prefers-reduced-motion` holding slide one, and the swipe.

`heroqa.js` had asserted the old behaviour, so that assertion is now inverted;
`heroqa2.js` additionally measures the real cadence with the cursor parked in
the middle of the hero at 1440, 1920 and 390, and requires 7.0s +/- 0.9s.

### The panel wears no chrome of its own

Chatbase draws its own header inside the iframe - the agent's name on the left,
its own menu on the right - and the panel used to add a second bar above it
carrying our title and a close button. On screen that read as a **doubled
border**, which is exactly how the client described it.

Our bar is gone. `buildPanel()` now appends the close control and the iframe
host to the panel directly, and the panel's only visible edge is the single
1px border on `.ai-panel__body`. What survives is the **big X**, which the
client asked to keep: a 52px navy circle that floats *above* the panel's
top-right corner rather than sitting on the chat, so it never lands on
Chatbase's own menu button. The panel is deliberately **not** `overflow:
hidden`, because that would clip the button off.

Floating it above the panel makes the panel's height a clearance calculation,
not a taste decision. The button needs 52px plus a 0.6rem gap above the sheet,
and the sticky header is 76px on a phone and 88px on a desktop; if the sheet
grows, its top edge rises and the button walks up into the header. Hence
`min(660px, calc(100dvh - 16rem))` on desktop and `min(82dvh, 100dvh - 11rem)`
on a phone. The phone figure was 4rem and failed at **320x568**, where the sheet
started at y=102 and put the button at y=41 - 36px inside a 77px header.
`clearance.js` now asserts, at eight viewports from 320x568 to 1920x1080, that
the button clears the header and is clickable. **Change either height and re-run
it.**

### Where the launcher is and is not

Two deliberate absences, both verified rather than assumed:

- **While the mobile menu is open** the pill is still there and still
  swimming - the menu is a full-screen overlay inside the header (z-index 100)
  and simply paints over the pill (z-index 60). It reappears the instant the
  menu closes. A floating chat button sitting on top of a full-screen menu
  would be the odd choice, so this stays as it is.
- **On natfish-ai.html** there is no pill at all, by request - see below.

### The emblem in the launcher

The NATFISH mark carries a lobster, a hand, a cuff and a wave ring - a lot of
drawing for a small circle. At 34px inside a 44px badge it read as a smudge
rather than as the mark, which is what *"the AI is small on the Ask NATFISH"*
meant. The badge is now 52px with 44px of artwork (48/40 on a phone), so the
artwork also uses more of the circle it sits in. The pill grows by 8px of width,
which the loop shape above absorbs easily.

### No launcher on the NATFISH AI page

`natfish-ai.html` ships **without** the floating pill (`footer(with_ai_pill=
False)`): the chat embed is in the page, so a floating "Ask NATFISH AI" button
there is a button for the thing the visitor is already looking at - and on a
phone it sat directly on top of the embed's caption. The preview bundle shares
one pill across its nine routes, so its router hides it on the natfish-ai
route to match.

### The ordering journey, and the gate in front of it

**This supersedes the earlier "coming soon" framing.** NATFISH AI is now presented as an active
order-request channel: a visitor can start an order from the launcher, from the NATFISH AI page, from
any of the six product cards on Seafood & Services, and from either path on Contact.

Six strings were removed from the pages **and** their Spanish deleted from `tools/natfish_es.py`, so
no future edit can quietly reintroduce a translation of copy that must not return:

| # | Removed string |
|---|---|
| 1 | "NATFISH AI cannot currently confirm real-time prices or inventory, accept payment, finalize an order or replace confirmation from a NATFISH team member." |
| 2 | "Online order requests are coming soon" |
| 3 | "Coming soon, visitors will be able to submit an order request directly through NATFISH AI for NATFISH's confirmed seafood products." |
| 4 | "This ordering feature is not yet active. NATFISH AI must not claim that an order has been accepted, submitted, routed or confirmed until the required order system is live." |
| 5 | "NATFISH AI may occasionally provide an incomplete or mistaken response. A NATFISH team member must confirm prices, current availability, product specifications and final order arrangements." |
| 6 | "For prices, current availability and confirmed orders, a NATFISH team member will assist you." |

What the copy still never does, in either language: state a price, claim a product is in stock, claim
online payment, name a delivery area, a turnaround, a grade, a weight or a minimum quantity, or imply
that an order is accepted before the team confirms it. Every route says the team confirms. Shrimp and
any other unapproved product remain absent.

**THE ACTIVATION GATE IS HALF MET.** The intended embed has been supplied and is wired in, which
settles the first condition. The second is still open: nobody has confirmed that the Chatbase order
flow itself is ready. The website now *offers* to take an order request; whether the agent can
actually conduct that conversation is a Chatbase-side question, and nothing in this repository can
answer it. **Confirm that before the site goes public.**

No order backend, webhook, automation, email routing, payment step or form was built, and none should
be: the assistant hands the request to the team, and the team confirms it.

### Passing the chosen product to the agent: not possible with this embed

Each order button carries `data-ai-product="<product name>"`. **Nothing consumes
it today, and with the iframe embed nothing can:** there is no client-side API
to hand the agent context through, and the two ways of faking it are both out of
bounds - typing a synthetic message into the panel on the visitor's behalf, and
reaching into the Chatbase iframe (`contentWindow`, `contentDocument`,
`postMessage`). The test suite checks that none of those appears in the source,
and that nothing is appended to the embed URL.

The attribute stays because it is the hook point a future integration would read
- if the account ever moves to the script embed, which does expose an API. Until
then it is inert by design. The product-specific accessible name on each button
("Start an order for Frozen Queen Conch, 85% Cleaned with NATFISH AI") is real
and is what a screen-reader user hears; that is not affected.

**This means the agent does not know which product button was pressed.** The
visitor names the product in the conversation, which is what the "Have these
ready" list and the order-request checklist prepare them to do.

### Nothing was done inside Chatbase

No Chatbase login, no management API call, no change to the agent's brain, system prompt, training
data, knowledge base, greeting, suggested questions or language settings; no agent created, cloned,
deleted, retrained or replaced; no email, Make, Zapier, webhook, payment, inventory or order-routing
workflow configured; no hidden instruction placed in the HTML, the JavaScript, a query parameter or
the embed to steer the agent's behaviour; and **no test order submitted to NATFISH**. All of that is
Bert's, and the items are listed under "One-time Chatbase dashboard settings" above.

### The embed cannot work in the artifact preview, and says so

The preview is one self-contained file under a Content-Security-Policy that blocks every external
host, so the Chatbase frame can never load there. An empty white box reads as a broken build, so
`tools/bundle-preview.py` sets `window.NATFISH_PREVIEW = true` and the script puts a short note in
the frame's place: *"NATFISH AI is live on the website itself."* Translated, like everything else.
On the real site that flag is never set.

Building the preview also caught a genuine bug. All nine routes live in ONE document there, with the
inactive ones hidden, so `document.getElementById("ai-embed")` succeeded on every route and every
page believed it owned the in-page embed - clicking the pill on Contact scrolled to a `display:none`
block instead of opening the panel. The routing lookup now requires the block to be **rendered**
(`offsetParent !== null`); the wiring lookup deliberately does not, or a route that starts hidden
would never be wired at all. Two lookups, two different questions.

### The preview bundle carries the launcher separately

`tools/bundle-preview.py` lifts the shared footer with
`between(index, '<footer class="site-footer">', "</footer>")`, and the pill is
rendered **after** `</footer>`. The first build of the artifact preview therefore
shipped the pill's CSS and its script with no markup at all: present in three
files, invisible on screen, and easy to mistake for a styling problem. The
bundler now lifts the pill and its live region explicitly. If the launcher ever
moves in the shell, that slice has to move with it.

### Not created, and why

- **No `sitemap.xml`.** A sitemap needs absolute URLs and the launch domain is still unconfirmed. The
  same reason the site has no `<link rel="canonical">` and no `og:url`. Generate all three together
  once the domain is settled.
- **No `robots.txt`.** There was none before, so nothing is blocked and the new page is crawlable.
- **No privacy policy.** The client's plain-language guidance is on the page and nothing beyond it was
  invented. If a formal policy is approved later, link to it from that section.
- **No analytics.** There is no Google Analytics, no tag manager and no third-party measurement script
  anywhere in the site, and there never has been. So "preserve the existing analytics implementation"
  has nothing to preserve here, and none was invented to satisfy it. If order-journey measurement is
  wanted, say so and it can be added deliberately.

### Product images in the order list

Each row on the NATFISH AI page carries a thumbnail. **Three of the six
products have a photograph that is truthfully theirs** - Frozen Spiny Lobster
Tails, Frozen Whole Raw Lobster, Frozen Queen Conch - and those three are the
only ones that get one. The other three carry the species mark on navy, the
same substitution the product cards on Seafood & Services already make, so a
visitor moving between the two pages sees one consistent treatment rather than
a gap. No borrowed or approximate image was used to fill a slot.

That row also had a real layout bug, visible as a tall empty band inside each
card on a phone: `.order-item__name` carried `flex: 1 1 16rem`, and when the
row becomes a **column** below 560px a flex-basis is read along the vertical
axis - so 16rem became a 256px minimum *height*. It is reset to `flex: 0 0
auto` in the stacked layout. Any flex shorthand carrying a horizontal basis
needs the same treatment when its container changes direction.

### The privacy checklist's first line

At the client's request the line *"The visitor is clearly told that NATFISH AI
is an AI service"* was replaced with a statement that information is not sold or
given away. It now reads:

> **Information you provide is never sold, rented or given away.**

Two deliberate choices in that wording:

- **It does not say "never shared".** The client's note asked for "not shared,
  sold or given away", but a blanket "never shared" would be the one untrue
  sentence on the page: order details *are* passed to the NATFISH team, which is
  the entire point of an order request, and the message itself is processed by
  the service that operates NATFISH AI. The very next line in the same list
  already governs that sharing, with a consent requirement - *"Consent is
  requested before contact or order details are sent to the team."* The two
  lines together state the whole truth, and neither overclaims. A privacy
  promise that cannot be kept is a liability, which is the opposite of what was
  asked for.
- **The AI disclosure it replaced is not lost.** The paragraph immediately above
  the list still opens *"NATFISH AI is an AI-powered service."*, so a visitor is
  still told plainly what they are talking to.

### Two contact-page copy decisions, per the client

- The "What to include with your seafood order request" section offers **one
  action: Email the order team.** It briefly carried a "Start with NATFISH AI"
  button as well; the client had it removed because the assistant already
  leads the ordering section directly above, and this checklist serves
  whichever route the visitor picked.
- The "Have these ready" list says **"Your name, telephone number and email
  address"** - it briefly said WhatsApp; the client had it changed because
  correspondence about an order may also be sent by email.

### Opening hours

`Monday to Friday, 8:00 a.m. to 5:00 p.m.` is newly supplied and now appears on the Contact page and
in `openingHoursSpecification` in the Organization schema. Worth remembering that the fabricated hours
on the V1 storefront image were one of the reasons that image had to be destroyed; these came from the
client.

---

## 3d. Alignment and contrast

**One alignment rule, applied everywhere.** A section head is **centred** when the
content directly beneath it is a symmetric full-width set: a card grid, a step
sequence, a product catalogue, the gallery. It stays **left** when it introduces a
split layout (text beside an image) or a column of reading copy. Centred text
over an asymmetric block reads as a mistake, and centred body prose is genuinely
harder to read because the eye loses the start of each line.

Thirteen heads moved to centred under that rule. Where a block sits under a
centred head it is centred as a block (`margin-inline: auto`) while its text
stays left-aligned - `.ai-privacy` and `.container--narrow .ai-note`.

Page heroes stay left-aligned on purpose: the giant NATFISH watermark occupies
the right of that band, so left-aligned copy is what balances it.

**Three contrast defects, all found by measuring rather than by eye.** Each came
from a rule written for one background leaking onto another:

| Where | Was | Cause |
|---|---|---|
| The main CTA button on nearly every page | 2.98:1 | `.section--navy a` set turquoise for links on navy, and the button is an anchor, so turquoise text landed on its own teal fill. Now `a:not(.btn)`. |
| `.btn--ghost` on the Responsible Fisheries sand band | 1.07:1 | The ghost is the light-on-dark variant. It now defaults to dark-on-light, with the white treatment scoped to the grounds that are actually dark. |
| `.flow__num` on About | 2.87:1 | Turquoise-500 on white at 11px. Two steps darker. |

The same leak had already produced two visible bugs earlier in this work: a
`.btn--ghost` rendering white-on-white under the NATFISH AI hero, and
`.pillar p` rendering white-on-sand across the four capability cards, because
`.pillar` hard-coded `--ink-onDark`. Both components are now background-aware.

`tools/` has no contrast checker of its own; the audit lives in the QA scratch
scripts. If it is ever rebuilt, two things must be right or it reports dozens of
phantom failures: it has to composite translucent backgrounds down the ancestor
stack, and it has to resolve gradient backgrounds (every dark band here is a
navy gradient, so the darkest navy token is the correct conservative stand-in).

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

## 4b. The Gallery page

Three photograph sections and a video section, in this order:

| Section | What | Provenance |
|---|---|---|
| Fishing, product and representation | The client's ten supplied photographs, with filter tabs | Client-supplied, 2026 |
| Inside the processing rooms | The ten facility photographs | Supplied by the General Manager |
| How the product is packed | Four packaging photographs, under the recreation disclosure | Recreated from an old pamphlet |
| On film | Third-party documentary video, attributed | Ocean Link |

All three photograph sections feed the same lightbox.

### The supplied set

Ten photographs delivered as a zip with their own instruction file, already
standardised by the client to **1600x1200** and sorted into three folders whose
names are the classification. `tools/process-gallery-images.py` reads the folder
each file arrived in and writes `tools/gallery_dims.py`, so the classification
comes from the client and cannot drift out of step with the images.

**Filenames, captions and alt text are the client's own words, used verbatim.**
Do not paraphrase or "improve" them. They live in `ALT` and a separate
`CAPTION` dict in `build_shell.py` - separate because `SHORT` entries are label
fragments that the older gallery template finishes with a full stop of its own,
while these are finished sentences that must not have one appended.

They sit in **`assets/img/gallery/`**, not `official/`. Two reasons, both
practical: the supplied names collide numerically with the existing official
set (`01-...` exists in both), and `img_dir()` routes anything containing
"belizean-pride" to `products/`, the folder for pamphlet recreations. These are
neither - they are the client's own photographs of their own product - so
`img_dir()` checks `GALLERY_GROUPS` first.

The client standardised the frames themselves, and several of the originals
were not 4:3, so those carry a blurred fill at the edges. That is their
framing and it ships as supplied: nothing here re-crops, recolours or retouches.

### Filter tabs

The gallery had no filter of any kind, and the client's instruction was to add
one using their three labels exactly. It is a row of buttons, not links or a
`<select>`: the filtering is in-page state rather than navigation, and
`aria-pressed` is what tells a screen reader which view is active. Tabs are
44px tall so a thumb can hit them.

The bar ships `hidden` and the script reveals it, so a visitor without
JavaScript sees all ten photographs instead of a row of dead buttons.

`.gallery__figure[hidden] { display: none }` is **not optional**. The gallery
carries an author `display`, and a UA-level `[hidden]` rule loses to any author
`display` - the same trap that once left the closed NATFISH AI panel swallowing
every tap on a phone. It is spelled out in both places on purpose.

### Two layouts, deliberately

The older sections stay a CSS `columns` masonry: those photographs mix
landscape and portrait, and masonry stops a tall one leaving a hole. The
supplied set is uniformly 4:3, so masonry buys nothing there and costs
something - columns fill top to bottom, which scatters the three
classifications through the layout. It is a grid instead, which keeps DOM order
(the client's own numbering) and gives exactly the one/two/three columns the
instruction asked for.

The override has to sit **after** `.gallery:has(.gallery__figure)` in the
stylesheet: the two selectors tie on specificity, so source order decides.

### Lightbox scope

The arrow keys walk the grid the opened photograph belongs to, intersected with
what is actually visible. Both halves matter: without the visibility filter,
arrowing out of a filtered group shows a photograph the visitor has just
filtered away; without the grid scope, arrowing past the end of the facility
photographs lands in the packaging recreations, crossing the disclosure
boundary that section's note exists to draw.

### Three things for the client to confirm

1. ~~Fish fillets and fish portions are the first fish products shown anywhere
   on the site.~~ **Resolved.** The client asked for Seafood & Services to be
   updated, so the catalogue is now eight products - see section 4c.
2. **Alt text for images 08, 09 and 10 names NATFISH directly** ("NATFISH
   representatives", "NATFISH delegation", "NATFISH team members and
   partners"). That is the client's own wording, supplied with the images, and
   is theirs to assert. Note it settles for the gallery what is still open for
   the hero photographs in section 3b, where our own alt text stops short of
   naming NATFISH. Worth reconciling the two once she has confirmed.
3. **Image 10 has a legible banner.** The group photograph is taken in front of
   a Republic of China (Taiwan) and Belize flag banner with Chinese text and a
   naval crest. The caption names no event, date, country or partner, per the
   instruction not to invent any - but the banner is readable at full size, and
   the site's standing rule is that no export market or trading relationship is
   asserted anywhere. Publishing it is a judgement for Ms Denise to make
   knowingly rather than one to make for her.

---

## 4c. Eight products, not six

Frozen Fish Fillets and Frozen Fish Portions joined the catalogue at the
client's request, after they supplied photographs of both for the Gallery.

**Neither carries a scientific name, and that is deliberate.** Every other entry
has one; these two have `sci: None` and `sci_line()` renders nothing rather than
an empty italic line. The only support for them is two photographs and two
client captions that say "prepared for distribution" - no species, no weight, no
grade, no availability. Naming a species to fill the line would be inventing the
one fact the page most looks like it is stating. If the client confirms the
species, add it.

The body copy claims only what the photograph shows: individually packaged, and
boxed for distribution.

They use the `crate-fish` icon and the client's own gallery photographs, so both
have a truthful image; five of the eight now do.

### The drafts are generated, not typed

Adding two products exposed a real defect. The email and WhatsApp drafts each
carried a hand-typed list of the six product names, so the catalogue grew to
eight while both drafts silently kept offering six - a buyer would have been
handed a pick-list that did not match the page they were reading.

`EMAIL_TEMPLATE` and `WHATSAPP_TEMPLATE` now carry a `{products}` slot and are
filled from `PRODUCT_PICKS`, which is derived from `CATALOGUE`. One list, three
places: the pick-list on the page, the email draft and the WhatsApp draft.
`orderqa.js` holds the catalogue once and asserts all three agree, so the next
product cannot be half-added.

---

## 4d. One tap, not two

The client reported having to touch some controls twice, the gallery worst of
all. Driven under touch emulation in Chromium, every control already fired on
the first tap - the lightbox, the gallery filter tabs, the menu button, the
language toggle, the AI launcher and the video facade. So the fault was not in
any of the handlers.

The cause is the phantom hover. On a device with no real pointer - iOS Safari
most of all - the first tap on an element that has `:hover` styles is spent
applying them, and only the second tap activates the control. The stylesheet
had 41 ungated hover rules, so this could happen almost anywhere.

**Every `:hover` rule in `natfish.css` now sits inside `@media (hover: hover)`.
Keep it that way when adding one.** Nothing is lost on a desktop: the query is
true for a mouse or a trackpad, and false only for a finger, where a hover style
could never be seen anyway. `taps.js` asserts both directions - one tap per
control on a touch device, and that a mouse still gets every highlight.

### A hover bug this uncovered

Writing that test surfaced something older: **the cards had never lifted on
hover.** `.reveal.is-visible { transform: none }` sits later in the stylesheet
than the component hover rules and ties with them on specificity, so it won on
source order and cancelled every hover lift on a revealed element - the seafood
cards, the news cards, the product rows. Confirmed against the pre-change
stylesheet, so it was not introduced by the gating.

The reveal now rises on `translate` rather than `transform`. `translate` is an
independent transform property: it composes with `transform` instead of
replacing it, so the reveal and the hover no longer fight over one declaration.
Keep them on separate properties.

---

## 4e. Three client revisions

### The Food Taipei 2026 update

`UPDATES[0]`, so it is the featured item on What's New and the first of the two
the homepage carries. The photograph is the client's, published as
`news-food-taipei-2026-delegation` in `official/` by
`tools/process-news-images.py`.

**The wording is the client's, used as supplied, and it is deliberately narrow.**
It says the delegation travelled and that National Fishermen took part as an
official exhibitor. It does not say a contract, a sale, a partnership or an
agreement came of the visit, because none has been evidenced and the client
asked explicitly that none be claimed. Do not add one. `revisions.js` asserts
the card's text contains no such word.

This is the first item that names an event, a date range and a country, and it
is the client who supplied all three. It does not license naming the event
anywhere else: the hero and gallery captions for the other trade-show
photographs still stop short, because nobody has confirmed those are the same
event.

The item uses a named button rather than the usual "Source:" line, because the
client supplied both the label and the destination. `update_link()` renders one
or the other: an item with a `cta` gets the button, everything else keeps its
source credit. Either way the link leaves the site, so both open in a new tab
with `rel="noopener noreferrer"` and a visually hidden "(opens in a new tab)".

The source photograph is 1280px wide, below the 1400 top tier, so the largest
derivative is 1280 while the srcset still declares `1400w`. `picture()` emits a
fixed 480/800/1400 srcset, and seven of the portrait photographs in `official/`
already have the same mismatch. It is worth a pass one day - the descriptor
should be the real width - but it is not this change, and the visible effect is
a slightly conservative tier choice, not a broken image.

### The mobile and WhatsApp number

`+501 628-1449`, replacing `611-4831` everywhere: the constants in
`build_shell.py`, both Spanish strings that spelled it out, the extractor's
number pattern, and the JSON-LD. The office lines are untouched -
`227-3165` is still the primary landline and `227-8039` the secondary.

`revisions.js` walks every built file and fails if the old number survives
anywhere, and checks each page's `tel:` and `wa.me` links against the three
allowed numbers - in Spanish as well, where the runtime swaps strings that
contain it.

### No decorative lines beside or above a title

Three things went, at the client's request, and they were three separate
mechanisms:

1. **`.eyebrow::after`** - the 26px dash trailing every eyebrow. This is the
   one in the client's screenshot, beside "WHAT'S NEW".
2. **`RULE_WAVE`** - the rope-and-wave SVG above thirteen section heads. Its
   second path was a plain horizontal stroke. The constant is emptied rather
   than deleted, so the thirteen call sites still mark where it stood.
3. **`.section-head--rule`'s 2px `border-top`** - the hairline above editorial
   heads. The class stays because it is on every section head in the markup and
   still carries the head's top spacing, now 0.4rem instead of 1.4rem.

Spacing was retuned after: the eyebrow's bottom margin went from 0.85rem to
0.7rem, because the dash used to give that line visual weight and a little
optical space, and without it the eyebrow read as crowding the heading.

**Do not put a decorative rule back beside or above a title.** `revisions.js`
asserts, on all nine pages and in both languages, that no eyebrow renders an
`::after` bar, no `.rule-wave` exists, and no section head carries a top border.

Kept deliberately, because they are not title ornament: the nav link's underline
(an active/hover affordance), the hamburger bars, the 3px turquoise seam where
the hero panel meets its photograph, the connectors in the process flow, and the
identity ribbon's band edge.

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
natfish-ai.html          NATFISH AI, with the chat embed in the page
contact.html             Contact & seafood orders   (#order)
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
`contact.html#order`: a `mailto:` to `nationalfishermen@gmail.com` and a `wa.me` link to
`5016281449`, both carrying a prefilled, fully editable draft that includes the eight-product pick list.
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

Currently **451 Spanish strings, 0 missing.**

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
tools/build_pages.py         the nine pages; run this after editing either
tools/build_icons.py         the inline SVG icon family
tools/build_seasons.py       the Seafood Seasons card data
tools/process-v2-images.py   regenerates the photography set
tools/process-hero-images.py regenerates the hero pairs and the concept hero
tools/process-logo.py        regenerates the three logo lockups
tools/process-gallery-images.py  regenerates the client's supplied gallery set
tools/process-news-images.py     web tiers for a photograph published with a news item
tools/bundle-preview.py      builds the single-file artifact preview
tools/make-netlify-zip.sh    builds the deployable zip, excluding this file and tools/
```

The nine HTML files are generated. **Edit the generators, not the HTML**, or the next
`python3 tools/build_pages.py` will overwrite the change.

### Cache busting: why every asset URL carries `?v=`

`netlify.toml` serves `/assets/*` with `max-age=31536000, immutable`. Against
filenames that never change, that is a promise the browser keeps: a returning
visitor can hold a year-old stylesheet and simply never see an update. This
already happened once - a report that the launcher *"is not showing on desktop
nor mobile"* turned out to be one browser holding an old cache while another,
fresh browser rendered the new build correctly. Nothing was wrong with the site.

`build_shell.py` now stamps every stylesheet and script with a content hash -
`asset("assets/css/natfish.css")` returns `assets/css/natfish.css?v=<8 hex>`,
the first 8 hex characters of the file's own SHA-256.

The URL changes when, and only when, the file's bytes change, so an edited file
is a cache miss and an unedited one still gets the full year of `immutable`.
Seven links per page are stamped: two stylesheets and five scripts. Images are
not - they are added and replaced, not edited in place.

**This only works if the pages are regenerated after an asset edit.** Change the
CSS without re-running `build_pages.py` and every page points at the old hash,
which is worse than no hash at all. `make-netlify-zip.sh` therefore recomputes
each hash from the packaged file, compares it against what the HTML asks for,
and **exits 1** on any mismatch rather than shipping a stale package. The
guard's failure path was tested by hand, not just its success path.

`netlify.toml` 301-redirects the three retired V1 URLs: `/cooperative.html` to `/about.html`,
`/seafood.html` to `/seafood-services.html`, and `/buyers.html` to `/contact.html#order`.

The rotating hero advances every 7 seconds, supports swipe, pauses on a hidden tab and while the
keyboard is inside it, and does not rotate at all under `prefers-reduced-motion`. It does **not** pause
on hover - see §3c. It has no visible controls, by client instruction in V1.
