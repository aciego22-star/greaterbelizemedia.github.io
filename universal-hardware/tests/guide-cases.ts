/**
 * Conversation checks for the local Product Guide engine and data integrity
 * checks for the finder rules. Run with: npm run test:logic
 */
import { LocalGuideEngine } from '../src/lib/guide/local-engine';
import { FINDER_PATHS } from '../src/lib/finder-rules';
import { CATEGORY_BY_SLUG } from '../src/data/categories';
import type { GuideState } from '../src/lib/guide/types';

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
    const { reply, state } = LocalGuideEngine.reply(u, s, { enquiryCount: 0 });
    s = state;
    console.log(`  USER: ${u}\n  GUIDE: ${reply.text.replace(/\n+/g, ' ⏎ ').slice(0, 260)}…`);
    expect[i]?.(reply.text + ' ' + JSON.stringify(reply.actions ?? []) + JSON.stringify(reply.links ?? []), i);
  });
}

const banned = [/in stock\b(?! levels)/i, /quote (has been|was) sent/i, /we have sent/i, /notified/i, /\$\s?\d/, /BZ\$/i, /guarantee/i];
const noBanned = (t: string) => banned.forEach((b) => check(!b.test(t.replace(/can't check stock|can't confirm (current )?stock|no live inventory/gi, '')), `no banned claim ${b}`));

convo('Generator', ['I need backup power for my home. What type should I look at?', 'Lights, fridge and fans', 'Occasional outages'], [
  (t) => { check(/appliances/i.test(t) && /occasional/i.test(t), 'asks appliances and occasional vs ongoing'); check(/\/products\/generators\//.test(t), 'links generator category'); noBanned(t); },
  (t) => check(/occasional|regular/i.test(t), 'asks remaining slot'),
  (t) => { check(/qualified electrician/i.test(t), 'recommends electrician'); check(/add-enquiry/.test(t), 'offers add to enquiry'); noBanned(t); },
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
  (t) => { check(/Meilun/.test(t) && /Lifan/.test(t), 'mentions Meilun & Lifan page'); check(/can't say which models|cannot|can't/i.test(t), 'does not state availability'); check(/branch/i.test(t), 'asks preferred location'); noBanned(t); },
  (t) => check(/street|scooter/i.test(t), 'maps commuting to street/scooters'),
  (t) => check(/Belize City/.test(t), 'handles branch follow-up'),
]);
convo('Branch', ['Where is your Belize City store?'], [
  (t) => { check(/3380 Chetumal Street/.test(t), 'gives address'); check(/224-4140/.test(t) && /667-3937/.test(t), 'gives phone and WhatsApp'); check(/confirm/i.test(t), 'verification notice'); },
]);
convo('Quote', ['Can you send me a quote?'], [
  (t) => { check(/can't send quotes/i.test(t), 'states it cannot transmit'); check(/open-enquiry/.test(t), 'offers enquiry summary'); check(/652-9933/.test(t), 'gives official branch details'); },
]);
convo('Identity', ['Are you a real AI?'], [(t) => check(/not connected to a live AI|rule-based/i.test(t), 'honest about not being live AI')]);
convo('Spanish', ['Hola, necesito una bomba de agua para la casa'], [(t) => check(/bomba/i.test(t) && /fuente de agua|pozo/i.test(t), 'responds in Spanish')]);
convo('Open now', ['Is the Spanish Lookout store open now?'], [(t) => check(/can't tell whether a branch is open/i.test(t), 'does not infer open now')]);
convo('Warranty', ['What is the warranty on generators?'], [(t) => check(/don't have warranty/i.test(t), 'no invented warranty')]);
convo('Category', ['Do you sell MIG welders?'], [(t) => check(/Welding Supplies/.test(t), 'maps to welding')]);

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
