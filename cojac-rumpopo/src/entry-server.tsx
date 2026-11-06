/**
 * Build-time renderer: turns each route into real HTML so search engines,
 * answer engines and AI crawlers can read the full content without JavaScript.
 * Used only by scripts/prerender-routes.mjs — never shipped to browsers.
 */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import { CartProvider } from './context/CartContext';
import routes from './content/routes.json';
import { jsonLdScript } from './lib/structuredData';
import { site } from './content/site';
import { publishedFaqs } from './content/faqs';
import { getCatalogue } from './content/catalogue';
import { media } from './content/media';
import { formatLongDate } from './lib/season';

export { routes, jsonLdScript };

export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <CartProvider>
        <App />
      </CartProvider>
    </StaticRouter>,
  );
}

/** llms.txt — a plain-language summary for AI assistants, built from the same verified content. */
export function llmsTxt(): string {
  const base = site.siteUrl.replace(/\/$/, '');
  const flavours = getCatalogue().map((p) => `- ${p.name}: ${p.description}`).join('\n');
  const faqs = publishedFaqs().map((f) => `### ${f.question}\n${f.answer}`).join('\n\n');
  const pages = Object.values(routes)
    .map((r) => `- [${r.nav}](${base}${r.path === '/' ? '/' : r.path}): ${r.description}`)
    .join('\n');
  const videos = media
    .map((m) => `- ${site.brandName} — ${m.title}${m.publisher ? ` (${m.publisher}, ${m.platform === 'youtube' ? 'YouTube' : 'Facebook'})` : ''}: ${m.url}`)
    .join('\n');
  return `# ${site.brandName}

> ${site.brandName} is a Belizean family business that makes rumpopo (also spelled rum popo), a rich, creamy holiday drink containing alcohol, for the Christmas season. Based on ${site.contact.addressLine}. The family has been sharing its rumpopo for ${site.experienceStatement}. Orders are requested through WhatsApp; there is no online payment.

Brand tagline: "${site.logoTagline}"

## Key facts
- Business: ${site.brandName} (short name: ${site.brandShort})
- Product: rumpopo / rum popo — contains alcohol; for adults of legal drinking age (${site.alcohol.legalAge}+)
- Location: ${site.contact.addressLine}, Belize
- Season: order requests accepted until ${formatLongDate(site.season.seasonClosesOn)}
- Ordering: choose flavours on the website, then send the order request on WhatsApp; ${site.brandShort} confirms availability, final price, payment and delivery directly
- Fulfilment options offered this season: ${site.fulfilment.filter((f) => f.enabled && f.id !== 'advise').map((f) => `${f.label}${f.short ? ` (${f.short})` : ''}`).join('; ')}. Delivery and shipping carry a charge confirmed by ${site.brandShort}; pickup is free
- Prices and bottle sizes: confirmed by ${site.brandShort} on request

## The Cojac's Guarantee
- Rich and creamy — never thin, watered down or lacking in flavour.
- No eggy taste — rumpopo may contain eggs, but it should never taste eggy.
- Filled to the top — bottles are filled properly, right to the top.
- More than just Classic Vanilla — customer favourites, seasonal creations and new releases.

## Flavours (family favourites; availability confirmed each season)
${flavours}

## Pages
${pages}

## Media features
${videos}

## Frequently asked questions
${faqs}
`;
}
