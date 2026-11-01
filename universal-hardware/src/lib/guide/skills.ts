/**
 * Universal AI's extra skills, tried before the topic guides: the cart,
 * adding to the cart, WhatsApp handoff, air conditioner sizing, model specs
 * and listed prices from the live site, brands, holidays, open now, jobs,
 * parts catalogues and contact details. Each returns a reply or null.
 * Everything is local: no network request, no model.
 */
import type { GuideCard, GuideContext, GuideReply, GuideState, Lang } from './types';
import { PRODUCT_BY_ID, formatPrice, productTitle, type ShopProduct } from '../../data/shop';
import { BRANCH_BY_ID, BRANCHES, type BranchId } from '../../data/branches';
import { BRANDS } from '../../data/brands';
import { CATEGORIES } from '../../data/categories';
import { BRAND_FACTS, COMPANY, HISUN, HOLIDAYS, LISTED_MODELS, MEILUN_PRODUCTS, PARTS_CATALOGUES, type ListedModel } from '../../data/live-site';
import { acSizing, compact, isAcQuestion, isAddIntent, isCartView, openStatus, parseColour, parseQty, requestText, resolveProduct } from './smarts';
import { searchCategories, tokens } from '../search';

const L = (lang: Lang, en: string, es: string) => (lang === 'es' ? es : en);
const has = (t: string, ...re: RegExp[]) => re.some((r) => r.test(t));
const COLOUR_ES: Record<string, string> = { Black: 'negro', Blue: 'azul', Red: 'rojo', White: 'blanco', Green: 'verde' };
const colourWord = (c: string, lang: Lang) => (lang === 'es' ? COLOUR_ES[c] ?? c : c.toLowerCase());
const productCards = (ps: ShopProduct[], n = 6): GuideCard[] => ps.slice(0, n).map((p) => ({ kind: 'product', id: p.id }));
const salePrice = (p: ShopProduct, lang: Lang) =>
  L(lang, `${formatPrice(p.price)} (February 2026 sale price)`, `${formatPrice(p.price)} (precio de oferta de febrero de 2026)`);
const listedLine = (m: ListedModel, lang: Lang) =>
  L(lang, `**${m.brand} ${m.model}**: ${m.type}, listed on Universal's website at $${m.price}`, `**${m.brand} ${m.model}**: ${m.typeEs}, publicado en el sitio de Universal a $${m.price}`);
const cartLink = (lang: Lang) => ({ label: L(lang, 'View cart', 'Ver carrito'), href: '/cart/' });
const checkoutLink = (lang: Lang) => ({ label: L(lang, 'Checkout', 'Pagar'), href: '/checkout/' });
const shopProductFor = (m: ListedModel) => Object.values(PRODUCT_BY_ID).find((p) => p.model === m.model);

type Skill = (t: string, s: GuideState, ctx: GuideContext) => GuideReply | null;

/* ---------------- Cart ---------------- */

const cartView: Skill = (t, s, ctx) => {
  if (!isCartView(t)) return null;
  const lang = s.lang;
  const lines = ctx.cart ?? [];
  if (!lines.length)
    return {
      text: L(lang, 'Your cart is empty. Tell me what you need, for example "add the Makita HP333DYX3B", or search for anything and I can add it.', 'Su carrito está vacío. Dígame qué necesita, por ejemplo "agregue el Makita HP333DYX3B", o busque cualquier artículo y lo agrego.'),
      links: [{ label: L(lang, 'Browse the Shop', 'Ver la Tienda'), href: '/shop/' }],
    };
  let total = 0;
  const rows = lines.map((l) => {
    if (l.kind === 'request') return L(lang, `• ${l.qty} × ${l.text} (requested, price to be confirmed)`, `• ${l.qty} × ${l.text} (solicitado, precio por confirmar)`);
    const p = PRODUCT_BY_ID[l.id!];
    if (!p) return '';
    total += p.price * l.qty;
    return `• ${l.qty} × ${productTitle(p)}${l.colour ? ` (${colourWord(l.colour, lang)})` : ''}: ${formatPrice(p.price * l.qty)}`;
  });
  s.lastShown = lines.filter((l) => l.kind !== 'request' && l.id).map((l) => l.id!);
  return {
    text: L(lang, `Here's your cart:\n${rows.join('\n')}\n\nTotal for priced items: **${formatPrice(total)}**. Collect at Spanish Lookout or Belize City.`, `Este es su carrito:\n${rows.join('\n')}\n\nTotal de los artículos con precio: **${formatPrice(total)}**. Se recoge en Spanish Lookout o Ciudad de Belice.`),
    links: [cartLink(lang), checkoutLink(lang)],
  };
};

