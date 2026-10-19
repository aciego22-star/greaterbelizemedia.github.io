# Deploying the ICB concept

The site is a fully self-contained static folder. No build step, no
server, and no external requests until someone taps Talk to Bee. Any
static host can serve it.

## One build, one folder

    node build/build-static.js

writes `dist/site`. That is the website. Drag that folder onto Netlify.

There used to be a second build, `dist/no-bee`, so ICB could be shown
the site with and without the assistant. That choice was made: the
assistant stays, and the site now has a page explaining it, so a build
with the assistant stripped out would ship a page about something that
is not there. `build-variants.js` is gone and `build-static.js` copies
what ships for itself.

Do NOT use Netlify's deploy history to show an older version. Rolling
back to an older deploy rolls back everything else with it, so the
client would be looking at two different sites and drawing conclusions
about the wrong difference. And on a deploy page in the Netlify
dashboard, "Open production deploy" opens whatever is live now, not the
deploy you are looking at; the "Permalink" link is the one that opens
that specific build.

## Talk to Bee

The assistant is Chatbase, embedded exactly as supplied:

    https://www.chatbase.co/chatbot-iframe/goJ6R0Hw-bYT3iEd4kaKE

The iframe is not created until the pill is tapped, so a visitor who never
opens it makes no request off ICB's own domain. It is the site's only
outside connection, and js/assistant.js is the only place that URL
appears, so changing the assistant means changing one line.

Two things the deployed host must allow, and every ordinary static host
does by default:

- a frame to www.chatbase.co. A Content-Security-Policy with a
  frame-src directive would need www.chatbase.co added to it.
- microphone permission to reach the frame, which is what
  allow="microphone" on the iframe requests. A Permissions-Policy header
  of microphone=() would switch the assistant's dictation button off.

Where the connection cannot be made the panel says so and offers the
assistant in a new tab, rather than showing an empty frame. That is what
happens in the single-file preview, whose sandbox refuses every outside
request; it is not a fault in the build and it does not happen on a real
host.

## Netlify (drag and drop)

1. Go to https://app.netlify.com/drop (log in first).
2. Drag the ZIP (or the unzipped folder) onto the drop zone.
   The ZIP must contain `index.html` at its top level, which the
   provided `icb-concept-netlify.zip` does.
3. Netlify publishes it at a random `*.netlify.app` URL immediately.
   Open it and confirm the homepage loads.

## Pointing a domain at it

The site is built for `www.icbinsurance.com`, which is where it goes
live. Review happens on `icb.austereautomations.com` in the meantime.

Netlify first, DNS second. Netlify has to be told to answer for a
hostname before it can route that Host header or get a certificate for
it, so changing DNS first gives visitors a certificate warning or a
Netlify "not found" page instead of the site.

1. In Netlify: Site configuration > Domain management > Add a domain.
2. At the DNS provider for the domain, point the `www` record at the
   site:
   - Type: CNAME
   - Name/host: `www`
   - Value/target: the site's own `*.netlify.app` hostname
3. Wait for DNS (usually minutes), then let Netlify issue the HTTPS
   certificate, which is automatic.

Two things to get right on the live domain:

- **The bare domain cannot be a CNAME.** DNS does not allow one at the
  apex. Either set the apex with an ALIAS/ANAME record if the provider
  supports it, or Netlify's A record, or leave the apex alone and serve
  only `www`.
- **Do not move the nameservers without carrying the mail records.**
  MX, SPF, DKIM and DMARC live on that domain. Changing only the `www`
  record at the existing provider cannot break email; switching
  nameservers to Netlify DNS without copying those records will.

Record every existing record before changing anything, and lower the
TTL a day ahead so a rollback takes minutes rather than hours.

## Updating the site

Re-drop a new ZIP on the same Netlify site (Deploys > drag and drop),
or connect the Git repository for automatic deploys from a branch.

## Notes

- Routes are real paths (`/claims`, `/es/locations`), each one a
  directory with its own `index.html`, so Netlify serves them with no
  redirect rules at all. The old hash form still works and rewrites
  itself to the real path on arrival.
- `404.html` is served automatically by Netlify for an address that does
  not exist. It is the site's own not-found page, prerendered with the
  header, the navigation and a way home.
- The site also runs when `index.html` is opened directly from disk,
  which is handy as an offline backup during a live client meeting.
- `node build/build-single.js` produces `dist/icb-concept.html`, a
  one-file version of the whole site for preview surfaces that need a
  single document.

## Launch day: the one switch

`index.html` carries

    <meta name="robots" content="noindex, nofollow">

and that single line is the only thing keeping the site out of Google.
It is deliberate while the concept lives on the agency subdomain, because
a speculative ICB site should not be indexed under anyone else's domain.

Delete the line when the site goes live on ICB's own domain. Nothing else
needs to change for indexing: `robots.txt` already allows crawling,
`sitemap.xml` is in place, and the icons are at the paths Google expects.

