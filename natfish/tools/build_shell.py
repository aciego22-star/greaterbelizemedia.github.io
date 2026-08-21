#!/usr/bin/env python3
"""Shared shell for the NATFISH pages: head, header, footer, components.

Imported by build_pages.py. The generated .html files are the deliverable and
can be hand-edited afterwards.

Accuracy tiers used throughout:
  VERIFIED FACT              supported by the research sources in the brief
  DESIGN / COPY TREATMENT    presentation, no factual claim
  CLIENT CONFIRMATION REQ.   never written onto a public page, see INTERNAL-NOTES
"""

from build_icons import icon

SITE = "NATFISH"

# The exact registered name supplied by the client for V2. The earlier build
# carried an apostrophe-and-hyphen spelling of the middle two words, which is
# not how the cooperative writes its own name.
LEGAL = "National Fishermen Producers Cooperative Society Ltd."
# The legal name already ends in a full stop, so anywhere it is followed by
# sentence punctuation we use the trimmed form and add a single period.
LEGAL_NO_DOT = LEGAL.rstrip(".")

# ---------------------------------------------------------------- contacts --
# Client-verified in the V2 update. The V1 build's directory-sourced BTL email
# address and its temporary concept WhatsApp routing number are both retired,
# and neither literal value may reappear anywhere in the project.

GM_NAME = "Ms. Denise O&rsquo;Brien"
GM_TITLE = "General Manager"
GM_EMAIL = "deniseobrien125@gmail.com"

TEL_DISPLAY = "+501 227-3165"
TEL_HREF = "+5012273165"
TEL2_DISPLAY = "+501 227-8039"
TEL2_HREF = "+5012278039"
MOBILE_DISPLAY = "+501 611-4831"
MOBILE_HREF = "+5016114831"
WHATSAPP = "5016114831"

EMAIL = "nationalfishermen@gmail.com"
ADDRESS = "#1 Angel Lane, Belize City, Belize"
MAPS = ("https://www.google.com/maps/search/?api=1&amp;query="
        "%231+Angel+Lane%2C+Belize+City%2C+Belize")

# ------------------------------------------------------------------ facts --
# Every figure below was supplied by the client for V2 and is safe to publish.
# "since 1966" is used in copy rather than a computed age, which would go stale.

FOUNDED_DATE = "29 April 1966"
FOUNDED_ISO = "1966-04-29"
MEMBERS = "636"
COMMITTEE = "seven"
MARKETS = ("the United States, Canada, Mexico, the West Indies, Taiwan "
           "and Australia")

VIDEO_ID = "4FoxQom2WFQ"
VIDEO_TITLE = "The National Fishermen Cooperative of Belize"
VIDEO_SOURCE = "Ocean Link"

SRC_FISHWISE = "https://fishwise.org/dive-deeper/resource/belize-fisheries-the-story-of-the-national-fishermens-cooperative-in-belize/"
SRC_FISHERYPROGRESS = "https://fisheryprogress.org/sites/default/files/documents_tasks/FINAL%20REPORT-NFC-INSTITUTIONAL-STRENGTHENING.pdf"
SRC_FISHSOURCE = "https://www.fishsource.org/fip_page/1184"
SRC_BELTRAIDE = "https://www.facebook.com/BELTRAIDE/"
SRC_FISHERIES_DEPT = "https://www.facebook.com/FisheriesDepartmentBelize/"

NAV = [
    ("Home", "index.html"),
    ("About NATFISH", "about.html"),
    ("Seafood &amp; Services", "seafood-services.html"),
    ("Seafood Seasons", "seafood-seasons.html"),
    ("Responsible Fisheries", "responsible.html"),
    ("What&rsquo;s New", "news.html"),
    ("Gallery", "gallery.html"),
    ("Contact", "contact.html"),
]

BUYER_CTA = "contact.html#buyer-enquiry"

