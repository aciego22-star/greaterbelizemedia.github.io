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

For the Gallery **Videos** section, fill in the entry in `media.galleryVideos`: `src`, `runtime`, and `captions` (a WebVTT file) or `transcript` for spoken content. Gallery clips play only when the visitor starts them. While no clip has a `src`, the section shows the reception still and links to Instagram.

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

## Scheduling

```
findAvailability(visitType, from, to)    -> free slots + session-scoped slot refs
prepareBooking(slotRef) / prepareStaffReview(visitType)  -> review (booking reference issued)
completeReview(reviewId, idempotencyKey, contact)        -> confirmed | staff_review_recorded |
                                                            slot_taken (+ real alternatives) |
                                                            unconfirmed | unavailable | invalid
```

- Slots come from `bookableWindows`, the visit duration (the whole visit must fit inside a window), the minimum notice, the booking horizon, and the calendar's busy times for each visit type's resources. All day and time rules are worked out in **America/Belize**.
- On completion, the service takes a per-resource lock, rechecks live availability, then writes the event. **Confirmed is shown only after the calendar returns an event ID**, or after reconciliation finds the event.
- Retries are idempotent. The same idempotency key or review returns the original result and booking reference. A timed-out write is reconciled by its booking reference before any second write.
- Calendar events carry a neutral title (`ConfiDent appointment CD-XXXXXX (TEST)`). Patient contact details are stored only in `data/booking-records.json` (or `data/staff-review-requests.json`) and are never logged.

### Calendar adapters

| Adapter | Status |
|---|---|
| `local` (default) | Persistent JSON test calendar at `data/test-calendar.json`, with a recurring test busy block. Used for the preview. |
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
- **Single instance.** Sessions, slot holds and the booking lock are held in memory, and the JSON store suits one process. To run several instances, move them to a shared store (for example Redis or Postgres) and use a database or provider-level lock.
- Set `PREVIEW_TOKEN` to protect `/preview/test-calendar` on a shared preview URL.
- This folder sits in the `greaterbelizemedia.github.io` repository. GitHub Pages serves static files only, so it can't run the booking or AI backend. Deploy this folder to a Node host instead.

## Before going live

- [ ] Clinic confirms the calendar provider, the visit types that can be booked directly, durations, resources, latest start per day (including Saturday), notice and cutoffs.
- [ ] Connect and verify the provider adapter against a test calendar, then the live calendar. Set `scheduling.json` → `"mode": "live"`, which removes the test labels.
- [ ] Set `site.json` → `"preview": false` and `"canonicalOrigin": "https://<production domain>"`. This enables canonical links, indexing and `sitemap.xml`.
- [ ] Clinic reviews the three blog drafts, the treatment copy and the AI's answers.
- [ ] Fill in `pendingClinicDetails` (fees, insurance, payment methods, policies) as they're confirmed, and confirm braces and aligners.
- [ ] Decide how online changes and cancellations should be authenticated. Until then they go to the team.
- [ ] Add the clinic tour video, plus captions or a transcript for gallery clips with speech.
- [ ] Optional: if a web licence for **Glossy** is obtained, add the WOFF2 to `public/fonts/` and put it first in `--serif` in `public/css/site.css`. The preview uses the brief's working pair, **Cormorant Garamond** and **Red Hat Display**, self-hosted under the SIL Open Font License (licences in `public/fonts/`).
- [ ] Privacy notice for the booking form and the assistant. Data retention policy for `data/`.

## Quality checks performed

- 28 automated tests (`npm test`) cover:
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
- Browser checks with Playwright at 390 px and 1440 px:
  - hero poster without video
  - the video variant with a temporary sample clip: autoplay, pause/play, reduced motion
  - keyboard access to the Services submenu, the mobile menu (Escape) and the gallery lightbox (arrows, Escape, focus return)
  - the assistant panel and its booking widget on mobile
  - the full booking flow
- **Not exercised:** live Claude API calls (no API key in the build environment) and the Google Calendar adapter.
