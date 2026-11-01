/**
 * What Universal Hardware's live website (universalhardware.bz) says, read on
 * 1 November 2026, for Universal AI's answers. Pages: Home, About, Brands,
 * Product Listing, the brand pages (Makita, Echo & Shindaiwa, Cub Cadet,
 * Homelite, Lincoln Electric, Sankey, Toolcraft), Meilun & Lifan, Hisun,
 * Meilun Catalogues and the employment form. Prices are as printed on those
 * pages (dollar amounts, read as Belize dollars); the branch confirms today's
 * price.
 */

export const LIVE = 'https://universalhardware.bz/';

export const COMPANY = {
  summary: 'Retail and wholesale distributors of hardware tools, household appliances, power equipment, motorcycles and welding supplies.',
  summaryEs: 'Distribuidores mayoristas y minoristas de herramientas, electrodomésticos, equipo motorizado, motocicletas y suministros de soldadura.',
  email: 'sales@universalhardware.bz',
  phone: '+501 823-0254',
  mailing: ['Universal Hardware Company Ltd.', '585 Center Road, Spanish Lookout', 'Cayo, Belize, Central America'],
  fax: { 'spanish-lookout': '+501 823-0311', 'belize-city': '+501 224-4141' },
  careersEmail: 'apply@universalhardware.bz',
  careersForm: 'https://universalhardware.bz/index_files/Emplyment_Form.pdf',
};

/** "Closed on all Belize public and bank holidays, including…" (About page). */
export const HOLIDAYS = [
  ["New Year's Day", 'Año Nuevo', 'January'],
  ['National Heroes & Benefactors Day', 'Día de los Héroes y Benefactores Nacionales', 'March'],
  ['Easter', 'Semana Santa', ''],
  ['Labor Day', 'Día del Trabajo', 'May'],
  ["Sovereign's Day / Commonwealth Day", 'Día del Soberano / de la Mancomunidad', 'May'],
  ["St. George's Caye Day", 'Día de St. George\'s Caye', 'September'],
  ['Independence Day', 'Día de la Independencia', 'September'],
  ['Pan American Day', 'Día Panamericano', 'October'],
  ['Christmas Day', 'Navidad', 'December'],
  ['Boxing Day', 'Boxing Day', 'December'],
] as const;

export interface ListedModel {
  model: string;
  brand: 'Lifan' | 'Meilun' | 'Hisun';
  type: string;
  typeEs: string;
  /** As printed on the page, e.g. "2,178.00". */
  price: string;
  specs?: string[];
  specsEs?: string[];
  page: string;
}

const MEILUN_PAGE = LIVE + 'meilun.html';
const HISUN_PAGE = LIVE + 'Hisun.html';
const T = {
  cub: ['Cub bike / scooter', 'Scooter / moto cub'],
  street: ['Street bike', 'Moto de calle'],
  trail: ['Trail bike', 'Moto de montaña (trail)'],
  cruiser: ['Street cruiser', 'Moto crucero'],
  cargo: ['3-wheel cargo bike', 'Moto de carga de 3 ruedas'],
  cutter: ['Brush cutter', 'Desbrozadora'],
  utv: ['UTV (side-by-side)', 'UTV (vehículo utilitario)'],
  atv: ['ATV', 'Cuatrimoto (ATV)'],
} as const;
const m = (model: string, t: readonly [string, string], price: string, specs?: [string, string][]): ListedModel => ({
  model,
  brand: model.startsWith('ML') ? 'Meilun' : 'Lifan',
  type: t[0],
  typeEs: t[1],
  price,
  specs: specs?.map((s) => s[0]),
  specsEs: specs?.map((s) => s[1]),
  page: MEILUN_PAGE,
});

