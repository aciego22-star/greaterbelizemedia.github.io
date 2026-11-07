/**
 * Schema.org structured data (JSON-LD), generated from the content files so it can
 * never disagree with what the page shows. Rules:
 *  - Only verified facts: empty settings are simply left out.
 *  - No prices, offers, ratings or reviews unless approved in catalogue.ts.
 *  - Videos become VideoObject only when an uploadDate has been entered in media.ts.
 */
import routes from '../content/routes.json';
import { site } from '../content/site';
import { publishedFaqs } from '../content/faqs';
import { media } from '../content/media';
import { getCatalogue } from '../content/catalogue';
import { getDestination } from './whatsapp';
import { buildWhatsAppUrl } from './order';

type RouteKey = keyof typeof routes;
type Json = Record<string, unknown>;

const origin = () => site.siteUrl.replace(/\/$/, '');
const abs = (path: string) => origin() + (path.startsWith('/') ? path : `/${path}`);
const pageUrl = (key: RouteKey) => abs(routes[key].path === '/' ? '/' : routes[key].path);
const ORG_ID = () => `${origin()}/#organization`;
const SITE_ID = () => `${origin()}/#website`;

export function organization(): Json {
  const sameAs = [site.social.facebook, site.social.instagram].filter(Boolean);
  const d = getDestination();
  const contactPoint: Json[] = [];
  if (d.ok && d.source === 'official') {
    contactPoint.push({
      '@type': 'ContactPoint',
      contactType: 'orders',
      url: buildWhatsAppUrl(d.number, `Hello ${site.brandName}!`),
      telephone: `+${d.number}`,
      areaServed: 'BZ',
      availableLanguage: ['English'],
    });
  }
  if (site.contact.phoneDial) {
    contactPoint.push({ '@type': 'ContactPoint', contactType: 'customer service', telephone: `+${site.contact.phoneDial}`, areaServed: 'BZ' });
  }
  const [street, ...rest] = site.contact.addressLine.split(',').map((s) => s.trim());
  return {
    '@type': 'Organization',
    '@id': ORG_ID(),
    name: site.brandName,
    alternateName: [site.brandShort, `${site.brandShort} Rumpopo`, `${site.brandShort} Sumptuous Rum Popo`],
    url: `${origin()}/`,
    logo: { '@type': 'ImageObject', url: abs('/brand/cojacs-logo-square-512.jpg'), width: 512, height: 512, caption: site.brandName },
    image: abs('/og-image.jpg'),
    slogan: site.logoTagline,
    description: `${site.brandName} is a Belizean family business making rich, creamy rumpopo (rum popo) for the Christmas season — from Classic Vanilla to customer favourites like Peanut Delight and Pumpkin Spice. Order requests are taken on WhatsApp.`,
    knowsAbout: ['Rumpopo', 'Rum popo', 'Belizean Christmas traditions', 'Holiday drinks'],
    areaServed: { '@type': 'Country', name: 'Belize' },
    ...(site.contact.addressLine && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: street,
        addressLocality: rest[0] ?? '',
        addressCountry: 'BZ',
      },
    }),
    ...(site.contact.email && { email: site.contact.email }),
    ...(site.contact.mapUrl && { hasMap: site.contact.mapUrl }),
    ...(contactPoint.length && { contactPoint }),
    ...(sameAs.length && { sameAs }),
    brand: { '@type': 'Brand', name: site.brandShort, logo: abs('/brand/cojacs-logo-square-512.jpg'), slogan: site.logoTagline },
    subjectOf: media
      .filter((m) => m.platform === 'youtube')
      .map((m) => ({ '@type': 'CreativeWork', name: `${site.brandName} — ${m.title}`, url: m.url, ...(m.publisher && { publisher: { '@type': 'Organization', name: m.publisher } }) })),
  };
}

export function website(): Json {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID(),
    url: `${origin()}/`,
    name: site.brandName,
    alternateName: [site.brandShort, `${site.brandShort} Rumpopo`],
    description: routes.home.description,
    inLanguage: 'en-BZ',
    publisher: { '@id': ORG_ID() },
  };
}

const pageTypes: Partial<Record<RouteKey, string>> = {
  story: 'AboutPage',
  contact: 'ContactPage',
  faqs: 'FAQPage',
  flavours: 'CollectionPage',
  gallery: 'CollectionPage',
  videos: 'CollectionPage',
};