const addToCart: Skill = (t, s) => {
  if (!isAddIntent(t)) return null;
  const lang = s.lang;
  const qty = parseQty(t);
  const colour = parseColour(t);
  const r = resolveProduct(t, s.lastShown);
  const p = r.product ?? (r.listed ? shopProductFor(r.listed) : undefined);
  if (p) {
    s.lastShown = [p.id];
    if (p.colours && p.colours.length > 1) {
      if (!colour || !p.colours.includes(colour)) {
        return {
          text: L(
            lang,
            `${colour ? `The ${productTitle(p)} isn't listed in ${colourWord(colour, lang)}. ` : ''}Which colour would you like for the **${productTitle(p)}**? It comes in ${p.colours.map((c) => colourWord(c, lang)).join(', ')}. Tap one below to add it.`,
            `${colour ? `El ${productTitle(p)} no aparece en ${colourWord(colour, lang)}. ` : ''}¿De qué color quiere el **${productTitle(p)}**? Viene en ${p.colours.map((c) => colourWord(c, lang)).join(', ')}. Toque uno abajo para agregarlo.`,
          ),
          cards: [{ kind: 'product', id: p.id }],
        };
      }
    }
    const c = colour && p.colours?.includes(colour) ? colour : p.colours?.length === 1 ? p.colours[0] : undefined;
    return {
      text: L(
        lang,
        `Done: I added ${qty} × **${productTitle(p)}**${c ? ` in ${colourWord(c, lang)}` : ''} to your cart, at ${salePrice(p, lang)} each. You can check out for collection at either branch.`,
        `Listo: agregué ${qty} × **${productTitle(p)}**${c ? ` en ${colourWord(c, lang)}` : ''} a su carrito, a ${salePrice(p, lang)} cada uno. Puede pagar y recoger en cualquiera de las dos sucursales.`,
      ),
      actions: [{ type: 'add', id: p.id, qty, colour: c }],
      cards: [{ kind: 'product', id: p.id }],
      links: [cartLink(lang), checkoutLink(lang)],
    };
  }
  if (r.listed) {
    const m = r.listed;
    const text = `${m.brand} ${m.model}`;
    return {
      text: L(
        lang,
        `The **${text}** (${m.type}) isn't in the online Shop, so I added it to your cart as a request. Universal's website lists it at $${m.price}; the branch confirms today's price and availability before you pay.`,
        `El **${text}** (${m.typeEs}) no está en la Tienda en línea, así que lo agregué a su carrito como solicitud. El sitio de Universal lo publica a $${m.price}; la sucursal confirma el precio y la disponibilidad de hoy antes de que pague.`,
      ),
      actions: [{ type: 'request', text, qty }],
      cards: [{ kind: 'listed', model: m.model }],
      links: [cartLink(lang)],
    };
  }
  if (r.candidates.length > 1) {
    s.lastShown = r.candidates.slice(0, 6).map((x) => x.id);
    return {
      text: L(lang, `I found ${r.candidates.length} matches. Which one would you like? Tap Add on the right one, or tell me the model.`, `Encontré ${r.candidates.length} opciones. ¿Cuál quiere? Toque Agregar en la correcta o dígame el modelo.`),
      cards: productCards(r.candidates),
    };
  }
  const generic = tokens(r.text).length <= 1 ? searchCategories(r.text).find((h) => h.score > 0) : undefined;
  if (generic) {
    const c = generic.category;
    return {
      text: L(
        lang,
        `Which ${r.text} would you like? Universal carries ${c.name.toLowerCase()} such as ${c.subcategories.slice(0, 4).map((x) => x.name.toLowerCase()).join(', ')}. Tell me the type, size or brand, and I'll add it to your cart as a request for the branch to price.`,
        `¿Qué ${r.text} quiere? Universal tiene ${c.name} como ${c.subcategories.slice(0, 4).map((x) => x.name).join(', ')}. Dígame el tipo, tamaño o marca, y lo agrego a su carrito como solicitud para que la sucursal le dé precio.`,
      ),
      cards: [{ kind: 'category', slug: c.slug }],
    };
  }
  const item = requestText(t) || r.text;
  if (item.length >= 2) {
    return {
      text: L(
        lang,
        `"${item}" isn't in the online Shop yet, so I added it to your cart as a request (${qty}). The branch confirms the price and availability before you pay for it.`,
        `"${item}" aún no está en la Tienda en línea, así que lo agregué a su carrito como solicitud (${qty}). La sucursal confirma el precio y la disponibilidad antes de que lo pague.`,
      ),
      actions: [{ type: 'request', text: item, qty }],
      links: [cartLink(lang)],
    };
  }
  return {
    text: L(lang, 'What would you like me to add? Tell me the product or model, for example "add the Lifan LF100-A in red".', '¿Qué quiere que agregue? Dígame el producto o el modelo, por ejemplo "agregue la Lifan LF100-A en rojo".'),
  };
};

