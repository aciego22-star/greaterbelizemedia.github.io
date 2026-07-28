# Deploying the Duke Marine website

This is a standalone [Astro](https://astro.build) static site. It lives in the
`duke-marine/` folder of the `greaterbelizemedia.github.io` repo **only so it
never touches your main website**. To go live you'll move it into its own new
repository and deploy it on Netlify with your own domain.

Your existing Greater Belize Media site (served by GitHub Pages from `main`) is
**not affected** by any of these steps.

---

## 1. Create a new GitHub repository

1. Go to <https://github.com/new>.
2. **Repository name:** e.g. `duke-marine-site` (anything you like).
3. Visibility: Private or Public — your choice.
4. **Do not** add a README, .gitignore or license (the project already has them).
5. Click **Create repository** and leave the page open — you'll need the URL.

> Prefer I create it for you? I can create the repo via the GitHub tools —
> just confirm the name.

## 2. Put the code in the new repo

You only need the contents of the `duke-marine/` folder. Two easy options:

**Option A — from your computer (recommended):**
```bash
# download/copy the duke-marine folder, then inside it:
cd duke-marine
git init
git add .
git commit -m "Duke Marine website"
git branch -M main
git remote add origin https://github.com/<your-username>/duke-marine-site.git
git push -u origin main
```

**Option B — GitHub web upload:** open the new repo → **Add file → Upload files**
→ drag in everything inside `duke-marine/` (not the folder itself) → commit.

## 3. Deploy on Netlify

1. Sign in at <https://app.netlify.com> and click **Add new site → Import an existing project**.
2. Choose **GitHub** and pick `duke-marine-site`.
3. Netlify auto-detects Astro. Confirm:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   (These are also set in `netlify.toml`.)
4. Click **Deploy**. Your site goes live at a temporary `*.netlify.app` URL.

## 4. Add your custom domain

1. In Netlify: **Site configuration → Domain management → Add a domain**.
2. Enter your domain and follow Netlify's DNS instructions — either point your
   registrar's records at Netlify, or switch to Netlify DNS.
3. HTTPS (SSL) is provisioned automatically once DNS resolves.
4. **Update the site URL:** set your real domain in two places so canonical
   URLs, the sitemap and social cards are correct:
   - `astro.config.mjs` → `site: 'https://yourdomain.com'`
   - `src/data/site.ts` → `url: 'https://yourdomain.com'`
   - `public/robots.txt` → the `Sitemap:` line
   Commit and push; Netlify redeploys automatically.

## 5. Forms

The contact, quote, commercial and careers forms use **Netlify Forms** — no
backend needed. They work automatically once deployed to Netlify.

- View submissions: Netlify dashboard → **Forms**.
- Get email alerts: **Forms → Settings & notifications → Add notification**.
- Forms redirect to `/thank-you` after submitting.

---

## Editing content later

| To change… | Edit this file |
| --- | --- |
| Store name, phone, address, hours, social | `src/data/site.ts` |
| Products (catalog + detail pages) | `src/data/products.ts` |
| Brands carried | `src/data/brands.ts` |
| Category structure | `src/data/catalog.ts` |
| Leadership/team | `src/data/team.ts` |
| Testimonials | `src/data/testimonials.ts` |
| News/blog posts | add a `.md` file in `src/content/news/` |
| Brand colours & fonts | `src/styles/tokens.css` |
| Logo | `src/components/Logo.astro` (replace the placeholder SVG) |

### Adding real photos & video
The site currently uses designed placeholder media (`src/components/Media.astro`).
Drop real images into `public/media/` and swap the `<Media … />` tags for
`<img src="/media/…">`. For a **hero background video**, put the file in
`public/media/` and pass it to the hero:
`<OceanCanvas videoSrc="/media/hero.mp4" poster="/media/hero-poster.jpg" />`
(in `src/components/HomeHero.astro`).

## Local development
```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build → dist/
npm run preview    # preview the production build
```
