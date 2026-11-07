# Search & AI visibility: SEO, AEO, GEO, AIO, SXO

This document follows the “Layers of SEO” guide. Everything is generated from the content files (`src/content/*`), so the website, the structured data and what AI assistants read always say the same thing. As with the rest of the site, **only verified facts are used**: no invented prices, reviews, ratings, founding year or awards.

## Favicon in Google Search

| Requirement (Google) | What we ship |
|---|---|
| Square icon, a multiple of 48 px | `/favicon.ico` (16, 32, 48 px), `/favicon-48x48.png`, `/favicon-96x96.png`, `/favicon-192x192.png`, `/favicon-512x512.png` — all cut from the official logo |
| `<link rel="icon">` in the **homepage** HTML (not added by JavaScript) | Present in the static `<head>` of every page, including `/` |
| Crawlable and stable URL; not blocked by robots.txt | `/favicon.ico` at the site root, allowed in robots.txt |
| Apple / Android home-screen icons | `apple-touch-icon.png` (180 px, opaque) plus `site.webmanifest` with 192, 512 and maskable icons |

**How to get it showing as fast as possible.** Google shows a favicon only after it crawls the homepage; nobody can force the timing.
1. Deploy to the final domain, then set `siteUrl` in `src/content/site.ts` and rebuild.
2. In [Google Search Console](https://search.google.com/search-console), add the domain property and verify it. Netlify DNS or an HTML-tag verification both work.
3. Under **Sitemaps**, submit `https://<domain>/sitemap.xml`.
4. Under **URL Inspection**, enter the homepage URL and choose **Request indexing**.
5. The favicon usually appears in results within a few days to a few weeks. Keep the favicon URL unchanged afterwards.
6. Optional: do the same in Bing Webmaster Tools, which also feeds Copilot and other AI assistants.

## 1. SEO: a strong foundation for organic discovery

| Work on | Implementation |
|---|---|
| Search intent and keyword clusters | Titles, descriptions and headings target **rumpopo / rum popo**, **Belize / Belize City**, **Christmas**, **delivery**, **WhatsApp** and the flavour names (`src/content/routes.json`). Owner copy is untouched. |
| Site architecture and internal linking | Ten clean URLs, each one click from the header or footer. The home page links to every section. Breadcrumbs are in the structured data. |
| Crawlability | **Every page is pre-rendered to full HTML at build time**, so all content is readable without JavaScript. Includes `sitemap.xml` (with image entries), `robots.txt`, canonical tags, `hreflang="en-BZ"` and a real 404 status for unknown URLs. |
| Topical depth | The Story, Guarantee, Flavours, FAQs (now 18 published answers) and Videos pages all cover the same topic from different angles. |
| Technical health | One `<h1>` per page, semantic HTML, fast static files, long-cache assets, lazy-loaded images, WCAG 2 AA (axe: 0 violations). |

**Key signals to watch** (Search Console → Performance and Pages): organic impressions, keyword positions (e.g. “rumpopo Belize”, “rum popo Belize City”, “Cojac’s rumpopo”), search traffic and pages indexed (10 expected).

**Holiday Blog:** `/holiday-blog` (CollectionPage + Blog) and article pages (BlogPosting + BreadcrumbList, `og:type=article`, 1920×1080 share image, sitemap entries with images). New stories add topical depth for “rumpopo Belize”, “Belizean rum popo”, “rum popo season 2026” and “Belize Christmas drink”.

## 2. AEO: content that answer engines can quote

| Work on | Implementation |
|---|---|
| Direct responses and natural questions | FAQs written as the questions people actually ask: “What is rumpopo?”, “Is it rumpopo or rum popo?”, “Who makes Cojac’s?”, “When can I order?”, “Do you deliver?”, “How do I place an order?”. Each answer leads with the answer itself. |
| FAQ sections and structured answers | `FAQPage` JSON-LD on `/faqs`, generated from the published answers only. Draft (unapproved) questions are excluded automatically. |
| Featured content | The home page FAQ preview opens with “What is rumpopo?”. A **“Cojac’s at a glance”** fact box (What, Who, Where, Experience, Flavours, Season, How to order, Payment) sits on Our Story and Contact. |

Signals: answer visibility, featured snippets and “People also ask”, query coverage, brand recognition.

## 3. GEO: being mentioned and cited by AI

| Work on | Implementation |
|---|---|
| Brand authority and trustworthy sources | A trust strip (“Belizean family recipe · More than fifteen years of rumpopo · Based on Diego St, Belize City · Featured by Greater Belize Media”) uses only verified facts. Media features are linked to their original YouTube and Facebook sources. |
| Entity relationships | `Organization`, `Brand`, `WebSite` and per-page `WebPage` entities are linked by `@id`. The organisation carries `subjectOf` links to its media features and `knowsAbout` rumpopo. |
| Original insights and supporting evidence | The family’s own story and guarantee are presented as quotable statements. Add expert contributions (e.g. the family explaining their process) whenever they are willing to share them. |
| `llms.txt` | `/llms.txt` gives AI assistants a plain-language summary built from the same content: key facts, guarantee, flavours, pages, media and FAQs. |
| AI crawler access | robots.txt explicitly welcomes Googlebot, Bingbot, Google-Extended, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot and Applebot-Extended. *(The family can remove any of them.)* |

Signals: AI mentions, brand citations, source references and recommendations (try asking ChatGPT, Perplexity, Gemini or Copilot “where can I buy rumpopo in Belize City?” a few weeks after launch).

## 4. AIO: a digital presence that is clear and AI-ready

| Work on | Implementation |
|---|---|
| Clear entities and consistent information | One source of truth (`site.ts`) feeds the page text, the JSON-LD, the FAQs and `llms.txt`. The name, address, season dates and fulfilment options can’t drift apart. |
| Structured data | `Organization` (name, alternate names, logo, slogan, description, address, area served, brand), `WebSite`, `WebPage` / `AboutPage` / `ContactPage` / `CollectionPage` / `FAQPage`, and `BreadcrumbList`. **Automatic upgrades:** `ContactPoint` appears once the official WhatsApp number is set; `sameAs` once Facebook or Instagram links are set; `Product` once a flavour is confirmed for the season; `Offer` only for approved prices; `VideoObject` once an `uploadDate` is entered in `media.ts`. |
| Semantic relationships and machine-friendly content | Semantic HTML (`<dl>` facts, `<article>`, `<nav>`, headings in order). Alternate spellings (rum popo) are stated explicitly. |
| Knowledge signals | Consistent alternate names: “Cojac’s”, “Cojac’s Rumpopo”, “Cojac’s Sumptuous Rum Popo”. One YouTube upload spells the brand “Colac’s”; we never repeat that spelling. |

Signals: entity recognition (a Google knowledge panel over time), AI discoverability, information accuracy and contextual relevance.

**Recommended next steps for the family** (each adds a trust signal):
- Create or claim a **Google Business Profile** with the same name and address.
- Use the same name, address and WhatsApp number on Facebook, Instagram and any directories.
- Ask Greater Belize Media to link to the website from their video descriptions.
- Add the YouTube upload dates to `media.ts` so the videos become eligible for video results.

## 5. SXO: turning search visitors into customers

| Work on | Implementation |
|---|---|
| Page experience, mobile usability and navigation flow | Mobile-first layout, a sticky “Review & send” bar, a thumb-friendly cart, every section in the mobile menu, and a final call to action on every page. |
| Content clarity | The four-step “How ordering works”, honest “To be confirmed by Cojac’s” labels and allergy/alcohol notes before ordering. |
| Trust elements | The official logo, trust strip, guarantee, media features, privacy page, and “no online payment, never share card details”. |
| Conversion paths and calls to action | “Find Your Flavour” → “Add to Order” → “Review & send” → WhatsApp, with a copy-to-clipboard fallback. |

Signals: engagement, time on page, lead generation (WhatsApp order requests received), conversion rate and returning visitors. Analytics is **not installed**. If the family wants these measured, add a privacy-friendly tool such as Netlify Analytics or Plausible and update the privacy page.

## After the season

The pre-rendered HTML reflects the season at build time. **Rebuild and redeploy after changing the season settings**, and once after the closing date, so search engines see the “season ended” state. The live site already switches automatically for visitors.
