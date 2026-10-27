NATFISH WEBSITE: TWO TARGETED HERO IMAGE UPDATES
FINAL REVISED CLAUDE CODE INSTRUCTIONS | OCTOBER 27, 2026

TARGET A: SEAFOOD & SERVICES
Page: https://natfish.bz/seafood-services
Image: The COLLAGE with the Belizean Pride lobster and conch product display, with the slogan "From Our Fishermen to Your Table". It does not contain the large NATFISH logo.

Files in 01_SEAFOOD_SERVICES_HERO/
- seafood-services-desktop-1920x1080.webp (16:9)
- seafood-services-mobile-1080x1350.webp (4:5)
- seafood-services-mobile-tall-1080x1920.webp (9:16 optional)

Replace/update ONLY the hero image slot on the Seafood & Services page with this collage. Do NOT place the collage on the homepage, the What's New page, product cards, articles, other hero sections or the site's shared/global hero. Do not add it as an extra homepage carousel slide.

TARGET B: WHAT'S NEW AT NATFISH
Page: https://natfish.bz/news
Image: The single orange Belizean Pride QUEEN CONCH Frozen Raw Meat product box against a soft seaside background. The original desktop and mobile compositions were supplied by Bert.

Files in 02_WHATS_NEW_HERO/
- whats-new-conch-desktop-1920x1080.webp (16:9)
- whats-new-conch-mobile-1080x1350.webp (4:5 crop retaining all box/product details)
- whats-new-conch-mobile-tall-1080x1920.webp (9:16 original portrait composition)

Replace/update ONLY the top page hero image slot of What's New at NATFISH with this single conch box image. Do NOT add the collage to this hero. Do NOT replace images inside the news cards, existing event articles, gallery, product catalogue, homepage or other pages.

IMPLEMENTATION AND SAFEGUARDS
1. Locate each specific page hero/component in the actual source. Modify ONLY those two image references and the minimal responsive image logic needed for correct rendering. Neither asset belongs in any other slot.
2. Use <picture> / <source media="(max-width: ...)" /> or the existing responsive hero implementation; match the website's current breakpoint conventions. Prefer 4:5 for standard mobile hero and the tall option only if the existing layout is actually tall. Desktop uses 16:9.
3. Preserve the complete product box, printed product wording, slogan (for collage), and all key seafood subjects. Avoid object-fit: cover when it clips content. Use contain, a suitable background, or adjust the image's container aspect ratio. Do not stretch or distort.
4. Do not alter titles, copy, links, translations, page routing, headings, metadata, schema, colors, existing graphics, NATFISH AI, ordering, WhatsApp, forms, footer, menu or other page content. Do not add logos, text overlays or new marketing claims to these images.
5. Keep optimized WebP image files with descriptive alt text: A) "Belizean Pride lobster and conch seafood products by NATFISH, from our fishermen to your table." B) "Belizean Pride queen conch frozen raw meat product box." Set dimensions to avoid layout shift. Maintain suitable lazy/eager loading for hero/LCP.
6. Test both URLs on desktop, iPhone-size mobile (390px and 430px), and tablet. Confirm source swapping works, the complete packaging is legible, and there are no broken images or extra whitespace issues.
7. For deployment, build the complete updated website in its existing format and supply Bert with the usual ready-to-upload ZIP for Netlify. Do NOT deploy or alter hosting/DNS without permission.

IMPORTANT: ONLY TWO HERO IMAGE UPDATES, ONE PER PAGE. All other image placements stay exactly as they are.
