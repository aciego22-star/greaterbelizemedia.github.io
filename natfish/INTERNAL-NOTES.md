# NATFISH V1 internal notes

**Internal only. Not linked from any page and not to be shared with the client.**

Concept build for the Tuesday meeting with Miss Denise. Preview URL once pushed:
`https://greaterbelizemedia.github.io/natfish/`

---

## 1. Confirm before production

### Blocking, needed before anything goes live

| # | Item | Current V1 value | Where it appears |
|---|---|---|---|
| 1 | **WhatsApp number** | Defaults to the office line `+501 227-3165`, which may not be WhatsApp-registered | `assets/js/natfish.js`, `WHATSAPP_NUMBER` |
| 2 | Exact street address | `Angel Lane, Belize City` with no street number | Footer, contact band, `contact.html` |
| 3 | Telephone | `+501 227-3165` (public directory) | Header, footer, contact band, `contact.html` |
| 4 | Email | `natfish@btl.net` (public directory) | Footer, contact band, both forms |
| 5 | Use of "NATFISH" as the public digital name | Used prominently as the wordmark | Every page |
| 6 | Official logo and legal-name styling | Placeholder wordmark, see section 3 | Header and footer |

**Item 1 is the one to raise first.** The brief lists any WhatsApp number as unverified, so none was
invented. The success panel offers Email and WhatsApp. Three options:

- Miss Denise gives a real WhatsApp number, change `WHATSAPP_NUMBER` in `assets/js/natfish.js`. One line.
- Demo as-is, knowing the landline may not open a WhatsApp chat.
- Set `WHATSAPP_NUMBER = ""` and the WhatsApp button hides itself. No other change needed.

### Also to confirm

- All current products and product formats.
- Local versus export product availability.
- Current export markets.
- Food-safety certifications and the exact wording permitted.
- Whether the electronic traceability system is still active, and how to describe it publicly.
- Current membership count.
- Active receiving locations, branches and outlets.
- Current management contact and content approver.
- Whether `nationalfisherscoop.com` is still in use.
- All owned photographs, logos, brochures and video.

---

## 2. Tuesday discovery questions

1. What seafood products and product formats does National currently sell?
2. Which products are sold locally and which are exported?
3. Which countries or buyer markets are currently active?
4. What certifications, licences or food-safety standards may we publish?
5. Is the electronic traceability system still active? If so, how should it be described publicly?
6. What is the current membership count?
7. Which receiving locations, branches or outlets are currently active?
8. Please confirm the official address, telephone, email and any WhatsApp numbers.
9. Do you still use the old nationalfisherscoop.com domain?
10. Who will approve website content and imagery?
11. What information do you require from a serious wholesale or export buyer?
12. Do you prefer the full institutional name, NATFISH, or both?
13. What photographs, brochures, event images or videos can National supply?

---

## 3. What is deliberately placeholder

| Asset | Status | Replacement path |
|---|---|---|
| Logo | Proposed wordmark: an `N` with a wave, drawn as inline SVG | Swap the `<svg class="logo__mark">` block in each page's header and footer |
| All photography | Concept images from the supplied pack, not owned by the cooperative | Drop new files into `assets/img/` using the same names |
| Featured video | Public Ocean Link documentary, credited on screen as third-party concept media | Change `data-video` on the `.video` element |
| News items | Three publicly sourced items, each with a visible source link | Replace with cooperative announcements |

### How the forms actually behave

On **every** host, including Netlify, the forms validate in the browser and then hand the enquiry off
to the visitor's email client or WhatsApp. **Nothing is captured server-side and no enquiry is stored
anywhere.** If the visitor abandons the handoff, the enquiry is lost, so the telephone and email links
remain the reliable contact route.

An earlier draft of this file claimed Netlify would capture submissions automatically. That was wrong.
The script calls `preventDefault()` on submit, so the native POST that Netlify Forms relies on never
fires. The `data-netlify` attribute was removed for the same reason: Netlify would have registered a
form in the dashboard that sat at zero submissions forever and read as broken.

To turn on real capture later, three changes are needed:

1. Restore `method="post" data-netlify="true"` on the `<form>`.
2. Add `<input type="hidden" name="form-name" value="buyer-enquiry">` inside it.
3. In `assets/js/natfish.js`, before showing the success panel, `fetch("/", { method: "POST", body:
   new URLSearchParams(new FormData(form)) })` and swallow any error.

The `name` attributes on every field are already correct for that step.

---

## 4. Image 2 was cropped, and why

`natfish_image_02.jpg` (the storefront) carried three blocks of fabricated data:

- `TEL: 665-2458`, which **contradicts the verified 227-3165**
- A fixed opening-hours board
- A five-species "FRESH CATCH" list (grouper, snapper, lobster, shrimp, conch)

Publishing any of it would breach the accuracy guardrails on product lists and facility hours, and the
wrong phone number is the first thing Miss Denise would have spotted. Blurring the three regions was
tried first and read as redaction, so the image is instead **cropped to the façade band above them**
(top 335px of 787). The legal-name lettering survives and is an asset. The full frame is not deployed.

Regenerate with `tools/process-images.py` if the source pack is ever reprocessed.

---

## 5. Accuracy guardrails held in the copy

Nothing on the site states any of the following, and none should be added without written confirmation:

- A current member count, export-country count or certification count.
- Specific export markets. The trade section says National is *represented* through trade promotion,
  which is what BELTRAIDE material supports, and stops there.
- That any certification is current.
- That all products are sustainably certified or fully traceable. `responsible.html` closes with an
  explicit section stating what the page does **not** claim.
- Any product list beyond lobster, conch and "other seafood products, contact for availability".
- Prices, packaging, grades, sizes, minimum order quantities or availability.
- Any management or staff name, quote, testimonial or biography.

Traceability wording is held at "has participated in electronic catch-documentation and traceability
initiatives". Responsible-fisheries wording is held at "has participated in Belize's spiny lobster
Fishery Improvement Project". Both are sourced on the page.

---

## 6. Build notes

Static HTML, no build step, no framework, no external fonts or scripts. Hosts on GitHub Pages, Netlify
or any static host by copying the folder.

```
natfish/
  index.html cooperative.html seafood.html responsible.html
  buyers.html news.html contact.html
  assets/css/natfish.css      one stylesheet, design tokens at the top
  assets/js/natfish.js        one script, config constants at the top
  assets/img/                 WebP + JPEG at 800w and 1400w
  tools/process-images.py     regenerates the image set from the source pack
```

The seven pages were generated from a shared template so the header, footer and nav stay identical.
**They are plain static HTML now and should be edited directly.** Note that a change to the header,
footer or nav has to be repeated across all seven files.

Verified in Chromium at 320, 375, 390, 393, 414, 430, 1366, 1440 and 1920 px: no horizontal overflow,
no console errors, no failed requests, one `h1` per page, every internal link and anchor resolves.
Keyboard paths checked for the menu, both forms, the gallery lightbox and the video.
