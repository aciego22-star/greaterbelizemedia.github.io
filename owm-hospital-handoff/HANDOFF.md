# Orange Walk Multicare Hospital, Version 1 Proposal Website
## Handoff notes for Austere Automations

This folder documents the build in `owm-hospital/`. The site folder itself is
the complete deliverable: upload its contents to an Austere Automations
subdomain and it runs as-is. Nothing in it connects to, references, or modifies
owmhospital.bz, its DNS, or its email configuration. The intended production
domain is displayed as text only.

## Deployment instructions (Austere subdomain only)

1. Download the `owm-hospital/` folder.
2. Upload its contents (the files, not the parent folder) to the subdomain's
   web root, so `index.html` sits at the root of the subdomain.
3. No build step, database, server-side code, CDN, or external font is needed.
   Every script, style, icon, and image is bundled locally.
4. When the hospital video arrives, drop it in as `assets/video/hero.mp4`.
   The video slide detects it automatically; until then it shows a poster
   with a "video pending" note.
5. Do not point owmhospital.bz at the preview and do not touch its GoDaddy
   Coming Soon page, nameservers, or MX/SPF/DKIM/DMARC records.

Every page carries `noindex, nofollow, noarchive`, and `robots.txt` disallows
all crawling. There are no analytics, pixels, or trackers. All forms are
front-end demonstrations: they prevent default submission, transmit nothing,
store nothing, and say so on screen in both languages.

## File tree

```
owm-hospital/
  index.html                              Home: 4-slide hero, quick actions,
                                          9 quick-access cards, diagnostics,
                                          patient journey, insights preview, CTA
  about.html                              About, proposed mission and values
  services.html                           7 clinical categories + support cards
  patients.html                           Visit planning, NHI, FAQ, emergency notice
  gallery.html                            Filterable gallery with lightbox
  insights.html                           6 draft topic cards
  article-preparing-for-your-visit.html   Sample draft article
  appointment.html                        Demo appointment request form
  contact.html                            Contact details and styled map card
  owm-ai.html                             OWM AI concept, clearly proposed-only
  robots.txt                              Disallows all crawling
  assets/
    styles.css                            Full design system
    main.js                               Nav, carousel, video, gallery, forms
    i18n.js                               EN default, ES toggle, localStorage
    images/                               Optimized WebP derivatives
      logo-160.webp, logo-512.webp
      exterior.webp / -800, surgery.webp / -800
      ward.webp / -800, lab.webp / -800
      imaging.webp / -800 (anonymized), video-poster.webp
      originals/                          Untouched source JPEGs, plus the
                                          anonymized imaging master
    video/                                Empty; awaiting hero.mp4
```

## Image and video assets used

- Hospital exterior photograph (hero slide 1, about, contact, gallery, poster)
- Operating theatre photograph (services, gallery)
- Inpatient room photograph (about, patients, gallery)
- Laboratory photograph (about, services, gallery)
- Diagnostics workstation photograph (home diagnostics, services, gallery).
  The on-screen patient name, exam identifiers, and date rows on the
  ultrasound monitor were pixelated beyond recovery before use. The
  cleaned master is `assets/images/originals/imaging-anonymized.jpg`.
- Official crest logo, resized only, never redrawn or recolored, shown in a
  white circular container because the source file is not transparent.
- hero.mp4 was not delivered in this session; the video slide ships with a
  poster fallback and activates automatically once the file is added.
- The NHI and CT promotional flyers were used as information sources only.
  Their layouts were not reproduced, and the CT flyer (which contained a
  patient date of birth and exam data) was not shipped in any form. The CT
  hero scene uses a fully synthetic, HTML-built display labeled
  "Anonymized sample" with placeholder values.

## Language

English is the default on every fresh visit. The EN | ES control sits in the
desktop header and remains visible on mobile. The choice persists across pages
via localStorage. Spanish covers navigation, headings, body copy, buttons,
forms, placeholders, validation and confirmation messages, alt text,
accessibility labels, footer, cards, page titles, and meta descriptions.
`?lang=es` on any URL previews Spanish without storing a preference.

## Verification performed

- All internal links, anchors, and asset references resolve (script-checked).
- Screenshots captured at 1440, 834, and 390 px for all ten pages, plus hero
  slides 2-4, quick-access cards, diagnostics, gallery lightbox, submitted
  demo form, open mobile menu, and Spanish states.
- Language persistence across navigation verified in-browser.
- No horizontal overflow at 390 px on any page (script-measured).
- No console errors and no external network requests, verified in-browser;
  the only 404 is the intentionally absent hero.mp4.
- Demo forms verified to transmit nothing (all requests monitored).
- No em dash characters anywhere in the project.
- No lorem ipsum, no invented doctors, no 24-hour claims.
- Reduced motion: animations and autoplay stop under prefers-reduced-motion.
- Without JavaScript the page still renders slide 1, all content, identity,
  and contact information in English.

## Known limitations

- `assets/video/hero.mp4` is pending; slide 4 shows the poster and a note.
- The gallery holds five genuine photographs; a labeled placeholder tile
  marks where approved photos will be added.
- The CT hero scene is a stylized CSS reconstruction, not WebGL. This keeps
  the page fast on low-end phones and needs no 3D dependency; it can be
  upgraded later if desired.
- Playwright screenshots use the bundled Chromium; Safari and Firefox were
  not exercised in this environment, though only broadly supported CSS and
  JS features are used (overflow-x clip has a hidden fallback on body).

## Client confirmation list (must be resolved before production)

1. Hospital operating hours.
2. Emergency service availability and the exact emergency wording.
3. CT scan operating days and hours (flyer states 8:00 a.m. to 5:00 p.m.).
4. Whether 675-2328 is also the WhatsApp number; no WhatsApp link exists yet.
5. The process for sending CT images to patients or physicians.
6. NHI referral eligibility details and which services are covered.
7. Specialist names, disciplines, credentials, and schedules (none published).
8. Detailed service descriptions for each category.
9. Who receives appointment requests once the form goes live, and by what
   channel.
10. Final mission and values (current ones are labeled proposed).
11. Gallery captions and permission to publish each photograph, including
    any staff visible in the operating theatre photo.
12. Insights article topics, publication dates, and named authors.
13. Whether Ms. Rosita Jimenez should appear publicly (she currently does not).
14. Privacy policy and the patient-data handling process for live forms.
15. Final English and Spanish terminology preferences.
16. Whether the recent rebrand should be mentioned in public copy (it is not).
17. Approval of the OWM AI concept page framing.
18. Delivery of the hospital video file for hero slide 4.