/** Meilun & Lifan page: models, types, printed prices and the specs it lists. */
export const MEILUN_LIFAN: ListedModel[] = [
  m('LF100-A', T.cub, '2,178.00', [
    ['Fuel consumption under 1.9 L/100 km', 'Consumo de combustible menor a 1.9 L/100 km'],
    ['Fuel tank 3.5 litres', 'Tanque de 3.5 litros'],
    ['Front and rear drum brakes', 'Frenos de tambor delanteros y traseros'],
    ['Spoke or mag wheels', 'Rines de rayos o de magnesio'],
  ]),
  m('LF110-7A', T.cub, '2,476.00'),
  m('LF125-5', T.street, '2,371.00', [
    ['Fuel consumption under 2.1 L/100 km', 'Consumo de combustible menor a 2.1 L/100 km'],
    ['Fuel tank 10 litres', 'Tanque de 10 litros'],
    ['Front and rear drum brakes', 'Frenos de tambor delanteros y traseros'],
    ['Mag wheels', 'Rines de magnesio'],
  ]),
  m('LF125-7', T.street, '2,713.00', [
    ['Fuel consumption under 2.1 L/100 km', 'Consumo de combustible menor a 2.1 L/100 km'],
    ['Fuel tank 10.3 litres', 'Tanque de 10.3 litros'],
    ['Front disc brake, rear drum brake', 'Freno delantero de disco, trasero de tambor'],
    ['Mag wheels', 'Rines de magnesio'],
  ]),
  m('LF150T-12C', T.cub, '3,309.00'),
  m('LF150-7', T.street, '2,788.00'),
  m('LF150-5U', T.street, '4,249.00'),
  m('LF150-5L', T.street, '3,257.00'),
  m('ML150GY-3A', T.trail, '4,134.00'),
  m('ML200GY-4', T.trail, '4,223.00'),
  m('LF200GY-4', T.trail, '3,758.00'),
  m('ML250GY-4', T.trail, '4,538.00', [
    ['Double-action front shock absorber', 'Amortiguador delantero de doble acción'],
    ['Front and rear disc brakes', 'Frenos de disco delanteros y traseros'],
  ]),
  m('LF250GY-4', T.trail, '4,594.00', [
    ['Double-action front shock absorber', 'Amortiguador delantero de doble acción'],
    ['Front and rear disc brakes', 'Frenos de disco delanteros y traseros'],
  ]),
  m('LF200-14F', T.cruiser, '5,634.00'),
  m('ML200ZH-3', T.cargo, '4,979.00', [
    ['Fuel consumption under 3.1 L/100 km', 'Consumo de combustible menor a 3.1 L/100 km'],
    ['Maximum load 350 kg', 'Carga máxima de 350 kg'],
    ['Regular vehicle-type rims', 'Rines tipo vehículo'],
  ]),
  m('LF150-10F', T.cruiser, '4,389.00'),
  m('LF1200DT', T.cub, '6,587.00'),
  m('LF125-AR', T.cub, '2,639.00'),
  m('LF150-7A', T.street, '2,827.00'),
  m('LF150GY-3B', T.trail, '3,354.00'),
  m('LF150-10S', T.cruiser, '5,386.00', [
    ['Single-cylinder, water-cooled, 4-stroke engine, 6-speed gearbox', 'Motor monocilíndrico de 4 tiempos enfriado por agua, caja de 6 velocidades'],
    ['Front and rear disc brakes', 'Frenos de disco delanteros y traseros'],
  ]),
  m('ML200-16D', T.street, '3,905.00', [
    ['Fuel consumption under 2.3 L/100 km', 'Consumo de combustible menor a 2.3 L/100 km'],
    ['Fuel tank 12.5 litres', 'Tanque de 12.5 litros'],
    ['Front disc brake, rear drum brake', 'Freno delantero de disco, trasero de tambor'],
    ['Mag wheels', 'Rines de magnesio'],
  ]),
  m('ML125T-26', T.cub, '3,270.00', [
    ['Fuel consumption under 2.8 L/100 km', 'Consumo de combustible menor a 2.8 L/100 km'],
    ['Fuel tank 6 litres', 'Tanque de 6 litros'],
    ['Front disc brake, rear drum brake', 'Freno delantero de disco, trasero de tambor'],
    ['Mag wheels', 'Rines de magnesio'],
  ]),
  m('LF330H', T.cutter, '411.00', [['33 cc engine', 'Motor de 33 cc']]),
  m('LF520H', T.cutter, '429.00', [['52 cc engine', 'Motor de 52 cc']]),
];

