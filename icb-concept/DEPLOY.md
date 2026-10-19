# Deploying the ICB concept

The site is a fully self-contained static folder. No build step, no
server, and no external requests until someone taps Talk to Bee. Any
static host can serve it.

## Two builds, with and without the assistant

    node build/build-variants.js

writes `dist/with-bee/` and `dist/no-bee/`, both from the same source
minutes apart, differing in exactly one thing. Drag either folder onto
Netlify as its own site and ICB can compare them side by side.

Do NOT use Netlify's deploy history for this. Rolling back to an older
deploy also rolls back the boat photograph, the Gallery banner, the
Spanish and the mobile fixes, so the client would be looking at two
different sites and drawing conclusions about the wrong difference. And on
a deploy page in the Netlify dashboard, "Open production deploy" opens
whatever is live now, not the deploy you are looking at; the "Permalink"
link is the one that opens that specific build.

The removal is a subtraction and nothing else: the script tag, the mount
point, `js/assistant.js`, the bee badge and the Talk to Bee stylesheet
section come out, and no file is rewritten to compensate. Two things make
that possible, and they are worth keeping if either is ever refactored:
`js/main.js` starts the assistant only if it is present, and the footer
reserves room for the launcher through `.has-bee`, a class
`js/assistant.js` puts on the document itself.

`scratchpad/check/variants.js` walks every route of both builds in both
languages and fails if anything except the assistant differs.

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

## Pointing icb.austereautomations.com at it

1. In Netlify: Site configuration > Domain management > Add a domain,
   and enter `icb.austereautomations.com`.
2. At your DNS provider for `austereautomations.com`, add a CNAME record:
   - Name/host: `icb`
   - Value/target: your site's `*.netlify.app` hostname
3. Wait for DNS to propagate (usually minutes), then let Netlify
   provision the HTTPS certificate (automatic).

## Updating the site

Re-drop a new ZIP on the same Netlify site (Deploys > drag and drop),
or connect the Git repository for automatic deploys from a branch.

## Notes

- All routes are hash-based (`/#/claims`, `/#/locations`), so no
  redirect rules are needed and every deep link works on any host.
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

Two files name the host and should be pointed at the real domain at the
same time: the `Sitemap:` line in `robots.txt` and the `<loc>` in
`sitemap.xml`.

## Icons and the favicon

The favicon only appears in Google results when the home page is indexed
and both the page and the icon are crawlable. The site ships:

- `favicon.ico` at the root, carrying 16, 32 and 48px. Browsers and
  crawlers probe this path directly, regardless of markup.
- `assets/img/icon-{48,96,144,192,512}.png`, squares in multiples of
  48px, which is the shape Google asks for.
- `assets/img/apple-touch-icon.png` at 180px for iOS home screens.
- `site.webmanifest` listing the PNG set for Android.

All four root files are listed in `SHIP` in `build/build-variants.js`.
A root file that is not in that list does not get deployed, and a
favicon one directory down may as well not exist.

## The deployable folder is now dist/site

    node build/build-static.js

`dist/site` is what goes on Netlify. Drag that folder, not `dist/with-bee`
and not the source directory.

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
- `sitemap.xml` with all 34 URLs and their language pairs.
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

### The other two builds still exist

`build/build-single.js` writes `dist/icb-concept.html`, one file with
everything inlined. That is the preview artifact and the only build that
works from a `file://` URL, because there is no server to resolve a path
against. The router notices and keeps hash routing there.

`build/build-variants.js` writes `dist/with-bee` and `dist/no-bee`.
`build-static.js` runs it and renders from `with-bee`.

### Old links still work

`/#/insurance/motor` and the like are understood and still land on the
right page. Anything already sent to the client keeps working.
