#!/usr/bin/env python3
"""Generate the NATFISH static pages.

Every institutional statement traces to the verified research in the build
brief. Nothing unconfirmed is written as current fact; open items live in
INTERNAL-NOTES.md under CLIENT CONFIRMATION REQUIRED.
"""
import pathlib
from urllib.parse import quote

from build_icons import icon
from build_seasons import (
    FISHERIES_SOURCE, LAST_REVIEW, PAGE_NOTE, cards as season_cards,
)
from build_shell import (
    ADDRESS, BUYER_CTA, EMAIL, ICON_ARROW, ICON_MAIL, ICON_PHONE, ICON_PIN,
    ICON_WA, LEGAL, MAPS, SHORT, TEL_DISPLAY, TEL_HREF, VIDEO_ID, VIDEO_SOURCE,
    VIDEO_TITLE, SRC_BELTRAIDE, SRC_FISHERIES_DEPT, SRC_FISHERYPROGRESS,
    SRC_FISHSOURCE, SRC_FISHWISE, RULE_WAVE, concept_note, contact_strip, cta_band,
    footer, head, header, identity_ribbon, logo_full, page_hero, picture,
)

OUT = pathlib.Path("/home/user/greaterbelizemedia.github.io/natfish")

# ---------------------------------------------------------------- icons --

# Feature icons are subject-specific: each one is drawn for the heading it sits
# beside, and none is reused for a second idea.
ICON_PLAY = icon("play")
ICON_CHECK = """<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4.5 12.6 5.2 5.2L19.5 7.4"/></svg>"""

# ------------------------------------------------------ enquiry links --

EMAIL_SUBJECT = "NATFISH Buyer Enquiry"
EMAIL_BODY = """Hello NATFISH,

I would like to enquire about purchasing seafood.

Name:
Company:
Country or location:
Product or species required:
Approximate quantity:
Preferred timeframe:
Packaging or preparation requirements:
Destination or delivery location:
Telephone or WhatsApp:
Additional information:

Thank you."""

WHATSAPP_BODY = """Hello NATFISH. I would like to make a seafood enquiry.

Name:
Company:
Location:
Product or species required:
Approximate quantity:
Preferred timeframe:
Additional information:"""

# TEMPORARY CONCEPT WHATSAPP NUMBER — REPLACE WITH CLIENT-CONFIRMED NATFISH
# NUMBER BEFORE PUBLIC LAUNCH. Routing number for the concept build only. It is
# not published anywhere as a NATFISH telephone number.
WHATSAPP_NUMBER = "5016108859"


def mailto_href():
    """RFC 6068 mailto. The visitor can edit everything before sending."""
    return (
        f"mailto:{EMAIL}"
        f"?subject={quote(EMAIL_SUBJECT, safe='')}"
        f"&amp;body={quote(EMAIL_BODY, safe='')}"
    )


def whatsapp_href():
    return f"https://wa.me/{WHATSAPP_NUMBER}?text={quote(WHATSAPP_BODY, safe='')}"


# ---------------------------------------------------------- news data --

# Three publicly sourced items. No dates, quotes, speakers or outcomes are
# added beyond what the sources support.
UPDATES = [
    {
        "tag": "Trade &amp; Markets",
        "title": "Belizean seafood featured in 2026 trade promotion",
        "date": "2026",
        "img": "img09",
        "body": (
            "Current trade-promotion material from BELTRAIDE features seafood "
            "from National Fishermen, keeping Belizean product visible to "
            "international trade audiences."
        ),
        "source": "BELTRAIDE public trade-promotion content",
        "url": SRC_BELTRAIDE,
    },
    {
        "tag": "Sector Activity",
        "title": "National Fishermen active across the 2026 fisheries sector",
        "date": "2026",
        "img": "img10",
        "body": (
            "Public fisheries-sector activity in 2026 continues to reference "
            "National Fishermen as an active cooperative within Belize's "
            "fishing community."
        ),
        "source": "Belize Fisheries Department public updates",
        "url": SRC_FISHERIES_DEPT,
    },
    {
        "tag": "Responsible Fisheries",
        "title": "Traceability and the spiny lobster Fishery Improvement Project",
        "date": "Ongoing",
        "img": "img07",
        "body": (
            "National Fishermen has participated in electronic catch "
            "documentation and in Belize's spiny lobster Fishery Improvement "
            "Project, both aimed at better information and better management."
        ),
        "source": "FishSource Belize spiny lobster FIP",
        "url": SRC_FISHSOURCE,
    },
]


def update_card(u, *, compact=False):
    media = ""
    if not compact:
        sizes = "(max-width: 640px) 92vw, (max-width: 900px) 46vw, 30vw"
        media = f'<div class="update-card__media">{picture(u["img"], sizes)}</div>'
    return f"""<article class="update-card reveal">
            {media}
            <div class="update-card__body">
              <p class="update-card__meta">
                <span class="update-card__tag">{u['tag']}</span>
                <span class="update-card__date">{u['date']}</span>
              </p>
              <h3>{u['title']}</h3>
              <p>{u['body']}</p>
              <p class="update-card__source">
                Source: <a href="{u['url']}" target="_blank" rel="noopener noreferrer">{u['source']}</a>
              </p>
            </div>
          </article>"""


# ================================================================ home ===

