# Demo caveats

This is an **independent, speculative concept** by Austere Automations. Universal Hardware Company Ltd. has not commissioned, approved, reviewed or endorsed it. It must be shared privately, kept out of search engines, and never presented as the company's website or as live on `universalhardware.bz`.

## What the demo deliberately does not do

- **No transactions.** There is no cart, checkout, payment, order, quote request or booking.
- **No data transmission.** No form submits anywhere, and there is no email, webhook, SMS, CRM, Make scenario or staff notification. The Enquiry Summary is copy-only. The CSP blocks third-party connections.
- **No personal data.** Nothing asks for names or contact details. The notes field warns visitors not to enter personal details. Storage is `sessionStorage` only, and Guide chats are kept in memory only.
- **No analytics or tracking** of any kind.
- **No live AI.** The Product Guide is deterministic and rule-based, and labelled "Interactive concept · rule-based, not live AI". A Chatbase adapter exists but is disabled; it would need an Austere-owned approved test agent (see README).
- **No invented facts.** There are no prices, stock levels, "in stock"/"special offer" badges, SKUs, model availability, warranties, delivery, returns or financing terms, reviews, testimonials, counters, customer numbers, founding year, awards or staff.
- **No "open now".** Hours are shown as *listed*, never as live status.
- **Only the company's own images.** Product photos and brand logos come from universalhardware.bz and are labelled as such. They are used for every product image on the site (department tiles, finder, search cards and category pages). They show example products, not confirmed stock. The only non-photo product artwork is the 3D hero drill, modelled on the Makita 12V drill in the company's February 2026 promotion. It carries the Makita wordmark and is labelled as not confirmed stock.

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
| 3D hero drill | Modelled by eye on the Makita HP333D in the company's 2026 promotion, with the Makita wordmark. Confirm the model is still carried, and get approval for the Makita mark, before any launch. |
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
