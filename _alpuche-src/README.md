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
node _alpuche-src/scripts/verify.cjs  # 435 checks
```

The suite checks:
- every route returns 200, every internal link resolves and no assets fail;
- each page has noindex, title, description, absolute og:image, a single H1, a breadcrumb, the photo-credit link and a consultation route;
- each practice page has a practice-specific consultation link, and each page with a Belize photo shows its credit;
- all eight assistant topics give the expected knowledge-base answer and route, with no network requests, keyboard open/close and Escape;
- contact preselect: known `?area=` values are applied and unknown or hostile values are ignored and never rendered;
- the preview form sends nothing, stores nothing and clears its fields;
- both mobile demo scripts in the brief;
- no horizontal overflow, and the assistant button never covering a control, at 1366, 820, 390 and 320 px;
- the hero CTA in the first screen, and the portrait shown in full with its photographer credit.

## Behaviour notes

- **Office assistant.** Uses prepared answers only, taken verbatim from `ai/knowledge-base.md` at build time. There are four opening topics (property, business, retirement, contact) and four hand-off examples (urgent hearing, documents, fees, unlisted service). There is no free text, no model call and no storage. When the button would cover a link, it slides into the right-hand gutter.
- **Contact preselect.** `/contact/?area=<key>` accepts only the seven practice keys. It sets the preview form’s matter type, adds a note and puts the practice in the email subject. The plain `/contact/` URL is canonical.
- **Enquiry form.** Simulation only. It has no `action`, its button is `type="button"`, and its values are cleared on “send”.
- **Images.** The portrait and Janine’s photo are cropped only to remove blank capture margins. The JMA mark is cropped to its black artwork. The Belize photos are resized, and some layouts frame them with CSS `object-fit`.
