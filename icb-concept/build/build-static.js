#!/usr/bin/env node
/* ============================================================================
   build-static.js — turns the single-page app into a real website.

   WHY THIS EXISTS

   Everything the site says lived at one URL. Seventeen routes in two
   languages, all behind a # , and a fragment is not a URL: it is stripped
   before the request is made, so every one of those pages arrived at a
   crawler as the homepage. Measured, a crawler that does not run
   JavaScript saw sixty words of the whole site.

   Google does run JavaScript, eventually and on a budget. The engines
   this site now needs to reach mostly do not: GPTBot, ClaudeBot,
   PerplexityBot and the rest fetch HTML and read it. Structured data,
   headings, answers and branch details are all invisible to them if a
   script has to run first. So the layers above the foundation, the
   answer engines and the AI visibility, are not a content problem until
   this is fixed. They are a delivery problem.

   This writes each route, in each language, as its own HTML file at its
   own path, with the content already in it. The app still boots on top
   and takes over navigation, so nothing about using the site changes.

   WHAT COMES OUT

     dist/site/index.html                  English homepage
     dist/site/insurance/motor/index.html  one directory per route
     dist/site/es/...                      the same again in Spanish
     dist/site/sitemap.xml                 every URL, with hreflang
     dist/site/llms.txt                    a plain summary for models

   Run it with:  node build/build-static.js
   Set ICB_ORIGIN to the live host before a real deploy.
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const vm = require("vm");
const { execFileSync } = require("child_process");

/* The live host, and the only place it is written down. It becomes
   every canonical, every hreflang pair, the social URLs, every
   structured-data identity, the sitemap, the Sitemap line in robots.txt
   and llms.txt.

   This is ICB's own domain, because that is where the rebuild goes. It
   is set here even while the site is still being reviewed on the agency
   subdomain, which means the review copy names an address it is not yet
   served at. That is exactly why the noindex in index.html stays until
   launch day: a page on one host claiming to be a page on another is
   not a thing to show a crawler. Set ICB_ORIGIN to build for a staging
   host instead. */
const ORIGIN = (process.env.ICB_ORIGIN || "https://www.icbinsurance.com")
  .replace(/\/+$/, "");
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const OUT = path.join(DIST, "site");
const PORT = 8571;

/* What gets deployed. Anything not in this list does not reach the
   server, which is the point: the repository also holds build scripts,
   notes and dist itself, and none of that is the website.

   The four root files earn their place by being at the root and nowhere
   else. A crawler probes /favicon.ico and /robots.txt by path, not by
   following a link, so a file one directory down may as well not exist. */
const SHIP = ["index.html", "css", "js", "assets",
              "favicon.ico", "site.webmanifest", "robots.txt", "sitemap.xml",
              /* Optional, and absent until there is something to put in
                 it. Replacing a site that is already indexed means every
                 old URL needs a 301 to its nearest new page, or its
                 ranking and its inbound links die with it. That belongs
                 in a _redirects file at the root, so the build ships one
                 if it finds one. */
              "_redirects"];

/* In the repository but on no page: an earlier encode kept for
   reference, and the crop the Marine hero used before the boat. */
const SKIP = new Set([
  "assets/video/icb-story.mp4",
  "assets/img/products/marine.jpg"
]);

/* Playwright is the one thing this build needs that the site does not.
   Rendering a JavaScript app into HTML takes a browser; there is no way
   round that. It is deliberately NOT a dependency of the project, which
   ships no node_modules: it is looked up wherever it happens to be
   installed, including globally, so the repository stays as it is. */
function findPlaywright() {
  const tries = [];
  if (process.env.ICB_PLAYWRIGHT) tries.push(process.env.ICB_PLAYWRIGHT);
  tries.push("playwright");
  try {
    tries.push(path.join(
      execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim(), "playwright"));
  } catch (e) { /* no npm on PATH; the other candidates may still work */ }
  for (const t of tries) {
    try { return require(t); } catch (e) { /* next */ }
  }
  return null;
}

const pw = findPlaywright();
if (!pw) {
  console.error("build-static renders the app in a browser before writing it out,\n" +
                "and cannot find Playwright. Install it with:\n" +
                "  npm install -g playwright\n" +
                "or point ICB_PLAYWRIGHT at an existing copy.");
  process.exit(1);
}
const chromium = pw.chromium;

