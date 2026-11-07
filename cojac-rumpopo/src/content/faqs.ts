/**
 * FAQs. Only entries with `published: true` appear on the site.
 * Draft entries are question stubs waiting for an approved answer from the family —
 * write the answer, then switch `published` to true.
 * Each text is written t('English', 'Español').
 */
import type { FaqItem } from '../types';
import { site } from './site';
import { formatLongDate } from '../lib/season';
import { getCatalogue, lowestPrice, sizeNames } from './catalogue';
import { t } from '../i18n/lang';

const menu = getCatalogue();
const shortName = (name: string) => name.replace(/ Rumpopo$/, '');
const and = t(' and ', ' y ');
const listText = (xs: string[]) => xs.join(', ').replace(/, ([^,]*)$/, `${and}$1`);
const priceLines = menu
  .map((p) => `${shortName(p.name)}: ${p.variants.map((v) => `${v.bottleSize.split(' (')[0].toLowerCase()} BZD $${v.priceBZD}`).join(', ')}`)
  .join('; ');
const from = lowestPrice();

// Answers below are built from the verified settings in site.ts, so they stay
// consistent with the rest of the website (and with what AI assistants read).
const on = (id: string) => site.fulfilment.some((f) => f.id === id && f.enabled);
const fulfilmentList = listText(
  [
    on('delivery') && t('delivery within Belize City limits', 'entrega dentro de los límites de la Ciudad de Belice'),
    on('pickup') && t('pickup (no charge)', 'la opción de recoger (sin costo)'),
    on('shipping') && t('shipping to other districts', 'envíos a otros distritos'),
  ].filter((x): x is string => !!x),
);

