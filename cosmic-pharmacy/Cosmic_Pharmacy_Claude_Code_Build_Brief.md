# Cosmic Pharmacy Website + Searchable Catalogue

Claude Code master build brief (as supplied by the client, 2026-08-26 — archived
in-repo for reference; see the conversation record for authoritative wording).

Build a polished, responsive, multi-page concept website for Cosmic Pharmacy,
Belize City. The site separates Cosmic's services and major retail departments
into clear pages; the defining functional feature is a searchable product
catalogue that lets a customer browse products, build a multi-item request
basket, and send the complete request to Cosmic Pharmacy through WhatsApp for
pharmacist review, price confirmation, availability confirmation, and
fulfilment. Not a generic pharmacy template and not a conventional payment
checkout. Use the ICB hero pattern, the cleanliness and premium composition of
Duke Marine, and Cosmic Pharmacy's established celestial identity.

## 1. Working method

1. Inspect the existing repository before changing anything.
2. Preserve current framework/tooling/deployment unless a change is necessary.
3. Do not reinitialize the repository or replace working config unnecessarily.
4. Build reusable components; keep business details, catalogue data, categories,
   contact details and operating hours in editable data/config files.
5. First version fully functional with local structured catalogue data — no
   backend, payment processor, user accounts or external database.
6. Architecture must allow replacing local product data with a managed DB/CMS
   without redesigning the interface.
7. Run build/test/lint, resolve errors, check desktop and mobile layouts.

No established system existed → clean React/Vite implementation with
maintainable CSS. No heavy UI library.

## 2. Business identity (verified working information)

- Name: Cosmic Pharmacy · Tagline: Medicine · Health · Beauty
- Promise: "We take care of you."
- Proprietor/pharmacist: Ms. Carter (no first name unless client-confirmed)
- Phone/WhatsApp: +501 611-8080 · deep-link number 5016118080
- Email: cosmicpharmacybz@gmail.com
- Address: #41 Corner Holy Emmanuel Street/CET Site, Belize City, Belize
- Instagram: @cosmicpharmacybz · Facebook: Cosmic Pharmacy, Belize City
- Service reach: Belize City, out-district, main islands
- Range claim "more than 100 vitamin supplements" = client copy to verify.
- Hours (from coming-soon page; VERIFY WITH CLIENT BEFORE PUBLICATION):
  Mon–Sat 9:00 a.m.–7:30 p.m. · Sun 9:00 a.m.–1:00 p.m. Keep in one editable
  config object.

## 3. Strategic positioning

Differentiators: knowledgeable pharmacist guidance; asking the right questions
before recommending/dispensing; sourcing hard-to-find products; friendly,
efficient, fairly priced service beyond the neighbourhood. Message: "Search
conveniently online, then let a real pharmacist confirm what is appropriate and
available."

Hero copy: **Everything you need. Guidance you can trust.** — "Search medicine,
wellness and personal-care products, build your request, and send it directly
to Cosmic Pharmacy on WhatsApp." CTAs: Search Products · Send a Prescription.
Support line: Pharmacist-guided service · WhatsApp ordering · Out-district and
island shipping. Never claim the website diagnoses, prescribes, guarantees
stock/delivery times, or completes a medication sale without review.

## 4. Visual direction

Build from Cosmic's established celestial identity (logo, star field,
blue-magenta glow, orbital motifs) with an ORIGINAL layout/motion treatment (not
the coming-soon composition). Duke Marine = cleanliness/composition reference;
ICB = hero interaction reference (ordered stills + video in one hero system).
Avoid the generic green pharmacy template, childish galaxy themes, excessive
neon, constant animation, floating pills.

Palette: midnight navy/near-black (hero/footer), cosmic blue (primary actions),
magenta/pink (selective accents, sale tags, orbit details), soft
lavender/pale blue (support surfaces), white/very light cool grey content
sections. Animated cosmic field: layered midnight gradients, slow nebula
movement, subtle stars, occasional orbital lines; lightweight (CSS/canvas), GPU
transforms, pointer-events: none, static reduced-motion fallback. Clean panels
"floating in the Cosmic universe". Product cards: object-fit: contain on a
clean neutral background — packaging never cropped, never AI-invented.
Typography: distinct modern sans-serif pairing, not fonts used on other Austere
client sites.

Hero: responsive carousel — ~3 stills + 1 video slide, all config-driven.
Conceptual sequence: (1) brand/storefront or pharmacist-led service, (2) range,
(3) search/basket/WhatsApp/countrywide service, (4) short Cosmic video. Video is
a first-class hero slide. Caption "COSMIC PHARMACY IN 90 SECONDS" (replace 90
with verified duration). Attempt audible autoplay (playsInline) and detect
failure from the play() promise; on block show poster + "Cosmic Pharmacy in
[duration] — Play with Sound" overlay; one tap starts inline with sound; never
silently downgrade to muted autoplay. Accessible pause/play + mute/unmute after
start. No auto-loop of the final narrated video. Separate desktop/mobile
encodes. Reduced motion → poster + play action. Rotation pauses on
hover/focus/interaction/video playback. Universal search + primary CTAs remain
visible within or directly beneath the hero.

