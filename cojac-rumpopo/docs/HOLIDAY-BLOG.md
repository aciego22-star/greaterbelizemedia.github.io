# Holiday Blog: implementation, owner guide and QA

Built from the Holiday Blog CC package (Nov 2026). Everything lives inside the existing site: same header, footer, styles, WhatsApp ordering and build. No second website was created.

## What was built

| Item | Where |
|---|---|
| Blog index | `/holiday-blog` (`src/pages/BlogIndex.tsx`). Shows the featured latest story, a “More stories” grid once more posts exist, and the six planned topics, each saying “Stories coming soon” until it has a post. No pagination, no fake posts. |
| First article | `/holiday-blog/rumpopo-season-2026-secret-flavour` (`src/pages/BlogPost.tsx`). Semantic `<article>`, one H1, nine H2s, breadcrumb (Home › Holiday Blog › post), category chips, author “Cojac’s Sumptuous Rumpopo”, real publish date (7 November 2026), computed reading time, pull quote for the official hint, competition panel, order buttons, share links. |
| Navigation | “Holiday Blog” in the desktop header (between Discover and FAQs), in the mobile menu (after Videos & Features), in the footer under Explore, and a “From the Holiday Blog” card on the homepage above the FAQs. |
| Artwork | The two supplied files are used separately. The **mobile 4:5** artwork shows at 767px and narrower; the **desktop 16:9** artwork shows above that. Both keep their natural ratio (no `object-fit: cover`, nothing cropped), with WebP first and the supplied JPGs as fallback. The main image loads immediately (it is the largest element on the page); below-the-fold images load lazily. Intrinsic sizes prevent layout shift. The artwork appears once per page. |
| SEO | Pre-rendered HTML for both pages; page titles and descriptions from the brief; canonical URLs from `site.ts → siteUrl`; Open Graph `article` tags with the 1920×1080 artwork (`og:image:width/height`), `article:published_time`, sections and tags; Twitter large card; JSON-LD `BlogPosting` (headline, description, both images, `datePublished`, `dateModified`, publisher/author = the Cojac’s organization, section, keywords, word count), `BreadcrumbList`, and a `Blog` entity on the index. Both pages are in `sitemap.xml` (the post with its image) and `llms.txt`. No ratings, offers, prizes or event schema. |

## Accuracy safeguards (as required by the brief)

- **The secret flavour is not named or hinted at** beyond the exact official clue: “One of the main ingredients in our newest rumpopo flavour is popular in Belizean cooking.”
- **Entries are directed to the official Facebook competition post only.** The website has no entry form, no comment box, no counter and no countdown.
- **No contest permalink was supplied**, so there is no “enter here” button. The panel shows **“Visit Cojac’s Official Facebook Page”** (the verified page link you supplied) with “Look for the ‘Guess our newest rumpopo flavour’ post and leave your guess in its comments.” No placeholder link is shipped.
- **No end date, eligibility rules or extra prizes** were added. The article itself states no end date. The site-wide banner (until January 3rd 2027) is unchanged, as the brief asked.
- **Ordering stays WhatsApp only.** “Explore Our Flavours” opens `/flavours`, and “Order Through WhatsApp” opens the existing `/order` page (cart → WhatsApp to +501 621-8372). The cart flow is not bypassed. There are no payments.
- **House style kept:** the supplied copy’s long dashes were replaced with colons, commas or full stops (e.g. the title now reads “Rumpopo Season Is Back in Belize: Can You Guess Cojac’s New Flavour?”). There are no eyebrow labels, and “half litre” is written “half liter” to match the menu and the flyer.
- Small copy edits for accuracy against the live site: “including our 2026 flavour lineup” became “including the new flavour reveal” (the lineup is already on the site), and “our website will let you explore…” became “On our website you can explore…” (the feature now exists).

## Owner settings

| To change | File | Field |
|---|---|---|
| Contest link (when you have it) | `src/content/blog/contest.ts` | `facebookContestPostUrl: 'https://www.facebook.com/…'`. The button then becomes “See the official mystery flavour competition on Facebook”. |
| Contest state | same | `status: 'active' \| 'closed' \| 'revealed'`. `closed` stops inviting guesses; `revealed` shows `revealText` and a link to `revealUrl`. The article stays online as a 2026 archive. |
| Article text, date, categories | `src/content/blog/posts.ts` | Each post object. The body is simple Markdown (see the notes at the top of the file). Set `updatedAt` when you edit a published post. |
| New post | same | Copy the post object, give it a new `slug` and a real `publishedAt`, and add images to `public/blog/`. The index, homepage card, sitemap, `llms.txt` and social previews update automatically. |
| Topics | same | `blogCategories` |

## QA results (7 November 2026)

| Check | Result |
|---|---|
| Type check (`tsc -b`) and production build | Pass. 12 pre-rendered pages + 404 |
| Unit tests (`npm test`) | **25 / 25** (18 order/season + 7 blog: slug, dates, categories, no dashes, official hint, reading time, no placeholder contest link) |
| Blog end-to-end (`scripts/qa-blog.mjs`) at 1280, 1920, iPhone 13 (390) and 360 wide | **129 / 129**: see `docs/qa-blog.log`. Covers navigation (desktop header and mobile menu), footer link, index card and topics, one H1, H2s, breadcrumb, author/date/reading time, pull quote, correct artwork per screen at its natural ratio, not cropped, not lazy for the main image, shown once, the competition panel linking only to the verified Facebook page, no forms, no placeholders, no dashes, no countdown, internal links (Our Story, Guarantee, Videos & Features, Flavours, Order), share links with the canonical URL, “Order Through WhatsApp” opening the cart page, no overflow, no errors, and the 404 for an unknown post. |
| Artwork at 360 / 390 / 430 / 1280 / 1920 | Mobile 4:5 file on phones; desktop 16:9 file on desktop; no overflow at any width |
| Layout shift (CLS) | Index 0.000 (desktop and mobile); article 0.009 desktop, 0.000 mobile |
| Ordering regression (`scripts/qa-order-flow.mjs`) | **128 / 128** |
| Accessibility (axe WCAG 2 A/AA, 12 pages × desktop and mobile) | 0 violations |
| Page sweep (12 pages × 4 viewports) | 48 / 48 with no console errors and no horizontal overflow |
| Built site scan | 0 long dashes, 0 eyebrow labels, 0 `TO_BE_SUPPLIED` |

Screenshots of every page at desktop (1440), tablet (834), mobile (390) and small mobile (360), including `*-holiday-blog.jpg` and `*-holiday-blog-rumpopo-season-2026-secret-flavour.jpg`, are in `docs/screenshots/`.

## Still needed from the owners

1. **The exact link to the Facebook competition post** (`contest.ts → facebookContestPostUrl`).
2. **Confirmation the flavour is still secret and guesses are still open** at publish time (otherwise set `status`).
3. **Contest eligibility and age wording**, if the owners want any shown (none was supplied, so none is invented). The site’s 18+ notice and responsible drinking line remain.
4. **The final public domain** (`site.ts → siteUrl`); canonical URLs and social previews follow it automatically.
5. Whether the Facebook *share* link can be replaced by the page’s permanent address (`facebook.com/<page-name>`).