def home():
    # Each slide gets its own focal point. One universal crop pushed the
    # fishers out of frame on the portrait-ish mobile panel.
    slides = [
        ("img01", "58% 52%"),   # the two fishers and the traps, right of centre
        ("img03", "62% 46%"),   # the fisher and the conch pile
        ("img10", "50% 58%"),   # the skiff heading up the waterway
    ]
    slide_html = []
    for i, (stem, focus) in enumerate(slides):
        active = " is-active" if i == 0 else ""
        img = picture(
            stem, "(max-width: 900px) 100vw, 60vw",
            eager=(i == 0), alt=SHORT[stem],
        ).replace("<img ", f'<img style="object-position:{focus}" ')
        slide_html.append(
            f"""<div class="hero__slide{active}">
            {img}
          </div>"""
        )

    return (
        head(
            "NATFISH | National Fishermen Producers' Co-operative Society Ltd.",
            "A Belizean fisher-owned cooperative registered in 1966, connecting "
            "fishing communities, quality seafood and markets at home and abroad.",
        )
        + header("index.html")
        + identity_ribbon()
        + f"""
    <section class="hero" data-carousel aria-label="NATFISH">
      <div class="hero__panel">
        <div class="hero__content">
          <p class="hero__eyebrow"><strong>NATFISH</strong> <span class="hero__eyebrow-sep" aria-hidden="true">|</span> Belizean fisher-owned cooperative</p>
          <h1>From Belize's waters to the world.</h1>
          <p class="hero__copy">
            A cooperative owned by the fishers who make it up, connecting
            fishing communities, quality seafood and markets at home and
            abroad.
          </p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="seafood-services.html">Seafood &amp; Services</a>
            <a class="btn btn--ghost" href="{BUYER_CTA}">Buyer Enquiry</a>
          </div>
        </div>
      </div>

      <div class="hero__media" data-carousel-viewport>
        {"".join(slide_html)}
      </div>
    </section>

    <div class="trust">
      <div class="container">
        <ul class="trust__list">
          <li class="trust__item">{icon("seal")} Established 1966</li>
          <li class="trust__item">{icon("boat")} Belizean Fishers' Cooperative</li>
          <li class="trust__item">{icon("coast")} Belize City</li>
        </ul>
      </div>
    </div>

    <section class="section" aria-labelledby="home-about-h">
      <div class="container">
        <div class="split">
          <div class="reveal">
            <span class="eyebrow">About NATFISH</span>
            <h2 id="home-about-h">A cooperative owned by Belizean fishers</h2>
            <p class="lede">
              Founded in 1966, {LEGAL} is a Belizean fisher-owned cooperative.
              Its members form the foundation of the organization and elect the
              managing committee that oversees the Society.
            </p>
            <a class="arrow-link" href="about.html">About NATFISH</a>
          </div>
          <div class="split__media reveal">
            {picture("img03", "(max-width: 860px) 92vw, 46vw")}
          </div>
        </div>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="home-seafood-h">
      <div class="container">
        <div class="section-head section-head--rule reveal">
          {RULE_WAVE}
          <span class="eyebrow">Seafood &amp; Services</span>
          <h2 id="home-seafood-h">Seafood from Belizean waters</h2>
          <p class="lede">
            Lobster and conch are longstanding products associated with the
            cooperative's fishing, processing and market activity. Availability
            is confirmed directly with NATFISH.
          </p>
        </div>

        <div class="grid grid--3">
          <article class="card reveal">
            <div class="card__media">{picture("img04", "(max-width: 640px) 92vw, (max-width: 900px) 46vw, 30vw")}</div>
            <div class="card__body">
              <h3>Lobster</h3>
              <p>Caribbean spiny lobster, a longstanding cooperative product.</p>
              <a class="arrow-link" href="seafood-services.html">See lobster</a>
            </div>
          </article>

          <article class="card reveal">
            <div class="card__media">{picture("img05", "(max-width: 640px) 92vw, (max-width: 900px) 46vw, 30vw")}</div>
            <div class="card__body">
              <h3>Conch</h3>
              <p>Queen conch, handled and prepared for market.</p>
              <a class="arrow-link" href="seafood-services.html">See conch</a>
            </div>
          </article>

          <article class="card reveal">
            <div class="card__media">{picture("img09", "(max-width: 640px) 92vw, (max-width: 900px) 46vw, 30vw")}</div>
            <div class="card__body">
              <h3>Other products</h3>
              <p>Availability upon enquiry. The team confirms what is available.</p>
              <a class="arrow-link" href="seafood-services.html">Seafood &amp; Services</a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="season-feature" aria-labelledby="home-seasons-h">
      <div class="season-feature__media">
        {picture("img04", "(max-width: 900px) 100vw, 52vw").replace("<img ", '<img style="object-position:50% 55%" ')}
      </div>
      <div class="season-feature__panel">
        <div class="season-feature__inner">
          <p class="hero__eyebrow">Seafood Seasons</p>
          <h2 id="home-seasons-h">Know the Season. Protect the Future.</h2>
          <p class="hero__copy">
            Belize closes its lobster and conch fisheries every year so stocks
            can breed. Those closed seasons are what keep the fishery, and the
            livelihoods built on it, working season after season.
          </p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="seafood-seasons.html">View Seafood Seasons</a>
            <a class="btn btn--ghost" href="{BUYER_CTA}">Check Current Availability</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--navy" aria-labelledby="home-resp-h">
      <div class="container">
        <div class="split split--media-right">
          <div class="split__media reveal">
            {picture("img07", "(max-width: 860px) 92vw, 46vw")}
          </div>
          <div class="reveal">
            <span class="eyebrow">Responsible Fisheries</span>
            <h2 class="h-icon" id="home-resp-h">{icon("steward", "h-icon__mark")} Careful handling and good information</h2>
            <p class="lede">
              NATFISH has participated in electronic catch-documentation and
              traceability initiatives, and in Belize's spiny lobster Fishery
              Improvement Project alongside sector partners.
            </p>
            <a class="arrow-link" href="responsible.html">Responsible Fisheries</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="home-news-h">
      <div class="container">
        <div class="section-head section-head--split reveal">
          <div>
            <span class="eyebrow">What&rsquo;s New</span>
            <h2 class="h-icon" id="home-news-h">{icon("news", "h-icon__mark")} Latest updates</h2>
          </div>
          <a class="arrow-link" href="news.html">All updates</a>
        </div>
        <div class="grid grid--2">
          {update_card(UPDATES[0])}
          {update_card(UPDATES[1])}
        </div>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="home-gallery-h">
      <div class="container">
        <div class="section-head section-head--split reveal">
          <div>
            <span class="eyebrow">Gallery</span>
            <h2 class="h-icon" id="home-gallery-h">{icon("gallery", "h-icon__mark")} The work, the water and the product</h2>
          </div>
          <a class="arrow-link" href="gallery.html">View the gallery</a>
        </div>
        <a class="gallery-preview reveal" href="gallery.html"
           aria-label="View the NATFISH gallery">
          {picture("img01", "(max-width: 700px) 46vw, 24vw")}
          {picture("img06", "(max-width: 700px) 46vw, 24vw")}
          {picture("img08", "(max-width: 700px) 46vw, 24vw")}
          {picture("img10", "(max-width: 700px) 46vw, 24vw")}
        </a>
      </div>
    </section>
"""
        + cta_band(
            "For Buyers",
            "Looking to source Belizean seafood?",
            "Tell NATFISH what you need and the team will review your enquiry "
            "and come back to you on availability and next steps.",
            [
                f'<a class="btn btn--primary" href="{BUYER_CTA}">Buyer Enquiry</a>',
                f'<a class="btn btn--ghost" href="seafood-services.html">Seafood &amp; Services</a>',
            ],
        )
        + contact_strip()
        + footer()
    )