LOGO_ALT = "NATFISH &ndash; National Fishermen Producers Cooperative Society Ltd."

# ----------------------------------------------------------------- images --
# Two tiers, and the distinction is editorial, not technical.
#
# OFFICIAL  ten photographs supplied by the General Manager. These document
#           NATFISH's own people, rooms and product, so their alt text names
#           NATFISH directly.
# PRODUCTS  packaging photographs recreated from an older pamphlet. They are
#           not a record of a specific day or a named person, so their captions
#           stay generic and never assert a date, an employee or a shipment.

OFFICIAL = "assets/img/official"
PRODUCTS = "assets/img/products"

# Intrinsic dimensions of the largest derivative, written by
# tools/process-v2-images.py. Carried into width/height on every <img> so no
# image can shift the layout while it loads.
from v2_dims import DIMS  # noqa: E402

RECREATION_NOTE = (
    "Packaging photography on this page was recreated from NATFISH product "
    "material. It illustrates presentation and format only."
)

ALT = {
    "01-lobster-packing-team-wide":
        "NATFISH workers in hairnets, masks and aprons preparing lobster along a "
        "stainless steel bench in the cooperative&rsquo;s processing room.",
    "02-lobster-packing-line-portrait":
        "NATFISH workers bagging lobster tails and packing them into cartons at "
        "the end of the processing line.",
    "03-lobster-processing-room-wide":
        "A wide view of the NATFISH processing hall, with workers at stainless "
        "benches and packing cartons stacked along the wall.",
    "04-fresh-conch-processing-closeup":
        "Freshly landed queen conch meat spread across a stainless steel table "
        "during processing at NATFISH.",
    "05-lobster-tail-packing-boxes":
        "Individually bagged lobster tails being packed into cartons at NATFISH.",
    "06-lobster-tail-packing-close":
        "A close view of gloved hands placing bagged lobster tails into a carton.",
    "07-lobster-washing-station":
        "NATFISH workers in aprons and gloves rinsing lobster at the stainless "
        "washing station.",
    "08-lobster-weighing-and-sorting":
        "A NATFISH worker weighing lobster on a digital scale beside sorting bins.",
    "09-lobster-processing-table":
        "NATFISH workers sorting whole spiny lobster across a stainless "
        "processing table.",
    "10-cold-storage-room":
        "Racked trays inside the NATFISH cold storage room, cold vapour drifting "
        "between the shelves.",
    "01-belizean-pride-lobster-cases":
        "Cartons of frozen Belizean spiny lobster tails packed for cold storage.",
    "02-belizean-pride-orange-lobster-tails":
        "A carton of individually bagged cooked spiny lobster tails.",
    "03-belizean-pride-raw-lobster-tails":
        "A carton of individually bagged raw spiny lobster tails.",
    "04-wild-caught-frozen-conch":
        "A carton of frozen queen conch meat, bagged for shipping.",
}

# Short labels for the carousel status region and gallery captions.
SHORT = {
    "01-lobster-packing-team-wide": "The packing team at work",
    "02-lobster-packing-line-portrait": "Bagging and boxing lobster tails",
    "03-lobster-processing-room-wide": "Inside the processing room",
    "04-fresh-conch-processing-closeup": "Queen conch during processing",
    "05-lobster-tail-packing-boxes": "Packing lobster tails into cartons",
    "06-lobster-tail-packing-close": "Bagged tails, carton by carton",
    "07-lobster-washing-station": "Rinsing at the washing station",
    "08-lobster-weighing-and-sorting": "Weighing and sorting the catch",
    "09-lobster-processing-table": "Sorting whole spiny lobster",
    "10-cold-storage-room": "The cold storage room",
    "01-belizean-pride-lobster-cases": "Frozen lobster tails, cased",
    "02-belizean-pride-orange-lobster-tails": "Cooked lobster tails, bagged",
    "03-belizean-pride-raw-lobster-tails": "Raw lobster tails, bagged",
    "04-wild-caught-frozen-conch": "Frozen queen conch meat",
}

