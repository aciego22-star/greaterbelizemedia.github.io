import { visitTypeForService } from '../site.mjs';
import { layout } from './layout.mjs';
import { esc, icon, picture, singlePicture } from './util.mjs';

const photo = (site, id) => site.pages.gallery.photos.find((p) => p.id === id);

function link(href, label, cls = 'text-link') {
  return `<a class="${cls}" href="${esc(href)}">${esc(label)}${icon('arrow', 'icon icon-arrow')}</a>`;
}

function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items.map((item, i) => (
    i === items.length - 1
      ? `<li><span aria-current="page">${esc(item.label)}</span></li>`
      : `<li><a href="${item.href}">${esc(item.label)}</a></li>`
  )).join('')}</ol></nav>`;
}

function pageHead({ title, lead, crumbs }) {
  return `<section class="page-head">
  <div class="container">
    ${crumbs ? breadcrumbs(crumbs) : ''}
    <h1>${esc(title)}</h1>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
  </div>
</section>`;
}

function contactPanel(site, { heading = 'Visit us at The Boardwalk', tone = 'ivory' } = {}) {
  const { clinic } = site;
  return `<section class="section section-${tone} contact-band" aria-labelledby="visit-heading">
  <div class="container contact-band-grid">
    <div>
      <h2 id="visit-heading">${esc(heading)}</h2>
      <p class="address">${icon('pin')}<span><strong>ConfiDent Oral Care</strong><br>${esc(clinic.address)}</span></p>
      <p><a class="text-link" href="${esc(site.directionsUrl)}" rel="noopener">Get directions${icon('arrow', 'icon icon-arrow')}</a></p>
    </div>
    <div>
      <h3 class="small-heading">Arrange a visit</h3>
      <ul class="channel-list">
        <li><a href="/appointments">${icon('calendar')} Request an appointment online</a></li>
        <li><a href="${clinic.phone.href}">${icon('phone')} Call ${esc(clinic.phone.label)}</a></li>
        <li><a href="${esc(clinic.socialLinks.instagram)}" rel="noopener">${icon('instagram')} Message us on Instagram</a></li>
        <li><a href="${clinic.email.href}">${icon('mail')} ${esc(clinic.email.label)}</a> <span class="muted small">General enquiries</span></li>
      </ul>
    </div>
    <div>
      <h3 class="small-heading">Posted hours</h3>
      <dl class="hours-list">${site.hours.map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join('')}</dl>
      <p class="muted small">${esc(site.pages.contact.hoursNote)}</p>
    </div>
  </div>
