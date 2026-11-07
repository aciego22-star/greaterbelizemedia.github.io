# Launch blockers: information needed from the family

Nothing below was invented. Each item is either empty in the config (so it is hidden) or shown as “to be confirmed”. Internal preview builds also list these on `/launch-notes`, and that list updates itself as items are filled in.

## Must have before public launch

| # | Item | Where it goes | What the site does now |
|---|---|---|---|
| 1 | ~~Official WhatsApp order number~~ — **done: +501 621-8372** | `site.ts → whatsapp.orderNumber` | Send button opens WhatsApp to 5016218372. |
| 2 | **Brand spelling** — the official logo (supplied Nov 2026) reads “Cojac’s”, matching the sitemap. Only needs a final yes from the family. | `site.ts`, `copy.ts`, `catalogue.ts` | Uses “Cojac’s” everywhere. |
| 3 | ~~2026/27 flavour list~~ — **done**: Classic Vanilla, Peanut Delight, Pumpkin Spice, White Chocolate w/ Hazelnut, Dark Chocolate Peppermint, Snickerdeluxe, Vegan | `catalogue.ts` | Shown as “On this season’s menu” (no stock claim). |
| 4 | ~~Bottle sizes and BZD prices~~ — **done**: Half liter (500 mL) and Liter (1 L) for every flavour, BZD $17–$50 | `catalogue.ts → variants` | Live prices, subtotals and itemised WhatsApp messages. |
| 5 | **Delivery and shipping charge amounts** (options confirmed: Delivery within Belize City limits — charge; Pickup — free; Shipping out-district — charge). Also: pickup location/times, and whether alcohol may be shipped to all districts | `site.ts → fulfilment.feeBZD` | Customers choose Delivery, Pickup or Shipping. Pickup shows “No charge”; delivery and shipping show “Charge applies — amount confirmed by Cojac’s”. |
| 6 | **Allergen and ingredient statement for each flavour** (egg, milk, peanut, hazelnut, chocolate…) — especially Peanut Delight, White Chocolate w/ Hazelnut, Snickerdeluxe and the Vegan recipe | `catalogue.ts → allergens`, `ingredientsDisclosure` | Shows a generic “may contain egg and dairy — please ask” note on every card. |
| 7 | **Legal age and alcohol obligations** (Belize purchasing age, any rules for selling or delivering alcohol) | `site.ts → alcohol` | Shows an 18+ courtesy notice and an age checkbox before sending. This is not age verification. |
| 8 | **Final domain** | `site.ts → siteUrl` | Placeholder `cojacs-rumpopo.netlify.app`. |

## Should have

| # | Item | Where |
|---|---|---|
| 9 | ~~Logo~~ (done: official logo in `public/brand/`). Still needed: bottle label art and official brand colour codes, if any. | `global.css` |
| 10 | ~~Product photography~~ — **done**: 14 photos (desktop 4:3 + mobile 4:5) for all seven flavours | `public/products/` |
| 11 | Gallery now uses the seven product photos plus two Greater Belize Media stills — **confirm the family and presenter are happy for the GBM stills to appear.** More photos (packaging, events, memories) welcome. | `public/gallery/`, `gallery.ts` |
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
