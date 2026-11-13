/* Alpuche AI: conversation engine for the José M. Alpuche website.
   Runs entirely in the browser (and in Node for tests). No model, no network calls.

   Order of handling, following ai/assistant-instructions.md:
     1. immediate danger → emergency services
     2. sensitive details (ID numbers, documents) → stop, don't repeat, hide the message
     3. hearing / deadline / court papers → call the office now
     4. attempts to change the assistant's role
     5. requests for legal advice → guardrail
     6. front desk: direct answers to what was asked (hours, today's opening, address, phone,
        email, fees, the people, "do you handle …?" with a plain yes and the practice's scope,
        unlisted services named back, several office facts in one question answered together)
     7. curated knowledge-base entries, written in the firm's formal front-desk register
     8. retrieval over everything published on the site, quoting the best-matching sentence
     9. fallback → office contact and an offer to pass on an enquiry
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

  // Common misspellings and chat shorthand, fixed before free-text questions are matched.
  var FIXES = [
    [/\b(whatsap|watsapp|watsap|whatapp|whats app|whatssap)\b/g, 'whatsapp'],
    [/\b(adress|addres|adresss|addresss)\b/g, 'address'],
    [/\bhrs\b/g, 'hours'], [/\bopen(ing)? times?\b/g, 'opening hours'],
    [/\b(lawer|lawyr|lwyer)\b/g, 'lawyer'], [/\b(attorny|atorney|attourney|attorneys?-at-law)\b/g, 'attorney'],
    [/\b(devorce|divorse|divorve|divoce)\b/g, 'divorce'], [/\b(propety|proprety|porperty|propperty)\b/g, 'property'],
    [/\b(buisness|bussiness|busines|bizness|buissness)\b/g, 'business'], [/\btrade marks?\b/g, 'trademark'],
    [/\b(consultaion|consulation|consultion)\b/g, 'consultation'], [/\b(apointment|appoinment|appointmant)\b/g, 'appointment'],
    [/\b(you guys|y'?all|you all|ya'?ll|yous)\b/g, 'you'], [/\bu\b/g, 'you'], [/\bur\b/g, 'your'], [/\br\b/g, 'are'],
    [/\b(pls|plz|pleas)\b/g, 'please'], [/\bwat\b/g, 'what'], [/\bwhats\b/g, 'what is'], [/\bwhere'?s\b/g, 'where is'],
    [/\bmr\.? alpuche\b/g, 'mr alpuche'], [/\bjose m\.? alpuche\b/g, 'jose alpuche'],
  ];
  function tidy(t) {
    FIXES.forEach(function (f) { t = t.replace(f[0], f[1]); });
    return t.replace(/\s+/g, ' ').trim();
  }

  // From a longer passage, the sentence that best matches the question (plus the next one if it fits).
  function bestSentences(text, query, max) {
    var parts = (String(text).match(/[^.!?]+[.!?]+(\s|$)/g) || [String(text)]).map(function (x) { return x.trim(); }).filter(Boolean);
    if (parts.length <= 2) return parts.join(' ');
    var q = new Set(tokens(query));
    var best = -1;
    var bestN = 0;
    parts.forEach(function (sn, i) {
      var seen = new Set();
      tokens(sn).forEach(function (x) { if (q.has(x)) seen.add(x); });
      if (seen.size > bestN) { bestN = seen.size; best = i; }
    });
    if (best < 0) return sentences(text, max);
    var out = [parts[best]];
    if (best > 0 && /^(this|that|it|they|these|those|such)\b/i.test(parts[best])) out.unshift(parts[best - 1]);
    var next = parts[best + 1];
    if (next && (out.join(' ') + ' ' + next).length <= max && out.length === 1) out.push(next);
    return out.join(' ');
  }

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

  // Words that say "this is a legal question" without saying what it is about.
  var GENERIC = new Set(('matter issue problem question legal law help advice advise case situation thing something ' +
    'lawyer attorney service information info regard concern about assist assistance support person someone talk speak ' +
    'belize belizean way good best right correct wrong new old type kind sort').split(' '));
  function search(index, query, filter) {
    var q = Array.from(new Set(tokens(query))).filter(function (x) { return !GENERIC.has(x); });
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
    legal: /\b(do i have a (good |strong |valid )?(case|claim)|is (this|it|that) a (good )?case|should i (sign|sue|settle|accept|pay|agree|file|appeal|plead|go to court|refuse|move out|leave|stop paying|respond)|will i (win|lose|get (it|my|the|anything|money|compensation|custody|back)|have to pay (them|him|her|damages|compensation|back))|would i win|can i (sue|claim|win)|could i sue|chances? of (winning|success)|my chances|is (it|this|that) (legal|illegal|allowed|against the law|lawful)|am i (liable|entitled|responsible|in trouble)|what are my (rights|options|chances)|is my (contract|agreement|lease|will|deed) (valid|enforceable|legal|binding|safe|ok)|is (this|the) (contract|agreement|clause) (valid|enforceable|safe|binding|fair)|what should i do|what do i do|advise me|legal advice|give me advice|your advice|tell me what to (do|sign)|how much (compensation|damages)|can (they|he|she|my \w+) (do that|evict|fire|sue|take)|is (he|she|they) allowed|interpret|what does (this|my|the) (clause|contract|letter|order) mean|get (it|my \w+|the \w+) back|will a judge|is it worth (suing|going to court)|do i need to (respond|reply)|(if|whether) (my|the|this) (contract|agreement|lease|will|deed|clause|document) is (valid|enforceable|legal|binding|safe|ok|fair)|my (contract|agreement|lease|will|deed) (is|isn'?t|is not) (valid|enforceable|legal|binding))\b/,
    existing: /\b((my|active|existing|current|ongoing|open) (case|matter|file)|status of my|update on my|progress (on|of) my|has my \w+ been (filed|registered|approved|sent|done)|i(?:'m| am) (already )?a client|my (attorney|lawyer) (is|at))\b/,
    payment: /\b(bank (details|account|info)|account details|pay (you|online|by card|the firm|a retainer|now)|payment (link|details)|send (me )?(your )?(bank|account|payment)|wire (money|transfer|funds)|transfer (money|funds)|i want to pay|how (do|can) i (pay|make (a )?payment)|credit cards?|debit cards?|card payments?|(accept|take) (cards?|cash|cheques?|checks?|paypal|bank transfers?|payments?)|payment (methods?|options?|plans?))\b/,
    taxAmount: /\b((how much|what) (tax|taxes)|tax (do|will|would) i (owe|pay)|calculate (my )?tax|my tax (bill|liability))\b/,
    propertyCost: /\b(stamp duty|duties|transfer tax|closing costs?|registration (fee|cost)s?|how long (will|does|would|do) .{0,30}(registration|transfer|closing|purchase|title))\b/,
    fees: /\b(how much (is|are|do|does|will|would)|costs?|fees?|price|pricing|rates?|what do you charge|do you charge|charge for|free (consult\w*|first)|(is|are) (the |a |your )?(first|initial)? ?(call|meeting|consultation|consultations) free|retainer|quotes?|quotations?|estimates?|have to pay|pay for (the |a |my )?(first |initial )?(consultation|meeting|call|appointment))\b/,
    booking: /\b(book|booking|schedule|appointment|reserve|slot|meet with|meeting with|set up a (call|meeting)|available (today|tomorrow|this week)|see (jose|mr alpuche|the attorney|a lawyer) (today|tomorrow))\b/,
    whatsapp: /\b(whatsapp|text (you|the office)|sms|message (you|the office))\b/,
    language: /\b(spanish|espanol|kriol|creole|garifuna|mandarin|chinese|french|german|languages?|speak english|in english)\b/,
    video: /\b(zoom|video|virtual(ly)?|online|remote(ly)?|skype|facetime|teams)\b.{0,40}\b(consult\w*|meeting|meet|call|appointment)\b|\b(consult\w*|meet|meeting|appointment)\b.{0,40}\b(zoom|video|virtual(ly)?|online|remote(ly)?|skype|facetime)\b/,
    phoneQ: /\b(phone|telephone|tel|cell|contact number|phone number|number to call|(your|the office'?s?|the firm'?s?) number|call (you|the office|the firm)|ring (you|the office))\b/,
    emailQ: /\b(e-?mail)\b/,
    otherOffice: /\b((other|another|second|branch|more than one) offices?|offices? in (san pedro|belmopan|cayo|san ignacio|placencia|orange walk|corozal|dangriga|punta gorda|ambergris( caye)?|caye caulker|belize city|the districts?)|(do you|does the firm) have (an |any )?offices? (in|on|at|outside))\b/,
    visit: /\b(walk[ -]?ins?|walk in|drop (in|by)|stop by|pop in|come (in|by|to (the|your) office)|visit (the|your) office|visit you)\b/,
    parking: /\b(parking|where (can|do) i park|park (my car|there))\b/,
    team: /\b(who works (there|at|in|for)|who (else )?(is|are) (on|in) (the|your) team|(your|the firm'?s?|the) (team|staff)|how many (lawyers|attorneys|people|staff|employees)|who are (the|your) (lawyers|attorneys|staff|people)|other (lawyers|attorneys))\b/,
    firstContact: /\bwho (will|would|do) (i|answer|respond|reply|call|contact|speak|talk)\b/,
    education: /\b(educat\w*|stud(y|ied)|school|university|degree|qualif\w*|credentials|trained|training|bar vocational)\b/,
    experience: /\b(experience|experienced|how long|years|since when|background|career|been practi\w*|in practice|established)\b/,
    clientTypes: /\b(do|does|can|will) (you|the firm|he) (work with|represent|act for|help|serve|take on|advise|accept) (individuals|private (clients|individuals)|businesses|companies|famil(y|ies)|corporations|small businesses|people|clients|foreigners|foreign (clients|nationals|buyers|investors)|expats|non-?residents|international clients|americans|canadians|people (from abroad|outside belize|overseas))\b/,
    fromAbroad: /\b(from (abroad|overseas|outside (of )?belize|another country|canada|the (us|usa|states|uk))|(do|must|will) i (have to|need to) (be|come|travel|fly) (in|to) belize|(have to|need to|must) (come|travel|fly) (to|down to) belize|(i )?(live|living|am|based|located|reside|residing) (abroad|overseas|outside (of )?belize|in (canada|the us|the usa|the states|america|the uk|england|europe|mexico|guatemala))|outside (of )?belize)\b/,
    notOurs: /\b(survey\w*|valuations?|apprais\w*|inspections?|build(ing)? permits?|construction|architect\w*|accounting|bookkeeping|audit\w*|realtors?|(real )?estate agents?|translat\w*|private investigat\w*|insurance)\b/,
    reachJose: /\b(reach|contact|get hold of|get in touch with|call|email|phone) (jose|mr alpuche|the attorney|the lawyer|him)\b/,
    helpMe: /^(can you help( me)?|could you help( me)?|can you assist( me)?|i need (some )?help|help|help me|please help|i have a question|can i ask (you )?(a )?question)\W*$/,
    seekAdvice: /\b(i|we) (need|want|would like|am looking for|'?m looking for|am seeking|'?m seeking|require|could use|need to get|want to get) (some |a little |urgent |professional |proper )?(legal )?(advice|counsel|guidance|help|assistance|representation|a consultation|to consult|to see (a|the) (lawyer|attorney))\b|\b(looking|seeking) for (legal )?(advice|help|assistance|representation)\b|\b(need|want) (a|an) (lawyer|attorney)( to)?\b|\bi need (advice|help) (on|with|about|regarding|for)\b|\b(talk|speak) (to|with) (someone|somebody|a person) (about|regarding)\b/,
    vagueMatter: /\b(i|we) (have|'?ve got|got|am facing|'?m facing|am dealing with|'?m dealing with|am having|'?m having) (a|an|some|this) (small |big |serious |urgent |personal |private |legal |family |business )?(legal )?(matter|issue|problem|question|situation|case|dispute|concern|query|enquiry|inquiry)\b|\b(i|we) (have|'?ve got) (a )?(question|questions|query) (about|regarding|on)\b/,
    timing: /\bhow long (does|will|would|do|is|can)\b|\bhow (quickly|fast|soon) (can|will|does|do)\b.{0,30}\b(register|form|incorporat|transfer|complet|finish|done|process)|\b(timeframe|time frame|timeline|turnaround time)\b/,
    aboutFirm: /\b(tell me (more )?about (the firm|your firm|the practice|the office|yourselves|you guys|the company)|about (the|your) (firm|practice)|what is (this|the|your) (firm|practice)|who is the firm|describe (the|your) firm)\b/,
    wantTo: /\b(i (want|need|would like|wish|plan|intend|hope) to|i'?d like to|i (am|'?m) (planning|looking|hoping|trying) to|i (am|'?m) (buying|selling|starting|opening|forming|getting|registering)|we (want|need|would like|plan|intend) to|i need (a|an|help|some help))\b/,
    prepare: /\b(what (should|do|must) i (bring|prepare|have ready|take)|what do i need to (bring|prepare|have)|how (should|do|can) i prepare|prepare for (the|my|a) (first )?(consultation|meeting|appointment|discussion)|bring to (the|my|a) (first )?(consultation|meeting|appointment))\b/,
    process: /\b(what happens (after|next|when|once|then)|what (is|are) the (next )?steps?|how does (it|the process|this) work|what (is|does) the process|what to expect|what can i expect)\b/,
    getStarted: /\bhow (do|can|should) i (get started|start|begin|proceed|become a client|hire you|retain you|engage you)\b(?!\s+(a|an|my|the|with|on)\b)/,
    mediatorRole: /\b(act as|be|serve as) (a |my |our |the )?(mediator|arbitrator)\b/,
    confidential: /\b(confidential|privileged|privilege|attorney.client|are you my (lawyer|attorney)|is (jose|mr alpuche|the firm) my (lawyer|attorney)|accept service|serve (you|the firm|documents))\b/,
    responseTime: /\bhow (long|soon|quickly|fast) (will|does|do|would|until|before)\b.{0,40}\b(respond|reply|hear back|get back|call (me )?back|contact me|answer|response|hear from)\b|\bwhen will (i hear|someone (call|contact|get back)|you (call|get back|respond|reply|contact)|the office (call|contact|respond|reply))\b|\bresponse time\b|\bturnaround\b/,
    botIdentity: /\b((are|r) you|is this|am i (talking|speaking|chatting) (to|with)) (a |an )?(real |actual |live )?(person|human( being)?|people|lawyer|attorney|bot|robot|chat ?bot|ai|machine|computer|automated|real|someone)\b|\bwho (am i (talking|speaking|chatting) (to|with)|are you)\b|\bwhat are you\b|\bwhat is alpuche ai\b/,
    botAbilities: /\bwhat (can you do|are you able to do|are you capable of)\b|\bwhat can i ask( you)?\b|\bhow (does this|do you) work\b|\bhow can you help( me)?\b/,
    guides: /\b(guides?|articles?|resources|blog|insights|publications?)\b/,
    privacy: /\b(privacy|personal data|my data|data protection|cookies?|tracking|(is|are) (this|my|the) (chat|conversation|information|info|data|details) (stored|saved|recorded|kept|logged|private|secure|safe)|do you (store|save|keep|record|log))\b/,
    howAreYou: /^((hi|hello|hey|good (morning|afternoon|evening)),? )?(how are you( doing| today)?|how('?s| is) it going|how do you do)[\s?!.,]*$/,
    bye: /^(bye|goodbye|good bye|see you|that'?s all|that is all|no,? that'?s (all|it)|nothing else)\b/,
    hours: /\b(office hours|opening hours|business hours|working hours|your hours|the hours|hours of (business|operation)|hours|what time|closing time|lunch( hour| break| time)?|(are|is) (you|the office|your office|it|the firm) (open|closed)|you open|office open|open (on|today|tomorrow|tonight|now|right now|late|early|until|till|at|during|over|this)|weekends?|saturdays?|sundays?|public holidays?|when (do|does) (you|the office|it) (open|close)|(come|visit|arrive|drop by|stop by|call) (in |by )?(at|around|before|after) \d+(?:[:.]\d\d)? ?(?:a\.?m|p\.?m)?)\b/,
    location: /\b(where (are|is) (you|the office|your office|the firm|it)|address|located|location|directions|find (you|the office)|map|get there|how do i get (to|there))\b/,
    contact: /\b(contact (you|the office|the firm|details|information|info)|reach (you|the office|the firm|someone)|speak to (someone|a person|a human)|talk to (someone|a person|a human)|get hold of|how (do|can) i (contact|reach|get in touch))\b/,
    janine: /\bjanine\b/,
    jose: /\b(jose|alpuche|who (runs|owns|leads|heads) (the|this|your) (firm|practice|office)|who is (the|your) (lawyer|attorney|principal)|your lawyer|the attorney)\b/,
    bar: /\b(president|bar association)\b/,
    cap: /\b(do|does|can|could|will|would) (you|the firm|your firm|your office|the office|mr alpuche|jose|he|your (lawyer|attorney)|the (lawyer|attorney)) (also |even |ever |still )?(do|handle|take( on)?|help( with| me| us)?|assist( with| me)?|deal with|practi[cs]e|offer|work (on|with)|represent|act (for|in|on)|cover|provide|specialize in|specialise in|prepare|draft|review|register|file|form|set up|advise( on)?)\b|\b(is the firm|are you) (able to|experienced in|familiar with)\b|\b(do you|does the firm|does he) have (any )?(experience|expertise)\b/,
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
    thanks: /^(ok(ay)? |great,? |perfect,? )?(thanks|thank you|thx|ty|cheers|many thanks|much appreciated|appreciated|thanks a lot|thank you (so|very) much|thanks (so|very) much|great|perfect|that'?s (very )?helpful)( (so|very) much)?( for (your|the) help)?[\s!.,]*$/,
    yes: /^(yes|yeah|yep|yup|sure|ok|okay|please|go ahead|continue|start|y)\b/,
    no: /^(no|nope|not now|no thanks|later|n)\b/,
    cancel: /^(cancel|stop|quit|exit|never ?mind|forget it|start over|restart)\b/,
    practiceList: /\b(practice areas?|areas? of (practice|law|expertise|specialt(y|ies)|speciali[sz]ation)|what (type|types|kind|kinds|sort|sorts|areas?|fields?|branch(es)?) of (law|legal|cases?|matters?|work|services?|clients?|issues?|problems?|lawyer|attorney|firm|practice)|what (legal )?(services|matters|cases|work) (do|does|can)|what (do|does|can) (you|the firm|your firm|your office|mr alpuche|jose|he) (do|offer|practi[cs]e|handle|cover|specialize in|specialise in|focus on|work on|deal with)|(what|which) (services|matters|cases|areas)|what (is|are) (your|the firm'?s?) (specialt(y|ies)|speciality|specialities|speciali[sz]ations?|expertise|focus|services|practice areas)|(do|does) (you|the firm|he) speciali[sz]e|list of services|what can (you|the firm|your firm|mr alpuche|jose) help (me |us )?with|what (law|kind of law|areas) do you)\b/,
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
  function createEngine(data, engineOpts) {
    engineOpts = engineOpts || {};
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
        text: salutation() + ', and welcome to the office of José M. Alpuche, Attorney-at-Law. I’m Alpuche AI, the firm’s automated front-desk assistant. I can answer questions about the firm, its practice areas and the office, or take a short enquiry for the attorney. I can’t give legal advice, so please keep names of other parties, documents and private details out of this chat.',
      }], { chips: SUGGESTIONS, intent: 'greeting' });
    }

    function offerIntake(session, practice) {
      session.offer = 'intake';
      if (practice) session.lastPractice = practice;
      return CHIP_START;
    }

    // ----- Front desk: office facts, hours and the firm's services --------------
    var hoursSpec = office.hoursSpec || { days: [1, 2, 3, 4, 5], open: 8, close: 17, utcOffset: -6 };
    var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    function clock(h, m) { return ((h % 12) || 12) + ':' + ((m || 0) < 10 ? '0' : '') + (m || 0) + (h < 12 ? ' a.m.' : ' p.m.'); }
    var OPEN = clock(hoursSpec.open, 0);
    var CLOSE = clock(hoursSpec.close, 0);
    var HOURS = 'Monday to Friday, from ' + OPEN + ' to ' + CLOSE + ', Belize time';
    var phones = office.phones.map(function (p) { return p.label; });
    var ADDRESS = office.address.join(', ');
    function belizeNow() {
      var d = engineOpts.now ? new Date(engineOpts.now()) : new Date();
      var b = new Date(d.getTime() + hoursSpec.utcOffset * 3600000);
      return { day: b.getUTCDay(), h: b.getUTCHours(), m: b.getUTCMinutes() };
    }
    function workday(d) { return hoursSpec.days.indexOf(d) !== -1; }
    function salutation() { var h = belizeNow().h; return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
    function isYesNo(t) { return /(^|[,.;:] )(do|does|did|can|could|is|are|will|would|may|might|have|has|shall)\b/.test(t); }
    var contactLink = function () { return link('/contact/'); };
    var directionsLink = function () { return office.directions ? { href: office.directions, label: 'Get directions' } : null; };

    function hoursReply(t) {
      var now = belizeNow();
      var caveat = ' Hours may differ on public holidays.';
      var dayM = t.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)s?\b/);
      if (/\b(weekends?|saturdays?|sundays?)\b/.test(t)) {
        return reply([{ text: 'No. The office is open ' + HOURS.replace('Monday to Friday,', 'Monday to Friday only,') + '.', links: [contactLink()] }], { intent: 'hours:weekend' });
      }
      if (/\btomorrow\b/.test(t)) {
        var tm = (now.day + 1) % 7;
        return reply([{ text: workday(tm) ? 'Yes. Tomorrow is ' + DAY_NAMES[tm] + ', and the office will be open from ' + OPEN + ' to ' + CLOSE + ', Belize time.' + caveat
          : 'No. Tomorrow is ' + DAY_NAMES[tm] + ', and the office is open ' + HOURS.replace('Monday to Friday,', 'Monday to Friday only,') + '.', links: [contactLink()] }], { intent: 'hours:tomorrow' });
      }
      if (dayM) {
        var dn = DAY_NAMES.map(function (x) { return x.toLowerCase(); }).indexOf(dayM[1]);
        return reply([{ text: workday(dn) ? 'Yes. The office is open on ' + DAY_NAMES[dn] + 's from ' + OPEN + ' to ' + CLOSE + ', Belize time. Around public holidays, please telephone ahead to confirm.'
          : 'No. The office is open ' + HOURS.replace('Monday to Friday,', 'Monday to Friday only,') + '.', links: [contactLink()] }], { intent: 'hours:day' });
      }
      if (/\b(now|right now|at the moment|currently|today|tonight|still open|this (morning|afternoon|evening))\b/.test(t)) {
        var time = clock(now.h, now.m) + ' on ' + DAY_NAMES[now.day] + ' in Belize';
        var text;
        if (workday(now.day) && now.h >= hoursSpec.open && now.h < hoursSpec.close) text = 'Yes. It is ' + time + ', and the office is open until ' + CLOSE + ' today.' + caveat;
        else if (workday(now.day) && now.h < hoursSpec.open) text = 'Not yet. It is ' + time + ', and the office opens at ' + OPEN + ' today.' + caveat;
        else {
          var next = 1;
          while (next < 8 && !workday((now.day + next) % 7)) next++;
          text = 'No. It is ' + time + '. The office is open ' + HOURS + ', and next opens at ' + OPEN + ' ' + (next === 1 ? 'tomorrow' : 'on ' + DAY_NAMES[(now.day + next) % 7]) + '.';
        }
        return reply([{ text: text, links: [contactLink()] }], { intent: 'hours:now' });
      }
      var at = t.match(/\b(?:at|by|after|before|around) (\d{1,2})(?::(\d{2}))? ?(a\.?m\.?|p\.?m\.?)?/);
      if (at) {
        var hh = parseInt(at[1], 10) % 12 + (/^p/.test(at[3] || '') || (!at[3] && parseInt(at[1], 10) < 7) ? 12 : 0);
        var mm = parseInt(at[2] || '0', 10);
        var inHours = hh * 60 + mm >= hoursSpec.open * 60 && hh * 60 + mm < hoursSpec.close * 60;
        return reply([{ text: (inHours ? 'Yes. ' : 'No. ') + 'The office is open ' + HOURS + '.' + (/\b(come|visit|arrive|drop|stop)\b/.test(t) ? ' Please telephone ahead so that a time can be arranged.' : ''), links: [contactLink()] }], { intent: 'hours:at' });
      }
      if (/\bholiday/.test(t)) return reply([{ text: 'The website does not list public-holiday hours. The office is open ' + HOURS + '; around public holidays, please telephone ahead to confirm.', links: [contactLink()] }], { intent: 'hours:holiday' });
      if (/\blunch\b/.test(t)) return reply([{ text: 'The website does not mention a lunch-hour closure. The office is open ' + HOURS + '; if you plan to visit around midday, please telephone ahead.', links: [contactLink()] }], { intent: 'hours:lunch' });
      if (/\b(close|closes|closing|shut|until|till)\b/.test(t)) return reply([{ text: 'The office closes at ' + CLOSE + ', Belize time, Monday to Friday.', links: [contactLink()] }], { intent: 'hours:close' });
      if (/\b(what time|when) (do|does) (you|the office|it) open\b|\bopening time\b|\bopen at what time\b|\bhow early\b/.test(t)) return reply([{ text: 'The office opens at ' + OPEN + ', Belize time, Monday to Friday.', links: [contactLink()] }], { intent: 'hours:open' });
      return reply([kbMsg('FIR-06')], { intent: 'FIR-06' });
    }

    function practiceScope(key, yes) {
      var p = practiceByKey[key];
      return reply([{ text: (yes ? 'Yes. ' : '') + 'The firm’s ' + p.label + ' practice covers ' + p.scope + '.', links: [link(p.route)] }], { chips: [offerIntake(session0, key)], intent: 'scope:' + key });
    }
    var session0 = null; // the session being answered (set in answer())

    function practiceList() {
      return reply([{
        text: 'The firm practises in seven areas of Belize law, acting for individuals, families and businesses:',
        items: practices.map(function (p) { return { label: p.label, route: p.route }; }),
        after: 'If you are unsure which area applies, the office can help identify the right starting point.',
        kb: 'FIR-08',
      }], { chips: [CHIP_START], intent: 'FIR-08' });
    }

    // Services the firm lists, most specific first. `kb` answers start "The firm …", so a "Yes." can lead.
    var SERVICES = [
      { re: /\btitle (search|searches|check|checks)\b/, kb: 'RE-02' },
      { re: /\b(shareholder|partnership) agreements?\b|\bjoint ventures?\b/, kb: 'CO-04' },
      { re: /\b(incorporat\w*|company formation|(company|business) registration|(form|forming|register|registering|set up|setting up|start|starting|open|opening) (up )?(a |an |my |our )?(new )?(company|business|llc|llp|corporation|partnership))\b/, kb: 'CO-01' },
      { re: /\barbitrat\w*/, kb: 'DR-02' },
      { re: /\bmediat\w*/, kb: 'DR-03' },
      { re: /\b(litigat\w*|lawsuits?|court (cases?|matters?|proceedings?|work)|civil (cases?|disputes?|claims?|matters?)|disputes?|in court|go(ing)? to court|court|trials?|hearings?|owes? (me|us)|owed|debts?|unpaid|overdue|recover\w*|breach\w*)\b/, kb: 'DR-01' },
      { re: /\btrademarks?\b|\b(brand|logo) (protection|registration)\b|\b(protect|register) (my |a |our )?(brand|logo|business name)\b/, kb: 'IP-01' },
      { re: /\bpatents?\b|\binventions?\b/, kb: 'IP-02' },
      { re: /\bcopyrights?\b/, kb: 'IP-03' },
      { re: /\bintellectual property\b|\bip (law|matters?|work|rights)\b/, practice: 'intellectual-property' },
      { re: /\bdivorces?\b|\bseparations?\b/, kb: 'FA-01' },
      { re: /\badopt(ion|ions|ing)?\b/, kb: 'FA-02' },
      { re: /\b(family (law|matters?|cases?|disputes?)|custody|child (support|maintenance)|maintenance|guardianship)\b/, practice: 'family-law' },
      { re: /\b(qrp|qualified retired|retirement program(me)?|retire|retirement|retiring|retirees?|relocat\w*)\b/, practice: 'qualified-retired-persons' },
      { re: /\b(guarantees?|mortgages?)\b/, kb: 'BFT-02' },
      { re: /\b(loans?|facility agreements?|financing|finance|banking|term sheets?|lending)\b/, kb: 'BFT-01' },
      { re: /\btax(es|ation)?\b/, kb: 'BFT-03' },
      { re: /\b(regulatory|regulation|licen[cs]ing|licen[cs]es?|compliance)\b/, practice: 'banking-finance-tax-regulatory' },
      { re: /\b(contracts?|agreements?)\b/, kb: 'CO-05' },
      { re: /\b(conveyanc\w*|(buy|buying|purchas\w*|sell|selling|sale of|transfer\w*) (a |some |my |the |our )?(land|property|house|home|lot|condo|villa|parcel)|property (purchase|sale|transaction|transfer)s?)\b/, kb: 'RE-01' },
      { re: /\b(real ?estate|propert(y|ies)|lands?|houses?|homes?|lots?|condos?|villas?|title)\b/, kb: 'RE-01', broad: true },
      { re: /\b(corporate|commercial|compan(y|ies)|business(es)?|llcs?)\b/, practice: 'corporate-commercial', broad: true },
    ];
    function findService(t) {
      for (var i = 0; i < SERVICES.length; i++) {
        if (SERVICES[i].re.test(t)) {
          var s = SERVICES[i];
          return { kb: s.kb || null, practice: s.practice || practiceForKb(s.kb), broad: !!s.broad };
        }
      }
      return null;
    }

    // Services the firm does not list. Wording names exactly what was asked about.
    var UNLISTED = [
      { re: /\b(notar(y|ies|ial|i[sz]e|i[sz]ed|i[sz]ation)|apostilles?)\b/, notary: true },
      { re: /\b(criminal|defen[cs]e (attorney|lawyer)|dui|drunk driving|murder|theft|assault charges?|drug charges?)\b/, label: 'Criminal defence' },
      { re: /\b(wills|a will|my will|last will|testament|probate|estate planning|inheritance|executors?)\b/, label: 'Wills, probate and estate planning', plural: true },
      { re: /\b(employment law|employment (matters?|disputes?|cases?|contracts?)|wrongful dismissal|unfair dismissal|fired|labou?r (law|matters?|disputes?)|employment)\b/, label: 'Employment law' },
      { re: /\b(immigration|visas?|citizenship|work permits?|residency|residency permits?|permanent residen\w*)\b/, label: 'General immigration and residency work, other than the Qualified Retired Persons Programme,' },
      { re: /\b(personal injury|accident claims?|car accidents?|medical malpractice|negligence claims?|slip and fall)\b/, label: 'Personal injury claims', plural: true },
      { re: /\b(bankruptcy|insolvency|liquidation)\b/, label: 'Bankruptcy and insolvency work' },
      { re: /\btraffic (tickets?|offen[cs]es?|matters?|violations?)\b/, label: 'Traffic matters', plural: true },
    ];
    function unlistedReply(t) {
      for (var i = 0; i < UNLISTED.length; i++) {
        var u = UNLISTED[i];
        if (!u.re.test(t)) continue;
        if (u.notary) return reply([{ text: 'Notarial services are not described on this website. Please telephone the office on ' + phone1 + ' to ask whether they are available.', links: [contactLink()], kb: 'FIR-09' }], { intent: 'FIR-09' });
        return reply([{ text: u.label + (u.plural ? ' are' : ' is') + ' not among the firm’s listed practice areas. Please telephone the office on ' + phone1 + ' to ask whether the firm can assist or can suggest an appropriate next step.', links: [contactLink()], kb: 'FIR-09' }], { intent: 'FIR-09' });
      }
      return null;
    }

    var BOT_INTRO = 'I’m Alpuche AI, the firm’s automated front-desk assistant.';
    var BOT_CAN = 'I can answer questions about the firm, its practice areas and the office, and pass an enquiry to the office. I’m not an attorney and can’t give legal advice.';

    // ----- Answering free text -------------------------------------------------
    function answer(session, raw) {
      session0 = session;
      var t = tidy(normalise(raw));
      if (!t) return reply([{ text: 'Please type your question in the box below.' }], { chips: SUGGESTIONS });
      var yesNo = isYesNo(t);
      var words = t.split(' ').length;
      if (has(P.greeting, t)) return reply([{ text: salutation() + '. How may I help you?' }], { chips: SUGGESTIONS, intent: 'greeting' });
      if (has(P.howAreYou, t) && words <= 6) return reply([{ text: 'Very well, thank you. How may I help you today?' }], { chips: SUGGESTIONS, intent: 'greeting' });
      if (has(P.thanks, t) && words <= 6) return reply([{ text: 'You’re welcome. Is there anything else I can help you with?' }], { chips: SUGGESTIONS, intent: 'thanks' });
      if (/^(ok|okay|alright|all right|fine|sure|yes|yeah|yep|no|nope|hmm+|k|right|i see|understood|noted)[\s!.,]*$/.test(t)) return reply([{ text: 'Very well. Is there anything else I can help you with?' }], { chips: SUGGESTIONS, intent: 'ack' });
      if (has(P.bye, t) && words <= 6) return reply([{ text: 'Thank you for contacting the office of José M. Alpuche, Attorney-at-Law. Good day.' }], { chips: [], intent: 'bye' });

      // 1. Immediate danger
      if (has(P.danger, t)) {
        session.offer = null;
        return reply([kbMsg('CON-07', { kind: 'urgent' })], { intent: 'CON-07' });
      }

      // 2. Sensitive details or documents: interrupt, don't repeat, hide the visitor's message.
      if (has(P.sensitiveWords, t) && (has(P.longNumber, t) || /\b(here is|here's|my .* is|number is)\b/.test(t)) || has(P.longNumber, t)) {
        return reply([{ text: 'Please do not share ID numbers, account details or other personal information here. I have hidden your message. ' + kb['CON-04'].answer, links: [contactLink()], kb: 'CON-04' }], { redactUser: true, intent: 'CON-04' });
      }
      if (has(P.payment, t)) {
        return reply([{ text: 'I’m not able to take payments or share account details. The office will confirm approved payment arrangements directly.', links: [contactLink()], kb: 'CON-03' }], { intent: 'CON-03' });
      }
      if (has(P.uploadDocs, t) || (has(P.sensitiveWords, t) && /\b(send|upload|share|give|post)\b/.test(t))) {
        return reply([kbMsg('CON-04')], { chips: [offerIntake(session)] });
      }
      if (/\b(invention|technical|prototype|formula|source code|blueprint)\b/.test(t) && /\b(details|post|share|send|show|describe)\b/.test(t)) {
        return reply([kbMsg('IP-02')], { chips: [offerIntake(session, 'intellectual-property')] });
      }

      // 3. Hearings, deadlines, papers served. A general "Do you handle trials?" is a service question, not an emergency.
      if (/\b(arrest\w*|in custody|detained|in jail|locked up|at the police station|charged with)\b/.test(t) && !has(P.cap, t)) {
        session.urgentSeen = true;
        return reply([{ text: 'If someone has been arrested or detained, please seek prompt assistance from a criminal defence attorney. Criminal defence is not among the firm’s listed practice areas; you may telephone the office on ' + phone1 + ' to ask whether it can suggest an appropriate next step.', kind: 'urgent', links: [contactLink()], kb: 'FIR-09' }], { intent: 'arrest' });
      }
      var capOnly = has(P.cap, t) && !has(P.timeSoon, t) && !/\b(my|i|im|me|we|our|us|mine)\b/.test(t.replace(P.cap, ' '));
      if (has(P.urgent, t) && !capOnly) {
        session.urgentSeen = true;
        var id = /demand letter/.test(t) ? 'DR-04' : 'CON-06';
        var msgs = [kbMsg(id, { kind: 'urgent' })];
        if (id === 'DR-04') msgs[0].text = kb['DR-04'].answer + ' If you cannot reach the office and time is short, please seek prompt assistance from another Belize attorney.';
        return reply(msgs, { intent: id });
      }

      // 4. Role changes / prompt injection
      if (has(P.injection, t)) {
        return reply([{
          text: 'I’m not able to change how I work, share my instructions or pass messages on directly. To reach Mr. Alpuche or the office, please telephone ' + phone1 + ' or email ' + office.email + '. I can also take a short enquiry for the office.',
          links: [contactLink()], kb: 'FIR-05',
        }], { chips: [offerIntake(session)], intent: 'injection' });
      }

      // Specific questions that must win over the general legal-advice guardrail.
      if (has(P.retireCtx, t) && has(P.qualify, t)) return reply([kbMsg('QRP-02')], { chips: [offerIntake(session, 'qualified-retired-persons')] });
      if (has(P.taxAmount, t)) return reply([kbMsg('BFT-03')], { chips: [offerIntake(session, 'banking-finance-tax-regulatory')] });
      if (has(P.fees, t) && /\b(consult\w*|first (meeting|call|visit|appointment)|initial (meeting|call)|appointment|meeting)\b/.test(t)) return feesReply(session, t);

      if (/\bjanine\b/.test(t) && /\b(advice|advise|attorney|lawyer|legal)\b/.test(t)) {
        return reply([{ text: 'Legal advice is given by the attorney, Mr. Alpuche. Janine Ebanks-Alpuche is the practice manager: she oversees the administration of the practice, provides paralegal support and can explain how to arrange a consultation.', links: [link('/about/')], kb: 'FIR-03' }], { intent: 'FIR-03' });
      }

      // "I need advice on a matter" / "I have a legal problem": route to a consultation.
      var specificLegal = has(P.legal, t.replace(/\b(legal advice|advice|advise me|give me advice)\b/g, ' '));
      if ((has(P.seekAdvice, t) || has(P.vagueMatter, t)) && !specificLegal && !has(P.qualify, t)) {
        var ap = findService(t);
        var apKey = (ap && ap.practice) || detectPractice(t);
        var aText = 'Certainly. Advice on a particular matter is given by the attorney, Mr. Alpuche, at a consultation; I’m not able to advise you myself. The office arranges consultations: please telephone ' + phone1 + ', or I can pass a short enquiry to the office now' + (apKey ? ' about your ' + practiceByKey[apKey].label + ' matter' : '') + '. Shall I begin?';
        if (has(P.timeSoon, t)) aText += ' If a date is approaching, please telephone the office promptly.';
        return reply([{ text: aText, links: [apKey ? link(practiceByKey[apKey].route) : link('/practice-areas/', 'Browse practice areas')] }], { chips: [offerIntake(session, apKey), { label: 'Not now', action: 'offer:no' }], intent: 'advice-offer' });
      }

      // 5. Legal advice guardrail
      if (has(P.legal, t) || has(P.qualify, t)) {
        var practice = detectPractice(t);
        var guard = {
          text: 'I’m sorry, but I’m not able to give legal advice, including whether you have a case, what your prospects are or what you should do. I’m an automated assistant, not an attorney, and the answer would depend on facts and documents the attorney would need to review at a consultation. I can pass a short enquiry to the office, or you may telephone ' + phone1 + '.',
          links: [], kind: 'guard', kb: 'CON-08',
        };
        if (practice) guard.links.push(link(practiceByKey[practice].route));
        if (has(P.timeSoon, t) || /\b(date|deadline|closing)\b/.test(t)) guard.text += ' If a date is approaching, please telephone the office promptly.';
        return reply([guard], { chips: [offerIntake(session, practice)], intent: 'CON-08' });
      }

      // 6. Front desk: about Alpuche AI itself
      if (has(P.botIdentity, t)) {
        var who = (t.match(P.botIdentity) || [''])[0];
        var txt;
        if (/^(what|who)/.test(who)) txt = BOT_INTRO + ' ' + BOT_CAN;
        else if (/lawyer|attorney/.test(who)) txt = 'No. ' + BOT_INTRO + ' I’m not an attorney, so I can’t give legal advice, but I can answer questions about the firm and the office, or pass an enquiry to the office.';
        else if (/person|human|people|real|someone|live/.test(who)) txt = 'No. ' + BOT_INTRO + ' To speak with someone, please telephone the office on ' + phone1 + ' during office hours (' + HOURS + '), or I can pass an enquiry to the office.';
        else if (/bot|robot|ai|machine|computer|automated/.test(who)) txt = 'Yes. ' + BOT_INTRO + ' ' + BOT_CAN;
        else txt = BOT_INTRO + ' ' + BOT_CAN;
        return reply([{ text: txt }], { chips: SUGGESTIONS, intent: 'about-assistant' });
      }
      if (has(P.reachJose, t)) {
        return reply([{ text: 'To reach Mr. Alpuche, please contact the office: telephone ' + phones.join(' or ') + ', or email ' + office.email + '. Consultations with the attorney are arranged through the office.', links: [contactLink()] }], { chips: [offerIntake(session)], intent: 'reach-jose' });
      }
      if (has(P.helpMe, t)) {
        return reply([{ text: 'Certainly. I can answer questions about the firm, its practice areas, the office and what to expect, or pass a short enquiry to the office. What would you like to know?' }], { chips: SUGGESTIONS, intent: 'about-assistant' });
      }
      if (/\b(free|cost|charge|pay)\b/.test(t) && /\b(here|this chat|the chat|chat|to ask|alpuche ai|this service|use you|using you|talk to you)\b/.test(t)) {
        return reply([{ text: 'Yes. Using Alpuche AI costs nothing. Consultation fees are a separate matter, confirmed by the office.' }], { chips: SUGGESTIONS, intent: 'about-assistant' });
      }
      if (has(P.aboutFirm, t)) {
        return reply([{ text: 'The firm is the Belize City law practice of José M. Alpuche, Attorney-at-Law, who leads its legal work, with Janine Ebanks-Alpuche as practice manager. It acts for individuals, families and businesses in real estate; corporate and commercial; banking, finance, tax and regulatory; dispute resolution; intellectual property; family law; and the Qualified Retired Persons Programme.', links: [link('/about/'), link('/practice-areas/', 'Browse practice areas')] }], { chips: SUGGESTIONS, intent: 'about-firm' });
      }
      if (has(P.botAbilities, t)) {
        return reply([{ text: 'I can tell you about the firm’s practice areas, the attorney and practice manager, office hours and contact details, and what to expect when you contact the office. I can also take a short enquiry and pass it to the office. I can’t give legal advice, book appointments or accept documents.', links: [link('/practice-areas/', 'Browse practice areas')] }], { chips: SUGGESTIONS, intent: 'about-assistant' });
      }

      // 7. Curated intents, most specific first
      if (has(P.existing, t)) return reply([kbMsg('FIR-07')]);
      if (!has(P.retireCtx, t)) { var un = unlistedReply(t); if (un) return un; }
      if (has(P.retireCtx, t) && has(P.qrpImport, t)) return reply([kbMsg('QRP-05')], { chips: [offerIntake(session, 'qualified-retired-persons')] });
      if (has(P.retireCtx, t) && has(P.qrpWork, t) && !has(P.cap, t)) return reply([kbMsg('QRP-04')], { chips: [offerIntake(session, 'qualified-retired-persons')] });
      if (has(P.retireCtx, t) && /\b(cost|fee|fees|how much|price)\b/.test(t)) return reply([kbMsg('QRP-02')], { chips: [offerIntake(session, 'qualified-retired-persons')] });
      if (has(P.retireCtx, t) && /\b(spouse|wife|husband|partner|family|dependant|dependent|child|children|documents?)\b/.test(t)) return reply([kbMsg('QRP-03')], { chips: [offerIntake(session, 'qualified-retired-persons')] });
      if (has(P.propertyCost, t) && detectPractice(t) !== 'corporate-commercial') return reply([kbMsg('RE-05')], { chips: [offerIntake(session, 'real-estate')] });
      if (has(P.timing, t) && !has(P.responseTime, t)) {
        var tk = (findService(t) || {}).practice || detectPractice(t);
        return reply([{ text: 'The website does not give timescales. Timing depends on the matter, and the office can discuss it once it has reviewed the details' + (tk === 'corporate-commercial' ? '; company registrations are handled through the Belize Companies and Corporate Affairs Registry’s Online Business Registry System.' : '.'), links: [tk ? link(practiceByKey[tk].route) : contactLink()] }], { chips: [offerIntake(session, tk)], intent: 'timing' });
      }
      if (has(P.confidential, t)) return reply([kbMsg('CON-05')], { chips: [offerIntake(session)] });
      if (has(P.responseTime, t)) {
        return reply([{ text: 'The office does not publish a response time. If a hearing, deadline or closing date is approaching, please telephone ' + phone1 + ' rather than waiting for a reply.', links: [contactLink()] }], { chips: [offerIntake(session)], intent: 'response-time' });
      }

      // Office facts. Several in one question are answered together.
      var tLoc = t.replace(/\be-?mail address(es)?\b/g, 'email');
      var asks = { location: has(P.location, tLoc), hours: has(P.hours, t), phone: has(P.phoneQ, t), email: has(P.emailQ, t) };
      var nAsks = Object.keys(asks).filter(function (k) { return asks[k]; }).length;
      if (nAsks >= 2) {
        var parts = [];
        if (asks.location) parts.push('The office is at ' + ADDRESS + '.');
        if (asks.hours) parts.push('Office hours are ' + HOURS + '.');
        if (asks.phone) parts.push('You may telephone ' + phones.join(' or ') + '.');
        if (asks.email) parts.push('The email address is ' + office.email + '.');
        return reply([{ text: parts.join(' '), links: [contactLink(), asks.location ? directionsLink() : null] }], { intent: 'office-facts' });
      }
      if (has(P.booking, t)) {
        var bp = detectPractice(t);
        return reply([{ text: 'Appointments are arranged directly with the office; I’m not able to book them or confirm availability. Please telephone ' + phone1 + ' or email ' + office.email + ' with the general nature of your matter, or I can pass an enquiry to the office so that it can contact you.', links: [contactLink()], kb: 'CON-01' }], { chips: [offerIntake(session, bp)], intent: 'CON-01' });
      }
      if (has(P.fees, t) && detectPractice(t) === 'real-estate' && /\b(buy\w*|purchas\w*|clos\w*|dut(y|ies)|transfer\w*|registration|stamp)\b/.test(t)) return reply([kbMsg('RE-05')], { chips: [offerIntake(session, 'real-estate')] });
      if (has(P.fees, t)) return feesReply(session, t);
      if (/\bfacebook\b/.test(t) && office.facebook) {
        return reply([{ text: (yesNo ? 'Yes. ' : '') + 'The firm has a Facebook page, linked below. For an enquiry, please telephone, email or message the office on WhatsApp.', links: [{ href: office.facebook, label: 'José M. Alpuche on Facebook', icon: 'facebook' }, contactLink()] }], { chips: [offerIntake(session)], intent: 'facebook' });
      }
      if (/\b(instagram|tiktok|twitter|linkedin|youtube)\b/.test(t)) {
        return reply([{ text: 'The website lists the firm’s Facebook page and WhatsApp, but no other social media accounts.', links: office.facebook ? [{ href: office.facebook, label: 'José M. Alpuche on Facebook', icon: 'facebook' }] : [] }], { intent: 'social' });
      }
      if (has(P.whatsapp, t)) {
        var wa = kbMsg('FIR-10');
        wa.text = (yesNo ? 'Yes. ' : '') + 'You may message the office on WhatsApp using the link below, or telephone or email if you prefer.';
        return reply([wa], { intent: 'FIR-10' });
      }
      if (has(P.language, t)) {
        if (/\benglish\b/.test(t) && !/\b(spanish|espanol|kriol|creole|garifuna|mandarin|chinese|french|german|maya)\b/.test(t)) return reply([{ text: 'Yes. The office works in English. For any other language, please ask the office when you make your enquiry.', links: [contactLink()] }], { intent: 'language' });
        return reply([{ text: 'The website does not list the languages in which consultations are offered. Please ask the office when you make your enquiry.', links: [contactLink()] }], { chips: [offerIntake(session)], intent: 'language' });
      }
      if (has(P.video, t)) {
        return reply([{ text: 'The website does not say whether consultations are held by video. If you are outside Belize, please tell the office your time zone and ask what meeting arrangements are available.', links: [link('/working-with-us/')] }], { chips: [offerIntake(session)], intent: 'video' });
      }
      if (has(P.otherOffice, t)) {
        if (/belize city/.test(t)) return reply([{ text: 'Yes. ' + kb['FIR-04'].answer, links: [contactLink(), directionsLink()], kb: 'FIR-04' }], { intent: 'FIR-04' });
        return reply([{ text: 'The firm’s office is in Belize City, at ' + ADDRESS + '. The website does not list any other office.', links: [contactLink(), directionsLink()] }], { intent: 'other-office' });
      }
      if (has(P.visit, t)) {
        return reply([{ text: 'Please telephone the office on ' + phone1 + ' before visiting so that a time can be arranged. The office is at ' + ADDRESS + ', and is open ' + HOURS + '.', links: [directionsLink(), contactLink()] }], { chips: [offerIntake(session)], intent: 'visit' });
      }
      if (has(P.parking, t)) {
        return reply([{ text: 'The website does not give parking details. The office is at ' + ADDRESS + '; please telephone ahead if you need directions.', links: [directionsLink(), contactLink()] }], { intent: 'parking' });
      }
      if (has(P.hours, t)) return hoursReply(t);
      if (has(P.location, tLoc)) {
        var loc = kbMsg('FIR-04');
        loc.links = /\b(direction|get there|find you|how do i get|map)\w*/.test(t) ? [directionsLink(), contactLink()] : [contactLink(), directionsLink()];
        return reply([loc], { intent: 'FIR-04' });
      }

      // The people
      if (has(P.team, t)) {
        if (/\bhow many\b/.test(t)) return reply([{ text: 'The website lists one attorney, José M. Alpuche, who leads the firm’s legal work. Janine Ebanks-Alpuche is the practice manager.', links: [link('/about/')] }], { intent: 'team' });
        return reply([{ text: 'The website introduces two people: José M. Alpuche, Attorney-at-Law, who leads the firm’s legal work, and Janine Ebanks-Alpuche, the practice manager, who oversees administration, provides paralegal support and is often the first person you will speak with.', links: [link('/about/')] }], { intent: 'team' });
      }
      if (has(P.janine, t) || has(P.firstContact, t)) return reply([kbMsg('FIR-03')]);
      var aboutJose = has(P.jose, t) || /\b(he|his|the attorney|the lawyer|your attorney|your lawyer)\b/.test(t);
      if (aboutJose && has(P.education, t)) return reply([{ text: 'Mr. Alpuche earned his law degree from the University of London in 2005, completed the Bar Vocational Course at the University of the West of England in Bristol in 2009, and qualified as an attorney in Belize in 2011.', links: [link('/about/')], kb: 'FIR-01' }], { intent: 'jose:education' });
      if ((aboutJose || /\b(the firm|your firm|the practice)\b/.test(t)) && has(P.experience, t)) return reply([{ text: 'Mr. Alpuche qualified as an attorney in Belize in 2011. He served as assistant legal counsel at Caribbean Investment Holdings Limited through December 2018, before establishing his own practice.', links: [link('/about/')], kb: 'FIR-01' }], { intent: 'jose:experience' });
      if (has(P.bar, t)) { var bar = kbMsg('FIR-02'); if (yesNo) bar.text = 'Yes. ' + bar.text; return reply([bar]); }

      // Who the firm acts for, and enquiries from abroad
      if (has(P.clientTypes, t) && !findService(t.replace(P.clientTypes, ' '))) {
        if (/foreign|expat|non-?resident|international|abroad|overseas|american|canadian|outside/.test(t)) return reply([{ text: 'Yes. The firm acts on matters involving parties outside Belize, including property closings with an overseas party and cross-border commercial arrangements. You may contact the office from abroad; please mention your time zone and the general nature of the matter.', links: [link('/working-with-us/')] }], { chips: [offerIntake(session)], intent: 'clients' });
        return reply([{ text: 'Yes. The firm works with individuals, families and businesses, on matters ranging from a property transfer or company decision to a dispute or a planned move to Belize.', links: [link('/practice-areas/', 'Browse practice areas')] }], { chips: [offerIntake(session)], intent: 'clients' });
      }
      if (has(P.fromAbroad, t) && !detectPractice(t)) {
        var ab = kbMsg('CON-02');
        if (/\b(have to|need to|must|required to) (come|travel|be|fly|visit)\b/.test(t)) ab.text = 'Not to make an enquiry. ' + ab.text;
        else if (yesNo) ab.text = 'Yes. ' + ab.text;
        return reply([ab], { chips: [offerIntake(session)], intent: 'CON-02' });
      }

      // Services: "Do you handle …?" gets a direct yes and the scope; "What kind of … work?" gets the scope.
      if (has(P.mediatorRole, t)) {
        return reply([{ text: 'The firm can advise or represent a party in mediation; the website does not describe the firm acting as a mediator itself. A mediator is a neutral facilitator who helps the parties explore an agreement.', links: [link('/practice-areas/dispute-resolution/')], kb: 'DR-03' }], { chips: [offerIntake(session, 'dispute-resolution')], intent: 'DR-03' });
      }
      var svc = findService(t);
      var whatKind = /\bwhat (kind|kinds|type|types|sort|sorts|areas?) of\b/.test(t) || has(P.practiceList, t);
      if (svc && whatKind) return practiceScope(svc.practice, false);
      if (has(P.cap, t) && has(P.notOurs, t)) {
        return reply([{ text: 'The website does not list that among the firm’s services. Please telephone the office on ' + phone1 + ' to ask whether the firm can assist or can suggest an appropriate next step.', links: [link('/practice-areas/', 'Browse practice areas')] }], { chips: [offerIntake(session)], intent: 'cap:unlisted' });
      }
      if (svc && svc.kb && !yesNo && has(P.wantTo, t) && !has(P.overseas, t) && !has(P.intake, t) && !has(P.notOurs, t)) return reply([kbMsg(svc.kb)], { chips: [offerIntake(session, svc.practice)], intent: svc.kb });
      if (svc && has(P.cap, t)) {
        if (svc.kb) { var sm = kbMsg(svc.kb); sm.text = 'Yes. ' + sm.text; return reply([sm], { chips: [offerIntake(session, svc.practice)], intent: svc.kb }); }
        return practiceScope(svc.practice, true);
      }
      if (svc && !yesNo && !has(P.overseas, t) && !has(P.intake, t) && /\b(i|my|me|we|our|us|someone|somebody)\b/.test(t)) {
        if (svc.kb && !svc.broad) return reply([kbMsg(svc.kb)], { chips: [offerIntake(session, svc.practice)], intent: svc.kb });
        if (svc.broad && !/\?$/.test(String(raw).trim()) && words >= 4) {
          return reply([{ text: 'Thank you for explaining. That would need to be reviewed by the attorney, Mr. Alpuche, at a consultation; I’m not able to advise on it myself. Please telephone the office on ' + phone1 + ', or I can pass a short enquiry to the office now about your ' + practiceByKey[svc.practice].label + ' matter. Shall I begin?', links: [link(practiceByKey[svc.practice].route)] }], { chips: [offerIntake(session, svc.practice), { label: 'Not now', action: 'offer:no' }], intent: 'advice-offer' });
        }
      }
      if (has(P.child, t) && !has(P.retireCtx, t)) {
        var fa = kbMsg('FA-03');
        if (has(P.timeSoon, t)) fa.text += ' If this is time-sensitive, please telephone the office promptly on ' + phone1 + '.';
        return reply([fa], { chips: [offerIntake(session, 'family-law')] });
      }
      if (has(P.registeredAgent, t)) return reply([kbMsg('CO-03')], { chips: [offerIntake(session, 'corporate-commercial')] });
      if (has(P.mediation, t)) return reply([kbMsg('DR-03')], { chips: [offerIntake(session, 'dispute-resolution')] });
      if (has(P.practiceList, t) || (has(P.cap, t) && /\b(cases?|matters?|law|clients?|anything|everything|all)\b/.test(t))) return practiceList();
      if (/\bbusiness name\b/.test(t) && /\b(compan|incorporat|llc)/.test(t) && !/trademark/.test(t)) return reply([kbMsg('CO-02')], { chips: [offerIntake(session, 'corporate-commercial')], intent: 'CO-02' });
      if (has(P.prepare, t)) {
        return reply([{ text: 'Please write down your main question, the outcome you want and any important dates, and identify the documents you already have: for a property purchase, perhaps the title reference and proposed terms; for a business matter, a term sheet or draft agreement; for a dispute, the notice you received or the contract. Keep the documents for the meeting, or ask the office how to provide them.', links: [link('/working-with-us/')] }], { chips: [offerIntake(session)], intent: 'prepare' });
      }
      if (has(P.getStarted, t)) {
        return reply([{ text: 'To begin, please telephone or email the office with your name, a reliable way to reach you and a short description of the type of matter, or I can pass a short enquiry to the office now. If a hearing, notice or closing is approaching, please telephone and mention the date.', links: [link('/working-with-us/')] }], { chips: [offerIntake(session)], intent: 'get-started' });
      }
      if (has(P.process, t)) {
        return reply([{ text: 'Once the office has your enquiry, it can discuss availability, any initial information the firm needs and whether a consultation is the right next step. The firm may need to check for conflicts before discussing details. If it can assist, it will confirm the work involved, the fee arrangements and whether it has accepted the matter.', links: [link('/working-with-us/')] }], { chips: [offerIntake(session)], intent: 'process' });
      }
      if (has(P.guides, t)) {
        return reply([{ text: 'The firm publishes three Belize legal guides:', items: (data.guides || []).map(function (g) { return { label: g.label, route: g.route }; }), after: 'Each gives general information only, not legal advice.' }], { chips: SUGGESTIONS, intent: 'guides' });
      }
      if (has(P.privacy, t)) {
        return reply([{ text: 'Alpuche AI does not ask for documents, ID numbers or account details, and an enquiry is sent only if you review and confirm it. For how information is handled, please see the website notice or ask the office.', links: [link('/website-notice/', 'Read the website notice')] }], { intent: 'privacy' });
      }
      if (has(P.intake, t)) {
        var ip = detectPractice(t);
        if (/\b(speak|talk|meet) (to|with) (jose|mr alpuche|the attorney|the lawyer)\b/.test(t)) {
          return reply([{ text: 'To speak with Mr. Alpuche, please telephone the office on ' + phone1 + ' to arrange a consultation, or I can pass a short enquiry to the office so that it can contact you. Shall I begin?', links: [contactLink()] }], { chips: [offerIntake(session, ip), { label: 'Not now', action: 'offer:no' }], intent: 'offer' });
        }
        return reply([{
          text: 'Certainly. I can pass a short enquiry to the office' + (ip ? ' about ' + practiceByKey[ip].label : '') + ' so that it can contact you about arranging a consultation. Shall I begin?',
          links: ip ? [link(practiceByKey[ip].route)] : [],
        }], { chips: [offerIntake(session, ip), { label: 'Not now', action: 'offer:no' }], intent: 'offer' });
      }
      if (has(P.jose, t)) return reply([kbMsg('FIR-01')]);
      if (has(P.cap, t) && !has(P.phoneQ, t) && !has(P.emailQ, t)) {
        return reply([{
          text: 'I can’t confirm that from the website. The firm’s listed practice areas are real estate; corporate and commercial; banking, finance, tax and regulatory; dispute resolution; intellectual property; family law; and the Qualified Retired Persons Programme. Please telephone the office on ' + phone1 + ' to ask whether it can assist with your matter, or I can pass an enquiry to the office.',
          links: [link('/practice-areas/', 'Browse practice areas')],
        }], { chips: [offerIntake(session)], intent: 'cap:unknown' });
      }
      if (has(P.phoneQ, t)) {
        return reply([{ text: yesNo ? 'Yes. You may telephone the office on ' + phones.join(' or ') + ', ' + HOURS + '.' : 'The office telephone numbers are ' + phones.join(' and ') + '.', links: [contactLink()] }], { chips: [offerIntake(session)], intent: 'phone' });
      }
      if (has(P.emailQ, t)) {
        return reply([{ text: yesNo ? 'Yes. You may email the office at ' + office.email + '. Please give the general nature of the matter and leave out sensitive details and attachments.' : 'The office email address is ' + office.email + '.', links: [contactLink()] }], { chips: [offerIntake(session)], intent: 'email' });
      }
      if (has(P.contact, t)) return reply([kbMsg('FIR-05')], { chips: [offerIntake(session)] });

      // 8. Retrieval over everything published on the site
      var results = search(index, t);
      var top = results[0];
      var overseas = has(P.overseas, t);
      var qLen = Array.from(new Set(tokens(t))).filter(function (x) { return !GENERIC.has(x); }).length;
      if (top && top.score >= 2.2 && top.coverage >= (qLen >= 2 ? 0.5 : 0.34)) {
        var d = top.doc;
        var practiceKey = detectPractice(t) || (d.route && practices.filter(function (p) { return d.route.indexOf(p.route) === 0; }).map(function (p) { return p.key; })[0]) || null;
        var msg;
        if (d.kind === 'kb') {
          msg = kbMsg(d.id);
        } else {
          msg = { text: d.kind === 'faq' ? sentences(d.text, 380) : bestSentences(d.text, t, 380), links: [link(d.route + (d.anchor ? '#' + d.anchor : ''), 'Read more: ' + d.page)], source: d.id };
        }
        if (overseas && practiceKey === 'real-estate') msg.text += ' ' + kb['CON-02'].answer;
        else if (overseas) msg.text += ' You may contact the office from abroad; please mention your time zone and the general topic.';
        if (has(P.timeSoon, t)) msg.text += ' If this is time-sensitive, please telephone the office on ' + phone1 + '.';
        return reply([msg], { chips: [offerIntake(session, practiceKey)], intent: d.kind === 'kb' ? d.id : 'site:' + d.id });
      }

      // 9. Fallback. A visitor describing their own situation is routed to a consultation.
      if (/\b(i|my|me|we|our|i'?m|i'?ve)\b/.test(t) && words >= 3 && !/\?$/.test(String(raw).trim())) {
        return reply([{ text: 'Thank you for explaining. That would need to be reviewed by the attorney, Mr. Alpuche, at a consultation; I’m not able to advise on it myself. Please telephone the office on ' + phone1 + ', or I can pass a short enquiry to the office now. Shall I begin?', links: [link('/practice-areas/', 'Browse practice areas')] }], { chips: [offerIntake(session), { label: 'Not now', action: 'offer:no' }], intent: 'advice-offer' });
      }
      return reply([{
        text: 'I’m afraid I don’t have that information. The office will be able to help: please telephone ' + phone1 + ' or email ' + office.email + ', or I can pass an enquiry to the office.',
        links: [link('/practice-areas/', 'Browse practice areas')],
      }], { chips: [offerIntake(session)], intent: 'fallback' });
    }

    function feesReply(session, t) {
      var noFee = t.replace(/\b(charges?|charging|fees?|costs?|price|rates?)\b/g, ' ');
      var fsv = findService(noFee);
      var fp = (fsv && fsv.practice) || detectPractice(noFee);
      var label = !fp ? '' : ' for ' + (fp === 'qualified-retired-persons' ? 'Qualified Retired Persons Programme' : practiceByKey[fp].label.toLowerCase().replace(' & ', ' and ')) + ' matters';
      var first = /\bfree\b/.test(t) ? 'The website does not say whether the first consultation is free. ' : 'The website does not publish fees' + label + '. ';
      return reply([{ text: first + 'Consultation and legal fees are confirmed by the office and may depend on the work involved and any third-party costs. Please ask the office about current fees and approved payment arrangements.', links: [contactLink()], kb: 'CON-03' }], { chips: [offerIntake(session, fp)], intent: 'CON-03' });
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
      if (session.urgentSeen) msgs.push({ text: 'If a hearing, deadline or closing is close, please telephone ' + phone1 + ' now. An enquiry here cannot protect a deadline.', kind: 'urgent' });
      msgs.push({
        text: 'Certainly. I can pass a short enquiry to the office so that it can contact you. I will ask for your name, how you would prefer to be contacted and a sentence or two about the matter. Please keep it general: no names of other parties, ID numbers, account details or documents. Sending an enquiry does not mean the firm has agreed to act for you.',
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
          return reply([{ text: 'Which area of law does your enquiry concern?' }], { chips: areaChips(), intent: 'intake:area', input: { type: 'text', placeholder: 'Or type the topic…' } });
        case 'name':
          return reply([{ text: 'May I have your name, please?' }], { input: { type: 'text', placeholder: 'Your name', autocomplete: 'name' }, chips: [{ label: 'Cancel', action: 'intake:cancel' }], intent: 'intake:name' });
        case 'channel':
          var chips = [{ label: 'Email', action: 'intake:channel:email' }, { label: 'Phone call', action: 'intake:channel:phone' }];
          if (transport.firmWhatsApp) chips.push({ label: 'WhatsApp', action: 'intake:channel:whatsapp', icon: 'whatsapp' });
          return reply([{ text: 'Thank you, ' + lead.name.split(' ')[0] + '. How would you prefer the office to contact you?' }], { chips: chips, intent: 'intake:channel' });
        case 'contact':
          if (lead.channel === 'email') return reply([{ text: 'What email address should the office use?' }], { input: { type: 'email', placeholder: 'name@example.com', autocomplete: 'email' }, intent: 'intake:contact' });
          return reply([{ text: (lead.channel === 'whatsapp' ? 'What WhatsApp number should the office use?' : 'What telephone number should the office use?') + ' Please include the country code if you are outside Belize.' }], { input: { type: 'tel', placeholder: '+501 …', autocomplete: 'tel' }, intent: 'intake:contact' });
        case 'confirmEmail':
          return reply([{ text: 'Would you like an email confirmation of your enquiry? If so, please enter your email address; otherwise, tap Skip.' }], { input: { type: 'email', placeholder: 'name@example.com (optional)', autocomplete: 'email' }, chips: [{ label: 'Skip', action: 'intake:skip' }], intent: 'intake:confirmEmail' });
        case 'date':
          return reply([{ text: 'Is there a hearing, deadline or closing date approaching?' }], { chips: [{ label: 'Yes', action: 'intake:date:yes' }, { label: 'No', action: 'intake:date:no' }, { label: 'Not sure', action: 'intake:date:unsure' }], intent: 'intake:date' });
        case 'description':
          return reply([{ text: 'Briefly, in a sentence or two, what is the matter about? Please keep it general, for example “purchase of land near Placencia” or “forming a company with a business partner”.' }], { input: { type: 'text', placeholder: 'Briefly describe the matter', multiline: true }, intent: 'intake:description' });
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
        text: 'Please review the details I will send to the office:',
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
          if (!n || /\d/.test(raw)) return reply([{ text: 'Please enter your name using letters only.' }], { input: { type: 'text', placeholder: 'Your name', autocomplete: 'name' } });
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
            if (!EMAIL_RE.test(em) || em.length > 120) return reply([{ text: 'That does not appear to be a valid email address. Please check it and try again.' }], { input: { type: 'email', placeholder: 'name@example.com', autocomplete: 'email' } });
            lead.email = em;
            return ask(session, 'date');
          }
          var ph = cleanPhone(raw);
          if (!ph) return reply([{ text: 'Please enter a telephone number using digits, for example +501 223 1194.' }], { input: { type: 'tel', placeholder: '+501 …', autocomplete: 'tel' } });
          lead.phone = ph;
          return ask(session, 'confirmEmail');
        case 'confirmEmail':
          if (/^(skip|no|no thanks|none)\b/.test(t)) return intakeAction(session, 'intake:skip');
          var em2 = String(raw).trim();
          if (!EMAIL_RE.test(em2) || em2.length > 120) return reply([{ text: 'That does not appear to be a valid email address. Please enter it again, or tap Skip.' }], { input: { type: 'email', placeholder: 'name@example.com (optional)', autocomplete: 'email' }, chips: [{ label: 'Skip', action: 'intake:skip' }] });
          lead.email = em2;
          return ask(session, 'date');
        case 'date':
          if (has(P.yes, t)) return intakeAction(session, 'intake:date:yes');
          if (has(P.no, t)) return intakeAction(session, 'intake:date:no');
          return intakeAction(session, 'intake:date:unsure');
        case 'description':
          var desc = String(raw).replace(/\s+/g, ' ').trim();
          if (has(P.longNumber, t) || (has(P.sensitiveWords, t) && /\d/.test(t)) || /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(desc)) {
            return reply([{ text: 'That appears to include personal details such as an ID, account number or contact details, so I have hidden it. Please describe the matter in general terms without them.' }], { redactUser: true, input: { type: 'text', placeholder: 'Briefly describe the matter', multiline: true } });
          }
          if (desc.length < 5) return reply([{ text: 'Please add a few more words so that the office understands what the matter concerns.' }], { input: { type: 'text', placeholder: 'Briefly describe the matter', multiline: true } });
          if (desc.length > 500) return reply([{ text: 'Please keep it under 500 characters; the office will ask for further details later.' }], { input: { type: 'text', placeholder: 'Briefly describe the matter', multiline: true } });
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
          return reply([{ text: 'Understood. Nothing has been sent. You may telephone the office on ' + phone1 + ' or email ' + office.email + ' at any time.' }], { chips: SUGGESTIONS, intent: 'intake:cancelled' });
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
            r.messages.unshift({ text: 'Please also telephone the office on ' + phone1 + ' so that it is aware of the date. An enquiry here cannot protect a deadline.', kind: 'urgent' });
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
          return reply([{ text: 'Please tap below to open WhatsApp with your enquiry ready to send. It will only be sent when you press send in WhatsApp.', links: [{ href: url, label: 'Open WhatsApp', icon: 'whatsapp' }] }], { chips: [{ label: 'Send by email instead', action: 'intake:send' }, { label: 'Cancel', action: 'intake:cancel' }] });
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
          text: 'Thank you. Your enquiry has been sent to the office (reference ' + p.ref + ').' + (p.email ? ' A confirmation is on its way to ' + p.email + '.' : '') +
            ' The office will contact you by ' + channelText + '. If a date is approaching, please telephone ' + phone1 + '.',
          kind: 'success',
        }], { chips: [], intent: 'intake:sent' });
      }
      return reply([{
        text: 'I’m sorry, I couldn’t send that just now. Please telephone the office on ' + phone1 + ' or email ' + office.email + '.',
        kind: 'urgent',
      }], { chips: [{ label: 'Try again', action: 'intake:send' }, { label: 'Cancel', action: 'intake:cancel' }], intent: 'intake:error' });
    }

    function handle(session, input) {
      if (input.action) {
        var a = input.action;
        if (a.indexOf('kb:') === 0) { var id = a.slice(3); session.offer = null; return reply([kbMsg(id)], { chips: [offerIntake(session, practiceForKb(id))] }); }
        if (a === 'offer:no') { session.offer = null; return reply([{ text: 'Very well. Is there anything else I can help you with?' }], { chips: SUGGESTIONS }); }
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
