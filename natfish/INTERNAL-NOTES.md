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
| Mobile / WhatsApp | `+501 611-4831` |
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
| `natfish-logo-400/800/1200.png` | The complete lockup, via one srcset. Header on all eight pages, footer panel, About identity panel. |
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

Three images, in this order, set by the client:

| # | File | Subject |
|---|---|---|
| 1 | `hero-1-fisher-with-conch-catch` | A young fisher in a skiff with a conch catch. **Default slide, and the client's favourite.** |
| 2 | `hero-2-boat-leaving-harbour` | A boat heading out of the harbour. |
| 3 | `hero-3-fishers-at-sunrise` | Two fishers at the traps at sunrise. |

They live in `assets/img/concept/`, deliberately apart from `official/`. **These three are from the
original V1 concept pack, not photographs the General Manager supplied.** That distinction matters and
is easy to lose: the same pack produced the storefront image that had to be destroyed for carrying a
fabricated telephone number. Their alt text therefore follows the concept-imagery rule from the
original brief and never says a person, vessel or catch belongs to NATFISH. The folder name is what
keeps the next person from reaching for them as if they were documentary.

Regenerate with `python3 tools/process-hero-images.py <v1-image-pack-dir>`.

**No overlay, by design.** The hero is a split layout: the headline, copy and buttons sit on their own
navy panel beside the photograph on desktop and above it on a phone. Nothing is ever drawn over a face,
so no darkening gradient is needed and none is applied. Do not add one; it would only make the
photographs murkier for no readability gain.

**Focal points are per slide and per breakpoint**, in the stylesheet against `.hero__slide--N`. At every
width the frame is wider than tall but narrower than the 1.78 source, so `cover` crops the horizontal
axis only and X is the value that decides what survives. Slide 3 gets an extra nudge below 400px to
keep the sun in shot.

The mobile hero frame is `clamp(300px, 62vw, 380px)`, raised from a 250px floor. Because the crop is
horizontal, a taller frame scales the photograph up and the subject grows with it: at 390px the fisher
went from roughly a quarter of the frame to a third. That is what "prominently framed" needed. Lowering
it again shrinks her.

Rotation is 7s, pauses on hover, on keyboard focus entering the hero and behind a hidden tab, stops on
a horizontal swipe, and does not run at all under `prefers-reduced-motion`. There are still **no visible
controls** - the client had them removed in V1 because the control strip broke the mobile hero layout.

Only slide 1 is preloaded and eager; the other two are lazy, since they sit behind `opacity: 0` for at
least seven seconds.

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
and cannot shift the layout. Navy-to-teal, the logo mark in a white circle, 60px tall on desktop and
57px on a phone, positioned against `env(safe-area-inset-*)`.

The float is 4px over 3.4s, ease-in-out, alternating. It pauses on hover and on keyboard focus, and is
switched off entirely under `prefers-reduced-motion`. Nothing about scale, opacity or colour is
animated. Note that a permanently animating element cannot be clicked by Playwright's default
stability check, which is why the automated tests force the click and assert the pause separately.

### The launcher's motion

The pill **swims**: a slow horizontal drift from the left margin to the right and
back, 26s each way, with a 3.4s vertical bob over the top of it. Those are two
speeds on one property, and one element cannot run two transform animations, so
the outer anchor drifts and the inner `.ai-pill__body` bobs. Do not collapse them
back into one element.

`--ai-travel` is set at runtime by `natfish-ai.js` from the measured pill and
viewport widths, and re-measured on resize and on language change (the Spanish
label is wider). Hard-coding it would either cut the swim short or sail the pill
past the right edge and create horizontal overflow.

On click the pill **docks**: it glides to the right margin over 0.55s, stays
there for the rest of the visit, and only then does the panel open. The
sequencing matters and was wrong once: on the very first click the embed is
still loading, and the code opened as soon as the widget was ready rather than
waiting for the glide as well, so the panel appeared while the pill was still
10px short of the margin. Both conditions are now required. The completion is
tied to `transitionend`, not to a duration that merely matches the transition,
because the two `requestAnimationFrame` calls that make the glide smooth push
its real end past any hard-coded 550ms.

Under `prefers-reduced-motion` there is no swim and no bob: the pill simply
rests at the right margin, which is where a docked pill ends up anyway.

Both motions pause on hover and on keyboard focus. Note that Playwright will not
click a permanently animating element, so the automated tests force the click and
assert the pause separately.

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