/* ------------------------------------------------------------------ */
/* The site's own data, read straight from the files the app uses, so  */
/* the structured data and the page can never drift apart.             */
/* ------------------------------------------------------------------ */
function loadData() {
  const ctx = vm.createContext({});
  ctx.window = ctx;
  for (const f of ["site.js", "products.js", "locations.js", "gallery.js", "faq.js"]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, "js/data", f), "utf8"), ctx);
  }
  return ctx.ICB.DATA;
}

/* ------------------------------------------------------------------ */
/* Paths. One scheme, shared with js/router.js.                        */
/* ------------------------------------------------------------------ */
const pathFor = (route, lang) =>
  (lang === "es" ? "/es" : "") + (route ? "/" + route : "/");

/* "#/claims@marine" is the app's own shape. As a real link that is a
   path and a fragment: /claims#marine. The router reads it back. */
function hrefForRoute(raw, lang) {
  let anchor = "", query = "";
  const at = raw.indexOf("@");
  if (at >= 0) { anchor = raw.slice(at + 1); raw = raw.slice(0, at); }
  const qm = raw.indexOf("?");
  if (qm >= 0) { query = raw.slice(qm); raw = raw.slice(0, qm); }
  const route = raw.replace(/^\/+|\/+$/g, "");
  return pathFor(route, lang) + query + (anchor ? "#" + anchor : "");
}

const esc = s => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

