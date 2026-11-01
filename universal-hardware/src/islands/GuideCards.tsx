/**
 * Picture cards and the WhatsApp handoff for Universal AI's replies. Loaded
 * with the assistant the first time its panel opens. Adding to the cart is
 * one tap and stays in this tab; the WhatsApp links only open WhatsApp with a
 * message ready: nothing is sent until the visitor presses send there.
 */
import { useState } from 'preact/hooks';
import type { GuideAction, GuideCard, Lang } from '../lib/guide/types';
import { PRODUCT_BY_ID, formatPrice, productTitle } from '../data/shop';
import { CATEGORY_BY_SLUG } from '../data/categories';
import { BRANDS } from '../data/brands';
import { BRAND_LOGOS, FEATURED_PHOTOS, type SiteImage } from '../data/site-images';
import { LISTED_MODELS } from '../data/live-site';
import { NEWS } from '../data/whats-new';
import { BRANCHES } from '../data/branches';
import { addRequest, addToCart } from '../lib/cart-store';
import { iconSvg, type IconName } from '../lib/icons';
import { assetUrl } from '../lib/asset-url';
import { SitePicture } from './SitePicture';

const Icon = ({ name, size = 16 }: { name: IconName; size?: number }) => (
  <span class="i" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSvg(name, size) }} />
);
const L = (lang: Lang, en: string, es: string) => (lang === 'es' ? es : en);
const COLOUR_ES: Record<string, string> = { Black: 'Negro', Blue: 'Azul', Red: 'Rojo', White: 'Blanco', Green: 'Verde' };

const HISUN_PHOTO: SiteImage = { src: 'site-images/products/hisun-utv.jpg', webp: 'site-images/products/hisun-utv.webp', width: 489, height: 288, alt: '', sourceUrl: '' };

/** Carry out the cart changes a reply asked for. */
export function runActions(actions: GuideAction[]) {
  for (const a of actions) {
    if (a.type === 'add') addToCart(a.id, a.qty, a.colour);
    else addRequest(a.text, a.qty);
  }
}

function ProductCard({ id, lang }: { id: string; lang: Lang }) {
  const p = PRODUCT_BY_ID[id];
  const [added, setAdded] = useState('');
  if (!p) return null;
  const title = productTitle(p);
  const add = (colour?: string) => {
    if (addToCart(p.id, 1, colour)) setAdded(colour ?? 'yes');
  };
  return (
    <li class="gcard">
      <a class="gcard__media" href={`/shop/${p.id}/`} tabIndex={-1} aria-hidden="true">
        <SitePicture image={p.image} decorative />
      </a>
      <div class="gcard__body">
        <a class="gcard__title" href={`/shop/${p.id}/`}>
          {title}
        </a>
        <span class="gcard__meta">{p.name}</span>
        <span class="gcard__price">{formatPrice(p.price)}</span>
      </div>
      {p.colours && p.colours.length > 1 ? (
        <div class="gcard__colours" role="group" aria-label={`Add ${title} to cart in`}>
          {p.colours.map((c) => (
            <button type="button" class={`gcard__colour${added === c ? ' is-added' : ''}`} onClick={() => add(c)} aria-label={`Add ${title} in ${c} to cart`}>
              {added === c ? <Icon name="check" size={12} /> : <Icon name="plus" size={12} />} {lang === 'es' ? COLOUR_ES[c] ?? c : c}
            </button>
          ))}
        </div>
      ) : (
        <button type="button" class={`gcard__add${added ? ' is-added' : ''}`} onClick={() => add()} aria-label={`Add ${title} to cart`}>
          <Icon name={added ? 'check' : 'cart'} size={14} /> {added ? L(lang, 'Added', 'Agregado') : L(lang, 'Add', 'Agregar')}
        </button>
      )}
    </li>
  );
}

function CategoryCard({ slug }: { slug: string }) {
  const c = CATEGORY_BY_SLUG[slug];
  const photo = FEATURED_PHOTOS[slug];
  if (!c) return null;
  return (
    <li class="gcard gcard--link">
      <a class="gcard__media" href={`/products/${slug}/`} tabIndex={-1} aria-hidden="true">
        {photo && <SitePicture image={photo} decorative />}
      </a>
      <div class="gcard__body">
        <a class="gcard__title" href={`/products/${slug}/`}>
          {c.name}
        </a>
        <span class="gcard__meta">{c.subcategories.slice(0, 3).map((x) => x.name).join(' · ')}</span>
      </div>
    </li>
  );
}

function BrandCard({ id }: { id: string }) {
  const b = BRANDS.find((x) => x.id === id);
  if (!b) return null;
  const logo = BRAND_LOGOS[id];
  return (
    <li class="gcard gcard--brand">
      <a class="gcard__media gcard__media--logo" href={`/brands/#${id}`} tabIndex={-1} aria-hidden="true">
        {logo ? <img src={assetUrl(logo.src)} width={logo.width} height={logo.height} alt="" loading="lazy" decoding="async" /> : <span class="gcard__initial">{b.name.charAt(0)}</span>}
      </a>
      <div class="gcard__body">
        <a class="gcard__title" href={`/brands/#${id}`}>
          {b.name}
        </a>
        <span class="gcard__meta">{b.focus}</span>
      </div>
    </li>
  );
}