# =============================================================== about ===

def about():
    return (
        head(
            "About NATFISH | National Fishermen Producers' Co-operative Society Ltd.",
            "National Fishermen Producers' Co-operative Society Ltd. was "
            "registered on 29 April 1966. A fisher-owned Belizean cooperative "
            "governed by a managing committee elected by its members.",
            og_image="img03",
        )
        + header("about.html")
        + page_hero(
            "About NATFISH",
            "A fisher-owned society, registered in 1966",
            "NATFISH was built so that Belizean fishers could combine their "
            "effort and reach markets no single fisher could reach alone.",
            "About NATFISH",
        )
        + f"""
    <section class="section">
      <div class="container">
        <div class="identity-panel reveal">
          {logo_full("logo-full", 420)}
          <div>
            <span class="eyebrow">Legal name</span>
            <p class="lede" style="margin-bottom:0.4rem">{LEGAL}</p>
            <p class="note" style="margin:0">
              NATFISH is the working digital name for the Society.
            </p>
          </div>
        </div>

        <div class="split" style="margin-top:clamp(2.5rem,5vw,4rem)">
          <div class="reveal">
            <span class="eyebrow">History</span>
            <h2>Registered on 29 April 1966</h2>
            <p class="stat-line">29 April 1966.</p>
            <p>
              The Society and its by-laws were registered on 29 April 1966. From
              that point National Fishermen has operated as a fisher-owned
              cooperative in Belize, with its members at the centre of the
              organization.
            </p>
            <p>
              The cooperative's stated objects include helping members produce,
              process, market, distribute and sell their products more
              efficiently. That purpose still describes what the Society does.
            </p>
          </div>
          <div class="reveal">
            <ul class="factlist">
              <li>
                <span class="factlist__key">Registered</span>
                <span class="factlist__val">29 April 1966</span>
              </li>
              <li>
                <span class="factlist__key">Ownership</span>
                <span class="factlist__val">Fisher-owned cooperative</span>
              </li>
              <li>
                <span class="factlist__key">Governance</span>
                <span class="factlist__val">Managing committee elected by members</span>
              </li>
              <li>
                <span class="factlist__key">Base</span>
                <span class="factlist__val">Belize City, Belize</span>
              </li>
            </ul>
            <p class="note" style="margin-top:1rem">
              Sources:
              <a href="{SRC_FISHERYPROGRESS}" target="_blank" rel="noopener noreferrer">FisheryProgress institutional strengthening report</a>
              and
              <a href="{SRC_FISHWISE}" target="_blank" rel="noopener noreferrer">FishWise</a>.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="about-model-h">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">The cooperative model</span>
          <h2 id="about-model-h">Members own it, and members govern it</h2>
          <p class="lede">
            NATFISH is owned by the fishers who make it up. Members elect a
            managing committee, and that committee serves as the board
            overseeing the Society.
          </p>
        </div>

        <ol class="flow reveal">
          <li class="flow__step">
            <span class="flow__num">01</span>
            <span class="flow__label">Fishers</span>
            <span class="flow__note">Members harvest in Belizean waters</span>
          </li>
          <li class="flow__step">
            <span class="flow__num">02</span>
            <span class="flow__label">Cooperative</span>
            <span class="flow__note">Members combine effort and reach</span>
          </li>
          <li class="flow__step">
            <span class="flow__num">03</span>
            <span class="flow__label">Processing</span>
            <span class="flow__note">Handling, grading and preparation</span>
          </li>
          <li class="flow__step">
            <span class="flow__num">04</span>
            <span class="flow__label">Market</span>
            <span class="flow__note">Buyers at home and abroad</span>
          </li>
        </ol>
      </div>
    </section>

    <section class="section" aria-labelledby="about-fishers-h">
      <div class="container">
        <div class="split split--media-right">
          <div class="split__media reveal">{picture("img01", "(max-width: 860px) 92vw, 46vw")}</div>
          <div class="reveal">
            <span class="eyebrow">The fishermen behind NATFISH</span>
            <h2 class="h-icon" id="about-fishers-h">{icon("net", "h-icon__mark")} Behind every product is a fishing community</h2>
            <p class="lede">
              NATFISH was built around the cooperative model, creating a
              collective structure through which Belizean fishers can connect
              their work at sea with processing and market opportunities.
            </p>
            <p>
              A cooperative gives a fisher more than a buyer for the day's
              catch. It gives a share in the organization, a vote in how it is
              run, and a route to markets that would otherwise be out of reach.
            </p>
            {concept_note()}
          </div>
        </div>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="about-mile-h">
      <div class="container container--narrow">
        <div class="section-head reveal">
          <span class="eyebrow">Milestones</span>
          <h2 id="about-mile-h">Sourced milestones</h2>
          <p class="lede">
            Only milestones supported by the public record are listed. Further
            history will be added once NATFISH confirms it.
          </p>
        </div>
        <ol class="timeline reveal">
          <li>
            <span class="timeline__year">1966</span>
            <div>
              <h3>The Society is registered</h3>
              <p>
                The Society and its by-laws are registered on 29 April 1966.
              </p>
              <p class="note">
                Source: <a href="{SRC_FISHERYPROGRESS}" target="_blank" rel="noopener noreferrer">FisheryProgress</a>
              </p>
            </div>
          </li>
          <li>
            <span class="timeline__year">Ongoing</span>
            <div>
              <h3>Traceability and catch documentation</h3>
              <p>
                NATFISH has participated in electronic catch-documentation and
                seafood traceability initiatives with fisheries partners.
              </p>
              <p class="note">
                Source: <a href="{SRC_FISHWISE}" target="_blank" rel="noopener noreferrer">FishWise</a>
              </p>
            </div>
          </li>
          <li>
            <span class="timeline__year">Ongoing</span>
            <div>
              <h3>Spiny lobster Fishery Improvement Project</h3>
              <p>
                NATFISH has participated in Belize's spiny lobster Fishery
                Improvement Project alongside sector partners.
              </p>
              <p class="note">
                Source: <a href="{SRC_FISHSOURCE}" target="_blank" rel="noopener noreferrer">FishSource</a>
              </p>
            </div>
          </li>
        </ol>
      </div>
    </section>
"""
        + cta_band(
            "Next",
            "See what the cooperative brings to market",
            "Lobster, conch and the cooperative functions that carry a member's "
            "catch from the water to a buyer.",
            [
                '<a class="btn btn--primary" href="seafood-services.html">Seafood &amp; Services</a>',
                f'<a class="btn btn--ghost" href="{BUYER_CTA}">Buyer Enquiry</a>',
            ],
        )
        + footer()
    )


