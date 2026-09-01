# OWM Hospital Website

A standalone static website for OWM Hospital, built by Greater Belize Media.
This folder is completely self-contained — it does not depend on anything else
in this repository.

## Pages

- `index.html` — Home (hero, services overview, doctors preview, stats)
- `about.html` — About Us (story, mission & values, visiting hours)
- `services.html` — Services & Departments (full list with hours)
- `doctors.html` — Our Doctors (team cards)
- `contact.html` — Contact & Appointments (Netlify-powered appointment form, contact info, map placeholder)
- `thank-you.html` — Form success page

## Deploying to Netlify (drag & drop)

1. Download this `owm-hospital` folder to your computer.
2. Go to https://app.netlify.com/drop (log in first).
3. Drag the entire `owm-hospital` folder onto the drop zone.
4. Netlify publishes the site instantly and gives you a URL. Rename the site
   or attach a custom domain from Site settings.

## Appointment form (Netlify Forms)

The form on `contact.html` uses Netlify Forms (`data-netlify="true"`), which
works automatically once the site is hosted on Netlify — no backend needed.
Submissions appear in the Netlify dashboard under **Forms → appointment**.
You can add email notifications under Forms → Notifications.

Note: Netlify Forms only works on Netlify hosting. If you preview locally the
form will not submit.

## Placeholders to replace before launch

- Phone number `(501) 000-0000` (appears on every page — search & replace)
- Email `info@owmhospital.com`
- Address "Main Street, Your Town, Belize"
- Doctor names, specialties, and bios (emoji placeholders stand in for photos)
- Department hours on `services.html` and visiting hours on `about.html`
- Stats on the home page (doctors count, patients served, years)
- Map placeholder on `contact.html` — swap in a Google Maps embed iframe
