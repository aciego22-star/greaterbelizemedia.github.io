/* ============================================================================
   ICB.DATA.locations — branch and agency network.
   Every address, phone, WhatsApp and email below was taken from ICB's
   current public website. Fields that could not be verified are null and
   the card copy degrades honestly (never invented).
   map: {x, y} are coordinates inside the Belize map SVG (viewBox 0 0 300 560).
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.districts = ["Corozal", "Orange Walk", "Belize", "Cayo", "Stann Creek", "Toledo"];

ICB.DATA.locations = [
  {
    id: "corporate",
    name: "Corporate Office",
    type: "Corporate Office",
    district: "Belize",
    town: "Belize City",
    address: "16 Daly Street, P.O. Box 519, Belize City",
    phones: [{ display: "+501 224-5328", tel: "+5012245328" }, { display: "+501 224-5329", tel: "+5012245329" }],
    whatsapp: null,
    email: "icb@icbinsurance.com",
    mapQuery: "Insurance Corporation of Belize, 16 Daly Street, Belize City, Belize",
    map: { x: 210, y: 198 },
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
    whatsapp: null,
    email: null,
    mapQuery: "Insurance Corporation of Belize, 38 Central American Boulevard, Belize City, Belize",
    map: { x: 206, y: 212 },
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
    whatsapp: null,
    email: null,
    mapQuery: "Airport Plaza, Philip Goldson Highway, Ladyville, Belize",
    map: { x: 200, y: 180 },
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
    whatsapp: null,
    email: null,
    mapQuery: "Pescador Drive, San Pedro Town, Ambergris Caye, Belize",
    map: { x: 252, y: 148 },
    note: "Phone details available through our Corporate Office, +501 224-5328."
  },
  {
    id: "belmopan",
    name: "Belmopan Branch",
    type: "Branch",
    district: "Cayo",
    town: "Belmopan",
    address: "#6095 South Ring Road, Belmopan City",
    phones: [{ display: "+501 822-0473", tel: "+5018220473" }],
    whatsapp: null,
    email: null,
    mapQuery: "Insurance Corporation of Belize, 6095 South Ring Road, Belmopan, Belize",
    map: { x: 152, y: 262 },
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
    whatsapp: { display: "+501 613-4138", wa: "5016134138" },
    email: "icb_sanignacio@icbinsurance.com",
    mapQuery: "Insurance Corporation of Belize, San Ignacio Town, Belize",
    map: { x: 98, y: 272 },
    note: null
  },
  {
    id: "orange-walk",
    name: "Orange Walk Branch",
    type: "Branch",
    district: "Orange Walk",
    town: "Orange Walk Town",
    address: "#48 Belize Corozal Road, Orange Walk Town",
    phones: [{ display: "+501 322-3509", tel: "+5013223509" }],
    whatsapp: null,
    email: null,
    mapQuery: "Insurance Corporation of Belize, 48 Belize Corozal Road, Orange Walk Town, Belize",
    map: { x: 172, y: 108 },
    note: null
  },
  {
    id: "corozal",
    name: "Corozal Agency",
    type: "Agency",
    district: "Corozal",
    town: "Corozal Town",
    address: "Corozal Town",
    phones: [],
    whatsapp: null,
    email: null,
    mapQuery: "Corozal Town, Belize",
    map: { x: 198, y: 42 },
    note: "Agency partner. Contact details available through our Corporate Office, +501 224-5328."
  },
  {
    id: "dangriga",
    name: "Dangriga Branch",
    type: "Branch",
    district: "Stann Creek",
    town: "Dangriga",
    address: "Market Square, Dangriga Town",
    phones: [{ display: "+501 522-0706", tel: "+5015220706" }],
    whatsapp: { display: "+501 614-9682", wa: "5016149682" },
    email: "icb_dangriga@icbinsurance.com",
    mapQuery: "Market Square, Dangriga Town, Belize",
    map: { x: 182, y: 332 },
    note: null
  },
  {
    id: "punta-gorda",
    name: "Punta Gorda Branch",
    type: "Branch",
    district: "Toledo",
    town: "Punta Gorda",
    address: "#31 Main Middle Street, Punta Gorda Town",
    phones: [{ display: "+501 722-2291", tel: "+5017222291" }],
    whatsapp: null,
    email: null,
    mapQuery: "31 Main Middle Street, Punta Gorda Town, Belize",
    map: { x: 138, y: 502 },
    note: null
  }
];

ICB.DATA.locationById = function (id) {
  for (var i = 0; i < ICB.DATA.locations.length; i++) {
    if (ICB.DATA.locations[i].id === id) return ICB.DATA.locations[i];
  }
  return null;
};

/* Verified WhatsApp lines only (used by the mobile quick bar chooser). */
ICB.DATA.whatsappLines = function () {
  return ICB.DATA.locations.filter(function (l) { return !!l.whatsapp; });
};