# ==================================================== seafood-services ===

def seafood_services():
    return (
        head(
            "Seafood &amp; Services | NATFISH",
            "Lobster and conch are longstanding NATFISH products. Other seafood "
            "is available upon enquiry. Products, quantities and availability "
            "are confirmed directly with NATFISH.",
            og_image="img09",
        )
        + header("seafood-services.html")
        + page_hero(
            "Seafood &amp; Services",
            "Seafood, and the cooperative behind it",
            "What NATFISH brings to market, and the cooperative functions that "
            "carry a member's catch from the water to a buyer.",
            "Seafood &amp; Services",
        )
        + f"""
    <div class="container">
      <p class="notice reveal">
        <strong>Please note.</strong> Products, quantities, formats and
        availability change with the season and the fishery. Everything on this
        page is confirmed directly with NATFISH before any commitment is made.
      </p>
    </div>

    <div class="container">
      <div class="season-callout reveal">
        <p>
          Availability changes with the season and the fishery. View Belize's
          standard seafood seasons before making an enquiry.
        </p>
        <div class="season-callout__actions">
          <a class="btn btn--primary btn--sm" href="seafood-seasons.html">View Seafood Seasons</a>
          <a class="btn btn--outline btn--sm" href="{BUYER_CTA}">Ask NATFISH What Is Available</a>
        </div>
      </div>
    </div>

    <section class="section" aria-labelledby="sf-lobster-h">
      <div class="container">
        <div class="split">
          <div class="split__media reveal">{picture("img04", "(max-width: 860px) 92vw, 46vw")}</div>
          <div class="reveal">
            <span class="eyebrow">Product</span>
            <h2 class="h-icon" id="sf-lobster-h">{icon("lobster", "h-icon__mark")} Lobster</h2>
            <p class="lede">
              Caribbean spiny lobster is a longstanding product associated with
              NATFISH's fishing, processing and market activity.
            </p>
            <p>
              Lobster is also the focus of Belize's spiny lobster Fishery
              Improvement Project, in which NATFISH has participated alongside
              sector partners.
            </p>
            <a class="arrow-link" href="{BUYER_CTA}">Enquire about lobster</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="sf-conch-h">
      <div class="container">
        <div class="split split--media-right">
          <div class="split__media reveal">{picture("img05", "(max-width: 860px) 92vw, 46vw")}</div>
          <div class="reveal">
            <span class="eyebrow">Product</span>
            <h2 class="h-icon" id="sf-conch-h">{icon("conch", "h-icon__mark")} Conch</h2>
            <p class="lede">
              Queen conch is a longstanding product associated with NATFISH's
              fishing, processing and market activity.
            </p>
            <p>
              Conch requires careful cleaning and handling between landing and
              market. That handling is part of what the cooperative structure
              was built to support.
            </p>
            <a class="arrow-link" href="{BUYER_CTA}">Enquire about conch</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="sf-other-h">
      <div class="container">
        <div class="split">
          <div class="split__media reveal">{picture("img09", "(max-width: 860px) 92vw, 46vw")}</div>
          <div class="reveal">
            <span class="eyebrow">Product</span>
            <h2 class="h-icon" id="sf-other-h">{icon("crate-fish", "h-icon__mark")} Other seafood: availability upon enquiry</h2>
            <p class="lede">
              NATFISH does not publish a standing species list. Other seafood is
              available upon enquiry.
            </p>
            <p>
              Tell the team what you are looking for and they will confirm what
              is available, in what form, and when.
            </p>
            <a class="arrow-link" href="{BUYER_CTA}">Ask what is available</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--navy" aria-labelledby="sf-services-h">
      <div class="container">
        <div class="section-head section-head--center reveal">
          {RULE_WAVE}
          <span class="eyebrow">Cooperative functions</span>
          <h2 id="sf-services-h">What the cooperative does for its members</h2>
          <p class="lede">
            The Society's stated objects are to help members produce, process,
            market, distribute and sell their products more efficiently. Those
            five functions are what NATFISH exists to carry out.
          </p>
        </div>

        <div class="grid grid--3">
          <div class="pillar pillar--center reveal">
            <span class="pillar__icon">{icon("net")}</span>
            <h3>Produce and process</h3>
            <p>
              Members harvest in Belizean waters, and the cooperative supports
              the handling and preparation that follows a landing.
            </p>
          </div>
          <div class="pillar pillar--center reveal">
            <span class="pillar__icon">{icon("route")}</span>
            <h3>Market and distribute</h3>
            <p>
              The Society brings members' product to market collectively,
              reaching buyers that an individual fisher could not reach alone.
            </p>
          </div>
          <div class="pillar pillar--center reveal">
            <span class="pillar__icon">{icon("handling")}</span>
            <h3>Sell on members' behalf</h3>
            <p>
              Selling through the cooperative is the mechanism that turns a
              member's catch into income and keeps the Society running.
            </p>
          </div>
        </div>

        <p class="lede reveal" style="margin-top:2.25rem;text-align:center">
          Source:
          <a href="{SRC_FISHERYPROGRESS}" target="_blank" rel="noopener noreferrer">FisheryProgress institutional strengthening report</a>.
        </p>
      </div>
    </section>
"""
        + cta_band(
            "For Buyers",
            "Tell NATFISH what you need",
            "Send the product, quantity, location and timeframe you are working "
            "to, and the team will come back to you on availability.",
            [
                f'<a class="btn btn--primary" href="{BUYER_CTA}">Buyer Enquiry</a>',
                '<a class="btn btn--ghost" href="responsible.html">Responsible Fisheries</a>',
            ],
        )
        + footer()
    )