/* ------------------------------------------------------------------ */
/* Structured data.                                                    */
/*                                                                     */
/* This is the layer that lets a machine understand ICB as a company   */
/* with branches, products and contact details, rather than as prose   */
/* it has to infer all of that from.                                   */
/*                                                                     */
/* NO geo coordinates. The map positions in the data are projected      */
/* town points, good enough to place a dot and nowhere near good        */
/* enough to publish as a branch's location. Everything emitted here is */
/* from ICB's own directory: address, telephone, email, hours. A        */
/* latitude invented to fill a field is worse than an absent one.       */
/* ------------------------------------------------------------------ */
function graph(DATA, { route, lang, title, description, crumbs }) {
  const org = DATA.site.org, co = DATA.site.corporate;
  const url = ORIGIN + pathFor(route, lang);
  const orgId = ORIGIN + "/#organization";
  const pick = v => (v && typeof v === "object" ? (v[lang] || v.en) : v);

  /* Opening hours as schema.org wants them, built from the same records
     the cards are built from. Branches no longer all keep one schedule:
     the standard week has a midday close and a Saturday morning, and the
     two border branches follow the crossing instead. A single hardcoded
     spec here would quietly tell Google something the page does not say. */
  const hoursSpec = h => ((h && h.spec) || []).map(r => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: r.days, opens: r.opens, closes: r.closes
  }));
  const hoursFor = l => hoursSpec(l.hours === undefined ? DATA.site.hours : l.hours);
  const hours = hoursSpec(DATA.site.hours);

  const nodes = [
    {
      "@type": "InsuranceAgency",
      "@id": orgId,
      name: "Insurance Corporation of Belize Ltd.",
      alternateName: "ICB",
      url: ORIGIN + "/",
      logo: { "@type": "ImageObject", url: ORIGIN + "/assets/img/icon-512.png" },
      image: ORIGIN + "/assets/img/icon-512.png",
      email: co.email,
      telephone: co.phoneTel,
      slogan: org.positiveDifference,
      foundingDate: "1981",
      founder: { "@type": "Person", name: "Erdulfo Nunez" },
      address: {
        "@type": "PostalAddress",
        streetAddress: co.address,
        addressLocality: co.city,
        addressCountry: "BZ"
      },
      areaServed: { "@type": "Country", name: "Belize" },
      openingHoursSpecification: hours
    },
    {
      "@type": "WebSite",
      "@id": ORIGIN + "/#website",
      url: ORIGIN + "/",
      name: "Insurance Corporation of Belize Ltd.",
      publisher: { "@id": orgId },
      inLanguage: ["en", "es"]
    },
    {
      "@type": "WebPage",
      "@id": url + "#page",
      url: url,
      name: title,
      description: description,
      isPartOf: { "@id": ORIGIN + "/#website" },
      about: { "@id": orgId },
      inLanguage: lang
    }
  ];

  if (crumbs.length > 1) {
    nodes.push({
      "@type": "BreadcrumbList",
      "@id": url + "#breadcrumbs",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem", position: i + 1, name: c.name,
        item: ORIGIN + pathFor(c.route, lang)
      }))
    });
  }

  /* Every question ICB answers, as a FAQPage. This is what lets a
     question appear directly in a search result or inside an
     assistant's answer rather than only as a link to a page that
     contains it.

     Declared on the FAQ page ALONE, although several of these questions
     also appear in context on the claims, payments and product pages.
     The same question declared from two URLs asks a search engine to
     pick a winner, and it may pick neither. One canonical home. */
  if (route === "faq" && DATA.faq) {
    const plain = v => String(pick(v) || "")
      .replace(/\s+/g, " ")
      .trim();
    const answerHtml = qa => {
      let out = plain(qa.a).split(/\s{2,}/).join(" ");
      const bits = [out];
      (qa.list || []).forEach(x => bits.push(plain(x)));
      (qa.groups || []).forEach(g => {
        bits.push(plain(g.title));
        (g.list || []).forEach(x => bits.push(plain(x)));
      });
      if (qa.table) {
        qa.table.rows.forEach(r => bits.push(r.map(c => plain(c)).join(": ")));
      }
      if (qa.after) bits.push(plain(qa.after));
      return bits.filter(Boolean).join(" ");
    };
    const entities = [];
    DATA.faq.sections.forEach(sec => sec.qa.forEach(qa => {
      entities.push({
        "@type": "Question",
        name: plain(qa.q),
        acceptedAnswer: { "@type": "Answer", text: answerHtml(qa) }
      });
    }));
    nodes.push({
      "@type": "FAQPage",
      "@id": url + "#faq",
      inLanguage: lang,
      isPartOf: { "@id": ORIGIN + "/#website" },
      about: { "@id": orgId },
      mainEntity: entities
    });
  }

  /* The branch network, as entities rather than as a page of cards. */
  if (route === "locations") {
    const live = DATA.activeLocations();
    nodes.push({
      "@type": "ItemList",
      "@id": url + "#branches",
      name: pick({ en: "ICB branches and agencies", es: "Sucursales y agencias de ICB" }),
      numberOfItems: live.length,
      itemListElement: live.map((l, i) => {
        const node = {
          "@type": "ListItem", position: i + 1,
          item: {
            "@type": "InsuranceAgency",
            "@id": ORIGIN + "/locations#" + l.id,
            name: "ICB " + l.name,
            parentOrganization: { "@id": orgId },
            address: {
              "@type": "PostalAddress",
              streetAddress: l.address,
              addressLocality: l.town.split(",")[0].trim(),
              addressRegion: l.district + " District",
              addressCountry: "BZ"
            },
            openingHoursSpecification: hoursFor(l),
            areaServed: { "@type": "AdministrativeArea", name: l.district + " District, Belize" }
          }
        };
        const phones = (l.phones || []).map(p => p.tel)
          .concat((l.whatsapps || []).filter(w => w.callable !== false).map(w => "+" + w.wa));
        if (phones.length) node.item.telephone = phones;
        if (l.email) node.item.email = l.email;
        return node;
      })
    });
  }

  /* ICB's YouTube films, so a search engine knows the gallery holds
     video rather than inferring it from a button.

     name, duration, language and embed URL are all known. uploadDate and
     description are not: the channel showed "3 yr ago", which is not a
     date, and nobody here has watched the films. Both are left out
     rather than guessed, which costs the video rich result and keeps the
     markup honest. Fill them in if ICB supplies them.

     The thumbnail URL is YouTube's own deterministic one for a public
     video, so it is asserted rather than invented. */
  if (route === "gallery") {
    const films = (DATA.gallery.video && DATA.gallery.video.youtube) || [];
    for (const f of films) {
      if (!f.title) continue;
      nodes.push({
        "@type": "VideoObject",
        "@id": url + "#video-" + f.id,
        name: f.title,
        inLanguage: f.lang || undefined,
        duration: f.seconds ? "PT" + Math.round(f.seconds) + "S" : undefined,
        thumbnailUrl: "https://i.ytimg.com/vi/" + f.id + "/hqdefault.jpg",
        embedUrl: "https://www.youtube-nocookie.com/embed/" + f.id,
        publisher: { "@id": orgId },
        isPartOf: { "@id": url + "#page" }
      });
    }
  }

  /* Products as services ICB provides, named exactly as ICB names them. */
  const products = DATA.products || [];
  if (route === "insurance") {
    nodes.push({
      "@type": "ItemList",
      "@id": url + "#products",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem", position: i + 1,
        name: p.name,
        url: ORIGIN + pathFor("insurance/" + p.id, lang)
      }))
    });
  }
  const product = products.find(p => route === "insurance/" + p.id);
  if (product) {
    nodes.push({
      "@type": "Service",
      "@id": url + "#service",
      serviceType: product.name,
      name: product.name,
      description: pick(product.short),
      provider: { "@id": orgId },
      areaServed: { "@type": "Country", name: "Belize" },
      inLanguage: lang
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes });
}

