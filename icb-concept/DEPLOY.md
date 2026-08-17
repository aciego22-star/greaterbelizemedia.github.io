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
