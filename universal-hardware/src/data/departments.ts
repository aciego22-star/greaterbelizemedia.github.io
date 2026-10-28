import type { DepartmentId, IllustrationId } from './categories';

/**
 * The eight homepage departments group the twelve website categories into
 * customer-friendly entry points. Every department maps to real category pages.
 */
export interface Department {
  id: DepartmentId;
  name: string;
  /** Category slugs in this department; the first is the primary landing page. */
  categories: string[];
  illustration: IllustrationId;
  blurb: string;
  highlights: string[];
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'power-tools',
    name: 'Power Tools',
    categories: ['power-tools', 'woodworking'],
    illustration: 'drill',
    blurb: 'Drills, saws, grinders, cordless tools and workshop machinery.',
    highlights: ['Hammer drills', 'Cordless tools', 'Table saws'],
  },
  {
    id: 'welding-shop',
    name: 'Welding & Shop Equipment',
    categories: ['welding-supplies', 'shop-tools'],
    illustration: 'welding',
    blurb: 'Welders, plasma cutters, compressors, hoists and hydraulics.',
    highlights: ['MIG & TIG welders', 'Air compressors', 'Hydraulic jacks'],
  },
  {
    id: 'generators',
    name: 'Generators & Power',
    categories: ['generators'],
    illustration: 'generator',
    blurb: 'Portable, backup and industrial-application generators.',
    highlights: ['Home backup power', 'Job-site power', 'Industrial use'],
  },
  {
    id: 'pumps',
    name: 'Pumps & Water Systems',
    categories: ['water-pumps'],
    illustration: 'pump',
    blurb: 'Submersible, jet, booster, sump and engine-driven pumps.',
    highlights: ['Submersible pumps', 'Pressure systems', 'Irrigation'],
  },
  {
    id: 'lawn-garden',
    name: 'Lawn & Garden',
    categories: ['lawn-and-garden'],
    illustration: 'mower',
    blurb: 'Mowers, trimmers, chainsaws, sprayers and garden tools.',
    highlights: ['Lawn mowers', 'Trimmers', 'Chainsaws'],
  },
  {
    id: 'mobility',
    name: 'Motorcycles & Mobility',
    categories: ['motorcycles'],
    illustration: 'motorcycle',
    blurb: 'Lifan and Meilun motorcycles, scooters, engines and parts.',
    highlights: ['Street & trail', 'Scooters', 'Parts catalogues'],
  },
  {
    id: 'home',
    name: 'Home & Appliances',
    categories: ['household', 'lighting-and-fans'],
    illustration: 'fridge',
    blurb: 'Major appliances, AC units, lighting and fans for the home.',
    highlights: ['Refrigerators', 'AC units', 'Ceiling fans'],
  },
  {
    id: 'agri-hardware',
    name: 'Agriculture & Hardware',
    categories: ['agriculture', 'hand-tools'],
    illustration: 'fence',
    blurb: 'Fencing, cattle gates, bushhogs, trailer parts and hand tools.',
    highlights: ['Barb wire', 'Cattle gates', 'Hand tools'],
  },
];

export const DEPARTMENT_BY_ID = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d])) as Record<
  DepartmentId,
  Department
>;