</section>`;
}

function articleCards(site, list = site.articles, headingLevel = 3) {
  return `<ul class="card-grid card-grid-3" role="list">${list.map((a) => `
    <li class="card article-card">
      <h${headingLevel} class="card-title"><a href="/blog/${a.slug}">${esc(a.title)}</a></h${headingLevel}>
      <p>${esc(a.excerpt)}</p>
      <span class="card-more" aria-hidden="true">Read the guide${icon('arrow', 'icon icon-arrow')}</span>
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
    employee: { '@type': 'Person', name: clinic.clinician.name, jobTitle: clinic.clinician.designation },
  };
}

/* ------------------------------------------------------------------ Home */

/** Immersive hero slideshow: the photos, then the video (config: site.json media.heroSlides / heroVideo). */
function heroSlides(site) {
  const { heroSlides: cfg, heroVideo: video } = site.siteConfig.media;
  const alts = {
    reception: 'Reception at ConfiDent Oral Care, with gold ConfiDent signage reading Where confidence begins',
    'opening-day': 'Dr. Brittni Haylock outside ConfiDent Oral Care on opening day, beside white and gold balloons and the Where confidence begins sign',
  };
  const slides = cfg.photos.map((id, i) => {
    const p = photo(site, id);
    return { label: p.title, html: picture(p, { alt: alts[id] ?? p.alt, className: 'hero-picture', priority: i === 0, loading: 'eager', breakpoint: 760 }) };
  });
  if (video?.mp4) {
    slides.push({
      label: video.title,
      video: true,
      html: `${video.backdrop ? `<img class="hero-video-backdrop" src="${esc(video.backdrop)}" alt="" aria-hidden="true">` : ''}
      <video class="hero-video" playsinline preload="none" poster="${esc(video.poster)}"${video.width ? ` width="${video.width}" height="${video.height}"` : ''} aria-label="${esc(video.title)}">
        ${video.webm ? `<source src="${esc(video.webm)}" type="video/webm">` : ''}
        <source src="${esc(video.mp4)}" type="video/mp4">
      </video>`,
    });
  }
  const total = slides.length;
  return {
    slides: slides.map((sl, i) => `<div class="hero-slide${i === 0 ? ' is-active' : ''}${sl.video ? ' hero-slide-video' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${total}: ${esc(sl.label)}"${i === 0 ? '' : ' aria-hidden="true"'}>
      ${sl.html}
    </div>`).join('\n    '),
    controls: `<div class="hero-controls" role="group" aria-label="Slideshow controls">
      <button class="hero-ctl hero-prev" type="button" data-hero-prev>${icon('prev')}<span class="visually-hidden">Previous slide</span></button>
      <div class="hero-dots">${slides.map((sl, i) => `<button class="hero-dot" type="button" data-hero-dot="${i}"${i === 0 ? ' aria-current="true"' : ''}><span class="visually-hidden">Show slide ${i + 1}: ${esc(sl.label)}</span></button>`).join('')}</div>
      <button class="hero-ctl hero-next" type="button" data-hero-next>${icon('next')}<span class="visually-hidden">Next slide</span></button>
      <button class="hero-ctl" type="button" data-hero-pause>
        <span class="when-running">${icon('pause')}<span class="visually-hidden">Pause slideshow</span></span>
        <span class="when-paused">${icon('play')}<span class="visually-hidden">Play slideshow</span></span>
      </button>
      ${video?.mp4 ? `<button class="hero-ctl hero-sound" type="button" data-hero-sound hidden>
        <span class="when-muted">${icon('mute')}<span class="hero-sound-hint">Tap for sound</span><span class="visually-hidden">Turn sound on</span></span>
        <span class="when-sound">${icon('volume')}<span class="visually-hidden">Mute</span></span>
      </button>` : ''}
    </div>`,
    interval: cfg.intervalSeconds ?? 6,
  };
}

export function homePage(site) {
  const { home, firstVisit } = site.pages;
  const { clinic } = site;
  const hero = heroSlides(site);
  const body = `
<section class="hero hero-slides" aria-labelledby="hero-title" aria-roledescription="carousel" data-hero data-interval="${hero.interval}">
  <div class="hero-track">
    ${hero.slides}
  </div>
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="hero-copy">
    <h1 id="hero-title">${esc(home.hero.title)}</h1>
    <p class="hero-location">${esc(home.hero.location)}</p>
    <div class="btn-row">
      <a class="btn btn-primary" href="/appointments">Request an appointment</a>
      <a class="btn btn-secondary" href="/services"><span class="label-long">Explore our services</span><span class="label-short" aria-hidden="true">Our services</span></a>
    </div>
  </div>
  ${hero.controls}
</section>

<section class="hero-intro" aria-label="Welcome">
  <div class="container narrow">
    <p>${esc(home.hero.body)}</p>
  </div>
</section>

<section class="section meet" aria-labelledby="meet-title">
  <div class="container split split-media-left">
    <div class="split-media">
      ${picture(photo(site, 'opening-day'), {
        alt: 'Dr. Brittni Haylock outside ConfiDent Oral Care on opening day, beside white and gold balloons and the Where confidence begins sign',
        sizes: '(min-width: 900px) 50vw, 100vw', portraitSizes: '100vw', className: 'framed portrait-frame', portraitOnly: true,
      })}
    </div>
    <div class="split-copy">
      <h2 id="meet-title">${esc(home.meet.title)}</h2>
      <p class="designation">${esc(clinic.clinician.designation)}</p>
      <hr class="rule">
      <p>${esc(home.meet.body)}</p>
      ${link('/about', home.meet.cta)}
    </div>
  </div>
</section>

<section class="section section-ivory" aria-labelledby="services-title">
  <div class="container">
    <div class="section-intro">
      <h2 id="services-title">${esc(home.services.title)}</h2>
      <p>${esc(home.services.body)}</p>
    </div>
    <ul class="card-grid service-cards" role="list">
      ${site.categories.map((c, i) => `
      <li class="card service-card">
        <span class="card-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="card-title"><a href="${c.path}">${esc(c.title)}</a></h3>
        <p>${esc(c.card)}</p>
        <span class="card-more" aria-hidden="true">Explore${icon('arrow', 'icon icon-arrow')}</span>
      </li>`).join('')}
    </ul>
    <p class="center">${link('/services', 'Explore our services', 'btn btn-secondary')}</p>
  </div>
</section>

<section class="section first-visit-band" aria-labelledby="first-title">
  <div class="container split">
    <div class="split-copy">
      <h2 id="first-title">Start with what you’d like to talk about</h2>
      <p>${esc(home.firstVisit.body)}</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="/appointments">Request an appointment</a>
        ${link('/first-visit', home.firstVisit.cta)}
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
      <h2 id="inside-title">${esc(home.inside.title)}</h2>
      <p>${esc(home.inside.body)}</p>
    </div>
    <div class="gallery-preview">
      ${site.pages.gallery.photos.filter((p) => !p.single).slice(0, 2).map((p) => `<a class="gallery-preview-item" href="/gallery#${p.id}">
        ${picture(p, { sizes: '(min-width: 900px) 50vw, 100vw', className: 'framed', landscapeOnly: true })}
        <span class="caption">${esc(p.title)}</span>
      </a>`).join('')}
    </div>
    <div class="btn-row center">
      ${link('/gallery', home.inside.cta, 'btn btn-secondary')}
      ${link('/gallery#videos', 'Watch our videos')}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="blog-title">
  <div class="container">
    <div class="section-intro">
      <h2 id="blog-title">${esc(home.blog.title)}</h2>
      <p>${esc(home.blog.body)}</p>
    </div>
    ${articleCards(site)}
    <p class="center">${link('/blog', home.blog.cta)}</p>
  </div>
</section>

${contactPanel(site)}`;
  return layout(site, {
    title: 'Home', path: '/', description: home.metaDescription, body, jsonLd: dentistJsonLd(site), bodyClass: 'page-home',
  });
}

/* ----------------------------------------------------------------- About */

export function aboutPage(site) {
  const { about } = site.pages;
  const body = `
${pageHead({ title: about.title, crumbs: [{ label: 'Home', href: '/' }, { label: 'About' }] })}
<section class="section section-tight">
  <div class="container split split-media-left">
    <div class="split-media">
      ${picture(photo(site, 'opening-day'), {
        alt: 'Dr. Brittni Haylock on opening day outside ConfiDent Oral Care at The Boardwalk Belize',
        sizes: '(min-width: 900px) 50vw, 100vw', className: 'framed portrait-frame', portraitOnly: true, priority: true,
      })}
    </div>
    <div class="split-copy">
      <p class="designation large">${esc(site.clinic.clinician.name)}<br><span>${esc(site.clinic.clinician.designation)}</span></p>
      <hr class="rule">
      ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
      <div class="btn-row">
        <a class="btn btn-primary" href="/appointments">Request an appointment</a>
        <a class="btn btn-secondary" href="/services">Explore our services</a>
      </div>
    </div>
  </div>
</section>
<section class="section section-ivory" aria-labelledby="opening-title">
  <div class="container">
    <div class="section-intro">
      <h2 id="opening-title">Opening day at The Boardwalk</h2>
    </div>
    <figure class="wide-figure">
      ${picture(photo(site, 'opening-day'), { sizes: '100vw', className: 'framed' })}
      <figcaption>Opening day outside ConfiDent Oral Care, The Boardwalk Belize.</figcaption>
    </figure>
    <figure class="wide-figure">
      ${picture(photo(site, 'reception'), { sizes: '100vw', className: 'framed' })}
      <figcaption>Our reception.</figcaption>
    </figure>
  </div>
</section>
${contactPanel(site, { tone: 'plain' })}`;
  return layout(site, { title: 'Meet Dr. Brittni Haylock', path: '/about', description: about.metaDescription, body });
}

/* -------------------------------------------------------------- Services */

export function servicesPage(site) {
  const { servicesIndex } = site;
  const body = `
${pageHead({ title: servicesIndex.title, lead: servicesIndex.intro, crumbs: [{ label: 'Home', href: '/' }, { label: 'Services' }] })}
<section class="section section-tight">
  <div class="container">
    <nav class="treatment-index" aria-labelledby="index-title">
      <h2 id="index-title" class="small-heading">Treatment index</h2>
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
    <h2 id="categories-title" class="visually-hidden">Treatment categories</h2>
    <ul class="card-grid service-cards" role="list">
      ${site.categories.map((c, i) => `
      <li class="card service-card">
        <span class="card-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="card-title"><a href="${c.path}">${esc(c.title)}</a></h3>
        <p>${esc(c.card)}</p>
        <p class="card-services">${c.services.map((s) => esc(s.name)).join(' · ')}</p>
        <span class="card-more" aria-hidden="true">Explore${icon('arrow', 'icon icon-arrow')}</span>
      </li>`).join('')}
    </ul>
  </div>
</section>
<section class="section cta-band">
  <div class="container narrow center">
    <h2>Not sure where to start?</h2>
    <p>A consultation gives you a place to ask. You can also ask confident AI to help you find the right page or visit type.</p>
    <div class="btn-row center">
      <a class="btn btn-primary" href="/appointments">Request an appointment</a>
      <button class="btn btn-secondary" type="button" data-ai-open data-ai-prompt="Can you help me find the right service?">Ask confident AI</button>
    </div>
  </div>
</section>`;
  return layout(site, { title: 'Dental services', path: '/services', description: servicesIndex.metaDescription, body });
}

export function categoryPage(site, category) {
  const others = site.categories.filter((c) => c.slug !== category.slug);
  const relatedArticles = site.articles.filter((a) => a.explore.some((e) => e.href === category.path) || category.nextSteps.some((n) => n.href === `/blog/${a.slug}`));
  const body = `
${pageHead({
    title: category.title,
    crumbs: [{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: category.title }],
  })}
<div class="container treatment-layout">
  <aside class="treatment-aside">
    <nav class="on-this-page" aria-labelledby="otp-title">
      <h2 id="otp-title" class="small-heading">On this page</h2>
      <ul>${category.services.map((s) => `<li><a href="#${s.slug}">${esc(s.name)}</a></li>`).join('')}</ul>
    </nav>
    <div class="aside-cta">
      <a class="btn btn-primary btn-block" href="/appointments">Request an appointment</a>
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
      const query = visit === 'other-visit' ? `?visit=other-visit&service=${encodeURIComponent(s.name)}` : `?visit=${visit}`;
      return `<section class="treatment" id="${s.slug}" aria-labelledby="${s.slug}-title">
      <h2 id="${s.slug}-title">${esc(s.name)}</h2>
      <p>${esc(s.body)}</p>
      <p class="treatment-actions">
        <a class="text-link" href="/appointments${query}#booking">Ask about ${esc(s.name.toLowerCase())}${icon('arrow', 'icon icon-arrow')}</a>
        <button class="link-button" type="button" data-ai-open data-ai-prompt="${esc(`I have a question about ${s.name.toLowerCase()}.`)}">Ask confident AI</button>
      </p>
    </section>`;
    }).join('')}
    <section class="next-step" aria-labelledby="next-title">
      <h2 id="next-title" class="small-heading">Next step</h2>
      <div class="btn-row">
        ${category.nextSteps.map((n, i) => `<a class="btn ${i === 0 ? 'btn-primary' : 'btn-secondary'}" href="${n.href}">${esc(n.label)}</a>`).join('')}
      </div>
    </section>
  </div>
