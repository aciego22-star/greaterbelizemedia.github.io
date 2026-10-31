/**
 * Guided product finder — deterministic local rules.
 * Every recommendation points to a category and sub-types that appear on
 * Universal Hardware's public Product Listing / Meilun & Lifan pages.
 * No stock, models, prices or sizing are inferred.
 */

export interface FinderOption {
  id: string;
  label: string;
  hint?: string;
}
export interface FinderQuestion {
  id: string;
  prompt: string;
  helper?: string;
  options: FinderOption[];
}
export interface FinderMatch {
  slug: string;
  /** Why this category matches, in plain language. */
  reason: string;
  /** Sub-type names exactly as listed in the category data. */
  focus: string[];
}
export interface FinderResult {
  headline: string;
  matches: FinderMatch[];
  tips: string[];
  /** Short context saved with the enquiry item. */
  context: string;
  caution?: string;
  guidePrompt: string;
}
export type Answers = Record<string, string>;
export interface FinderPath {
  id: string;
  label: string;
  /** Category whose website photo represents this path. */
  photo: string;
  blurb: string;
  questions: FinderQuestion[];
  resolve(a: Answers): FinderResult;
}

const label = (path: FinderPath, qid: string, a: Answers) =>
  path.questions.find((q) => q.id === qid)?.options.find((o) => o.id === a[qid])?.label ?? '';

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

