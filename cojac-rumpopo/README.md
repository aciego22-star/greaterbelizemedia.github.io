# Cojac’s Sumptuous Rumpopo — website

Seasonal brand website, flavour catalogue and **WhatsApp order requests** for Cojac’s Sumptuous Rumpopo, Belize City.

- No online payments, no accounts, no backend. Every order is a WhatsApp message that the customer reviews and sends.
- React 18 + TypeScript + Vite. Static output, ready for Netlify.
- This folder is its own project. It does not touch the Greater Belize Media page at the repository root or any other client site.

## Quick start

```bash
cd cojac-rumpopo
npm ci
npm run dev          # http://localhost:5173
npm test             # unit tests (order totals, WhatsApp message, season dates, number validation)
npm run build        # production build → dist/
npm run preview      # serve dist/ at http://localhost:4173
```

### Build variants

| Command | Use |
|---|---|
| `npm run build` | **Production.** Only confirmed content is shown. |
| `npm run build:preview` | Internal preview. Adds a “launch notes” ribbon and a `/launch-notes` checklist. |
| `npm run build:illustrative` | Internal preview that also shows *sample* bottle sizes (no prices), clearly labelled “Illustrative”. |
| `npm run build:artifact` | Claude artifact preview (in-memory navigation, relative paths, videos open on YouTube) → `dist-artifact/`. Republish to slug `6fae53bf-1e34-4c7a-8eb2-be42f9309c03`. |
| `VITE_QA_WHATSAPP=501XXXXXXX npm run build:preview` | QA build. It sends test orders to a **team test number**, never to the business. Production ignores this when an official number is set. |

## Deploying to Netlify

1. In Netlify, choose **Add new site → Import from Git** and pick this repository.
2. Set **Base directory** to `cojac-rumpopo`. `netlify.toml` already sets the build command (`npm ci && npm run build`) and the publish folder (`dist`).
3. Deploy. Each page is pre-rendered to full HTML in its own folder (`/flavours/index.html` and so on), with structured data, so direct links, refreshes and crawlers all work without JavaScript. Unknown URLs get the branded 404 page with a real 404 status.

**Drag-and-drop option:** run `npm run build`, then drag the `dist/` folder (or the supplied ZIP) onto Netlify’s deploy screen.

Once the domain is known, change `siteUrl` in `src/content/site.ts`. The canonical links, sitemap, robots.txt and social previews all update on the next build.

## Where things live

```
src/content/site.ts        business settings: name, WhatsApp number, season dates, banner, fulfilment, contact, social, age
src/content/catalogue.ts   flavours, sizes, prices, availability, allergens, photos
src/content/faqs.ts        FAQ questions & answers (draft answers stay hidden until published)
src/content/media.ts       videos & features
src/content/gallery.ts     gallery photos
src/content/copy.ts        the family's approved copy (story, guarantee, videos intro)
src/content/routes.json    page URLs, titles and SEO descriptions
src/lib/order.ts           order maths + WhatsApp message builder (unit-tested)
src/lib/season.ts          season open/closed logic (Belize time)
public/brand/              official Cojac's logo (original + transparent cut-outs)
public/                    favicon, social image, robots.txt, video thumbnails; add product/gallery photos here
docs/                      handover guide, launch blockers, QA report, screenshots
```

See **docs/HANDOVER.md** for step-by-step edits the family can make each season, and **docs/SEO.md** for search, answer-engine and AI visibility (including getting the favicon into Google).