</div>
<section class="section section-ivory" aria-labelledby="related-title">
  <div class="container">
    <h2 id="related-title" class="section-subtitle">Related services</h2>
    <ul class="related-links" role="list">
      ${others.map((c) => `<li><a href="${c.path}">${esc(c.title)}${icon('arrow', 'icon icon-arrow')}</a></li>`).join('')}
    </ul>
    ${relatedArticles.length ? `<h2 class="section-subtitle">From the dental blog</h2>${articleCards(site, relatedArticles)}` : ''}
  </div>
</section>`;
  return layout(site, { title: category.title, path: category.path, description: category.metaDescription, body });
}

/* ----------------------------------------------------------- First visit */

export function firstVisitPage(site) {
  const { firstVisit } = site.pages;
  const guide = site.articles.find((a) => a.slug === 'getting-ready-for-your-first-dental-visit');
  const body = `
${pageHead({ title: firstVisit.title, crumbs: [{ label: 'Home', href: '/' }, { label: 'Your First Visit' }] })}
<section class="section section-tight">
  <div class="container narrow">
    <ol class="steps steps-large" role="list">
      ${firstVisit.steps.map((s, i) => `<li><span class="step-num" aria-hidden="true">${i + 1}</span><div><h2>${esc(s.title)}</h2><p>${esc(s.body)}</p></div></li>`).join('')}
    </ol>
    <div class="btn-row">
      <a class="btn btn-primary" href="/appointments">Request an appointment</a>
      <a class="btn btn-secondary" href="${site.clinic.phone.href}">${icon('phone')} Call ${esc(site.clinic.phone.label)}</a>
    </div>
  </div>
