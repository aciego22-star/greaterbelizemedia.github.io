/* ============================================================================
   ICB.DATA.locations — the complete branch and agency network.
   SINGLE SOURCE OF TRUTH for every location used by the branch finder, the
   map, the WhatsApp directory, the call directory, the contact flow and
   mobile quick actions.

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
     directory, the WhatsApp directory and the contact form.

   INTERNAL TODO (not client-facing):
   - Reconcile against ICB's current Contact page and telephone directory
     for the branches still missing a published landline, street address
     or email: Corozal Border, Corozal, San Pedro, Santa Elena (Cayo),
     Benque Viejo Border, Benque Viejo Agency, Independence, Caye Caulker,
     San Estevan, Seine Bight.
   - SAN NARCISO: held at active: false. It is not presented as an
     operating branch anywhere public. Confirm its status, type and
     contact details with ICB, then set active: true.
   - SAN JUAN VILLAGE: ICB's social presence indicates service to San Juan
     Village. No address, landline or WhatsApp line is published for it, so
     it is deliberately NOT listed publicly. Confirm the location type and
     contact details with ICB, then add an entry here.
   - Confirm whether Benque Viejo Border Branch and Benque Viejo Agency are
     two distinct locations or one location published under two names.

   whatsapps: array of { label?, display, wa } — wa is DIGITS ONLY and is
   used to build https://wa.me/<wa> links.
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
    address: "Northern Border, Santa Elena, Corozal District",
    phones: [],
    corporateLine: true,
    whatsapps: [{ display: "+501 613-0919", wa: "5016130919" }],
    email: null,
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
    address: "Corozal Town, Corozal District",
    phones: [],
    corporateLine: true,
    whatsapps: [{ display: "+501 613-4627", wa: "5016134627" }],
    email: null,
    mapQuery: "Insurance Corporation of Belize, Corozal Town, Belize",
    map: { x: 145.4, y: 82.6 },
    note: null
  },
  /* HELD BACK, NOT PUBLIC. ICB's current operating status for San Narciso
     is not verified from here, so it is not offered as a branch a visitor
     can travel to or call. The record stays for reference only. */
  {
    id: "san-narciso",
    name: "San Narciso",
    type: "Branch",
    district: "Corozal",
    town: "San Narciso Village",
    address: "San Narciso Village, Corozal District",
    phones: [],
    corporateLine: true,
    whatsapps: [],
    email: null,
    mapQuery: "San Narciso Village, Corozal District, Belize",
    map: { x: 130.6, y: 95.6 },
    note: null,
    active: false
  },

  /* ---------------------------- Orange Walk ---------------------------- */
  {
    id: "orange-walk",
    name: "Orange Walk Branch",
    type: "Branch",
    district: "Orange Walk",
    town: "Orange Walk Town",
    address: "#48 Belize Corozal Road, Orange Walk Town",
    phones: [{ display: "+501 322-3509", tel: "+5013223509" }],
    whatsapps: [{ display: "+501 613-0817", wa: "5016130817" }],
    email: null,
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
    address: "San Estevan Village, Orange Walk District",
    phones: [],
    corporateLine: true,
    whatsapps: [],
    email: null,
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
    address: "16 Daly Street, P.O. Box 519, Belize City",
    phones: [{ display: "+501 224-5328", tel: "+5012245328" }, { display: "+501 224-5329", tel: "+5012245329" }],
    whatsapps: [
      { label: "Line 1", display: "+501 613-0693", wa: "5016130693" },
      { label: "Line 2", display: "+501 613-0645", wa: "5016130645" }
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
    whatsapps: [{ display: "+501 613-1054", wa: "5016131054" }],
    email: null,
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
    address: "Airport Plaza, 8 1/2 Miles Philip Goldson Highway, Ladyville",
    phones: [{ display: "+501 670-6970", tel: "+5016706970" }],
    whatsapps: [{ display: "+501 613-0470", wa: "5016130470" }],
    email: null,
    mapQuery: "Airport Plaza, Philip Goldson Highway, Ladyville, Belize",
    map: { x: 160.3, y: 219.8 },
    note: null
  },
  {
    id: "san-pedro",
    name: "San Pedro Branch",
    type: "Branch",
    district: "Belize",
    town: "San Pedro, Ambergris Caye",
    address: "Pescador Drive, San Pedro Town, Ambergris Caye",
    phones: [],
    corporateLine: true,
    whatsapps: [{ display: "+501 610-2941", wa: "5016102941" }],
    email: null,
    mapQuery: "Pescador Drive, San Pedro Town, Ambergris Caye, Belize",
    map: { x: 211.6, y: 160.2 },
    note: null
  },
  {
    id: "caye-caulker",
    name: "Caye Caulker Agency",
    type: "Agency",
    district: "Belize",
    town: "Caye Caulker",
    address: "Caye Caulker Village, Belize District",
    phones: [],
    corporateLine: true,
    whatsapps: [{ display: "+501 626-4748", wa: "5016264748" }],
    email: null,
    mapQuery: "Caye Caulker, Belize",
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
    whatsapps: [{ display: "+501 610-9178", wa: "5016109178" }],
    email: null,
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
    address: "Santa Elena Town, Cayo District",
    phones: [],
    corporateLine: true,
    whatsapps: [{ display: "+501 614-0437", wa: "5016140437" }],
    email: null,
    mapQuery: "Insurance Corporation of Belize, Santa Elena, Cayo, Belize",
    map: { x: 44.0, y: 282.4 },
    note: null
  },
  {
    id: "san-ignacio",
    name: "San Ignacio Branch",
    type: "Branch",
    district: "Cayo",
    town: "San Ignacio",
    address: "San Ignacio Town, Cayo District",
    phones: [{ display: "+501 824-3009", tel: "+5018243009" }],
    whatsapps: [{ display: "+501 613-4138", wa: "5016134138" }],
    email: "icb_sanignacio@icbinsurance.com",
    mapQuery: "Insurance Corporation of Belize, San Ignacio Town, Belize",
    map: { x: 38.3, y: 288.9 },
    note: null
  },
  {
    id: "benque-viejo-border",
    name: "Benque Viejo Border Branch",
    type: "Branch",
    district: "Cayo",
    town: "Benque Viejo del Carmen",
    address: "Western Border, Benque Viejo del Carmen, Cayo District",
    phones: [],
    corporateLine: true,
    whatsapps: [{ display: "+501 613-0548", wa: "5016130548" }],
    email: null,
    mapQuery: "Western Border Crossing, Benque Viejo del Carmen, Belize",
    map: { x: 24.2, y: 296.8 },
    note: null
  },
  {
    id: "benque-viejo",
    name: "Benque Viejo Agency",
    type: "Agency",
    district: "Cayo",
    town: "Benque Viejo del Carmen",
    address: "Benque Viejo del Carmen, Cayo District",
    phones: [],
    corporateLine: true,
    whatsapps: [],
    email: null,
    mapQuery: "Benque Viejo del Carmen, Cayo District, Belize",
    map: { x: 27.7, y: 299.0 },
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
    whatsapps: [{ display: "+501 614-9682", wa: "5016149682" }],
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
    address: "Seine Bight Village, Placencia Peninsula, Stann Creek District",
    phones: [],
    corporateLine: true,
    whatsapps: [],
    email: null,
    mapQuery: "Seine Bight Village, Stann Creek District, Belize",
    map: { x: 149.0, y: 374.4 },
    note: null
  },
  {
    id: "independence",
    name: "Independence Branch",
    type: "Branch",
    district: "Stann Creek",
    town: "Independence Village",
    address: "Independence Village, Stann Creek District",
    phones: [],
    corporateLine: true,
    whatsapps: [{ display: "+501 615-6951", wa: "5016156951" }],
    email: null,
    mapQuery: "Insurance Corporation of Belize, Independence Village, Belize",
    map: { x: 142.4, y: 388.0 },
    note: null
  },

  /* ------------------------------ Toledo ------------------------------- */
  {
    id: "punta-gorda",
    name: "Punta Gorda Branch",
    type: "Branch",
    district: "Toledo",
    town: "Punta Gorda",
    address: "#31 Main Middle Street, Punta Gorda Town",
    phones: [{ display: "+501 722-2291", tel: "+5017222291" }],
    whatsapps: [{ display: "+501 615-8046", wa: "5016158046" }],
    email: null,
    mapQuery: "31 Main Middle Street, Punta Gorda Town, Belize",
    map: { x: 79.4, y: 459.3 },
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

/* Locations with a published direct landline, in data order. */
ICB.DATA.phoneLines = function () {
  return ICB.DATA.activeLocations().filter(function (l) { return l.phones && l.phones.length; });
};
