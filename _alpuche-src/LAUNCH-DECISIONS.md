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

## Articles (blog)
- **Starter articles.** The three articles (16, 17 and 20 June 2022) are Mr. Alpuche's own Facebook posts. The wording is his, lightly edited for the web, with subheadings, a byline, the original date and a general-information note added. Please ask him to confirm each one is still accurate before launch, especially the probate time frame (four to twelve months) and the land title statement.
- **More posts.** The fourth post in the agency's screenshot (on naming a guardian for your children in your will) was cut off, so it has not been added. Send the full text of this and any other posts to add; each one becomes a Markdown file (see the README).
- **Wording to review.** “Buying real estate in Belize is a great investment” is his original line. The search description softens it to “can be a great investment”.
- **Home page.** A “From the office” section shows the three newest articles above the closing band. The menu now has six items, so between 1051 px and 1120 px wide the header uses the Menu button.

## Copy added during the build (for approval)
The 18 Markdown pages and the articles are rendered as written. The build added a small amount of interface copy that the firm should approve:
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
- **No resting underlines.** Card links, “Read more” style links, the guide list and the contact links on the home page are no longer underlined until you point at them; pointing at a practice or article card underlines its label, heading and link together. Links inside article text stay underlined so readers can spot them.
- **No arrows.** Removed from all links, including the ↗ that marked outside links in article text.
- **Open card layouts.** The ruled grid lines are gone from the home page practice cards and the matching layouts: the practice areas and guides pages, the team page principles and the contact page notices.
- **No topic shortcuts.** Alpuche AI no longer shows topic buttons. Visitors type their questions; “Start an enquiry” remains.
- **Header images.** The firm's nameplate heads Practice Areas and Our Team, and the office sign photograph heads What to Expect and Contact. Words never sit on an image: on desktop and tablet the words are on the left and the image on the right, and on phones the image comes first with the words below.
- **Clean finish.** No rules, dividers, borders or grid lines anywhere on the site; spacing and background tones separate content.
- **Alpuche AI.** The button now stays visible at all times, with a rounded launcher and a soft gold pulse every 10 seconds (off for visitors who prefer reduced motion).
- **Pinned header.** The header with the menu stays at the top of the screen while scrolling, on every page and screen size.
- **Alpuche AI controls.** The JMA logo, without the round chat badge, appears on the launcher and in the panel. A “New chat” button clears the conversation and starts again. The panel label reads “AI assistant · demo”, and the footer still says it is automated and not an attorney.
- **Advice requests.** “I need advice on a matter” and similar messages, including a visitor describing their own situation, get a consultation route: “Advice on a particular matter is given by the attorney, Mr. Alpuche, at a consultation…”, with an offer to start an enquiry. Generic words (matter, issue, advice, help) no longer pull in unrelated site passages.
- **Alpuche AI as a digital front desk.** It answers exactly what was asked, leading with the answer, in a formal legal register (“Yes. The firm advises and represents clients in Belize divorce matters.”, “No. The office is open Monday to Friday only…”). The knowledge base (v0.10) was rewritten in the same register; facts, links and sources are unchanged.
  - **New answers.** They cover: today's opening (using Belize time), the address with directions, phone and email, fees, the team, José's education and experience, languages, video meetings, visiting, response times, preparing for a consultation and what happens after an enquiry.
  - **Services.** Practice-area questions list the seven areas. “Do you handle …?” gets a plain “Yes.” and that practice's scope. Services the site doesn't list are named back: “Criminal defence is not among the firm's listed practice areas…”.

**To confirm with the firm**
- The rights to the nameplate image and the office sign photographs.
- The sign shows “alpuchelaw.com”, while the site's email is contact@alpuchelaw.com. Confirm the firm's own domain and whether this site will replace it.
- Alpuche AI's front-desk copy:
  - the one-line scope for each practice (`scope` in `PRACTICES`, `build.mjs`), drawn from the practice pages;
  - the rewritten knowledge-base answers;
  - honorifics: it calls the attorney “Mr. Alpuche” and uses Janine's full name.
- Where the site is silent, Alpuche AI says so rather than guessing: languages, video consultations, parking, response times, weekend hours beyond the published Monday–Friday. Confirm these if the firm wants them answered.
- The nameplate reads “Notary Public”, but the site and Alpuche AI do not list notarial services. Alpuche AI currently tells visitors to call about any service that isn't listed. If José offers notarial services, add them to the practice copy and the knowledge base.

Also recheck the Ministry of Natural Resources links, which returned intermittent errors during research.