# ========================================================= responsible ===

def responsible():
    return (
        head(
            "Responsible Fisheries | NATFISH",
            "Quality handling, participation in electronic catch documentation "
            "and seafood traceability initiatives, and participation in Belize's "
            "spiny lobster Fishery Improvement Project.",
            og_image="img07",
        )
        + header("responsible.html")
        + page_hero(
            "Responsible Fisheries",
            "Careful handling and better information",
            "How the cooperative works with its product, its records and the "
            "wider management of Belize's fisheries.",
            "Responsible Fisheries",
        )
        + f"""
    <section class="section" aria-labelledby="rf-quality-h">
      <div class="container">
        <div class="split">
          <div class="split__media reveal">{picture("img06", "(max-width: 860px) 92vw, 46vw")}</div>
          <div class="reveal">
            <span class="eyebrow">Quality</span>
            <h2 class="h-icon" id="rf-quality-h">{icon("handling", "h-icon__mark")} Handling that protects the product</h2>
            <p class="lede">
              NATFISH has a long-standing focus on processing, quality control
              and market access.
            </p>
            <p>
              Seafood is only as good as the care it receives between the water
              and the buyer. Consistent handling, grading and cold-chain
              discipline are what let a small fishing nation compete on quality.
            </p>
            {concept_note()}
          </div>
        </div>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="rf-trace-h">
      <div class="container">
        <div class="split split--media-right">
          <div class="split__media reveal">{picture("img07", "(max-width: 860px) 92vw, 46vw")}</div>
          <div class="reveal">
            <span class="eyebrow">Traceability</span>
            <h2 class="h-icon" id="rf-trace-h">{icon("tag", "h-icon__mark")} Knowing where the catch came from</h2>
            <p class="lede">
              NATFISH has participated in electronic catch-documentation and
              traceability initiatives designed to improve operational
              efficiency and seafood information through the supply chain.
            </p>
            <p>
              Good catch information helps the cooperative run more efficiently
              and helps buyers understand what they are purchasing. It is a
              practical tool as much as a compliance one.
            </p>
            <p class="note">
              Source:
              <a href="{SRC_FISHWISE}" target="_blank" rel="noopener noreferrer">FishWise, the story of the National Fishermen's Cooperative in Belize</a>.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="rf-fip-h">
      <div class="container">
        <div class="split">
          <div class="split__media reveal">{picture("img10", "(max-width: 860px) 92vw, 46vw")}</div>
          <div class="reveal">
            <span class="eyebrow">Fishery Improvement</span>
            <h2 class="h-icon" id="rf-fip-h">{icon("steward", "h-icon__mark")} Part of Belize's fisheries management effort</h2>
            <p class="lede">
              NATFISH has participated in Belize's spiny lobster Fishery
              Improvement Project and in broader fisheries-management efforts.
            </p>
            <p>
              A Fishery Improvement Project brings industry, government and
              non-governmental partners together to work on the same fishery
              over time. For a cooperative whose members depend on that fishery,
              the interest is direct.
            </p>
            <p class="note">
              Source:
              <a href="{SRC_FISHSOURCE}" target="_blank" rel="noopener noreferrer">FishSource, Belize spiny lobster FIP</a>.
            </p>
          </div>
        </div>

        <p class="notice reveal" style="margin-top:clamp(2rem,4vw,3rem)">
          <strong>Closed seasons are part of this.</strong> Belize closes its
          lobster and conch fisheries each year so stocks can breed, and
          respecting those dates is a basic part of responsible fishing.
          <a href="seafood-seasons.html">View Belize's seafood seasons</a>.
        </p>

        <p class="notice reveal" style="margin-top:1rem">
          <strong>A note on certifications.</strong> Certifications, standards
          and product-specific claims should be confirmed directly with NATFISH,
          which can advise what applies to a given product at a given time.
        </p>
      </div>
    </section>
"""
        + cta_band(
            "For Buyers",
            "Questions about standards or documentation?",
            "The team can confirm what applies to a specific product and what "
            "documentation is available for your market.",
            [
                f'<a class="btn btn--primary" href="{BUYER_CTA}">Buyer Enquiry</a>',
                '<a class="btn btn--ghost" href="news.html">What&rsquo;s New</a>',
            ],
            tone="sand",
        )
        + footer()
    )