</section>
<section class="section section-ivory" aria-labelledby="fv-more">
  <div class="container narrow">
    <h2 id="fv-more" class="section-subtitle">Helpful next reads</h2>
    <ul class="related-links" role="list">
      <li><a href="/blog/${guide.slug}">${esc(guide.title)}${icon('arrow', 'icon icon-arrow')}</a></li>
      <li><a href="/services/consultations-diagnostics">Consultations &amp; Diagnostics${icon('arrow', 'icon icon-arrow')}</a></li>
      <li><a href="/contact">Contact Us${icon('arrow', 'icon icon-arrow')}</a></li>
    </ul>
  </div>
</section>`;
  return layout(site, { title: 'Your first visit', path: '/first-visit', description: firstVisit.metaDescription, body });
}

/* --------------------------------------------------------------- Gallery */

function videoItem(v, { headingLevel = 3, extra = '' } = {}) {
  const portrait = v.width && v.height && v.height > v.width;
  const size = v.width && v.height ? ` width="${v.width}" height="${v.height}"` : '';
  return `<figure class="video-item${portrait ? ' video-portrait' : ''}">
    <div class="video-frame">
      <video controls preload="metadata" playsinline poster="${esc(v.poster)}"${size} aria-label="${esc(v.title)}">
        <source src="${esc(v.src)}" type="${esc(v.type || 'video/mp4')}">
        ${v.captions ? `<track kind="captions" src="${esc(v.captions)}" srclang="en" label="English" default>` : ''}
      </video>
    </div>
    <figcaption>
      <h${headingLevel} class="video-title">${esc(v.title)}${v.runtime ? ` <span class="muted">(${esc(v.runtime)})</span>` : ''}</h${headingLevel}>
      ${v.description ? `<p>${esc(v.description)}</p>` : ''}
      ${v.transcript ? `<details class="transcript"><summary>Read the transcript</summary><p>${esc(v.transcript)}</p></details>` : ''}
      ${extra}
    </figcaption>
  </figure>`;
}

function publishedVideos(site) {
  return site.siteConfig.media.galleryVideos.filter((v) => v.src);
}

export function galleryPage(site) {
  const { gallery } = site.pages;
  const videos = publishedVideos(site);
  const body = `
