/* Alpuche AI: conversation engine for the José M. Alpuche website.
   Runs entirely in the browser (and in Node for tests). No model, no network calls.

   Order of handling, following ai/assistant-instructions.md:
     1. immediate danger → emergency services
     2. sensitive details (ID numbers, documents) → stop, don't repeat, hide the message
     3. hearing / deadline / court papers → call the office now
     4. attempts to change the assistant's role
     5. requests for legal advice → guardrail
     6. specific intents from the curated knowledge base (contact, fees, QRP, family, …)
     7. retrieval over everything published on the site (sections, services, FAQs)
     8. fallback → office contact and an offer to pass on an enquiry
   Lead intake is a separate step-by-step flow that collects only the fields the
   handoff allows: matter type, name, reply channel, contact detail, whether a date
   is coming up, and a short, general description. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AlpucheAI = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Text utilities
  // ---------------------------------------------------------------------------
  function normalise(s) {
    return String(s || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }

  var STOP = new Set(('a an the and or but if of to in on at by for with from into about as is are was were be been being ' +
    'do does did done have has had having i me my mine we us our you your yours he him his she her they them their it its ' +
    'this that these those there here what which who whom whose when where why how can could would should will shall may might ' +
    'must not no yes please just also any some all more most very so than then too only own same other such get got ' +
    'want need like know tell let make help am im id ive dont cant hi hello hey thanks thank ok okay one two firm office').split(' '));

  // Canonical forms so different wording reaches the same content.
  var SYN = {
    land: 'property', house: 'property', home: 'property', lot: 'property', parcel: 'property', condo: 'property',
    condominium: 'property', apartment: 'property', real: 'property', estate: 'property', realestate: 'property',
    conveyanc: 'property', conveyancing: 'property', plot: 'property', acre: 'property', villa: 'property',
    compan: 'business', company: 'business', corporation: 'business', corporate: 'business', incorporat: 'business',
    incorporate: 'business', incorporation: 'business', llc: 'business', llp: 'business', startup: 'business',
    venture: 'business', enterprise: 'business',
    retir: 'retire', retirement: 'retire', retiree: 'retire', retiring: 'retire', retired: 'retire', pension: 'retire',
    pensioner: 'retire', qrp: 'retire',
    separation: 'divorce', separat: 'divorce',
    brand: 'trademark', logo: 'trademark',
    invention: 'patent', invent: 'patent', inventor: 'patent', prototype: 'patent',
    lawsuit: 'dispute', sue: 'dispute', su: 'dispute', litigation: 'dispute', litigat: 'dispute',
    loan: 'financ', financing: 'financ', finance: 'financ', lender: 'financ', borrow: 'financ', facility: 'financ',
    cost: 'fee', price: 'fee', charge: 'fee', pric: 'fee', rate: 'fee',
    taxe: 'tax', taxation: 'tax',
    phone: 'contact', telephone: 'contact', email: 'contact', call: 'contact',
    address: 'location', located: 'location', locat: 'location', direction: 'location',
    adoption: 'adopt', adopting: 'adopt',
    kid: 'child', children: 'child', son: 'child', daughter: 'child',
    mediator: 'mediat', mediation: 'mediat', arbitration: 'arbitrat', arbitrator: 'arbitrat',
    shareholder: 'sharehold', shareholders: 'sharehold',
    canada: 'nonresident', canadian: 'nonresident', usa: 'nonresident', america: 'nonresident', american: 'nonresident', uk: 'nonresident', england: 'nonresident', europe: 'nonresident', mexico: 'nonresident',
    foreign: 'nonresident', foreigner: 'nonresident', non: 'nonresident', expat: 'nonresident', abroad: 'nonresident', overseas: 'nonresident',
  };

  function stem(w) {
    if (w.length > 4 && w.slice(-3) === 'ies') return w.slice(0, -3) + 'y';
    if (w.length > 5 && w.slice(-3) === 'ing') return w.slice(0, -3);
    if (w.length > 4 && w.slice(-2) === 'ed') return w.slice(0, -2);
    if (w.length > 4 && /(ss|x|ch|sh)es$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && w.slice(-1) === 's' && w.slice(-2) !== 'ss') return w.slice(0, -1);
    return w;
  }

  function tokens(s) {
    var out = [];
    normalise(s).replace(/real estate/g, 'realestate').split(/[^a-z0-9]+/).forEach(function (w) {
      if (!w || STOP.has(w) || w.length < 2) return;
      var t = SYN[w] || SYN[stem(w)] || stem(w);
      if (!STOP.has(t)) out.push(t);
    });
    return out;
  }

  function sentences(text, max) {
    var parts = String(text).match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    var out = '';
    for (var i = 0; i < parts.length; i++) {
      if (out && (out + parts[i]).length > max) break;
      out += parts[i];
      if (i >= 1) break;
    }
    return out.trim();
  }

  function has(re, s) { return re.test(s); }

  // ---------------------------------------------------------------------------
  // Retrieval (BM25 over knowledge-base entries and every published section/FAQ)
  // ---------------------------------------------------------------------------
  function buildIndex(docs) {
    var df = new Map();
    var total = 0;
    var indexed = docs.map(function (d) {
      var toks = [].concat(tokens(d.title), tokens(d.title), d.examples ? tokens(d.examples.join(' ')) : [], d.examples ? tokens(d.examples.join(' ')) : [], tokens(d.text));
      var tf = new Map();
      toks.forEach(function (t) { tf.set(t, (tf.get(t) || 0) + 1); });
      tf.forEach(function (_, t) { df.set(t, (df.get(t) || 0) + 1); });
      total += toks.length;
      return { doc: d, tf: tf, len: toks.length };
    });
    return { items: indexed, df: df, n: indexed.length, avg: total / Math.max(1, indexed.length) };
  }

  function search(index, query, filter) {
    var q = Array.from(new Set(tokens(query)));
    if (!q.length) return [];
    var k1 = 1.2;
    var b = 0.75;
    var results = [];
    index.items.forEach(function (it) {
      if (filter && !filter(it.doc)) return;
      var score = 0;
      var matched = 0;
      q.forEach(function (t) {
        var f = it.tf.get(t);
        if (!f) return;
        matched++;
        var df = index.df.get(t) || 0;
        var idf = Math.log(1 + (index.n - df + 0.5) / (df + 0.5));
        score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + (b * it.len) / index.avg));
      });
      if (score > 0) {
        if (it.doc.kind === 'kb') score *= 1.2;
        results.push({ doc: it.doc, score: score, coverage: matched / q.length });
      }
    });
    results.sort(function (a, b2) { return b2.score - a.score; });
    return results;
  }

  // ---------------------------------------------------------------------------
  // Patterns
  // ---------------------------------------------------------------------------
  var P = {
    danger: /\b(in danger|immediate danger|trying to (hurt|kill|attack)|going to (hurt|kill)|threaten(ing)? (me|to)|attack(ing|ed)? me|hurt(ing)? me|beat(ing)? me|hitting me|kill me|being (abused|attacked|followed|stalked)|unsafe right now|not safe|emergency|call (the )?police|help me now)\b/,
    sensitiveWords: /\b(passport|social security|ssn|id (number|no|card)|identification number|national id|driver'?s licen[cs]e|bank (account|details)|account (number|no)|routing|iban|swift|credit card|debit card|card number|cvv|pin|password|date of birth|dob|tax (id|number)|tin)\b/,
    longNumber: /(\d[\s-]?){8,}/,
    uploadDocs: /\b(upload|attach|send (you )?(my|the|a) (document|contract|file|passport|papers|photo|picture|agreement|lease|will)|read my|review my (contract|document|agreement|lease|papers)|look at my (contract|document|agreement)|here (is|are) my (contract|document|papers|details))\b/,
    urgent: /\b(hearing|court date|trial|deadline|time limit|served|summons|court papers|papers (arrived|came)|received (court )?papers|got (court )?papers|demand letter|notice (to|of)|response date|how many days|eviction|evict(ed|ing)?|arrest(ed)?|bail|injunction|warrant)\b/,
    timeSoon: /\b(today|tomorrow|tonight|next week|this week|soon|asap|urgent|urgently|immediately|right away)\b/,
    injection: /\b((ignore|disregard|forget|override) (all |the |your |any |previous |prior |above |these )*(instructions|rules|prompt|guidelines)|system prompt|your (instructions|prompt|rules)|you are now|act as if|act like (a|an)|pretend (to be|you are)|developer mode|jailbreak|forward (this|my message|it)|pass (this|it) (on )?to (jose|janine|the attorney|him|her)|send (this|it) to (jose|janine|him|her)|tell (jose|janine) (that|to))\b/,
    legal: /\b(do i have a (good |strong |valid )?(case|claim)|is (this|it|that) a (good )?case|should i (sign|sue|settle|accept|pay|agree|file|appeal|plead|go to court|refuse|move out|leave|stop paying|respond)|will i (win|lose|get|have to pay)|would i win|can i (sue|claim|win)|could i sue|chances? of (winning|success)|my chances|is (it|this|that) (legal|illegal|allowed|against the law|lawful)|am i (liable|entitled|responsible|allowed|in trouble)|what are my (rights|options|chances)|is my (contract|agreement|lease|will|deed) (valid|enforceable|legal|binding|safe|ok)|is (this|the) (contract|agreement|clause) (valid|enforceable|safe|binding|fair)|what should i do|what do i do|advise me|legal advice|give me advice|your advice|tell me what to (do|sign)|how much (compensation|damages)|can (they|he|she|my \w+) (do that|evict|fire|sue|take)|is (he|she|they) allowed|interpret|what does (this|my|the) (clause|contract|letter|order) mean|get (it|my \w+|the \w+) back|will a judge|is it worth (suing|going to court)|do i need to (respond|reply|pay))\b/,
    existing: /\b((my|active|existing|current|ongoing|open) (case|matter|file)|status of my|update on my|progress (on|of) my|has my \w+ been (filed|registered|approved|sent|done)|i(?:'m| am) (already )?a client|my (attorney|lawyer) (is|at))\b/,
    payment: /\b(bank (details|account|info)|account details|pay (you|online|by card|the firm|a retainer|now)|payment (link|details)|send (me )?(your )?(bank|account|payment)|wire (money|transfer|funds)|transfer (money|funds)|i want to pay|how (do|can) i pay)\b/,
    taxAmount: /\b((how much|what) (tax|taxes)|tax (do|will|would) i (owe|pay)|calculate (my )?tax|my tax (bill|liability))\b/,
    propertyCost: /\b(stamp duty|duties|transfer tax|closing costs?|registration (fee|cost)s?|how long (will|does|would|do) .{0,30}(registration|transfer|closing|purchase|title))\b/,
    fees: /\b(how much (is|are|do|does|will|would)|costs?|fees?|price|pricing|what do you charge|do you charge|free (consult|consultation|first)|is the first (call|meeting|consultation))\b/,
    booking: /\b(book|booking|schedule|appointment|reserve|slot|meet with|meeting with|set up a (call|meeting)|available (today|tomorrow|this week)|see (jose|the attorney|a lawyer) (today|tomorrow))\b/,
    channels: /\b(whatsapp|whats app|text (you|me)|sms|instagram|facebook|messenger|spanish|espanol|kriol|creole|language)\b/,
    hours: /\b(hours|opening|open (on|today|tomorrow|saturday|sunday|now)|are you open|what time|closing time|saturdays?|sundays?|weekends?|public holiday)\b/,
    location: /\b(where (are|is) (you|the office|your office|it)|address|located|location|directions|find (you|the office)|map)\b/,
    contact: /\b(phone( number)?|telephone|call (you|the office)|email( address)?|contact (you|the office|details|information|info)|reach (you|the office|someone)|speak to (someone|a person|a human)|talk to (someone|a person|a human)|number)\b/,
    janine: /\bjanine\b/,
    jose: /\b(jose|alpuche|who (runs|owns|leads) (the|this|your) (firm|practice|office)|who is (the|your) (lawyer|attorney)|your lawyer)\b/,
    bar: /\b(president|bar association)\b/,
    unlisted: /\b(criminal|defen[cs]e (attorney|lawyer)|dui|drunk driving|murder|theft|assault charge|wills|a will|my will|last will|testament|probate|estate planning|inheritance|employment law|employment|fired|wrongful dismissal|labou?r law|immigration|visa|citizenship|work permit|personal injury|accident claim|car accident|medical malpractice|bankruptcy|insolvency|traffic ticket)\b/,
    retireCtx: /\b(retire|retirement|retiring|retiree|qrp|qualified retire|pension)/,
    qualify: /\b(do i qualify|will i qualify|am i (eligible|old enough)|eligib|minimum (age|income)|income (requirement|minimum)|how old)\b/,
    qrpWork: /\b(work|job|employ|business|permanent resid|residency|citizenship|tax)\w*/,
    qrpImport: /\b(import|vehicle|car|boat|ship|shipping|container|furniture|belongings|household goods|duty|duty-free)\w*/,
    child: /\b(child|children|kid|kids|son|daughter|custody|maintenance|child support|visitation)\b/,
    registeredAgent: /\b(registered agent|foreign (shareholder|owner|participant|director|investor))\b/,
    mediation: /\bmediat/,
    overseas: /\b(canada|canadian|usa|u\.s\.|united states|america|american|the states|uk|united kingdom|england|britain|europe|mexico|guatemala|honduras|abroad|overseas|outside belize|from abroad|live abroad|living abroad|another country)\b/,
    intake: /\b((request|arrange|want|need|like|get|schedule|start|make) (a |an )?(consultation|enquiry|inquiry)|speak (to|with) (a |an |the )?(lawyer|attorney|jose)|talk (to|with) (a |an |the )?(lawyer|attorney|jose)|contact me|call me( back)?|email me|get in touch|reach me|hire (you|a lawyer|an attorney)|retain (you|the firm)|need (a |an )?(lawyer|attorney)|looking for (a |an )?(lawyer|attorney)|represent me|take my case)\b/,
    greeting: /^(hi|hello|hey|hiya|good (morning|afternoon|evening)|greetings)\b[\s!.,]*$/,
    thanks: /^(thanks|thank you|thx|cheers|great|perfect|ok thanks|okay thanks)\b/,
    yes: /^(yes|yeah|yep|yup|sure|ok|okay|please|go ahead|continue|start|y)\b/,
    no: /^(no|nope|not now|no thanks|later|n)\b/,
    cancel: /^(cancel|stop|quit|exit|never ?mind|forget it|start over|restart)\b/,
    practiceList: /\b(practice areas|services|what (do you|does the firm) (do|offer|practi[cs]e|handle)|areas of law|what kind of law)\b/,
  };

  var PRACTICE_WORDS = {
    'real-estate': /\b(property|land|house|home|lot|parcel|condo|title|conveyanc\w*|real estate|deposit|closing|buy(ing)? (a )?(house|land|home|property|lot)|sell(ing)? (my )?(house|land|property))\b/g,
    'corporate-commercial': /\b(company|companies|business|incorporat\w*|shareholder\w*|partner(ship)?s?|joint venture|contracts?|llc|llp|startup|registered agent)\b/g,
    'banking-finance-tax-regulatory': /\b(loan|financ\w*|bank\w*|guarantee|mortgage|charge|tax\w*|licen[cs]e|regulat\w*|fsc|lender|exchange control)\b/g,
    'dispute-resolution': /\b(dispute|sue|suing|lawsuit|litigation|court|arbitration|mediation|demand letter|claim|hearing|settle\w*)\b/g,
    'intellectual-property': /\b(trademark\w*|patent\w*|copyright\w*|brand\w*|logo|invention|intellectual property)\b/g,
    'family-law': /\b(divorce|adopt\w*|child\w*|custody|maintenance|marriage|married|spouse|separation|family)\b/g,
    'qualified-retired-persons': /\b(retire\w*|qrp|pension\w*|retirement program\w*)\b/g,
  };

  function detectPractice(text) {
    var best = null;
    var bestN = 0;
    Object.keys(PRACTICE_WORDS).forEach(function (k) {
      var m = text.match(PRACTICE_WORDS[k]);
      var n = m ? m.length : 0;
      if (n > bestN) { best = k; bestN = n; }
    });
    return best;
  }

  // ---------------------------------------------------------------------------
  // Validation for intake
  // ---------------------------------------------------------------------------
  var EMAIL_RE = /^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[a-z]{2,}$/i;
  function cleanName(s) {
    var n = String(s || '').replace(/^(my name is|i am|i'm|it's|this is|name:?)\s+/i, '').replace(/[^\p{L}\s'-]/gu, ' ').replace(/\s+/g, ' ').trim();
    if (n.length < 2 || n.length > 60) return null;
    return n.split(' ').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  }
  function cleanPhone(s) {
    var raw = String(s || '').trim();
    if (/[^\d\s+()./-]/.test(raw)) return null;
    var digits = raw.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) return null;
    return (raw.trim().charAt(0) === '+' ? '+' : '') + digits;
  }

  function refCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var s = 'JMA-';
    for (var i = 0; i < 5; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    return s;
  }

  // ---------------------------------------------------------------------------
  // Engine
  // ---------------------------------------------------------------------------
  function createEngine(data) {
    var office = data.office;
    var phone1 = office.phones[0].label;
    var practices = data.practices;
    var practiceByKey = {};
    practices.forEach(function (p) { practiceByKey[p.key] = p; });
    var kb = data.kb;
    var kbDocs = Object.keys(kb).map(function (id) {
      var e = kb[id];
      return { kind: 'kb', id: id, title: e.title, examples: e.examples, text: e.answer, route: e.next };
    });
    var index = buildIndex(kbDocs.concat(data.docs));
    var transport = data.transport || { mode: 'demo' };

    function link(route, label) {
      if (!route) return null;
      return { route: route, label: label || data.nextLabel(route) };
    }
    data.nextLabel = data.nextLabel || function (route) {
      var base = route.replace(/[?#].*$/, '');
      if (data.nextLabels[route]) return data.nextLabels[route];
      if (data.nextLabels[base]) return data.nextLabels[base];
      var p = practices.filter(function (x) { return x.route === base; })[0];
      if (p) return 'Explore ' + p.label;
      var page = data.pages[base];
      return page ? page : 'Learn more';
    };

    function kbMsg(id, extra) {
      var e = kb[id];
      var msg = { text: e.answer, links: [], kb: id };
      if (e.next) msg.links.push(link(e.next));
      if ((id === 'FIR-05' || id === 'FIR-10') && office.whatsapp) msg.links.push({ href: office.whatsapp.href, label: 'Message the office on WhatsApp', icon: 'whatsapp' });
      if (extra) Object.keys(extra).forEach(function (k) { msg[k] = extra[k]; });
      return msg;
    }

    var CHIP_START = { label: 'Start an enquiry', action: 'intake:start' };
    // Visitors type their questions; the only standing option is to start an enquiry.
    var SUGGESTIONS = [CHIP_START];

    function reply(messages, opts) {
      opts = opts || {};
      return {
        messages: messages.filter(Boolean),
        chips: opts.chips || [],
        redactUser: !!opts.redactUser,
        send: opts.send || null,
        input: opts.input || { type: 'text', placeholder: 'Type your question…' },
        intent: opts.intent || (messages[0] && messages[0].kb) || null,
      };
    }

    function newSession(opts) {
      return { route: (opts && opts.route) || '/', intake: null, offer: null, urgentSeen: false, lastPractice: null, ref: null };
    }

    function greeting() {
      return reply([{
        text: 'Hello, I’m Alpuche AI, the firm’s automated assistant. Type a question about the firm and its services and I’ll point you to the right page, or I can pass a short enquiry to the office. I can’t give legal advice. Please keep names of other parties, documents and private details out of this chat.',
      }], { chips: SUGGESTIONS, intent: 'greeting' });
    }

    function offerIntake(session, practice) {
      session.offer = 'intake';
      if (practice) session.lastPractice = practice;
      return CHIP_START;
    }

    // ----- Answering free text -------------------------------------------------
    function answer(session, raw) {
      var t = normalise(raw);
      if (!t) return reply([{ text: 'Type your question in the box below.' }], { chips: SUGGESTIONS });

      // 1. Immediate danger
      if (has(P.danger, t)) {
        session.offer = null;
        return reply([kbMsg('CON-07', { kind: 'urgent' })], { intent: 'CON-07' });
      }

      // 2. Sensitive details or documents: interrupt, don't repeat, hide the visitor's message.
      if (has(P.sensitiveWords, t) && (has(P.longNumber, t) || /\b(here is|here's|my .* is|number is)\b/.test(t)) || has(P.longNumber, t)) {
        return reply([{ text: 'Please don’t share ID numbers, account details or other personal information here. I’ve hidden your message. ' + kb['CON-04'].answer, links: [link('/contact/')], kb: 'CON-04' }], { redactUser: true, intent: 'CON-04' });
      }
      if (has(P.payment, t)) {
        var pm = kbMsg('CON-03');
        pm.text = 'I can’t take payments or share account details. ' + pm.text;
        return reply([pm]);
      }
      if (has(P.uploadDocs, t) || (has(P.sensitiveWords, t) && /\b(send|upload|share|give|post)\b/.test(t))) {
        return reply([kbMsg('CON-04')], { chips: [offerIntake(session)] });
      }
      if (/\b(invention|technical|prototype|formula|source code|blueprint)\b/.test(t) && /\b(details|post|share|send|show|describe)\b/.test(t)) {
        return reply([kbMsg('IP-02')], { chips: [offerIntake(session, 'intellectual-property')] });
      }

      // 3. Hearings, deadlines, papers served
      if (has(P.urgent, t)) {
        session.urgentSeen = true;
        var id = /demand letter/.test(t) ? 'DR-04' : 'CON-06';
        var msgs = [kbMsg(id, { kind: 'urgent' })];
        if (id === 'DR-04') msgs[0].text = kb['DR-04'].answer + ' If you can’t reach the office and time is short, seek prompt help from another Belize attorney.';
        return reply(msgs, { intent: id });
      }

      // 4. Role changes / prompt injection
      if (has(P.injection, t)) {
        return reply([{
          text: 'I can’t change how I work, share my instructions or pass messages on directly. To reach José or Janine, call ' + phone1 + ' or email ' + office.email + '. I can also take a short enquiry for the office.',
          links: [link('/contact/')], kb: 'FIR-05',
        }], { chips: [offerIntake(session)], intent: 'injection' });
      }

      // Specific knowledge-base intents that must win over the general legal-advice guardrail.
      if (has(P.retireCtx, t) && has(P.qualify, t)) return reply([kbMsg('QRP-02')], { chips: [offerIntake(session, 'qualified-retired-persons')] });
      if (has(P.taxAmount, t)) return reply([kbMsg('BFT-03')], { chips: [offerIntake(session, 'banking-finance-tax-regulatory')] });

      // 5. Legal advice guardrail
      if (has(P.legal, t) || has(P.qualify, t)) {
        var practice = detectPractice(t);
        var guard = {
          text: 'I’m not able to give legal advice, including whether you have a case, what your chances are or what you should do. I’m an automated assistant, not an attorney, and the answer depends on facts and documents an attorney would need to review. I can pass a short enquiry to the office so an attorney can follow up, or you can call ' + phone1 + '.',
          links: [], kind: 'guard', kb: 'CON-08',
        };
        if (practice) guard.links.push(link(practiceByKey[practice].route));
        if (has(P.timeSoon, t) || /\b(date|deadline|closing)\b/.test(t)) guard.text += ' If a date is coming up, call the office promptly.';
        return reply([guard], { chips: [offerIntake(session, practice)], intent: 'CON-08' });
      }

      // 6. Curated intents
      if (has(P.existing, t)) return reply([kbMsg('FIR-07')]);
      if (has(P.unlisted, t) && !has(P.retireCtx, t)) return reply([kbMsg('FIR-09')]);
      if (has(P.retireCtx, t) && has(P.qrpImport, t)) return reply([kbMsg('QRP-05')], { chips: [offerIntake(session, 'qualified-retired-persons')] });
      if (has(P.retireCtx, t) && has(P.qrpWork, t)) return reply([kbMsg('QRP-04')], { chips: [offerIntake(session, 'qualified-retired-persons')] });
      if (has(P.retireCtx, t) && /\b(cost|fee|fees|how much|price)\b/.test(t)) return reply([kbMsg('QRP-02')], { chips: [offerIntake(session, 'qualified-retired-persons')] });
      if (has(P.retireCtx, t) && /\b(spouse|wife|husband|partner|family|dependant|dependent|child|children|documents?)\b/.test(t)) return reply([kbMsg('QRP-03')], { chips: [offerIntake(session, 'qualified-retired-persons')] });
      if (has(P.propertyCost, t)) return reply([kbMsg('RE-05')], { chips: [offerIntake(session, 'real-estate')] });
      if (has(P.booking, t)) {
        var bk = kbMsg('CON-01');
        bk.text = 'I can’t book appointments or confirm availability. ' + bk.text + ' I can also pass a short enquiry to the office so they can contact you.';
        return reply([bk], { chips: [offerIntake(session)] });
      }
      if (has(P.fees, t) && detectPractice(t) === 'real-estate') return reply([kbMsg('RE-05')], { chips: [offerIntake(session, 'real-estate')] });
      if (has(P.fees, t)) return reply([kbMsg('CON-03')], { chips: [offerIntake(session)] });
      if (/\bfacebook\b/.test(t) && office.facebook) {
        return reply([{ text: 'You can follow the firm on Facebook. For an enquiry, call the office, message it on WhatsApp or send an email.', links: [{ href: office.facebook, label: 'José M. Alpuche on Facebook', icon: 'facebook' }, link('/contact/')] }], { chips: [offerIntake(session)], intent: 'facebook' });
      }
      if (has(P.channels, t)) return reply([kbMsg('FIR-10')]);
      if (has(P.hours, t)) return reply([kbMsg('FIR-06')]);
      if (has(P.location, t)) return reply([kbMsg('FIR-04')]);
      if (has(P.janine, t)) return reply([kbMsg('FIR-03')]);
      if (has(P.bar, t)) return reply([kbMsg('FIR-02')]);
      if (has(P.child, t) && !has(P.retireCtx, t)) {
        var fa = kbMsg('FA-03');
        if (has(P.timeSoon, t)) fa.text += ' If this is time-sensitive, call the office promptly on ' + phone1 + '.';
        return reply([fa], { chips: [offerIntake(session, 'family-law')] });
      }
      if (has(P.registeredAgent, t)) return reply([kbMsg('CO-03')], { chips: [offerIntake(session, 'corporate-commercial')] });
      if (has(P.mediation, t)) return reply([kbMsg('DR-03')], { chips: [offerIntake(session, 'dispute-resolution')] });
      if (has(P.practiceList, t)) return reply([kbMsg('FIR-08')], { chips: [CHIP_START] });
      if (has(P.intake, t)) {
        var ip = detectPractice(t);
        return reply([{
          text: 'I can pass a short enquiry to the office' + (ip ? ' about ' + practiceByKey[ip].label : '') + ' so they can contact you about arranging a consultation. Would you like to start?',
          links: ip ? [link(practiceByKey[ip].route)] : [],
        }], { chips: [offerIntake(session, ip), { label: 'Not now', action: 'offer:no' }], intent: 'offer' });
      }
      if (has(P.jose, t)) return reply([kbMsg('FIR-01')]);
      if (has(P.contact, t)) return reply([kbMsg('FIR-05')], { chips: [offerIntake(session)] });

      // 7. Retrieval over everything published on the site
      var results = search(index, t);
      var top = results[0];
      var overseas = has(P.overseas, t);
      if (top && top.score >= 2.2 && top.coverage >= 0.34) {
        var d = top.doc;
        var practiceKey = detectPractice(t) || (d.route && practices.filter(function (p) { return d.route.indexOf(p.route) === 0; }).map(function (p) { return p.key; })[0]) || null;
        var msg;
        if (d.kind === 'kb') {
          msg = kbMsg(d.id);
        } else {
          msg = { text: sentences(d.text, 380), links: [link(d.route + (d.anchor ? '#' + d.anchor : ''), 'Read more: ' + d.page)], source: d.id };
        }
        if (overseas && practiceKey === 'real-estate') msg.text += ' ' + kb['CON-02'].answer;
        else if (overseas) msg.text += ' You can contact the office from abroad; share your time zone and the general topic.';
        if (has(P.timeSoon, t)) msg.text += ' If this is time-sensitive, call the office on ' + phone1 + '.';
        return reply([msg], { chips: [offerIntake(session, practiceKey)], intent: d.kind === 'kb' ? d.id : 'site:' + d.id });
      }

      // Small talk
      if (has(P.greeting, t)) return reply([{ text: 'Hello. What can I help you find?' }], { chips: SUGGESTIONS, intent: 'greeting' });
      if (has(P.thanks, t)) return reply([{ text: 'You’re welcome. Is there anything else I can help you find?' }], { chips: SUGGESTIONS, intent: 'thanks' });

      // 8. Fallback
      return reply([{
        text: 'I don’t have an answer to that on this website. The office can help: call ' + phone1 + ' or email ' + office.email + '. I can also pass a short enquiry to them.',
        links: [link('/practice-areas/', 'Browse practice areas')],
      }], { chips: [offerIntake(session)], intent: 'fallback' });
    }

    // ----- Lead intake -----------------------------------------------------------
    var STEPS = ['consent', 'area', 'name', 'channel', 'contact', 'confirmEmail', 'date', 'description', 'review'];

    function areaChips() {
      return practices.map(function (p) { return { label: p.label, action: 'intake:area:' + p.key }; })
        .concat([{ label: 'Not sure / something else', action: 'intake:area:other' }]);
    }

    function startIntake(session, area) {
      session.offer = null;
      session.intake = { step: 'consent', lead: { area: area && practiceByKey[area] ? area : null } };
      var msgs = [];
      if (session.urgentSeen) msgs.push({ text: 'If a hearing, deadline or closing is close, please call ' + phone1 + ' now. An enquiry here can’t protect a deadline.', kind: 'urgent' });
      msgs.push({
        text: 'I can pass a short enquiry to the office so they can contact you. I’ll ask for your name, how you’d like to be contacted and a sentence or two about the matter. Please keep it general: no names of other people, ID numbers, account details or documents. Sending an enquiry doesn’t mean the firm has agreed to act for you.',
        links: [link('/website-notice/', 'Website and AI notice')],
      });
      return reply(msgs, { chips: [{ label: 'Continue', action: 'intake:consent' }, { label: 'Not now', action: 'intake:cancel' }], intent: 'intake:consent' });
    }

    function ask(session, step) {
      var lead = session.intake.lead;
      session.intake.step = step;
      switch (step) {
        case 'area':
          if (lead.area) return reply([{ text: 'Is your enquiry about ' + practiceByKey[lead.area].label + '?' }], { chips: [{ label: 'Yes', action: 'intake:area:' + lead.area }, { label: 'Choose another area', action: 'intake:area:choose' }], intent: 'intake:area' });
          return reply([{ text: 'What is your enquiry about?' }], { chips: areaChips(), intent: 'intake:area', input: { type: 'text', placeholder: 'Or type the topic…' } });
        case 'name':
          return reply([{ text: 'What name should the office use?' }], { input: { type: 'text', placeholder: 'Your name', autocomplete: 'name' }, chips: [{ label: 'Cancel', action: 'intake:cancel' }], intent: 'intake:name' });
        case 'channel':
          var chips = [{ label: 'Email', action: 'intake:channel:email' }, { label: 'Phone call', action: 'intake:channel:phone' }];
          if (transport.firmWhatsApp) chips.push({ label: 'WhatsApp', action: 'intake:channel:whatsapp', icon: 'whatsapp' });
          return reply([{ text: 'Thanks, ' + lead.name.split(' ')[0] + '. How would you like the office to contact you?' }], { chips: chips, intent: 'intake:channel' });
        case 'contact':
          if (lead.channel === 'email') return reply([{ text: 'What email address should they use?' }], { input: { type: 'email', placeholder: 'name@example.com', autocomplete: 'email' }, intent: 'intake:contact' });
          return reply([{ text: (lead.channel === 'whatsapp' ? 'What WhatsApp number should they use?' : 'What phone number should they use?') + ' Include the country code if you’re outside Belize.' }], { input: { type: 'tel', placeholder: '+501 …', autocomplete: 'tel' }, intent: 'intake:contact' });
        case 'confirmEmail':
          return reply([{ text: 'Would you like an email confirmation of your enquiry? Enter your email address, or tap Skip.' }], { input: { type: 'email', placeholder: 'name@example.com (optional)', autocomplete: 'email' }, chips: [{ label: 'Skip', action: 'intake:skip' }], intent: 'intake:confirmEmail' });
        case 'date':
          return reply([{ text: 'Is there a hearing, deadline or closing date coming up?' }], { chips: [{ label: 'Yes', action: 'intake:date:yes' }, { label: 'No', action: 'intake:date:no' }, { label: 'Not sure', action: 'intake:date:unsure' }], intent: 'intake:date' });
        case 'description':
          return reply([{ text: 'In a sentence or two, what would you like help with? Keep it general, for example “buying land near Placencia” or “setting up a company with a partner”.' }], { input: { type: 'text', placeholder: 'Briefly describe the matter', multiline: true }, intent: 'intake:description' });
        case 'review':
          return review(session);
      }
    }

    function summaryLines(lead) {
      var lines = [
        ['Matter', lead.area && practiceByKey[lead.area] ? practiceByKey[lead.area].label : 'Not sure / other'],
        ['Name', lead.name],
        ['Contact by', { email: 'Email', phone: 'Phone call', whatsapp: 'WhatsApp' }[lead.channel]],
      ];
      if (lead.email) lines.push(['Email', lead.email]);
      if (lead.phone) lines.push(['Phone', lead.phone]);
      lines.push(['Date coming up', { yes: 'Yes', no: 'No', unsure: 'Not sure' }[lead.date]]);
      lines.push(['Message', lead.description]);
      return lines;
    }

    function review(session) {
      var lead = session.intake.lead;
      session.intake.step = 'review';
      var chips = [{ label: 'Send to the office', action: 'intake:send' }, { label: 'Start again', action: 'intake:restart' }, { label: 'Cancel', action: 'intake:cancel' }];
      if (transport.whatsapp) chips.splice(1, 0, { label: 'Send on WhatsApp instead', action: 'intake:whatsapp', icon: 'whatsapp' });
      return reply([{
        text: 'Here’s what I’ll send to the office:',
        summary: summaryLines(lead),
        note: 'By sending, you agree that the office may contact you about this enquiry using these details.' + (transport.mode === 'demo' ? ' (Demo: nothing will actually be sent.)' : ''),
      }], { chips: chips, intent: 'intake:review' });
    }

    function payload(session) {
      var lead = session.intake.lead;
      return {
        ref: session.intake.ref || (session.intake.ref = refCode()),
        area: lead.area || 'other',
        areaLabel: lead.area && practiceByKey[lead.area] ? practiceByKey[lead.area].label : 'Not sure / other',
        name: lead.name,
        channel: lead.channel,
        email: lead.email || '',
        phone: lead.phone || '',
        upcomingDate: lead.date,
        description: lead.description,
        page: session.route,
        source: 'Alpuche AI',
        website: '', // honeypot, always empty from the real assistant
      };
    }

    function whatsappText(p) {
      return 'Enquiry via Alpuche AI (ref ' + p.ref + ')\nMatter: ' + p.areaLabel + '\nName: ' + p.name +
        (p.email ? '\nEmail: ' + p.email : '') + (p.phone ? '\nPhone: ' + p.phone : '') +
        '\nDate coming up: ' + p.upcomingDate + '\nMessage: ' + p.description;
    }

    function emailPreviews(p) {
      var lines = summaryLines({ area: p.area === 'other' ? null : p.area, name: p.name, channel: p.channel, email: p.email, phone: p.phone, date: p.upcomingDate, description: p.description });
      var toOffice = 'Subject: New enquiry: ' + p.areaLabel + ' (' + p.ref + ')\n\n' + lines.map(function (l) { return l[0] + ': ' + l[1]; }).join('\n') +
        '\nSent from: ' + p.page + '\n\nSent by Alpuche AI. Check for conflicts before discussing details.';
      var toVisitor = p.email ? 'Subject: We received your enquiry (' + p.ref + ')\n\nDear ' + p.name + ',\n\nThank you for contacting the office of José M. Alpuche, Attorney-at-Law, about ' + p.areaLabel +
        '. The office will contact you by ' + ({ email: 'email', phone: 'phone', whatsapp: 'WhatsApp' }[p.channel]) + '.\n\nIf a hearing, deadline or closing date is close, please call ' + phone1 +
        '. This is an automated confirmation. Sending an enquiry does not create an attorney–client relationship.' : null;
      return { toOffice: toOffice, toVisitor: toVisitor };
    }

    function intakeText(session, raw) {
      var t = normalise(raw);
      var it = session.intake;
      var lead = it.lead;
      if (has(P.danger, t)) { session.intake = null; return reply([kbMsg('CON-07', { kind: 'urgent' })], { intent: 'CON-07' }); }
      if (has(P.cancel, t)) return intakeAction(session, 'intake:cancel');
      switch (it.step) {
        case 'consent':
          if (has(P.yes, t)) return intakeAction(session, 'intake:consent');
          if (has(P.no, t)) return intakeAction(session, 'intake:cancel');
          return reply([{ text: 'Shall I continue with the enquiry?' }], { chips: [{ label: 'Continue', action: 'intake:consent' }, { label: 'Not now', action: 'intake:cancel' }] });
        case 'area':
          if (lead.area && has(P.yes, t)) return intakeAction(session, 'intake:area:' + lead.area);
          var pk = detectPractice(t);
          if (pk) return intakeAction(session, 'intake:area:' + pk);
          if (/\b(not sure|other|something else|don't know|dont know|unsure)\b/.test(t)) return intakeAction(session, 'intake:area:other');
          return reply([{ text: 'Please choose the closest area, or “Not sure”.' }], { chips: areaChips() });
        case 'name':
          var n = cleanName(raw);
          if (!n || /\d/.test(raw)) return reply([{ text: 'Please enter just your name, using letters.' }], { input: { type: 'text', placeholder: 'Your name', autocomplete: 'name' } });
          lead.name = n;
          return ask(session, 'channel');
        case 'channel':
          if (/mail/.test(t)) return intakeAction(session, 'intake:channel:email');
          if (/whats/.test(t) && transport.firmWhatsApp) return intakeAction(session, 'intake:channel:whatsapp');
          if (/phone|call|ring|tel/.test(t)) return intakeAction(session, 'intake:channel:phone');
          return ask(session, 'channel');
        case 'contact':
          if (lead.channel === 'email') {
            var em = String(raw).trim();
            if (!EMAIL_RE.test(em) || em.length > 120) return reply([{ text: 'That doesn’t look like an email address. Please check it and try again.' }], { input: { type: 'email', placeholder: 'name@example.com', autocomplete: 'email' } });
            lead.email = em;
            return ask(session, 'date');
          }
          var ph = cleanPhone(raw);
          if (!ph) return reply([{ text: 'Please enter a phone number using digits, for example +501 223 1194.' }], { input: { type: 'tel', placeholder: '+501 …', autocomplete: 'tel' } });
          lead.phone = ph;
          return ask(session, 'confirmEmail');
        case 'confirmEmail':
          if (/^(skip|no|no thanks|none)\b/.test(t)) return intakeAction(session, 'intake:skip');
          var em2 = String(raw).trim();
          if (!EMAIL_RE.test(em2) || em2.length > 120) return reply([{ text: 'That doesn’t look like an email address. Enter it again, or tap Skip.' }], { input: { type: 'email', placeholder: 'name@example.com (optional)', autocomplete: 'email' }, chips: [{ label: 'Skip', action: 'intake:skip' }] });
          lead.email = em2;
          return ask(session, 'date');
        case 'date':
          if (has(P.yes, t)) return intakeAction(session, 'intake:date:yes');
          if (has(P.no, t)) return intakeAction(session, 'intake:date:no');
          return intakeAction(session, 'intake:date:unsure');
        case 'description':
          var desc = String(raw).replace(/\s+/g, ' ').trim();
          if (has(P.longNumber, t) || (has(P.sensitiveWords, t) && /\d/.test(t)) || /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(desc)) {
            return reply([{ text: 'That looks like it includes personal details such as an ID, account number or contact details. I’ve hidden it. Please describe the matter in general terms without them.' }], { redactUser: true, input: { type: 'text', placeholder: 'Briefly describe the matter', multiline: true } });
          }
          if (desc.length < 5) return reply([{ text: 'Please add a few more words so the office knows what it’s about.' }], { input: { type: 'text', placeholder: 'Briefly describe the matter', multiline: true } });
          if (desc.length > 500) return reply([{ text: 'Please keep it under 500 characters. The office will ask for details later.' }], { input: { type: 'text', placeholder: 'Briefly describe the matter', multiline: true } });
          lead.description = desc;
          if (!lead.area) lead.area = detectPractice(t);
          return review(session);
        case 'review':
          if (/\b(send|yes|submit|ok)\b/.test(t)) return intakeAction(session, 'intake:send');
          return review(session);
      }
      return ask(session, it.step);
    }

    function intakeAction(session, action, extra) {
      var it = session.intake;
      var parts = action.split(':');
      if (parts[1] === 'start') return startIntake(session, (extra && extra.area) || session.lastPractice);
      if (!it && parts[1] !== 'result') return startIntake(session, session.lastPractice);
      switch (parts[1]) {
        case 'cancel':
          session.intake = null;
          return reply([{ text: 'No problem, I haven’t sent anything. You can call the office on ' + phone1 + ' or email ' + office.email + ' at any time.' }], { chips: SUGGESTIONS, intent: 'intake:cancelled' });
        case 'restart':
          return startIntake(session, it.lead.area);
        case 'consent':
          return ask(session, 'area');
        case 'area':
          if (parts[2] === 'choose') { it.lead.area = null; return ask(session, 'area'); }
          it.lead.area = parts[2] === 'other' ? null : parts[2];
          it.areaDone = true;
          return ask(session, 'name');
        case 'channel':
          it.lead.channel = parts[2];
          return ask(session, 'contact');
        case 'skip':
          return ask(session, 'date');
        case 'date':
          it.lead.date = parts[2];
          if (parts[2] === 'yes') {
            var r = ask(session, 'description');
            r.messages.unshift({ text: 'Please also call the office on ' + phone1 + ' so they know about the date. An enquiry here can’t protect a deadline.', kind: 'urgent' });
            return r;
          }
          return ask(session, 'description');
        case 'send':
          if (it.step !== 'review') return ask(session, it.step);
          var p = payload(session);
          return reply([], { send: p, intent: 'intake:send' });
        case 'whatsapp':
          var pw = payload(session);
          var url = 'https://wa.me/' + String(transport.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(whatsappText(pw));
          return reply([{ text: 'Tap below to open WhatsApp with your enquiry ready to send. It will only be sent when you press send in WhatsApp.', links: [{ href: url, label: 'Open WhatsApp', icon: 'whatsapp' }] }], { chips: [{ label: 'Send by email instead', action: 'intake:send' }, { label: 'Cancel', action: 'intake:cancel' }] });
        case 'result':
          return result(session, extra || {});
      }
      return ask(session, it.step);
    }

    function result(session, res) {
      var p = res.payload;
      if (res.ok) {
        var lead = session.intake && session.intake.lead;
        session.ref = p.ref;
        session.intake = null; // forget the details once handed over
        var channelText = { email: 'email', phone: 'phone', whatsapp: 'WhatsApp' }[p.channel];
        if (res.mode === 'demo') {
          var pv = emailPreviews(p);
          return reply([{
            text: 'Demo mode: nothing was sent. In the live version, the office would receive your enquiry by email' + (p.email ? ' and a confirmation would go to ' + p.email : '') + '. Here is what those emails would say:',
            previews: [{ title: 'Email to the office', body: pv.toOffice }].concat(pv.toVisitor ? [{ title: 'Confirmation to the visitor', body: pv.toVisitor }] : []),
          }], { chips: [], intent: 'intake:demo' });
        }
        return reply([{
          text: 'Done. Your enquiry has been sent to the office (reference ' + p.ref + ').' + (p.email ? ' A confirmation is on its way to ' + p.email + '.' : '') +
            ' The office will contact you by ' + channelText + '. If a date is close, please call ' + phone1 + '.',
          kind: 'success',
        }], { chips: [], intent: 'intake:sent' });
      }
      return reply([{
        text: 'I couldn’t send that just now. Please call the office on ' + phone1 + ' or email ' + office.email + '.',
        kind: 'urgent',
      }], { chips: [{ label: 'Try again', action: 'intake:send' }, { label: 'Cancel', action: 'intake:cancel' }], intent: 'intake:error' });
    }

    function handle(session, input) {
      if (input.action) {
        var a = input.action;
        if (a.indexOf('kb:') === 0) { var id = a.slice(3); session.offer = null; return reply([kbMsg(id)], { chips: [offerIntake(session, practiceForKb(id))] }); }
        if (a === 'offer:no') { session.offer = null; return reply([{ text: 'No problem. Is there anything else I can help you find?' }], { chips: SUGGESTIONS }); }
        if (a.indexOf('intake:') === 0) return intakeAction(session, a, input);
        return greeting();
      }
      var text = String(input.text || '').slice(0, 600);
      if (session.intake) return intakeText(session, text);
      var t = normalise(text);
      if (session.offer === 'intake' && has(P.yes, t) && t.split(' ').length <= 4) return startIntake(session, session.lastPractice);
      if (session.offer === 'intake' && has(P.no, t) && t.split(' ').length <= 3) return handle(session, { action: 'offer:no' });
      session.offer = null;
      return answer(session, text);
    }

    function practiceForKb(id) {
      var e = kb[id];
      if (!e || !e.next) return null;
      var base = e.next.replace(/[?#].*$/, '');
      var p = practices.filter(function (x) { return x.route === base; })[0];
      if (p) return p.key;
      var m = e.next.match(/area=([a-z-]+)/);
      return m ? m[1] : ({ RE: 'real-estate', CO: 'corporate-commercial', BFT: 'banking-finance-tax-regulatory', DR: 'dispute-resolution', IP: 'intellectual-property', FA: 'family-law', QRP: 'qualified-retired-persons' })[id.split('-')[0]] || null;
    }

    return { newSession: newSession, greeting: greeting, handle: handle, search: function (q) { return search(index, q); }, tokens: tokens };
  }

  return { createEngine: createEngine, normalise: normalise };
});
