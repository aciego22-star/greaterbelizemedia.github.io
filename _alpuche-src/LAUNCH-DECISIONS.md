# Decisions needed before launch

The firm, or the agency and the firm together, need to settle these before the demo becomes a public site.

## Hosting and domain
1. **Where the private preview lives.** GitHub Pages cannot password-protect a page. If this branch is merged to `main`, the demo will be publicly reachable at `/demos/jose-m-alpuche/`. It is marked noindex but anyone with the link can open it. For a truly private preview, deploy the built folder to a host with access control (for example, Cloudflare Pages with Access, or Netlify password protection).
2. **Production domain.** It sets canonicals, Open Graph URLs and the sitemap (`--production --site-url=…`). Keep `/about/` and `/contact/`, and redirect `/services/` to `/practice-areas/` with a 301 once the existing URLs are confirmed.

## Facts to confirm with the firm
3. **Office details.** Suite and address, both phone lines, the inbox and the published hours (Monday to Friday, 8:00 a.m. to 5:00 p.m.). They appear in the header, footer, contact page and assistant, all from one source.
4. **Bar Association wording.** The copy uses the dated “Elected President … in March 2026”. Confirm the current title before using an undated “President” label.
5. **Practice scope.** Confirm family law beyond divorce and adoption, cross-border work, registered-agent referrals (the firm’s own licensed-agent status is unconfirmed) and any narrower financial or regulatory services.
6. **Consultation workflow.** Who answers enquiries, consultation fees, conflict screening, and how documents are shared securely. The site makes no fee, response-time or booking promises.

## Rights and credits
7. **Firm images.** Confirm publication rights for José’s and Janine’s portraits and the JMA mark. The Knight & Day Photography credit stays visible on José’s portrait, including on the social card.
8. **Belize photographs.** Credits and licences are on each photo and under Website notice → Photo credits. The notice states that the photos are resized and cropped for layout. The share-alike terms apply to the courthouse and lighthouse photos.

## Enquiry flow, privacy and assistant
9. **Production enquiry form.** It is currently a non-submitting preview. Decide the recipient, retention period, conflicts handling and fields (name, reply channel, matter type, short non-confidential description). Do not add uploads, payments, booking or case access in the first release.
10. **Privacy notice.** Write it against the actual form, hosting, analytics and assistant data flows (Belize Data Protection Act, 2021). The demo has no analytics and no data collection.
11. **Live assistant.** Choose a provider, server-side credentials, logging and retention, and hand-off channels. Have the firm approve the knowledge base as its owner. Before enabling free text, add a knowledge-base entry for test case 13 (company name vs trademark) and run all 24 test cases (`ai/test-coverage.md`).
12. **Structured data.** Add LegalService and Person schema only after the public details are confirmed. The preview omits them.

## Copy added during the build (for approval)
The 17 Markdown pages are rendered as written. The build added a small amount of interface copy that the firm should approve:
- Home practice section: “Each practice area has its own page with examples, Belize context and common questions. See all practice areas.”
- The side card on practice pages, guides and What to Expect: “Speak with the office · Share the general topic and any important date. Janine can explain how to arrange an initial consultation.”
- The closing band on practice pages: “Start with the general subject and any important date. Contacting the office does not mean the firm has accepted the matter.”
- The closing band on guides: “Discuss your plans with the office · This guide gives general information…”
- The website notice: a credit line for the portrait photographer, and the note on photo resizing and cropping.
- Contact page: preview form labels and hint, and the practice note (“Your enquiry is about: …”).
- Assistant panel: the hand-off group label and footer disclaimer.

Also recheck the Ministry of Natural Resources links, which returned intermittent errors during research.