/* ---------------- WhatsApp handoff ---------------- */

const handoff: Skill = (t, s) => {
  if (!has(t, /(talk|speak|chat) (to|with) (a |an |someone|somebody|person|human|agent|sales|staff|rep|representative)/, /(real|live) (person|human|agent)/, /human|agent|representative|customer service/, /whatsapp (me|them|sales|the branch|a person)?$/, /(contact|message) (sales|the branch|a person|someone)/, /hablar con (alguien|una persona|un agente|ventas)/, /persona real/, /atencion al cliente/))
    return null;
  const lang = s.lang;
  const service = has(t, /service|repair|parts|servicio|reparac|repuesto/);
  return {
    text: L(
      lang,
      `Of course. Tap a branch below to open WhatsApp with a summary of our chat ready to send to the ${service ? 'Service Center' : 'sales team'}. Nothing is sent until you press send in WhatsApp.`,
      `Claro. Toque una sucursal abajo para abrir WhatsApp con un resumen de nuestra conversación listo para enviar al ${service ? 'centro de servicio' : 'equipo de ventas'}. No se envía nada hasta que usted presione enviar en WhatsApp.`,
    ),
    handoff: service ? 'service' : 'sales',
  };
};

/* ---------------- Air conditioners ---------------- */

const airCon: Skill = (t, s) => {
  const lang = s.lang;
  if (has(t, /inverter/) && has(t, /(vs|versus|or|regular|standard|normal|difference|what is|what s|better|diferencia|que es|mejor|o )/)) {
    return {
      text: L(
        lang,
        "From Sankey's guidance on Universal's site: **inverter** air conditioners cost more to buy but are about 30% more efficient to run, so they're usually better value overall. They reach the set temperature faster, then vary their speed to hold it, and run quieter, which matters at night. A **fixed-speed** unit switches on and off at full power to hold the temperature.\n\nTo get the savings: size the unit right for the room, and leave it running at your comfort setting (for example 21 °C) rather than at full cooling.",
        'Según la guía de Sankey en el sitio de Universal: los aires **inverter** cuestan más al comprarlos, pero son cerca de un 30% más eficientes, así que suelen salir mejor en general. Alcanzan la temperatura más rápido, luego ajustan su velocidad para mantenerla, y son más silenciosos, algo importante de noche. Un equipo de **velocidad fija** se enciende y apaga a plena potencia para mantener la temperatura.\n\nPara ahorrar: elija el tamaño correcto para el cuarto y déjelo funcionando a su temperatura de confort (por ejemplo 21 °C) en lugar de al máximo.',
      ),
      cards: [{ kind: 'brand', id: 'sankey' }, { kind: 'category', slug: 'household' }],
    };
  }
  const continuing = s.topic === 'ac' && !!acSizing(t);
  if (!isAcQuestion(t) && !continuing) return null;
  const a = acSizing(t);
  if (!a) {
    s.topic = 'ac';
    return {
      text: L(
        lang,
        "I can size an air conditioner with Sankey's chart from Universal's website. What size is the room? For example \"12 by 14 feet\", \"4 x 5 metres\" or \"200 square feet\". Tell me too if it's very sunny, shaded, a kitchen, or regularly has more than two people.",
        'Puedo calcular el tamaño del aire acondicionado con la tabla de Sankey del sitio de Universal. ¿Qué medidas tiene el cuarto? Por ejemplo "12 por 14 pies", "4 x 5 metros" o "200 pies cuadrados". Dígame también si es muy soleado, con sombra, una cocina o si suele haber más de dos personas.',
      ),
      chips: L(lang, '12 by 14 feet bedroom|4 x 5 metres, very sunny|Kitchen, 150 square feet', 'Cuarto de 12 por 14 pies|4 x 5 metros, muy soleado|Cocina de 150 pies cuadrados').split('|'),
    };
  }
  const changed = a.adjusted !== a.base;
  s.topic = undefined;
  return {
    text: L(
      lang,
      `For about **${a.sqft} square feet**, Sankey's chart on Universal's website gives **${a.base.toLocaleString('en-US')} BTU per hour**.${changed ? ` Adjusted for ${a.notes.map((n) => n[0]).join(', ')}: about **${a.adjusted.toLocaleString('en-US')} BTU**.` : ''}\n\nChoose the nearest standard size at or above that. A unit that's too big cools fast but leaves the room damp and wastes energy. Inverter models cost more but run about 30% more efficiently. The branch can confirm which Sankey sizes are in stock.`,
      `Para unos **${a.sqft} pies cuadrados**, la tabla de Sankey del sitio de Universal indica **${a.base.toLocaleString('en-US')} BTU por hora**.${changed ? ` Ajustado por ${a.notes.map((n) => n[1]).join(', ')}: unos **${a.adjusted.toLocaleString('en-US')} BTU**.` : ''}\n\nElija el tamaño estándar más cercano igual o superior. Un equipo demasiado grande enfría rápido pero deja el cuarto húmedo y gasta más energía. Los modelos inverter cuestan más pero son cerca de un 30% más eficientes. La sucursal puede confirmar qué tamaños Sankey hay disponibles.`,
    ),
    cards: [{ kind: 'brand', id: 'sankey' }, { kind: 'category', slug: 'household' }],
  };
};