# Photographs whose subject sits away from the frame centre. Rendered as a
# utility class rather than an inline style so the crop can differ between
# desktop and mobile in the stylesheet.
FOCUS = {
    "01-lobster-packing-team-wide": "focus-left",
    "03-lobster-processing-room-wide": "focus-centre",
    "04-fresh-conch-processing-closeup": "focus-centre",
    "10-cold-storage-room": "focus-top",
}


def img_dir(stem):
    """Authentic photographs live in official/, recreations in products/."""
    return PRODUCTS if "belizean-pride" in stem or "wild-caught" in stem else OFFICIAL


def picture(stem, sizes, css="", *, eager=False, alt=None, full=False,
            ratio=None, focus=None):
    """A responsive <picture>: WebP first, JPEG fallback, three width tiers.

    width/height come from the real derivative rather than a shared constant,
    because the V2 set mixes 1.60 landscape with 0.56 portrait and a single
    assumed height would reserve the wrong box for most of them.

    `ratio` overrides the aspect-ratio the CSS should hold the frame at, for
    the few places where a deliberate crop differs from the file's own shape.
    `focus` sets object-position for a single placement, where the shared
    FOCUS entry for that image is not the right crop for this particular frame.
    """
    alt_text = ALT[stem] if alt is None else alt
    loading = (
        ' loading="eager" fetchpriority="high"'
        if eager
        else ' loading="lazy" decoding="async"'
    )
    w, h = DIMS[stem]
    d = img_dir(stem)

    # Seven of the ten client photographs are portrait. Tagging them lets the
    # stylesheet give a tall photograph a tall frame instead of cover-cropping
    # it into a landscape box, and --ratio carries the file's true shape so the
    # frame can match it exactly rather than settling for one stock ratio.
    portrait = h > w
    classes = [c for c in (css, FOCUS.get(stem, ""),
                           "is-portrait" if portrait else "") if c]
    cls = f' class="{" ".join(classes)}"' if classes else ""
    shape = ratio or f"{w} / {h}"
    decls = [f"--ratio:{shape}"]
    if focus:
        # Per-image crop, set here rather than injected into the tag afterwards
        # so there is only ever one style attribute on the element.
        decls.append(f"object-position:{focus}")
    style = f' style="{";".join(decls)}"'
    # The lightbox reads data-full at click time and shows the image at its
    # natural proportions, so it points at the largest derivative.
    data_full = f' data-full="{d}/{stem}-1400.jpg"' if full else ""

    return f"""<picture>
          <source type="image/webp" srcset="{d}/{stem}-480.webp 480w, {d}/{stem}-800.webp 800w, {d}/{stem}-1400.webp 1400w" sizes="{sizes}">
          <img src="{d}/{stem}-800.jpg" srcset="{d}/{stem}-480.jpg 480w, {d}/{stem}-800.jpg 800w, {d}/{stem}-1400.jpg 1400w" sizes="{sizes}" width="{w}" height="{h}" alt="{alt_text}"{cls}{style}{loading}{data_full}>
        </picture>"""


# The client-approved artwork is 1789x879. Carried as a constant so every
# placement writes the same intrinsic ratio and nothing can reflow while the
# logo loads.
LOGO_W, LOGO_H = 1789, 879

LOGO_SRCSET = ("assets/img/natfish-logo-400.png 400w, "
               "assets/img/natfish-logo-800.png 800w, "
               "assets/img/natfish-logo-1200.png 1200w")


