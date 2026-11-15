# ConfiDent Oral Care: website preview with confident AI

This is a client preview of the ConfiDent Oral Care website for Dr. Brittni Haylock, DDS & Orthodontist, at The Boardwalk Belize in Belize City. It includes:

- **The website.** Home, About, Services, seven treatment pages covering all 22 advertised services, Your First Visit, Gallery (with `#videos`), the Dental Blog with three articles, Contact Us, and Appointments.
- **confident AI**, the clinic's AI Employee. It runs on the Anthropic Claude API from the server, using three narrow, schema-validated scheduling tools.
- **One scheduling service.** The booking form and confident AI share it. It writes to a persistent, isolated **test calendar**.

The preview is labelled as a test throughout the booking flow, and it is excluded from search engines (`noindex`, `X-Robots-Tag`, and `robots.txt` disallow).

See **[WALKTHROUGH.md](WALKTHROUGH.md)** for the demonstration scenarios: a saved test event with its Belize date and time, an unavailable slot, a staff-review request, and a calendar outage.

---

## Run it locally

Requirements: Node.js 20 or later (22 recommended).

```bash
cd confident-oral-care
npm install
cp .env.example .env        # add ANTHROPIC_API_KEY to enable confident AI
npm run start:env           # or: npm start (without loading .env)
# open http://localhost:3000
```

- Without `ANTHROPIC_API_KEY`, everything except the AI conversation still works. The assistant panel's suggested actions (services, hours, directions, booking form) work, and typed questions get the phone and Instagram fallback.
- The test calendar view is at **http://localhost:3000/preview/test-calendar**.
- Run the tests (scheduling, assistant tool loop, links and pages) with `npm test`.
- Simulate a calendar outage with `CALENDAR_FAULT=unavailable npm start`.

## Project layout

```
config/
  clinic-data.json   Single source of clinic facts for the site AND the AI: contact, hours,
                     socials, service catalogue and aliases, and pending details (prices, insurance...)
  scheduling.json    Bookable windows, visit types, durations, resources, cutoffs, test busy block
  site.json          Preview flag, canonical origin, hero and gallery video settings
content/             Patient-facing copy (pages, treatments, blog) from the handoff
src/
  server.mjs         HTTP server: pages, static files, JSON API, sessions, security headers
  site.mjs           Loads config + copy into one object used by pages and the assistant
  render/            HTML templates (layout, pages, responsive images)
  scheduling/        Scheduling service, time-zone helpers, JSON store, calendar adapters
  assistant/         confident AI: system prompt builder, tools, Claude tool-use loop
public/              CSS, browser JS, self-hosted fonts, logo and photo derivatives
scripts/build-images.py  Regenerates web images from public/img/original (originals are retained)
reference/           The handoff brief, source copy, story screenshots and business card (not served)
docs/walkthrough/    Walkthrough screenshots
tests/               node:test suites
```

## Editing content

| To change | Edit | Effect |
|---|---|---|
| Phone, email, address, socials, posted hours | `config/clinic-data.json` | Website (header, footer, contact, structured data) **and** confident AI |
| A service name, alias or slug | `config/clinic-data.json` (and the matching copy in `content/treatments.mjs`) | Services pages, index, AI knowledge. Tests fail if a slug has no copy. |
| Confirmed fees, insurance, payment methods, policies | `pendingClinicDetails` in `config/clinic-data.json` | While a value is `null`, the AI says it's not confirmed and refers visitors to the team. When you fill it in, the AI quotes it. |
| Page, treatment or blog copy | `content/*.mjs` | Website, plus the AI's service knowledge |
| Bookable times, visit types, durations, cutoffs | `config/scheduling.json` | Booking form and AI availability. These are deliberately separate from the public hours. |

Restart the server after editing configuration.

### Adding the clinic tour video

1. Compress the clip for the web, for example H.264 MP4 at 1280–1920 px wide and about 4–8 Mbit/s, with no audio track for the hero. Put it in `public/media/`.
2. In `config/site.json`, set `media.heroVideo.mp4` to `/media/your-clip.mp4` (add `webm` if you have one).

The video then plays muted, inline and on a loop, with a visible pause/play button. The reception photo stays as the poster and fallback, and it's shown instead of the video when autoplay is blocked, the visitor prefers reduced motion, or the file fails to load. No layout change is needed.

For the Gallery **Videos** section, add or fill in an entry in `media.galleryVideos`: `src`, `width`/`height`, `runtime`, `description`, and `captions` (a WebVTT file) or `transcript` for spoken content. A placeholder entry for the clinic tour (`clinic-tour`) is already there and stays hidden until it has a `src`. Gallery clips play only when the visitor starts them.