## 5. Information architecture

Routes: Home · Services · Supplements · Health Products · Personal Care &
Beauty · Women's Wellness & PMOS · Medical Devices & Daily Living ·
Prescription & Refill Request · Shop All (searchable database) · Product
Detail · Blog · Article · Gallery (Cosmic in Motion) · About · Contact ·
Basket drawer/page. Primary nav: Home, Services, Products (dropdown/accordion →
five retail pages), Shop All, Blog, Gallery, About, Contact; persistent basket
badge + search access.

Home sequence: utility/contact bar → sticky nav → hero media sequence →
universal search → pathway cards → featured/sale products → pharmacist-guidance
section (Ms. Carter) → PMOS feature → how-it-works → blog previews → gallery
preview → out-district/island shipping message → approved-testimonials
placeholder → location/hours/map/contact → footer with legal/safety notices.

Gallery: Duke-clean editorial masonry of client-owned photos/videos; filters
All, Inside Cosmic, Products & Wellness, Community, Social Highlights, Videos;
lightbox for photos, inline playback for videos; no social-platform UI chrome.

## 6. Catalogue categories (data-driven)

Over-the-Counter Medicine · Vitamins & Supplements · Women's Wellness & PMOS ·
Diabetes & Health Monitoring · First Aid & Medical Supplies · Personal Care &
Hygiene · Skin, Hair & Beauty · Mother & Baby · Eye & Ear Care · Mobility &
Daily Living · Prescription & Refills (→ pharmacist-review pathway, never
self-service) · Sale & Featured Products.

## 7. Product-data architecture

Typed model (ProductType, StockStatus, Product interface with id/slug/name/
brand/category/subcategory/productType/shortDescription/size/dosageForm/
priceBzd/compareAtPriceBzd/priceStatus/stockStatus/prescriptionRequired/
pharmacistGuidanceRequired/keywords/image/imageAlt/featured/sale/newArrival/
lastVerified/sortOrder). Seed data in src/data/products.json. Also: CSV
template, import/validation script (missing IDs, duplicate slugs, invalid
prices/types, absent image paths), catalogue-maintenance README. No admin
panel; no implied live inventory sync.

## 8. Seed catalogue

~24–36 accurate demo products from Cosmic's public content (scar cream,
HealthA2Z Sinus Headache PE, YumVs beet-root gummies, Animalín chewables,
Puritan's Pride Ultra Man 50+, Nature's Bounty Flaxseed Oil, Centrum Women,
Hioscina solution [conservative classification], five Cosmic PMOS kits, pH-D
boric acid suppositories, Kotex liners, liquid chlorophyll, Vaseline Lip
Therapy, charcoal mask, spray bottle, Carmex, hair brush, thermal patches,
castor oil, pill organizer, contact-lens cases, TRUEdraw lancing device, Renu
solution, Avent breast pads, ear plugs, thermometer, eye patch, insoles, pill
cutter, EasyTouch strips + HealthPro system, SureLife wrist and upper-arm BP
monitors). Sale prices are recent references to verify. Never infer
ingredients/doses/pack sizes/indications/prices from unclear photos — use
"Confirm details with pharmacist".

## 9. Search and discovery

