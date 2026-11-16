import { visitTypeForService } from '../site.mjs';
import { layout } from './layout.mjs';
import { esc, icon, picture, singlePicture } from './util.mjs';

const photo = (site, id) => site.pages.gallery.photos.find((p) => p.id === id);
const arrow = () => icon('arrow', 'icon icon-arrow');

function link(href, label, cls = 'text-link') {
  return `<a class="${cls}" href="${esc(href)}">${esc(label)}${arrow()}</a>`;
}

function breadcrumbs(site, items) {
  return `<nav class="breadcrumbs" aria-label="${esc(site.t.common.breadcrumb)}"><ol>${items.map((item, i) => (
    i === items.length - 1
      ? `<li><span aria-current="page">${esc(item.label)}</span></li>`
      : `<li><a href="${site.u(item.href)}">${esc(item.label)}</a></li>`
  )).join('')}</ol></nav>`;
}

function pageHead(site, { title, lead, crumbs }) {
  return `<section class="page-head">
  <div class="container">
    ${crumbs ? breadcrumbs(site, crumbs) : ''}
    <h1>${esc(title)}</h1>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
  </div>
</section>`;
}

const home = (site) => ({ label: site.t.nav.home, href: '/' });

function contactPanel(site, { tone = 'ivory' } = {}) {
  const { clinic, t, u } = site;
  return `<section class="section section-${tone} contact-band" aria-labelledby="visit-heading">
  <div class="container contact-band-grid">
    <div>
      <h2 id="visit-heading">${esc(t.contactPanel.heading)}</h2>
      <p class="address">${icon('pin')}<span><strong>ConfiDent Oral Care</strong><br>${esc(clinic.address)}</span></p>
      <p><a class="text-link" href="${esc(site.directionsUrl)}" rel="noopener">${esc(t.common.getDirections)}${arrow()}</a></p>
    </div>
    <div>
      <h3 class="small-heading">${esc(t.contactPanel.arrange)}</h3>
      <ul class="channel-list">
        <li><a href="${u('/appointments')}">${icon('calendar')} ${esc(t.contactPanel.online)}</a></li>
        <li><a href="${clinic.phone.href}">${icon('phone')} ${esc(t.common.call)} ${esc(clinic.phone.label)}</a></li>
        <li><a href="${esc(clinic.whatsapp.href)}" rel="noopener">${icon('whatsapp')} ${esc(t.common.messageWhatsApp)}</a></li>
        <li><a href="${clinic.email.href}">${icon('mail')} ${esc(clinic.email.label)}</a> <span class="muted small">${esc(t.common.generalEnquiries)}</span></li>
      </ul>
    </div>
    <div>
      <h3 class="small-heading">${esc(t.contactPanel.hours)}</h3>
      <dl class="hours-list">${site.hours.map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join('')}</dl>
      <p class="muted small">${esc(site.pages.contact.hoursNote)}</p>
    </div>
  </div>
</section>`;
}

function articleCards(site, list = site.articles, headingLevel = 3) {
  return `<ul class="card-grid card-grid-3" role="list">${list.map((a) => `
    <li class="card article-card">
      <h${headingLevel} class="card-title"><a href="${a.path}">${esc(a.title)}</a></h${headingLevel}>
      <p>${esc(a.excerpt)}</p>
      <span class="card-more" aria-hidden="true">${esc(site.t.common.readGuide)}${arrow()}</span>
    </li>`).join('')}
  </ul>`;
}

function dentistJsonLd(site) {
  const { clinic, siteConfig } = site;
  const dayMap = { Monday: 'Mo', Tuesday: 'Tu', Wednesday: 'We', Thursday: 'Th', Friday: 'Fr', Saturday: 'Sa', Sunday: 'Su' };
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: clinic.practice,
    slogan: clinic.tagline,
    ...(siteConfig.canonicalOrigin ? { url: siteConfig.canonicalOrigin } : {}),
    telephone: clinic.phone.e164,
    email: clinic.email.label,
    address: { '@type': 'PostalAddress', streetAddress: 'The Boardwalk Belize', addressLocality: 'Belize City', addressCountry: 'BZ' },
    openingHours: clinic.publicHours.flatMap((h) => h.ranges.map((r) => `${h.days.map((d) => dayMap[d]).join(',')} ${r.opens}-${r.closes}`)),
    sameAs: Object.values(clinic.socialLinks),
    availableLanguage: ['English', 'Spanish'],
    employee: { '@type': 'Person', name: clinic.clinician.name, jobTitle: clinic.clinician.designation },
  };
}

/* ------------------------------------------------------------------ Home */

