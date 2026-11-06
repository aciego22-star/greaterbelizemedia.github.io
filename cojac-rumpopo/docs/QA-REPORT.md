# QA report: Cojac’s Sumptuous Rumpopo website

Date: 6 November 2026 · Build: production (`npm run build`) and QA (`VITE_QA_WHATSAPP=5010000000`) · Browser: Chromium (Playwright), with desktop, iPhone 13 and Pixel 7 emulation.

**No live orders were sent.** All `wa.me` requests in the automated tests were intercepted and blocked. The QA number `5010000000` is a dummy, not a real line.

## Summary

| Area | Result |
|---|---|
| Unit tests: order maths, WhatsApp message (incl. delivery/pickup/shipping charges), number validation, season dates (`npm test`) | **16 / 16 pass** |
| End-to-end order flow with the business number 5016230447, on 3 devices (`scripts/qa-order-flow.mjs`); wa.me requests intercepted, so nothing was sent | **104 / 104 checks pass** — see `qa-order-flow-official.log`. Covers pickup = “No charge” with no area field, shipping = town/district plus a charge, and delivery = Belize City area plus a charge. |
| Page sweep: 11 URLs × 4 viewports (1440, 834, 390, 360 px) | **44 / 44**: no console errors, no failed requests, no horizontal overflow — see `screenshots/qa-report.json` |
| Accessibility: axe-core WCAG 2.0/2.1 A and AA, 10 pages × desktop and mobile | **0 violations** (after contrast fixes for the WhatsApp green, small gold labels and story numerals) |
| TypeScript strict type check | Pass |
| **SEO update (Nov 2026):** full-HTML pre-render of all 10 pages | One `<h1>` per page. 190–1,050 words of content per page are readable with JavaScript off. Valid JSON-LD on every page (Organization, WebSite, WebPage type, BreadcrumbList; FAQPage on /faqs). The 404 page has no canonical and is `noindex`. |
| Favicon | `/favicon.ico` (16/32/48) + 48/96/192/512 PNG + 180 apple-touch-icon + manifest, linked in the static homepage `<head>` |
| Hydration | Pre-rendered HTML is hydrated, and the saved cart and age answer are restored after mount. The order flow was re-run: 89/89 (QA number) and 50/50 (no number) pass. The sweep over the served static files found no console errors. |
| Direct load / refresh of every route | Each route is pre-rendered to its own `index.html` with its own title, description and canonical link. Unknown paths → `404.html` with a 404 status (`_redirects` and `netlify.toml`). |

## Order-flow checks (each run on desktop, iPhone 13 and Pixel 7)

- The age notice shows on the first visit and remembers the answer. “I’m under 18” shows a polite stop screen.
- Add to Order works, including a quantity stepper, a typed quantity and an optional per-flavour note.
- Adding the same flavour twice merges the lines (2 + 3 = 5).
- Cart drawer: opens from the header, edits quantities, removes lines, traps focus and closes with Esc.
- The header badge and the mobile sticky “Review & send” bar show the bottle count.
- Large quantities are clamped to 99 per line (5000 → 99). Zero, negative and non-numeric input are rejected.
- **No fictional totals:** with unconfirmed prices the subtotal reads “To be confirmed by Cojac’s”, and the delivery fee also reads “To be confirmed”.
- The Send button won’t proceed until a fulfilment option is chosen and the age box is ticked. Errors are announced inline.
- WhatsApp opens via `https://wa.me/<number>?text=<encodeURIComponent(message)>` in a new tab (a normal link, so pop-up blockers don’t stop it).
- The decoded message contains: business name, every item with size and quantity, notes, subtotal label, fulfilment, fee label, area, preferred date (“Sun, 20 December 2026”), name, notes with special characters (`& # ? "quotes" 🎄`), and the closing line “Please confirm availability, final price, payment arrangements and fulfilment details.”
- Removed items don’t appear in the message.
- After tapping Send, the page shows the honest wording: “WhatsApp will open with your order request. Please send the message to complete your enquiry. Cojac’s will confirm details directly.” It never says “order confirmed”, “order placed” or “payment received”.
- The QA build shows a visible “QA test line — not the business number” flag.
- “Copy order details” copies the full message, confirmed by reading the clipboard on desktop, with a manual fallback message.
- The order request survives a page refresh. “Clear order request” empties it.
- **Missing number (production today):** the Send button is disabled, an explanation is shown, and there are no `wa.me` links anywhere on the page.
- The mobile menu lists all 9 sitemap sections, plus Home, and navigates correctly.

## Unit-test coverage (`tests/order.test.ts`)

Priced, unpriced and mixed totals. An estimated total appears only when every price **and** the fee are approved. Lines for removed products or variants are dropped. Quantity clamping and per-variant limits. Message content and optional fields (“Flexible” date). URL encoding round-trip for long messages, notes capped at 500 characters, and emoji. Number validation: rejects empty, short and local-format numbers, and never guesses. The official number takes priority over the QA number. Season logic in Belize time (UTC-6): open through 3 January 2027, closed from 4 January, plus the manual switches.

## Screenshots

`docs/screenshots/` contains full-page captures of every page at desktop (1440), tablet (834), mobile (390) and small mobile (360), plus `flow-*` captures of the mobile order journey.

## Not covered / limitations (please test by hand before launch)

- **Real devices:** opening the actual WhatsApp app on iOS and Android, and WhatsApp Desktop/Web, has not been tested, because no approved number exists yet. Once the number is set, send one test order to the family from an iPhone and an Android phone. Then check that a line-break-heavy message arrives formatted (bold `*TITLES*`).
- **Safari and Firefox engines:** only Chromium was automated here. The code avoids engine-specific APIs, and the clipboard has a fallback.
- **Facebook videos:** no embed (share links don’t reliably embed). Safe “Watch on Facebook” cards are used instead, and the links open externally. The links themselves weren’t checked, because Facebook blocks automated requests.
- **Legal review** of the age notice, alcohol delivery and shipping rules is still needed. The age notice is a courtesy, not verification.
- **Placeholders:** the product bottles are labelled “Illustration”, and the gallery tiles read “Photo coming soon”. They are not presented as real photography.
