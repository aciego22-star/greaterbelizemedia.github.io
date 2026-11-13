# Decisions needed before launch

The firm, or the agency and the firm together, need to settle these before the demo becomes a public site.

## Hosting and domain
1. **Where the private preview lives.** GitHub Pages cannot password-protect a page. If this branch is merged to `main`, the demo will be publicly reachable at `/demos/jose-m-alpuche/`. It is marked noindex but anyone with the link can open it. For a truly private preview, deploy the built folder to a host with access control (for example, Cloudflare Pages with Access, or Netlify password protection).
2. **Production domain.** It sets canonicals, Open Graph URLs and the sitemap (`--production --site-url=…`). Keep `/about/` and `/contact/`, and redirect `/services/` to `/practice-areas/` with a 301 once the existing URLs are confirmed.

## Facts to confirm with the firm
3. **Office details.** Suite and address, both phone lines, the inbox and the published hours (Monday to Friday, 8:00 a.m. to 5:00 p.m.). They appear in the header, footer, contact page and assistant, all from one source. The WhatsApp number (+501 625-3032) and Facebook page (facebook.com/alpuchelaw) were added on the agency’s information; confirm both with the firm.
4. **Bar Association wording.** The copy uses the dated “Elected President … in March 2026”. Confirm the current title before using an undated “President” label.
5. **Practice scope.** Confirm family law beyond divorce and adoption, cross-border work, registered-agent referrals (the firm’s own licensed-agent status is unconfirmed) and any narrower financial or regulatory services.
6. **Consultation workflow.** Who answers enquiries, consultation fees, conflict screening, and how documents are shared securely. The site makes no fee, response-time or booking promises.

## Rights and credits
7. **Firm images.** Confirm publication rights for José’s and Janine’s portraits and the JMA mark. The Knight & Day Photography credit stays visible on José’s portrait, including on the social card.
8. **Belize photographs.** Credits and licences are on each photo and under Website notice → Photo credits. The notice states that the photos are resized and cropped for layout. The share-alike terms apply to the courthouse and lighthouse photos.

## Enquiry flow, privacy and assistant
9. **Where Alpuche AI enquiries go.** Enquiries are collected in the chat (the contact-page form is gone) and delivered by email through a free Google Apps Script web app (`integrations/google-apps-script/`).
   - During the demo they should go to the agency's inbox, with `[Demo]` in the subject.
   - Before switching `LEAD_INBOX` to the firm, the firm must approve the recipient, who answers, how conflicts are checked before details are discussed, how long the emails are kept, and the wording of the visitor confirmation.
   - For the firm's own launch, deploy the script from the firm's Google account (Workspace allows about 1,500 recipients a day, against about 100 for personal Gmail).
10. **Privacy notice.** Write it against the actual data flow before going live (Belize Data Protection Act, 2021). Alpuche AI collects:
    - name;
    - email address and/or phone number;
    - matter type;
    - whether a date is coming up;
    - a short description.

    These are sent by email from Google's servers to the chosen inbox. Nothing is stored on the website, there are no analytics, and the chat transcript is not sent. Link the notice from the assistant's consent step.
11. **Assistant content.** The firm should approve, and own, the knowledge base (`ai/knowledge-base.md`) and the site copy the assistant searches. The guardrail wording also needs approval: no legal advice, emergencies, urgent dates, hidden personal details. All 24 handoff test cases pass with typed questions (`ai/test-coverage.md`); rerun `scripts/test-assistant.cjs` after any content change. WhatsApp:
    - The firm's WhatsApp number (+501 625-3032) is on the contact page, in the assistant's contact answers and as an enquiry reply option.
    - At the review step, visitors can also choose “Send on WhatsApp instead”. This free click-to-chat opens their own WhatsApp with the enquiry written out, and nothing is sent until they press send.
    - The firm should confirm who monitors that number. Automated WhatsApp messages from the firm's side would be charged per message by Meta and are not used.
12. **Structured data.** Add LegalService and Person schema only after the public details are confirmed. The preview omits them.

## Copy added during the build (for approval)
The 17 Markdown pages are rendered as written. The build added a small amount of interface copy that the firm should approve:
- Home practice section: “Each practice area has its own page with examples, Belize context and common questions. See all practice areas.”
- The side card on practice pages, guides and What to Expect: “Speak with the office · Share the general topic and any important date. Janine can explain how to arrange an initial consultation.”
- The closing band on practice pages: “Start with the general subject and any important date. Contacting the office does not mean the firm has accepted the matter.”
- The closing band on guides: “Discuss your plans with the office · This guide gives general information…”
- The website notice: a credit line for the portrait photographer, and the note on photo resizing and cropping.
- Contact page: preview form labels and hint, and the practice note (“Your enquiry is about: …”).
- Alpuche AI:
  - greeting;
  - legal-advice guardrail, enquiry notice and consent, and all intake questions;
  - review note, success, demo and error messages;
  - panel footer;
  - the visitor confirmation email (in `Code.gs`).
- Contact page: the “Prefer to send a message?” Alpuche AI section, which replaces the enquiry form.
- Website notice: the “Using the website assistant” section now describes how Alpuche AI handles enquiries.

Design changes made at the agency's direction (13 Nov 2026):
- **Phone layout.** On phones the home page shows Mr. Alpuche's portrait first, with the headline and consultation button below it. The original brief had the words and button first.
- **Brand icons.** WhatsApp and Facebook icons, in their brand colours, appear beside every WhatsApp and Facebook link.
- **WhatsApp number hidden.** The number is not shown anywhere on the site; the WhatsApp icon is the link (wa.me). In the footer, WhatsApp and Facebook appear as icons only.
- **No arrows.** Removed from all links, including the ↗ that marked outside links in article text.
- **Open card layouts.** The ruled grid lines are gone from the home page practice cards and the matching layouts: the practice areas and guides pages, the team page principles and the contact page notices.
- **No topic shortcuts.** Alpuche AI no longer shows topic buttons. Visitors type their questions; “Start an enquiry” remains.
- **Nameplate headers.** The firm's nameplate image is the background for the Practice Areas, Our Team, What to Expect and Contact headers. On desktop the words sit over its dark JMA side; on phones the nameplate sits above the words so the heading never covers the engraved lettering.
- **Clean finish.** No rules, dividers, borders or grid lines anywhere on the site; spacing and background tones separate content.
- **Alpuche AI.** The button now stays visible at all times, with a rounded launcher and a soft gold pulse every 10 seconds (off for visitors who prefer reduced motion).

**To confirm with the firm**
- The rights to the nameplate image.
- The nameplate reads “Notary Public”, but the site and Alpuche AI do not list notarial services. Alpuche AI currently tells visitors to call about any service that isn't listed. If José offers notarial services, add them to the practice copy and the knowledge base.

Also recheck the Ministry of Natural Resources links, which returned intermittent errors during research.