# ================================================================ news ===

def news():
    featured, rest = UPDATES[0], UPDATES[1:]
    others = "\n          ".join(update_card(u) for u in rest)

    return (
        head(
            "What&rsquo;s New at NATFISH | NATFISH",
            "Announcements, cooperative updates, fisheries-sector developments "
            "and media coverage relevant to National Fishermen Producers' "
            "Co-operative Society Ltd.",
            og_image="img09",
        )
        + header("news.html")
        + page_hero(
            "What&rsquo;s New",
            "What&rsquo;s New at NATFISH",
            "Announcements, cooperative updates and fisheries-sector "
            "developments. Each item links to the source it came from.",
            "What&rsquo;s New",
        )
        + f"""
    <section class="section" aria-labelledby="news-featured-h">
      <div class="container">
        <h2 id="news-featured-h" class="visually-hidden">Featured update</h2>
        <article class="feature-update reveal">
          <div class="feature-update__media">
            {picture(featured["img"], "(max-width: 860px) 92vw, 52vw")}
          </div>
          <div class="feature-update__body">
            <p class="update-card__meta">
              <span class="update-card__tag">{featured['tag']}</span>
              <span class="update-card__date">{featured['date']}</span>
            </p>
            <h3>{featured['title']}</h3>
            <p class="lede">{featured['body']}</p>
            <p class="update-card__source">
              Source: <a href="{featured['url']}" target="_blank" rel="noopener noreferrer">{featured['source']}</a>
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="news-more-h">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">More updates</span>
          <h2 id="news-more-h">Also happening</h2>
        </div>
        <div class="grid grid--2">
          {others}
        </div>

        <p class="notice reveal" style="margin-top:clamp(2rem,4vw,3rem)">
          <strong>About this page.</strong> This page carries publicly sourced
          items only, with no dates, quotes or outcomes added beyond what the
          source supports. It is built to carry NATFISH announcements, events,
          public notices and media coverage as the cooperative publishes them.
        </p>
      </div>
    </section>
"""
        + cta_band(
            "Gallery",
            "See the work and the product",
            "Photography and video covering Belizean fisheries, seafood "
            "handling and the waters NATFISH members work in.",
            [
                '<a class="btn btn--primary" href="gallery.html">Open the gallery</a>',
                '<a class="btn btn--ghost" href="about.html">About NATFISH</a>',
            ],
        )
        + footer()
    )



# ====================================================== seafood seasons ===