The host itself needs no edit. It is set in one place, at the top of
`build/build-static.js`, and the build writes it into every canonical,
every hreflang pair, the social URLs, every structured-data identity,
the generated `sitemap.xml`, the `Sitemap:` line in `robots.txt` and
`llms.txt`. Verified by building against a different host and grepping
the output for the old one.

## Replacing a site that is already indexed

This is a rebuild of a live website, not a new one, and that adds one
job that has nothing to do with the code.

ICB's existing pages are in Google and have links pointing at them from
elsewhere. The rebuild uses its own routes. Any old URL with no new
equivalent will answer 404 after the cutover, and the ranking and the
inbound links that URL had go with it. Google does not transfer them on
its own.

So before go-live, each old URL needs a 301 to its nearest new page, in
a `_redirects` file at the root of the deployed folder. The build ships
that file if it finds one at the root of the source; it is absent until
there is something to put in it. Netlify's own format, one rule a line,
old path first:

    /old-page-name   /insurance/motor   301!

Getting the list of old URLs, best source first:

1. Search Console, Indexing > Pages > export. Best because it also says
   which pages earn traffic, so the ones that matter get attention
   first.
2. The live site's own `sitemap.xml`.
3. The CMS page list.

Set the primary domain in Netlify and it redirects the other hostname
for you, so `www` versus bare needs no rule of its own. Pick whichever
one Google already has indexed and keep it.

Go live early in the week. A cutover on a Friday afternoon is a problem
nobody notices until Monday.

## Icons and the favicon

The favicon only appears in Google results when the home page is indexed
and both the page and the icon are crawlable. The site ships:

- `favicon.ico` at the root, carrying 16, 32 and 48px. Browsers and
  crawlers probe this path directly, regardless of markup.
- `assets/img/icon-{48,96,144,192,512}.png`, squares in multiples of
  48px, which is the shape Google asks for.
- `assets/img/apple-touch-icon.png` at 180px for iOS home screens.
- `site.webmanifest` listing the PNG set for Android.

All four root files are listed in `SHIP` in `build/build-static.js`.
A root file that is not in that list does not get deployed, and a
favicon one directory down may as well not exist.

## The deployable folder is now dist/site

    node build/build-static.js

`dist/site` is what goes on Netlify. Drag that folder, not the source
directory.

It is the same site, written out as real files. Each route becomes its
own directory with its own `index.html`, in both languages:

    dist/site/index.html                   /
    dist/site/insurance/motor/index.html   /insurance/motor
    dist/site/es/claims/index.html         /es/claims

This exists because a fragment is not a URL. Everything after a `#` is
stripped before the request leaves the browser, so seventeen routes in
two languages all arrived at a crawler as the homepage, and a crawler
that does not run JavaScript saw sixty words of the entire site.
Afterwards each page carries four hundred to nine hundred words of its
own, before a single script runs.

Google does run JavaScript, late and on a budget. The engines this site
is being pointed at mostly do not: GPTBot, ClaudeBot, PerplexityBot and
the rest fetch HTML and read what is there. Structured data in a page
that has to execute first is structured data they never see.

The build needs Playwright, because rendering an app into HTML takes a
browser. It is deliberately not a dependency of this project, which
ships no `node_modules`; it is looked up wherever it is installed:

    npm install -g playwright

Set `ICB_ORIGIN` to the live host before a real deploy. It is written
into every canonical, every hreflang, the sitemap and llms.txt:

    ICB_ORIGIN=https://www.icbinsurance.com node build/build-static.js

### What the build writes

- One HTML file per route per language, content already in it.
- A canonical on every page, and `hreflang` naming the English page, the
  Spanish page and `x-default`, reciprocally. Google ignores hreflang
  that does not point back.
- `sitemap.xml` with all 36 URLs and their language pairs.
- JSON-LD on every page: the organisation, the website, the page, its
  breadcrumbs, the twenty-one branches as entities with their addresses,
  phones, emails and hours, and each insurance product as a service.
- `llms.txt`, a plain-text summary of the company, its products and its
  branch network, generated from the same data as the site.

No geo coordinates are published. The map positions in the data are
projected town points, fine for placing a dot and nowhere near good
enough to publish as a branch location. If ICB supplies real coordinates
they belong in the location records and the structured data will carry
them.

### The other build

`build/build-single.js` writes `dist/icb-concept.html`, one file with
everything inlined. That is the preview artifact, and the only build
that works from a `file://` URL or from a host that serves it at some
path of its own, because there is no server there to resolve `/claims`
against. The router notices and keeps hash routing in both cases: a
path it does not recognise is read as the homepage, not as a missing
page.

### Old links still work

`/#/insurance/motor` and the like are understood and still land on the
right page. Anything already sent to the client keeps working.