/* ------------------------------------------------------------------ */
/* Turning one rendered page into one file.                            */
/* ------------------------------------------------------------------ */
function finish(html, info, DATA) {
  const { route, lang, title, description } = info;
  const url = ORIGIN + pathFor(route, lang);
  const other = lang === "en" ? "es" : "en";

  /* The document says which language it is in. */
  html = html.replace(/<html[^>]*>/i, '<html lang="' + lang + '">');

  /* Links out of the hash and onto real paths, so a crawler following
     the site discovers pages instead of circling one. */
  html = html.replace(/\bhref="#\/([^"]*)"/g, (m, r) => 'href="' + esc(hrefForRoute(r, lang)) + '"');

  /* A relative asset path written into a document at /insurance/motor/
     resolves inside that directory and 404s. Anchor them to the root. */
  html = html.replace(
    /\b(src|href|srcset|poster)="((?:css|js|assets)\/[^"]*|favicon\.ico|site\.webmanifest)"/g,
    (m, attr, v) => attr + '="/' + v + '"');

  const head = [
    '<title>' + esc(title) + '</title>',
    '<meta name="description" content="' + esc(description) + '">',
    '<link rel="canonical" href="' + esc(url) + '">',
    '<link rel="alternate" hreflang="' + lang + '" href="' + esc(url) + '">',
    '<link rel="alternate" hreflang="' + other + '" href="' + esc(ORIGIN + pathFor(route, other)) + '">',
    '<link rel="alternate" hreflang="x-default" href="' + esc(ORIGIN + pathFor(route, "en")) + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Insurance Corporation of Belize Ltd.">',
    '<meta property="og:locale" content="' + (lang === "es" ? "es_BZ" : "en_BZ") + '">',
    '<meta property="og:title" content="' + esc(title) + '">',
    '<meta property="og:description" content="' + esc(description) + '">',
    '<meta property="og:url" content="' + esc(url) + '">',
    '<meta property="og:image" content="' + esc(ORIGIN + "/assets/img/video/life-happens-fast" +
      (lang === "es" ? "-es" : "") + ".jpg") + '">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<script type="application/ld+json">' + graph(DATA, info) + '</script>'
  ].join("\n  ");

  /* Out with the title and description the app rendered, in with the
     page's own. */
  html = html.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
  html = html.replace(/<meta\s+name="description"[^>]*>\s*/i, "");
  html = html.replace(/<\/head>/i, "  " + head + "\n</head>");

  return html;
}

/* ------------------------------------------------------------------ */
function copyInto(from, to, rel) {
  if (fs.statSync(from).isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const name of fs.readdirSync(from)) {
      copyInto(path.join(from, name), path.join(to, name), rel ? rel + "/" + name : name);
    }
    return;
  }
  if (SKIP.has(rel)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css",
  ".js": "text/javascript", ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".ico": "image/x-icon", ".mp4": "video/mp4", ".woff2": "font/woff2",
  ".txt": "text/plain", ".xml": "application/xml" };

function serve(dir) {
  return http.createServer((req, res) => {
    let f = path.join(dir, decodeURIComponent(req.url.split("?")[0].split("#")[0]));
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    if (!f.startsWith(dir) || !fs.existsSync(f)) { res.writeHead(404); return res.end("no"); }
    res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  }).listen(PORT);
}