def logo_img(css, sizes):
    """The complete approved lockup: emblem, wordmark and organization name.

    One asset for every placement. The earlier build carried a second, compact
    lockup for the header with the organization name erased, because at header
    scale those lines fall to about 5px. The client has since asked for the
    approved logo whole and unclipped everywhere, so the compact lockup is
    gone and the name is present at every size, small but never cut.

    Legibility never rests on the image alone: the organization name is also
    real selectable text in the footer, in the About identity panel and in
    every page title.
    """
    cls = f' class="{css}"' if css else ""
    return (f'<img{cls} src="assets/img/natfish-logo-800.png"\n'
            f'             srcset="{LOGO_SRCSET}"\n'
            f'             sizes="{sizes}" width="{LOGO_W}" height="{LOGO_H}"\n'
            f'             alt="{LOGO_ALT}">')


def logo_header():
    return f"""<a class="logo" href="index.html">
          {logo_img("", "130px")}
        </a>"""


def logo_full(css="logo-full", width=380):
    return logo_img(css, f"{width}px")


def org_jsonld():
    """Organization data, limited to what the client actually supplied.

    Deliberately absent: aggregateRating, priceRange, hasCredential, makesOffer,
    openingHours and any volume or capacity figure. None of those were supplied,
    and structured data is exactly where an unsupported claim does the most
    damage, because it is machine-read and republished verbatim.
    """
    tel = TEL_HREF
    return f"""  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "{LEGAL}",
    "alternateName": "NATFISH",
    "foundingDate": "{FOUNDED_ISO}",
    "foundingLocation": {{
      "@type": "Place",
      "name": "Belize City, Belize"
    }},
    "address": {{
      "@type": "PostalAddress",
      "streetAddress": "#1 Angel Lane",
      "addressLocality": "Belize City",
      "addressCountry": "BZ"
    }},
    "email": "{EMAIL}",
    "telephone": "{tel}",
    "contactPoint": [
      {{
        "@type": "ContactPoint",
        "contactType": "sales",
        "name": "Primary office",
        "telephone": "{TEL_HREF}",
        "email": "{EMAIL}",
        "availableLanguage": ["en", "es"]
      }},
      {{
        "@type": "ContactPoint",
        "contactType": "customer service",
        "name": "Secondary office",
        "telephone": "{TEL2_HREF}",
        "availableLanguage": ["en", "es"]
      }},
      {{
        "@type": "ContactPoint",
        "contactType": "sales",
        "name": "Mobile and WhatsApp",
        "telephone": "{MOBILE_HREF}",
        "availableLanguage": ["en", "es"]
      }}
    ]
  }}
  </script>
"""


def head(title, description, og_image="official/og-card"):
    """No canonical and no og:url until a real domain exists.

    The V1 build pointed both at the agency's own GitHub Pages domain, which
    must not be associated with the client site. Open Graph carries a relative
    image path, which resolves once the site sits on its real host.
    """
    return f"""<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta name="theme-color" content="#052b45">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="NATFISH">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:image" content="assets/img/{og_image}.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{ALT['01-lobster-packing-team-wide']}">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="icon" type="image/png" href="assets/img/favicon.png">
  <link rel="apple-touch-icon" href="assets/img/natfish-icon.png">

  <!-- Self-hosted Bitter and Source Sans 3. The latin subsets are preloaded
       because they carry the headline and the first paragraph; font-display
       swap means the fallback shows immediately and nothing is ever invisible. -->
  <link rel="preload" href="assets/fonts/bitter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/source-sans-3-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="assets/css/fonts.css">
  <link rel="stylesheet" href="assets/css/natfish.css">
{org_jsonld()}</head>
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
"""