export const faqs: FaqItem[] = [
  {
    id: 'what-is-rumpopo',
    category: 'general',
    published: true,
    question: t('What is rumpopo?', '¿Qué es el rumpopo?'),
    answer: t(
      'Rumpopo (also spelled rum popo) is a rich, creamy holiday drink that contains alcohol. In Belize it’s a much-loved part of Christmas: the bottle brought out when family visits, the gift shared between friends and colleagues, and the drink poured at workplace celebrations.',
      'El rumpopo (también escrito rum popo) es una bebida navideña rica y cremosa que contiene alcohol, pariente del rompope. En Belice es una parte muy querida de la Navidad: la botella que se saca cuando llega la familia, el regalo que se comparte entre amigos y compañeros, y la bebida que se sirve en las celebraciones del trabajo.',
    ),
  },
  {
    id: 'rumpopo-or-rum-popo',
    category: 'general',
    published: true,
    question: t('Is it “rumpopo” or “rum popo”?', '¿Se dice “rumpopo” o “rum popo”?'),
    answer: t(
      'Both. Rumpopo and rum popo are two spellings of the same festive drink. Our brand name is Cojac’s Sumptuous Rumpopo.',
      'Las dos. Rumpopo y rum popo son dos formas de escribir la misma bebida festiva. Nuestra marca es Cojac’s Sumptuous Rumpopo.',
    ),
  },
  {
    id: 'who-is-cojacs',
    category: 'general',
    published: true,
    question: t('Who makes Cojac’s Sumptuous Rumpopo?', '¿Quién hace Cojac’s Sumptuous Rumpopo?'),
    answer: t(
      `Cojac’s is a Belizean family business based on ${site.contact.addressLine}. Our story began with a family recipe and a love for good rumpopo, and the family has been sharing its rumpopo for ${site.experienceStatement}.`,
      `Cojac’s es un negocio familiar beliceño ubicado en ${site.contact.addressLine}. Nuestra historia empezó con una receta familiar y el amor por un buen rumpopo, y la familia lleva ${site.experienceStatement} compartiendo su rumpopo.`,
    ),
  },
  {
    id: 'what-makes-it-different',
    category: 'general',
    published: true,
    question: t('What makes Cojac’s rumpopo different?', '¿Qué hace diferente al rumpopo Cojac’s?'),
    answer: t(
      'The Cojac’s Guarantee: rich and creamy (never thin or watered down), no eggy taste, filled to the top, and more than just Classic Vanilla, with customer favourites like Peanut Delight and Pumpkin Spice alongside seasonal creations and new releases.',
      'La garantía Cojac’s: rico y cremoso (nunca ralo ni aguado), sin sabor a huevo, lleno hasta el tope y mucho más que vainilla clásica, con favoritos de los clientes como Peanut Delight y Pumpkin Spice junto a creaciones de temporada y nuevos lanzamientos.',
    ),
  },
  {
    id: 'when-to-order',
    category: 'ordering',
    published: true,
    question: t('When can I order Cojac’s rumpopo?', '¿Cuándo puedo pedir rumpopo Cojac’s?'),
    answer: t(
      `Rumpopo is a seasonal Christmas treat. This season, order requests are open until ${formatLongDate(site.season.seasonClosesOn)}.`,
      `El rumpopo es un gusto navideño de temporada. Esta temporada, los pedidos están abiertos hasta el ${formatLongDate(site.season.seasonClosesOn)}.`,
    ),
  },
  {
    id: 'delivery-areas',
    category: 'delivery',
    published: !!fulfilmentList,
    question: t('Do you deliver, ship or offer pickup?', '¿Hacen entregas, envíos o se puede recoger?'),
    answer: t(
      `Yes. Cojac’s offers ${fulfilmentList}. Delivery and shipping each carry a charge, confirmed with you on WhatsApp along with timing; pickup is free.`,
      `Sí. Cojac’s ofrece ${fulfilmentList}. La entrega y el envío tienen un costo, que se confirma contigo por WhatsApp junto con los tiempos; recoger es gratis.`,
    ),
  },
  {
    id: 'how-to-order',
    category: 'ordering',
    published: true,
    question: t('How do I place an order?', '¿Cómo hago un pedido?'),
    answer: t(
      'Choose your flavours on the Find Your Flavour page, select quantities and add them to your order. Review your order request, then tap “Send Order Request on WhatsApp”. WhatsApp opens with your request ready. Press Send, and Cojac’s will confirm the details with you directly.',
      'Elige tus sabores en la página Encuentra tu sabor, selecciona las cantidades y añádelos a tu pedido. Revisa tu pedido y toca “Enviar pedido por WhatsApp”. WhatsApp se abre con tu pedido listo. Presiona Enviar y Cojac’s confirmará los detalles directamente contigo.',
    ),
  },
  {
    id: 'is-order-confirmed',
    category: 'ordering',
    published: true,
    question: t('Is my order confirmed once WhatsApp opens?', '¿Mi pedido queda confirmado cuando se abre WhatsApp?'),
    answer: t(
      'Not yet. The website prepares your order request; you still need to press Send in WhatsApp. Cojac’s will then confirm availability, the final total, payment arrangements and delivery or pickup details with you.',
      'Todavía no. El sitio web prepara tu pedido; aún debes presionar Enviar en WhatsApp. Luego Cojac’s confirmará contigo la disponibilidad, el total final, la forma de pago y los detalles de entrega o recogida.',
    ),
  },
  {
    id: 'pay-online',
    category: 'ordering',
    published: true,
    question: t('Can I pay on the website?', '¿Puedo pagar en el sitio web?'),
    answer: t(
      'No. There is no online card payment on this website and we will never ask for card details here. You pay cash on delivery (or at pickup), or by bank transfer from your own banking app.',
      'No. Este sitio web no tiene pago con tarjeta y nunca te pediremos datos de tarjeta aquí. Pagas en efectivo contra entrega (o al recoger), o por transferencia bancaria desde la app de tu banco.',
    ),
  },
  {
    id: 'no-whatsapp',
    category: 'ordering',
    published: true,
    question: t('What if WhatsApp doesn’t open?', '¿Y si WhatsApp no se abre?'),
    answer: t(
      'Use the “Copy order details” button on the order page and paste your request into a WhatsApp chat with Cojac’s. If you are on a computer without WhatsApp installed, WhatsApp Web will open instead.',
      'Usa el botón “Copiar detalles del pedido” en la página de pedidos y pega tu pedido en un chat de WhatsApp con Cojac’s. Si estás en una computadora sin WhatsApp instalado, se abrirá WhatsApp Web.',
    ),
  },
  {
    id: 'flavours-this-season',
    category: 'product',
    published: true,
    question: t('Which rumpopo flavours are on the menu this season?', '¿Qué sabores de rumpopo hay en el menú esta temporada?'),
    answer: t(
      `This season’s menu has ${menu.length} flavours: ${listText(menu.map((p) => shortName(p.name)))}. Cojac’s confirms availability when you send your order request.`,
      `El menú de esta temporada tiene ${menu.length} sabores: ${listText(menu.map((p) => shortName(p.name)))}. Cojac’s confirma la disponibilidad cuando envías tu pedido.`,
    ),
  },
  {
    id: 'contains-alcohol',
    category: 'product',
    published: true,
    question: t('Does rumpopo contain alcohol?', '¿El rumpopo contiene alcohol?'),
    answer: t(
      'Yes. Our rumpopo contains alcohol and is for adults of legal drinking age only. Please enjoy responsibly.',
      'Sí. Nuestro rumpopo contiene alcohol y es solo para adultos mayores de edad. Disfrútalo con responsabilidad.',
    ),
  },
  {
    id: 'eggy',
    category: 'product',
    published: true,
    question: t('Does it taste eggy?', '¿Sabe a huevo?'),
    answer: t('Rumpopo may contain eggs, but it should never taste eggy. Ours doesn’t.', 'El rumpopo puede contener huevo, pero nunca debería saber a huevo. El nuestro no.'),
  },
  {
    id: 'allergies',
    category: 'product',
    published: true,
    question: t('I have a food allergy. Is rumpopo safe for me?', 'Tengo una alergia alimentaria. ¿El rumpopo es seguro para mí?'),
    answer: t(
      'Rumpopo may contain eggs and dairy, and some flavours may contain other allergens such as nuts. Please ask Cojac’s on WhatsApp about the ingredients of any flavour before ordering.',
      'El rumpopo puede contener huevo y lácteos, y algunos sabores pueden contener otros alérgenos, como nueces o maní. Pregúntale a Cojac’s por WhatsApp sobre los ingredientes de cualquier sabor antes de pedir.',
    ),
  },
  {
    id: 'sizes',
    category: 'product',
    published: true,
    question: t('What bottle sizes do you offer?', '¿Qué tamaños de botella ofrecen?'),
    answer: t(`Every flavour comes in two sizes: ${listText(sizeNames)}.`, `Cada sabor viene en dos tamaños: ${listText(sizeNames)}.`),
  },
  {
    id: 'prices',
    category: 'product',
    published: from !== null,
    question: t('How much does a bottle of Cojac’s rumpopo cost?', '¿Cuánto cuesta una botella de rumpopo Cojac’s?'),
    answer: t(
      `Prices start from BZD $${from} for a half liter. This season’s prices (half liter, liter): ${priceLines}. Delivery in Belize City is BZD $5, pickup is free, and shipping charges are confirmed on WhatsApp.`,
      `Los precios empiezan desde BZD $${from} por medio litro. Precios de esta temporada (medio litro, litro): ${priceLines}. La entrega en la Ciudad de Belice cuesta BZD $5, recoger es gratis y el costo de envío se confirma por WhatsApp.`,
    ),
  },

  // ── Draft stubs: awaiting approved answers from the family ────────────────
  { id: 'lead-time', category: 'ordering', published: false, question: t('How far in advance should I order?', '¿Con cuánta anticipación debo pedir?'), answer: '' },
  { id: 'delivery-fees', category: 'delivery', published: false, question: t('How much is delivery or shipping?', '¿Cuánto cuesta la entrega o el envío?'), answer: '' },
  { id: 'shipping-areas', category: 'delivery', published: false, question: t('Where do you ship?', '¿A dónde hacen envíos?'), answer: '' },
  { id: 'pickup', category: 'delivery', published: false, question: t('Can I pick up my order?', '¿Puedo recoger mi pedido?'), answer: '' },
  {
    id: 'payment-methods',
    category: 'ordering',
    published: true,
    question: t('How can I pay?', '¿Cómo puedo pagar?'),
    answer: t(
      'Cash on delivery for Belize City delivery, cash at pickup, or bank transfer from Heritage Bank, Belize Bank or Atlantic Bank. Shipping orders to other districts are paid by bank transfer. Transfers go to Cojac’s Atlantic Bank account, shown at checkout (from Heritage Bank or Belize Bank, send it as a transfer to another bank in Belize). Then send a screenshot of the completed transfer in the WhatsApp chat: your order is placed once Cojac’s receives it.',
      'Efectivo contra entrega para entregas en la Ciudad de Belice, efectivo al recoger, o transferencia bancaria desde Heritage Bank, Belize Bank o Atlantic Bank. Los pedidos con envío a otros distritos se pagan por transferencia bancaria. Las transferencias van a la cuenta de Cojac’s en Atlantic Bank, que se muestra al finalizar el pedido (desde Heritage Bank o Belize Bank, envíala como transferencia a otro banco en Belice). Luego envía una captura de la transferencia completada en el chat de WhatsApp: tu pedido queda hecho cuando Cojac’s la recibe.',
    ),
  },
  { id: 'storage', category: 'product', published: false, question: t('How should I store my rumpopo, and how long does it keep?', '¿Cómo debo guardar mi rumpopo y cuánto dura?'), answer: '' },
  { id: 'gifting', category: 'general', published: false, question: t('Do you offer gift packaging or bulk orders?', '¿Ofrecen empaque de regalo o pedidos al por mayor?'), answer: '' },
  { id: 'refunds', category: 'general', published: false, question: t('What is your policy if something is wrong with my order?', '¿Cuál es su política si algo sale mal con mi pedido?'), answer: '' },
];

export const publishedFaqs = () => faqs.filter((f) => f.published && f.answer.trim());
