/**
 * Conversation checks for the local Product Guide engine and data integrity
 * checks for the finder rules. Run with: npm run test:logic
 */
import { LocalGuideEngine } from '../src/lib/guide/local-engine';
import { FINDER_PATHS } from '../src/lib/finder-rules';
import { CATEGORY_BY_SLUG } from '../src/data/categories';
import type { GuideContext, GuideReply, GuideState } from '../src/lib/guide/types';

declare const process: { exit(code: number): never };

let failures = 0;
const check = (cond: boolean, msg: string) => {
  if (!cond) {
    failures++;
    console.log('  ✗', msg);
  } else console.log('  ✓', msg);
};

function convo(title: string, turns: string[], expect: ((text: string, i: number) => void)[]) {
  console.log(`\n▶ ${title}`);
  let s: GuideState = LocalGuideEngine.initialState('en');
  turns.forEach((u, i) => {
    const { reply, state } = LocalGuideEngine.reply(u, s);
    s = state;
    console.log(`  USER: ${u}\n  GUIDE: ${reply.text.replace(/\n+/g, ' ⏎ ').slice(0, 260)}…`);
    expect[i]?.(reply.text + ' ' + JSON.stringify(reply.links ?? []), i);
  });
}


/** Like convo, but passes the page context and hands each full reply (cards, actions, handoff) to the checks. */
function talk(title: string, turns: string[], expect: ((r: GuideReply, i: number) => void)[], ctx: GuideContext = {}, lang: 'en' | 'es' = 'en') {
  console.log(`\n▶ ${title}`);
  let s: GuideState = LocalGuideEngine.initialState(lang);
  turns.forEach((u, i) => {
    const { reply, state } = LocalGuideEngine.reply(u, s, ctx);
    s = state;
    console.log(`  USER: ${u}\n  GUIDE: ${reply.text.replace(/\n+/g, ' ⏎ ').slice(0, 200)}… [cards ${(reply.cards ?? []).map((c) => c.kind).join(',')}; actions ${JSON.stringify(reply.actions ?? [])}; handoff ${reply.handoff ?? '-'}]`);
    expect[i]?.(reply, i);
  });
}

const banned = [/\bconcept\b/i, /demonstration/i, /Enquiry Summary/i, /in stock\b(?! levels| now)/i, /quote (has been|was) sent/i, /we have sent/i, /notified/i, /\$\s?\d/, /BZ\$/i, /guarantee/i];
const noBanned = (t: string) => banned.forEach((b) => check(!b.test(t.replace(/can't check stock|can't confirm (current )?stock|no live inventory/gi, '')), `no banned claim ${b}`));