${pageHead({ title: gallery.title, lead: gallery.intro, crumbs: [{ label: 'Home', href: '/' }, { label: 'Gallery' }] })}
<section class="section section-tight" aria-labelledby="photos-title">
  <div class="container">
    <h2 id="photos-title" class="visually-hidden">Photos</h2>
    <ul class="gallery-grid" role="list" data-gallery>
      ${gallery.photos.map((p, i) => `<li class="gallery-item" id="${p.id}">
        <figure>
          <button class="gallery-open" type="button" data-index="${i}" aria-haspopup="dialog">
            ${p.single ? singlePicture(p, { sizes: '(min-width: 1000px) 33vw, (min-width: 640px) 50vw, 100vw', className: 'framed' }) : picture(p, { sizes: '(min-width: 1000px) 33vw, (min-width: 640px) 50vw, 100vw', className: 'framed', landscapeOnly: true })}
            <span class="gallery-zoom">${icon('expand')}<span class="visually-hidden">View larger: ${esc(p.title)}</span></span>
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
    ${videos.length ? `<div class="video-grid">${videos.map((v) => videoItem(v)).join('')}</div>
    <p class="video-more"><a class="text-link" href="${esc(site.clinic.socialLinks.instagram)}" rel="noopener">${esc(gallery.instagramCta)}${icon('arrow', 'icon icon-arrow')}</a></p>` : `
    <div class="video-placeholder">
      <a class="video-placeholder-media" href="${esc(site.clinic.socialLinks.instagram)}" rel="noopener">
        ${picture(photo(site, 'reception'), { alt: 'Reception at ConfiDent Oral Care', sizes: '(min-width: 900px) 60vw, 100vw', className: 'framed', landscapeOnly: true })}
        <span class="video-badge">${icon('instagram')} Instagram</span>
      </a>
      <div>
        <h3>A look around ConfiDent</h3>
        <p>${esc(gallery.videosPlaceholder)}</p>
        <a class="btn btn-secondary" href="${esc(site.clinic.socialLinks.instagram)}" rel="noopener">${icon('instagram')} ${esc(gallery.instagramCta)}</a>
      </div>
    </div>`}
  </div>
</section>
<dialog class="lightbox" aria-label="Photo viewer" data-lightbox>
  <div class="lightbox-inner">
    <button class="icon-btn lightbox-close" type="button" data-lightbox-close>${icon('close')}<span class="visually-hidden">Close photo viewer</span></button>
    <figure class="lightbox-figure"><div class="lightbox-image"></div><figcaption class="lightbox-caption"></figcaption></figure>
    <button class="icon-btn lightbox-prev" type="button" data-lightbox-prev>${icon('prev')}<span class="visually-hidden">Previous photo</span></button>
    <button class="icon-btn lightbox-next" type="button" data-lightbox-next>${icon('next')}<span class="visually-hidden">Next photo</span></button>
  </div>
</dialog>`;
  return layout(site, { title: 'Gallery', path: '/gallery', description: gallery.metaDescription, body });
}

/* ------------------------------------------------------------------ Blog */

export function blogPage(site) {
  const body = `
${pageHead({ title: site.blogIndex.title, lead: site.blogIndex.intro, crumbs: [{ label: 'Home', href: '/' }, { label: 'Dental Blog' }] })}
<section class="section section-tight">
  <div class="container">
    ${articleCards(site, site.articles, 2)}
  </div>
</section>`;
  return layout(site, { title: 'Dental blog', path: '/blog', description: site.blogIndex.metaDescription, body });
}

export function articlePage(site, article) {
  const others = site.articles.filter((a) => a.slug !== article.slug);
  const body = `
${pageHead({
    title: article.title,
    lead: article.excerpt,
    crumbs: [{ label: 'Home', href: '/' }, { label: 'Dental Blog', href: '/blog' }, { label: article.title }],
  })}
<article class="section section-tight">
  <div class="container narrow prose">
    ${site.siteConfig.preview ? '<p class="draft-note">Editorial draft for clinic review before public launch.</p>' : ''}
    ${article.sections.map(([h, p]) => `<h2>${esc(h)}</h2><p>${esc(p)}</p>`).join('')}
    <aside class="explore" aria-labelledby="explore-title">
      <h2 id="explore-title" class="small-heading">Explore</h2>
      <ul class="related-links" role="list">${article.explore.map((e) => `<li><a href="${e.href}">${esc(e.label)}${icon('arrow', 'icon icon-arrow')}</a></li>`).join('')}</ul>
    </aside>
  </div>
</article>
<section class="section section-ivory" aria-labelledby="more-title">
  <div class="container">
    <h2 id="more-title" class="section-subtitle">More from the blog</h2>
    ${articleCards(site, others)}
  </div>
</section>`;
  return layout(site, { title: article.title, path: `/blog/${article.slug}`, description: article.excerpt, body });
}

/* --------------------------------------------------------------- Contact */

export function contactPage(site) {
  const { contact } = site.pages;
  const { clinic } = site;
  const body = `
${pageHead({ title: contact.title, crumbs: [{ label: 'Home', href: '/' }, { label: 'Contact Us' }] })}
<section class="section section-tight">
  <div class="container contact-grid">
    <div class="contact-card">
      <h2 class="small-heading">Address</h2>
      <p class="address">${icon('pin')}<span><strong>ConfiDent Oral Care</strong><br>${esc(clinic.address)}</span></p>
      <a class="btn btn-secondary" href="${esc(site.directionsUrl)}" rel="noopener">Get directions</a>
    </div>
    <div class="contact-card">
      <h2 class="small-heading">Call or email</h2>
      <p><strong>Call</strong> <a href="${clinic.phone.href}">${esc(clinic.phone.label)}</a></p>
      <p><strong>Email</strong> <a href="${clinic.email.href}">${esc(clinic.email.label)}</a></p>
      <p>${esc(contact.arrange)}</p>
    </div>
    <div class="contact-card">
      <h2 class="small-heading">Posted hours</h2>
      <table class="hours-table">
        <caption class="visually-hidden">Posted hours</caption>
        <thead><tr><th scope="col">Days</th><th scope="col">Time</th></tr></thead>
        <tbody>${site.hours.map((h) => `<tr><th scope="row">${esc(h.days)}</th><td>${esc(h.time)}</td></tr>`).join('')}</tbody>
      </table>
      <p class="muted small">${esc(contact.hoursNote)}</p>
    </div>
    <div class="contact-card">
      <h2 class="small-heading">Follow us</h2>
      <ul class="social-list">
        <li><a href="${esc(clinic.socialLinks.instagram)}" rel="noopener">${icon('instagram')} Instagram</a> <span class="muted small">Message us here to arrange a visit</span></li>
        <li><a href="${esc(clinic.socialLinks.facebook)}" rel="noopener">${icon('facebook')} Facebook</a></li>
      </ul>
    </div>
  </div>
</section>
${routeSection(site)}
<section class="section cta-band">
  <div class="container narrow center">
    <h2>Ready to arrange a visit?</h2>
    <div class="btn-row center">
      <a class="btn btn-primary" href="/appointments">Request an appointment</a>
      <a class="btn btn-secondary" href="${clinic.phone.href}">Call ${esc(clinic.phone.label)}</a>
    </div>
  </div>
</section>`;
  return layout(site, { title: 'Contact us', path: '/contact', description: contact.metaDescription, body, jsonLd: dentistJsonLd(site) });
}

function routeSection(site) {
  const route = publishedVideos(site).find((v) => v.id === 'route-to-confident');
  if (!route) return '';
  return `<section class="section section-ivory" id="find-your-way" aria-labelledby="route-title">
  <div class="container">
    <div class="section-intro">
      <h2 id="route-title">Find your way to The Boardwalk</h2>
    </div>
    ${videoItem(route, { extra: `<div class="btn-row"><a class="btn btn-primary" href="${esc(site.directionsUrl)}" rel="noopener">Get directions</a><a class="btn btn-secondary" href="${site.clinic.phone.href}">Call ${esc(site.clinic.phone.label)}</a></div>` })}
  </div>
</section>`;
}

/* ---------------------------------------------------------- Appointments */

export function appointmentsPage(site) {
  const { appointments } = site.pages;
  const { clinic } = site;
  const test = site.scheduling.mode === 'test';
  const body = `
${pageHead({ title: appointments.title, lead: appointments.intro, crumbs: [{ label: 'Home', href: '/' }, { label: 'Appointments' }] })}
<section class="section section-tight" aria-label="Ways to arrange a visit">
  <div class="container">
    <ul class="option-grid" role="list">
      <li class="option-card option-primary">
        ${icon('chat', 'icon icon-lg')}
        <h2>Ask confident AI</h2>
        <p>Find a starting point, check available times, and request a visit with ConfiDent’s AI assistant.</p>
        <button class="btn btn-primary" type="button" data-ai-open data-ai-prompt="I’d like to request an appointment.">Ask confident AI</button>
      </li>
      <li class="option-card">
        ${icon('phone', 'icon icon-lg')}
        <h2>Call the clinic</h2>
        <p>Speak with the team during posted hours.</p>
        <a class="btn btn-secondary" href="${clinic.phone.href}">Call ${esc(clinic.phone.label)}</a>
      </li>
      <li class="option-card">
        ${icon('instagram', 'icon icon-lg')}
        <h2>Send an Instagram DM</h2>
        <p>Message the practice on Instagram to arrange a visit.</p>
        <a class="btn btn-secondary" href="${esc(clinic.socialLinks.instagram)}" rel="noopener">Message us on Instagram</a>
      </li>
    </ul>
  </div>
</section>
<section class="section section-ivory" id="booking" aria-labelledby="booking-title" tabindex="-1">
  <div class="container narrow">
    <h2 id="booking-title">Choose a visit type</h2>
    ${site.staticPreview ? `<div class="result result-review static-booking">
      <h3>Online booking is not part of this static preview</h3>
      <p>On the full site, this is where patients choose a visit type and an available time, and confident AI can open the same booking form. Both run on the clinic’s server with the test calendar.</p>
      <ul class="static-visit-types">${site.scheduling.visitTypes.map((v) => `<li><strong>${esc(v.label)}</strong>: ${esc(v.description)}</li>`).join('')}</ul>
      <p>To arrange a visit now, call <a href="${clinic.phone.href}">${esc(clinic.phone.label)}</a> or <a href="${esc(clinic.socialLinks.instagram)}" rel="noopener">message us on Instagram</a>.</p>
    </div>` : `<div class="booking" data-booking data-test="${test}">
      <noscript><p>Online booking needs JavaScript. Please call <a href="${clinic.phone.href}">${esc(clinic.phone.label)}</a> or <a href="${esc(clinic.socialLinks.instagram)}">message us on Instagram</a>.</p></noscript>
    </div>`}
  </div>
</section>
${contactPanel(site, { tone: 'plain' })}`;
  return layout(site, { title: 'Request an appointment', path: '/appointments', description: appointments.metaDescription, body });
}

/* ------------------------------------------------------- Preview calendar */

export function testCalendarPage(site, { events, staffRequests, scheduling, formatEvent }) {
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
  const body = `
${pageHead({ title: 'Test calendar', lead: 'Events saved by the test booking flow, shown in Belize time. This calendar is isolated from the practice’s live operations.' })}
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
    <p class="muted small">Patient contact details are kept in the scheduling backend’s records file and are not shown here.</p>
  </div>
</section>`;
  return layout(site, { title: 'Test calendar', path: '/preview/test-calendar', description: 'Preview test calendar.', body });
}

export function notFoundPage(site) {
  const body = `
${pageHead({ title: 'We couldn’t find that page', lead: 'The page may have moved. These links can help you find your way.' })}
<section class="section section-tight"><div class="container narrow">
  <ul class="related-links" role="list">
    <li><a href="/">Home${icon('arrow', 'icon icon-arrow')}</a></li>
    <li><a href="/services">Services${icon('arrow', 'icon icon-arrow')}</a></li>
    <li><a href="/appointments">Request an appointment${icon('arrow', 'icon icon-arrow')}</a></li>
    <li><a href="/contact">Contact Us${icon('arrow', 'icon icon-arrow')}</a></li>
  </ul>
</div></section>`;
  return layout(site, { title: 'Page not found', path: '/404', description: 'Page not found.', body });
}
