import type { SourceId } from './sources';

/**
 * Category records mirror the twelve sections of Universal Hardware's public
 * Product Listing page (plus the Meilun & Lifan page for motorcycles).
 *
 * - `subcategories` use the wording of the source page (lightly normalised for
 *   capitalisation). Each carries search keywords, including common Belizean
 *   English and Spanish terms, so on-site search is forgiving.
 * - `summary` / `intro` are concept copy written for this demonstration. They
 *   describe what the website lists; they do not claim current stock.
 * - `listedBrands` are only brands the source page names for that category.
 */

export type DepartmentId =
  | 'power-tools'
  | 'welding-shop'
  | 'generators'
  | 'pumps'
  | 'lawn-garden'
  | 'mobility'
  | 'home'
  | 'agri-hardware';

export type IllustrationId =
  | 'drill'
  | 'welding'
  | 'handtools'
  | 'mower'
  | 'fan'
  | 'saw'
  | 'generator'
  | 'pump'
  | 'fridge'
  | 'fence'
  | 'compressor'
  | 'motorcycle';

export interface Subcategory {
  name: string;
  keywords: string[];
  /** Extra caveat shown next to the item, e.g. historical pages. */
  note?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  department: DepartmentId;
  illustration: IllustrationId;
  /** One-line concept summary for cards. */
  summary: string;
  /** Short paragraph for the category page. */
  intro: string;
  subcategories: Subcategory[];
  /** Explains how the sub-types were derived when they are not a verbatim list. */
  subcategoryNote?: string;
  listedBrands: string[];
  /** Questions a visitor may want to prepare before contacting a branch. */
  prepare: string[];
  keywords: string[];
  related: string[];
  sourceIds: SourceId[];
  verificationStatus: 'website-listed' | 'website-listed-historical-details';
  caveat?: string;
}

const s = (name: string, ...keywords: string[]): Subcategory => ({ name, keywords });

