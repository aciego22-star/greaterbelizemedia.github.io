import clinicData from '../config/clinic-data.json' with { type: 'json' };
import schedulingConfig from '../config/scheduling.json' with { type: 'json' };
import siteJson from '../config/site.json' with { type: 'json' };
import * as blogEn from '../content/blog.mjs';
import * as blogEs from '../content/es/blog.mjs';
import * as pagesEs from '../content/es/pages.mjs';
import * as treatmentsEs from '../content/es/treatments.mjs';
import { ui } from '../content/i18n.mjs';
import * as pagesEn from '../content/pages.mjs';
import * as treatmentsEn from '../content/treatments.mjs';
import { formatHours } from './render/util.mjs';
import { statusMessages } from './scheduling/messages.mjs';

const CONTENT = {
  en: { pages: pagesEn, treatments: treatmentsEn, blog: blogEn },
  es: { pages: pagesEs, treatments: treatmentsEs, blog: blogEs },
};

/** "/services" -> "/es/services" for Spanish; "/" -> "/es". External and hash links are untouched. */
export function localePath(path, locale) {
  if (locale !== 'es' || !path.startsWith('/') || path.startsWith('/es/') || path === '/es') return path;
  return path === '/' ? '/es' : `/es${path}`;
}

/** The same page in the other language. */
export function stripLocale(path) {
  if (path === '/es') return '/';
  return path.startsWith('/es/') ? path.slice(3) : path;
}

/**
 * Loads the single editable source of clinic facts (config/clinic-data.json) and merges it with the
 * page copy for one language. The website and confident AI both read from the object returned here.
 */
export async function loadSite(root, { locale = 'en' } = {}) {
  // Imported (not read from disk) so the serverless bundle carries the same records.
  const clinic = structuredClone(clinicData);
  const siteConfig = structuredClone(siteJson);
  const scheduling = structuredClone(schedulingConfig);
  const { pages, treatments, blog } = CONTENT[locale] ?? CONTENT.en;
  const t = ui[locale] ?? ui.en;
  const u = (path) => localePath(path, locale);

  const categories = clinic.serviceGroups.map((group) => {
    const copy = treatments.categories.find((c) => c.slug === group.slug);
    if (!copy) throw new Error(`Missing treatment copy for ${group.slug} (${locale})`);
    return {
      ...copy,
      title: copy.title ?? group.title,
      path: u(`/services/${group.slug}`),
      nextSteps: copy.nextSteps.map((n) => ({ ...n, href: u(n.href) })),
      services: group.services.map((s) => {
        if (!copy.sections[s.slug]) throw new Error(`Missing copy for service ${s.slug} (${locale})`);
        return {
          ...s,
          name: copy.names?.[s.slug] ?? s.name,
          aliases: [...s.aliases, ...(copy.aliases?.[s.slug] ?? [])],
          body: copy.sections[s.slug],
          path: u(`/services/${group.slug}#${s.slug}`),
        };
      }),
    };
  });

  // Localized labels for the booking visit types.
  scheduling.visitTypes = scheduling.visitTypes.map((v) => ({ ...v, ...(t.visitTypes[v.id] ?? {}), servicePage: u(v.servicePage) }));

  const articles = blog.articles.map((a) => ({ ...a, path: u(`/blog/${a.slug}`), explore: a.explore.map((e) => ({ ...e, href: u(e.href) })) }));
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`;

  return {
    locale,
    t,
    u,
    clinic,
    siteConfig,
    scheduling,
    categories,
    servicesIndex: treatments.servicesIndex,
    blogIndex: blog.blogIndex,
    articles,
    pages,
    hours: formatHours(clinic.publicHours, locale),
    directionsUrl,
    statusMessages: statusMessages(clinic, locale),
  };
}

/** Loads both languages. */
export async function loadSites(root) {
  return { en: await loadSite(root, { locale: 'en' }), es: await loadSite(root, { locale: 'es' }) };
}

/** Which visit type to suggest from a treatment page. */
export function visitTypeForService(serviceSlug) {
  if (serviceSlug === 'general-consultations' || serviceSlug === 'digital-x-rays') return 'general-consultation';
  if (['orthodontic-consultations', 'fixed-retainers', 'removable-retainers'].includes(serviceSlug)) {
    return 'orthodontic-consultation';
  }
  return 'other-visit';
}