Placeholder "Search products, brands or categories…". Search across name,
brand, category, subcategory, keywords; normalized case-insensitive
partial/fuzzy matching; name/brand weighted above category/keywords; debounced
live results with count; no PHI in stored searches. Shop All supports three
equal modes — Search, Categories, A–Z (letter index, mobile-friendly, empty
states) — via accessible tabs; state preserved on detail→back; category cards
elsewhere deep-link with filter pre-applied; single shared product-card/detail
system. Filters: category, brand, product type, sale, availability, price range
(verified prices); sort: Featured, Name A–Z, Price low–high/high–low, New.
Safety: search never diagnoses or recommends by symptom; medical-sounding
queries surface the pharmacist-guidance card ("Not sure what you need? Send
your question to Cosmic Pharmacy and let a pharmacist guide you.").

## 10. Product cards & detail

Cards: accurate image, brand, name, size (verified), BZD price/Confirm price,
availability, category/type label, sale/new badge, View Details, Add to Basket,
or Ask the Pharmacist / Send Prescription when review is required. Detail adds:
larger uncropped image, approved short description, verified pack/dosage form,
review status, quantity control, related items, WhatsApp question shortcut, and
"Availability, final price and fulfilment are confirmed by Cosmic Pharmacy."
No consumer ratings on medication products.

## 11. Basket-to-WhatsApp flow

SEARCH → VIEW → ADD TO BASKET → SEND TO WHATSAPP. Persistent badge; drawer
(desktop)/full sheet (mobile); thumbnails, quantities, unit prices when
verified, line totals; increase/decrease/remove/clear; localStorage
persistence; Confirm-price items excluded from the numeric subtotal (labeled an
estimate); fulfilment options (pickup, Belize City delivery, out-district
shipping, main-island shipping) + notes. CTA: SEND REQUEST TO COSMIC VIA
WHATSAPP → `https://wa.me/5016118080?text=${encodeURIComponent(message)}` with
the structured message (numbered lines, estimated subtotal for priced items,
fulfilment preference, notes, confirmation request). Pre-send notice: sending
creates a product request, not a completed purchase. The site never collects or
stores customer medical information.

## 12. Prescription & refill pathway

Separate, prominent pathway. Explain pharmacist review + valid prescription;
continue to WhatsApp with only the neutral message: "Hello Cosmic Pharmacy. I
would like assistance with a prescription or refill request. Please let me know
what information you require." No uploader; no prescriptions/diagnoses/history
in storage, analytics, logs, forms or catalogue.

## 13. Cosmic Wellness / PMOS

Distinctive section; kits browsable by named goal (no diagnostic quiz); "Ask
Ms. Carter Which Kit to Discuss" WhatsApp CTA; no disease-treatment claims or
guaranteed outcomes; disclaimer encouraging medical consultation for symptoms,
fertility concerns, chronic conditions, pregnancy, interactions.

## 14. Responsive behaviour

Mobile-primary. Functional mobile nav; hero copy/search visible without
excessive scrolling; intentional mobile hero compositions; inline (not forced
fullscreen) mobile video; 44px+ search/touch targets; accessible mobile filter
drawer; no horizontal overflow; no tiny quantity controls; no image cropping;
working WhatsApp handoff on iPhone/Android; comfortable Search/Categories/A–Z
on touch; reduced motion freezes cosmic field, stops rotation, shows video
poster. Desktop: filter rail/compact bar + responsive grid; no overstretched
cards.

## 15. Accessibility, performance, SEO

Semantic structure/landmarks; keyboard-accessible everything; visible focus;
verified alt text; contrast; lazy-loading; optimized images, no layout shift;
lightweight cosmic animation; compressed hero video + poster; accessible hero
controls with current-slide indication, no per-auto-slide SR announcements;
unique titles/descriptions; LocalBusiness/Pharmacy structured data from
verified details; product structured data only with verified price/availability;
Open Graph. Footer notice: "Product information is provided for general
reference. Availability, pricing, prescription status and suitability are
confirmed by Cosmic Pharmacy. Consult a qualified healthcare professional when
medical advice is required."

## 16. Analytics & privacy

No sensitive text in analytics; no ad pixels; only privacy-conscious events if
analytics exists; no customer-identifiable data retained.

## 17. Content & asset rules

Client will supply logo, pharmacy photos, authorized social imagery, and video
clips for the 90-second hero feature. Prioritize authentic Cosmic media;
production publication needs Ms. Carter's approval and consent for identifiable
people; prefer original files; no social-post screenshots as finished imagery;
no platform UI chrome; record source URLs in the asset manifest;
platform-licensed music is not cleared for the website. On arrival: audit, map
to sections, preserve real packaging, cleanup-only edits, stable filenames,
truthful alt text, manifest, optimized desktop/mobile video + poster. No
third-party/manufacturer photography without clear rights.

## 18. Demo-state rules

Concept build to demonstrate capability. Mark records demo/verification-
required; do not publish on Cosmic's official domain without written
authorization; do not imply stock; do not build full production inventory
pre-approval; ~24–36 seed products suffice.

## 19. Acceptance tests

Twenty-nine checks covering: search by partial name/brand/category/keyword;
filter combination + clearing; no-results state with reset + pharmacist
contact; add-to-basket from cards and detail; quantity → count/subtotal
updates; localStorage survival; unpriced items don't corrupt subtotals;
prescription items never self-service; WhatsApp message completeness +
5016118080 + URL-encoding; neutral prescription CTA; 360px + desktop
functionality; uncropped images; keyboard/focus usability; reduced motion;
three modes sharing one dataset; A–Z letters + empty states; category
deep-links; all routes direct + refresh; audible autoplay when allowed; blocked
autoplay → correct overlay → one-tap sound playback; caption shows verified
duration; accessible video controls; rotation pauses during interaction/video;
smooth non-obstructive cosmic motion + reduced-motion static state; blog from
editable data; gallery filters/lightbox/inline video; approved assets only;
build/lint/tests pass.

## 20. Final delivery

Report: summary of what was built; exact files created/changed; catalogue-data
location + how to add a product; WhatsApp implementation location; items
needing Ms. Carter's verification; build/test results; production-phase
recommendations separated from the completed concept. Build first, verify, then
report.