def header(active):
    items = []
    for label, href in NAV:
        current = ' aria-current="page"' if href == active else ""
        items.append(
            f'<li><a class="nav__link" href="{href}"{current}>{label}</a></li>'
        )
    links = "\n            ".join(items)

    return f"""
  <header class="site-header">
    <div class="container header-inner">
      {logo_header()}

      <!-- Language control. Stays between the logo and the hamburger at every
           width, so it is reachable on a phone without opening the menu. -->
      <button class="lang-toggle" type="button" data-lang-toggle
              aria-label="Switch language to Espanol"
              data-label-en="Switch language to Espanol"
              data-label-es="Cambiar idioma a English">
        <span class="lang-toggle__globe" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85"
               stroke-linecap="round" stroke-linejoin="round" focusable="false">
            <circle cx="12" cy="12" r="9"/>
            <path d="M3.2 9.4h17.6M3.2 14.6h17.6"/>
            <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/>
          </svg>
        </span>
        <span class="lang-toggle__label" data-lang-label>English</span>
      </button>

      <button class="nav-toggle" type="button" aria-expanded="false"
              aria-controls="primary-nav" aria-label="Open menu">
        <span class="nav-toggle__bars"></span>
      </button>

      <nav class="nav" id="primary-nav" aria-label="Primary">
        <ul class="nav__list">
            {links}
        </ul>
        <div class="nav__cta">
          <a class="btn btn--primary" href="{BUYER_CTA}">Buyer Enquiry</a>
        </div>
      </nav>

      <div class="header-cta">
        <a class="btn btn--primary btn--sm" href="{BUYER_CTA}">Buyer Enquiry</a>
      </div>
    </div>
  </header>

  <main id="main">
"""


ICON_PIN = icon("pin")
ICON_PHONE = icon("phone")
ICON_MAIL = icon("mail")
ICON_WA = icon("whatsapp")
ICON_ARROW = icon("arrow")


RULE_WAVE = (
    '<svg class="rule-wave" viewBox="0 0 118 8" fill="none" stroke="currentColor" '
    'stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">'
    '<path d="M1 4q7.4-3.6 14.8 0t14.8 0t14.8 0t14.8 0"/>'
    '<path d="M76 4h41" opacity=".45"/></svg>'
)


def identity_ribbon():
    """The registered name, given its own band rather than buried in a photo.

    This is an institutional identifier, not hero copy, so it reads as a
    registry line: legal name, jurisdiction, year of registration. It sits
    between the header and the hero so it supports the logo instead of
    competing with it.
    """
    return f"""
    <div class="identity-ribbon">
      <div class="container identity-ribbon__inner">
        <p class="identity-ribbon__name">{LEGAL}</p>
        <p class="identity-ribbon__meta">
          <span>Belize</span>
          <span class="identity-ribbon__sep" aria-hidden="true"></span>
          <span>Established 1966</span>
        </p>
      </div>
    </div>
"""


def cta_band(eyebrow, heading, copy, actions, *, tone="navy"):
    """Closing call to action.

    Each page closes differently so the same harbour band does not repeat at the
    foot of every page.
    """
    cls = {
        "navy": "section section--navy",
        "sand": "section section--sand",
        "plain": "section",
    }[tone]
    buttons = "\n            ".join(actions)
    return f"""
    <section class="{cls} section--tight cta-band">
      <div class="container container--narrow">
        <div class="section-head section-head--center reveal" style="margin-bottom:0">
          <span class="eyebrow">{eyebrow}</span>
          <h2>{heading}</h2>
          <p class="lede" style="margin-inline:auto">{copy}</p>
          <div class="cta-band__actions">
            {buttons}
          </div>
        </div>
      </div>
    </section>
"""


def contact_strip():
    """Compact contact row. Used on the homepage only."""
    return f"""
    <section class="section section--tight" aria-labelledby="contact-strip-h">
      <div class="container">
        <div class="contact-strip">
          <div class="reveal">
            <span class="eyebrow">Contact</span>
            <h2 id="contact-strip-h" style="margin-bottom:0.35rem">Talk to NATFISH</h2>
            <p class="note" style="margin:0">{ADDRESS}</p>
          </div>
          <ul class="contact-strip__list reveal">
            <li>{icon("coast")}<a href="{MAPS}" target="_blank" rel="noopener noreferrer">{ADDRESS}</a></li>
            <li>{ICON_PHONE}<a href="tel:{TEL_HREF}">{TEL_DISPLAY}</a></li>
            <li>{ICON_WA}<a href="tel:{MOBILE_HREF}">{MOBILE_DISPLAY}</a></li>
            <li>{ICON_MAIL}<a href="mailto:{EMAIL}">{EMAIL}</a></li>
          </ul>
          <div class="reveal">
            <a class="btn btn--primary" href="{BUYER_CTA}">Buyer Enquiry</a>
          </div>
        </div>
      </div>
    </section>
"""


