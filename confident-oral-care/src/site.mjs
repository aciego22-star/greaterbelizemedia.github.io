import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { articles, blogIndex } from '../content/blog.mjs';
import * as pages from '../content/pages.mjs';
import { categories as categoryCopy, servicesIndex } from '../content/treatments.mjs';
import { formatHours } from './render/util.mjs';
import { statusMessages } from './scheduling/messages.mjs';

/**
 * Loads the single editable source of clinic facts (config/clinic-data.json) and merges it with the
 * page copy. The website and confident AI both read from the object returned here.
 */
export async function loadSite(root, { staticPreview = false } = {}) {
  const readJson = async (rel) => JSON.parse(await readFile(join(root, rel), 'utf8'));
  const clinic = await readJson('config/clinic-data.json');
  const siteConfig = await readJson('config/site.json');
  const scheduling = await readJson('config/scheduling.json');

  const categories = clinic.serviceGroups.map((group) => {
    const copy = categoryCopy.find((c) => c.slug === group.slug);
    if (!copy) throw new Error(`Missing treatment copy for ${group.slug}`);
    return {
      ...copy,
      title: group.title,
      path: `/services/${group.slug}`,
      services: group.services.map((s) => {
        if (!copy.sections[s.slug]) throw new Error(`Missing copy for service ${s.slug}`);
        return { ...s, body: copy.sections[s.slug], path: `/services/${group.slug}#${s.slug}` };
      }),
    };
  });

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`;

  return {
    clinic,
    siteConfig,
    scheduling,
    categories,
    servicesIndex,
    blogIndex,
    articles,
    pages,
    hours: formatHours(clinic.publicHours),
    directionsUrl,
    statusMessages: statusMessages(clinic),
    // Static export (no server): online booking and confident AI's conversation are switched off.
    staticPreview,
  };
}

/** Which visit type to suggest from a treatment page. */
export function visitTypeForService(serviceSlug) {
  if (serviceSlug === 'general-consultations' || serviceSlug === 'digital-x-rays') return 'general-consultation';
  if (['orthodontic-consultations', 'fixed-retainers', 'removable-retainers'].includes(serviceSlug)) {
    return 'orthodontic-consultation';
  }
  return 'other-visit';
}