/* -------------------------------------------------------------------------- */
const powerTools: FinderPath = {
  id: 'power-tools',
  label: 'Power tools',
  photo: 'power-tools',
  blurb: 'Drilling, cutting, sanding, grinding and workshop machinery.',
  questions: [
    {
      id: 'job',
      prompt: "What's the main job?",
      options: [
        { id: 'drill', label: 'Drilling & driving screws' },
        { id: 'masonry', label: 'Drilling concrete or block' },
        { id: 'cut', label: 'Cutting wood or materials' },
        { id: 'finish', label: 'Sanding & shaping' },
        { id: 'metal', label: 'Grinding or cutting metal' },
        { id: 'shop', label: 'Workshop machinery' },
      ],
    },
    {
      id: 'power',
      prompt: 'Power preference?',
      options: [
        { id: 'cordless', label: 'Cordless (battery)' },
        { id: 'corded', label: 'Corded' },
        { id: 'unsure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'use',
      prompt: 'How often will it be used?',
      options: [
        { id: 'home', label: 'Occasional home use' },
        { id: 'trade', label: 'Regular trade or site work' },
      ],
    },
  ],
  resolve(a) {
    const matches: FinderMatch[] = [];
    const cordless = a.power === 'cordless' ? ['Cordless tools'] : [];
    switch (a.job) {
      case 'drill':
        matches.push({
          slug: 'power-tools',
          reason: 'Drills and drivers cover everyday drilling in wood and metal and driving screws.',
          focus: uniq(['Speed drills', ...cordless, 'Hammer drills']),
        });
        matches.push({ slug: 'hand-tools', reason: 'Screwdrivers and measuring tapes round out most drilling jobs.', focus: ['Screwdrivers', 'Measuring tapes'] });
        break;
      case 'masonry':
        matches.push({
          slug: 'power-tools',
          reason: 'Concrete and block call for a hammer drill; heavier breaking work moves up to jack hammers.',
          focus: uniq(['Hammer drills', ...cordless, 'Jack hammers']),
        });
        matches.push({ slug: 'hand-tools', reason: 'Chisels and hammers for finishing masonry work.', focus: ['Chisels', 'Hammers'] });
        break;
      case 'cut':
        matches.push({
          slug: 'power-tools',
          reason: 'The listed saw types cover straight, curved, demolition and angled cuts.',
          focus: uniq(['Circular saws', 'Jig saws', 'Reciprocating saws', 'Miter saws', ...cordless]),
        });
        matches.push({ slug: 'woodworking', reason: 'For repeated precision cuts in a workshop, table and band saws.', focus: ['Table saws', 'Band saws'] });
        break;
      case 'finish':
        matches.push({ slug: 'power-tools', reason: 'Sanders and routers handle surface finishing and edge shaping.', focus: uniq(['Sanders', 'Routers', ...cordless]) });
        matches.push({ slug: 'woodworking', reason: 'Planers, jointers and shapers for preparing and profiling timber.', focus: ['Planers', 'Jointers', 'Shapers'] });
        break;
      case 'metal':
        matches.push({ slug: 'power-tools', reason: 'Grinders are the go-to for cutting, grinding and cleaning metal.', focus: uniq(['Grinders', ...cordless]) });
        matches.push({ slug: 'welding-supplies', reason: 'If the job involves joining metal, the welding range is listed too.', focus: ['Welding accessories', 'Arc / stick welders', 'Plasma cutters'] });
        break;
      default:
        matches.push({
          slug: 'woodworking',
          reason: 'Stationary machines for workshops and joinery.',
          focus: ['Table saws', 'Planers', 'Jointers', 'Band saws', 'Drill presses', 'Shapers'],
        });
        matches.push({ slug: 'shop-tools', reason: 'Air compressors and electric motors often support a workshop setup.', focus: ['Air compressors', 'Electric motors'] });
    }
    const tips = [
      'Name the material and thickness you work with most.',
      a.power === 'cordless'
        ? 'Ask whether the tool and battery are sold together or separately, and which battery platform it uses.'
        : a.power === 'corded'
          ? 'Check the power supply where you will work and the extension cord length you need.'
          : 'Ask the branch to compare cordless and corded options for your job.',
      a.use === 'trade'
        ? 'For daily trade use, ask about professional-grade lines, parts and service support.'
        : 'For occasional use, ask which option offers the best balance for home projects.',
    ];
    const jobLabel = label(powerTools, 'job', a);
    return {
      headline: `Power tools for ${jobLabel.toLowerCase()}`,
      matches,
      tips,
      context: `${jobLabel}; ${label(powerTools, 'power', a).toLowerCase()}; ${label(powerTools, 'use', a).toLowerCase()}`,
      guidePrompt: a.job === 'masonry' ? 'I need a cordless drill for concrete and steel.' : `I need power tools for ${jobLabel.toLowerCase()}.`,
    };
  },
};

/* -------------------------------------------------------------------------- */
const backupPower: FinderPath = {
  id: 'backup-power',
  label: 'Backup power',
  photo: 'generators',
  blurb: 'Generators for outages, job sites, farms and business.',
  questions: [
    {
      id: 'load',
      prompt: 'What do you want to keep running?',
      options: [
        { id: 'essentials', label: 'Lights, fridge & fans' },
        { id: 'home', label: 'Most of the home, including AC' },
        { id: 'tools', label: 'Power tools on a job site' },
        { id: 'business', label: 'Business or industrial equipment' },
        { id: 'portable', label: 'Camping or portable use' },
      ],
    },
    {
      id: 'freq',
      prompt: 'How often will it run?',
      options: [
        { id: 'occasional', label: 'Occasional outages' },
        { id: 'regular', label: 'Regular or daily use' },
        { id: 'unsure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'where',
      prompt: 'Where will it be used?',
      options: [
        { id: 'house', label: 'At home' },
        { id: 'site', label: 'Job site' },
        { id: 'farm', label: 'Farm or ranch' },
        { id: 'premises', label: 'Shop or business premises' },
      ],
    },
  ],
  resolve(a) {
    const focus: Record<string, string[]> = {
      essentials: ['Home backup power', 'Portable and camping generators'],
      home: ['Home backup power', 'Job-site and business generators'],
      tools: ['Job-site and business generators', 'Portable and camping generators'],
      business: ['Industrial-application generators', 'Job-site and business generators'],
      portable: ['Portable and camping generators', 'Meilun generators'],
    };
    const matches: FinderMatch[] = [
      {
        slug: 'generators',
        reason:
          a.load === 'home'
            ? 'Running most of a home, including air conditioning, is a larger requirement that needs a proper load assessment.'
            : a.load === 'business'
              ? 'Business and industrial loads sit at the larger end of the generator range.'
              : 'Generators cover a wide range of applications, from portable units upward.',
        focus: focus[a.load] ?? ['Home backup power'],
      },
    ];
    if (a.where === 'farm') matches.push({ slug: 'water-pumps', reason: 'Farms often pair power with water: engine-driven pumps are listed too.', focus: ['Gas and diesel powered water pumps'] });
    if (a.load === 'tools') matches.push({ slug: 'power-tools', reason: 'Cordless tools can reduce how much generator power a site needs.', focus: ['Cordless tools'] });
    if (a.load === 'essentials' || a.load === 'home') matches.push({ slug: 'lighting-and-fans', reason: 'Portable and solar lights are useful during outages.', focus: ['Portable lights', 'Flashlights and spotlights', 'Decorative solar lights'] });
    return {
      headline: 'Generators matched to your power needs',
      matches,
      tips: [
        'List the appliances or tools you want to run at the same time.',
        a.freq === 'regular' ? 'Mention that it will run regularly; duty cycle affects the right type.' : 'Mention whether it is mainly for occasional outages.',
        'Ask about fuel type, noise and where the generator can safely be placed.',
        'Have a qualified electrician assess the load and any connection to your home or building.',
      ],
      caution:
        'This guide does not size generators. A qualified electrician should confirm load and safe connection.',
      context: `${label(backupPower, 'load', a)}; ${label(backupPower, 'freq', a).toLowerCase()}; ${label(backupPower, 'where', a).toLowerCase()}`,
      guidePrompt: 'I need backup power for my home. What type should I look at?',
    };
  },
};

/* -------------------------------------------------------------------------- */
const waterPumping: FinderPath = {
  id: 'water-pumping',
  label: 'Water pumping',
  photo: 'water-pumps',
  blurb: 'Wells, cisterns, pressure systems, irrigation and drainage.',
  questions: [
    {
      id: 'source',
      prompt: 'Where is the water coming from?',
      options: [
        { id: 'deep', label: 'Deep well or borehole' },
        { id: 'shallow', label: 'Shallow well or cistern' },
        { id: 'surface', label: 'Tank, river or pond' },
        { id: 'flood', label: 'Flooded area or pit' },
      ],
    },
    {
      id: 'use',
      prompt: "What's it for?",
      options: [
        { id: 'pressure', label: 'Household water pressure' },
        { id: 'irrigation', label: 'Irrigation or sprinklers' },
        { id: 'transfer', label: 'Farm or livestock transfer' },
        { id: 'drain', label: 'Draining water' },
        { id: 'boat', label: 'Boat or marine use' },
      ],
    },
    {
      id: 'power',
      prompt: 'Is electricity available at the pump?',
      options: [
        { id: 'yes', label: 'Yes' },
        { id: 'no', label: 'No — engine-driven needed' },
        { id: 'unsure', label: 'Not sure' },
      ],
    },
  ],
  resolve(a) {
    const focus: string[] = [];
    if (a.source === 'deep') focus.push('Submersible pumps');
    if (a.use === 'pressure') focus.push('Jet pumps (pressure systems)', 'Booster pumps', 'Pressure pumps');
    if (a.use === 'irrigation') focus.push('Sprinkler pumps');
    if (a.use === 'drain' || a.source === 'flood') focus.push('Sump pumps');
    if (a.use === 'boat') focus.push('Marine pumps');
    if (a.power === 'no' || a.use === 'transfer') focus.push('Gas and diesel powered water pumps');
    if (a.source === 'shallow' && a.use !== 'pressure') focus.push('Jet pumps (pressure systems)');
    if (!focus.length) focus.push('Booster pumps', 'Pressure pumps');
    const matches: FinderMatch[] = [
      {
        slug: 'water-pumps',
        reason:
          a.source === 'deep'
            ? 'Deep wells generally use submersible pumps that sit in the water; pressure needs at the house matter too.'
            : 'Your water source and use point to these listed pump types.',
        focus: uniq(focus),
      },
    ];
    if (a.power === 'no' || a.power === 'unsure') matches.push({ slug: 'generators', reason: 'Where there is no mains power, a generator is the other route to run an electric pump.', focus: ['Portable and camping generators', 'Job-site and business generators'] });
    if (a.use === 'irrigation') matches.push({ slug: 'lawn-and-garden', reason: 'Hoses and sprinklers complete an irrigation setup.', focus: ['Garden hoses and sprinklers'] });
    if (a.use === 'transfer') matches.push({ slug: 'agriculture', reason: 'Related farm hardware is listed under Agriculture.', focus: ['Cattle gates', 'Trailer parts'] });
    return {
      headline: 'Water pumps for your source and use',
      matches,
      tips: [
        'Note the depth to the water and how high or far it has to travel.',
        'Describe the flow you need: one tap, the whole house, or irrigation.',
        'Bring pipe sizes or photos of your existing setup if you have one.',
        'Well systems should be confirmed with the branch or a qualified installer.',
      ],
      caution: 'Pump choice depends on depth, lift and flow. Confirm suitability with the branch before buying.',
      context: `${label(waterPumping, 'source', a)}; ${label(waterPumping, 'use', a).toLowerCase()}`,
      guidePrompt: 'I need a pump for my home water supply.',
    };
  },
};

/* -------------------------------------------------------------------------- */
const outdoor: FinderPath = {
  id: 'outdoor',
  label: 'Outdoor maintenance',
  photo: 'lawn-and-garden',
  blurb: 'Lawns, brush, trees, watering and fencing.',
  questions: [
    {
      id: 'task',
      prompt: 'What needs doing?',
      options: [
        { id: 'grass', label: 'Cutting grass' },
        { id: 'trim', label: 'Trimming edges & brush' },
        { id: 'trees', label: 'Cutting trees or branches' },
        { id: 'water', label: 'Watering & spraying' },
        { id: 'clear', label: 'Clearing overgrown land' },
        { id: 'fence', label: 'Fencing' },
      ],
    },
    {
      id: 'size',
      prompt: 'How big is the area?',
      options: [
        { id: 'small', label: 'Small yard' },
        { id: 'large', label: 'Large yard or property' },
        { id: 'farm', label: 'Farm or acreage' },
      ],
    },
    {
      id: 'power',
      prompt: 'Power preference?',
      options: [
        { id: 'gas', label: 'Gas-powered' },
        { id: 'electric', label: 'Electric' },
        { id: 'manual', label: 'Manual tools' },
      ],
    },
  ],
  resolve(a) {
    const matches: FinderMatch[] = [];
    const manual = a.power === 'manual';
    switch (a.task) {
      case 'grass':
        matches.push({
          slug: 'lawn-and-garden',
          reason: a.size === 'small' ? 'A walk-behind mower suits smaller lawns.' : 'Larger areas are where lawn tractors earn their keep.',
          focus: a.size === 'small' ? ['Lawn mowers', 'Trimmers'] : ['Lawn tractors', 'Lawn mowers'],
        });
        if (a.size === 'farm') matches.push({ slug: 'agriculture', reason: 'For pasture and rough ground, rotary cutters (bushhogs) are listed.', focus: ['Rotary cutters (bushhogs)'] });
        break;
      case 'trim':
        matches.push({ slug: 'lawn-and-garden', reason: 'Trimmers handle edges, weeds and light brush.', focus: ['Trimmers', 'Garden trimmers'] });
        break;
      case 'trees':
        matches.push({ slug: 'lawn-and-garden', reason: 'Chainsaws for trees and branches; trimmers for clean-up.', focus: ['Chainsaws', 'Trimmers'] });
        break;
      case 'water':
        matches.push({ slug: 'lawn-and-garden', reason: 'Hoses, sprinklers and sprayers are listed for watering and spraying.', focus: ['Garden hoses and sprinklers', 'Garden sprayers', 'Garden fertilizers'] });
        if (a.size !== 'small') matches.push({ slug: 'water-pumps', reason: 'Bigger areas may need a pump to move the water.', focus: ['Sprinkler pumps', 'Gas and diesel powered water pumps'] });
        break;
      case 'clear':
        matches.push({ slug: 'agriculture', reason: 'Rotary cutters (bushhogs) clear large overgrown areas behind a tractor.', focus: ['Rotary cutters (bushhogs)'] });
        matches.push({ slug: 'lawn-and-garden', reason: 'Trimmers and chainsaws for edges, brush and trees.', focus: ['Trimmers', 'Chainsaws'] });
        break;
      default:
        matches.push({ slug: 'agriculture', reason: 'Fencing wire, staples, electric fencers and gates are all listed.', focus: ['Barb wire', 'Fencing staples', 'Electric fencers', 'Cattle gates'] });
        matches.push({ slug: 'hand-tools', reason: 'Hammers and pliers for putting up fencing.', focus: ['Hammers', 'Pliers'] });
    }
    if (manual && a.task !== 'fence') {
      matches.push({ slug: 'lawn-and-garden', reason: 'Manual garden tools are listed too.', focus: ['Shovels, spades and rakes', 'Wheelbarrows'] });
    }
    // Merge duplicates of the same category.
    const merged: FinderMatch[] = [];
    for (const m of matches) {
      const ex = merged.find((x) => x.slug === m.slug);
      if (ex) ex.focus = uniq([...ex.focus, ...m.focus]);
      else merged.push({ ...m });
    }
    return {
      headline: `Outdoor equipment for ${label(outdoor, 'task', a).toLowerCase()}`,
      matches: merged,
      tips: [
        'Describe the area and the type of growth: lawn, bush or trees.',
        a.power === 'gas' ? 'Ask about fuel mix, servicing and parts for gas-powered equipment.' : a.power === 'electric' ? 'Check the power supply and cord length for electric equipment.' : 'Ask which manual tools suit the size of the job.',
        'Ask about protective equipment for trimmers and chainsaws.',
      ],
      context: `${label(outdoor, 'task', a)}; ${label(outdoor, 'size', a).toLowerCase()}; ${label(outdoor, 'power', a).toLowerCase()}`,
      guidePrompt: `I need equipment for ${label(outdoor, 'task', a).toLowerCase()}.`,
    };
  },
};

/* -------------------------------------------------------------------------- */
const motorcycles: FinderPath = {
  id: 'motorcycles',
  label: 'Motorcycles',
  photo: 'motorcycles',
  blurb: 'Scooters, street, trail and cargo bikes, parts and service.',
  questions: [
    {
      id: 'ride',
      prompt: 'How will you ride?',
      options: [
        { id: 'town', label: 'Commuting in town' },
        { id: 'trail', label: 'Rough roads or trails' },
        { id: 'cargo', label: 'Carrying cargo' },
        { id: 'utv', label: 'Farm or off-road utility' },
        { id: 'unsure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'need',
      prompt: 'What do you need help with?',
      options: [
        { id: 'new', label: 'Choosing a vehicle' },
        { id: 'parts', label: 'Parts for a Meilun or Lifan' },
        { id: 'service', label: 'Service or repair' },
      ],
    },
    {
      id: 'branch',
      prompt: 'Which branch is closer for you?',
      options: [
        { id: 'spanish-lookout', label: 'Spanish Lookout' },
        { id: 'belize-city', label: 'Belize City' },
        { id: 'either', label: 'Either' },
      ],
    },
  ],
  resolve(a) {
    const rideFocus: Record<string, string[]> = {
      town: ['Scooters and cub bikes', 'Street motorcycles'],
      trail: ['Trail motorcycles'],
      cargo: ['Cargo motorcycles'],
      utv: ['UTVs and ATVs (Hisun)', 'Trail motorcycles'],
      unsure: ['Scooters and cub bikes', 'Street motorcycles', 'Trail motorcycles', 'Cargo motorcycles'],
    };
    const focus = [...(rideFocus[a.ride] ?? [])];
    if (a.need === 'parts') focus.unshift('Parts catalogues (Meilun)');
    const matches: FinderMatch[] = [
      {
        slug: 'motorcycles',
        reason:
          a.need === 'parts'
            ? 'Meilun parts catalogues are available for parts orders; the branch can confirm availability.'
            : a.need === 'service'
              ? 'Each branch lists a Service Center WhatsApp line for service and repair enquiries.'
              : 'Models are grouped by riding style. Ask the branch for current models and prices.',
        focus: uniq(focus),
      },
    ];
    if (a.ride === 'utv') matches.push({ slug: 'agriculture', reason: 'Trailer parts and farm hardware are listed under Agriculture.', focus: ['Trailer parts'] });
    return {
      headline: a.need === 'parts' ? 'Motorcycle parts enquiry' : a.need === 'service' ? 'Motorcycle service enquiry' : 'Motorcycles for the way you ride',
      matches,
      tips: [
        a.need === 'parts' ? 'Have the model name and the part description or catalogue reference ready.' : 'Describe your typical route and whether you carry a passenger or load.',
        'Ask the branch which models are currently available and their current price.',
        a.need === 'service' ? 'Use the Service Center line for your preferred branch.' : 'Ask about parts and after-sales service for the model you choose.',
      ],
      context: `${label(motorcycles, 'ride', a)}; ${label(motorcycles, 'need', a).toLowerCase()}`,
      guidePrompt: 'Do you carry motorbikes?',
    };
  },
};

/* -------------------------------------------------------------------------- */
const household: FinderPath = {
  id: 'household',
  label: 'Household needs',
  photo: 'household',
  blurb: 'Appliances, cooling, lighting, hot water and home essentials.',
  questions: [
    {
      id: 'need',
      prompt: 'What are you looking for?',
      options: [
        { id: 'kitchen', label: 'Kitchen & cold storage' },
        { id: 'laundry', label: 'Laundry' },
        { id: 'cooling', label: 'Cooling: AC & fans' },
        { id: 'lighting', label: 'Lighting' },
        { id: 'water', label: 'Hot water' },
        { id: 'outdoor', label: 'Outdoor living & grills' },
        { id: 'furniture', label: 'Furniture & cleaning' },
      ],
    },
    {
      id: 'for',
      prompt: 'Is this for…',
      options: [
        { id: 'home', label: 'Home' },
        { id: 'office', label: 'Office or business' },
        { id: 'both', label: 'Both' },
      ],
    },
  ],
  resolve(a) {
    const m: FinderMatch[] = [];
    switch (a.need) {
      case 'kitchen':
        m.push({ slug: 'household', reason: 'Refrigeration and kitchen appliances are listed under Household.', focus: ['Refrigerators', 'Freezers', 'Coolers', 'Dishwashers'] });
        break;
      case 'laundry':
        m.push({ slug: 'household', reason: 'Washers, dryers and detergents are all listed.', focus: ['Washing machines', 'Dryers', 'Detergents'] });
        break;
      case 'cooling':
        m.push({ slug: 'household', reason: 'AC units are listed under Household.', focus: ['AC units'] });
        m.push({ slug: 'lighting-and-fans', reason: 'Ceiling and portable fans from the Lighting and Fans section.', focus: ['Westinghouse ceiling fans', 'Hunter ceiling fans', 'Lasko fans'] });
        break;
      case 'lighting':
        m.push({ slug: 'lighting-and-fans', reason: 'Fixtures, bulbs and outdoor lighting are listed.', focus: ['Westinghouse light fixtures', 'Westinghouse bulbs', 'Yard lights', 'Decorative solar lights'] });
        break;
      case 'water':
        m.push({ slug: 'household', reason: 'Hot water tanks are listed under Household.', focus: ['Hot water tanks'] });
        m.push({ slug: 'water-pumps', reason: 'Low pressure at the tap? Booster and pressure pumps are listed.', focus: ['Booster pumps', 'Pressure pumps'] });
        break;
      case 'outdoor':
        m.push({ slug: 'household', reason: 'Grills and coolers for outdoor living.', focus: ['BBQ grills', 'Coolers'] });
        m.push({ slug: 'lighting-and-fans', reason: 'Solar and yard lights for outdoor spaces.', focus: ['Decorative solar lights', 'Yard lights'] });
        break;
      default:
        m.push({ slug: 'household', reason: 'Tables, chairs and cleaning products are listed under Household.', focus: ['Lifetime tables', 'Office chairs', 'Chairs', 'Vacuum cleaners', 'Detergents'] });
    }
    if (a.for !== 'home' && a.need !== 'furniture') {
      const hh = m.find((x) => x.slug === 'household');
      if (hh && !hh.focus.includes('Office chairs')) hh.focus.push('Office chairs');
    }
    return {
      headline: `Household: ${label(household, 'need', a).toLowerCase()}`,
      matches: m,
      tips: [
        'Measure the space where the appliance will go, including doorways.',
        'Check the electrical supply at the installation point, especially for AC units and water heaters.',
        'Ask the branch about delivery and installation options for large appliances.',
      ],
      context: `${label(household, 'need', a)}; for ${label(household, 'for', a).toLowerCase()}`,
      guidePrompt: `I'm looking for ${label(household, 'need', a).toLowerCase()} for my ${a.for === 'office' ? 'business' : 'home'}.`,
    };
  },
};

export const FINDER_PATHS: FinderPath[] = [powerTools, backupPower, waterPumping, outdoor, motorcycles, household];
export const FINDER_BY_ID = Object.fromEntries(FINDER_PATHS.map((p) => [p.id, p])) as Record<string, FinderPath>;