### The route video (supplied Instagram reel)

`public/media/route-to-confident.mp4` is the clinic's "Route to ConfiDent" reel: 27 seconds of driving to The Boardwalk, ending at ConfiDent's doors. It appears in Gallery → Videos and in a "Find your way to The Boardwalk" section on Contact Us, next to Get directions. confident AI also points to it when asked for directions.

- **No audio.** The web copy has the audio removed. The reel's soundtrack is music with no narration, and music added in Instagram is generally licensed for use on Instagram only. If the clinic confirms the track is original or cleared for the website, re-encode from the original reel with audio (`-c:a aac -b:a 96k` instead of `-an` below), and remove "This video has no sound." from its `description`.
- **Not in the hero.** It's a vertical 652 × 1160 clip of the road, not the clinic tour the brief describes for the hero. Stretched across a desktop hero, it would be blurry and would hide the reception signage. The hero keeps the reception photo until the tour arrives.
- **Encoding.** `ffmpeg -i reel.mp4 -an -c:v libx264 -preset slow -crf 27 -maxrate 1000k -bufsize 2000k -pix_fmt yuv420p -movflags +faststart route-to-confident.mp4` (3.4 MB). The poster is the opening "ROUTE TO: ConfiDent" frame.
- The server supports HTTP byte ranges, which iOS Safari needs to play video.

## confident AI