convo('Generator', ['I need backup power for my home. What type should I look at?', 'Lights, fridge and fans', 'Occasional outages'], [
  (t) => { check(/appliances/i.test(t) && /occasional/i.test(t), 'asks appliances and occasional vs ongoing'); check(/\/products\/generators\//.test(t), 'links generator category'); noBanned(t); },
  (t) => check(/occasional|regular/i.test(t), 'asks remaining slot'),
  (t) => { check(/qualified electrician/i.test(t), 'recommends electrician'); check(/branch contact details/i.test(t), 'offers branch contacts'); noBanned(t); },
]);
convo('Power tools', ['I need a cordless drill for concrete and steel.', 'Daily trade work'], [
  (t) => { check(/hammer drill/i.test(t) && /impact/i.test(t), 'distinguishes hammer vs impact'); check(/\?/.test(t), 'asks follow-up'); noBanned(t); },
  (t) => { check(/Hammer drills/.test(t), 'points to hammer drills'); check(/power-tools/.test(t), 'links power tools'); },
]);
convo('Pumps', ['I need a pump for my home water supply.', 'Deep well'], [
  (t) => { check(/deep|depth/i.test(t) && /source/i.test(t), 'clarifies source and depth'); noBanned(t); },
  (t) => { check(/submersible/i.test(t), 'suggests submersible for deep well'); check(/professional|confirm/i.test(t), 'recommends confirmation'); },
]);
convo('Motorcycle', ['Do you carry motorbikes?', 'Town commuting', 'Belize City'], [
  (t) => { check(/Meilun/.test(t) && /Lifan/.test(t), 'mentions Meilun & Lifan page'); check(/branch can tell you which models are in stock/i.test(t), 'leaves current availability to the branch'); check(/branch/i.test(t), 'asks preferred location'); noBanned(t); },
  (t) => check(/street|scooter/i.test(t), 'maps commuting to street/scooters'),
  (t) => check(/Belize City/.test(t), 'handles branch follow-up'),
]);
convo('Branch', ['Where is your Belize City store?'], [
  (t) => { check(/3380 Chetumal Street/.test(t), 'gives address'); check(/224-4140/.test(t) && /667-3937/.test(t), 'gives phone and WhatsApp'); check(/confirm/i.test(t), 'verification notice'); },
]);
convo('Quote', ['Can you send me a quote?'], [
  (t) => { check(/can't send quotes/i.test(t), 'states it cannot transmit'); check(/WhatsApp/.test(t), 'points to the branch WhatsApp lines'); check(/652-9933/.test(t), 'gives official branch details'); },
]);
convo('Shop', ['Can I pay with a credit card online?'], [
  (t) => { check(/\/shop\//.test(t), 'links the Shop'); check(/simulated/i.test(t) && /nothing is charged/i.test(t), 'says the card step is simulated'); noBanned(t); },
]);
convo('Price', ['How much is the Makita drill?'], [
  (t) => { check(/can't send quotes or get current prices/i.test(t), 'no current prices'); check(/\/shop\//.test(t) && /ended/i.test(t), 'points to Shop sale prices as ended'); noBanned(t); },
]);
convo('Identity', ['Are you a real AI?'], [(t) => check(/not connected to a live AI|rule-based/i.test(t), 'honest about not being live AI')]);
convo('Spanish', ['Hola, necesito una bomba de agua para la casa'], [(t) => check(/bomba/i.test(t) && /fuente de agua|pozo/i.test(t), 'responds in Spanish')]);
convo('Open now', ['Is the Spanish Lookout store open now?'], [(t) => check(/By the listed hours, in Belize time/.test(t) && /(open now, until|closed now\. Opens)/.test(t), 'answers open or closed from the listed hours, in Belize time')]);
convo('Warranty', ['What is the warranty on generators?'], [(t) => check(/don't have warranty/i.test(t), 'no invented warranty')]);
convo('Category', ['Do you sell MIG welders?'], [(t) => check(/Welding Supplies/.test(t), 'maps to welding')]);
convo("What's new", ["What's new at Universal?"], [(t) => check(/Friends & Family Sale[\s\S]*usually in February[\s\S]*Mega Sale[\s\S]*usually in May[\s\S]*Universal Mega Sale 2026/.test(t), 'yearly sales and the latest event')]);
convo('Sale coming up', ['Is there a sale coming up?'], [(t) => check(/usually in May/.test(t) && !/can't send quotes/.test(t), 'answers with sales, not a quote refusal')]);
convo('Novedades', ['¿Qué hay de nuevo en Universal?'], [(t) => check(/normalmente en febrero[\s\S]*del 21 al 23 de mayo de 2026/.test(t), 'Spanish news reply with Spanish dates')]);
{
  const w = LocalGuideEngine.welcome(LocalGuideEngine.initialState('en'));
  check(w.text === "Hi, I'm Universal AI. How may I assist you today?" && (w.chips?.length ?? 0) >= 6, 'welcome greets as Universal AI with suggestions below');
  const we = LocalGuideEngine.welcome(LocalGuideEngine.initialState('es'));
  check(we.text === 'Hola, soy Universal AI. ¿En qué puedo ayudarle hoy?', 'Spanish welcome');
}


console.log('\n▶▶ Universal AI skills');
talk('Add a Shop item by model', ['Add the Makita HP333DYX3B to my cart'], [
  (r) => check(r.actions?.[0]?.type === 'add' && (r.actions[0] as { id: string }).id === 'makita-hp333dyx3b' && r.cards?.[0]?.kind === 'product', 'adds the HP333DYX3B and shows its picture card'),
]);
talk('Quantity and colour', ['add 2 red LF100-A to my cart'], [
  (r) => check(JSON.stringify(r.actions) === JSON.stringify([{ type: 'add', id: 'lifan-lf100-a', qty: 2, colour: 'Red' }]), 'adds 2 × LF100-A in Red'),
]);
talk('Colour needed', ['add the LF150-7 to my cart', 'add it in black'], [
  (r) => check(!r.actions && /Which colour/.test(r.text) && r.cards?.[0]?.kind === 'product', 'asks which colour, with the product card'),
  (r) => check(r.actions?.[0]?.type === 'add' && (r.actions[0] as { colour?: string }).colour === 'Black', '"add it in black" adds the shown bike in Black'),
]);
talk('Show then pick', ['show me makita drills', 'add the second one'], [
  (r) => check((r.cards ?? []).filter((c) => c.kind === 'product').length >= 2, 'shows several Makita drill cards with pictures'),
  (r) => check(r.actions?.[0]?.type === 'add', '"add the second one" adds the second card'),
]);
talk('Unlisted item becomes a request', ['add 3 bags of cement to my cart'], [
  (r) => check(JSON.stringify(r.actions) === JSON.stringify([{ type: 'request', text: 'bags of cement', qty: 3 }]), 'adds 3 × "bags of cement" as a request, worded as typed'),
]);
talk('Listed model not in the Shop', ['add the LF125-5 to my cart'], [
  (r) => check(r.actions?.[0]?.type === 'request' && /2,371\.00/.test(r.text), 'adds the LF125-5 as a request and quotes its listed price'),
]);
talk('Generic word asks first', ['add a generator to my cart'], [
  (r) => check(!r.actions && r.cards?.[0]?.kind === 'category', 'asks which generator, with the category card'),
]);
talk('Cart view', ["what's in my cart?"], [
  (r) => check(/1 × Makita HP333DYX3B/.test(r.text) && /BZ\$248\.25/.test(r.text) && /pvc pipe/.test(r.text), 'lists the cart with totals and requests'),
], { cart: [{ id: 'makita-hp333dyx3b', qty: 1 }, { kind: 'request', text: 'pvc pipe', qty: 2 }] });
talk('WhatsApp handoff', ['I want to talk to a person'], [(r) => check(r.handoff === 'sales', 'offers the WhatsApp handoff to sales')]);
talk('Service handoff', ['can I speak to someone about a repair'], [(r) => check(r.handoff === 'service', 'repairs go to the Service Center line')]);
talk('AC sizing', ['What size AC do I need for a 12 by 14 bedroom?'], [(r) => check(/168 square feet/.test(r.text) && /6,000 BTU/.test(r.text), '12 × 14 ft → 168 sq ft → 6,000 BTU (Sankey chart)')]);
talk('AC sizing, adjusted', ['air conditioner for a very sunny living room 20x25 with 4 people'], [(r) => check(/500 square feet/.test(r.text) && /12,000 BTU/.test(r.text) && /14,400 BTU/.test(r.text), '500 sq ft → 12,000; sunny +10% and 2 extra people → 14,400 BTU')]);
talk('AC sizing, follow-up', ['what size air conditioner do I need?', '4 x 5 metres'], [
  (r) => check(/What size is the room/.test(r.text), 'asks for the room size'),
  (r) => check(/215 square feet/.test(r.text) && /6,000 BTU/.test(r.text), '4 × 5 m → 215 sq ft → 6,000 BTU'),
]);
talk('Inverter vs regular', ['inverter vs regular AC?'], [(r) => check(/30%/.test(r.text) && /quieter/.test(r.text), "explains inverter vs fixed speed from Sankey's page")]);
talk('Motorcycle specs', ['what is the fuel consumption of the LF100-A?'], [(r) => check(/1\.9 L\/100 km/.test(r.text) && /3\.5 litres/.test(r.text) && r.cards?.[0]?.kind === 'product', 'gives LF100-A specs from the live site, with its Shop card')]);
talk('Hisun prices', ['how much is a hisun utv?'], [(r) => check(/Sector 750: \$29,849\.00/.test(r.text) && (r.cards ?? []).some((c) => c.kind === 'brand'), 'lists Hisun models and prices from the live site')]);
talk('Brand facts', ['tell me about Cub Cadet'], [(r) => check(/authorized dealer/.test(r.text) && r.cards?.[0]?.kind === 'brand', 'Cub Cadet: authorized dealer, with the brand card')]);
talk('Shindaiwa', ['shindaiwa'], [(r) => check(/proud distributor of Shindaiwa/.test(r.text), 'Shindaiwa: Universal is its distributor in Belize')]);
talk('Holidays', ['are you open on Boxing Day?'], [(r) => check(/Boxing Day/.test(r.text) && /closes on all Belize public and bank holidays/.test(r.text), 'lists the holiday closures')]);
talk('Open now, weekday', ['are you open now?'], [(r) => check(/Spanish Lookout\*\*: open now, until 5:00 PM/.test(r.text) && /Belize City\*\*: open now, until 5:00 PM/.test(r.text), 'Wednesday 10:00 Belize time: both open')], { now: new Date('2026-11-04T16:00:00Z') });
talk('Open now, Sunday', ['is the store open right now?'], [(r) => check(/closed now\. Opens Monday at 7:30 AM/.test(r.text), 'Sunday: closed, opens Monday 7:30 AM')], { now: new Date('2026-11-08T16:00:00Z') });
talk('Jobs', ['are you hiring?'], [(r) => check(/apply@universalhardware\.bz/.test(r.text) && /Emplyment_Form\.pdf/.test(JSON.stringify(r.links)), 'points to the employment form')]);
talk('Parts catalogues', ['where can I find a parts catalogue for the ML125-5?'], [(r) => check(/ML125-5/.test(r.text) && r.handoff === 'service', 'lists Meilun parts catalogues, offers the Service Center')]);
talk('Contact details', ["what's your email and fax?"], [(r) => check(/sales@universalhardware\.bz/.test(r.text) && /823-0311/.test(r.text) && /224-4141/.test(r.text), 'gives email and both fax numbers')]);
talk('Everything', ['what do you sell?'], [(r) => check((r.cards ?? []).filter((c) => c.kind === 'category').length === 12, 'shows all 12 categories as picture cards')]);
talk('Stock question leads with the range', ['do you have chainsaws?'], [(r) => check(/Universal carries \*\*Lawn and Garden\*\*/.test(r.text) && r.handoff === 'sales' && r.cards?.[0]?.kind === 'category', 'chainsaws → Lawn and Garden, picture card, WhatsApp handoff')]);
talk('Search fallback', ['angle grinder'], [(r) => check((r.cards ?? []).some((c) => c.kind === 'product'), 'unknown phrasing still finds Shop items with pictures')]);
talk('Spanish: add to cart', ['agregue 2 LF100-A rojas al carrito'], [(r) => check(r.actions?.[0]?.type === 'add' && r.actions[0].qty === 2 && /agregué/.test(r.text), 'Spanish add with quantity and colour')], {}, 'es');
talk('Spanish: AC', ['¿qué tamaño de aire acondicionado para un cuarto de 12 por 14 pies?'], [(r) => check(/168 pies cuadrados/.test(r.text) && /6,000 BTU/.test(r.text), 'Spanish AC sizing')], {}, 'es');
talk('Guides still work', ['I need backup power for my home. What type should I look at?'], [(r) => check(/appliances/.test(r.text) && r.cards?.[0]?.kind === 'category', 'generator guide still asks, now with the Generators card')]);

console.log('\n▶ Finder data integrity');
for (const p of FINDER_PATHS) {
  // Enumerate every answer combination.
  const combos: Record<string, string>[] = [{}];
  for (const q of p.questions) {
    const next: Record<string, string>[] = [];
    for (const c of combos) for (const o of q.options) next.push({ ...c, [q.id]: o.id });
    combos.splice(0, combos.length, ...next);
  }
  let ok = true;
  for (const a of combos) {
    const r = p.resolve(a);
    if (!r.matches.length) ok = false;
    for (const m of r.matches) {
      const c = CATEGORY_BY_SLUG[m.slug];
      if (!c) { ok = false; console.log('   unknown slug', m.slug); continue; }
      for (const f of m.focus) if (!c.subcategories.some((s) => s.name === f)) { ok = false; console.log(`   ${p.id} ${JSON.stringify(a)}: "${f}" not in ${m.slug}`); }
    }
  }
  check(ok, `${p.id}: ${combos.length} answer combinations resolve to listed categories/sub-types`);
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll logic checks passed');
process.exit(failures ? 1 : 0);
