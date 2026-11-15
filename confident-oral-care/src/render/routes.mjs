import * as pages from './pages.mjs';

/** Every public page: path -> render function. Shared by the server and the static export. */
export function pageRoutes(site) {
  const routes = new Map([
    ['/', () => pages.homePage(site)],
    ['/about', () => pages.aboutPage(site)],
    ['/services', () => pages.servicesPage(site)],
    ['/first-visit', () => pages.firstVisitPage(site)],
    ['/gallery', () => pages.galleryPage(site)],
    ['/blog', () => pages.blogPage(site)],
    ['/contact', () => pages.contactPage(site)],
    ['/appointments', () => pages.appointmentsPage(site)],
  ]);
  for (const c of site.categories) routes.set(c.path, () => pages.categoryPage(site, c));
  for (const a of site.articles) routes.set(`/blog/${a.slug}`, () => pages.articlePage(site, a));
  return routes;
}
