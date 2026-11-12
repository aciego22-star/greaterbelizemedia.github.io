/**
 * Build-time renderer: turns each route into real HTML so search engines,
 * answer engines and AI crawlers can read the full content without JavaScript.
 * Used only by scripts/prerender-routes.mjs — never shipped to browsers.
 */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import { CartProvider } from './context/CartContext';
import routes from './content/routes';
import { blogPages, jsonLdScript, postJsonLdScript } from './lib/structuredData';
import { publishedPosts, postPath, formatPostDate } from './content/blog/posts';
import { contest } from './content/blog/contest';
import { site } from './content/site';
import { publishedFaqs } from './content/faqs';
import { getCatalogue } from './content/catalogue';
import { media } from './content/media';
import { formatLongDate } from './lib/season';
import { lang, routerBasename, LANG_REDIRECT_SCRIPT } from './i18n/lang';

export { lang, LANG_REDIRECT_SCRIPT };

export { routes, jsonLdScript, postJsonLdScript, blogPages };

export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url} basename={routerBasename()}>
      <CartProvider>
        <App />
      </CartProvider>
    </StaticRouter>,
  );
}

/** llms.txt — a plain-language summary for AI assistants, built from the same verified content. */
export function llmsTxt(): string {
  const base = site.siteUrl.replace(/\/$/, '');
  const flavours = getCatalogue()
    .map(
      (p) =>
        `- ${p.name}: ${p.variants.map((v) => `${v.bottleSize}${v.priceBZD !== null ? ` BZD $${v.priceBZD}` : ''}`).join(' · ')}${p.dietaryLabel ? ` (${p.dietaryLabel})` : ''}: ${p.description}`,
    )
    .join('\n');
  const faqs = publishedFaqs().map((f) => `### ${f.question}\n${f.answer}`).join('\n\n');
  const pages = Object.values(routes)
    .map((r) => `- [${r.nav}](${base}${r.path === '/' ? '/' : `${r.path}/`}): ${r.description}`)
    .join('\n');
  const videos = media
    .map((m) => `- ${site.brandName}, ${m.title}${m.publisher ? ` (${m.publisher}, ${m.platform === 'youtube' ? 'YouTube' : 'Facebook'})` : ''}: ${m.url}`)
    .join('\n');
  return `# ${site.brandName}

> ${site.brandName} is a Belizean family business that makes rumpopo (also spelled rum popo), a rich, creamy holiday drink containing alcohol, for the Christmas season. Based on ${site.contact.addressLine}. The family has been sharing its rumpopo for ${site.experienceStatement}. Orders are requested through WhatsApp. Payment is cash on delivery (or at pickup) or bank transfer; there is no online card payment.

Brand tagline: "${site.logoTagline}"

## Key facts
- Business: ${site.brandName} (short name: ${site.brandShort})
- Product: rumpopo / rum popo, contains alcohol; for adults of legal drinking age (${site.alcohol.legalAge}+)
- Location: ${site.contact.addressLine}, Belize
- Season: order requests accepted until ${formatLongDate(site.season.seasonClosesOn)}
- Ordering: choose flavours on the website, then send the order request on WhatsApp; ${site.brandShort} confirms availability, final price, payment and delivery directly
- Fulfilment options offered this season: ${site.fulfilment.filter((f) => f.enabled && f.id !== 'advise').map((f) => `${f.label}${f.short ? ` (${f.short})` : ''}`).join('; ')}. Delivery and shipping carry a charge confirmed by ${site.brandShort}; pickup is free
- Sizes: Half liter (500 mL) and Liter (1 L); prices in Belize dollars (BZD) are listed below
- Payment: cash on delivery (Belize City) or at pickup, or bank transfer from Heritage Bank, Belize Bank or Atlantic Bank. Shipping orders are paid by bank transfer. For transfers, the customer sends a screenshot of the completed transfer in the WhatsApp chat; the order is placed once Cojac’s receives it.

## The Cojac's Guarantee
- Rich and creamy: never thin, watered down or lacking in flavour.
- No eggy taste: rumpopo may contain eggs, but it should never taste eggy.
- Filled to the top: bottles are filled properly, right to the top.
- More than just Classic Vanilla: customer favourites, seasonal creations and new releases.

## Menu and prices this season (availability confirmed on WhatsApp)
${flavours}

## Pages
${pages}

## Holiday Blog
${publishedPosts()
  .map((p) => `* [${p.title}](${base}${postPath(p.slug)}/) (${formatPostDate(p.publishedAt)}): ${p.excerpt}`)
  .join('\n')}
${contest.status === 'active' ? '\nMystery flavour competition (2026): the new flavour is secret. Official hint: one of the main ingredients is popular in Belizean cooking. Guesses are made only in the comments of Cojac’s official Facebook competition post (one answer per comment, multiple guesses allowed); the first three correct answers each win one half liter bottle of the new flavour. Guesses are not collected on this website.\n' : ''}
## Media features
${videos}

## Frequently asked questions
${faqs}
`;
}
