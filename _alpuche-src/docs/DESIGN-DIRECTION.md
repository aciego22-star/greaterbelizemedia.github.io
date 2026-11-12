# Design direction

The [local homepage reference](homepage-reference.html) demonstrates the responsive layout, image treatment, typography, page rhythm and compact AI employee control. Open it in a browser from the extracted folder.

## Design references

- Take the portrait-led composition and restrained contrast from [Houze Law Firm](https://www.shouze.com/). Its [design case study](https://www.dangilroy.com/portfolio/client/houze-law-firm/) includes a mobile reference.
- Use [Breton Law](https://breton-law.com/) for the clarity of the practice hierarchy and first-contact experience. The [What to expect page](https://breton-law.com/process/) is a reference for explaining the consultation path.
- Use [FT Legal](https://www.ft-legal.com/) for the choice to show an identifiable Caribbean place. The package uses Belize photographs with verified source and licence information.

Build the composition around the actual JMA identity and photography included in this ZIP. The reference sites guide the design only.

## Visual system

| Element | Specification |
|---|---|
| Headlines | Cormorant Garamond, 600. Use close leading and slight negative tracking. Desktop home H1 roughly 80–100 px, mobile roughly 48–58 px. |
| Body and interface | Inter, 400 to 600, with a clear 16–18 px body and line-height near 1.6. The local reference includes Latin WOFF2 fonts and OFL licences. |
| Dark surfaces | Ink `#11171B`, deep slate `#151D22`. Use the dark surfaces for the hero, footer and closing CTA. |
| Light surfaces | Ivory `#F6F2EB`, sand `#EBE2D3`. The light pages support sustained reading. |
| Primary action | Muted gold `#E4CBA7` with ink text. Use it on one primary CTA in each area. Text links and hairline rules carry secondary actions. |
| Layout | Desktop content width up to 1,280 px. Use large sections, simple rows and sharp or subtly squared edges. Match the responsive reference’s change to a single-column reading flow. |
| Photography | Use the original portrait and landscape imagery. Frame it with CSS or prepared responsive derivatives. Preserve full credit on José’s portrait. Omit decor that implies a different office or team. |

## Home

1. Dark masthead with JMA monogram, practice name, a simple menu and a contact route.
2. Full-width dark hero. Left side carries the location, headline, short introduction and two action links. The right side holds the tall, original José portrait with the image extending through the hero. Keep the photo against dark surroundings. On mobile, present the title and primary CTA first and the portrait in its own large frame below.
3. Thin credibility strip. Use qualification year, independent practice and the dated Bar Association election. Keep its line length and type size easy to read on mobile.
4. Seven linked practice areas in a ruled grid. Use the complete text in 01-home.md for the production content, arranged to preserve the reference’s information hierarchy.
5. Introduce José and Janine. Use Janine’s supplied photograph on the homepage and both supplied portraits on the team page.
6. Use the harbour photograph for the section that connects Belize property, business and retirement guides with the firm’s audience abroad. Use the credits listed in assets/IMAGE-CREDITS.md.
7. Close with the consultation action, phone and office location. Keep the AI employee a small, clearly labelled control outside the main hero actions.

## Interior pages

- **Practice pages** use a breadcrumb, focused H1, standfirst, service examples, Belize context, a short FAQ, related practice links and a context-specific enquiry. Use a quiet typographic opening on Family Law and Intellectual Property.
- **Team page** gives each portrait a separate biography panel. Keep the attorney and practice manager titles explicit.
- **Guides** use a readable text measure, occasional section navigation and links back to the relevant practice. Use captions on Belize photographs. Provide the links to official sources carried in the text.
- **Contact and What to Expect** give the first step, phone and office details prominence. Keep form-like areas in the demo clearly marked when they do not submit.
- **AI employee** is visible as “Office assistant”. Use an automated-service introduction and sample questions. Keep the panel accessible from a keyboard and dismissible without losing the current page.

## Original image framing

Pixel coordinates below use the supplied files. They identify blank capture margins for layout framing.

| Image | Source bounds | Use |
|---|---|---|
| José | x 0–710, y 235–1301 of 710 × 1536 | Show the full photographed area and its credit. In the reference, the frame ratio is 710:1066. |
| Janine | x 38–1022, y 76–807 of 1049 × 823 | Trim the white matte in layout and preserve the full photographed area. |
| JMA logo | x 14–527, y 19–424 of 555 × 452 | Hide the external white margin and keep the black artwork and monogram intact. |

## Firm approval

The reviewed facts, regulator links and remaining decisions are in [the source register](../SOURCE-REGISTER.md). The production privacy notice should reflect the actual form, hosting, analytics and AI data flows once those decisions are made. The supplied website notice addresses use of the website and assistant.