/** Hisun page: UTVs and ATVs with their printed prices. */
export const HISUN: ListedModel[] = [
  { model: 'HS750UTV-3', brand: 'Hisun', type: `${T.utv[0]}: Sector 750 Crew`, typeEs: `${T.utv[1]}: Sector 750 Crew`, price: '40,606.00', page: HISUN_PAGE },
  { model: 'HS900UTV', brand: 'Hisun', type: `${T.utv[0]}: Strike 900`, typeEs: `${T.utv[1]}: Strike 900`, price: '24,756.00', page: HISUN_PAGE },
  { model: 'HS750UTV', brand: 'Hisun', type: `${T.utv[0]}: Sector 750`, typeEs: `${T.utv[1]}: Sector 750`, price: '29,849.00', page: HISUN_PAGE },
  { model: 'HS550UTV-4', brand: 'Hisun', type: `${T.utv[0]}: Sector 550`, typeEs: `${T.utv[1]}: Sector 550`, price: '22,582.00', page: HISUN_PAGE },
  { model: 'HS250ATV', brand: 'Hisun', type: `${T.atv[0]}: ATV 250`, typeEs: `${T.atv[1]}: ATV 250`, price: '14,920.00', page: HISUN_PAGE },
  { model: 'HS550ATV', brand: 'Hisun', type: `${T.atv[0]}: ATV 550`, typeEs: `${T.atv[1]}: ATV 550`, price: '23,606.00', page: HISUN_PAGE },
];

export const LISTED_MODELS: ListedModel[] = [...MEILUN_LIFAN, ...HISUN];

/** Other Meilun products on the same page (no prices printed). */
export const MEILUN_PRODUCTS = ['Water pump 2″ 50ZB', 'Water pump 3″ 80ZB', 'Engines 160F, 170F, 173F, 173F-H, 182F, 188F', 'Generators 2200, 5500, 8000E, 10000E'];

/** Meilun Catalogues page: parts catalogues to use when ordering parts. */
export const PARTS_CATALOGUES = {
  page: LIVE + 'catalogues.html',
  groups: [
    ['Scooters', 'Scooters', 'ML100-A, ML125T-26'],
    ['Street', 'Calle', 'ML125-5, ML125-7, ML150-9J, ML200-16D, ML250-4'],
    ['Trail', 'Montaña', 'ML150GY-3A, ML200GY-5'],
    ['Cargo', 'Carga', 'ML150ZH-3'],
    ['Generators', 'Generadores', '2200, 5500'],
    ['Pumps', 'Bombas', '50ZB26-4Q, 80ZB30-4 8Q'],
  ] as const,
};