def seafood_seasons():
    """A regulatory guide, deliberately not a catalogue.

    Every status string is drawn from a fixed permitted set, so a date falling
    inside an open season can never be read as "in stock".
    """
    return (
        head(
            "Seafood Seasons | NATFISH",
            "A plain-language guide to Belize's standard regulated seafood "
            "seasons for lobster, conch, Nassau grouper, whelks and stone crab. "
            "Contact NATFISH to confirm current availability.",
            og_image="img09",
        )
        + header("seafood-seasons.html")
        + f"""
    <section class="hero hero--page" aria-label="Seafood Seasons">
      <div class="hero__panel">
        <div class="hero__content">
          <p class="breadcrumb"><a href="index.html">Home</a><span>/</span>Seafood Seasons</p>
          <p class="hero__eyebrow"><strong>NATFISH</strong> <span class="hero__eyebrow-sep" aria-hidden="true">|</span> Seafood Seasons</p>
          <h1>Know the Season. Protect the Future.</h1>
          <p class="hero__copy">
            Belize's regulated seafood seasons help protect breeding cycles,
            encourage responsible fishing and sustain fisher livelihoods for
            future generations. Use this guide to understand the standard
            national seasons, then contact NATFISH to confirm current product
            availability.
          </p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="{BUYER_CTA}">Check Current Availability</a>
            <a class="btn btn--ghost" href="responsible.html">Responsible Fisheries</a>
          </div>
        </div>
      </div>

      <div class="hero__media">
        <div class="hero__slide is-active">
          {picture("img09", "(max-width: 900px) 100vw, 60vw", eager=True).replace("<img ", '<img style="object-position:52% 58%" ')}
        </div>
      </div>
    </section>

    <div class="container">
      <p class="notice notice--strong reveal">
        <strong>This is a general regulatory guide, not a NATFISH product
        catalogue.</strong> The dates below summarise Belize's standing national
        fisheries seasons. They do not describe what NATFISH holds, and a
        regulatory open season does not mean a product is available.
      </p>
    </div>

    <section class="section" aria-labelledby="seasons-h">
      <div class="container">
        <div class="section-head section-head--center reveal">
          {RULE_WAVE}
          <span class="eyebrow">Standard national seasons</span>
          <h2 id="seasons-h">Belize seafood seasons at a glance</h2>
          <p class="lede">
            Status is calculated from today's date against the standard
            regulatory period only. Confirm every requirement with NATFISH and
            with the Belize Fisheries Department before you commit.
          </p>
        </div>

        <div class="season-grid">
          {season_cards()}
        </div>

        <div class="season-meta reveal">
          <p>
            <span class="season-meta__label">Last regulatory review</span>
            <span class="season-meta__value">{LAST_REVIEW}</span>
          </p>
          <p>
            <a href="{FISHERIES_SOURCE}" target="_blank" rel="noopener noreferrer">Belize Fisheries Department regulations</a>
          </p>
        </div>

        <p class="notice reveal" style="margin-top:clamp(1.75rem,3.5vw,2.5rem)">
          {PAGE_NOTE}
        </p>
      </div>
    </section>
"""
        + cta_band(
            "For Buyers",
            "Ask NATFISH what is available",
            "Season dates describe regulation, not stock. The team can confirm "
            "what is actually available for your requirement.",
            [
                f'<a class="btn btn--primary" href="{BUYER_CTA}">Buyer Enquiry</a>',
                '<a class="btn btn--ghost" href="seafood-services.html">Seafood &amp; Services</a>',
            ],
        )
        + footer()
    )


# ============================================================= gallery ===

GALLERY = [
    ("img01", "wide"), ("img06", ""), ("img04", ""),
    ("img03", ""), ("img05", ""), ("img10", "wide"),
    ("img07", ""), ("img08", ""), ("img09", "wide"),
]


def gallery():
    items = []
    for stem, mod in GALLERY:
        cls = f" gallery__figure--{mod}" if mod else ""
        sizes = "(max-width: 460px) 92vw, (max-width: 860px) 46vw, 30vw"
        items.append(
            f"""<figure class="gallery__figure{cls}">
            <button class="gallery__item" type="button"
                    aria-label="View larger: {SHORT[stem]}">
              {picture(stem, sizes, full=True)}
            </button>
            <figcaption>{SHORT[stem]}. Concept image used for the website presentation.</figcaption>
          </figure>"""
        )
    photos = "\n          ".join(items)

    return (
        head(
            "Gallery | NATFISH",
            "Photography and video covering Belizean fisheries, seafood "
            "handling and the waters National Fishermen members work in.",
            og_image="img01",
        )
        + header("gallery.html")
        + page_hero(
            "Gallery",
            "The work, the water and the product",
            "Photographs and video from Belize's fisheries. Select any "
            "photograph to view it larger.",
            "Gallery",
        )
        + f"""
    <div class="container">
      <p class="notice reveal">
        <strong>About this imagery.</strong> The photographs below are concept
        images prepared for the website presentation. They do not depict
        identified NATFISH members, staff, vessels or facilities. Client-owned
        photography will replace them as it is supplied.
      </p>
    </div>

    <section class="section" aria-labelledby="gal-photos-h">
      <div class="container">
        <h2 id="gal-photos-h" class="visually-hidden">Photographs</h2>
        <div class="gallery reveal">
          {photos}
        </div>
      </div>
    </section>

    <section class="section section--navy" aria-labelledby="gal-video-h">
      <div class="container container--narrow">
        <div class="section-head section-head--center reveal">
          <span class="eyebrow">Video</span>
          <h2 id="gal-video-h">On film</h2>
          <p class="lede" style="margin-inline:auto">
            Third-party documentary material about the cooperative. NATFISH-owned
            video will be added here as it is supplied.
          </p>
        </div>

        <div class="video reveal" data-video="{VIDEO_ID}" data-video-title="{VIDEO_TITLE}">
          <button class="video__poster" type="button" aria-label="Play the video: {VIDEO_TITLE}">
            {picture("img10", "(max-width: 900px) 96vw, 880px", alt="")}
            <span class="video__play">{ICON_PLAY}</span>
            <span class="video__label">{VIDEO_TITLE}</span>
          </button>
        </div>
        <p class="video-credit reveal">
          Courtesy of {VIDEO_SOURCE}. This is third-party documentary footage
          used with attribution. It is not NATFISH-owned production.
        </p>
      </div>
    </section>
"""
        + cta_band(
            "Contact",
            "Get in touch with NATFISH",
            "For buyer enquiries, cooperative matters or media requests, the "
            "team can be reached directly.",
            [
                '<a class="btn btn--primary" href="contact.html">Contact NATFISH</a>',
                f'<a class="btn btn--outline" href="{BUYER_CTA}">Buyer Enquiry</a>',
            ],
            tone="sand",
        )
        + footer(with_lightbox=True)
    )


