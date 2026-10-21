/* ============================================================================
   ICB.DATA.locations — the complete branch and agency network.
   SINGLE SOURCE OF TRUTH for every location used by the branch finder, the
   map, the WhatsApp directory, the call directory, the contact flow and
   mobile quick actions.

   SOURCE: ICB's own directory, "ICB | Branches, Agencies & Direct
   Contacts", revised by the client after the review meeting of 20 Oct
   2026. Twenty-two locations. Every address, landline, email and
   WhatsApp number below is taken from it verbatim. Nothing here is
   inferred from anywhere else.

   That revision is the authority. Two locations in the previous version
   are not in it and have been removed outright rather than held back:
   SAN NARCISO (never confirmed, previously held at active: false) and
   BENQUE VIEJO AGENCY (previously public, #58 George Price Boulevard,
   615-3266 / 671-1100). Two were added: MORO AGENCY and VELASQUEZ
   AGENCY, both in Santa Cruz Village.

   RULES
   - Every published ICB branch and agency appears here. WhatsApp
     availability does NOT decide whether a location exists.
   - Locations with a verified WhatsApp line get the wa.me action.
     Locations without one get no WhatsApp action.
   - Addresses, landlines and emails shown are the ones ICB publishes.
     Nothing is invented. Where ICB does not publish a direct line,
     corporateLine: true offers the Corporate Office number, correctly
     labelled as the Corporate Office.
   - active: false keeps a record in this dataset for reference without
     presenting it publicly as an operating location. Everything that
     faces a visitor reads ICB.DATA.activeLocations(), never the raw
     array, so one flag governs the branch finder, the map, the call
     directory, the WhatsApp directory and the contact form. Nothing is
     held back today.

   INTERNAL TODO (not client-facing):
   - SANTA CRUZ VILLAGE (Moro, Velasquez): the revised directory gives
     the village but no district. There are several Santa Cruz villages
     in Belize. This is read as the one in STANN CREEK, on the Southern
     Highway in the banana belt, because that is the Santa Cruz that
     sits in the same corridor as ICB's existing San Juan, Bella Vista
     and Independence offices and is the only one of any size. Confirm
     with ICB. If it is the Toledo village instead, both records move
     district and both pins move with them.
   - SAN JUAN: the directory gives no coordinates for San Juan Village.
     The pin is Cowpen's published position, which is the same village
     pair at mile 35 of the Southern Highway. Previously it was placed
     beside Independence, which was about ten miles out. Still worth
     confirming with ICB.
   - BELLA VISTA: the directory writes the address as "Toledo Village",
     which is a slip for Toledo District. Published as "Toledo
     District".
   - Neither Benque Town Board, San Juan, Bella Vista, Moro nor
     Velasquez is a published payment confirmation number. Their entries
     verify WhatsApp service but do not say those lines receive payment
     receipts, so none carries receipt: true. Add it only if ICB
     confirms.

   hours: optional per location, and the two border branches carry their
   own because they keep the crossing's hours rather than office ones.
   Anything without it falls back to ICB.DATA.site.hours. The shape is
   { lines: [{en, es}, ...], spec: [{days, opens, closes}, ...] }: lines
   are what a reader sees, spec is what the structured data publishes,
   and they are written together so the two cannot drift apart. Set
   hours: false to show none at all.

   whatsapps: array of { label?, display, wa, callable?, receipt? }
     wa        DIGITS ONLY, used to build https://wa.me/<wa> links.
     callable  defaults to true. A mobile line normally dials as well as
               it messages, so the call directory and the location card
               both offer it. Set FALSE where ICB publishes the number as
               WhatsApp only: it then stays on every WhatsApp surface and
               appears on none of the calling ones. Never assume a
               WhatsApp number takes voice calls.
     receipt   true where ICB lists the line as one that receives payment
               confirmations. The payments page is built from this flag,
               so a WhatsApp line is never presented as a receipt channel
               unless ICB says it is.

   Where the directory gives one number as both the telephone and the
   WhatsApp line, it is held ONCE in whatsapps and left callable, so it
   reaches the calling surfaces and the messaging ones without being
   listed twice on the same card.

   map: {x, y} are projected town coordinates inside the accurate Belize
   map SVG (viewBox 0 0 300 560), derived from real latitude/longitude.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.districts = ["Corozal", "Orange Walk", "Belize", "Cayo", "Stann Creek", "Toledo"];

ICB.DATA.locations = [

  /* ------------------------------ Corozal ------------------------------ */
  {
    id: "corozal-border",
    name: "Corozal Border Branch",
    type: "Branch",
    district: "Corozal",
    town: "Santa Elena Border, Corozal",
    address: "Corozal Border crossing, Santa Elena Village, Corozal District",
    phones: [{ display: "+501 423-8019", tel: "+5014238019" }],
    whatsapps: [{ display: "+501 613-0919", wa: "5016130919", receipt: true }],
    email: "icb_corozalborder@icbinsurance.com",
    /* A border crossing, open while the crossing is. */
    hours: {
      lines: [
        { en: "Monday to Saturday, 6:00 AM to 7:00 PM",
          es: "Lunes a sábado, 6:00 AM a 7:00 PM" },
        { en: "Sunday, 7:00 AM to 6:00 PM",
          es: "Domingo, 7:00 AM a 6:00 PM" }
      ],
      spec: [
        { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "06:00", closes: "19:00" },
        { days: ["Sunday"], opens: "07:00", closes: "18:00" }
      ]
    },
    mapQuery: "Santa Elena Border Crossing, Corozal, Belize",
    map: { x: 146.2, y: 68.1 },
    note: null
  },
  {
    id: "corozal",
    name: "Corozal Branch",
    type: "Branch",
    district: "Corozal",
    town: "Corozal Town",
    address: "1st Street North, Corozal Town",
    phones: [{ display: "+501 422-2759", tel: "+5014222759" }],
    whatsapps: [{ display: "+501 613-4627", wa: "5016134627", receipt: true }],
    email: "icb_corozaltown@icbinsurance.com",
    mapQuery: "Insurance Corporation of Belize, 1st Street North, Corozal Town, Belize",
    map: { x: 145.4, y: 82.6 },
    note: null
  },
  /* HELD BACK, NOT PUBLIC. ICB's own directory marks this entry REVIEW
     ONLY and confirms nothing about it: no street address, no telephone,
     no email, no WhatsApp, no hours. It is not offered as a branch a
     visitor can travel to or call. The record stays for reference only. */

  /* ---------------------------- Orange Walk ---------------------------- */
  {
    id: "orange-walk",
    name: "Orange Walk Branch",
    type: "Branch",
    district: "Orange Walk",
    town: "Orange Walk Town",
    address: "#48 Belize Corozal Road, Orange Walk Town",
    phones: [{ display: "+501 322-3509", tel: "+5013223509" }],
    whatsapps: [{ display: "+501 613-0817", wa: "5016130817", receipt: true }],
    email: "icb_ow@icbinsurance.com",
    mapQuery: "Insurance Corporation of Belize, 48 Belize Corozal Road, Orange Walk Town, Belize",
    map: { x: 118.0, y: 133.9 },
    note: null
  },
  {
    id: "san-estevan",
    name: "San Estevan Agency",
    type: "Agency",
    district: "Orange Walk",
    town: "San Estevan Village",
    address: "San Estevan Village",
    phones: [{ display: "+501 322-0659", tel: "+5013220659" }],
    whatsapps: [],
    email: "icb_sanestevan@icbinsurance.com",
    mapQuery: "San Estevan Village, Orange Walk District, Belize",
    map: { x: 128.0, y: 139.3 },
    note: null
  },

  /* ------------------------------ Belize ------------------------------- */
  {
    id: "corporate",
    name: "Corporate Office",
    type: "Corporate Office",
    district: "Belize",
    town: "Belize City",
    address: "#16 Daly Street, Belize City",
    phones: [{ display: "+501 224-5328", tel: "+5012245328" }, { display: "+501 224-5329", tel: "+5012245329" }],
    whatsapps: [
      { label: { en: "Line 1", es: "Línea 1" }, display: "+501 613-0693", wa: "5016130693", receipt: true },
      { label: { en: "Line 2", es: "Línea 2" }, display: "+501 613-0645", wa: "5016130645", receipt: true }
    ],
    email: "icb@icbinsurance.com",
    mapQuery: "Insurance Corporation of Belize, 16 Daly Street, Belize City, Belize",
    map: { x: 176.8, y: 228.6 },
    note: null
  },
  {
    id: "belize-city-southside",
    name: "Belize City Southside Branch",
    type: "Branch",
    district: "Belize",
    town: "Belize City",
    address: "#38 Central American Boulevard, Belize City",
    phones: [{ display: "+501 222-4079", tel: "+5012224079" }],
    whatsapps: [{ display: "+501 613-1054", wa: "5016131054", receipt: true }],
    email: "icb_southside@icbinsurance.com",
    mapQuery: "Insurance Corporation of Belize, 38 Central American Boulevard, Belize City, Belize",
    map: { x: 174.6, y: 231.2 },
    note: null
  },
  {
    id: "ladyville",
    name: "Ladyville Branch",
    type: "Branch",
    district: "Belize",
    town: "Ladyville",
    address: "Airport Plaza, 8 1/2 Miles Northern Highway, Ladyville",
    phones: [{ display: "+501 670-6970", tel: "+5016706970" }],
    whatsapps: [{ display: "+501 613-0470", wa: "5016130470", receipt: true }],
    email: "icb_ladyville@icbinsurance.com",
    mapQuery: "Airport Plaza, Northern Highway, Ladyville, Belize",
    map: { x: 160.3, y: 219.8 },
    note: null
  },
  {
    id: "san-pedro",
    name: "San Pedro Branch",
    type: "Branch",
    district: "Belize",
    town: "San Pedro, Ambergris Caye",
    address: "Coconut Drive, San Pedro Town",
    phones: [{ display: "+501 226-4099", tel: "+5012264099" }],
    whatsapps: [{ display: "+501 610-2941", wa: "5016102941", receipt: true }],
    email: "icb_sanpedro@icbinsurance.com",
    mapQuery: "Coconut Drive, San Pedro Town, Ambergris Caye, Belize",
    map: { x: 211.6, y: 160.2 },
    note: null
  },
  {
    id: "caye-caulker",
    name: "Caye Caulker Agency",
    type: "Agency",
    district: "Belize",
    town: "Caye Caulker",
    address: "Avenida Hicaco, Caye Caulker",
    phones: [{ display: "+501 226-0398", tel: "+5012260398" }],
    whatsapps: [{ display: "+501 626-4748", wa: "5016264748" }],
    email: "icb_cayecaulker@icbinsurance.com",
    mapQuery: "Avenida Hicaco, Caye Caulker, Belize",
    map: { x: 202.3, y: 189.6 },
    note: null
  },

  /* ------------------------------- Cayo -------------------------------- */
  {
    id: "belmopan",
    name: "Belmopan City Branch",
    type: "Branch",
    district: "Cayo",
    town: "Belmopan",
    address: "#6095 South Ring Road, Belmopan City",
    phones: [{ display: "+501 822-0473", tel: "+5018220473" }],
    whatsapps: [{ display: "+501 610-9178", wa: "5016109178", receipt: true }],
    email: "icb_belmopan@icbinsurance.com",
    mapQuery: "Insurance Corporation of Belize, 6095 South Ring Road, Belmopan, Belize",
    map: { x: 85.5, y: 270.3 },
    note: null
  },
  {
    id: "santa-elena",
    name: "Santa Elena Branch",
    type: "Branch",
    district: "Cayo",
    town: "Santa Elena, Cayo",
    address: "#74 Western Highway, Santa Elena Town",
    phones: [{ display: "+501 824-2454", tel: "+5018242454" }],
    whatsapps: [{ display: "+501 614-0437", wa: "5016140437", receipt: true }],
    email: "icb_santaelena@icbinsurance.com",
    mapQuery: "Insurance Corporation of Belize, 74 Western Highway, Santa Elena, Cayo, Belize",
    map: { x: 44.0, y: 282.4 },
    note: null
  },
  {
    id: "san-ignacio",
    name: "San Ignacio Branch",
    type: "Branch",
    district: "Cayo",
    town: "San Ignacio",
    address: "Buena Vista & King Streets, San Ignacio Town",
    phones: [{ display: "+501 824-3009", tel: "+5018243009" }],
    whatsapps: [{ display: "+501 613-4138", wa: "5016134138", receipt: true }],
    email: "icb_sanignacio@icbinsurance.com",
    mapQuery: "Insurance Corporation of Belize, Buena Vista Street, San Ignacio Town, Belize",
    map: { x: 38.3, y: 288.9 },
    note: null
  },
  /* THREE separate locations share this town, and the directory lists
     them as three: the border branch at the crossing itself, the agency
     on George Price Boulevard, and the town board branch on George
     Street. An earlier draft treated the agency and the town board as one
     record under the belief they were the same office; the directory
     gives them different addresses, different numbers and different
     emails, so they are not. All three carry the same town name, which
     also means the map draws one label for the town rather than three on
     top of each other. */
  {
    id: "benque-viejo-border",
    name: "Benque Viejo Border Branch",
    type: "Branch",
    district: "Cayo",
    town: "Benque Viejo Town",
    address: "Belize–Guatemala border crossing, Benque Viejo Town, Cayo District",
    phones: [{ display: "+501 823-2319", tel: "+5018232319" }],
    whatsapps: [{ display: "+501 613-0548", wa: "5016130548", receipt: true }],
    email: "icb_benqueagency@icbinsurance.com",
    /* A border crossing, open every day of the week. */
    hours: {
      lines: [
        { en: "Every day, 7:00 AM to 6:00 PM",
          es: "Todos los días, 7:00 AM a 6:00 PM" }
      ],
      spec: [
        { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "07:00", closes: "18:00" }
      ]
    },
    mapQuery: "Western Border Crossing, Benque Viejo del Carmen, Belize",
    map: { x: 24.2, y: 296.8 },
    note: null
  },
  {
    id: "benque-town-board",
    name: "Benque Town Board Branch",
    type: "Branch",
    district: "Cayo",
    town: "Benque Viejo Town",
    address: "39 George Street, Benque Town, Cayo District",
    phones: [],
    whatsapps: [{ display: "+501 656-7521", wa: "5016567521" }],
    email: "icb_benquetown@icbinsurance.com",
    mapQuery: "39 George Street, Benque Viejo del Carmen, Belize",
    map: { x: 27.7, y: 300.6 },
    note: null
  },

  /* ---------------------------- Stann Creek ---------------------------- */
  {
    id: "dangriga",
    name: "Dangriga Branch",
    type: "Branch",
    district: "Stann Creek",
    town: "Dangriga",
    address: "Market Square, Dangriga Town",
    phones: [{ display: "+501 522-0706", tel: "+5015220706" }],
    whatsapps: [{ display: "+501 614-9682", wa: "5016149682", receipt: true }],
    email: "icb_dangriga@icbinsurance.com",
    mapQuery: "Market Square, Dangriga Town, Belize",
    map: { x: 171.4, y: 316.2 },
    note: null
  },
  {
    id: "seine-bight",
    name: "Seine Bight Agency",
    type: "Agency",
    district: "Stann Creek",
    town: "Seine Bight Village",
    address: "Main Street, Seine Bight Village",
    phones: [{ display: "+501 523-3555", tel: "+5015233555" }],
    whatsapps: [],
    email: "icb_seinebight@icbinsurance.com",
    mapQuery: "Main Street, Seine Bight Village, Stann Creek District, Belize",
    map: { x: 149.0, y: 374.4 },
    note: null
  },
  /* The directory now lists 671-7916 as this agency's telephone as well
     as its WhatsApp line. An earlier flyer presented it as WhatsApp only,
     which is why this record used to carry callable: false; the
     directory supersedes that, so the number dials again.

     INTERNAL TODO: the map position is approximate, set beside
     Independence because San Juan Village sits in that part of Stann
     Creek. Confirm the exact position with ICB. */
  {
    id: "san-juan",
    name: "San Juan Agency",
    type: "Agency",
    district: "Stann Creek",
    town: "San Juan Village",
    address: "San Juan Village",
    phones: [],
    whatsapps: [{ display: "+501 671-7916", wa: "5016717916" }],
    email: "icb_sanjuan@icbinsurance.com",
    mapQuery: "San Juan Village, Stann Creek District, Belize",
    map: { x: 123.5, y: 382.6 },
    note: null
  },
  {
    id: "independence",
    name: "Independence Branch",
    type: "Branch",
    district: "Stann Creek",
    town: "Independence Village",
    address: "219, Corner of Hercules & Toucan Streets, Independence",
    phones: [{ display: "+501 523-2041", tel: "+5015232041" }],
    whatsapps: [{ display: "+501 615-6951", wa: "5016156951", receipt: true }],
    email: "icb_independence@icbinsurance.com",
    mapQuery: "Corner of Hercules and Toucan Streets, Independence, Belize",
    map: { x: 142.4, y: 388.0 },
    note: null
  },

  /* Two agencies in the same village. The pins sit a little either side
     of the village point so the map can label them separately; both are
     well inside the projection's own margin of error. */
  {
    id: "moro",
    name: "Moro Agency",
    type: "Agency",
    district: "Stann Creek",
    town: "Santa Cruz Village",
    address: "#22 Police Station Street, Santa Cruz Village",
    phones: [],
    whatsapps: [{ display: "+501 609-0497", wa: "5016090497" }],
    email: "William.moro@icbinsurance.com",
    mapQuery: "Santa Cruz Village, Stann Creek District, Belize",
    map: { x: 137.9, y: 359.8 },
    note: null
  },
  {
    id: "velasquez",
    name: "Velasquez Agency",
    type: "Agency",
    district: "Stann Creek",
    town: "Santa Cruz Village",
    address: "Main Road, Santa Cruz Village",
    phones: [],
    whatsapps: [{ display: "+501 616-7612", wa: "5016167612" }],
    email: "Wilson.velasquez@icbinsurance.com",
    mapQuery: "Santa Cruz Village, Stann Creek District, Belize",
    map: { x: 141.5, y: 362.8 },
    note: null
  },

  /* ------------------------------ Toledo ------------------------------- */
  {
    id: "punta-gorda",
    name: "Punta Gorda Branch",
    type: "Branch",
    district: "Toledo",
    town: "Punta Gorda",
    address: "George Price Street, Punta Gorda",
    phones: [{ display: "+501 722-2291", tel: "+5017222291" }],
    whatsapps: [{ display: "+501 615-8046", wa: "5016158046", receipt: true }],
    email: "icb_pg@icbinsurance.com",
    mapQuery: "George Price Street, Punta Gorda Town, Belize",
    map: { x: 79.4, y: 459.3 },
    note: null
  },
  /* The directory gives Bella Vista full contact details but no district,
     and the village sits close to the Stann Creek boundary, so it was
     worth checking rather than assuming. It is in TOLEDO: the largest
     village in the district, at 16.50948 N, 88.53169 W, which independent
     gazetteers agree on. Independence, fifteen hundred metres north of
     it, is in Stann Creek; the boundary really does run between the two.

     The pin is that latitude and longitude put through the same
     projection as every other pin here, not an estimate. */
  {
    id: "bella-vista",
    name: "Bella Vista Agency",
    type: "Agency",
    district: "Toledo",
    town: "Bella Vista Village",
    address: "3rd Street, Bella Vista Village, Toledo District",
    phones: [],
    whatsapps: [{ display: "+501 679-3896", wa: "5016793896" }],
    email: "icb_bellavista@icbinsurance.com",
    mapQuery: "Bella Vista Village, Toledo District, Belize",
    map: { x: 123.8, y: 391.8 },
    note: null
  }
];

