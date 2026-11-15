# ConfiDent Oral Care

## Claude Code website build brief

Build a responsive, multi-page website for ConfiDent Oral Care at The Boardwalk Belize in Belize City. The site should introduce Dr. Brittni Haylock, DDS & Orthodontist, show the practice and its full advertised service menu, and give patients a straightforward way to request a visit. Build **confident AI** into the site as an AI Employee that can answer practice questions and schedule eligible appointments.

Use the included copy and supplied assets. The target is a client-ready preview with a functional booking demonstration. Implement and exercise the flow against a test calendar. The clinic calendar provider and booking policies are still to be confirmed.

| File | Use |
|---|---|
| [Website copy](content/website-copy.md) | Home, doctor profile, first visit, gallery, appointments, contact, and footer |
| [Treatment copy](content/treatments.md) | Services index and seven treatment pages covering all 22 advertised entries |
| [Dental blog](content/blog.md) | Blog index and three prepared articles |
| [Clinic data](content/clinic-data.json) | Contact details, social URLs, published hours, and service catalogue for the site and AI |
| [confident AI](ai/confident-ai.md) | Claude API instructions, calendar behaviour, patient messages, and test cases |
| [Source notes](SOURCE-NOTES.md) | Practice evidence, design reference, and editorial and integration references |

## Design direction

Use [Parchment Street Dental](https://parchmentstreet.co.uk/) as the visual template. Carry over the large photographic opening, editorial serif headlines, restrained navigation, spacious margins, and pauses between sections. Build ConfiDent's identity around its ivory walls, muted gold signage, and natural wood. Use warm white for page backgrounds, pale ivory for selected sections, near-black brown for readable text, and subdued gold for rules, icons, and small details. Keep text and controls high contrast.

Parchment Street's display headings declare **Glossy** with **Cormorant Garamond** as the serif fallback. A sampled body paragraph uses **Red Hat Display**. Set **Cormorant Garamond + Red Hat Display** as the working pair. Use Glossy for display headings if the correct font and a web licence for this project are available. Host the chosen licensed fonts with the build and use a compact font set. Keep paragraph text at 16–18 px, give headings room to breathe, and use a fluid scale between mobile and desktop.

Use the supplied ConfiDent logo in the header and footer. Keep the header on a light field, with a tactile appointment button and a clear mobile menu. Let the photography and type carry the page. Use a consistent treatment page layout with original copy, an obvious next step, and related links.

## Homepage and supplied media

Start with a wide hero inspired by Parchment Street. Use the clinic tour video when Bert provides it. For now, use the reception images as responsive hero artwork and retain them as the video poster and fallback. Keep the greeting, location, and primary CTA as real HTML. Position the text where it leaves the wall signage and reception desk visible. On mobile, place it in a short adjacent panel if overlaying it makes the photo or text harder to read. Keep **Request an appointment** visible near the top through the header and first-screen layout.

| Supplied asset | Placement | Dimensions |
|---|---|---|
| [confident-logo.jpg](assets/brand/confident-logo.jpg) | Header and footer brand lockup | 1284 × 703 |
| [reception-desktop.jpg](assets/photos/reception-desktop.jpg) | Desktop hero poster and reception gallery image | 1536 × 864 |
| [reception-mobile.jpg](assets/photos/reception-mobile.jpg) | Mobile hero poster and portrait crop of the reception image | 941 × 1672 |
| [opening-desktop.jpg](assets/photos/opening-desktop.jpg) | Wide practice introduction and opening-day gallery view | 1672 × 941 |
| [opening-mobile.jpg](assets/photos/opening-mobile.jpg) | Portrait version for the introduction and opening-day gallery view | 864 × 1536 |

Use each landscape and portrait pair as alternate crops for one subject. Preserve the opening-day sign, person, and clinic name when framing the photo. Crop through responsive layout and retain the supplied originals. Use the clinic name as the logo's accessible label and contextual alt text for the photos.

Make the hero video configurable so the provided clip can replace the poster without a layout change. Once supplied, use a compressed web video, autoplay muted and inline where supported, and provide a visible pause/play control. Keep the poster available for blocked playback, reduced-motion preferences, or a missing source. Keep the separate **Videos** section on the Gallery page. Use a poster and user-initiated playback for gallery clips, with captions or a transcript for spoken content. The existing image gallery and other pages can be completed while the footage is pending.

After the hero, show these sections in order.

1. **Meet Dr. Brittni Haylock** with the opening-day photo and link to the full practice introduction.
2. **Explore our services** with all seven categories, a short description for each, and clear links.
3. **Your first visit** with the patient-friendly steps and appointment CTA.
4. **Inside ConfiDent** with a gallery preview and a link to the Videos section.
5. **From the dental blog**, then address, appointment channels, and footer.

## Pages and navigation

| Page | Route | Content |
|---|---|---|
| Home | / | Hero video/poster and the sections above |
| About | /about | Dr. Haylock's name and designation, opening photography, and practice introduction |
| Services | /services | Seven categories and links to all advertised treatments |
| Treatment categories | /services/{category} | Seven detailed pages using the exact slugs and service anchors in the copy and clinic data |
| Your First Visit | /first-visit | Preparation, what patients can discuss, and how to arrange a visit |
| Gallery | /gallery | Responsive photography and a distinct Videos section at #videos |
| Dental Blog | /blog | Index and three article routes supplied with the copy |
| Contact Us | /contact | Phone, email, address, public hours, directions, Instagram, and Facebook |
| Appointments | /appointments | Start with confident AI, with a standard request path and the published phone/DM options |

Give the treatment menu an accessible index and link directly to individual treatments by section anchor. Make contact details available across the site. Put labelled **Instagram** and **Facebook** links on both **Contact Us and the global footer**. Use the exact URLs in the clinic data. The Instagram profile also serves as the posted DM route. Use the verified tap-to-call number and an address-based Directions link. Keep the public hours as written in the supplied post and keep bookable windows in scheduling configuration.

## Booking and build acceptance

- Deliver a complete mobile and desktop preview with the ConfiDent supplied photos, copy for all 22 services, gallery, video support, three blog articles, and both socials in both requested placements.
- Implement confident AI with the Anthropic Claude API and site-owned server-side calendar integration. The standard booking interface and assistant use the same availability and booking logic. A confirmed response must follow a successful write to the configured calendar.
- Use a persistent test calendar and test contact details for the walkthrough. Label the booking screen as a test during the preview. Show a saved test event and verify the right date and time in Belize. Configure live scheduling when the provider, approved visit types and durations, and the clinic's booking cutoffs are confirmed.
- Confirm the hero poster works before the video arrives. Test 390 px and 1440 px widths, the first-screen appointment CTA, typography, keyboard access to menus and gallery controls, reduced motion, phone and email links, and all treatment and article links.
- Set page-specific titles and descriptions, readable routes, and useful internal links. Keep the private presentation preview out of search indexing and set the production canonical domain once supplied.
- Deliver the project with a run/deploy README, configuration examples without credentials, and a short walkthrough showing the test calendar event, an unavailable slot, and a staff-review request. Keep the clinic data editable so hours, contact details, and policies can be updated once for both the website and the AI.