function breadcrumb(key: RouteKey): Json | null {
  if (key === 'home') return null;
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl(key)}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin()}/` },
      { '@type': 'ListItem', position: 2, name: routes[key].nav, item: pageUrl(key) },
    ],
  };
}

function webpage(key: RouteKey): Json {
  const r = routes[key];
  const page: Json = {
    '@type': pageTypes[key] ?? 'WebPage',
    '@id': `${pageUrl(key)}#webpage`,
    url: pageUrl(key),
    name: r.title,
    description: r.description,
    inLanguage: 'en-BZ',
    isPartOf: { '@id': SITE_ID() },
    about: { '@id': ORG_ID() },
    primaryImageOfPage: { '@type': 'ImageObject', url: abs('/og-image.jpg') },
    ...(key !== 'home' && { breadcrumb: { '@id': `${pageUrl(key)}#breadcrumb` } }),
  };
  if (key === 'faqs') {
    page.mainEntity = publishedFaqs().map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    }));
  }
  if (key === 'flavours') {
    page.mainEntity = {
      '@type': 'ItemList',
      name: `${site.brandShort} rumpopo flavours`,
      itemListElement: getCatalogue().map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${pageUrl('flavours')}#${p.slug}`,
        name: p.name,
        ...(p.confirmedThisSeason && { item: product(p.id) }),
      })),
    };
  }
  if (key === 'videos' || key === 'home') {
    const videos = media.filter((m) => m.platform === 'youtube' && m.uploadDate && m.youtubeId);
    if (videos.length) {
      page.video = videos.map((m) => ({
        '@type': 'VideoObject',
        name: `${site.brandName} — ${m.title}`,
        description: `${m.title} — featuring ${site.brandName}.`,
        thumbnailUrl: m.thumbnail ? abs(m.thumbnail) : `https://i.ytimg.com/vi/${m.youtubeId}/hqdefault.jpg`,
        uploadDate: m.uploadDate,
        contentUrl: m.url,
        embedUrl: `https://www.youtube-nocookie.com/embed/${m.youtubeId}`,
        ...(m.publisher && { publisher: { '@type': 'Organization', name: m.publisher } }),
        about: { '@id': ORG_ID() },
      }));
    }
  }
  return page;
}

/** Product markup only for flavours the family has confirmed; offers only for approved prices. */
function product(id: string): Json | undefined {
  const p = getCatalogue().find((x) => x.id === id);
  if (!p || !p.confirmedThisSeason) return undefined;
  const offers = p.variants
    .filter((v) => v.priceBZD !== null && !v.illustrative)
    .map((v) => ({
      '@type': 'Offer',
      name: v.bottleSize,
      price: v.priceBZD!.toFixed(2),
      priceCurrency: 'BZD',
      // Stock status is only stated when the family marks it; "on-menu" makes no stock claim.
      ...(v.availability === 'sold-out' && { availability: 'https://schema.org/SoldOut' }),
      ...(v.availability === 'limited' && { availability: 'https://schema.org/LimitedAvailability' }),
      ...(v.availability === 'available' && { availability: 'https://schema.org/InStock' }),
      url: `${pageUrl('flavours')}#${p.slug}`,
      seller: { '@id': ORG_ID() },
      areaServed: 'BZ',
    }));
  return {
    '@type': 'Product',
    name: /rumpopo$/i.test(p.name) ? p.name : `${p.name} Rumpopo`,
    sku: p.id,
    description: p.description,
    brand: { '@id': ORG_ID() },
    category: 'Alcoholic beverage',
    ...(p.images[0] && { image: [abs(p.images[0].src), ...(p.images[0].mobileSrc ? [abs(p.images[0].mobileSrc)] : [])] }),
    ...(p.dietaryLabel && { additionalProperty: { '@type': 'PropertyValue', name: 'Dietary', value: p.dietaryLabel } }),
    ...(offers.length && { offers }),
  };
}

/** Full JSON-LD graph for one page. */
export function structuredDataFor(key: RouteKey): Json {
  const graph = [organization(), website(), webpage(key), breadcrumb(key)].filter(Boolean);
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function jsonLdScript(key: RouteKey): string {
  return `<script type="application/ld+json">${JSON.stringify(structuredDataFor(key)).replace(/</g, '\\u003c')}</script>`;
}