/** Immersive hero slideshow: the photos, then the video (config: site.json media.heroSlides / heroVideo). */
function heroSlides(site) {
  const { t } = site;
  const { heroSlides: cfg, heroVideo: video } = site.siteConfig.media;
  const slides = cfg.photos.map((id, i) => {
    const p = photo(site, id);
    return { label: p.title, html: picture(p, { alt: t.hero.alts[id] ?? p.alt, className: 'hero-picture', priority: i === 0, loading: 'eager', breakpoint: 760 }) };
  });
  if (video?.mp4) {
    slides.push({
      label: t.hero.videoTitle,
      video: true,
      html: `${video.backdrop ? `<img class="hero-video-backdrop" src="${esc(video.backdrop)}" alt="" aria-hidden="true">` : ''}
      <video class="hero-video" playsinline preload="none" poster="${esc(video.poster)}"${video.width ? ` width="${video.width}" height="${video.height}"` : ''} aria-label="${esc(t.hero.videoTitle)}">
        ${video.webm ? `<source src="${esc(video.webm)}" type="video/webm">` : ''}
        <source src="${esc(video.mp4)}" type="video/mp4">
      </video>`,
    });
  }
  const total = slides.length;
  return {
    slides: slides.map((sl, i) => `<div class="hero-slide${i === 0 ? ' is-active' : ''}${sl.video ? ' hero-slide-video' : ''}" role="group" aria-roledescription="slide" aria-label="${esc(t.hero.slideLabel(i + 1, total, sl.label))}"${i === 0 ? '' : ' aria-hidden="true"'}>
      ${sl.html}
    </div>`).join('\n    '),
    controls: `<div class="hero-controls" role="group" aria-label="${esc(t.hero.controls)}">
      <button class="hero-ctl hero-prev" type="button" data-hero-prev>${icon('prev')}<span class="visually-hidden">${esc(t.hero.prev)}</span></button>
      <div class="hero-dots">${slides.map((sl, i) => `<button class="hero-dot" type="button" data-hero-dot="${i}"${i === 0 ? ' aria-current="true"' : ''}><span class="visually-hidden">${esc(t.hero.show(i + 1, sl.label))}</span></button>`).join('')}</div>
      <button class="hero-ctl hero-next" type="button" data-hero-next>${icon('next')}<span class="visually-hidden">${esc(t.hero.next)}</span></button>
      <button class="hero-ctl" type="button" data-hero-pause>
        <span class="when-running">${icon('pause')}<span class="visually-hidden">${esc(t.hero.pause)}</span></span>
        <span class="when-paused">${icon('play')}<span class="visually-hidden">${esc(t.hero.play)}</span></span>
      </button>
      ${video?.mp4 ? `<button class="hero-ctl hero-sound" type="button" data-hero-sound hidden>
        <span class="when-muted">${icon('mute')}<span class="hero-sound-hint">${esc(t.hero.tapSound)}</span><span class="visually-hidden">${esc(t.hero.soundOn)}</span></span>
        <span class="when-sound">${icon('volume')}<span class="visually-hidden">${esc(t.hero.mute)}</span></span>
      </button>` : ''}
    </div>`,
    interval: cfg.intervalSeconds ?? 6,
  };
}