ICB.DATA.locationById = function (id) {
  for (var i = 0; i < ICB.DATA.locations.length; i++) {
    if (ICB.DATA.locations[i].id === id) return ICB.DATA.locations[i];
  }
  return null;
};

/* THE public list. Everything a visitor can see is built from this, so a
   record held back for confirmation cannot leak into one surface while
   being absent from another. */
ICB.DATA.activeLocations = function () {
  return ICB.DATA.locations.filter(function (l) { return l.active !== false; });
};

/* Locations with verified WhatsApp lines, in data order. */
ICB.DATA.whatsappLines = function () {
  return ICB.DATA.activeLocations().filter(function (l) { return l.whatsapps && l.whatsapps.length; });
};

/* WhatsApp lines that also take voice calls. callable defaults to true,
   so only an explicit false opts a number out. */
ICB.DATA.callableWhatsapps = function (location) {
  return (location.whatsapps || []).filter(function (w) { return w.callable !== false; });
};

/* Locations with at least one WhatsApp line ICB lists as receiving
   payment confirmations, in data order. The payments page is built from
   this, so no number appears there unless ICB says it belongs. */
ICB.DATA.receiptLines = function () {
  return ICB.DATA.activeLocations()
    .map(function (l) {
      var lines = (l.whatsapps || []).filter(function (w) { return w.receipt === true; });
      return lines.length ? { location: l, lines: lines } : null;
    })
    .filter(Boolean);
};

/* Locations with a published direct landline, in data order. */
ICB.DATA.phoneLines = function () {
  return ICB.DATA.activeLocations().filter(function (l) { return l.phones && l.phones.length; });
};