/* ---------------- Models: specs and listed prices ---------------- */

const modelInfo: Skill = (t, s) => {
  const lang = s.lang;
  const r = resolveProduct(t, []);
  // Only when the message names a model code (or asks about price or specs of one product).
  const named = r.listed || (r.product && compact(t).includes(compact(r.product.model)));
  const asks = /(price|cost|how much|spec|detail|tell me|about|fuel|tank|brake|consum|precio|cuanto|cuesta|caracteristic|info|consumo|tanque|freno)/.test(t);
  if (!named && !(r.product && asks)) return null;
  const m = r.listed ?? (r.product ? LISTED_MODELS.find((x) => x.model === r.product!.model) : undefined);
  const p = r.product ?? (m ? shopProductFor(m) : undefined);
  if (!m && p) {
    s.lastShown = [p.id];
    return {
      text: L(lang, `**${productTitle(p)}**: ${p.name}. In the Shop at ${salePrice(p, lang)}${p.colours ? `, in ${p.colours.map((c) => colourWord(c, lang)).join(', ')}` : ''}. Tap Add to put it in your cart.`, `**${productTitle(p)}**: ${p.name}. En la Tienda a ${salePrice(p, lang)}${p.colours ? `, en ${p.colours.map((c) => colourWord(c, lang)).join(', ')}` : ''}. Toque Agregar para ponerlo en su carrito.`),
      cards: [{ kind: 'product', id: p.id }],
    };
  }
  if (!m) return null;
  const specs = lang === 'es' ? m.specsEs : m.specs;
  if (p) s.lastShown = [p.id];
  return {
    text: L(
      lang,
      `${listedLine(m, lang)}.${specs?.length ? `\n${specs.map((x) => `• ${x}`).join('\n')}` : ''}${p ? `\n\nIt's also in the online Shop at ${salePrice(p, lang)}.` : '\n\nIt isn\'t in the online Shop, but I can add it to your cart as a request.'}\n\nThe branch confirms today's price and availability.`,
      `${listedLine(m, lang)}.${specs?.length ? `\n${specs.map((x) => `• ${x}`).join('\n')}` : ''}${p ? `\n\nTambién está en la Tienda en línea a ${salePrice(p, lang)}.` : '\n\nNo está en la Tienda en línea, pero puedo agregarlo a su carrito como solicitud.'}\n\nLa sucursal confirma el precio y la disponibilidad de hoy.`,
    ),
    cards: p ? [{ kind: 'product', id: p.id }] : [{ kind: 'listed', model: m.model }],
    chips: p ? undefined : [L(lang, `Add the ${m.model} to my cart`, `Agregue la ${m.model} a mi carrito`)],
    handoff: 'sales',
  };
};

