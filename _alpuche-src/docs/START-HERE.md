# José M. Alpuche · Website brief for Claude Code

Prepared for Austere Automations on 12 November 2026. Build a private prospect demo for the Belize City practice of José M. Alpuche, Attorney-at-Law. The design direction for this handoff is an editorial, portrait-led site with clear practice pages and Belize photography. Final firm approval is pending.

## Start here

1. Open [the responsive homepage design reference](design/homepage-reference.html) in a browser after extracting the whole ZIP. Its section navigation, photos and sample office assistant work locally. Its practice and guide links open the corresponding draft Markdown files. The full publishable-copy draft lives in [content/](content/). Use the design reference for composition and the Markdown files for the full content.
2. Render the 17 routes from the Markdown frontmatter. Use the existing project’s framework if one is already in place. If starting from scratch, choose a static-friendly framework with a shared navigation, footer, contact block and practice-page template.
3. Build the demo AI employee with the prepared answers in [ai/knowledge-base.md](ai/knowledge-base.md), the behaviour in [ai/assistant-instructions.md](ai/assistant-instructions.md), and the tests in [ai/test-cases.tsv](ai/test-cases.tsv).
4. Use the supplied portraits, JMA mark and Belize photos. Follow [the image credits](assets/IMAGE-CREDITS.md), [the design direction](design/DESIGN-DIRECTION.md) and [the source register](SOURCE-REGISTER.md).

**Copy into Claude Code after extracting**

> Read START-HERE.md and design/DESIGN-DIRECTION.md. Build a private, responsive website demo for José M. Alpuche using every route and its drafted copy in content/. Open design/homepage-reference.html as the visual reference. Use the exact supplied portraits and JMA mark plus the mapped Belize photography. Include the demo office assistant using the curated answers and behaviour in ai/. Keep the preview noindex and leave outbound submission, uploads and live AI disabled. Verify navigation, desktop and mobile rendering, photo credits, consultation links and the assistant’s sample routes. Return a private preview and a short list of firm decisions needed for launch.

## What the site needs to accomplish

- In the first screen, show the attorney, the Belize jurisdiction, the kind of counsel offered and one clear consultation action.
- Let a business owner, property buyer, family or prospective retiree get to the relevant service within two interactions. Give each service a distinct search landing page and a route back to the office.
- Introduce Janine by name and role. Explain the first consultation step in plain language.
- Give local and overseas visitors enough information to identify useful questions before contacting the office. The three guides should read as resources, with clear routes into the relevant legal services.
- Demonstrate the AI employee’s ability to route common questions and hand off sensitive or time-critical ones to a human.

## What to show in the prospect meeting

Start on the homepage, then open the Real Estate page from the practice grid and follow its link to the property purchase guide. Show how the consultation link carries the relevant practice into the contact experience. On mobile, open the office assistant, choose “Retiring in Belize” and follow the answer to the QRP page. This demonstration connects the visual redesign to two everyday enquiries and shows how visitors can find the right service before they call.

## Route map

| Page | Route | File |
|---|---|---|
| Home | `/` | 01-home.md |
| The team | `/about/` | 02-about.md |
| Practice areas | `/practice-areas/` | 03-practice-areas.md |
| Real estate | `/practice-areas/real-estate/` | 04-real-estate.md |
| Corporate and commercial | `/practice-areas/corporate-commercial/` | 05-corporate-commercial.md |
| Banking, finance, tax and regulatory | `/practice-areas/banking-finance-tax-regulatory/` | 06-banking-finance-tax-regulatory.md |
| Dispute resolution | `/practice-areas/dispute-resolution/` | 07-dispute-resolution.md |
| Intellectual property | `/practice-areas/intellectual-property/` | 08-intellectual-property.md |
| Family law | `/practice-areas/family-law/` | 09-family-law.md |
| Qualified Retired Persons Programme | `/practice-areas/qualified-retired-persons/` | 10-qualified-retired-persons.md |
| What to expect | `/working-with-us/` | 11-working-with-us.md |
| Contact | `/contact/` | 12-contact.md |
| Belize legal guides | `/insights/` | 13-insights.md |
| Buying property in Belize | `/insights/buying-property-in-belize/` | 14-buying-property.md |
| Starting a business in Belize | `/insights/starting-a-business-in-belize/` | 15-starting-business.md |
| Planning retirement in Belize | `/insights/planning-retirement-in-belize/` | 16-planning-retirement.md |
| Website notice and image credits | `/website-notice/` | 17-website-notice.md |

## Build notes

- Use the visible menu labels Practice Areas, Our Team, What to Expect, Belize Legal Guides and Contact. Keep the consultation CTA prominent. On mobile, use a keyboard-accessible menu and tap-to-call contact. A contact query parameter can preselect one of the seven known practice topics. Keep arbitrary values out of rendered text and treat the plain contact URL as canonical.
- Use the frontmatter title, description and image field to build metadata. A blank image field indicates an intentionally typographic opening. Use a neutral approved brand graphic for social sharing on those pages. Keep source IDs as editorial metadata. Publish the agency links already included in the draft.
- Add page-specific Open Graph metadata, breadcrumb links, a human-readable image credits anchor and a production XML sitemap for indexable canonical pages. At a future domain migration, preserve `/about/` and `/contact/`, and plan a permanent redirect from the current `/services/` to `/practice-areas/` after confirming existing URLs. Keep the private preview out of the sitemap and protect it with the host’s access controls.
- Use accurate LegalService and Person structured data only after confirming public information with the firm. Keep office address, phone, hours and principal name consistent across footer, contact and schema. Confirm the production domain before setting canonicals. No Spanish pages are included, so use English labels and language metadata.
- Set image dimensions and provide appropriately sized, locally hosted derivatives. Prioritise the homepage portrait and lazy-load below-the-fold assets. Keep legible type, strong contrast and visible focus. Check the assistant for collisions with the header, navigation, phone links or mobile safe areas.
- For the prospect demo, the contact page can use the published phone and email as plain links. Do not send anything automatically. If showing an enquiry form, label it as a preview and use a simulation with no submission, analytics event payload or stored field values. Show sample assistant questions and answers from the curated content.
- After firm approval, a production enquiry flow can collect a name, preferred reply channel, service category and a short non-confidential description. Confirm the recipient, how conflicts are handled, retention and any privacy notices against the actual workflow. Do not add uploads, appointment commitments, payments or case access to the first release.

## Review before sharing the private demo

- Confirm each route renders, internal links and related practice links resolve, and every practice page reaches a consultation option.
- Compare the home hero at desktop, tablet and mobile widths. The face, logo, CTA and photographer credit should all be readable without competing overlays.
- Test the AI employee against all 24 cases. For the scripted demo, implement and verify the four sample intents, and use the remaining cases as production acceptance criteria if a model is later connected.
- Check the office details against the current site and confirm consultation workflow, imagery rights and publishable claims with the firm before launch.