# ============================================================= contact ===

CHECKLIST = [
    "Your name and company",
    "Your country or location",
    "The seafood product or species required",
    "Approximate quantity",
    "Preferred timeframe",
    "Packaging or preparation requirements, if applicable",
    "Destination or delivery location",
    "Telephone or WhatsApp number",
    "Any additional information NATFISH should know",
]


def contact():
    checks = "\n            ".join(
        f'<li>{ICON_CHECK}<span>{item}</span></li>' for item in CHECKLIST
    )

    return (
        head(
            "Contact &amp; Buyer Enquiries | NATFISH",
            "Send NATFISH a buyer enquiry by email or WhatsApp, or reach the "
            "cooperative in Belize City by telephone or email.",
            og_image="img08",
        )
        + header("contact.html")
        + page_hero(
            "Contact",
            "Contact &amp; buyer enquiries",
            "Reach NATFISH directly. Buyer enquiries go straight to the team by "
            "email or WhatsApp.",
            "Contact",
        )
        + f"""
    <section class="section" id="buyer-enquiry" aria-labelledby="buyer-h">
      <div class="container">
        <div class="enquiry">
          <div class="enquiry__intro reveal">
            <span class="eyebrow">Buyer Enquiries</span>
            <h2 id="buyer-h">Purchasing seafood from NATFISH</h2>
            <p class="lede">
              Interested in purchasing seafood or discussing a supply
              requirement? Tell us what product you are looking for, the
              approximate quantity required, your location and your preferred
              timeframe. NATFISH will review your enquiry and contact you to
              discuss availability and next steps.
            </p>

            <p class="season-hint">
              Not sure whether a species is currently in season?
              <a href="seafood-seasons.html">View the Seafood Seasons guide</a>.
            </p>

            <div class="enquiry__actions">
              <a class="btn btn--primary" href="{mailto_href()}">
                {ICON_MAIL} Send an Email
              </a>
              <!-- TEMPORARY CONCEPT WHATSAPP NUMBER — REPLACE WITH CLIENT-CONFIRMED
                   NATFISH NUMBER BEFORE PUBLIC LAUNCH. +501 610-8859 is a routing
                   number for this concept build only and is not published
                   anywhere as a NATFISH telephone number. -->
              <a class="btn btn--whatsapp" href="{whatsapp_href()}"
                 target="_blank" rel="noopener noreferrer">
                {ICON_WA} Enquire on WhatsApp
              </a>
            </div>
            <p class="note">
              Both options open a message you can edit before sending.
            </p>
          </div>

          <aside class="enquiry__checklist reveal" aria-labelledby="checklist-h">
            <h3 id="checklist-h">What to include in your enquiry</h3>
            <ul class="checklist">
            {checks}
            </ul>
          </aside>
        </div>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="general-h">
      <div class="container">
        <div class="section-head section-head--center reveal">
          <span class="eyebrow">General Contact</span>
          <h2 id="general-h">Reach the cooperative</h2>
          <p class="lede">
            For cooperative matters, media requests and general questions.
            These details are provisional pending confirmation by NATFISH.
          </p>
        </div>

        <div class="grid grid--3">
          <div class="contact-card reveal">
            <span class="contact-card__icon">{icon("coast")}</span>
            <h3>Visit</h3>
            <p>{ADDRESS}</p>
            <a class="arrow-link" href="{MAPS}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
          </div>
          <div class="contact-card reveal">
            <span class="contact-card__icon">{ICON_PHONE}</span>
            <h3>Call</h3>
            <p>{TEL_DISPLAY}</p>
            <a class="arrow-link" href="tel:{TEL_HREF}">Call NATFISH</a>
          </div>
          <div class="contact-card reveal">
            <span class="contact-card__icon">{ICON_MAIL}</span>
            <h3>Email</h3>
            <p>{EMAIL}</p>
            <a class="arrow-link" href="mailto:{EMAIL}">Email NATFISH</a>
          </div>
        </div>
      </div>
    </section>
"""
        + cta_band(
            "About",
            "New to NATFISH?",
            "A Belizean fisher-owned cooperative registered in 1966, owned by "
            "the fishers who make it up.",
            [
                '<a class="btn btn--primary" href="about.html">About NATFISH</a>',
                '<a class="btn btn--ghost" href="seafood-services.html">Seafood &amp; Services</a>',
            ],
        )
        + footer()
    )


# ================================================================ main ===

PAGES = {
    "index.html": home,
    "about.html": about,
    "seafood-services.html": seafood_services,
    "seafood-seasons.html": seafood_seasons,
    "responsible.html": responsible,
    "news.html": news,
    "gallery.html": gallery,
    "contact.html": contact,
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, builder in PAGES.items():
        path = OUT / name
        path.write_text(builder(), encoding="utf-8")
        print(f"{name:26} {path.stat().st_size / 1024:6.1f} KB")


if __name__ == "__main__":
    main()