function ListedCard({ model, lang }: { model: string; lang: Lang }) {
  const m = LISTED_MODELS.find((x) => x.model === model);
  const [added, setAdded] = useState(false);
  if (!m) return null;
  const photo = m.brand === 'Hisun' ? HISUN_PHOTO : /cutter/i.test(m.type) ? FEATURED_PHOTOS['lawn-and-garden'] : FEATURED_PHOTOS.motorcycles;
  const name = `${m.brand} ${m.model}`;
  return (
    <li class="gcard" data-i18n-skip>
      <span class="gcard__media" aria-hidden="true">
        {photo && <SitePicture image={photo} decorative />}
      </span>
      <div class="gcard__body">
        <span class="gcard__title">{name}</span>
        <span class="gcard__meta">{lang === 'es' ? m.typeEs : m.type}</span>
        <span class="gcard__price">{L(lang, `Listed at $${m.price}`, `Publicado a $${m.price}`)}</span>
      </div>
      <button
        type="button"
        class={`gcard__add${added ? ' is-added' : ''}`}
        onClick={() => addRequest(name, 1) && setAdded(true)}
        aria-label={L(lang, `Add ${name} to cart as a request`, `Agregar ${name} al carrito como solicitud`)}
      >
        <Icon name={added ? 'check' : 'plus'} size={14} /> {added ? L(lang, 'Requested', 'Solicitado') : L(lang, 'Add as request', 'Agregar como solicitud')}
      </button>
    </li>
  );
}

function EventCard({ id, lang }: { id: string; lang: Lang }) {
  const n = NEWS.find((x) => x.id === id);
  if (!n) return null;
  return (
    <li class="gcard gcard--link gcard--event" data-i18n-skip>
      <a class="gcard__media gcard__media--flyer" href={`/whats-new/#${n.id}`} tabIndex={-1} aria-hidden="true">
        <SitePicture image={n.image} decorative />
      </a>
      <div class="gcard__body">
        <a class="gcard__title" href={`/whats-new/#${n.id}`}>
          {n.title}
        </a>
        <span class="gcard__meta">{lang === 'es' ? n.es.when : n.when}</span>
      </div>
    </li>
  );
}

export function GuideCards({ cards, lang }: { cards: GuideCard[]; lang: Lang }) {
  return (
    <ul class="gcards" aria-label={L(lang, 'Suggestions with pictures', 'Sugerencias con imágenes')}>
      {cards.map((c) =>
        c.kind === 'product' ? (
          <ProductCard id={c.id} lang={lang} key={`p-${c.id}`} />
        ) : c.kind === 'category' ? (
          <CategoryCard slug={c.slug} key={`c-${c.slug}`} />
        ) : c.kind === 'brand' ? (
          <BrandCard id={c.id} key={`b-${c.id}`} />
        ) : c.kind === 'listed' ? (
          <ListedCard model={c.model} lang={lang} key={`l-${c.model}`} />
        ) : (
          <EventCard id={c.id} lang={lang} key={`e-${c.id}`} />
        ),
      )}
    </ul>
  );
}

/** WhatsApp handoff: opens WhatsApp to a branch with the conversation summarised. */
export function Handoff({ kind, lang, summary, cart }: { kind: 'sales' | 'service'; lang: Lang; summary: string[]; cart: string[] }) {
  const lines = (b: (typeof BRANCHES)[number]) => b.whatsapp[kind === 'service' ? 1 : 0];
  const message = L(
    lang,
    `Hi Universal Hardware! I was chatting with Universal AI on your website.${summary.length ? `\nI asked about: ${summary.join(' / ')}` : ''}${cart.length ? `\nMy cart: ${cart.join('; ')}` : ''}\nCan you help me?`,
    `¡Hola, Universal Hardware! Estuve conversando con Universal AI en su sitio web.${summary.length ? `\nPregunté por: ${summary.join(' / ')}` : ''}${cart.length ? `\nMi carrito: ${cart.join('; ')}` : ''}\n¿Me pueden ayudar?`,
  ).slice(0, 900);
  return (
    <div class="handoff" data-i18n-skip>
      {BRANCHES.map((b) => (
        <a class="handoff__btn" href={`https://wa.me/${lines(b).wa}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener" data-handoff={b.id} key={b.id}>
          <Icon name="whatsapp" size={20} />
          <span>
            <strong>{b.name}</strong>
            <small>
              {kind === 'service' ? L(lang, 'Service Center', 'Centro de servicio') : L(lang, 'Sales', 'Ventas')} · {lines(b).display}
            </small>
          </span>
        </a>
      ))}
      <p class="handoff__note">{L(lang, 'Opens WhatsApp with your message ready. Nothing is sent until you press send.', 'Abre WhatsApp con su mensaje listo. No se envía nada hasta que presione enviar.')}</p>
    </div>
  );
}
