# Duke Marine — corporate website

Belize's marine & fishing supply headquarters. A fast, modern, fully responsive
corporate site built with [Astro](https://astro.build), featuring an animated
ocean hero, scroll & hover motion, a browsable product catalog (catalog +
inquiry, no online checkout), and Netlify-powered contact forms.

> **Note:** This project lives in the `duke-marine/` subfolder so it does not
> affect the Greater Belize Media main site. See **[DEPLOY.md](./DEPLOY.md)** to
> move it to its own repo and deploy on Netlify with a custom domain.

## Quick start
```bash
npm install
npm run dev      # http://localhost:4321
```

## Pages
- **Home** — animated hero, departments, featured categories & products, why-us, brand video, testimonials, visit/hours.
- **Marine Supplies** / **Fishing Supplies** — category sections + product cards.
- **Product detail** — generated per product with an inquiry CTA.
- **Brands**, **Commercial & Wholesale**, **Services**, **About** (story, values, timeline, team), **News** (+ articles), **Careers**, **Contact**.
- **404** and **thank-you** pages.

## Structure
```
src/
  components/   reusable UI (Header, Footer, Hero, cards, forms, OceanCanvas…)
  content/news/ markdown articles
  data/         site config, catalog, products, brands, team, testimonials
  layouts/      BaseLayout (SEO/OG/JSON-LD, header, footer)
  pages/        routes
  scripts/      client motion (reveals, parallax, counters, nav)
  styles/       design tokens + global CSS
public/         favicon, social card, robots.txt
```

## Tech & features
- Astro static output — no server required.
- Custom CSS design system (design tokens in `src/styles/tokens.css`).
- Dependency-free motion; respects `prefers-reduced-motion`.
- SEO: per-page meta, Open Graph/Twitter, canonical, `LocalBusiness` JSON-LD, sitemap, robots.
- Accessibility: semantic landmarks, skip link, keyboard nav, focus styles, labelled forms.

See **[DEPLOY.md](./DEPLOY.md)** for content-editing and deployment instructions.
