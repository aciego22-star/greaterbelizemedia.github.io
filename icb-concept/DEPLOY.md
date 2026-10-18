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
