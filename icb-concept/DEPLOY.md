# Deploying the ICB concept

The site is a fully self-contained static folder. No build step, no
server, no external requests. Any static host can serve it.

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
