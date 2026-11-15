# Working notes for this repository

- The ConfiDent Oral Care site lives in `confident-oral-care/` (see its README). The repository root `index.html` is the Greater Belize Media site; leave it alone unless asked.
- **After every change to the ConfiDent site:** run `npm test`, then `npm run export`, and send the user `confident-oral-care/deliverables/confident-oral-care-netlify.zip`. The user uploads that zip to Netlify from their phone, so it must stay a flat zip (site files at the root, no wrapping folder) that deploys as-is.
- The user reviews on a phone where HTML files show as source code. For visual review, also regenerate and send the PDF walkthrough (`npm start` on a clean `data/` folder, then `npm run walkthrough`).
- Without an API key, preview builds run confident AI in demo mode (scripted replies, real booking system). Don't present demo mode as Claude.