const hisun: Skill = (t, s) => {
  if (!has(t, /hisun/, /\butv\b/, /\batv\b/, /side ?by ?side/, /quad/, /cuatrimoto/, /four ?wheeler/)) return null;
  const lang = s.lang;
  return {
    text: L(
      lang,
      `Universal sells **Hisun** UTVs and ATVs. Its Hisun page lists:\n${HISUN.map((m) => `• ${m.model}, ${m.type}: $${m.price}`).join('\n')}\n\nHisun parts catalogues and spec sheets are on that page. The branch confirms today's price and availability.`,
      `Universal vende UTV y cuatrimotos **Hisun**. Su página de Hisun publica:\n${HISUN.map((m) => `• ${m.model}, ${m.typeEs}: $${m.price}`).join('\n')}\n\nLos catálogos de repuestos y fichas técnicas de Hisun están en esa página. La sucursal confirma el precio y la disponibilidad de hoy.`,
    ),
    cards: [{ kind: 'brand', id: 'hisun' }, ...HISUN.slice(0, 4).map((m) => ({ kind: 'listed' as const, model: m.model }))],
    links: [{ label: L(lang, 'Hisun page', 'Página de Hisun'), href: HISUN[0].page, external: true }],
    handoff: 'sales',
  };
};

/* ---------------- Brands ---------------- */

const brandInfo: Skill = (t, s) => {
  const lang = s.lang;
  // Each brand's names, plus each half of combined names like "ECHO / Shindaiwa".
  const names = (b: (typeof BRANDS)[number]) =>
    [b.name, ...(b.alsoWritten ?? []), ...b.name.split(/[/&]/)].map((n) => n.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()).filter((n) => n.length > 2);
  let hit = '';
  const brand = BRANDS.find((b) => names(b).some((n) => new RegExp(`(^|\\s)${n}(\\s|$)`).test(t) && (hit = n)));
  if (!brand) return null;
  const rest = t.replace(new RegExp(hit, 'g'), ' ');
  // "makita drill" is a product search; "tell me about makita" or "makita" alone is about the brand.
  if (/(drill|saw|grinder|sander|trimmer|mower|chainsaw|blower|cutter|washer|tractor|generator|pump|welder|fridge|freezer|\bac\b|fan|light|wire|compressor|scooter|bike|motorcycle|taladro|sierra|esmeril|bomba|generador|motosierra|abanico|refri)/.test(rest)) return null;
  const facts = BRAND_FACTS[brand.id] ?? undefined;
  const shop = Object.values(PRODUCT_BY_ID).filter((p) => p.brand.toLowerCase() === brand.name.toLowerCase());
  s.lastShown = shop.slice(0, 6).map((p) => p.id);
  const cats = brand.categories.map((c) => CATEGORIES.find((x) => x.slug === c.slug)?.name).filter(Boolean);
  return {
    text: L(
      lang,
      `${facts ? facts.en : `**${brand.name}**: ${brand.focus.replace(/\.+$/, '')}.`}${cats.length ? `\n\nOn this site: ${cats.join(', ')}.` : ''}${shop.length ? `\n\n${shop.length} ${brand.name} items are in the Shop; here are some. Tap Add to put one in your cart.` : ''}`,
      `${facts ? facts.es : `**${brand.name}**: ${brand.focus.replace(/\.+$/, '')}.`}${cats.length ? `\n\nEn este sitio: ${cats.join(', ')}.` : ''}${shop.length ? `\n\nHay ${shop.length} artículos ${brand.name} en la Tienda; aquí algunos. Toque Agregar para ponerlo en su carrito.` : ''}`,
    ),
    cards: [{ kind: 'brand', id: brand.id }, ...productCards(shop, 5)],
    links: [{ label: L(lang, `${brand.name} on the Brands page`, `${brand.name} en la página de Marcas`), href: `/brands/#${brand.id}` }, ...(facts ? [{ label: L(lang, `${brand.name} on universalhardware.bz`, `${brand.name} en universalhardware.bz`), href: facts.page, external: true }] : [])],
  };
};

/* ---------------- Hours: open now and holidays ---------------- */

