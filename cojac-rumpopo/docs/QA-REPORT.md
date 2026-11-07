# QA report: Cojac’s Sumptuous Rumpopo website

Date: 6 November 2026 · Build: production (`npm run build`) and QA (`VITE_QA_WHATSAPP=5010000000`) · Browser: Chromium (Playwright), with desktop, iPhone 13 and Pixel 7 emulation.

**No live orders were sent.** All `wa.me` requests in the automated tests were intercepted and blocked. The QA number `5010000000` is a dummy, not a real line.

## Summary

| Area | Result |
|---|---|
| Unit tests: order maths, WhatsApp message (incl. delivery/pickup/shipping charges), number validation, season dates (`npm test`) | **16 / 16 pass** |
| End-to-end order flow with the business number 5016218372, on 3 devices (`scripts/qa-order-flow.mjs`); wa.me requests intercepted, so nothing was sent | **128 / 128 checks pass**: see `qa-order-flow-official.log`. Covers Liter size pricing, BZD $5 delivery and the BZD $166.00 total, free pickup with no address, shipping with no invented total, required name and exact address, a message of 15 lines or fewer with no dashes, and copy to clipboard. |
| Page sweep: 11 URLs × 4 viewports (1440, 834, 390, 360 px) | **44 / 44**: no console errors, no failed requests, no horizontal overflow — see `screenshots/qa-report.json` |
| Accessibility: axe-core WCAG 2.0/2.1 A and AA, 10 pages × desktop and mobile | **0 violations** (after contrast fixes for the WhatsApp green, small gold labels and story numerals) |
| TypeScript strict type check | Pass |
| **SEO update (Nov 2026):** full-HTML pre-render of all 10 pages | One `<h1>` per page. 190–1,050 words of content per page are readable with JavaScript off. Valid JSON-LD on every page (Organization, WebSite, WebPage type, BreadcrumbList; FAQPage on /faqs). The 404 page has no canonical and is `noindex`. |
| **Menu & photos (Nov 2026)** | 7 flavours × 2 sizes with approved prices. 14 supplied photos shown whole (`object-fit: contain`; mobile 4:5 at ≤767px, desktop 4:3 above). Checked at 390, 834, 1024, 1100, 1280 and 1440px: no size button, quantity stepper or Add button overflows its card. |
| **Hero slideshow (Nov 2026)** | Rotates every 6 s in order 01→04 and loops (verified on desktop and iPhone); mobile serves the 9:16 images, desktop the 16:9. It pauses on hover, keyboard focus and via the pause button, and does not auto-rotate for reduced-motion users. Only the first image is in the initial HTML; the next loads just before it appears. |
| **No dashes or eyebrows** | Scan of every built page, the JS bundle, llms.txt and the manifest: 0 em/en dashes, 0 eyebrow labels, 0 small-caps kicker labels. |
| **Holiday Blog (Nov 2026)** | 25 / 25 unit tests; 129 / 129 blog checks at 1280, 1920, 390 and 360 px (`qa-blog.log`); CLS ≤ 0.009; axe clean; details in `docs/HOLIDAY-BLOG.md`. |
| **Gallery (Nov 2026)** | Replaced with the nine supplied scenes. All 9 load with no failed requests at 360, 390, 834, 1280 and 1440px; phones get the 4:5 Mobile files and larger screens the 4:3 Desktop files, shown edge to edge at their exact ratio (no borders, padding or text over the photos); lightbox opens and steps through all 9; homepage hero unchanged. |
| **Payment step (Nov 2026)** | 37 / 37 unit tests (12 new: options per fulfilment, shipping forces transfer, bank links per platform, message lines). 177 / 177 order-flow checks on desktop, iPhone 13 and Pixel 7 (including the Atlantic Bank account 212001055 / Cojac Smith shown with copy buttons, the other-bank hint and transfer-first steps when the total is known): payment and bank required, delivery offers cash or transfer, cash hides the bank step, three bank icons load, “Open Belize Bank” goes to the website / App Store / installed app (Play fallback) on each device, amount BZD $166.00 shown, screenshot instruction shown, no invented account number, message includes “Payment: Bank transfer (Belize Bank)” and the screenshot line. axe clean with the bank step open. |
| **Fly to basket (Nov 2026)** | Tapping Add to Order floats a small copy of the flavour photo (with a “×3” badge for several bottles) in a gentle 1.6 s arc into the header basket, which then bounces and pops its count. It starts from the photo, or from the Add button when the photo is scrolled off screen. The item is added straight away; the animation is decorative (`aria-hidden`, no pointer events). Reduced-motion visitors get a brief gold highlight on the basket instead. 192 / 192 order-flow checks (5 new per device) on desktop, iPhone 13 and Pixel 7; 129 / 129 blog checks. |
| **English / Spanish (Nov 2026)** | Every page exists in both languages (Spanish under `/es/`), pre-rendered with `lang="es-BZ"`, its own Spanish title, description and canonical, hreflang links (`en-BZ`, `es`, `x-default`) and a bilingual sitemap. A first-time visitor whose browser is set to Spanish is sent to the Spanish page before anything is drawn; the EN | ES switch at the very top (also in the mobile menu and footer) opens the same page in the other language in one tap and is remembered. Spanish links are never redirected by browser setting alone, so shared links and search engines always get Spanish. The order request carries over between languages, and the WhatsApp message follows the visitor's language. `qa-i18n.mjs`: **50 / 50** (`qa-i18n.log`), including a full Spanish order on iPhone by taps only. Scan of all Spanish pages: no untranslated text (flavour names stay as they appear on the bottles). |
| **Footer credit (Nov 2026)** | One link, “Website developed by Austere Automations” / “Sitio web desarrollado por Austere Automations”, changing colour every 8 s: red, yellow, blue, then repeating. Each colour passes AA contrast on the footer. |
| **One tap (Nov 2026)** | Hover effects apply only on devices with a mouse or trackpad (added at build time), so a tap never needs repeating on a phone; links and buttons use `touch-action: manipulation`. Checked by tapping (not clicking) on iPhone 13: size, quantity, Add to Order, basket, drawer, payment, Send, menu, menu links and the language switch each work on the first tap. |
| **Re-check after the bilingual update** | 46 / 46 unit tests (9 new for Spanish); 192 / 192 order-flow; 129 / 129 blog; 96 / 96 page loads (12 pages × 2 languages × 4 widths) with no console errors, failed requests or sideways scrolling; axe WCAG 2.0/2.1 A and AA: 0 violations on 12 pages × 2 languages × desktop and mobile (a label mismatch on the Facebook video cards was fixed); 0 long dashes in the built site. |
| **Header update (Nov 2026)** | The green season banner now rides with the sticky header: visible when the page opens, tucks away while scrolling down, and slides back down whenever the visitor scrolls up (no layout jump). The language switch is a compact EN / ESP pill right beside the basket; removed from the footer so the credit stands alone. The full menu shows from 1200px (menu button below), so labels never wrap in either language. On phones the large flavour photo cards are left off the homepage (“See all flavours” remains); desktop unchanged. Re-run: 46/46 unit, 192/192 order flow, 129/129 blog, 65/65 bilingual (`qa-i18n.log`), 96/96 page loads, axe 0 violations. |
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
- **Spanish wording:** written in neutral Latin American Spanish using “tú”. Have a Spanish-speaking member of the family read it once, especially the slogan line “Sip Something Sumptuous!” (“¡Brinda con algo suntuoso!”) and “Suntuosa” for “Sumptuous.”
- **Safari and Firefox engines:** only Chromium was automated here. The code avoids engine-specific APIs, and the clipboard has a fallback.
- **Facebook videos:** no embed (share links don’t reliably embed). Safe “Watch on Facebook” cards are used instead, and the links open externally. The links themselves weren’t checked, because Facebook blocks automated requests.
- **Legal review** of the age notice, alcohol delivery and shipping rules is still needed. The age notice is a courtesy, not verification.
- **Placeholders:** the product bottles are labelled “Illustration”, and the gallery tiles read “Photo coming soon”. They are not presented as real photography.
