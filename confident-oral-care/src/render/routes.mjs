import * as pages from './pages.mjs';

/** Every public page for one language: localized path -> render function. Shared by the server and the export. */
export function pageRoutes(site) {
  const u = site.u;
  const routes = new Map([
    [u('/'), () => pages.homePage(site)],
    [u('/about'), () => pages.aboutPage(site)],
    [u('/services'), () => pages.servicesPage(site)],
    [u('/first-visit'), () => pages.firstVisitPage(site)],
    [u('/gallery'), () => pages.galleryPage(site)],
    [u('/blog'), () => pages.blogPage(site)],
    [u('/contact'), () => pages.contactPage(site)],
    [u('/appointments'), () => pages.appointmentsPage(site)],
  ]);
  for (const c of site.categories) routes.set(c.path, () => pages.categoryPage(site, c));
  for (const a of site.articles) routes.set(a.path, () => pages.articlePage(site, a));
  return routes;
}

/** Pages for every language. */
export function allPageRoutes(sites) {
  return new Map([...pageRoutes(sites.en), ...pageRoutes(sites.es)]);
}