export const CATEGORIES: Category[] = [
  {
    id: 'power-tools',
    slug: 'power-tools',
    name: 'Power Tools',
    shortName: 'Power Tools',
    department: 'power-tools',
    illustration: 'drill',
    summary: 'Drills, hammer drills, saws, sanders, routers, grinders and cordless tools.',
    intro:
      'The current website lists a broad power-tool range, from speed drills and hammer drills to saws, sanders, routers, grinders and cordless tools, naming Makita, Master Mechanic and Tool Craft.',
    subcategories: [
      s('Speed drills', 'drill', 'driver', 'taladro', 'electric drill'),
      s('Hammer drills', 'hammer drill', 'masonry', 'concrete', 'block', 'rotomartillo', 'taladro percutor'),
      s('Jack hammers', 'jackhammer', 'demolition', 'breaker', 'concrete', 'martillo demoledor'),
      s('Circular saws', 'saw', 'circular', 'cutting', 'sierra circular'),
      s('Jig saws', 'jigsaw', 'saw', 'sierra caladora'),
      s('Reciprocating saws', 'sawzall', 'saw', 'demolition', 'sierra sable'),
      s('Sanders', 'sander', 'sanding', 'lijadora'),
      s('Routers', 'router', 'woodwork', 'rebajadora'),
      s('Miter saws', 'mitre', 'chop saw', 'saw', 'ingleteadora'),
      s('Grinders', 'angle grinder', 'grinding', 'cut off', 'esmeril', 'esmeriladora', 'pulidora'),
      s('Cordless tools', 'battery', 'cordless', 'inalambrico', 'bateria', 'impact driver'),
    ],
    listedBrands: ['Makita', 'Master Mechanic', 'Tool Craft'],
    prepare: [
      'The material you will be working with (wood, metal, concrete or block).',
      'Whether you prefer cordless convenience or corded power.',
      'How often the tool will be used: occasional home use or daily trade work.',
    ],
    keywords: ['power tools', 'tools', 'herramientas electricas', 'makita', 'drill', 'saw'],
    related: ['woodworking', 'hand-tools', 'shop-tools'],
    sourceIds: ['productListing'],
    verificationStatus: 'website-listed',
  },
  {
    id: 'welding-supplies',
    slug: 'welding-supplies',
    name: 'Welding Supplies',
    shortName: 'Welding',
    department: 'welding-shop',
    illustration: 'welding',
    summary: 'Arc/stick, MIG and TIG welders, plasma cutters, cutting torches, electrodes and accessories.',
    intro:
      'Welding is a featured section of the current Product Listing page, which names Lincoln Electric and lists arc/stick, MIG and TIG welders, plasma cutters, cutting torches, electrodes and welding accessories.',
    subcategories: [
      s('Arc / stick welders', 'arc', 'stick', 'smaw', 'welder', 'soldadora', 'planta de soldar'),
      s('MIG welders', 'mig', 'wire feed', 'gmaw', 'welder', 'soldadora mig'),
      s('TIG welders', 'tig', 'gtaw', 'aluminium', 'stainless', 'welder'),
      s('Plasma cutters', 'plasma', 'cutting', 'cortadora de plasma'),
      s('Cutting torches', 'oxy', 'acetylene', 'torch', 'soplete'),
      s('Electrodes', 'rods', 'electrode', 'welding rod', 'electrodos', 'varillas'),
      s('Welding accessories', 'helmet', 'gloves', 'clamp', 'careta', 'accessories'),
    ],
    listedBrands: ['Lincoln Electric'],
    prepare: [
      'The welding process you need (stick, MIG or TIG) or whether you mainly need to cut.',
      'The metals and thicknesses you work with.',
      'The electrical supply available where you will weld.',
    ],
    keywords: ['welding', 'welder', 'soldadura', 'soldar', 'lincoln'],
    related: ['shop-tools', 'generators', 'power-tools'],
    sourceIds: ['productListing'],
    verificationStatus: 'website-listed',
  },
  {
    id: 'generators',
    slug: 'generators',
    name: 'Generators',
    shortName: 'Generators',
    department: 'generators',
    illustration: 'generator',
    summary: 'Generators across sizes and applications, from portable units to industrial use.',
    intro:
      'The website describes generators for a wide range of applications, from small portable units to industrial use, and names Denyo, Briggs & Stratton, Honda, Makita, Lincoln Electric and Meilun. Sizes and models change, so the right match should be confirmed with a branch and a qualified electrician.',
    subcategories: [
      s('Portable and camping generators', 'portable', 'camping', 'small', 'planta portatil', 'generador'),
      s('Home backup power', 'backup', 'blackout', 'outage', 'house', 'planta de luz', 'emergencia'),
      s('Job-site and business generators', 'jobsite', 'work site', 'contractor', 'business', 'shop'),
      s('Industrial-application generators', 'industrial', 'large', 'commercial', 'diesel'),
      s('Meilun generators', 'meilun', 'parts catalogue'),
    ],
    subcategoryNote:
      'The Product Listing page describes generators for applications from camping to industrial use rather than listing sub-types; these groupings summarise that description. Meilun generators appear on the Meilun & Lifan page.',
    listedBrands: ['Denyo', 'Briggs & Stratton', 'Honda', 'Makita', 'Lincoln Electric', 'Meilun'],
    prepare: [
      'Which appliances or tools you want to run at the same time.',
      'Whether you need occasional backup, portable job-site power or regular use.',
      'Fuel preference and where the generator will be placed.',
      'A qualified electrician should assess load and any connection to a building.',
    ],
    keywords: ['generator', 'generators', 'genset', 'planta', 'generador', 'power', 'backup power', 'electricity'],
    related: ['water-pumps', 'welding-supplies', 'motorcycles'],
    sourceIds: ['productListing', 'meilun'],
    verificationStatus: 'website-listed',
    caveat:
      'The website mentions a historical size range. This concept does not repeat it as current stock; ask the branch what is available.',
  },
  {
    id: 'water-pumps',
    slug: 'water-pumps',
    name: 'Water Pumps',
    shortName: 'Water Pumps',
    department: 'pumps',
    illustration: 'pump',
    summary: 'Submersible, jet, booster, sump, sprinkler, marine, pressure and engine-driven pumps.',
    intro:
      'The current Product Listing page covers most water-moving needs: submersible pumps, jet pumps for pressure systems, sprinkler, booster, sump, marine and pressure pumps, plus gas- and diesel-powered water pumps.',
    subcategories: [
      s('Submersible pumps', 'well', 'deep well', 'borehole', 'bomba sumergible', 'pozo'),
      s('Jet pumps (pressure systems)', 'jet', 'shallow well', 'house water', 'pressure tank', 'bomba de agua'),
      s('Sprinkler pumps', 'irrigation', 'sprinkler', 'riego'),
      s('Booster pumps', 'booster', 'low pressure', 'presion'),
      s('Sump pumps', 'sump', 'drainage', 'flood', 'drenaje'),
      s('Marine pumps', 'boat', 'bilge', 'marine', 'lancha'),
      s('Pressure pumps', 'pressure', 'water pressure', 'presion'),
      s('Gas and diesel powered water pumps', 'engine pump', 'motobomba', 'gasoline pump', 'diesel pump', 'farm'),
    ],
    listedBrands: [],
    prepare: [
      'Your water source: well, cistern, tank, river or mains.',
      'How deep the water is and how high or far it must be pumped.',
      'What the pump is for: household pressure, irrigation, drainage or transfer.',
      'Whether power is available on site or an engine-driven pump is needed.',
    ],
    keywords: ['pump', 'pumps', 'water', 'bomba', 'bombas', 'agua', 'water supply'],
    related: ['generators', 'agriculture', 'lawn-and-garden'],
    sourceIds: ['productListing', 'meilun'],
    verificationStatus: 'website-listed',
  },
  {
    id: 'lawn-and-garden',
    slug: 'lawn-and-garden',
    name: 'Lawn and Garden',
    shortName: 'Lawn & Garden',
    department: 'lawn-garden',
    illustration: 'mower',
    summary: 'Mowers, lawn tractors, trimmers, chainsaws, sprayers, hoses and garden tools.',
    intro:
      'From mowers and lawn tractors to trimmers, chainsaws and everyday garden tools, the current website names ECHO/Shindaiwa, MTD, Briggs & Stratton and Homelite in its lawn and garden section.',
    subcategories: [
      s('Lawn mowers', 'mower', 'push mower', 'grass', 'podadora', 'cortacesped'),
      s('Lawn tractors', 'riding mower', 'tractor', 'ride on'),
      s('Trimmers', 'weed eater', 'string trimmer', 'brush cutter', 'whipper', 'desbrozadora', 'chapeadora'),
      s('Chainsaws', 'chain saw', 'tree', 'motosierra', 'power saw'),
      s('Garden trimmers', 'hedge', 'hedge trimmer', 'shears'),
      s('Wheelbarrows', 'barrow', 'carretilla'),
      s('Shovels, spades and rakes', 'shovel', 'spade', 'rake', 'pala', 'rastrillo'),
      s('Garden sprayers', 'sprayer', 'pump sprayer', 'fumigadora', 'bomba de mochila'),
      s('Garden hoses and sprinklers', 'hose', 'sprinkler', 'manguera'),
      s('Garden fertilizers', 'fertilizer', 'fertiliser', 'abono'),
    ],
    listedBrands: ['ECHO / Shindaiwa', 'MTD', 'Briggs & Stratton', 'Homelite'],
    prepare: [
      'The size of the area and type of growth: lawn, bush or trees.',
      'Gas-powered, electric or manual preference.',
      'How often you will use it and who will operate it.',
    ],
    keywords: ['lawn', 'garden', 'yard', 'jardin', 'echo', 'outdoor power'],
    related: ['agriculture', 'water-pumps', 'hand-tools'],
    sourceIds: ['productListing'],
    verificationStatus: 'website-listed',
  },
  {
    id: 'motorcycles',
    slug: 'motorcycles',
    name: 'Motorcycles & Equipment',
    shortName: 'Motorcycles',
    department: 'mobility',
    illustration: 'motorcycle',
    summary: 'Lifan and Meilun scooters, street, trail and cargo bikes, plus related engines and equipment.',
    intro:
      'The current website has a dedicated Meilun & Lifan page covering scooters and cub bikes, street, trail and cargo motorcycles, along with Meilun engines, generators and water pumps, and publishes Meilun parts catalogues. A separate Hisun page lists UTV and ATV models. Those model pages carry older pricing, so current models and prices must be confirmed with a branch.',
    subcategories: [
      s('Scooters and cub bikes', 'scooter', 'cub', 'moped', 'moto', 'motoneta'),
      s('Street motorcycles', 'street bike', 'commuter', 'motorbike', 'motocicleta'),
      s('Trail motorcycles', 'trail', 'dirt bike', 'off road', 'enduro'),
      s('Cargo motorcycles', 'cargo', 'tricycle', 'delivery', 'carga'),
      s('Small engines', 'engine', 'motor', 'gas engine', 'motor estacionario'),
      s('Meilun generators and water pumps', 'meilun generator', 'meilun pump'),
      s('UTVs and ATVs (Hisun page)', 'utv', 'atv', 'side by side', 'quad', 'cuatrimoto'),
      s('Parts catalogues (Meilun)', 'parts', 'spare parts', 'repuestos', 'catalogue'),
    ],
    subcategoryNote:
      'Grouped from the model types shown on the Meilun & Lifan, Hisun and Meilun Catalogues pages.',
    listedBrands: ['Lifan', 'Meilun', 'Hisun'],
    prepare: [
      'How you will ride: street commuting, trail or cargo work.',
      'Your preferred branch for viewing, parts and service.',
      'Whether you also need parts or service for an existing Meilun or Lifan bike.',
    ],
    keywords: ['motorcycle', 'motorcycles', 'motorbike', 'bike', 'moto', 'lifan', 'meilun', 'hisun', 'mobility'],
    related: ['generators', 'water-pumps', 'shop-tools'],
    sourceIds: ['meilun', 'hisun', 'catalogues', 'productListing'],
    verificationStatus: 'website-listed-historical-details',
    caveat:
      'Model lists and prices on the current Meilun & Lifan and Hisun pages appear historical. No models, prices or availability are shown in this concept.',
  },
  {
    id: 'household',
    slug: 'household',
    name: 'Household',
    shortName: 'Household',
    department: 'home',
    illustration: 'fridge',
    summary: 'Refrigerators, freezers, washers, dryers, AC units, hot water tanks, grills and more.',
    intro:
      'The household section of the current website lists major appliances such as refrigerators, freezers, dishwashers, washers and dryers, air conditioning units and hot water tanks, alongside coolers, grills, vacuum cleaners, tables, chairs and detergents.',
    subcategories: [
      s('Refrigerators', 'fridge', 'refrigerator', 'refrigeradora', 'nevera'),
      s('Freezers', 'freezer', 'deep freeze', 'congelador'),
      s('Coolers', 'cooler', 'ice chest', 'hielera'),
      s('Dishwashers', 'dishwasher', 'lavaplatos'),
      s('Washing machines', 'washer', 'washing machine', 'lavadora'),
      s('Dryers', 'dryer', 'secadora'),
      s('Hot water tanks', 'water heater', 'hot water', 'calentador'),
      s('AC units', 'air conditioner', 'aircon', 'a/c', 'ac', 'aire acondicionado', 'cooling'),
      s('Detergents', 'detergent', 'soap', 'cleaning'),
      s('Lifetime tables', 'table', 'folding table', 'mesa'),
      s('Office chairs', 'office chair', 'silla de oficina'),
      s('Chairs', 'chair', 'seating', 'sillas'),
      s('BBQ grills', 'bbq', 'grill', 'barbecue', 'parrilla'),
      s('Vacuum cleaners', 'vacuum', 'aspiradora'),
    ],
    listedBrands: [],
    prepare: [
      'The appliance type and the space available for it.',
      'Electrical supply at the installation point (for AC units and large appliances).',
      'Whether you need delivery or installation advice. Ask the branch what it offers.',
    ],
    keywords: ['household', 'home', 'appliances', 'electrodomesticos', 'casa', 'sankey'],
    related: ['lighting-and-fans', 'hand-tools', 'generators'],
    sourceIds: ['productListing'],
    verificationStatus: 'website-listed',
  },
  {
    id: 'lighting-and-fans',
    slug: 'lighting-and-fans',
    name: 'Lighting and Fans',
    shortName: 'Lighting & Fans',
    department: 'home',
    illustration: 'fan',
    summary: 'Westinghouse fixtures and bulbs, ceiling fans, Lasko fans, solar, yard and portable lights.',
    intro:
      'The current website lists Westinghouse light fixtures, bulbs and ceiling fans, Hunter ceiling fans and Lasko fans, plus flashlights, spotlights, decorative solar lights, yard lights and portable lights.',
    subcategories: [
      s('Westinghouse light fixtures', 'fixture', 'lamp', 'lighting', 'lampara'),
      s('Westinghouse bulbs', 'bulb', 'led', 'light bulb', 'bombillo', 'foco'),
      s('Westinghouse ceiling fans', 'ceiling fan', 'abanico de techo', 'ventilador de techo'),
      s('Hunter ceiling fans', 'ceiling fan', 'hunter'),
      s('Lasko fans', 'fan', 'box fan', 'tower fan', 'abanico', 'ventilador'),
      s('Flashlights and spotlights', 'flashlight', 'torch', 'spotlight', 'linterna'),
      s('Decorative solar lights', 'solar', 'garden light', 'luz solar'),
      s('Yard lights', 'yard', 'outdoor light', 'security light'),
      s('Portable lights', 'portable', 'work light', 'lantern'),
    ],
    listedBrands: ['Westinghouse', 'Hunter', 'Lasko'],
    prepare: [
      'Room size or outdoor area you want to light or cool.',
      'Mounting: ceiling, wall, floor or portable.',
      'Interest in energy-efficient or solar options.',
    ],
    keywords: ['lighting', 'lights', 'fans', 'luces', 'abanicos', 'westinghouse', 'lasko', 'hunter'],
    related: ['household', 'generators', 'hand-tools'],
    sourceIds: ['productListing'],
    verificationStatus: 'website-listed',
  },
  {
    id: 'woodworking',
    slug: 'woodworking',
    name: 'Woodworking',
    shortName: 'Woodworking',
    department: 'power-tools',
    illustration: 'saw',
    summary: 'Table saws, planers, jointers, band saws, drill presses and shapers.',
    intro:
      'For workshops and joinery, the current website lists table saws, planers, jointers, band saws, drill presses and shapers, naming Grizzly and Tool Craft.',
    subcategories: [
      s('Table saws', 'table saw', 'bench saw', 'sierra de mesa'),
      s('Planers', 'planer', 'thicknesser', 'cepillo'),
      s('Jointers', 'jointer', 'canteadora'),
      s('Band saws', 'bandsaw', 'sierra de cinta'),
      s('Drill presses', 'drill press', 'pedestal drill', 'taladro de banco'),
      s('Shapers', 'shaper', 'spindle moulder', 'tupi'),
    ],
    listedBrands: ['Grizzly', 'Tool Craft'],
    prepare: [
      'The workshop space and electrical supply available.',
      'The scale of work: hobby, furniture making or production joinery.',
      'Stock sizes and timber types you work with.',
    ],
    keywords: ['woodworking', 'carpentry', 'joinery', 'carpinteria', 'workshop', 'grizzly'],
    related: ['power-tools', 'hand-tools', 'shop-tools'],
    sourceIds: ['productListing'],
    verificationStatus: 'website-listed',
  },
  {
    id: 'shop-tools',
    slug: 'shop-tools',
    name: 'Shop Tools',
    shortName: 'Shop Tools',
    department: 'welding-shop',
    illustration: 'compressor',
    summary: 'Air compressors, chain hoists, chains, hydraulic cylinders and jacks, electric motors and ladders.',
    intro:
      'The Shop Tools section of the current website covers workshop and garage equipment: air compressors, chain hoists and chains, hydraulic cylinders and jacks, electric motors, and ladders and stepladders.',
    subcategories: [
      s('Air compressors', 'compressor', 'air', 'compresor'),
      s('Chain hoists', 'hoist', 'chain block', 'lifting', 'polipasto', 'tecle'),
      s('Chains', 'chain', 'cadena'),
      s('Hydraulic cylinders', 'cylinder', 'hydraulic', 'cilindro hidraulico'),
      s('Hydraulic jacks', 'jack', 'floor jack', 'bottle jack', 'gato hidraulico', 'mechanic'),
      s('Electric motors', 'motor', 'electric motor', 'motor electrico'),
      s('Ladders and stepladders', 'ladder', 'stepladder', 'escalera'),
    ],
    listedBrands: [],
    prepare: [
      'What you need to lift, power or reach, and the loads involved.',
      'Air tool requirements if you are choosing a compressor.',
      'Voltage and phase available for electric motors.',
    ],
    keywords: ['shop', 'workshop', 'garage', 'mechanic', 'taller', 'industrial'],
    related: ['welding-supplies', 'power-tools', 'hand-tools'],
    sourceIds: ['productListing'],
    verificationStatus: 'website-listed',
  },
  {
    id: 'agriculture',
    slug: 'agriculture',
    name: 'Agriculture',
    shortName: 'Agriculture',
    department: 'agri-hardware',
    illustration: 'fence',
    summary: 'Barb wire, fencing staples, electric fencers, cattle gates, rotary cutters and trailer parts.',
    intro:
      'For farms and ranches, the current website lists barb wire, fencing staples, electric fencers, cattle gates, rotary cutters (bushhogs) and trailer parts.',
    subcategories: [
      s('Barb wire', 'barbed wire', 'barbwire', 'alambre de pua', 'fence wire'),
      s('Fencing staples', 'staples', 'grapas', 'fence'),
      s('Electric fencers', 'electric fence', 'energizer', 'cerca electrica'),
      s('Cattle gates', 'gate', 'livestock', 'corral', 'porton'),
      s('Rotary cutters (bushhogs)', 'bushhog', 'bush hog', 'rotary cutter', 'chapeadora', 'tractor'),
      s('Trailer parts', 'trailer', 'hitch', 'axle', 'remolque'),
    ],
    listedBrands: [],
    prepare: [
      'Fence length, livestock type and whether you need electric or barbed fencing.',
      'Tractor size and hitch type for rotary cutters.',
      'Trailer make or measurements for trailer parts.',
    ],
    keywords: ['agriculture', 'farm', 'ranch', 'cattle', 'agricultura', 'finca', 'fencing', 'bekaert'],
    related: ['lawn-and-garden', 'water-pumps', 'hand-tools'],
    sourceIds: ['productListing'],
    verificationStatus: 'website-listed',
  },
  {
    id: 'hand-tools',
    slug: 'hand-tools',
    name: 'Hand Tools',
    shortName: 'Hand Tools',
    department: 'agri-hardware',
    illustration: 'handtools',
    summary: 'Hammers, saws, chisels, tapes, wrenches, socket sets, pliers, screwdrivers and extension cords.',
    intro:
      'The everyday essentials: the current website lists hammers, hand saws, chisels, measuring tapes, wrenches, socket sets, pliers, screwdrivers and extension cords.',
    subcategories: [
      s('Hammers', 'hammer', 'martillo', 'mallet'),
      s('Hand saws', 'handsaw', 'saw', 'serrucho'),
      s('Chisels', 'chisel', 'cincel', 'formon'),
      s('Measuring tapes', 'tape measure', 'measuring tape', 'cinta metrica', 'metro'),
      s('Wrenches', 'wrench', 'spanner', 'llave'),
      s('Socket sets', 'socket', 'ratchet', 'dados', 'mechanic'),
      s('Pliers', 'pliers', 'alicate', 'pinza'),
      s('Screwdrivers', 'screwdriver', 'desarmador', 'destornillador'),
      s('Extension cords', 'extension', 'cord', 'extension cord', 'extension electrica'),
    ],
    listedBrands: [],
    prepare: [
      'The job or trade you are equipping for.',
      'Metric or imperial sizes (for wrenches and sockets).',
      'Whether you need individual tools or a set.',
    ],
    keywords: ['hand tools', 'tools', 'hardware', 'herramientas', 'ferreteria'],
    related: ['power-tools', 'shop-tools', 'woodworking'],
    sourceIds: ['productListing'],
    verificationStatus: 'website-listed',
  },
];

export const CATEGORY_BY_SLUG: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);

export function getCategory(slug: string): Category {
  const c = CATEGORY_BY_SLUG[slug];
  if (!c) throw new Error(`Unknown category: ${slug}`);
  return c;
}