/** What each brand page on the live site says, for brand questions. */
export const BRAND_FACTS: Record<string, { en: string; es: string; page: string }> = {
  makita: {
    en: 'Makita has over 100 years of experience in motor design and is a global leader in power tools, with industrial tools and accessories for construction professionals. Universal\'s Makita page lists laminate trimmers, saws (jig, circular, reciprocating), drills and driver drill kits, cordless hammer drills, sanders, grinders, nail guns, leaf blowers, angle drills, batteries, lights and 4-stroke brush cutters, plus guides on power tool basics, extension cords and power tool safety.',
    es: 'Makita tiene más de 100 años de experiencia en diseño de motores y es líder mundial en herramientas eléctricas, con herramientas y accesorios industriales para profesionales de la construcción. La página de Makita de Universal incluye recortadoras, sierras (caladora, circular, sable), taladros y kits de taladro atornillador, rotomartillos inalámbricos, lijadoras, esmeriles, clavadoras, sopladoras, taladros angulares, baterías, lámparas y desbrozadoras de 4 tiempos, además de guías de herramientas, extensiones eléctricas y seguridad.',
    page: LIVE + 'Makita.html',
  },
  'echo-shindaiwa': {
    en: 'ECHO tools (chainsaws, blowers, brush cutters) are built with vibration-isolating technology across the range, for less fatigue. Universal Hardware is the proud distributor of Shindaiwa in Belize: Japanese professional outdoor equipment, famous for its brush cutters and trimmers. Universal backs both with service, parts and accessories.',
    es: 'Las herramientas ECHO (motosierras, sopladoras, desbrozadoras) tienen tecnología antivibración en toda la línea, para menos fatiga. Universal Hardware es el orgulloso distribuidor de Shindaiwa en Belice: equipo profesional japonés para exteriores, famoso por sus desbrozadoras y recortadoras. Universal respalda ambas marcas con servicio, repuestos y accesorios.',
    page: LIVE + 'Echo.html',
  },
  'cub-cadet': {
    en: 'Universal Hardware is the authorized dealer for Cub Cadet lawn tractors and equipment, including zero-turn tractors and riding mowers. Models on its page: XT1 Enduro Series, RZT L Series lap-bar zero-turn, ride-on 17ARCBDA010 and commercial ride-on 53RWEFJU050.',
    es: 'Universal Hardware es distribuidor autorizado de tractores y equipo de jardín Cub Cadet, incluidos tractores zero-turn y cortadoras con asiento. Modelos en su página: serie XT1 Enduro, zero-turn RZT L, cortadora con asiento 17ARCBDA010 y la comercial 53RWEFJU050.',
    page: LIVE + 'Cub-Cadet.html',
  },
  homelite: {
    en: 'Homelite has made value outdoor tools for nearly seven decades: mowers, hedge trimmers, generators and pressure washers. Universal\'s page lists the F2020, F3045 and HBC52FSBB weed eaters.',
    es: 'Homelite fabrica herramientas de exterior a buen precio desde hace casi siete décadas: cortadoras de césped, recortadoras de setos, generadores e hidrolavadoras. La página de Universal incluye las desbrozadoras F2020, F3045 y HBC52FSBB.',
    page: LIVE + 'Homelite.html',
  },
  'lincoln-electric': {
    en: 'Lincoln Electric is a global manufacturer and market leader in welding, cutting and joining products.',
    es: 'Lincoln Electric es un fabricante mundial y líder del mercado en productos de soldadura, corte y unión.',
    page: LIVE + 'Lincoln-Electric.html',
  },
  sankey: {
    en: 'Sankey is a leading brand of refrigeration equipment and home appliances in Belize: high-efficiency inverter split air conditioners, refrigerators, freezers, beverage coolers, water dispensers, washing machines, LED TVs, microwaves and ventilation fans.',
    es: 'Sankey es una marca líder en Belice de equipos de refrigeración y electrodomésticos: aires acondicionados split inverter de alta eficiencia, refrigeradoras, congeladores, enfriadores de bebidas, dispensadores de agua, lavadoras, televisores LED, microondas y abanicos.',
    page: LIVE + 'Sankey.html',
  },
  toolcraft: {
    en: 'Toolcraft is a line of dependable professional tools, which also covers the Fulgore and Wolfox brands, each with a warranty and quality certificate. Universal\'s page lists the TC5337 and TC5369 brush cutters.',
    es: 'Toolcraft es una línea de herramientas profesionales confiables que incluye las marcas Fulgore y Wolfox, cada una con garantía y certificado de calidad. La página de Universal incluye las desbrozadoras TC5337 y TC5369.',
    page: LIVE + 'Tool-Craft.html',
  },
};

/** Sankey page: area to be cooled (square feet, up to and including) → cooling capacity (BTU per hour). */
export const AC_CHART: [number, number][] = [
  [150, 5000],
  [250, 6000],
  [300, 7000],
  [350, 8000],
  [400, 9000],
  [450, 10000],
  [550, 12000],
  [700, 14000],
  [1000, 18000],
  [1200, 21000],
  [1400, 23000],
  [1500, 24000],
  [2000, 30000],
  [2500, 34000],
];
