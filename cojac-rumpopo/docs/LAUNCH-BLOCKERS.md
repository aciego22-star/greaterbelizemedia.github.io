# Launch blockers: information needed from the family

Nothing below was invented. Each item is either empty in the config (so it is hidden) or shown as “to be confirmed”. Internal preview builds also list these on `/launch-notes`, and that list updates itself as items are filled in.

## Must have before public launch

| # | Item | Where it goes | What the site does now |
|---|---|---|---|
| 1 | ~~Official WhatsApp order number~~ — **done: +501 621-8372** | `site.ts → whatsapp.orderNumber` | Send button opens WhatsApp to 5016218372. |
| 2 | **Brand spelling** — the official logo (supplied Nov 2026) reads “Cojac’s”, matching the sitemap. Only needs a final yes from the family. | `site.ts`, `copy.ts`, `catalogue.ts` | Uses “Cojac’s” everywhere. |
| 3 | ~~2026/27 flavour list~~ — **done**: Classic Vanilla, Peanut Delight, Pumpkin Spice, White Chocolate w/ Hazelnut, Coquito (new, replaced Dark Chocolate Peppermint on 12 Nov 2026), Snickerdeluxe, Vegan | `catalogue.ts` | Shown as “On this season’s menu” (no stock claim). |
| 4 | ~~Bottle sizes and BZD prices~~ — **done**: Half liter (500 mL) and Liter (1 L) for every flavour, BZD $17–$50 | `catalogue.ts → variants` | Live prices, subtotals and itemised WhatsApp messages. |
| 5 | **Shipping charge** for out of district orders (delivery is set: BZD $7 anywhere in Belize City, from 12 Nov 2026; pickup is free). Also: pickup location and times, and whether alcohol may be shipped to every district | `site.ts → fulfilment.shipping.feeBZD` | Shipping shows “Charge confirmed by Cojac’s”, so no total is shown for shipping orders until the amount is entered. |
| 6 | **Allergen and ingredient statement for each flavour** (egg, milk, peanut, hazelnut, chocolate…) — especially Peanut Delight, White Chocolate w/ Hazelnut, Snickerdeluxe, Coquito and the Vegan recipe | `catalogue.ts → allergens`, `ingredientsDisclosure` | Shows a generic “may contain egg and dairy — please ask” note on every card. |
| 7 | **Legal age and alcohol obligations** (Belize purchasing age, any rules for selling or delivering alcohol) | `site.ts → alcohol` | No pop-up on arrival (removed 12 Nov 2026). The footer carries the small print “Alcoholic beverages will not be sold to anyone under 18.”, and the order page still asks for an 18+ tick before sending. This is not age verification. |
| 8 | **Final domain** | `site.ts → siteUrl` | Set to the live Netlify address `shiny-truffle-ef9459.netlify.app`. If the Netlify site is renamed or a custom domain is added, update this and rebuild, so Google’s links point to the right address. |

| 9b | **Hero slides**: the first slide is the family’s Rumpopo Slush promotion (Puma Freetown, $12); remove it from `hero.ts` when the promotion ends. Also confirm the four slideshow images (cocktail, gift bags, glass bottles, holiday collection) show packaging Cojac’s actually offers, since customers may expect it | `public/hero/`, `hero.ts` | Shown on the homepage. |

| 9e | **Coquito and the mystery flavour**: if Coquito is the secret flavour from the Facebook competition, listing it on the menu reveals it. Confirm, and the blog’s competition panel can be switched to “revealed” (`contest.ts → status`) | `catalogue.ts`, `src/content/blog/contest.ts` | Coquito is on the menu; the blog still says the flavour is secret. |

| 9c | **Holiday Blog contest link**: the exact Facebook competition post URL, confirmation the flavour is still secret and guesses still open, and any eligibility/age wording the owners want shown | `src/content/blog/contest.ts` | Panel links to the official Facebook page (“Visit Cojac’s Official Facebook Page”) and asks people to find the post. No enter button until the link is supplied. |

| 9d | ~~Bank account details and pickup payment~~ — **done**: transfers go to Atlantic Bank Limited, account 212001055 (Cojac Smith); pickup is cash or bank transfer (confirmed); shipping is transfer only. Account type not supplied, so none is shown. | `src/content/payments.ts` | Shown at checkout with copy buttons. |

## Should have

| # | Item | Where |
|---|---|---|
| 8b | **Spanish read-through** by a Spanish-speaking family member (the site is fully bilingual; wording is neutral Latin American Spanish with “tú”) | `t('…', '…')` texts, `src/content/routes.ts` |



| # | Item | Where |
|---|---|---|
| 9 | ~~Logo~~ (done: official logo in `public/brand/`). Still needed: bottle label art and official brand colour codes, if any. | `global.css` |
| 10 | ~~Product photography~~ — **done**: 14 photos (desktop 4:3 + mobile 4:5) for all seven flavours | `public/products/` |
| 11 | ~~Gallery photos~~ — **done**: nine owner-supplied scenes (desktop 4:3 + mobile 4:5 pairs). Note: the “Chilled on ice” photo shows a bottle labelled “Piña Colada”, which is not on the current menu; confirm the family is happy to show it. | `public/gallery/`, `gallery.ts` |
| 12 | ~~Facebook and Instagram links~~ — **done** (facebook.com/share/1EJbfQLwDq, instagram.com/cojacsumptuousrumpopo). Optional: swap the Facebook *share* link for the page’s permanent address (facebook.com/<page-name>) when known — it is a stronger signal for Google. | `site.ts → social` |
| 13 | ~~Email~~ — **done: rumpopobze@gmail.com** (email logo beside WhatsApp, Facebook, Instagram). Public phone number still optional. | `site.ts → contact` |
| 14 | Pickup point: pickup is now offered (free); location and time are confirmed on WhatsApp. Diego St is **not** described as the pickup point unless the family confirms it. | `site.ts → fulfilment.pickup`, `contact.mapUrl` |
| 15 | Payment methods accepted (arranged outside the website) | `faqs.ts → payment-methods` |
| 16 | Answers to the draft FAQs: prices, sizes, lead time, delivery fees, shipping areas, pickup, storage, gifting, refunds | `faqs.ts` |
| 17 | Titles for the two Facebook videos, and confirmation that the YouTube features may be shown | `media.ts` |
| 18 | Founding year, founder story or awards, only if the family wants them published | `copy.ts`, Story page |
| 19 | Genuine testimonials, with the customer’s permission (none are shown) | (new section) |

## Notes

- The YouTube titles and publisher (“Greater Belize Media | GBM”) come from YouTube’s public data. One published title spells the brand “Colac’s”. The site shows a neutral display title (“Christmas Feature”) and keeps the original title in `media.ts` for reference.
- No LocalBusiness or Product structured data was added, because the address, hours, prices and contact details aren’t verified yet. It can be added once they are.
- No analytics are installed.