- **API.** The server uses `@anthropic-ai/sdk` with a manual tool-use loop (`src/assistant/assistant.mjs`). Model, effort and refusal fallback are set through environment variables (`ANTHROPIC_MODEL`, default `claude-opus-5-5`; `ANTHROPIC_EFFORT`, default `low`; `ANTHROPIC_FALLBACKS`, default `default`, which uses the API's server-side refusal fallback).
- **Knowledge.** The system prompt is built from `clinic-data.json` and the website copy (`src/assistant/prompt.mjs`), so the site and the assistant always agree. It contains no timestamps, so it caches well. The current Belize date travels with each message.
- **Tools.** There are three:
  - `find_available_times` (visit type and date range) returns only free times, each with an opaque `slot_ref` scoped to the visitor's session.
  - `open_booking_form` (`slot_ref`) shows the structured booking form in the chat. It doesn't book anything.
  - `open_staff_review_form` (visit type) shows a request form for staff-reviewed visits.
- **Final write.** Only the patient's submission of the review form calls the booking endpoint. Claude never receives names, phone numbers or emails. It gets a short website note about the outcome, such as the booking reference.
- **Safety and scope.** The assistant never gives clinical advice and directs emergencies to emergency care. It can't see or discuss anyone's appointments. Changes and cancellations are routed to the team.
- **Failure handling.** API errors, refusals and calendar outages all fall back to "I can’t confirm a time right now. Please call +501 628-8233 or send the practice a message on Instagram." Each session is capped at 40 turns and 15 messages per minute.

### Demo mode (previews without an API key)

When no `ANTHROPIC_API_KEY` is set and the site is a preview (`site.json` → `"preview": true`), confident AI runs in **demo mode** (`src/assistant/demo.mjs`):
- **Answers:** scripted, rule-based replies drawn from the same approved clinic records.
- **Booking:** it uses the real scheduler for times, the booking form and staff-review requests.
- **Labelling:** the panel says it's a demo.

Setting a key switches to Claude automatically. `ASSISTANT_DEMO=on|off` overrides the default. A live site (`"preview": false`) without a key shows the phone and Instagram fallback instead.

## Scheduling

```
findAvailability(visitType, from, to)    -> free slots + signed, session-bound slot refs
prepareBooking(slotRef) / prepareStaffReview(visitType)  -> signed review (booking reference issued)
completeReview(reviewId, contact)                        -> confirmed | staff_review_recorded |
                                                            slot_taken (+ real alternatives) |
                                                            unconfirmed | unavailable | invalid
```

- Slots come from `bookableWindows`, the visit duration (the whole visit must fit inside a window), the minimum notice, the booking horizon, and the calendar's busy times for each visit type's resources. All day and time rules are worked out in **America/Belize**.
- Slot references and review steps are HMAC-signed tokens bound to the visitor's session cookie, with their own expiry. The service keeps no in-memory state, so it runs the same on one server or on serverless functions.
- On completion, the service rechecks live availability, then writes the event. The test calendar first claims `slots/<resource>/<start>` with an atomic create-if-absent write and reads the claim back. Two bookings can't hold the same time, even across instances. **Confirmed is shown only after the event is saved**, or after reconciliation finds it.
- Retries are idempotent. The booking reference inside the review token is the idempotency key, and an identical retry returns the original result. A timed-out write is reconciled by its booking reference before any second write.
- Calendar events carry a neutral title (`ConfiDent appointment CD-XXXXXX (TEST)`). Patient contact details are stored only under `booking-records/` and `staff-requests/` in the data store, and are never logged.

### Data storage

Everything is kept in one small key-value store:
- **Node server:** JSON files under `data/`.
- **Netlify:** Netlify Blobs, store `confident-oral-care`. No setup is needed.

| Key prefix | Contents |
|---|---|
| `events/` | Test calendar events |
| `slots/` | Slot claims |
| `booking-records/` | Patient contact details for confirmed bookings |
| `staff-requests/` | Staff-review requests with contact details |
| `chats/` | confident AI conversation history per session (may contain what visitors typed) |
| `config/signing-secret` | Generated signing secret (unless `SESSION_SECRET` is set) |

### Calendar adapters

| Adapter | Status |
|---|---|
| `test-calendar` (default) | Persistent test calendar in the data store, with a recurring test busy block. Used for the preview. |
| `google` | Implemented against the Calendar REST API (freeBusy, events.insert with a deterministic event ID, events.get for reconciliation) using a service account. **Not yet exercised.** Verify it against a dedicated test calendar before relying on it. Set `"adapter": "google"` and `google.calendars` in `scheduling.json`. |
| Microsoft 365 | Not implemented. Add a class with the same three methods (`getBusy`, `createEvent`, `findEventByBookingRef`) using Graph `getSchedule` and `events`. |

### Demo assumptions (to confirm with the clinic)

| Setting | Demo value |
|---|---|
| Bookable visit | General consultation, 30 minutes, one test resource (`test-chair-1`) |
| Staff-review visits | Orthodontic consultation, and "Another treatment or visit" (any of the 22 services) |
| Windows | Mon–Fri 9:00–12:00 and 14:00–17:00, Sat 9:00–13:00. Last starts are 11:30, 4:30 p.m. and 12:30 p.m. |
| Notice and horizon | At least 2 hours ahead, up to 28 days |
| Test busy block | Every Wednesday 10:00–11:00 |

The posted hours caption mentions a 5 p.m. last appointment slot and 6 p.m. closing. The brief asked for visits to fit inside the posted window, so the demo's last weekday start is 4:30 p.m. Confirm the real rule for each day.

## Deploying

The app is a single Node process with no build step. It needs a **persistent disk** for `data/`.

- **Any Node host** (Render, Railway, Fly.io, a VPS). Run `npm ci --omit=dev && npm start`, set the environment variables from `.env.example`, attach a persistent volume at `confident-oral-care/data`, and serve over HTTPS. The session cookie is marked `Secure` when the proxy sends `X-Forwarded-Proto: https`.
- **Docker.** Build and run:
  ```bash
  docker build -t confident-preview .
  docker run -p 3000:3000 -e ANTHROPIC_API_KEY=... -v confident-data:/app/data confident-preview
  ```
- Set `PREVIEW_TOKEN` to protect `/preview/test-calendar` on a shared preview URL.
- The `greaterbelizemedia.github.io` GitHub Pages site can't run the booking or AI backend. Use Netlify (below) or a Node host.

## Netlify (zip upload, full site)

```bash
npm run export
```

This writes `deliverables/confident-oral-care-netlify.zip`. Upload it as-is to Netlify (Deploys → drag and drop the zip). There is no build step and no `npm install`. The zip contains:

- **Pages:** every page pre-rendered as HTML, plus CSS, JS, fonts, images and the route video.
- **`netlify/functions/api.mjs`:** one pre-bundled Netlify Function, with all dependencies inside. It serves `/api/*` (booking, availability, confident AI) and `/preview/test-calendar`, and stores data in Netlify Blobs.
- **`netlify.toml`:** publish the zip root, functions in `netlify/functions`.
- **`_redirects`:**
  - clean URLs, for example `/about` → `about.html`
  - a forced 404 for `/netlify/*` and `/netlify.toml`, so deployment files are never served
- **`_headers`:** `noindex` while `preview` is true, plus security and caching headers.

**Netlify environment variables** (Site configuration → Environment variables). Netlify applies them on the next deploy, so add them before uploading or upload again afterwards.

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | For confident AI | Without it, the assistant shows the phone and Instagram fallback. The booking form works either way. |
| `ANTHROPIC_MODEL` | No | Default `claude-opus-5-5` |
| `PREVIEW_TOKEN` | No | If set, the test calendar needs `/preview/test-calendar?token=<value>` |
| `SESSION_SECRET` | No | Generated and stored in Blobs if not set |

**Check after uploading:**
1. Open `https://<your-site>/api/assistant/status`. You should see `{"available":true,...}`, or `false` without an API key.
2. If it shows the site's 404 page instead, Netlify didn't deploy the function. The pages still work, and booking and the assistant fall back to phone and Instagram.

The function keeps each assistant reply under Netlify's 60-second function limit: a 25-second timeout per Claude request, one retry, and a 45-second overall deadline.

`npm run export` also writes `deliverables/confident-oral-care-preview.html`, a single self-contained file (about 5.5 MB) for reviewing the site on any device:
- **Runs in the page:** the real application core runs inside the file (`src/preview/browser.mjs`), so booking, the test calendar, the route video and confident AI in demo mode all work offline.
- **Test data:** stored in that browser's localStorage. The file's top banner links to the test calendar and has a "Reset test data" button.

## Before going live

- [ ] Clinic confirms the calendar provider, the visit types that can be booked directly, durations, resources, latest start per day (including Saturday), notice and cutoffs.
- [ ] Connect and verify the provider adapter against a test calendar, then the live calendar. Set `scheduling.json` → `"mode": "live"`, which removes the test labels.
- [ ] Set `site.json` → `"preview": false` and `"canonicalOrigin": "https://<production domain>"`. This enables canonical links, indexing and `sitemap.xml`.
- [ ] Clinic reviews the three blog drafts, the treatment copy and the AI's answers.
- [ ] Fill in `pendingClinicDetails` (fees, insurance, payment methods, policies) as they're confirmed, and confirm braces and aligners.
- [ ] Decide how online changes and cancellations should be authenticated. Until then they go to the team.
- [ ] Add the clinic tour video, plus captions or a transcript for gallery clips with speech.
- [ ] Optional: if a web licence for **Glossy** is obtained, add the WOFF2 to `public/fonts/` and put it first in `--serif` in `public/css/site.css`. The preview uses the brief's working pair, **Cormorant Garamond** and **Red Hat Display**, self-hosted under the SIL Open Font License (licences in `public/fonts/`).
- [ ] Privacy notice for the booking form and the assistant. Data retention policy for stored booking records and chat history (`data/` or Netlify Blobs).

## Quality checks performed

- 37 automated tests (`npm test`) cover:
  - slot generation (lunch, cutoff, notice, busy block, Saturday)
  - Belize time conversion
  - confirmed booking with one observable event
  - identical retry
  - two sessions competing for one slot
  - session-scoped slot references
  - staff review
  - validation, including minors
  - calendar outage
  - timed-out writes, with and without reconciliation
  - the assistant tool loop, with a scripted Claude client: availability → form, a made-up slot reference, an outage inside a tool, API error rollback, refusal, no key, and website outcome notes with no contact details
  - unique titles and descriptions
  - `noindex`
  - exact Instagram and Facebook URLs in the footer and on Contact Us
  - all 22 service anchors
  - every internal link and anchor
  - home section order and first-screen CTA
  - booking over HTTP, including cross-session and cross-origin refusal
  - gallery and contact videos (poster, no autoplay) and byte-range responses
  - two server instances sharing storage racing for one slot, and tampered or expired references
  - storage backends: memory, files, and Netlify Blobs via Netlify's local Blobs server
- Browser checks with Playwright at 390 px and 1440 px:
  - hero poster without video
  - the video variant with a temporary sample clip: autoplay, pause/play, reduced motion
  - keyboard access to the Services submenu, the mobile menu (Escape) and the gallery lightbox (arrows, Escape, focus return)
  - the assistant panel and its booking widget on mobile
  - the full booking flow
- The Netlify package was tested locally: the bundled function file ran against Netlify's local Blobs server, with a stand-in Claude endpoint. Form booking, AI-led booking, staff review, the test calendar, persistence across restarts, hidden deployment files, and the fallback when the function is missing all passed.
- **Not exercised:** live Claude API calls (no API key in the build environment), a deploy on Netlify itself, and the Google Calendar adapter. Netlify's local Blobs server doesn't serialise simultaneous conditional writes, so the cross-instance slot claim relies on production Blobs behaving as documented. The read-back check narrows the gap.
