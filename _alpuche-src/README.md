# José M. Alpuche · website demo

Private prospect demo built from the handoff package of 12 November 2026 (`docs/START-HERE.md`).
The built site is in [`../demos/jose-m-alpuche/`](../demos/jose-m-alpuche/). This source folder starts with `_`, so GitHub Pages’ Jekyll step does not publish it.

## Build

```bash
node _alpuche-src/build.mjs                       # private preview: noindex, no sitemap, no canonicals
node _alpuche-src/build.mjs --production --site-url=https://<confirmed-domain>
                                                  # indexable build: canonicals, breadcrumb JSON-LD, sitemap.xml, robots.txt
node _alpuche-src/build.mjs --out=/some/dir       # build somewhere else
```

### Local preview (no hosting)

```bash
node _alpuche-src/build.mjs --local     # → _alpuche-src/dist-local/jose-m-alpuche-preview/
```

Unzip, then double-click `index.html`. Every link points at an `index.html` file and the fonts are embedded, so the whole site, including the assistant and the contact preselect, works from disk with no server.

### Single-file preview

```bash
node _alpuche-src/build.mjs --local && node _alpuche-src/scripts/make-single.cjs
# → _alpuche-src/dist-local/jose-m-alpuche-single-file-preview.html
```

All 17 pages, CSS, fonts, images and scripts in one HTML file with hash routing (`#/practice-areas/real-estate/`). It works from disk or in a single-file viewer such as the Claude app's side panel. Without JavaScript it shows the home page.

### Netlify bundle

```bash
node _alpuche-src/build.mjs --netlify [--site-url=https://<site>.netlify.app]   # → _alpuche-src/dist-netlify/
node _alpuche-src/scripts/serve-netlify.cjs                                     # local test at http://localhost:8081/
```

Zip the *contents* of `dist-netlify/` so that `index.html` is at the root of the zip, then drag the zip onto Netlify’s deploy area. The bundle adds:
- `_headers`: noindex (`X-Robots-Tag`), a Content-Security-Policy with `connect-src 'none'` and `form-action 'none'` so the demo cannot transmit anything, and basic security headers;
- `_redirects`: `/services/` → `/practice-areas/` (301);
- `404.html`.

Without `--site-url`, `og:url` is omitted and `og:image` is root-relative, so link previews in some apps will show no image. Once the Netlify address is known, rebuild with `--site-url` for full share previews.

The builder has no dependencies. It needs Node 18 or later. All links are relative, so the output works from any folder or domain root.

| Path | What it holds |
|---|---|
| `content/*.md` | The 17 drafted pages, unchanged from the handoff. The frontmatter supplies the route, title, description, image and source IDs. |
| `ai/` | Assistant knowledge base, instructions, the 24 test cases and `test-coverage.md`. |
| `build.mjs` | Markdown parser, page templates, shared office data (address, phones, hours) and the assistant’s sample topics. |
| `static/` | CSS, JS, fonts (OFL), and image derivatives. |
| `scripts/make-images.sh` | Regenerates the image derivatives from the original handoff `assets/` folder (originals are not committed). |
| `scripts/make-og-cards.cjs` | Renders the two 1200×630 social cards with Playwright. |
| `scripts/verify.cjs` | End-to-end checks (see below). |
| `docs/` | Brief, design direction, source register and image credits from the handoff. |

To change copy, edit the Markdown and rebuild. The office details live once, in `OFFICE` in `build.mjs`.

## Verify

```bash
npx http-server -p 8080 -s .          # from the repo root
node _alpuche-src/scripts/verify.cjs  # 446 browser checks
node _alpuche-src/scripts/test-assistant.cjs     # 206 engine checks: the 24 handoff cases, guardrails, site answers, enquiry flow
node _alpuche-src/scripts/test-apps-script.cjs   # 25 checks of Code.gs with Google services mocked
node _alpuche-src/scripts/verify-endpoint.cjs    # enquiry delivery against a mock endpoint, with Netlify's CSP
```

The suite checks:
- every route returns 200, every internal link resolves and no assets fail;
- each page has noindex, title, description, absolute og:image, a single H1, a breadcrumb, the photo-credit link and a consultation route;
- each practice page has a practice-specific consultation link, and each page with a Belize photo shows its credit;
- consultation buttons open the Alpuche AI enquiry with the practice carried over, and the assistant opens and closes from the keyboard, including Escape;
- contact preselect: known `?area=` values are applied and unknown or hostile values are ignored and never rendered;
- Alpuche AI: the typing delay, free-text answers, guardrails (legal advice, hidden ID numbers, 911, urgent dates), and the full enquiry in demo mode with no network requests;
- both mobile demo scripts in the brief;
- no horizontal overflow, and the assistant button never covering a control, at 1366, 820, 390 and 320 px;
- the hero CTA in the first screen, and the portrait shown in full with its photographer credit.

## Behaviour notes

- **Alpuche AI.** A chat assistant that runs in the browser, with no model and no external service (`static/js/alpuche-ai.js`).
  - **Answers:** curated answers from `ai/knowledge-base.md`, plus every section and FAQ published on the site. Both are indexed at build time into `assets/js/alpuche-ai-data.js`, so rebuilding after a copy change updates what it knows.
  - **Safety:** it applies the handoff's escalation order (danger, sensitive details, urgent dates, role changes) and refuses legal advice before answering.
  - **Typing:** a typing indicator shows for about 1–2 s before each reply.
  - **Enquiries:** it collects a short enquiry, after a notice and consent, then shows a review before anything is sent.
  - **WhatsApp:** visitors can choose WhatsApp as the reply channel or open a pre-filled chat to the firm's number. The number comes from `OFFICE.whatsapp` in `build.mjs`; `--whatsapp=off` disables this.
  - **Delivery:** with `--lead-endpoint=<Apps Script /exec URL>`, the enquiry is posted to that endpoint, which emails the inbox and the visitor (`integrations/google-apps-script/SETUP-EMAIL.md`). Without it, demo mode shows the two emails instead.
  - **Button placement:** when the button would cover a link, it slides into the right-hand gutter.
- **Contact preselect.** `/contact/?area=<key>` accepts only the seven practice keys. It labels the Alpuche AI button with the practice, adds a note and puts the practice in the email subject. The plain `/contact/` URL is canonical.
- **Enquiries.** The contact-page form has been removed. “Request a consultation” buttons open Alpuche AI's enquiry, carrying the practice. Without JavaScript they still link to the contact page.
- **Brand icons.** The WhatsApp and Facebook glyphs come from Simple Icons (CC0 1.0). They are inlined as SVG from `ICON_PATHS` in `build.mjs` and shown in each brand's colour beside every WhatsApp and Facebook link: contact page, footer and Alpuche AI.
- **Mobile hero.** At 780 px and below, the portrait comes first under the header and the words follow. This is the agency's direction of 13 Nov 2026; the original brief put the title and CTA first. Desktop and tablet keep the words and portrait side by side.
- **Images.** The portrait and Janine’s photo are cropped only to remove blank capture margins. The JMA mark is cropped to its black artwork. The Belize photos are resized, and some layouts frame them with CSS `object-fit`.