const fmtOpen = (id: BranchId, now: Date, lang: Lang) => {
  const st = openStatus(id, now);
  const name = BRANCH_BY_ID[id].name;
  const daysEs: Record<string, string> = { today: 'hoy', Monday: 'el lunes', Tuesday: 'el martes', Wednesday: 'el miércoles', Thursday: 'el jueves', Friday: 'el viernes', Saturday: 'el sábado', Sunday: 'el domingo' };
  if (st.open) return L(lang, `**${name}**: open now, until ${st.closes}.`, `**${name}**: abierta ahora, hasta las ${st.closes}.`);
  return L(lang, `**${name}**: closed now. Opens ${st.opensDay === 'today' ? 'today' : st.opensDay} at ${st.opensTime}.`, `**${name}**: cerrada ahora. Abre ${daysEs[st.opensDay ?? ''] ?? ''} a las ${st.opensTime}.`);
};

const openNow: Skill = (t, s, ctx) => {
  if (!has(t, /open (now|right now|today|yet)/, /are you open/, /is (it|the store|the branch|spanish lookout|belize city) open/, /still open/, /what time do you (close|open)/, /(abierto|abierta|abren|cierran) (ahora|hoy)/, /esta abiert/, /estan abiert/)) return null;
  const lang = s.lang;
  const now = ctx.now ?? new Date();
  const ids: BranchId[] = /belize city|belama|ciudad de belice/.test(t) ? ['belize-city'] : /spanish lookout|cayo/.test(t) ? ['spanish-lookout'] : ['spanish-lookout', 'belize-city'];
  return {
    text: L(
      lang,
      `By the listed hours, in Belize time:\n${ids.map((i) => `• ${fmtOpen(i, now, lang)}`).join('\n')}\n\nBoth branches close on Belize public and bank holidays.`,
      `Según el horario publicado, en hora de Belice:\n${ids.map((i) => `• ${fmtOpen(i, now, lang)}`).join('\n')}\n\nAmbas sucursales cierran en los feriados públicos y bancarios de Belice.`,
    ),
    branches: ids,
  };
};

const holidays: Skill = (t, s) => {
  if (!has(t, /holiday/, /christmas/, /boxing day/, /easter/, /good friday/, /new year/, /independence day/, /labou?r day/, /heroes/, /st george/, /pan american/, /sovereign/, /feriado/, /navidad/, /semana santa/, /ano nuevo/, /dia de la independencia/)) return null;
  const lang = s.lang;
  return {
    text: L(
      lang,
      `Universal Hardware closes on all Belize public and bank holidays, including:\n${HOLIDAYS.map(([en, , month]) => `• ${en}${month ? ` (${month})` : ''}`).join('\n')}`,
      `Universal Hardware cierra en todos los feriados públicos y bancarios de Belice, entre ellos:\n${HOLIDAYS.map(([, es]) => `• ${es}`).join('\n')}`,
    ),
  };
};

/* ---------------- Jobs, parts catalogues, contact ---------------- */

const careers: Skill = (t, s) => {
  if (!has(t, /\bjobs?\b/, /hiring/, /employ/, /vacanc/, /career/, /work (for|at|with) (you|universal)/, /apply/, /trabajo/, /empleo/, /vacante/, /contratando/)) return null;
  const lang = s.lang;
  return {
    text: L(
      lang,
      `Universal Hardware takes job applications with its employment application form. It asks about your education, work experience, core values, the kind of work you'd like, and whether you can work Saturdays. Send it to ${COMPANY.careersEmail} or drop it at a branch.`,
      `Universal Hardware recibe solicitudes de empleo con su formulario de solicitud. Pregunta por su educación, experiencia laboral, valores, el tipo de trabajo que le gustaría y si puede trabajar los sábados. Envíelo a ${COMPANY.careersEmail} o entréguelo en una sucursal.`,
    ),
    links: [{ label: L(lang, 'Employment form (PDF)', 'Formulario de empleo (PDF)'), href: COMPANY.careersForm, external: true }],
  };
};

