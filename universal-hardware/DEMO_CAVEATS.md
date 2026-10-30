# Demo caveats

This is an **independent, speculative concept** by Austere Automations. Universal Hardware Company Ltd. has not commissioned, approved, reviewed or endorsed it. It must be shared privately, kept out of search engines, and never presented as the company's website or as live on `universalhardware.bz`.

## What the demo deliberately does not do

- **No real transactions.** The Shop has a working cart and checkout, but card payment runs in demo mode. The card form is a stand-in with nothing to type, the processor's answer is simulated, nothing is charged and no order reaches anyone. Order references start with `DEMO-`. There is no quote request or booking. See [`PAYMENTS.md`](PAYMENTS.md).
- **No data transmission.** No form submits anywhere, and there is no email, webhook, SMS, CRM, Make scenario or staff notification. The Enquiry Summary is copy-only. The CSP blocks third-party connections.
- **No personal data kept.** Only the checkout asks for a name, phone and email, to show the flow. They stay in the page's memory: they are never stored, logged or sent, and are discarded when the visitor leaves the page. A "Fill in sample details" button supplies placeholder values. The Enquiry Summary's notes field warns visitors not to enter personal details. The cart, Enquiry Summary, branch and motion setting use `sessionStorage`. Where a browser blocks it (for example in a sandboxed preview frame), the cart falls back to the tab's `window.name`, which is also tab-scoped. Guide chats are kept in memory only.
- **No analytics or tracking** of any kind.
- **No live AI.** The Product Guide is deterministic and rule-based, and labelled "Interactive concept · rule-based, not live AI". A Chatbase adapter exists but is disabled; it would need an Austere-owned approved test agent (see README).
- **Prices only as printed.** The Shop's 32 items, models, descriptions, colours and prices are copied from single-product graphics of the company's Friends & Family Sale (Spanish Lookout, 19–21 February 2026). That sale has ended, so every price is labelled as a February 2026 sale price, not a current price. No other prices appear.
- **No invented facts.** There are no invented prices, stock levels, "in stock"/"special offer" badges, SKUs, model availability, warranties, delivery, returns or financing terms, reviews, testimonials, counters, customer numbers, founding year, awards or staff.
- **No "open now".** Hours are shown as *listed*, never as live status.
- **Homepage slideshow images are concept images.** The three slides (a storefront with a Lifan motorcycle, a store floor, a paint aisle) were supplied for this presentation. They are not photographs of a Universal Hardware branch, and the people in them are not staff or customers. Each is labelled "Concept image · not a photograph", and the alt text says so too.
- **Otherwise only the company's own images.** Product photos and brand logos come from universalhardware.bz and are labelled as such. They are used for every product image on the site (department tiles, finder, search cards and category pages). They show example products, not confirmed stock. The 3D hero drill is built from the same kind of image: the Makita 12V drill photo in the company's February 2026 promotion, given 3D depth. It is labelled as not confirmed stock.

## Statements that need Universal Hardware's confirmation before any launch

| Item | Status in demo |
|---|---|
| Branch addresses, hours, phone, Smart and WhatsApp numbers | Shown exactly as on the Contact Us page with "confirm before visiting" notices. The page may be out of date. |
| Holiday closures | Summarised as "closed on Belize public and bank holidays" per the website; no list |
| Which inbox or number handles what (sales vs service, `sales@` vs `salesbz@`) | Only `sales@universalhardware.bz` (Contact Us) is shown, as "listed on the website" |
| Brand relationships | Shown as "named on page X". Nothing claims current distribution. |
| Lincoln Electric exclusivity | **Omitted** pending confirmation (the website claims it) |
| Hisun UTV/ATV line | Mentioned as "Hisun page" only; found during the build and not in the original source brief |
| Meilun / Lifan model range | Riding styles only; no models or prices (website pages appear historical) |
| True Value cooperative membership | Quoted as a statement on the Brands page |
| Service scope per brand, parts ordering process | Phrased generically ("confirm coverage with the branch") |
| Category structure and department groupings | Proposed navigation; needs management sign-off |
| Concept copy and headline ("Built for Every Job.") | Proposed, not a company slogan |
| Wordmark use and a high-resolution logo | The supplied raster is modest resolution; request the master file |
| Spanish-language content | Product Guide only, labelled as not implying formal bilingual service |
| Homepage slideshow | Concept images, not photographs: the storefront, interior and aisle do not depict a real branch, and the interior shows True Value signage (the Brands page says Universal Hardware is a True Value cooperative member). Before any launch, replace them with photography of the branches, or get Universal Hardware's sign-off on using renders, including the wordmark on the building. |
| Shop catalogue and prices | 32 items from the Friends & Family Sale graphics (19–21 February 2026, Spanish Lookout). Model, description, colours and price copied as printed; "$" is read as Belize dollars. These are past sale prices, not a current list, and the graphics do not say whether GST is included. The ML125-5 and ML125-7 graphics carry the Lifan logo, while the model code and tank badge say Meilun; they are listed as Meilun with a note. |
| Online card payments | Not live. They need Universal Hardware's own merchant account and processor, current prices and stock, and published refund, returns, collection or delivery, privacy and terms pages. See [`PAYMENTS.md`](PAYMENTS.md). The site must not be put to a processor or bank as the company's own before it approves it. |
| Branch collection | Proposed checkout option at either branch. Delivery is shown as not offered. The pickup process, and any delivery areas and charges, are the company's decision. |
| 3D hero drill kit | Built from the company's photo of the Makita HP333D kit (drill, battery and charger; 2026 promotion); depth is estimated from the photo's outline and the far side mirrors the near side. Confirm the model is still carried, and get approval for the photo and the Makita mark, before any launch. |
| Product photography and brand logos | Images from the current website: product photos cropped from the 2026 News / Promotions graphics (370–638 px, prices and sale text left out), 489 px Meilun & Lifan product shots, 200 px Product Listing photos (galleries only) and ~150 px logos. Some photographed brands (Hoteche, Knova) are not on the Brands page. The promotions have ended, so the photos show past examples, not current stock or offers. Approval to use them, ideally with original high-resolution files, is needed before launch. |

## Technical caveats

- **Real-device testing not done.** All testing ran in headless Chromium with software WebGL (SwiftShader). iPhone Safari, Android Chrome and tablet hardware should be checked by hand before sending (see QA report).
- **3D start-up cost** was measured only under software rendering, where it is slow; real GPUs should be considerably faster but are unverified.
- **Canonical / Open Graph URLs** point to a placeholder Netlify subdomain until `site` in `astro.config.mjs` is updated.
- **Public repository.** The source currently sits in a public GitHub repository (Pages disabled). Consider a private repository before wider circulation.
- **Lighthouse SEO** reports 69 by design: the `noindex` directive fails the "is crawlable" audit.

## Sharing guidance

- Share only a private Netlify link, optionally password-protected, directly with the decision-maker.
- Keep the "Concept Preview" badge, footer disclaimer and `/concept/` page intact.
- Don't post the link publicly, and don't index or advertise it.