def footer(with_lightbox=False):
    nav_links = "\n            ".join(
        f'<li><a href="{href}">{label}</a></li>' for label, href in NAV[1:]
    )

    lightbox = ""
    if with_lightbox:
        lightbox = """
  <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
    <button class="lightbox__btn lightbox__close" type="button" data-lightbox="close" aria-label="Close viewer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"></path></svg>
    </button>
    <button class="lightbox__btn lightbox__prev" type="button" data-lightbox="prev" aria-label="Previous image">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7"></path></svg>
    </button>
    <button class="lightbox__btn lightbox__next" type="button" data-lightbox="next" aria-label="Next image">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"></path></svg>
    </button>
    <figure class="lightbox__figure">
      <img alt="">
      <figcaption class="lightbox__caption"></figcaption>
    </figure>
  </div>
"""

    return f"""  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-about">
          <div class="footer-logo-panel">
            {logo_full("", 300)}
          </div>
          <p>
            {LEGAL_NO_DOT}. A member-owned Belizean cooperative registered in
            Belize City on {FOUNDED_DATE}, purchasing and marketing the produce of
            {MEMBERS} fishers at home and abroad.
          </p>
        </div>

        <div>
          <h4>Explore</h4>
          <ul class="footer-list">
            {nav_links}
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul class="footer-list footer-list--contact">
            <li><a href="{MAPS}" target="_blank" rel="noopener noreferrer">{ADDRESS}</a></li>
            <li><a href="tel:{TEL_HREF}">{TEL_DISPLAY}</a> <span class="footer-tag">Office</span></li>
            <li><a href="tel:{MOBILE_HREF}">{MOBILE_DISPLAY}</a> <span class="footer-tag">Mobile &amp; WhatsApp</span></li>
            <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
          </ul>
          <p style="margin-top:1rem">
            <a class="btn btn--outline btn--sm btn--onDark" href="{BUYER_CTA}">Buyer Enquiry</a>
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; <span data-year>2026</span> {LEGAL_NO_DOT}.</p>
        <p>Registered in Belize City on {FOUNDED_DATE}.</p>
      </div>

      <!-- Attribution: centred, secondary to NATFISH, and the studio name is
           the only clickable part. -->
      <p class="site-credit">
        <span data-i18n-text="Website designed and developed by">Website designed and developed by</span>
        <a href="https://austereautomations.com/" target="_blank" rel="noopener noreferrer">Austere Automations</a>
      </p>
    </div>
  </footer>
{lightbox}
  <p class="visually-hidden" id="lang-status" role="status" aria-live="polite"></p>

  <script src="assets/js/natfish-strings.js"></script>
  <script src="assets/js/natfish-i18n.js"></script>
  <script src="assets/js/natfish-seasons.js"></script>
  <script src="assets/js/natfish.js"></script>
</body>
</html>
"""


def page_hero(eyebrow, title, lede, crumb):
    return f"""
    <section class="page-hero">
      <span class="page-hero__watermark" aria-hidden="true">NATFISH</span>
      <div class="container">
        <p class="breadcrumb"><a href="index.html">Home</a><span>/</span>{crumb}</p>
        <span class="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p class="lede">{lede}</p>
      </div>
    </section>
"""


def concept_note():
    """Small disclosure placed under image-led sections."""
    return f'<p class="concept-note">{CONCEPT_NOTE}</p>'