/* ------------------------------------------------------------------ */
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  for (const item of SHIP) {
    const from = path.join(ROOT, item);
    if (!fs.existsSync(from)) continue;   /* an optional one, like _redirects */
    copyInto(from, path.join(OUT, item), item);
  }

  /* robots.txt ships as written, and its one absolute address is the
     Sitemap line. Pointed at the wrong host it sends a crawler to a
     sitemap full of URLs on a domain it was not asked to index, which
     is the single mistake most likely to be made on launch day and the
     hardest to notice. Rewritten here so the host is set in one place
     for the whole build, the same as every canonical and every @id. */
  {
    const rp = path.join(OUT, "robots.txt");
    if (fs.existsSync(rp)) {
      const before = fs.readFileSync(rp, "utf8");
      const after = before.replace(/^Sitemap:.*$/mi, "Sitemap: " + ORIGIN + "/sitemap.xml");
      if (after === before && /^Sitemap:/mi.test(before) === false) {
        throw new Error("robots.txt has no Sitemap line to point at " + ORIGIN);
      }
      fs.writeFileSync(rp, after);
    }
  }

  const DATA = loadData();
  /* Render from the SOURCE, never from the directory being written into.
     Rendering out of the output means the first page written becomes the
     page every later one is rendered from: the English homepage was
     finished, and then every Spanish page loaded it and inherited its
     canonical and its hreflang before being given its own. Two of each,
     the wrong one first.

     The source directory also holds build scripts and notes that are not
     in SHIP, but nothing on a page ever asks for them, so serving it is
     the simplest pristine copy there is: the one already on disk. */
  const server = serve(ROOT);
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM || "/opt/pw-browsers/chromium"
  });
  /* Rendered with motion turned off: the bee is mid-flight otherwise and
     its position would be frozen into every page. */
  const ctx = await browser.newContext({ reducedMotion: "reduce",
    viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const base = "http://127.0.0.1:" + PORT + "/";

  await page.goto(base, { waitUntil: "load" });
  await page.waitForSelector("#main *");

  /* The app is asked what routes it has, rather than being told, so this
     cannot fall behind a route someone adds later. */
  const routes = await page.evaluate(() => {
    /* claimForm is a route per claim type, not a page of its own, so it
       is enumerated from the forms rather than from the view name. */
    const skip = { home: 1, product: 1, notfound: 1, claimForm: 1 };
    return [""].concat(
      Object.keys(ICB.views).filter(v => !skip[v]),
      (ICB.DATA.products || []).map(p => "insurance/" + p.id),
      ((ICB.DATA.claimForms && ICB.DATA.claimForms.forms) || []).map(f => "claims/form/" + f.id));
  });

  const written = [];
  let failed = 0;
  for (const lang of ["en", "es"]) {
    for (const route of routes) {
      const errs = [];
      const onErr = e => errs.push(String(e));
      page.on("pageerror", onErr);
      await page.goto(base + "?lang=" + lang + "#/" + route, { waitUntil: "load" });
      await page.waitForFunction(() => {
        const m = document.getElementById("main");
        return m && m.children.length > 0;
      }, null, { timeout: 15000 });
      await page.waitForTimeout(220);

      const info = await page.evaluate(() => {
        /* The scroll animations start at opacity 0 and are switched on as
           they come into view. A static page has to arrive already
           visible, or it is blank until a script runs. */
        document.querySelectorAll(".rv").forEach(n => n.classList.add("is-in"));
        const pill = document.querySelector(".bee-pill");
        if (pill) pill.style.transform = "";
        const crumbs = [...document.querySelectorAll(".crumbs a, .crumbs [aria-current]")]
          .map(a => a.textContent.trim()).filter(Boolean);
        const lead = document.querySelector(".hero-lead, .page-hero p, #main p");
        return {
          title: document.title,
          h1: (document.querySelector("h1") || {}).textContent || "",
          lead: lead ? lead.textContent.replace(/\s+/g, " ").trim() : "",
          crumbNames: crumbs,
          html: "<!DOCTYPE html>\n" + document.documentElement.outerHTML
        };
      });
      page.off("pageerror", onErr);
      if (errs.length) { console.error("  ! " + route + " [" + lang + "] " + errs[0]); failed++; }

      /* The description is the page's own opening line, trimmed at a word
         boundary. Reusing approved copy rather than writing new claims. */
      let description = info.lead || info.h1;
      if (description.length > 158) {
        description = description.slice(0, 158).replace(/\s+\S*$/, "") + "...";
      }

      const crumbs = [{ name: "ICB", route: "" }];
      if (route) crumbs.push({ name: info.h1.trim() || route, route: route });

      const html = finish(info.html, {
        route, lang, title: info.title, description, crumbs
      }, DATA);

      const dir = path.join(OUT, lang === "es" ? "es" : "", route);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), html);
      written.push({ route, lang, bytes: Buffer.byteLength(html), title: info.title });
    }
  }

  /* 404.html, which Netlify and most static hosts serve for a URL that
     does not exist. Without one the visitor gets the host's own bare
     error page, with none of ICB on it and no way back. This is the
     site's own not-found view, prerendered like everything else, so it
     carries the header, the navigation and a link home.

     Deliberately NOT a copy of the homepage. Answering every wrong
     address with the homepage and a 200 tells a crawler that thousands
     of URLs exist and are all the same page. */
  await page.goto(base + "#/__not-found__", { waitUntil: "load" });
  await page.waitForFunction(() => {
    const m = document.getElementById("main");
    return m && m.children.length > 0;
  }, null, { timeout: 15000 });
  await page.waitForTimeout(200);
  const nf = await page.evaluate(() => {
    document.querySelectorAll(".rv").forEach(n => n.classList.add("is-in"));
    return { title: document.title,
             h1: (document.querySelector("h1") || {}).textContent || "",
             html: "<!DOCTYPE html>\n" + document.documentElement.outerHTML };
  });
  let notFound = finish(nf.html, {
    route: "", lang: "en", title: nf.title,
    description: nf.h1.trim(), crumbs: [{ name: "ICB", route: "" }]
  }, DATA);
  /* A 404 is not a page, so it claims no address. Left as finish() wrote
     it, this would carry a canonical and an og:url pointing at the
     homepage, which tells a crawler that every wrong URL on the site IS
     the homepage. Out they come, and it says noindex in its own right so
     it stays out of the index after the site-wide tag is lifted. */
  notFound = notFound
    .replace(/\n\s*<link rel="canonical"[^>]*>/g, "")
    .replace(/\n\s*<link rel="alternate"[^>]*>/g, "")
    .replace(/\n\s*<meta property="og:url"[^>]*>/g, "");
  if (!/name="robots"/.test(notFound)) {
    notFound = notFound.replace(/<\/head>/i,
      '  <meta name="robots" content="noindex">\n</head>');
  }
  /* The host serves this one file at whatever wrong address was asked
     for, so the app wakes up on a path it cannot match. Everywhere else
     that means the app is not at the root of its host (the single file
     at /artifact/<id>) and the right answer is the homepage. Here it
     means exactly what it says. The marker tells the app which of the
     two it is looking at; nothing else in the build carries it. */
  notFound = notFound.replace(/<html\b/i, '<html data-notfound');
  fs.writeFileSync(path.join(OUT, "404.html"), notFound);

  await browser.close();
  server.close();

  /* Sitemap: every URL, each one naming its pair. */
  const urls = routes.map(route => {
    const alts = ["en", "es"].map(l =>
      '      <xhtml:link rel="alternate" hreflang="' + l + '" href="' +
      esc(ORIGIN + pathFor(route, l)) + '"/>').join("\n");
    return ["en", "es"].map(l =>
      "  <url>\n    <loc>" + esc(ORIGIN + pathFor(route, l)) + "</loc>\n" +
      alts + "\n" +
      '      <xhtml:link rel="alternate" hreflang="x-default" href="' +
      esc(ORIGIN + pathFor(route, "en")) + '"/>\n' +
      "    <changefreq>monthly</changefreq>\n" +
      "    <priority>" + (route ? "0.8" : "1.0") + "</priority>\n  </url>").join("\n");
  }).join("\n");

  fs.writeFileSync(path.join(OUT, "sitemap.xml"),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    "<!-- Generated by build/build-static.js. Every route in both\n" +
    "     languages, each entry naming its counterpart so the two are\n" +
    "     understood as one page in two languages, not as duplicates. -->\n" +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + urls + "\n</urlset>\n");

  /* llms.txt. An emerging convention: one plain page a model can read
     instead of inferring the company from navigation chrome. Generated
     from the same data as the site, so it cannot quietly go stale, and
     it states only what ICB publishes. */
  const live = DATA.activeLocations();
  const byDistrict = {};
  for (const l of live) (byDistrict[l.district] = byDistrict[l.district] || []).push(l);
  const llms = [
    "# Insurance Corporation of Belize Ltd. (ICB)",
    "",
    "> " + DATA.site.org.serviceQuote.en,
    "",
    DATA.site.org.story.en,
    "",
    "Head office: " + DATA.site.corporate.address + ", " + DATA.site.corporate.city +
      ", Belize. Telephone " + DATA.site.corporate.phoneDisplay + " and " +
      DATA.site.corporate.phoneAltDisplay + ". Email " + DATA.site.corporate.email + ".",
    "Standard opening hours: " + DATA.site.hours.lines.map(h => h.en).join("; ") +
      ". The two border branches keep the crossing's hours instead, listed with them below.",
    "The site is published in English and Spanish; Spanish pages live under /es/.",
    "",
    "## Insurance products",
    "",
    "Product names are ICB's own and are not translated.",
    ""
  ];
  for (const p of DATA.products || []) {
    llms.push("- [" + p.name + "](" + ORIGIN + pathFor("insurance/" + p.id, "en") + "): " +
      String(p.short && p.short.en || "").replace(/\s+/g, " ").trim());
  }
  /* ICB's own questions and answers, in full. An answer engine that
     reads one file about ICB should be able to answer from ICB's own
     words rather than from an inference about them, and this is the
     cheapest place to put all of it. */
  if (DATA.faq) {
    const flat = v => String((v && (v.en || v)) || "").replace(/\s+/g, " ").trim();
    llms.push("", "## Questions and answers", "",
      "Answered by ICB. The full set is at " + ORIGIN + "/faq.", "");
    for (const sec of DATA.faq.sections) {
      llms.push("### " + flat(sec.title), "");
      for (const qa of sec.qa) {
        llms.push("**" + flat(qa.q) + "**", "");
        llms.push(flat(qa.a));
        (qa.list || []).forEach(x => llms.push("- " + flat(x)));
        (qa.groups || []).forEach(g => {
          llms.push("", flat(g.title) + ":");
          (g.list || []).forEach(x => llms.push("- " + flat(x)));
        });
        if (qa.table) {
          qa.table.rows.forEach(r => llms.push("- " + r.map(c => flat(c)).join(": ")));
        }
        if (qa.after) llms.push(flat(qa.after));
        llms.push("");
      }
    }
  }

  llms.push("", "## Branches and agencies", "",
    live.length + " locations across all six districts of Belize.", "");
  for (const d of DATA.districts) {
    if (!byDistrict[d]) continue;
    llms.push("### " + d + " District", "");
    for (const l of byDistrict[d]) {
      const ways = []
        .concat((l.phones || []).map(x => "tel " + x.display))
        .concat((l.whatsapps || []).map(x => "WhatsApp " + x.display))
        .concat(l.email ? ["email " + l.email] : []);
      const sched = (l.hours === undefined ? DATA.site.hours : l.hours);
      const open = sched && sched.lines ? sched.lines.map(h => h.en).join("; ") : "";
      llms.push("- **" + l.name + "** (" + l.type + "). " + l.address +
        (ways.length ? ". " + ways.join(", ") : "") + "." +
        (open ? " Open " + open + "." : ""));
    }
    llms.push("");
  }
  llms.push("## Notes", "",
    "- ICB does not take payments through this website. Payment is by bank transfer.",
    "- Nothing here is a quotation or an offer of cover.",
    "- Full page index: " + ORIGIN + "/sitemap.xml", "");
  fs.writeFileSync(path.join(OUT, "llms.txt"), llms.join("\n"));

  const byLang = l => written.filter(w => w.lang === l).length;
  console.log("\ndist/site");
  console.log("  pages      " + written.length + "  (" + byLang("en") + " English, " + byLang("es") + " Spanish)");
  console.log("  smallest   " + Math.min(...written.map(w => w.bytes)) + " bytes");
  console.log("  sitemap    " + written.length + " URLs with hreflang pairs");
  console.log("  origin     " + ORIGIN + "   (set ICB_ORIGIN to change)");
  if (failed) { console.error("\n" + failed + " page(s) reported a script error."); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