export function homePage(site) {
  const { pages: { home: copy, firstVisit }, clinic, t, u } = site;
  const hero = heroSlides(site);
  const body = `
<section class="hero hero-slides" aria-labelledby="hero-title" aria-roledescription="carousel" data-hero data-interval="${hero.interval}">
  <div class="hero-track">
    ${hero.slides}
  </div>
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="hero-copy">
    <h1 id="hero-title">${esc(copy.hero.title)}</h1>
    <p class="hero-location">${esc(copy.hero.location)}</p>
    <div class="btn-row">
      <a class="btn btn-primary" href="${u('/appointments')}">${esc(t.common.requestAppointment)}</a>
      <a class="btn btn-secondary" href="${u('/services')}"><span class="label-long">${esc(t.common.exploreServices)}</span><span class="label-short" aria-hidden="true">${esc(t.common.ourServices)}</span></a>
    </div>
  </div>
  ${hero.controls}
</section>

<section class="hero-intro" aria-label="${esc(t.hero.welcome)}">
  <div class="container narrow">
    <p>${esc(copy.hero.body)}</p>
  </div>
</section>

<section class="section meet" aria-labelledby="meet-title">
  <div class="container split split-media-left">
    <div class="split-media">
      ${picture(photo(site, 'opening-day'), {
        alt: t.home.meetAlt, sizes: '(min-width: 900px) 50vw, 100vw', portraitSizes: '100vw', className: 'framed portrait-frame', portraitOnly: true,
      })}
    </div>
    <div class="split-copy">
      <h2 id="meet-title">${esc(copy.meet.title)}</h2>
      <p class="designation">${esc(clinic.clinician.designation)}</p>
      <hr class="rule">
      <p>${esc(copy.meet.body)}</p>
      ${link(u('/about'), copy.meet.cta)}
    </div>
  </div>
</section>

<section class="section section-ivory" aria-labelledby="services-title">
  <div class="container">
    <div class="section-intro">
      <h2 id="services-title">${esc(copy.services.title)}</h2>
      <p>${esc(copy.services.body)}</p>
    </div>
    <ul class="card-grid service-cards" role="list">
      ${site.categories.map((c, i) => `
      <li class="card service-card">
        <span class="card-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="card-title"><a href="${c.path}">${esc(c.title)}</a></h3>
        <p>${esc(c.card)}</p>
        <span class="card-more" aria-hidden="true">${esc(t.common.explore)}${arrow()}</span>
      </li>`).join('')}
    </ul>
    <p class="center">${link(u('/services'), t.common.exploreServices, 'btn btn-secondary')}</p>
  </div>
</section>

<section class="section first-visit-band" aria-labelledby="first-title">
  <div class="container split">
    <div class="split-copy">
      <h2 id="first-title">${esc(t.home.firstVisitHeading)}</h2>
      <p>${esc(copy.firstVisit.body)}</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="${u('/appointments')}">${esc(t.common.requestAppointment)}</a>
        ${link(u('/first-visit'), copy.firstVisit.cta)}
      </div>
    </div>
    <ol class="steps" role="list">
      ${firstVisit.steps.map((s, i) => `<li><span class="step-num" aria-hidden="true">${i + 1}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div></li>`).join('')}
    </ol>
  </div>
</section>

<section class="section section-ivory" aria-labelledby="inside-title">
  <div class="container">
    <div class="section-intro">
      <h2 id="inside-title">${esc(copy.inside.title)}</h2>
      <p>${esc(copy.inside.body)}</p>
    </div>
    <div class="gallery-preview">
      ${['reception', 'treatment-room'].map((id) => photo(site, id)).map((p) => `<a class="gallery-preview-item" href="${u('/gallery')}#${p.id}">
        ${picture(p, { sizes: '(min-width: 900px) 50vw, 100vw', className: 'framed', landscapeOnly: true })}
        <span class="caption">${esc(p.title)}</span>
      </a>`).join('')}
    </div>
    <div class="btn-row center">
      ${link(u('/gallery'), copy.inside.cta, 'btn btn-secondary')}
      ${link(`${u('/gallery')}#videos`, t.home.watchVideos)}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="blog-title">
  <div class="container">
    <div class="section-intro">
      <h2 id="blog-title">${esc(copy.blog.title)}</h2>
      <p>${esc(copy.blog.body)}</p>
    </div>
    ${articleCards(site)}
    <p class="center">${link(u('/blog'), copy.blog.cta)}</p>
  </div>
</section>

${contactPanel(site)}`;
  return layout(site, { title: t.home.title, path: '/', description: copy.metaDescription, body, jsonLd: dentistJsonLd(site), bodyClass: 'page-home' });
}

/* ----------------------------------------------------------------- About */

export function aboutPage(site) {
  const { pages: { about }, t, u } = site;
  const body = `
${pageHead(site, { title: about.title, crumbs: [home(site), { label: t.about.crumb }] })}
<section class="section section-tight">
  <div class="container split split-media-left">
    <div class="split-media">
      ${picture(photo(site, 'opening-day'), {
        alt: t.about.alt, sizes: '(min-width: 900px) 50vw, 100vw', className: 'framed portrait-frame', portraitOnly: true, priority: true,
      })}
    </div>
    <div class="split-copy">
      <p class="designation large">${esc(site.clinic.clinician.name)}<br><span>${esc(site.clinic.clinician.designation)}</span></p>
      <hr class="rule">
      ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
      <div class="btn-row">
        <a class="btn btn-primary" href="${u('/appointments')}">${esc(t.common.requestAppointment)}</a>
        <a class="btn btn-secondary" href="${u('/services')}">${esc(t.common.exploreServices)}</a>
      </div>
    </div>
  </div>
</section>
<section class="section section-ivory" aria-labelledby="opening-title">
  <div class="container">
    <div class="section-intro">
      <h2 id="opening-title">${esc(t.about.openingTitle)}</h2>
    </div>
    <figure class="wide-figure">
      ${picture(photo(site, 'opening-day'), { sizes: '100vw', className: 'framed' })}
      <figcaption>${esc(t.about.openingCaption)}</figcaption>
    </figure>
    <figure class="wide-figure">
      ${picture(photo(site, 'reception'), { sizes: '100vw', className: 'framed' })}
      <figcaption>${esc(t.about.receptionCaption)}</figcaption>
    </figure>
  </div>
</section>
${contactPanel(site, { tone: 'plain' })}`;
  return layout(site, { title: about.title, path: '/about', description: about.metaDescription, body });
}

/* -------------------------------------------------------------- Services */

export function servicesPage(site) {
  const { servicesIndex, t, u } = site;
  const body = `
${pageHead(site, { title: servicesIndex.title, lead: servicesIndex.intro, crumbs: [home(site), { label: t.services.crumb }] })}
<section class="section section-tight">
  <div class="container">
    <nav class="treatment-index" aria-labelledby="index-title">
      <h2 id="index-title" class="small-heading">${esc(t.services.index)}</h2>
      <ul class="index-columns" role="list">
        ${site.categories.map((c) => `<li>
          <a class="index-category" href="${c.path}">${esc(c.title)}</a>
          <ul>${c.services.map((s) => `<li><a href="${s.path}">${esc(s.name)}</a></li>`).join('')}</ul>
        </li>`).join('')}
      </ul>
    </nav>
  </div>
</section>
<section class="section section-ivory" aria-labelledby="categories-title">
  <div class="container">
    <h2 id="categories-title" class="visually-hidden">${esc(t.services.categories)}</h2>
    <ul class="card-grid service-cards" role="list">
      ${site.categories.map((c, i) => `
      <li class="card service-card">
        <span class="card-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="card-title"><a href="${c.path}">${esc(c.title)}</a></h3>
        <p>${esc(c.card)}</p>
        <p class="card-services">${c.services.map((s) => esc(s.name)).join(' · ')}</p>
        <span class="card-more" aria-hidden="true">${esc(t.common.explore)}${arrow()}</span>
      </li>`).join('')}
    </ul>
  </div>
</section>
<section class="section cta-band">
  <div class="container narrow center">
    <h2>${esc(t.services.notSure)}</h2>
    <p>${esc(t.services.notSureBody)}</p>
    <div class="btn-row center">
      <a class="btn btn-primary" href="${u('/appointments')}">${esc(t.common.requestAppointment)}</a>
      <button class="btn btn-secondary" type="button" data-ai-open data-ai-prompt="${esc(t.services.aiPrompt)}">${esc(t.common.askAI)}</button>
    </div>
  </div>
</section>`;
  return layout(site, { title: t.services.pageTitle, path: '/services', description: servicesIndex.metaDescription, body });
}

export function categoryPage(site, category) {
  const { t, u } = site;
  const others = site.categories.filter((c) => c.slug !== category.slug);
  const relatedArticles = site.articles.filter((a) => a.explore.some((e) => e.href === category.path) || category.nextSteps.some((n) => n.href === a.path));
  const body = `
${pageHead(site, { title: category.title, crumbs: [home(site), { label: t.services.crumb, href: '/services' }, { label: category.title }] })}
<div class="container treatment-layout">
  <aside class="treatment-aside">
    <nav class="on-this-page" aria-labelledby="otp-title">
      <h2 id="otp-title" class="small-heading">${esc(t.category.onThisPage)}</h2>
      <ul>${category.services.map((s) => `<li><a href="#${s.slug}">${esc(s.name)}</a></li>`).join('')}</ul>
    </nav>
    <div class="aside-cta">
      <a class="btn btn-primary btn-block" href="${u('/appointments')}">${esc(t.common.requestAppointment)}</a>
      <a class="text-link" href="${site.clinic.phone.href}">${icon('phone')} ${esc(site.clinic.phone.label)}</a>
    </div>
  </aside>
  <div class="treatment-main">
    <section class="treatment-intro" aria-labelledby="intro-title">
      <h2 id="intro-title">${esc(category.introHeading)}</h2>
      <p class="lead">${esc(category.intro)}</p>
    </section>
    ${category.services.map((s) => {
      const visit = visitTypeForService(s.slug);
      const enName = site.clinic.serviceGroups.flatMap((g) => g.services).find((x) => x.slug === s.slug)?.name ?? s.name;
      const query = visit === 'other-visit' ? `?visit=other-visit&service=${encodeURIComponent(enName)}` : `?visit=${visit}`;
      return `<section class="treatment" id="${s.slug}" aria-labelledby="${s.slug}-title">
      <h2 id="${s.slug}-title">${esc(s.name)}</h2>
      <p>${esc(s.body)}</p>
      <p class="treatment-actions">
        <a class="text-link" href="${u('/appointments')}${query}#booking">${esc(t.category.askAbout(s.name))}${arrow()}</a>
        <button class="link-button" type="button" data-ai-open data-ai-prompt="${esc(t.category.aiPrompt(s.name))}">${esc(t.common.askAI)}</button>
      </p>
    </section>`;
    }).join('')}
    <section class="next-step" aria-labelledby="next-title">
      <h2 id="next-title" class="small-heading">${esc(t.category.nextStep)}</h2>
      <div class="btn-row">
        ${category.nextSteps.map((n, i) => `<a class="btn ${i === 0 ? 'btn-primary' : 'btn-secondary'}" href="${n.href}">${esc(n.label)}</a>`).join('')}
      </div>
    </section>
  </div>
</div>
<section class="section section-ivory" aria-labelledby="related-title">
  <div class="container">
    <h2 id="related-title" class="section-subtitle">${esc(t.category.related)}</h2>
    <ul class="related-links" role="list">
      ${others.map((c) => `<li><a href="${c.path}">${esc(c.title)}${arrow()}</a></li>`).join('')}
    </ul>
    ${relatedArticles.length ? `<h2 class="section-subtitle">${esc(t.category.fromBlog)}</h2>${articleCards(site, relatedArticles)}` : ''}
  </div>
</section>`;
  return layout(site, { title: category.title, path: `/services/${category.slug}`, description: category.metaDescription, body });
}

/* ----------------------------------------------------------- First visit */

export function firstVisitPage(site) {
  const { pages: { firstVisit }, t, u } = site;
  const guide = site.articles.find((a) => a.slug === 'getting-ready-for-your-first-dental-visit');
  const consult = site.categories.find((c) => c.slug === 'consultations-diagnostics');
  const body = `
${pageHead(site, { title: firstVisit.title, crumbs: [home(site), { label: t.firstVisit.crumb }] })}
<section class="section section-tight">
  <div class="container narrow">
    <ol class="steps steps-large" role="list">
      ${firstVisit.steps.map((s, i) => `<li><span class="step-num" aria-hidden="true">${i + 1}</span><div><h2>${esc(s.title)}</h2><p>${esc(s.body)}</p></div></li>`).join('')}
    </ol>
    <div class="btn-row">
      <a class="btn btn-primary" href="${u('/appointments')}">${esc(t.common.requestAppointment)}</a>
      <a class="btn btn-secondary" href="${site.clinic.phone.href}">${icon('phone')} ${esc(t.common.call)} ${esc(site.clinic.phone.label)}</a>
    </div>
  </div>
</section>
<section class="section section-ivory" aria-labelledby="fv-more">
  <div class="container narrow">
    <h2 id="fv-more" class="section-subtitle">${esc(t.firstVisit.more)}</h2>
    <ul class="related-links" role="list">
      <li><a href="${guide.path}">${esc(guide.title)}${arrow()}</a></li>
      <li><a href="${consult.path}">${esc(consult.title)}${arrow()}</a></li>
      <li><a href="${u('/contact')}">${esc(t.nav.contact)}${arrow()}</a></li>
    </ul>
  </div>
</section>`;
  return layout(site, { title: t.firstVisit.pageTitle, path: '/first-visit', description: firstVisit.metaDescription, body });
}

/* --------------------------------------------------------------- Gallery */

function videoItem(site, v, { headingLevel = 3, extra = '' } = {}) {
  const { t } = site;
  const portrait = v.width && v.height && v.height > v.width;
  const size = v.width && v.height ? ` width="${v.width}" height="${v.height}"` : '';
  const title = v.id === 'route-to-confident' ? t.hero.videoTitle : v.title;
  const description = v.id === 'route-to-confident' ? t.gallery.routeDescription : v.description;
  return `<figure class="video-item${portrait ? ' video-portrait' : ''}">
    <div class="video-frame">
      <video controls preload="metadata" playsinline poster="${esc(v.poster)}"${size} aria-label="${esc(title)}">
        <source src="${esc(v.src)}" type="${esc(v.type || 'video/mp4')}">
        ${v.captions ? `<track kind="captions" src="${esc(v.captions)}" srclang="en" label="English" default>` : ''}
      </video>
    </div>
    <figcaption>
      <h${headingLevel} class="video-title">${esc(title)}${v.runtime ? ` <span class="muted">(${esc(v.runtime)})</span>` : ''}</h${headingLevel}>
      ${description ? `<p>${esc(description)}</p>` : ''}
      ${v.transcript ? `<details class="transcript"><summary>${esc(t.gallery.transcript)}</summary><p>${esc(v.transcript)}</p></details>` : ''}
      ${extra}
    </figcaption>
  </figure>`;
}

function publishedVideos(site) {
  return site.siteConfig.media.galleryVideos.filter((v) => v.src);
}

export function galleryPage(site) {
  const { pages: { gallery }, t } = site;
  const videos = publishedVideos(site);
  const sizes = '(min-width: 1000px) 33vw, (min-width: 640px) 50vw, 100vw';
  const body = `
${pageHead(site, { title: gallery.title, lead: gallery.intro, crumbs: [home(site), { label: t.gallery.crumb }] })}
<section class="section section-tight" aria-labelledby="photos-title">
  <div class="container">
    <h2 id="photos-title" class="visually-hidden">${esc(t.gallery.photos)}</h2>
    <ul class="gallery-grid" role="list" data-gallery>
      ${gallery.photos.map((p, i) => `<li class="gallery-item" id="${p.id}">
        <figure>
          <button class="gallery-open" type="button" data-index="${i}" aria-haspopup="dialog">
            ${p.single ? singlePicture(p, { sizes, className: 'framed' }) : picture(p, { sizes, className: 'framed', landscapeOnly: true })}
            <span class="gallery-zoom">${icon('expand')}<span class="visually-hidden">${esc(t.gallery.viewLarger(p.title))}</span></span>
          </button>
          <figcaption>${esc(p.title)}</figcaption>
        </figure>
      </li>`).join('')}
    </ul>
  </div>
</section>
<section class="section section-ivory" id="videos" aria-labelledby="videos-title" tabindex="-1">
  <div class="container">
    <div class="section-intro">
      <h2 id="videos-title">${esc(gallery.videosTitle)}</h2>
    </div>
    ${videos.length ? `<div class="video-grid">${videos.map((v) => videoItem(site, v)).join('')}</div>
    <p class="video-more"><a class="text-link" href="${esc(site.clinic.socialLinks.instagram)}" rel="noopener">${esc(gallery.instagramCta)}${arrow()}</a></p>` : `
    <div class="video-placeholder">
      <a class="video-placeholder-media" href="${esc(site.clinic.socialLinks.instagram)}" rel="noopener">
        ${picture(photo(site, 'reception'), { sizes: '(min-width: 900px) 60vw, 100vw', className: 'framed', landscapeOnly: true })}
        <span class="video-badge">${icon('instagram')} Instagram</span>
      </a>
      <div>
        <h3>${esc(t.gallery.lookAround)}</h3>
        <p>${esc(gallery.videosPlaceholder)}</p>
        <a class="btn btn-secondary" href="${esc(site.clinic.socialLinks.instagram)}" rel="noopener">${icon('instagram')} ${esc(gallery.instagramCta)}</a>
      </div>
    </div>`}
  </div>
</section>
<dialog class="lightbox" aria-label="${esc(t.gallery.viewer)}" data-lightbox>
  <div class="lightbox-inner">
    <button class="icon-btn lightbox-close" type="button" data-lightbox-close>${icon('close')}<span class="visually-hidden">${esc(t.gallery.closeViewer)}</span></button>
    <figure class="lightbox-figure"><div class="lightbox-image"></div><figcaption class="lightbox-caption"></figcaption></figure>
    <button class="icon-btn lightbox-prev" type="button" data-lightbox-prev>${icon('prev')}<span class="visually-hidden">${esc(t.gallery.prevPhoto)}</span></button>
    <button class="icon-btn lightbox-next" type="button" data-lightbox-next>${icon('next')}<span class="visually-hidden">${esc(t.gallery.nextPhoto)}</span></button>
  </div>
</dialog>`;
  return layout(site, { title: t.gallery.pageTitle, path: '/gallery', description: gallery.metaDescription, body });
}

/* ------------------------------------------------------------------ Blog */

export function blogPage(site) {
  const { t } = site;
  const body = `
${pageHead(site, { title: site.blogIndex.title, lead: site.blogIndex.intro, crumbs: [home(site), { label: t.blog.crumb }] })}
<section class="section section-tight">
  <div class="container">
    ${articleCards(site, site.articles, 2)}
  </div>
</section>`;
  return layout(site, { title: t.blog.pageTitle, path: '/blog', description: site.blogIndex.metaDescription, body });
}

export function articlePage(site, article) {
  const { t } = site;
  const others = site.articles.filter((a) => a.slug !== article.slug);
  const body = `
${pageHead(site, { title: article.title, lead: article.excerpt, crumbs: [home(site), { label: t.blog.crumb, href: '/blog' }, { label: article.title }] })}
<article class="section section-tight">
  <div class="container narrow prose">
    ${site.siteConfig.preview ? `<p class="draft-note">${esc(t.blog.draft)}</p>` : ''}
    ${article.sections.map(([h, p]) => `<h2>${esc(h)}</h2><p>${esc(p)}</p>`).join('')}
    <aside class="explore" aria-labelledby="explore-title">
      <h2 id="explore-title" class="small-heading">${esc(t.blog.explore)}</h2>
      <ul class="related-links" role="list">${article.explore.map((e) => `<li><a href="${e.href}">${esc(e.label)}${arrow()}</a></li>`).join('')}</ul>
    </aside>
  </div>
</article>
<section class="section section-ivory" aria-labelledby="more-title">
  <div class="container">
    <h2 id="more-title" class="section-subtitle">${esc(t.blog.more)}</h2>
    ${articleCards(site, others)}
  </div>
</section>`;
  return layout(site, { title: article.title, path: `/blog/${article.slug}`, description: article.excerpt, body });
}

/* --------------------------------------------------------------- Contact */

export function contactPage(site) {
  const { pages: { contact }, clinic, t, u } = site;
  const body = `
${pageHead(site, { title: contact.title, crumbs: [home(site), { label: t.contact.crumb }] })}
<section class="section section-tight">
  <div class="container contact-grid">
    <div class="contact-card">
      <h2 class="small-heading">${esc(t.contact.address)}</h2>
      <p class="address">${icon('pin')}<span><strong>ConfiDent Oral Care</strong><br>${esc(clinic.address)}</span></p>
      <a class="btn btn-secondary" href="${esc(site.directionsUrl)}" rel="noopener">${esc(t.common.getDirections)}</a>
    </div>
    <div class="contact-card">
      <h2 class="small-heading">${esc(t.contact.reach)}</h2>
      <p><strong>${esc(t.contact.callLabel)}</strong> <a href="${clinic.phone.href}">${esc(clinic.phone.label)}</a></p>
      <p><strong>${esc(t.contact.whatsappLabel)}</strong> <a href="${esc(clinic.whatsapp.href)}" rel="noopener">${esc(clinic.whatsapp.label)}</a></p>
      <p><strong>${esc(t.contact.emailLabel)}</strong> <a href="${clinic.email.href}">${esc(clinic.email.label)}</a></p>
      <p>${esc(contact.arrange)}</p>
    </div>
    <div class="contact-card">
      <h2 class="small-heading">${esc(t.contact.hours)}</h2>
      <table class="hours-table">
        <caption class="visually-hidden">${esc(t.contact.hours)}</caption>
        <thead><tr><th scope="col">${esc(t.contact.days)}</th><th scope="col">${esc(t.contact.time)}</th></tr></thead>
        <tbody>${site.hours.map((h) => `<tr><th scope="row">${esc(h.days)}</th><td>${esc(h.time)}</td></tr>`).join('')}</tbody>
      </table>
      <p class="muted small">${esc(contact.hoursNote)}</p>
    </div>
    <div class="contact-card">
      <h2 class="small-heading">${esc(t.contact.follow)}</h2>
      <ul class="social-list">
        <li><a href="${esc(clinic.whatsapp.href)}" rel="noopener">${icon('whatsapp')} WhatsApp</a></li>
        <li><a href="${esc(clinic.socialLinks.instagram)}" rel="noopener">${icon('instagram')} Instagram</a></li>
        <li><a href="${esc(clinic.socialLinks.facebook)}" rel="noopener">${icon('facebook')} Facebook</a></li>
      </ul>
    </div>
  </div>
</section>
${routeSection(site)}
<section class="section cta-band">
  <div class="container narrow center">
    <h2>${esc(t.contact.ready)}</h2>
    <div class="btn-row center">
      <a class="btn btn-primary" href="${u('/appointments')}">${esc(t.common.requestAppointment)}</a>
      <a class="btn btn-secondary" href="${esc(clinic.whatsapp.href)}" rel="noopener">${icon('whatsapp')} ${esc(t.common.messageWhatsApp)}</a>
    </div>
  </div>
</section>`;
  return layout(site, { title: t.contact.pageTitle, path: '/contact', description: contact.metaDescription, body, jsonLd: dentistJsonLd(site) });
}

function routeSection(site) {
  const { t } = site;
  const route = publishedVideos(site).find((v) => v.id === 'route-to-confident');
  if (!route) return '';
  return `<section class="section section-ivory" id="find-your-way" aria-labelledby="route-title">
  <div class="container">
    <div class="section-intro">
      <h2 id="route-title">${esc(t.contact.routeTitle)}</h2>
    </div>
    ${videoItem(site, route, { extra: `<div class="btn-row"><a class="btn btn-primary" href="${esc(site.directionsUrl)}" rel="noopener">${esc(t.common.getDirections)}</a><a class="btn btn-secondary" href="${site.clinic.phone.href}">${esc(t.common.call)} ${esc(site.clinic.phone.label)}</a></div>` })}
  </div>
</section>`;
}

/* ---------------------------------------------------------- Appointments */

export function appointmentsPage(site) {
  const { pages: { appointments }, clinic, t } = site;
  const test = site.scheduling.mode === 'test';
  const body = `
${pageHead(site, { title: appointments.title, lead: appointments.intro, crumbs: [home(site), { label: t.appointments.crumb }] })}
<section class="section section-tight" aria-label="${esc(t.appointments.ways)}">
  <div class="container">
    <ul class="option-grid" role="list">
      <li class="option-card option-primary">
        ${icon('chat', 'icon icon-lg')}
        <h2>${esc(t.appointments.aiTitle)}</h2>
        <p>${esc(t.appointments.aiBody)}</p>
        <button class="btn btn-primary" type="button" data-ai-open data-ai-prompt="${esc(t.appointments.aiPrompt)}">${esc(t.common.askAI)}</button>
      </li>
      <li class="option-card">
        ${icon('phone', 'icon icon-lg')}
        <h2>${esc(t.appointments.callTitle)}</h2>
        <p>${esc(t.appointments.callBody)}</p>
        <a class="btn btn-secondary" href="${clinic.phone.href}">${esc(t.common.call)} ${esc(clinic.phone.label)}</a>
      </li>
      <li class="option-card">
        ${icon('whatsapp', 'icon icon-lg')}
        <h2>${esc(t.appointments.waTitle)}</h2>
        <p>${esc(t.appointments.waBody)}</p>
        <a class="btn btn-secondary" href="${esc(clinic.whatsapp.href)}" rel="noopener">${icon('whatsapp')} ${esc(clinic.whatsapp.label)}</a>
      </li>
    </ul>
  </div>
</section>
<section class="section section-ivory" id="booking" aria-labelledby="booking-title" tabindex="-1">
  <div class="container narrow">
    <h2 id="booking-title">${esc(t.appointments.bookingTitle)}</h2>
    <div class="booking" data-booking data-test="${test}">
      <noscript><p>${esc(t.appointments.noscript)} <a href="${clinic.phone.href}">${esc(clinic.phone.label)}</a> · <a href="${esc(clinic.whatsapp.href)}">WhatsApp</a></p></noscript>
    </div>
  </div>
</section>
${contactPanel(site, { tone: 'plain' })}`;
  return layout(site, { title: appointments.title, path: '/appointments', description: appointments.metaDescription, body });
}

/* ------------------------------------------------------- Preview calendar */

export function testCalendarPage(site, { events, staffRequests, scheduling, formatEvent }) {
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
  const body = `
${pageHead(site, { title: 'Test calendar', lead: 'Events saved by the test booking flow, shown in Belize time. This calendar is isolated from the practice’s live operations.' })}
<section class="section section-tight">
  <div class="container">
    <p class="test-banner" role="note"><strong>Test data.</strong> Adapter: ${esc(scheduling.adapter.name)} · Time zone: ${esc(scheduling.timeZone)}. Recurring test busy block: ${esc(site.scheduling.testBusyBlocks.map((b) => `${b.weekday} ${b.start}–${b.end}`).join(', '))}.</p>
    <h2 class="section-subtitle">Saved events (${sorted.length})</h2>
    ${sorted.length ? `<div class="table-wrap"><table class="data-table">
      <thead><tr><th scope="col">Date (Belize)</th><th scope="col">Time (Belize)</th><th scope="col">Booking reference</th><th scope="col">Visit type</th><th scope="col">Event title</th><th scope="col">Event ID</th><th scope="col">Saved (UTC)</th></tr></thead>
      <tbody>${sorted.map((e) => { const f = formatEvent(e); return `<tr><td>${esc(f.dateLabel)}</td><td>${esc(f.timeLabel)}–${esc(f.endLabel)}</td><td><strong>${esc(e.bookingRef)}</strong></td><td>${esc(e.visitTypeId)}</td><td>${esc(e.title)}</td><td><code>${esc(e.id)}</code></td><td>${esc(e.createdAt)}</td></tr>`; }).join('')}</tbody>
    </table></div>` : '<p>No test events yet.</p>'}
    <h2 class="section-subtitle">Staff review requests (${staffRequests.length})</h2>
    ${staffRequests.length ? `<div class="table-wrap"><table class="data-table">
      <thead><tr><th scope="col">Request reference</th><th scope="col">Visit type</th><th scope="col">Status</th><th scope="col">Received (UTC)</th></tr></thead>
      <tbody>${staffRequests.map((r) => `<tr><td><strong>${esc(r.requestRef)}</strong></td><td>${esc(r.visitTypeId)}${r.contact?.service ? ` (${esc(r.contact.service)})` : ''}</td><td>${esc(r.status)}</td><td>${esc(r.createdAt)}</td></tr>`).join('')}</tbody>
    </table></div>` : '<p>No staff review requests yet.</p>'}
    <p class="muted small">Patient contact details are kept in the scheduling backend’s records and are not shown here.</p>
  </div>
</section>`;
  return layout(site, { title: 'Test calendar', path: '/preview/test-calendar', description: 'Preview test calendar.', body });
}

export function notFoundPage(site) {
  const { t, u } = site;
  const body = `
${pageHead(site, { title: t.notFound.title, lead: t.notFound.lead })}
<section class="section section-tight"><div class="container narrow">
  <ul class="related-links" role="list">
    <li><a href="${u('/')}">${esc(t.nav.home)}${arrow()}</a></li>
    <li><a href="${u('/services')}">${esc(t.nav.services)}${arrow()}</a></li>
    <li><a href="${u('/appointments')}">${esc(t.common.requestAppointment)}${arrow()}</a></li>
    <li><a href="${u('/contact')}">${esc(t.nav.contact)}${arrow()}</a></li>
  </ul>
</div></section>`;
  return layout(site, { title: t.notFound.pageTitle, path: '/404', description: t.notFound.pageTitle, body });
}
