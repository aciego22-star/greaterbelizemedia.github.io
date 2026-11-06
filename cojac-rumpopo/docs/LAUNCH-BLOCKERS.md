# Launch blockers: information needed from the family

Nothing below was invented. Each item is either empty in the config (so it is hidden) or shown as “to be confirmed”. Internal preview builds also list these on `/launch-notes`, and that list updates itself as items are filled in.

## Must have before public launch

| # | Item | Where it goes | What the site does now |
|---|---|---|---|
| 1 | ~~Official WhatsApp order number~~ — **done: +501 623-0447** | `site.ts → whatsapp.orderNumber` | Send button opens WhatsApp to 5016230447. |
| 2 | **Brand spelling** — the official logo (supplied Nov 2026) reads “Cojac’s”, matching the sitemap. Only needs a final yes from the family. | `site.ts`, `copy.ts`, `catalogue.ts` | Uses “Cojac’s” everywhere. |
| 3 | **2026/27 flavour list**: which flavours are definitely on this season | `catalogue.ts → confirmedThisSeason`, `active` | Classic Vanilla, Peanut Delight and Pumpkin Spice are shown with “Ask about availability”. |
| 4 | **Bottle sizes and BZD prices** | `catalogue.ts → variants` | “Bottle sizes are confirmed by Cojac’s” and “Price: To be confirmed by Cojac’s”. No totals are calculated. |
| 5 | **Delivery and shipping charge amounts** (options confirmed: Delivery within Belize City limits — charge; Pickup — free; Shipping out-district — charge). Also: pickup location/times, and whether alcohol may be shipped to all districts | `site.ts → fulfilment.feeBZD` | Customers choose Delivery, Pickup or Shipping. Pickup shows “No charge”; delivery and shipping show “Charge applies — amount confirmed by Cojac’s”. |
| 6 | **Allergen and ingredient statement for each flavour** (egg, milk, nuts and so on) | `catalogue.ts → allergens`, `ingredientsDisclosure` | Shows a generic “may contain egg and dairy — please ask” note. |
| 7 | **Legal age and alcohol obligations** (Belize purchasing age, any rules for selling or delivering alcohol) | `site.ts → alcohol` | Shows an 18+ courtesy notice and an age checkbox before sending. This is not age verification. |
| 8 | **Final domain** | `site.ts → siteUrl` | Placeholder `cojacs-rumpopo.netlify.app`. |

## Should have

| # | Item | Where |
|---|---|---|
| 9 | ~~Logo~~ (done: official logo in `public/brand/`). Still needed: bottle label art and official brand colour codes, if any. | `global.css` |
| 10 | Product photography for each flavour | `public/products/`, `catalogue.ts → images` |
| 11 | Gallery photos (bottles, packaging, events, memories). Two stills from the Greater Belize Media YouTube features are in place; **confirm the family and the presenter are happy for them to appear.** | `public/gallery/`, `gallery.ts` |
| 12 | ~~Facebook and Instagram links~~ — **done** (facebook.com/share/1PdoHB7dwv, instagram.com/cojacsumptuousrumpopo). Optional: swap the Facebook *share* link for the page’s permanent address (facebook.com/<page-name>) when known — it is a stronger signal for Google. | `site.ts → social` |
| 13 | Public phone number and email (optional) | `site.ts → contact` |
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
