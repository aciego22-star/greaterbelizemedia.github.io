# Sutherland Septic Services — Website (Version 1)

A fast, mobile-first, self-contained static website for **Sutherland Septic Services**, Belize.
Built to deploy straight to **Netlify** with no build step. Brand: **green / white / black**.
Slogan: *"You Dump It. We Pump It."*

> Flagship launch package by **Austere Automations** · Assistant: **Roland**

---

## Pages
| Page | File |
|------|------|
| Home | `index.html` |
| About | `about.html` |
| Services | `services.html` |
| Gallery | `gallery.html` |
| Contact | `contact.html` |

Shared design system lives in `css/styles.css`, interactions in `js/main.js`,
and all icons in a single sprite at `images/icons.svg`.

---

## How to add the real assets

Everything below is styled with on-brand placeholders so the site looks complete today.
Swap them for the real files whenever you're ready — nothing else needs to change.

### 1. Logo — ✅ installed
The real logo is in place at **`images/logo-full.jpg`** — shown in the header (as a badge
beside the wordmark), as a white chip in the footer, and framed large on the About page.
To update it, replace that file (keep the name) or swap the `<img src="images/logo-full.jpg">`
references. The lightweight `images/favicon.svg` / `og-image.svg` still drive the browser tab
and social preview — regenerate those from the real logo when you have a square/landscape crop.

### 2. Hero + truck photos
- The hero background is set in one place: `css/styles.css`, the `.hero-media` rule.
  Replace `images/hero-truck.svg` with a real photo, e.g. `images/hero-truck.jpg`.
  ```css
  .hero-media { background-image: url("../images/hero-truck.jpg"); }
  ```
- For best results provide a wide landscape photo (≥1600px). The dark overlay is automatic,
  so text stays readable over any image.

### 3. Service & gallery photos
Each photo slot is a `<div class="ph">…</div>` placeholder. To use a real image, replace the
placeholder block with:
```html
<img src="images/your-photo.jpg" alt="Describe the photo" loading="lazy" />
```
The layout (cards, gallery tiles) adapts automatically.

### 4. Gallery videos (YouTube)
Open `gallery.html`, find the two `data-yt="REPLACE_ID"` blocks, and replace `REPLACE_ID`
with your YouTube video ID — the part after `v=` in the URL.
Example: `https://www.youtube.com/watch?v=**dQw4w9WgXcQ**` → `data-yt="dQw4w9WgXcQ"`.
Videos load only when clicked (fast page loads).

### 5. Roland (chat assistant)
Roland's buttons all call one function: `openRoland()` in `js/main.js`, which pops
up the live Roland chatbot in a modal. Roland is wired to the **Chatbase** embed
`3oMacSm0TBYNQ0AsnucmU`; the widget renders its own UI (green header, avatar,
greeting, prompt chips, mic/send bar) exactly as customers already know it.
To swap chatbots, change the `ROLAND_EMBED` iframe URL near the top of the Roland
launcher block in `js/main.js`. The chat loads only when a visitor first opens it.

### 6. Google Map
The Contact page map already points at the business address. To use the exact pin from the
**Google Business Profile**, copy the "Embed a map" iframe from Google Maps and paste it in
place of the existing `<iframe>` inside `.map-embed` on `contact.html`.

### 7. Google Reviews
The Home page has a Reviews section with a placeholder note. Drop in a live reviews widget
(e.g. from the Google Business Profile) where the `.placeholder-note` sits.

---

## Contact details used site-wide
- **Phone:** 614-6462 → links use `tel:+5016146462`
- **WhatsApp:** `https://wa.me/5016146462`
- **Address:** 7501 Mangrove Street, Fabers Road Extension, Belize City
- **Hours:** Open 24 Hours

To change the phone/WhatsApp number globally, search the project for `6146462` and update.

---

## Deploy to Netlify
**Option A — drag & drop:** zip the `sutherland-septic` folder and drop it on
[app.netlify.com/drop](https://app.netlify.com/drop).

**Option B — connect the repo:** in Netlify, set
- **Base directory:** `sutherland-septic`
- **Publish directory:** `sutherland-septic`
- **Build command:** *(leave empty)*

`netlify.toml` handles headers, asset caching and pretty URLs (`/about`, `/services`, …).
The Contact form is **Netlify-ready** — form submissions appear in your Netlify dashboard
automatically once deployed (no extra setup).

---

## Future-ready
The structure leaves room to add, with minimal effort:
- Customer testimonials · Careers page · Online booking
- Emergency request workflow · Expanded service areas · More gallery items

---

*Built with care as a flagship demonstration. No frameworks, no dependencies — just fast,
clean, responsive HTML/CSS/JS.*