const catalogues: Skill = (t, s) => {
  if (!has(t, /catalog/, /parts list/, /parts for/, /part number/, /exploded/, /repuestos para/, /catalogo/)) return null;
  const lang = s.lang;
  return {
    text: L(
      lang,
      `Universal publishes Meilun parts catalogues to use when ordering parts:\n${PARTS_CATALOGUES.groups.map(([en, , models]) => `• ${en}: ${models}`).join('\n')}\n\nHisun parts catalogues are on the Hisun page. For the order itself, message the branch Service Center with the model and the part.`,
      `Universal publica catálogos de repuestos Meilun para hacer pedidos:\n${PARTS_CATALOGUES.groups.map(([, es, models]) => `• ${es}: ${models}`).join('\n')}\n\nLos catálogos de Hisun están en la página de Hisun. Para el pedido, escriba al centro de servicio de la sucursal con el modelo y el repuesto.`,
    ),
    links: [{ label: L(lang, 'Meilun parts catalogues', 'Catálogos de repuestos Meilun'), href: PARTS_CATALOGUES.page, external: true }],
    handoff: 'service',
  };
};

const contact: Skill = (t, s) => {
  if (!has(t, /e-?mail/, /\bfax\b/, /mailing address/, /postal/, /correo/, /how (do|can) i contact/, /contact (details|info|information)/, /\bsmart\b/)) return null;
  const lang = s.lang;
  const rows = BRANCHES.map((b) =>
    L(
      lang,
      `**${b.name}**: tel ${b.phones[0].display}, Smart ${b.phones[1].display}, fax ${COMPANY.fax[b.id]}; WhatsApp sales ${b.whatsapp[0].display}, Service Center ${b.whatsapp[1].display}`,
      `**${b.name}**: tel. ${b.phones[0].display}, Smart ${b.phones[1].display}, fax ${COMPANY.fax[b.id]}; WhatsApp ventas ${b.whatsapp[0].display}, centro de servicio ${b.whatsapp[1].display}`,
    ),
  );
  return {
    text: L(
      lang,
      `Email: ${COMPANY.email}\n\n${rows.join('\n\n')}\n\nMailing address: ${COMPANY.mailing.join(', ')}.`,
      `Correo: ${COMPANY.email}\n\n${rows.join('\n\n')}\n\nDirección postal: ${COMPANY.mailing.join(', ')}.`,
    ),
    handoff: 'sales',
  };
};

/* ---------------- Everything on the site ---------------- */

const everything: Skill = (t, s) => {
  if (!has(t, /what (do|does) (you|universal) (sell|carry|have|offer)/, /(show|see) (me )?(everything|all( products| categories)?)/, /all (your )?(products|categories|departments)/, /full range/, /que (venden|tienen|ofrecen)/, /todos los productos/, /todo lo que (venden|tienen)/)) return null;
  const lang = s.lang;
  return {
    text: L(
      lang,
      `${COMPANY.summary} Here are all ${CATEGORIES.length} categories; tap one to see it. The Shop has Makita tools and Lifan and Meilun motorcycles you can buy online, and you can ask me for anything else.`,
      `${COMPANY.summaryEs} Aquí están las ${CATEGORIES.length} categorías; toque una para verla. En la Tienda hay herramientas Makita y motos Lifan y Meilun para comprar en línea, y puede preguntarme por cualquier otra cosa.`,
    ),
    cards: CATEGORIES.map((c) => ({ kind: 'category' as const, slug: c.slug })),
    links: [{ label: L(lang, 'Browse the Shop', 'Ver la Tienda'), href: '/shop/' }],
  };
};

const meilunExtras: Skill = (t, s) => {
  if (!has(t, /meilun (engine|pump|generator)/, /engine 1\d\d f/, /\b1[6-8][0-9]f\b/, /(small|gas|petrol|gasoline) engine/, /motor (a gasolina|estacionario)/)) return null;
  const lang = s.lang;
  return {
    text: L(lang, `The Meilun & Lifan page also lists Meilun products: ${MEILUN_PRODUCTS.join('; ')}. The branch confirms prices and stock.`, `La página de Meilun y Lifan también incluye productos Meilun: ${MEILUN_PRODUCTS.join('; ')}. La sucursal confirma precios y existencias.`),
    cards: [{ kind: 'brand', id: 'meilun' }, { kind: 'category', slug: 'generators' }, { kind: 'category', slug: 'water-pumps' }],
    handoff: 'sales',
  };
};

/** Tried in order; the first that answers wins. */
export const SKILLS: Skill[] = [cartView, addToCart, handoff, airCon, catalogues, hisun, modelInfo, meilunExtras, holidays, openNow, careers, contact, everything, brandInfo];
