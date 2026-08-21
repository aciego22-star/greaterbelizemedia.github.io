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
LEGAL = "National Fishermen Producers' Co-operative Society Ltd."
# The legal name already ends in a full stop, so anywhere it is followed by
# sentence punctuation we use the trimmed form and add a single period.
LEGAL_NO_DOT = LEGAL.rstrip(".")

# Provisional public-directory details, pending client confirmation.
TEL_DISPLAY = "+501 227-3165"
TEL_HREF = "+5012273165"
EMAIL = "natfish@btl.net"
ADDRESS = "Angel Lane, Belize City, Belize"
MAPS = "https://www.google.com/maps/search/?api=1&query=Angel+Lane%2C+Belize+City%2C+Belize"

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

LOGO_ALT = "NATFISH &ndash; National Fishermen Producers' Co-operative Society Ltd."

IMG_H = 787
IMG_W = 1400

CONCEPT_NOTE = (
    "Photography on this page is concept imagery prepared for the website "
    "presentation. It does not depict identified NATFISH members, staff, "
    "vessels or facilities."
)

# Alt text describes only what is visible. Nothing is described as a named
# NATFISH person, vessel, facility or piece of equipment.
ALT = {
    "img01": "Two fishers working with lobster traps aboard a small open skiff on calm Caribbean water at sunrise.",
    "img03": "A fisher seated in a skiff on turquoise water with a morning harvest of queen conch aboard.",
    "img04": "Three Caribbean spiny lobsters presented whole on crushed ice.",
    "img05": "Close-up of cleaned conch meat laid out on a stainless steel table during handling.",
    "img06": "Workers in hairnets, masks and gloves grading shrimp, fish and lobster in a clean processing room.",
    "img07": "A worker at a dockside table entering catch information on a tablet beside tagged fish and lobster.",
    "img08": "A lined export box packed with snapper, fillets, scallops and spiny lobster on ice at a dock.",
    "img09": "A spread of Belizean seafood including spiny lobster, queen conch, snapper and reef fish on ice by the sea.",
    "img10": "A fishing skiff heading up the waterway past moored boats and the Belize City waterfront.",
}

# Short labels used by the carousel status region and gallery captions.
SHORT = {
    "img01": "Fishers hauling lobster traps at sunrise",
    "img03": "A morning conch harvest aboard a skiff",
    "img04": "Caribbean spiny lobster on ice",
    "img05": "Cleaned conch meat during handling",
    "img06": "Grading seafood in a processing room",
    "img07": "Recording catch information dockside",
    "img08": "A packed export box of Belizean seafood",
    "img09": "Belizean lobster, conch and reef fish",
    "img10": "A skiff on the Belize City waterfront",
}


def picture(stem, sizes, css="", *, eager=False, alt=None, height=IMG_H,
            full=False):
    """A responsive <picture> with WebP first and a JPEG fallback."""
    alt_text = ALT[stem] if alt is None else alt
    loading = (
        ' loading="eager" fetchpriority="high"'
        if eager
        else ' loading="lazy" decoding="async"'
    )
    cls = f' class="{css}"' if css else ""
    data_full = f' data-full="assets/img/{stem}-1400.jpg"' if full else ""
    return f"""<picture>
          <source type="image/webp" srcset="assets/img/{stem}-800.webp 800w, assets/img/{stem}-1400.webp 1400w" sizes="{sizes}">
          <img src="assets/img/{stem}-1400.jpg" srcset="assets/img/{stem}-800.jpg 800w, assets/img/{stem}-1400.jpg 1400w" sizes="{sizes}" width="{IMG_W}" height="{height}" alt="{alt_text}"{cls}{loading}{data_full}>
        </picture>"""


def logo_header():
    """Compact lockup: the circular mark plus the NATFISH wordmark.

    The full logo's legal-name lines are 6.1% of its height, so at header scale
    they fall under 5px and cannot be read. The complete logo runs large in the
    footer and on the About page instead, and the legal name is also present as
    real text in the footer.
    """
    return f"""<a class="logo" href="index.html">
          <img src="assets/img/natfish-logo-mark.png"
               srcset="assets/img/natfish-logo-mark.png 360w, assets/img/natfish-logo-mark@2x.png 720w"
               sizes="110px" width="360" height="183"
               alt="{LOGO_ALT}">
        </a>"""


def logo_full(css="logo-full", width=520):
    """The complete horizontal logo, used only where the legal name is legible."""
    return f"""<img class="{css}" src="assets/img/natfish-logo.png"
             srcset="assets/img/natfish-logo.png 520w, assets/img/natfish-logo@2x.png 1040w"
             sizes="{width}px" width="520" height="262" alt="{LOGO_ALT}">"""


def head(title, description, og_image="img01"):
    """No canonical and no og:url until a real domain exists.

    The previous build pointed both at the agency's own GitHub Pages domain,
    which must not be associated with the client site.
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
  <meta property="og:image" content="assets/img/{og_image}-1400.jpg">
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
</head>
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
            <p class="note" style="margin:0">Provisional details, pending confirmation.</p>
          </div>
          <ul class="contact-strip__list reveal">
            <li>{icon("coast")}<a href="{MAPS}" target="_blank" rel="noopener noreferrer">{ADDRESS}</a></li>
            <li>{ICON_PHONE}<a href="tel:{TEL_HREF}">{TEL_DISPLAY}</a></li>
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
            {LEGAL_NO_DOT}. A Belizean fisher-owned cooperative registered in 1966,
            connecting fishing communities, quality seafood and markets at home
            and abroad.
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
          <ul class="footer-list">
            <li><a href="{MAPS}" target="_blank" rel="noopener noreferrer">{ADDRESS}</a></li>
            <li><a href="tel:{TEL_HREF}">{TEL_DISPLAY}</a></li>
            <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
          </ul>
          <p style="margin-top:1rem">
            <a class="btn btn--outline btn--sm btn--onDark" href="{BUYER_CTA}">Buyer Enquiry</a>
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; <span data-year>2026</span> {LEGAL_NO_DOT}.</p>
        <p>Registered 1966. Belize City, Belize.</p>
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
