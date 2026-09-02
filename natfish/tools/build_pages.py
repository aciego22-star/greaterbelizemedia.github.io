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
    ADDRESS, ALT, BUYER_CTA, CAPTION, COMMITTEE, DIMS, EMAIL, FOUNDED_DATE,
    GALLERY_CLASSES, GALLERY_GROUPS, GM_EMAIL, GM_NAME,
    GM_TITLE, ICON_ARROW, ICON_MAIL, ICON_PHONE, ICON_PIN, ICON_WA, LEGAL,
    LEGAL_NO_DOT, MAPS, MARKETS, MEMBERS, MOBILE_DISPLAY, MOBILE_HREF,
    RECREATION_NOTE, SHORT, TEL2_DISPLAY, TEL2_HREF, TEL_DISPLAY, TEL_HREF,
    VIDEO_ID, VIDEO_SOURCE, VIDEO_TITLE, WHATSAPP, SRC_BELTRAIDE,
    SRC_FISHERIES_DEPT, SRC_FISHERYPROGRESS, SRC_FISHSOURCE, SRC_FISHWISE,
    AI_PAGE, HOURS, MARKET_HOURS, OFFICE_HOURS, RULE_WAVE, SITE_URL,
    breadcrumb_jsonld,
    contact_strip, cta_band, footer, head, header, hero_picture,
    hero_preload, hero_tiers, identity_ribbon, logo_full, page_hero, picture,
    website_jsonld,
)
import json
import re

OUT = pathlib.Path("/home/user/greaterbelizemedia.github.io/natfish")

# ---------------------------------------------------------------- icons --

# Feature icons are subject-specific: each one is drawn for the heading it sits
# beside, and none is reused for a second idea.
ICON_PLAY = icon("play")
ICON_CHAT = icon("chat")
ICON_CHECK = """<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4.5 12.6 5.2 5.2L19.5 7.4"/></svg>"""

# ------------------------------------------------------ enquiry links --
#
# There is no <form> anywhere on the site. Both buttons hand the visitor a
# fully editable draft in an app they already trust, which is why the product
# line is a pick-list rather than a set of fields: a buyer can delete the five
# that do not apply faster than they can type the one that does.

# The product lines in both drafts are generated from CATALOGUE further down
# this file, not typed out here. They were typed out here once, and adding two
# products to the catalogue left both drafts silently offering the old six -
# a buyer would have been handed a pick-list that did not match the page they
# were reading. The templates carry a {products} slot and are filled in after
# the catalogue is defined, so the two cannot drift apart again.

EMAIL_SUBJECT = "NATFISH Seafood Buyer Enquiry"
EMAIL_TEMPLATE = """Hello NATFISH,

I would like to enquire about purchasing seafood.

Name:
Company:
Country or location:
Telephone or WhatsApp:

Product required (delete those that do not apply):
{products}

Approximate quantity:
Preferred timeframe:
Packaging or preparation requirements:
Destination or delivery location:
Additional information:

Thank you."""

WHATSAPP_TEMPLATE = """Hello NATFISH. I would like to make a seafood enquiry.

Name:
Company:
Location:

Product required (delete those that do not apply):
{products}

Approximate quantity:
Preferred timeframe:
Additional information:"""


def mailto_href():
    """RFC 6068 mailto. The visitor can edit everything before sending."""
    return (
        f"mailto:{EMAIL}"
        f"?subject={quote(EMAIL_SUBJECT, safe='')}"
        f"&amp;body={quote(EMAIL_BODY, safe='')}"
    )


def whatsapp_href():
    return f"https://wa.me/{WHATSAPP}?text={quote(WHATSAPP_BODY, safe='')}"


# ---------------------------------------------------------- news data --

# Three publicly sourced items. No dates, quotes, speakers or outcomes are
# added beyond what the sources support.
UPDATES = [
    # Newest first. UPDATES[0] is the featured item on What's New and the first
    # of the two the homepage carries.
    #
    # The wording is the client's, used as supplied, and it is deliberately
    # narrow: it says the delegation travelled, and that National Fishermen
    # took part as an official exhibitor. It does not say a contract, a sale, a
    # partnership or an agreement came of it, because none has been evidenced -
    # and the client asked explicitly that none be claimed. Do not add one.
    {
        "tag": "Trade &amp; Markets",
        "title": "NATFISH Represents Belize at Food Taipei 2026",
        "date": "June 2026",
        "img": "news-food-taipei-2026-delegation",
        "body": (
            "From June 20 to 29, 2026, a NATFISH delegation travelled to Taiwan "
            "to represent Belize and its fishing community. During the visit, "
            "National Fishermen participated as an official exhibitor at Food "
            "Taipei 2026, held from June 24 to 27, helping showcase Belizean "
            "seafood to an international audience."
        ),
        # A named call to action rather than the usual credit line, because
        # the client supplied both the label and the destination.
        "cta": "Read the Full Event Coverage",
        "url": "https://focustaiwan.tw/society/202606240017",
    },
    {
        "tag": "Trade &amp; Markets",
        "title": "Belizean seafood featured in 2026 trade promotion",
        "date": "2026",
        "img": "01-belizean-pride-lobster-cases",
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
        "img": "01-lobster-packing-team-wide",
        "body": (
            "Public fisheries-sector activity in 2026 continues to reference "
            "National Fishermen as an active co-operative within Belize's "
            "fishing community."
        ),
        "source": "Belize Fisheries Department public updates",
        "url": SRC_FISHERIES_DEPT,
    },
    {
        "tag": "Responsible Fisheries",
        "title": "Traceability and the spiny lobster Fishery Improvement Project",
        "date": "Ongoing",
        "img": "08-lobster-weighing-and-sorting",
        "body": (
            "National Fishermen has participated in electronic catch "
            "documentation and in Belize's spiny lobster Fishery Improvement "
            "Project, both aimed at better information and better management."
        ),
        "source": "FishSource Belize spiny lobster FIP",
        "url": SRC_FISHSOURCE,
    },
]


def update_link(u, *, button_class="btn btn--primary btn--sm"):
    """Where an update sends the reader.

    Most items credit the public source they came from, which is what keeps the
    page honest about what is NATFISH's own announcement and what is somebody
    else's reporting. An item with a `cta` gets a named button instead, for the
    cases where the client has supplied the label and the destination
    themselves. Either way the link leaves the site, so both open in a new tab
    with `rel="noopener noreferrer"`.
    """
    if u.get("cta"):
        return (f'<p class="update-card__cta">'
                f'<a class="{button_class}" href="{u["url"]}"'
                f' target="_blank" rel="noopener noreferrer">{u["cta"]}'
                f'<span class="visually-hidden"> (opens in a new tab)</span>'
                f'</a></p>')
    return (f'<p class="update-card__source">\n'
            f'                Learn more: <a href="{u["url"]}" target="_blank"'
            f' rel="noopener noreferrer">{u["source"]}</a>\n'
            f'              </p>')


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
              {update_link(u)}
            </div>
          </article>"""


# ================================================================ home ===

# The seven-step handling sequence, in the co-operative's own order and their
# own words for what each step involves.
#
# Five steps have an authentic photograph of that step happening at the
# facility. Two do not: NATFISH has said photographs of the tally bench and of
# shipping are coming, and until they arrive those cards carry a species-style
# icon panel rather than a borrowed picture. The same rule as the product
# cards - a card with no truthful photograph gets a mark, never a stand-in.
#
# `icon` is only read when there is no photograph.
PROCESS = [
    (None, "handling", "Selecting / Receiving",
     "Catch is received and selected against Belize Fisheries Department "
     "regulations on size and weight."),
    ("07-lobster-washing-station", "handling", "Cleaning / Processing",
     "Product is rinsed and prepared at the stainless washing station before "
     "it goes any further."),
    ("08-lobster-weighing-and-sorting", "seal", "Grading",
     "Graded and weighed by 10 lb. units."),
    ("05-lobster-tail-packing-boxes", "crate-fish", "Wrapping / Packing",
     "Product is bagged and packed into cartons by hand, ready for freezing."),
    (None, "tag", "Tally",
     "Boxes are covered, and the date, lot number and lobster size are "
     "recorded on each one."),
    ("10-cold-storage-room", "steward", "Cold Storage",
     "Packed cartons move into cold storage and stay there until they ship."),
    (None, "route", "Shipping",
     "Cartons leave the facility under temperature control."),
]

# The six verified products, grouped for the homepage. The full catalogue with
# scientific names lives on seafood-services.html; this is a gateway, so it
# names all six without repeating the detail.
HOME_SEAFOOD = [
    ("03-belizean-pride-raw-lobster-tails", "Spiny lobster", "lobster",
     "Tails, head meat, and whole lobster raw or cooked &mdash; four frozen "
     "lobster products from Belize&rsquo;s spiny lobster fishery."),
    ("04-fresh-conch-processing-closeup", "Queen conch", "conch",
     "Frozen queen conch meat, 85% cleaned, handled and packed at the "
     "co-operative&rsquo;s own facility."),
    (None, "Lionfish", "lionfish",
     "Lionfish fillet, taken from an invasive species that Belizean fishers "
     "help keep in check."),
]


def process_step(stem, ico, title, body, n):
    """One portrait card in the handling sequence.

    A step with no photograph yet gets the same treatment a product with no
    truthful photograph gets: an icon on a navy panel, keeping the row even
    without labelling somebody else's picture as this step.
    """
    if stem:
        media = picture(
            stem, "(max-width: 620px) 40vw, (max-width: 1024px) 44vw, 15vw",
            full=True)
    else:
        media = icon(ico, "step__mark")
    mark = "" if stem else " step__media--mark"
    return f"""<li class="step reveal">
            <div class="step__media{mark}">
              {media}
              <span class="step__n" aria-hidden="true">{n}</span>
            </div>
            <div class="step__body">
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </li>"""


# The five approved hero images, in the approved order.
#
# All five are photographs the client supplied specifically for the hero, each
# as a pre-cropped pair: a landscape frame for the desktop hero and a 9:16
# portrait frame for the phone. Because the client composed both crops, the
# desktop side takes no focal point at all - the browser simply picks the crop
# that matches the frame it is filling.
#
# The order is theirs: the diver on the dock opens, because it is the one frame
# where a Belizean fisher, the dock and the lobster itself all read at a glance.
# The diver at sea took the slot vacated by the last V1 concept image, a boat
# leaving the harbour. The trade-show stand and the packed Belizean Pride range
# close the rotation, so it runs from the water to the market.
#
# No concept imagery is left in the hero. `hero-2-boat-leaving-harbour` still
# exists because the Gallery's video facade uses it as a poster, but it is no
# longer a slide.
HERO_SLIDES = [
    "hero-lobster-diver-dock",
    "hero-diver-lobster-catch",
    "hero-lobster-boat-catch",
    "hero-trade-show-stand",
    "hero-belizean-pride-range",
]


def home():
    slide_html = []
    for i, stem in enumerate(HERO_SLIDES):
        active = " is-active" if i == 0 else ""
        slide_html.append(
            f"""<div class="hero__slide hero__slide--{i + 1}{active}">
            {hero_picture(stem, i + 1, eager=(i == 0))}
          </div>"""
        )

    seafood_cards = []
    for stem, title, ico, body in HOME_SEAFOOD:
        if stem:
            media = f'<div class="card__media">{picture(stem, "(max-width: 640px) 92vw, (max-width: 900px) 46vw, 30vw")}</div>'
        else:
            # No authentic lionfish photograph was supplied, and labelling any
            # other fish as lionfish would be a false caption. The card carries
            # the species mark instead.
            media = f"""<div class="card__media card__media--mark">
              {icon(ico, "card__mark")}
            </div>"""
        seafood_cards.append(f"""<article class="card reveal">
            {media}
            <div class="card__body">
              <h3 class="h-icon">{icon(ico, "h-icon__mark")} {title}</h3>
              <p>{body}</p>
              <a class="arrow-link" href="seafood-services.html">See the products</a>
            </div>
          </article>""")

    return (
        head(
            "NATFISH Belize | Fisher-Owned Seafood Co-operative Since 1966",
            "A member-owned co-operative of 636 Belizean fishers, registered in "
            "Belize City in 1966. Frozen spiny lobster, queen conch and lionfish "
            "fillet prepared for local and international markets.",
            "index.html",
            preload=hero_preload(HERO_SLIDES[0]),
            extra_jsonld=website_jsonld(),
        )
        + header("index.html")
        + identity_ribbon()
        + f"""
    <section class="hero" data-carousel aria-label="NATFISH">
      <div class="hero__panel">
        <div class="hero__content">
          <p class="hero__eyebrow"><strong>NATFISH</strong> <span class="hero__eyebrow-sep" aria-hidden="true">|</span> Member-owned in Belize since 1966</p>
          <h1>From Belize's waters to markets around the world.</h1>
          <p class="hero__copy">
            A co-operative of {MEMBERS} Belizean fishers, preparing quality frozen
            seafood for local and international markets.
          </p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="seafood-services.html">Explore Our Seafood</a>
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
        <ul class="trust__list trust__list--four">
          <li class="trust__item">{icon("seal")} Registered {FOUNDED_DATE}</li>
          <li class="trust__item">{icon("net")} {MEMBERS} Fisher Members</li>
          <li class="trust__item">{icon("handling")} {COMMITTEE.title()} Elected Committee Members</li>
          <li class="trust__item">{icon("route")} Belizean Seafood for International Markets</li>
        </ul>
      </div>
    </div>

    <section class="section" aria-labelledby="home-about-h">
      <div class="container">
        <div class="split">
          <div class="reveal">
            <span class="eyebrow">About NATFISH</span>
            <h2 id="home-about-h">A co-operative owned by Belizean fishers</h2>
            <p class="lede">
              {LEGAL_NO_DOT} was registered in Belize City on {FOUNDED_DATE} and
              has grown to {MEMBERS} fisher members. It is owned by those members
              and governed by a {COMMITTEE}-member Managing Committee elected from
              the membership.
            </p>
            <p>
              The co-operative supports its members through education in fishery
              management, and by purchasing and marketing their produce &mdash;
              working to secure the best possible value in international markets
              and improve members' livelihoods.
            </p>
            <a class="arrow-link" href="about.html">About NATFISH</a>
          </div>
          <div class="split__media reveal">
            {picture("03-lobster-processing-room-wide", "(max-width: 860px) 92vw, 46vw")}
          </div>
        </div>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="home-process-h">
      <div class="container">
        <div class="section-head section-head--rule reveal section-head--center">
          {RULE_WAVE}
          <span class="eyebrow">Inside the facility</span>
          <h2 id="home-process-h">Care from processing to cold storage</h2>
          <p class="lede">
            Seven steps between the landing and the container, at the
            co-operative&rsquo;s own facility.
          </p>
        </div>

        <ol class="steps">
          {"".join(process_step(stem, ico, t, b, i + 1) for i, (stem, ico, t, b) in enumerate(PROCESS))}
        </ol>
      </div>
    </section>

    <section class="section" aria-labelledby="home-seafood-h">
      <div class="container">
        <div class="section-head section-head--rule reveal section-head--center">
          {RULE_WAVE}
          <span class="eyebrow">Seafood &amp; Services</span>
          <h2 id="home-seafood-h">Three products from Belizean waters</h2>
          <p class="lede">
            Spiny lobster, queen conch and lionfish. Availability follows
            Belize&rsquo;s regulated seasons and is confirmed directly with
            NATFISH.
          </p>
        </div>

        <div class="grid grid--3">
          {"".join(seafood_cards)}
        </div>
      </div>
    </section>

    <section class="season-feature" aria-labelledby="home-seasons-h">
      <div class="season-feature__media">
        {picture("09-lobster-processing-table", "(max-width: 900px) 100vw, 52vw", focus="50% 40%")}
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
            {picture("02-lobster-packing-line-portrait", "(max-width: 860px) 92vw, 46vw")}
          </div>
          <div class="reveal">
            <span class="eyebrow">Responsible Fisheries</span>
            <h2 class="h-icon" id="home-resp-h">{icon("steward", "h-icon__mark")} Food safety and careful handling</h2>
            <p class="lede">
              NATFISH works to operate in accordance with HACCP and U.S. FDA
              regulations. Food safety and consumer protection are among the
              co-operative's highest priorities as it supports globally
              recognized artisanal fishing.
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

    <section class="section section--sand" aria-labelledby="home-insights-h">
      <div class="container">
        <div class="section-head section-head--split reveal">
          <div>
            <span class="eyebrow">Insights</span>
            <h2 class="h-icon" id="home-insights-h">{icon("steward", "h-icon__mark")} Insights from NatFish</h2>
          </div>
          <a class="arrow-link" href="{INSIGHTS_PAGE}">All insights</a>
        </div>
        <p class="lede reveal" style="margin-bottom:clamp(1.4rem,3vw,2rem)">
          Evergreen writing on Belizean seafood: what the co-operative handles,
          how it is prepared and what buyers should know.
        </p>
        <div class="insight-grid insight-grid--feature">
          {article_card()}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="home-gallery-h">
      <div class="container">
        <div class="section-head section-head--split reveal">
          <div>
            <span class="eyebrow">Gallery</span>
            <h2 class="h-icon" id="home-gallery-h">{icon("gallery", "h-icon__mark")} The people, the process, the product</h2>
          </div>
          <a class="arrow-link" href="gallery.html">View the gallery</a>
        </div>
        <a class="gallery-preview reveal" href="gallery.html"
           aria-label="View the NATFISH gallery">
          {picture("06-lobster-tail-packing-close", "(max-width: 700px) 46vw, 31vw")}
          {picture("02-belizean-pride-orange-lobster-tails", "(max-width: 700px) 46vw, 31vw")}
          {picture("04-wild-caught-frozen-conch", "(max-width: 700px) 46vw, 31vw")}
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
            "About NATFISH | Belizean Fisher-Owned Co-operative Since 1966",
            f"{LEGAL_NO_DOT} was registered in Belize City on {FOUNDED_DATE} and "
            f"has grown to {MEMBERS} fisher members, governed by a "
            f"{COMMITTEE}-member Managing Committee elected from the membership.",
            "about.html",
        )
        + header("about.html")
        + page_hero(
            "About NATFISH",
            "A member-owned society, registered in 1966",
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
            <p class="lede" style="margin:0">{LEGAL}</p>
          </div>
        </div>

        <div class="split" style="margin-top:clamp(2.5rem,5vw,4rem)">
          <div class="reveal">
            <span class="eyebrow">History</span>
            <h2>Registered on {FOUNDED_DATE}</h2>
            <p>
              {LEGAL_NO_DOT} was registered in Belize City. What began with 20
              members has grown into a member-owned co-operative of {MEMBERS}
              fishers.
            </p>
            <p>
              The co-operative is owned by its members and governed by a
              {COMMITTEE}-member Managing Committee elected from the general
              membership. Members are not customers of the Society; they are its
              owners, and the committee is there to support and serve its
              members.
            </p>
            <p>
              NATFISH supports its members through education in fishery
              management, and by purchasing and marketing their produce. Its aim
              is to secure the best possible value in international markets and
              to improve the livelihoods of the fishers who own it.
            </p>
          </div>
          <div class="reveal">
            <div class="split__media" style="margin-bottom:1.5rem">
              {picture("03-lobster-processing-room-wide", "(max-width: 860px) 92vw, 46vw")}
            </div>
            <ul class="factlist">
              <li>
                <span class="factlist__key">Members</span>
                <span class="factlist__val">{MEMBERS} fishers</span>
              </li>
              <li>
                <span class="factlist__key">Governance</span>
                <span class="factlist__val">{COMMITTEE.title()}-member Managing Committee, elected by the membership</span>
              </li>
              <li>
                <span class="factlist__key">Base</span>
                <span class="factlist__val">{ADDRESS}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="about-model-h">
      <div class="container">
        <div class="section-head reveal section-head--center">
          <span class="eyebrow">The co-operative model</span>
          <h2 id="about-model-h">Members own it, and members govern it</h2>
          <p class="lede">
            NATFISH is owned by the {MEMBERS} fishers who make it up. Members
            elect a {COMMITTEE}-member Managing Committee, and that committee
            serves as the board overseeing the Society.
          </p>
        </div>

        <ol class="flow reveal">
          <li class="flow__step">
            <span class="flow__num">01</span>
            <span class="flow__label">Fishers</span>
            <span class="flow__note">{MEMBERS} members harvest in Belizean waters</span>
          </li>
          <li class="flow__step">
            <span class="flow__num">02</span>
            <span class="flow__label">Co-operative</span>
            <span class="flow__note">The Society purchases members' produce</span>
          </li>
          <li class="flow__step">
            <span class="flow__num">03</span>
            <span class="flow__label">Processing</span>
            <span class="flow__note">Handling, sorting, packing and cold storage</span>
          </li>
          <li class="flow__step">
            <span class="flow__num">04</span>
            <span class="flow__label">Market</span>
            <span class="flow__note">Buyers at home and internationally</span>
          </li>
        </ol>
      </div>
    </section>

    <section class="section" aria-labelledby="about-fishers-h">
      <div class="container">
        <div class="split split--media-right">
          <div class="split__media reveal">{picture("01-lobster-packing-team-wide", "(max-width: 860px) 92vw, 46vw")}</div>
          <div class="reveal">
            <span class="eyebrow">The fishers behind NATFISH</span>
            <h2 class="h-icon" id="about-fishers-h">{icon("net", "h-icon__mark")} Behind every product is a fishing community</h2>
            <p class="lede">
              {MEMBERS} fisher members, and the people who receive, prepare and
              pack what they land. The co-operative is the structure that
              connects their work at sea to a buyer.
            </p>
            <p>
              The Co-operative gives a fisher more than a buyer for the day&rsquo;s
              catch. It gives a share in the organization, a vote in how it is
              run, and a route to markets that would otherwise be out of reach.
            </p>
            <p>
              Through the Society, Belizean Pride Seafood has reached buyers in
              {MARKETS}.
            </p>
            <figure class="inline-figure">
              {picture("belizean-pride-packaged-products", "(max-width: 860px) 60vw, 300px", tiers=(480, 720))}
            </figure>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="about-mile-h">
      <div class="container container--narrow">
        <div class="section-head reveal section-head--center">
          <span class="eyebrow">Milestones</span>
          <h2 id="about-mile-h">Milestones</h2>
        </div>
        <ol class="timeline reveal">
          <li>
            <span class="timeline__year">{FOUNDED_DATE.split()[-1]}</span>
            <div>
              <h3>Co-operative registered in Belize City</h3>
              <p>
                The Society and its by-laws were registered on {FOUNDED_DATE}.
              </p>
            </div>
          </li>
          <li>
            <span class="timeline__year">{MEMBERS}</span>
            <div>
              <h3>Fisher members</h3>
              <p>
                Membership has grown from 20 members to {MEMBERS} fishers.
              </p>
            </div>
          </li>
          <li>
            <span class="timeline__year">{COMMITTEE.title()}</span>
            <div>
              <h3>Elected Managing Committee members</h3>
              <p>
                The Managing Committee is selected from the general membership
                and governs the Society on the members' behalf.
              </p>
            </div>
          </li>
          <li>
            <span class="timeline__year">Markets</span>
            <div>
              <h3>Belizean seafood supplied internationally</h3>
              <p>
                NATFISH has supplied Belizean seafood to {MARKETS}.
              </p>
            </div>
          </li>
        </ol>
        <p class="note" style="margin-top:1.5rem">
          Membership, governance and market figures come from the
          <a href="{SRC_FISHERYPROGRESS}" target="_blank" rel="noopener noreferrer">FisheryProgress institutional strengthening report</a>
          and
          <a href="{SRC_FISHWISE}" target="_blank" rel="noopener noreferrer">FishWise</a>.
        </p>
      </div>
    </section>
"""
        + cta_band(
            "Next",
            "See what the co-operative brings to market",
            "Frozen spiny lobster, queen conch and lionfish fillet, and the "
            "co-operative functions that carry a member's catch to a buyer.",
            [
                '<a class="btn btn--primary" href="seafood-services.html">Seafood &amp; Services</a>',
                f'<a class="btn btn--ghost" href="{BUYER_CTA}">Buyer Enquiry</a>',
            ],
        )
        + footer()
    )


def ai_button(label, fallback, css="btn btn--ai", product=None, aria=None):
    """An "Ask NATFISH AI" trigger.

    Always a real link with a real destination. natfish-ai.js upgrades it to
    open the chat panel once the widget is ready, and leaves it alone when it
    is not, so a visitor never meets a control that does nothing.

    `product` names an approved product for the accessible label and for the
    context line the script will pass if and when Chatbase exposes a supported
    way to pass one. It is never used to inject text into the widget by other
    means.
    """
    attrs = ""
    if product:
        attrs += f' data-ai-product="{product}"'
    if aria:
        attrs += f' aria-label="{aria}"'
    return (f'<a class="{css}" href="{fallback}" data-ai-open{attrs}>'
            f'{ICON_CHAT} {label}</a>')


def order_button(prod, css="btn btn--ai btn--sm", fallback=f"{AI_PAGE}#ai-embed"):
    """The per-product order action, with a product-specific accessible name.

    The fallback matters: if the script never runs this is an ordinary link,
    and it has to land somewhere the visitor can actually start an order. From
    another page that is the AI page's own embed; on the AI page itself the
    caller passes the in-page anchor.
    """
    return ai_button(
        "Order with NATFISH AI", fallback,
        css=css, product=prod["name"],
        aria=f'Start an order for {prod["name"]} with NATFISH AI',
    )


def order_thumb(prod):
    """The small square beside a product in the order list.

    Five of the six products have a photograph that is truthfully theirs; the
    sixth, whole cooked lobster, has none, and no borrowed or approximate image
    is used for it. Those carry the species mark on a navy panel instead - the same
    substitution the product cards on Seafood & Services already make, so a
    visitor moving between the two pages sees one consistent treatment rather
    than a gap where a picture should be.
    """
    if prod["img"]:
        return f"""<div class="order-item__media">
              {picture(prod["img"], "(max-width: 560px) 92vw, 96px", ratio="1 / 1")}
            </div>"""
    return f"""<div class="order-item__media order-item__media--mark">
              {icon(prod["icon"], "order-item__mark")}
            </div>"""


# ==================================================== seafood-services ===

# The six verified products, in the order the client supplied them. Scientific
# names are marked up with <i> and are never translated.
#
# The image column is deliberately sparse. Four of the six share the two
# lobster-tail photographs because those are the only packaging photographs
# supplied; head meat, whole lobster and lionfish have no photograph of their
# own, and captioning a different product with their name would be a false
# label. Those cards carry the species mark instead.
CATALOGUE = [
    # These two photographs were the wrong way round: the client confirmed that
    # the carton in products/03 holds whole raw lobster, and that the tray in
    # official/09 holds tails. The stems keep their original filenames - they
    # are referenced from the gallery and the generated dimension tables - but
    # the alt text and short labels in build_shell.py were corrected to match
    # what each photograph actually shows.
    {
        "name": "Frozen Spiny Lobster Tails",
        "sci": "Panulirus argus",
        "icon": "lobster",
        "img": "09-lobster-processing-table",
        "body": "Lobster tails, prepared and packed at the co-operative's own "
                "facility.",
    },
    {
        "name": "Frozen Lobster Head Meat",
        "sci": "Panulirus argus",
        "icon": "lobster",
        # The client's own packaged head-meat photograph, already approved and
        # running in the gallery. Asked for by name in the change document.
        "img": "04-belizean-pride-lobster-head-meat",
        "body": "Head meat recovered during lobster processing and frozen for "
                "market.",
    },
    {
        "name": "Frozen Whole Raw Lobster",
        "sci": "Panulirus argus",
        "icon": "lobster",
        "img": "03-belizean-pride-raw-lobster-tails",
        "body": "Whole spiny lobster, frozen raw rather than tailed.",
    },
    {
        "name": "Frozen Whole Cooked Lobster",
        "sci": "Panulirus argus",
        "icon": "lobster",
        # MISSING ASSET. The client asked for a cooked-product photograph here
        # and no verified one exists in the project. The only cooked lobster
        # anywhere in the set is products/02, which shows cooked *tails*, and
        # the raw whole lobster on the card above is explicitly not to be
        # reused. So this card keeps the species mark until NATFISH supplies a
        # photograph of whole cooked lobster.
        "img": None,
        "body": "Whole spiny lobster, cooked before freezing.",
    },
    {
        "name": "Frozen Queen Conch, 85% Cleaned",
        "sci": "Strombus gigas",
        "icon": "conch",
        "img": "04-wild-caught-frozen-conch",
        "body": "Queen conch meat, cleaned to 85% and frozen for market.",
    },
    {
        "name": "Lionfish Fillet",
        "sci": "Pterois volitans",
        "icon": "lionfish",
        # Was the navy species mark until the client supplied this photograph.
        # It is a 4:3 file in a 16:10 card, so `cover` trims the top and bottom;
        # the focal point holds the tray whole rather than shaving its front lip.
        "img": "lionfish-fillets-4x3",
        "focus": "50% 58%",
        "body": "Fillet from an invasive Indo-Pacific species that Belizean "
                "fishers help keep in check on the reef.",
    },
]

# Frozen Fish Fillets and Frozen Fish Portions were removed from the catalogue
# at the client's instruction. Their photographs stay in the gallery, which the
# same brief said not to touch.

AVAILABILITY_NOTE = (
    'Product availability follows <a href="seafood-seasons.html">Belize&rsquo;s '
    'regulated seasons</a> and current supply. '
    '<a href="{cta}">Contact NATFISH</a> to discuss current availability, '
    'specifications and buyer requirements.'
)


def sci_line(prod):
    """The species line, or nothing where no species is supported."""
    if not prod.get("sci"):
        return ""
    return f'<p class="product__sci"><i>{prod["sci"]}</i></p>'


def product_card(prod):
    """One catalogue entry. Photographs are only used where they are truthful."""
    if prod["img"]:
        media = f"""<div class="product__media">
              {picture(prod["img"], "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw", full=True, focus=prod.get("focus"), alt=prod.get("alt"))}
            </div>"""
    else:
        media = f"""<div class="product__media product__media--mark">
              {icon(prod["icon"], "product__mark")}
            </div>"""
    return f"""<article class="product reveal">
            {media}
            <div class="product__body">
              <h3>{prod["name"]}</h3>
              {sci_line(prod)}
              <p>{prod["body"]}</p>
              <div class="product__actions">
                {order_button(prod)}
                <a class="arrow-link" href="{BUYER_CTA}">Enquire by email or WhatsApp</a>
              </div>
            </div>
          </article>"""


def seafood_services():
    return (
        head(
            "Belizean Lobster, Conch &amp; Lionfish Products | NATFISH",
            "Frozen spiny lobster tails, lobster head meat, whole raw and cooked "
            "lobster, queen conch 85% cleaned and lionfish fillet, prepared by a "
            "Belizean fisher-owned co-operative.",
            "seafood-services.html",
        )
        + header("seafood-services.html")
        + page_hero(
            "Seafood &amp; Services",
            "Six products, and the co-operative behind them",
            "What NATFISH brings to market, and the co-operative functions that "
            "carry a member's catch from the water to a buyer.",
            "Seafood &amp; Services",
        )
        + f"""
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

    <section class="section" aria-labelledby="sf-catalogue-h">
      <div class="container">
        <div class="section-head section-head--rule reveal section-head--center">
          {RULE_WAVE}
          <span class="eyebrow">Product catalogue</span>
          <h2 id="sf-catalogue-h">Frozen seafood from Belizean waters</h2>
          <p class="lede">
            Four spiny lobster preparations, queen conch and lionfish fillet.
            Specifications and current availability are confirmed directly with
            NATFISH.
          </p>
        </div>

        <div class="products">
          {"".join(product_card(p) for p in CATALOGUE)}
        </div>

        <p class="notice reveal" style="margin-top:clamp(2rem,4vw,3rem)">
          {AVAILABILITY_NOTE.format(cta=BUYER_CTA)}
        </p>

        <p class="note reveal">{RECREATION_NOTE}</p>
      </div>
    </section>

    <section class="section" aria-labelledby="sf-ops-h">
      <div class="container">
        <div class="split">
          <div class="split__media reveal">
            {picture("03-lobster-processing-room-wide", "(max-width: 860px) 92vw, 46vw")}
          </div>
          <div class="reveal">
            <span class="eyebrow">Operations</span>
            <h2 class="h-icon" id="sf-ops-h">{icon("handling", "h-icon__mark")} Where the products are prepared</h2>
            <p class="lede">
              Every product on this page is received, prepared, weighed, packed
              and frozen at the Co-operative's own facility in Belize City.
            </p>
            <p>
              That is what a member can rely on: their catch is handled by the
              Society they own, and it leaves under the Society's name.
            </p>
            <a class="arrow-link" href="responsible.html">Food safety and handling</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--navy" aria-labelledby="sf-services-h">
      <div class="container">
        <div class="section-head section-head--center reveal">
          {RULE_WAVE}
          <span class="eyebrow">Co-operative functions</span>
          <h2 id="sf-services-h">What the co-operative does for its members</h2>
          <p class="lede">
            NATFISH exists to serve the {MEMBERS} fishers who own it: teaching
            fishery management, buying what they land, and marketing it on their
            behalf.
          </p>
        </div>

        <div class="grid grid--3">
          <div class="pillar pillar--center reveal">
            <span class="pillar__icon">{icon("steward")}</span>
            <h3>Education in fishery management</h3>
            <p>
              The Society supports its members with education in fishery
              management, so that the fishery they depend on keeps producing.
            </p>
          </div>
          <div class="pillar pillar--center reveal">
            <span class="pillar__icon">{icon("net")}</span>
            <h3>Purchasing members' produce</h3>
            <p>
              NATFISH purchases the produce its members land, giving a fisher a
              reliable route for the day's catch.
            </p>
          </div>
          <div class="pillar pillar--center reveal">
            <span class="pillar__icon">{icon("route")}</span>
            <h3>Marketing on members' behalf</h3>
            <p>
              The Society markets that produce collectively and works to secure
              the best possible value in international markets.
            </p>
          </div>
        </div>
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
            "Food Safety &amp; Responsible Fisheries | NATFISH Belize",
            "NATFISH works to operate in accordance with HACCP and U.S. FDA "
            "regulations, and has participated in seafood traceability work and "
            "Belize's spiny lobster Fishery Improvement Project.",
            "responsible.html",
        )
        + header("responsible.html")
        + page_hero(
            "Responsible Fisheries",
            "Careful handling and better information",
            "How the co-operative works with its product, its records and the "
            "wider management of Belize's fisheries.",
            "Responsible Fisheries",
        )
        + f"""
    <section class="section section--navy" aria-labelledby="rf-mission-h">
      <div class="container container--narrow">
        <div class="section-head section-head--center reveal">
          {RULE_WAVE}
          <span class="eyebrow">Our mission</span>
          <h2 id="rf-mission-h">To operate in accordance with HACCP and U.S. FDA regulations.</h2>
          <p class="lede">
            Food safety and consumer protection are among our highest priorities
            as we support globally recognized artisanal fishing.
          </p>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="rf-quality-h">
      <div class="container">
        <div class="split">
          <div class="split__media reveal">{picture("07-lobster-washing-station", "(max-width: 860px) 92vw, 46vw")}</div>
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
          </div>
        </div>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="rf-trace-h">
      <div class="container">
        <div class="split split--media-right">
          <div class="split__media reveal">{picture("08-lobster-weighing-and-sorting", "(max-width: 860px) 92vw, 46vw")}</div>
          <div class="reveal">
            <span class="eyebrow">Traceability</span>
            <h2 class="h-icon" id="rf-trace-h">{icon("tag", "h-icon__mark")} Knowing where the catch came from</h2>
            <p class="lede">
              NATFISH has participated in electronic catch-documentation and
              traceability initiatives designed to improve operational
              efficiency and seafood information through the supply chain.
            </p>
            <p>
              Good catch information helps the co-operative run more efficiently
              and helps buyers understand what they are purchasing. It is a
              practical tool as much as a compliance one.
            </p>
            <p class="note">
              Learn more:
              <a href="{SRC_FISHWISE}" target="_blank" rel="noopener noreferrer">FishWise, the story of the National Fishermen's Co-operative in Belize</a>.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="rf-fip-h">
      <div class="container">
        <div class="split">
          <div class="split__media reveal">{picture("10-cold-storage-room", "(max-width: 860px) 92vw, 46vw")}</div>
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
              over time. For a co-operative whose members depend on that fishery,
              the interest is direct.
            </p>
            <p class="note">
              Learn more:
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
          <strong>Certifications and documentation.</strong> NATFISH can
          confirm which certifications, standards and documentation apply to a
          given product and a given market. Ask the team for what your market
          requires.
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
            "Announcements, co-operative updates, fisheries-sector developments "
            f"and media coverage relevant to {LEGAL_NO_DOT}.",
            "news.html",
        )
        + header("news.html")
        + page_hero(
            "What&rsquo;s New",
            "What&rsquo;s New at NATFISH",
            "Announcements, co-operative updates and fisheries-sector "
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
            {update_link(featured)}
          </div>
        </article>
      </div>
    </section>

    <section class="section" aria-labelledby="news-more-h">
      <div class="container">
        <div class="section-head reveal section-head--center">
          <span class="eyebrow">More updates</span>
          <h2 id="news-more-h">Also happening</h2>
        </div>
        <div class="grid grid--2">
          {others}
        </div>
      </div>
    </section>
"""
        # No gallery shortcut anywhere on this page, by client instruction: the
        # "Photo feature" band and the Gallery call-to-action that used to close
        # the page were both detours off an announcements page, and the client
        # found them diluting. Gallery is still one click away in the nav and in
        # the footer. What's New now closes to the same place the commercial
        # pages do.
        + cta_band(
            "Contact",
            "Talk to the co-operative",
            "Questions about an update, the co-operative or a buyer "
            "requirement all reach the same team.",
            [
                '<a class="btn btn--primary" href="contact.html">Contact NATFISH</a>',
                f'<a class="btn btn--ghost" href="{BUYER_CTA}">Buyer Enquiry</a>',
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
            "A plain-language guide to Belize's standard regulated seasons for "
            "Caribbean spiny lobster and queen conch. Contact NATFISH to "
            "confirm current availability.",
            "seafood-seasons.html",
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
          {picture("04-fresh-conch-processing-closeup", "(max-width: 900px) 100vw, 60vw", eager=True, focus="50% 52%")}
        </div>
      </div>
    </section>

    <div class="container">
      <p class="notice notice--strong reveal">
        <strong>Belize's national fisheries seasons.</strong> The dates below
        summarise the standing seasons set for the country's fisheries. For
        what NATFISH has available right now, and in what form, ask the
        co-operative.
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

# The ten authentic photographs lead, in a sequence that follows the work
# itself: people, then process, then product, then cold storage. The four
# packaging photographs follow as a separate, labelled group, because they are
# recreations and should not be read as part of the documentary set.
#
# "wide" spans two columns. Only the three landscape frames get it; forcing a
# portrait photograph into a wide cell is what produces the letterboxed,
# filler-bar look the brief rules out.
GALLERY_AUTHENTIC = [
    ("01-lobster-packing-team-wide", "wide"),
    ("09-lobster-processing-table", ""),
    ("07-lobster-washing-station", ""),
    ("03-lobster-processing-room-wide", "wide"),
    ("08-lobster-weighing-and-sorting", ""),
    ("02-lobster-packing-line-portrait", ""),
    ("04-fresh-conch-processing-closeup", "wide"),
    ("05-lobster-tail-packing-boxes", ""),
    ("06-lobster-tail-packing-close", ""),
    ("10-cold-storage-room", ""),
]

GALLERY_PRODUCTS = [
    ("01-belizean-pride-lobster-cases", "wide"),
    ("02-belizean-pride-orange-lobster-tails", ""),
    ("03-belizean-pride-raw-lobster-tails", ""),
    ("04-wild-caught-frozen-conch", "wide"),
]


# The client's supplied set, in their own numbered order. GALLERY_GROUPS is
# generated from the folder each file arrived in, so the classification comes
# from the client and cannot drift out of step with the images.
def _supplied_order(stem):
    """Group first, then the client's own filename order inside each group.

    The original ten were numbered 01-10 in exactly this grouping, so sorting
    by group reproduces their order untouched and drops each new photograph in
    beside the ones it belongs with, rather than trailing seven strangers off
    the end of the "All" view.
    """
    keys = [k for k, _ in GALLERY_CLASSES]
    return (keys.index(GALLERY_GROUPS[stem]), stem)


GALLERY_SUPPLIED = sorted(GALLERY_GROUPS, key=_supplied_order)


# A gallery card is 4:3. The first supplied set was uniformly 4:3 too, so those
# photographs render at their own natural proportions with no crop at all,
# which is what the client asked for. The second delivery is not: a 2.17
# panorama, two 0.75 portraits and three 16:9 frames. Left natural they would
# tear holes in a grid of 4:3 neighbours, so anything that is not already 4:3
# is held in the standard card and cropped, with a focal point set per image.
# Derived from the real file dimensions rather than a hand-kept list, so a
# future addition cannot be forgotten.
def needs_crop(stem):
    w, h = DIMS[stem]
    return abs(w / h - 4 / 3) > 0.01


def gallery_filter_bar():
    """Unobtrusive filter tabs over the client's supplied set.

    The gallery had no filter of any kind, and the client's instruction is to
    add one using their three labels exactly. It is a group of buttons rather
    than links or a <select>: the filtering is in-page state, not navigation,
    and `aria-pressed` is what tells a screen reader which view is active.

    Everything is visible with no JavaScript. The bar is only revealed once the
    script has taken charge of it, so a visitor without JS sees all ten
    photographs rather than a row of dead buttons.
    """
    tabs = ['<button class="gallery-filter__btn is-active" type="button" '
            'data-gallery-filter="all" aria-pressed="true">All</button>']
    for key, label in GALLERY_CLASSES:
        tabs.append(f'<button class="gallery-filter__btn" type="button" '
                    f'data-gallery-filter="{key}" aria-pressed="false">{label}</button>')
    joined = "\n            ".join(tabs)
    return f"""<div class="gallery-filter reveal" data-gallery-filter-bar hidden>
            <span class="gallery-filter__label" id="gal-filter-label">Show</span>
            <div class="gallery-filter__tabs" role="group" aria-labelledby="gal-filter-label">
            {joined}
            </div>
          </div>"""


def gallery_supplied_figures():
    """The supplied photographs, captions and alt text used verbatim.

    The first ten are all 1600x1200. `picture()` writes the real dimensions and
    the stylesheet holds each figure at `--ratio`, so they render at their
    native 4:3 with no crop of ours on top of the client's own framing. The
    seven added since are mixed, and `needs_crop()` puts the ones that are not
    4:3 into the standard card with a measured focal point instead.
    """
    sizes = "(max-width: 460px) 92vw, (max-width: 860px) 46vw, 30vw"
    out = []
    for stem in GALLERY_SUPPLIED:
        crop = " gallery__figure--crop" if needs_crop(stem) else ""
        out.append(
            f"""<figure class="gallery__figure{crop}" data-gallery-cat="{GALLERY_GROUPS[stem]}">
            <button class="gallery__item" type="button"
                    aria-label="View larger: {SHORT[stem]}">
              {picture(stem, sizes, full=True)}
            </button>
            <figcaption>{CAPTION[stem]}</figcaption>
          </figure>"""
        )
    return "\n          ".join(out)


def gallery_figures(items):
    out = []
    for stem, _mod in items:
        cls = ""
        sizes = "(max-width: 460px) 92vw, (max-width: 860px) 46vw, 30vw"
        out.append(
            f"""<figure class="gallery__figure{cls}">
            <button class="gallery__item" type="button"
                    aria-label="View larger: {SHORT[stem]}">
              {picture(stem, sizes, full=True)}
            </button>
            <figcaption>{SHORT[stem]}.</figcaption>
          </figure>"""
        )
    return "\n          ".join(out)


# The three YouTube Shorts the client supplied, in their order, with their
# titles. The footage could not be viewed from this environment - YouTube is
# outside the network policy here - so the titles ship exactly as given and
# nothing is asserted about what each clip contains beyond the title itself.
#
# youtube-nocookie.com, not youtube.com: the privacy-enhanced host sets no
# tracking cookie until the visitor actually starts a video.
SHORTS = [
    ("p2_6LaOfD1o", "The Caribbean Spiny Lobster Harvest"),
    ("_6veScdF7Oc", "Working Belize&rsquo;s Waters"),
    ("qyHOSf9wVSI", "From Sea to Market"),
]

# What the player is allowed to reach for. YouTube's own embed list, minus
# nothing: dropping an entry here breaks fullscreen or picture-in-picture
# rather than tightening anything, because the iframe is sandboxed by origin.
SHORT_ALLOW = ("accelerometer; autoplay; clipboard-write; encrypted-media; "
               "gyroscope; picture-in-picture; web-share")


def short_card(video):
    """One 9:16 Short.

    `loading="lazy"` is what keeps three players off the critical path: the
    section sits well below the fold, so nothing is fetched from YouTube until
    the visitor scrolls near it, and nothing plays until they press play. The
    title is on the iframe as well as on the card, because a screen reader
    landing inside the frame has only the iframe's own accessible name.

    No VideoObject structured data. It needs a thumbnail URL, an upload date
    and a duration, and inventing any of the three would be worse than having
    no rich result at all.
    """
    vid, title = video
    plain = title.replace("&rsquo;", "\u2019")
    return f"""<figure class="video-card">
            <div class="video-card__frame">
              <iframe src="https://www.youtube-nocookie.com/embed/{vid}"
                      title="{plain}"
                      loading="lazy"
                      referrerpolicy="strict-origin-when-cross-origin"
                      allow="{SHORT_ALLOW}"
                      allowfullscreen></iframe>
            </div>
            <figcaption class="video-card__title">{title}</figcaption>
          </figure>"""


def gallery():
    return (
        head(
            "Inside NATFISH | Belize Seafood Processing Gallery",
            "Photographs from inside the NATFISH facility in Belize City: the "
            "packing team, lobster and conch processing, packing and cold "
            "storage.",
            "gallery.html",
        )
        + header("gallery.html")
        + page_hero(
            "Gallery",
            "The people, the process, the product",
            "An authentic look at the harvest, the people, the processing and "
            f"the packed product of {LEGAL_NO_DOT}. Select any photograph "
            "to view it larger, or watch "
            '<a href="#natfish-in-motion">NATFISH in Motion</a>.',
            "Gallery",
        )
        + f"""
    <section class="section" aria-labelledby="gal-supplied-h">
      <div class="container">
        <div class="section-head section-head--rule reveal section-head--center">
          {RULE_WAVE}
          <span class="eyebrow">From the co-operative</span>
          <h2 id="gal-supplied-h">Fishing, product and representation</h2>
          <p class="lede">Photographs supplied by NATFISH, across the harvest,
          the packed product and the co-operative representing Belizean seafood.</p>
        </div>
        {gallery_filter_bar()}
        <div class="gallery reveal" data-gallery-filterable>
          {gallery_supplied_figures()}
        </div>
        <p class="gallery-empty" data-gallery-empty hidden role="status">
          No photographs in this group.
        </p>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="gal-photos-h">
      <div class="container">
        <div class="section-head section-head--rule reveal section-head--center">
          {RULE_WAVE}
          <span class="eyebrow">Inside the facility</span>
          <h2 id="gal-photos-h">Inside the processing rooms</h2>
        </div>
        <div class="gallery reveal">
          {gallery_figures(GALLERY_AUTHENTIC)}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="gal-products-h">
      <div class="container">
        <div class="section-head section-head--rule reveal section-head--center">
          {RULE_WAVE}
          <span class="eyebrow">Product and packaging</span>
          <h2 id="gal-products-h">How the product is packed</h2>
          <p class="lede">{RECREATION_NOTE}</p>
        </div>
        <div class="gallery reveal">
          {gallery_figures(GALLERY_PRODUCTS)}
        </div>
      </div>
    </section>

    <section class="section" id="natfish-in-motion" aria-labelledby="gal-motion-h">
      <div class="container">
        <div class="section-head reveal section-head--center">
          <span class="eyebrow">Videos</span>
          <h2 id="gal-motion-h">NATFISH in Motion</h2>
          <p class="lede">See the people, work and waters behind Belizean Pride
          seafood.</p>
        </div>
        <div class="video-grid reveal">
          {"".join(short_card(v) for v in SHORTS)}
        </div>
      </div>
    </section>

    <section class="section section--navy" aria-labelledby="gal-video-h">
      <div class="container container--narrow">
        <div class="section-head section-head--center reveal">
          <span class="eyebrow">Video</span>
          <h2 id="gal-video-h">On film</h2>
          <p class="lede" style="margin-inline:auto">
            Documentary material about the co-operative, filmed by Ocean Link
            and used with attribution.
          </p>
        </div>

        <div class="video reveal" data-video="{VIDEO_ID}" data-video-title="{VIDEO_TITLE}">
          <button class="video__poster" type="button" aria-label="Play the video: {VIDEO_TITLE}">
            {picture("hero-2-boat-leaving-harbour", "(max-width: 900px) 96vw, 880px", alt="")}
            <span class="video__play">{ICON_PLAY}</span>
            <span class="video__label">{VIDEO_TITLE}</span>
          </button>
        </div>
        <p class="video-credit reveal">
          Courtesy of {VIDEO_SOURCE}, used with attribution.
        </p>
      </div>
    </section>
"""
        + cta_band(
            "Contact",
            "Get in touch with NATFISH",
            "Questions about the co-operative, its products or a buyer "
            "requirement all reach the same team.",
            [
                '<a class="btn btn--primary" href="contact.html">Contact NATFISH</a>',
                f'<a class="btn btn--ghost" href="{BUYER_CTA}">Buyer Enquiry</a>',
            ],
        )
        + footer(with_lightbox=True)
    )


# ========================================================== natfish ai ===

# Four balanced capabilities. Two of them are actions, not lookups: the page
# has to show that a visitor can start something here, not only read something.
AI_CARDS = [
    ("lobster", "Explore approved seafood",
     "Learn about NATFISH&rsquo;s approved lobster, queen conch and lionfish "
     "products."),
    ("chat", "Start an order request",
     "Tell NATFISH AI which approved product you need, the quantity and your "
     "preferred pickup or fulfilment details."),
    ("pin", "Get NATFISH information",
     "Ask about the Co-operative, contact details, location, opening hours and "
     "other verified information."),
    ("route", "Ask in English or Spanish",
     "Continue the conversation in the language that is most comfortable for "
     "you."),
]

AI_STEPS = [
    ("Choose your seafood",
     "Select from NATFISH&rsquo;s approved product list and tell NATFISH AI the "
     "approximate quantity you need."),
    ("Share your details",
     "Provide your name, telephone or WhatsApp number, email address and any "
     "useful pickup or fulfilment notes."),
    ("The NATFISH team confirms",
     "Your request is sent to the team, who will confirm availability, pricing "
     "and the next steps for pickup or fulfilment."),
]


def ai_jsonld():
    """WebPage plus Service, both pointing at the existing Organization.

    No rating, no offer, no price and no availability: NATFISH confirms all of
    those with the customer after a request, and structured data is republished
    verbatim by machines that will not read the page.
    """
    return f"""  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@graph": [
      {{
        "@type": "WebPage",
        "name": "NATFISH AI",
        "description": "NATFISH AI is the digital employee of {LEGAL_NO_DOT}. Ask questions, explore approved seafood and start an order request in English or Spanish.",
        "inLanguage": ["en", "es"],
        "about": {{
          "@type": "Organization",
          "name": "{LEGAL}",
          "alternateName": "NATFISH"
        }}
      }},
      {{
        "@type": "Service",
        "name": "NATFISH AI",
        "serviceType": "Seafood order request and customer information assistant",
        "description": "An AI assistant that answers questions about the Co-operative and its approved seafood, and helps a visitor prepare an order request for the NATFISH team to confirm.",
        "availableLanguage": ["en", "es"],
        "provider": {{
          "@type": "Organization",
          "name": "{LEGAL}",
          "alternateName": "NATFISH"
        }}
      }}
    ]
  }}
  </script>
"""


def natfish_ai():
    cards = "\n          ".join(
        f"""<div class="pillar reveal">
            <span class="pillar__icon">{icon(ico)}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </div>"""
        for ico, title, body in AI_CARDS
    )
    steps = "\n            ".join(
        f"""<li class="reveal">
              <h3>{title}</h3>
              <p>{body}</p>
            </li>"""
        for title, body in AI_STEPS
    )
    products = "\n          ".join(
        f"""<li class="order-item reveal">
            {order_thumb(prod)}
            <div class="order-item__name">
              <h3>{prod["name"]}</h3>
              {sci_line(prod)}
            </div>
            {order_button(prod, fallback="#ai-embed")}
          </li>"""
        for prod in CATALOGUE
    )

    return (
        head(
            "NATFISH AI | Ask Questions &amp; Start a Seafood Order",
            f"Meet NATFISH AI, the digital employee for {LEGAL_NO_DOT}. Ask "
            "questions, explore approved seafood and start an order in English "
            "or Spanish.",
            "natfish-ai.html",
            extra_jsonld=ai_jsonld(),
        )
        + header("natfish-ai.html")
        + page_hero(
            "NATFISH AI",
            "Meet NATFISH AI, your digital guide to seafood and orders",
            "Ask about NATFISH, explore the Co-operative&rsquo;s approved seafood "
            "products or start an order request in English or Spanish. NATFISH "
            "AI is available from any page of the website whenever you need "
            "assistance.",
            "NATFISH AI",
            actions=(
                ai_button("Start an order with NATFISH AI", "#ai-embed")
                + '<a class="arrow-link" href="#approved-products">View approved seafood</a>'
            ),
        )
        + f"""
    <section class="section" aria-labelledby="ai-chat-h">
      <div class="container container--narrow">
        <div class="section-head section-head--center reveal">
          <span class="eyebrow">The assistant</span>
          <h2 id="ai-chat-h">Chat with NATFISH AI</h2>
          <p class="lede">
            Ask a question or start an order request right here. Everything
            below explains what NATFISH AI can do and which seafood you can
            order.
          </p>
        </div>

        <!-- The client's Chatbase iframe embed, in the page it belongs on.
             The script gives it its src when it scrolls into view, so a
             visitor who never reaches it never sends a request to
             chatbase.co, and every trigger on this page scrolls here rather
             than opening a second copy of the same conversation. -->
        <div class="ai-embed" id="ai-embed" aria-label="NATFISH AI chat">
          <div class="ai-embed__frame"></div>
        </div>
        <p class="ai-embed__note">
          NATFISH AI answers in English or Spanish. A NATFISH team member
          confirms every order.
        </p>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="ai-can-h">
      <div class="container">
        <div class="section-head section-head--rule section-head--center reveal">
          {RULE_WAVE}
          <span class="eyebrow">What it does</span>
          <h2 id="ai-can-h">What NATFISH AI does</h2>
        </div>

        <div class="ai-grid">
          {cards}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="ai-how-h">
      <div class="container">
        <div class="section-head section-head--rule section-head--center reveal">
          {RULE_WAVE}
          <span class="eyebrow">How it works</span>
          <h2 id="ai-how-h">How an order request works</h2>
        </div>
        <ol class="ai-steps">
            {steps}
        </ol>
        <p class="ai-note reveal" style="margin-top:clamp(1.75rem,3.5vw,2.5rem)">
          Starting an order is conversational. NATFISH AI guides you through the
          details, summarizes the request and asks permission before it is
          shared with the team.
        </p>
      </div>
    </section>

    <section class="section section--sand" id="approved-products" aria-labelledby="ai-products-h">
      <div class="container container--narrow">
        <div class="section-head section-head--center reveal">
          <span class="eyebrow">Approved Products</span>
          <h2 id="ai-products-h">Choose seafood for your order request</h2>
          <p class="lede">
            Explore NATFISH&rsquo;s approved seafood products below. When you are
            ready, start a conversation with NATFISH AI and share the product,
            quantity and pickup or fulfilment details for your order request.
          </p>
        </div>

        <ul class="order-list">
          {products}
        </ul>

        <p class="order-list__cta reveal">
          {ai_button("Start a seafood order", "#ai-embed")}
        </p>

        <p class="note reveal" style="text-align:center">
          Full product descriptions are on
          <a href="seafood-services.html">Seafood &amp; Services</a>.
        </p>
      </div>
    </section>

    <section class="section" aria-labelledby="ai-privacy-h">
      <div class="container container--narrow">
        <div class="section-head section-head--center reveal">
          <span class="eyebrow">Using it well</span>
          <h2 id="ai-privacy-h">Your information, handled with care</h2>
        </div>
        <div class="ai-privacy reveal">
          <p>
            NATFISH AI is an AI-powered service. It uses the information you
            provide to answer your questions and help prepare your request. When
            contact or order details need to be shared with the NATFISH team,
            NATFISH AI should ask for your permission first.
          </p>
          <p>
            Share only the information needed for your enquiry or order request.
            Payment arrangements and final order details are handled with the
            NATFISH team after the request is reviewed.
          </p>
          <ul class="checklist">
            <li>{ICON_CHECK}<span>Information you provide is never sold, rented or given away.</span></li>
            <li>{ICON_CHECK}<span>Only information relevant to the conversation or request should be collected.</span></li>
            <li>{ICON_CHECK}<span>Consent is requested before contact or order details are sent to the team.</span></li>
            <li>{ICON_CHECK}<span>The visitor may contact NATFISH directly instead of using AI.</span></li>
          </ul>
        </div>
      </div>
    </section>
"""
        + cta_band(
            "NATFISH AI",
            "Ready when you are",
            "Start a seafood order request with NATFISH AI, or reach the team "
            "directly whenever you would rather speak with someone.",
            [
                ai_button("Start an order with NATFISH AI", "#ai-embed"),
                '<a class="btn btn--ghost" href="contact.html">Contact the NATFISH team</a>',
            ],
        )
        + footer(with_ai_pill=False)
    )


# ============================================================= contact ===

# The short list beside the assistant. Deliberately four lines: it is a
# "before you start" prompt, not the full checklist further down the page, and
# a visitor who has to read nine bullets before clicking will not click.
READY_LIST = [
    "Which of the products you need",
    "The approximate quantity you would like",
    "Your name, telephone number and email address",
    "Your preferred pickup or fulfilment details",
]

# The full list, for whichever route the visitor takes. Nothing here states a
# minimum, a grade, a weight, a price or a turnaround: those are the team's to
# confirm, and the page must not pre-empt them.
CHECKLIST = [
    "Your name, and your company if you are buying for one",
    "Which of the products you need",
    "Approximate quantity",
    "Your preferred timeframe",
    "Telephone or WhatsApp number",
    "Email address",
    "Pickup or fulfilment details",
    "Packaging or preparation requirements, if applicable",
    "Anything else NATFISH should know",
]

# Named so a buyer can say exactly which product they mean. Both enquiry drafts
# carry the same eight lines, so the pick-list on the page and the one in
# the message a buyer sends never drift apart.
PRODUCT_PICKS = [p["name"] for p in CATALOGUE]

# One list, three places: the pick-list rendered on the page, the email draft
# and the WhatsApp draft.
_PICK_LINES = "\n".join(f"  - {name}" for name in PRODUCT_PICKS)
EMAIL_BODY = EMAIL_TEMPLATE.format(products=_PICK_LINES)
WHATSAPP_BODY = WHATSAPP_TEMPLATE.format(products=_PICK_LINES)


def hours_block(label, schedule):
    """One opening-hours schedule as a definition list.

    A list rather than a sentence: the office and the market each keep a
    weekday time and a different Saturday time, and four times run together in
    prose is exactly the sort of thing a customer misreads on a phone.
    """
    rows = "\n              ".join(
        f"<div><dt>{days}</dt><dd>{time}</dd></div>" for days, time in schedule
    )
    return f"""<div class="hours">
              <p class="hours__label">{label}</p>
              <dl class="hours__list">
              {rows}
              </dl>
            </div>"""


def contact():
    ready = "\n              ".join(
        f'<li>{ICON_CHECK}<span>{item}</span></li>' for item in READY_LIST
    )
    checks = "\n            ".join(
        f'<li>{ICON_CHECK}<span>{item}</span></li>' for item in CHECKLIST
    )
    picks = "\n              ".join(
        f'<li>{name}</li>' for name in PRODUCT_PICKS
    )

    return (
        head(
            "Contact NATFISH &amp; Start a Seafood Order | Belize City",
            "Start a seafood order request with NATFISH AI, or contact the "
            f"NATFISH team directly by email, WhatsApp or telephone at {ADDRESS}.",
            "contact.html",
        )
        + header("contact.html")
        + page_hero(
            "Contact",
            "Contact NATFISH or start a seafood order",
            "Start an order request online with NATFISH AI, or reach the team "
            "directly by email, WhatsApp or telephone. Either route reaches the "
            "same people, and a NATFISH team member confirms every order.",
            "Contact",
            actions=(
                ai_button("Start an order with NATFISH AI", "natfish-ai.html")
                + '<a class="arrow-link" href="#reach-the-team">Contact the team directly</a>'
            ),
        )
        + f"""
    <section class="section" id="order" aria-labelledby="order-h">
      <div class="container">
        <div class="section-head section-head--rule section-head--center reveal">
          {RULE_WAVE}
          <span class="eyebrow">Ordering</span>
          <h2 id="order-h">Two ways to start a seafood order request</h2>
          <p class="lede" style="margin-inline:auto">
            Both routes reach the same NATFISH team. Choose whichever suits you.
          </p>
        </div>

        <div class="paths">
          <!-- Path one leads: it is the only route that answers immediately.
               Path two is the same width on a phone and deliberately quieter,
               not smaller, on a wide screen -- someone who wants a person
               should never have to hunt for one. -->
          <article class="path path--ai reveal" aria-labelledby="path-ai-h">
            <span class="path__tag">Available online</span>
            <span class="path__icon">{ICON_CHAT}</span>
            <h3 id="path-ai-h">Order and ask questions with NATFISH AI</h3>
            <p>
              NATFISH AI is the Co-operative&rsquo;s digital employee. Tell it
              which approved product you need and it will walk you through the
              details, put your order request together and pass it to the
              NATFISH team, who confirm everything with you directly.
            </p>

            <div class="path__ready">
              <h4>Have these ready</h4>
              <ul class="checklist">
              {ready}
              </ul>
            </div>

            <p class="path__action">
              {ai_button("Start an order with NATFISH AI", "natfish-ai.html")}
            </p>
            <a class="arrow-link" href="natfish-ai.html">How NATFISH AI works</a>
          </article>

          <article class="path path--team reveal" id="reach-the-team" aria-labelledby="path-team-h">
            <span class="path__tag">Speak with a person</span>
            <span class="path__icon">{ICON_MAIL}</span>
            <h3 id="path-team-h">Prefer to contact the team directly?</h3>
            <p>
              Email or WhatsApp opens a message you can edit before you send it,
              already laid out with everything the team needs. Telephone reaches
              the office during opening hours.
            </p>

            <div class="path__action path__action--stack">
              <a class="btn btn--primary" href="{mailto_href()}">
                {ICON_MAIL} Email the order team
              </a>
              <a class="btn btn--whatsapp" href="{whatsapp_href()}"
                 target="_blank" rel="noopener noreferrer">
                {ICON_WA} Message on WhatsApp
              </a>
              <a class="btn btn--ghost" href="tel:{TEL_HREF}">
                {ICON_PHONE} Call the office
              </a>
            </div>

            <p class="note">
              Email goes to <a href="mailto:{EMAIL}">{EMAIL}</a>, WhatsApp opens
              a chat with {MOBILE_DISPLAY}. The office is open {HOURS}, and
              Saturday, 8:00 a.m. to 12:00 p.m.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section--sand" id="what-to-include" aria-labelledby="include-h">
      <div class="container">
        <div class="enquiry">
          <div class="enquiry__intro reveal">
            <span class="eyebrow">Your order request</span>
            <h2 id="include-h">What to include with your seafood order request</h2>
            <p class="lede">
              The more of this you can share at the start, the faster a NATFISH
              team member can come back to you with availability and the
              arrangements for your order.
            </p>

            <p class="season-hint">
              Not sure whether a species is currently in season?
              <a href="seafood-seasons.html">View the Seafood Seasons guide</a>.
            </p>

            <!-- One action, not two: NATFISH AI already leads the ordering
                 section directly above, and this checklist serves whichever
                 route the visitor picked - repeating the assistant here made
                 the section read as another pitch for it. -->
            <div class="enquiry__actions">
              <a class="btn btn--primary" href="{mailto_href()}">
                {ICON_MAIL} Email the order team
              </a>
            </div>
          </div>

          <aside class="enquiry__checklist reveal" aria-labelledby="checklist-h">
            <h3 id="checklist-h">Include where you can</h3>
            <ul class="checklist checklist--two">
            {checks}
            </ul>

            <h3 id="products-h" style="margin-top:1.75rem">Which product?</h3>
            <p class="note" style="margin-top:0">
              Name one of these so the team can answer precisely.
            </p>
            <ul class="picklist" aria-labelledby="products-h">
              {picks}
            </ul>
          </aside>
        </div>
      </div>
    </section>

    <section class="section" id="office" aria-labelledby="office-h">
      <div class="container">
        <div class="section-head section-head--center reveal">
          <span class="eyebrow">The Office</span>
          <h2 id="office-h">Visit or reach the co-operative</h2>
          <p class="lede" style="margin-inline:auto">
            For co-operative matters, media requests and general questions.
          </p>
        </div>

        <div class="grid grid--3">
          <div class="contact-card reveal">
            <span class="contact-card__icon">{icon("coast")}</span>
            <h3>Visit</h3>
            <p>{ADDRESS}</p>
            {hours_block("Office hours", OFFICE_HOURS)}
            {hours_block("Market hours", MARKET_HOURS)}
            <a class="arrow-link" href="{MAPS}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
          </div>
          <div class="contact-card reveal">
            <span class="contact-card__icon">{ICON_PHONE}</span>
            <h3>Call</h3>
            <p>
              <a href="tel:{TEL_HREF}">{TEL_DISPLAY}</a>
              <span class="contact-card__tag">Primary office</span>
            </p>
            <p>
              <a href="tel:{TEL2_HREF}">{TEL2_DISPLAY}</a>
              <span class="contact-card__tag">Secondary office</span>
            </p>
            <p>
              <a href="tel:{MOBILE_HREF}">{MOBILE_DISPLAY}</a>
              <span class="contact-card__tag">Mobile &amp; WhatsApp</span>
            </p>
          </div>
          <div class="contact-card reveal">
            <span class="contact-card__icon">{ICON_MAIL}</span>
            <h3>Email</h3>
            <p>
              <a href="mailto:{EMAIL}">{EMAIL}</a>
              <span class="contact-card__tag">General and orders</span>
            </p>
            <a class="arrow-link" href="mailto:{EMAIL}">Email NATFISH</a>
          </div>
        </div>

        <div class="person-card reveal">
          <span class="person-card__icon">{icon("handling")}</span>
          <div class="person-card__body">
            <span class="eyebrow">Management</span>
            <h3>{GM_NAME}</h3>
            <p class="person-card__role">{GM_TITLE}</p>
            <p>
              For matters that need the General Manager directly:
              <a href="mailto:{GM_EMAIL}">{GM_EMAIL}</a>
            </p>
            <p class="note" style="margin-bottom:0">
              General enquiries and orders are answered faster at
              <a href="mailto:{EMAIL}">{EMAIL}</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
"""
        + cta_band(
            "About",
            "New to NATFISH?",
            f"A member-owned Belizean co-operative registered on {FOUNDED_DATE}, "
            f"owned by the {MEMBERS} fishers who make it up.",
            [
                '<a class="btn btn--primary" href="about.html">About NATFISH</a>',
                '<a class="btn btn--ghost" href="seafood-services.html">Seafood &amp; Services</a>',
            ],
        )
        + footer()
    )



# ============================================================== insights ===
#
# "Insights from NatFish" is kept deliberately separate from "What's New at
# NatFish". What's New carries company news, events, visits and announcements -
# things with a date that matters. Insights carries evergreen material:
# seafood education, fisheries knowledge, product information, handling
# guidance and, in time, fisher stories. Mixing the two would make both harder
# to scan, which is why they are two sections and two pages.
#
# The article copy below is the client's, used exactly as supplied. It is
# written into the page as semantic HTML - headings, paragraphs and a list -
# and NOT injected by script, so it is readable with JavaScript switched off
# and indexable by anything that fetches the page.

INSIGHTS_PAGE = "insights.html"

ARTICLE = {
    "slug": "insights-belizean-caribbean-spiny-lobster.html",
    "category": "Seafood Education",
    "title": "Belizean Caribbean Spiny Lobster: What Makes It Special?",
    "author": "NatFish Team",
    "date_iso": "2026-09-02",
    "date_display": "September 2, 2026",
    "img": "hero-belizean-pride-range",
    "alt": ("Belizean Pride wild-caught Caribbean spiny lobster products from "
            "NatFish in Belize."),
    "excerpt": ("Learn what sets Belizean Caribbean spiny lobster apart and how "
                "NatFish connects local fishers, careful processing and the "
                "market."),
    "meta": ("Discover what makes Belizean Caribbean spiny lobster special, "
             "from wild harvesting and careful handling to the cooperative "
             "role of NatFish."),
}

# The article body, as supplied. Section headings become <h2>; the bullet list
# stays a list. Nothing is reworded, shortened or padded with search terms.
ARTICLE_BODY = [
    ("p", "Caribbean spiny lobster is one of Belize&rsquo;s most recognizable "
          "seafood products. Known scientifically as <i>Panulirus argus</i>, it "
          "represents much more than a meal. It connects Belize&rsquo;s marine "
          "environment, the knowledge of local fishers, careful handling and a "
          "seafood tradition valued at home and abroad."),
    ("p", "At NatFish, that story begins with the people who harvest from "
          "Belizean waters and continues through the cooperative system that "
          "prepares seafood for the market."),
    ("h2", "A Product of Belizean Waters"),
    ("p", "Unlike farmed seafood, wild-caught Caribbean spiny lobster is "
          "harvested from its natural marine environment. Its quality begins at "
          "sea, where experience and responsible fishing practices are "
          "essential."),
    ("p", "The words &ldquo;Product of Belize&rdquo; therefore carry real "
          "meaning. They identify where the lobster originated while connecting "
          "the finished product to Belizean fishers and the communities that "
          "depend on the country&rsquo;s marine resources."),
    ("p", "Responsible harvesting also means respecting current fishing "
          "seasons, size requirements and other regulations established to "
          "protect the fishery. Buyers and consumers can support this effort by "
          "purchasing Belizean Pride lobster directly from NatFish and "
          "respecting the current rules governing the fishery."),
    ("h2", "Why Careful Handling Matters"),
    ("p", "Seafood requires careful handling throughout its journey from the "
          "sea to the customer. Temperature control, hygienic processing and "
          "appropriate packaging all contribute to the condition in which the "
          "product reaches homes, restaurants, hotels and distributors."),
    ("p", "NatFish&rsquo;s Belizean Pride whole-lobster packaging identifies "
          "the product as wild-caught, processed from live lobsters, "
          "individually wrapped and quick frozen. Individual wrapping makes the "
          "product easier to store and handle, while the frozen format supports "
          "distribution when the correct cold chain is maintained."),
    ("p", "Customers purchasing frozen lobster should look for intact "
          "packaging, keep the product properly frozen and follow safe "
          "preparation instructions."),
    ("h2", "Different Products for Different Kitchens"),
    ("p", "Caribbean spiny lobster can be supplied in several useful forms."),
    ("p", "A whole lobster creates a distinctive presentation and allows cooks "
          "to prepare the product according to their preferred recipe. Lobster "
          "meat can also be used in cooked dishes such as soups, stews, rice "
          "dishes, sauces and other local or international preparations."),
    ("p", "NatFish&rsquo;s Belizean Pride range includes individually wrapped, "
          "quick-frozen whole Caribbean spiny lobster and spiny lobster head "
          "meat. Offering different product formats helps households, "
          "restaurants and other buyers select the option that best suits their "
          "menus and preparation needs."),
    ("p", "It can also encourage fuller use of the catch by creating practical "
          "uses for different parts of the lobster."),
    ("h2", "The Value of a Fishermen&rsquo;s Cooperative"),
    ("p", "National Fishermen Producers Co-operative Society Ltd., known as "
          "NatFish, provides a structure through which seafood can be received, "
          "processed, packaged and prepared for the market."),
    ("p", "That cooperative structure connects individual fishers with a wider "
          "value chain. It helps give Belizean seafood a recognizable identity "
          "and creates a pathway between the people harvesting the product and "
          "the customers purchasing it."),
    ("p", "For buyers, knowing the source of seafood creates greater "
          "confidence. For Belize, maintaining that connection helps ensure "
          "that the country is recognized not only for its marine resources, "
          "but also for the people and organizations working throughout the "
          "seafood industry."),
    ("h2", "Why Buy Belizean Pride Directly from NatFish"),
    ("p", "Belizean Pride products are produced and packed by National "
          "Fishermen Producers Co-operative Society Ltd. Customers interested "
          "in the products featured here can therefore contact NatFish directly "
          "for current availability and ordering information."),
    ("p", "Customers can contact NatFish to:"),
    ("ul", [
        "Confirm which Belizean Pride products and formats are currently "
        "available.",
        "Ask about available quantities.",
        "Receive current ordering and collection information.",
        "Request appropriate storage and handling guidance.",
        "Learn about other available NatFish seafood products.",
    ]),
    ("p", "Buying directly from NatFish gives customers a clear point of "
          "contact for the Belizean Pride range. It also keeps the purchase "
          "connected to the cooperative and the Belizean fishermen behind the "
          "product."),
    ("h2", "Belizean Pride from Sea to Market"),
    ("p", "What makes Belizean Caribbean spiny lobster special is the complete "
          "story behind it. It begins in Belizean waters, depends on the skill "
          "of local fishers and continues through careful processing and "
          "preparation for the market."),
    ("p", "Through NatFish and the Belizean Pride product line, customers can "
          "discover seafood that carries a clear Belizean identity from its "
          "origin to the finished product."),
]


def reading_time():
    """Minutes, counted from the finished article rather than guessed.

    225 words a minute is the usual reading speed for prose of this kind.
    Counted from the rendered text, so it cannot drift from what is on the page.
    """
    words = 0
    for kind, body in ARTICLE_BODY:
        chunks = body if isinstance(body, list) else [body]
        for chunk in chunks:
            words += len(re.sub(r"<[^>]+>|&[a-z]+;", " ", chunk).split())
    return max(1, round(words / 225))


def article_jsonld():
    """Article, built only from what is actually on the page.

    No wordCount, no articleBody duplicate, no unverified publisher detail: the
    fields below are all things a reader can see for themselves on the page.
    """
    a = ARTICLE
    url = f"{SITE_URL}/{a['slug']}"
    img = f"{SITE_URL}/assets/img/official/og-article-spiny-lobster.jpg"
    data = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": a["title"],
        "description": a["meta"],
        "image": [img],
        "datePublished": a["date_iso"],
        "dateModified": a["date_iso"],
        "author": {"@type": "Organization", "name": a["author"]},
        "publisher": {
            "@type": "Organization",
            "name": LEGAL,
            "alternateName": "NatFish",
            "logo": {
                "@type": "ImageObject",
                "url": f"{SITE_URL}/assets/img/natfish-logo-1200.png",
            },
        },
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "inLanguage": "en-BZ",
        "articleSection": a["category"],
    }
    return ('  <script type="application/ld+json">\n  '
            + json.dumps(data, indent=2, ensure_ascii=False).replace("\n", "\n  ")
            + "\n  </script>\n")


def article_body_html():
    """The article body as semantic HTML: headings, paragraphs and one list.

    Built here rather than injected by script, so the article is readable with
    JavaScript off and indexable by anything that fetches the page.
    """
    nl = "\n"
    out = []
    for kind, body in ARTICLE_BODY:
        if kind == "ul":
            items = (nl + "            ").join(f"<li>{i}</li>" for i in body)
            out.append('<ul class="article__list">' + nl + "            " + items
                       + nl + "          </ul>")
        elif kind == "h2":
            out.append(f"<h2>{body}</h2>")
        else:
            out.append(f"<p>{body}</p>")
    return (nl + "          ").join(out)


def article_card(*, heading_level="h3"):
    """The article's card, shared by the homepage preview and the landing page.

    One definition so the two can never disagree about the title, the excerpt
    or the date.
    """
    a = ARTICLE
    return f"""<article class="insight-card reveal">
            <a class="insight-card__media" href="{a['slug']}" tabindex="-1" aria-hidden="true">
              {picture(a['img'] + '-desktop', "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw", alt="", tiers=hero_tiers(a['img'] + '-desktop'))}
            </a>
            <div class="insight-card__body">
              <p class="update-card__meta">
                <span class="update-card__tag">{a['category']}</span>
                <time class="update-card__date" datetime="{a['date_iso']}">{a['date_display']}</time>
              </p>
              <{heading_level}><a href="{a['slug']}">{a['title']}</a></{heading_level}>
              <p>{a['excerpt']}</p>
              <a class="arrow-link" href="{a['slug']}">Read the article on Belizean spiny lobster</a>
            </div>
          </article>"""


def insights():
    a = ARTICLE
    return (
        head(
            "Insights from NatFish | Belizean Seafood Knowledge",
            "Explore insights from NatFish on Belizean seafood, fisheries, "
            "product handling and the people behind Belize&rsquo;s fishing "
            "industry.",
            INSIGHTS_PAGE,
            og_image="official/og-article-spiny-lobster",
            extra_jsonld=breadcrumb_jsonld([("Home", "index.html"),
                                            ("Insights", INSIGHTS_PAGE)]),
        )
        + header(INSIGHTS_PAGE)
        + page_hero(
            "Insights",
            "Insights from NatFish",
            "Evergreen writing on Belizean seafood: what the co-operative "
            "handles, how it is prepared and what buyers should know. Company "
            "news, events and visits are on "
            f'<a href="news.html">What&rsquo;s New at NatFish</a>.',
            "Insights",
        )
        + f"""
    <section class="section" aria-labelledby="insights-list-h">
      <div class="container">
        <div class="section-head reveal section-head--center">
          <span class="eyebrow">Latest article</span>
          <h2 id="insights-list-h">Seafood education from the co-operative</h2>
        </div>
        <div class="insight-grid">
          {article_card()}
        </div>
      </div>
    </section>
"""
        + cta_band(
            "Seafood &amp; Services",
            "See what the co-operative supplies",
            "Frozen spiny lobster, queen conch and lionfish fillet, prepared by "
            "a Belizean fisher-owned co-operative.",
            [
                '<a class="btn btn--primary" href="seafood-services.html">View NatFish seafood products</a>',
                f'<a class="btn btn--ghost" href="{BUYER_CTA}">Start a seafood order</a>',
            ],
        )
        + footer()
    )


def article_page():
    a = ARTICLE
    mins = reading_time()
    return (
        head(
            f"{a['title']} | NatFish",
            a["meta"],
            a["slug"],
            og_image="official/og-article-spiny-lobster",
            og_type="article",
            extra_head="\n".join([
                f'  <meta property="article:published_time" content="{a["date_iso"]}">',
                f'  <meta property="article:modified_time" content="{a["date_iso"]}">',
                f'  <meta property="article:section" content="{a["category"]}">',
                f'  <meta name="author" content="{a["author"]}">',
            ]),
            extra_jsonld=article_jsonld() + breadcrumb_jsonld([
                ("Home", "index.html"),
                ("Insights", INSIGHTS_PAGE),
                (a["title"], a["slug"]),
            ]),
        )
        # header() has already opened <main id="main">; the article is the
        # page's main content, not a second landmark.
        + header(INSIGHTS_PAGE)
        + f"""
    <article class="article">
      <div class="container container--narrow">
        <nav class="breadcrumb reveal" aria-label="Breadcrumb">
          <ol>
            <li><a href="index.html">Home</a></li>
            <li><a href="{INSIGHTS_PAGE}">Insights</a></li>
            <li aria-current="page">{a['title']}</li>
          </ol>
        </nav>

        <header class="article__head reveal">
          <p class="update-card__meta">
            <span class="update-card__tag">{a['category']}</span>
            <time class="update-card__date" datetime="{a['date_iso']}">{a['date_display']}</time>
          </p>
          <h1>{a['title']}</h1>
          <p class="article__byline">By the {a['author']}
            <span class="article__dot" aria-hidden="true">&middot;</span>
            <span>{mins} minute read</span>
          </p>
        </header>
      </div>

      <div class="container">
        <figure class="article__figure reveal">
          {hero_picture(a['img'], 1, eager=True)}
        </figure>
      </div>

      <div class="container container--narrow">
        <div class="article__body reveal">
          {article_body_html()}
        </div>
      </div>
    </article>
"""
        + cta_band(
            "Belizean Pride",
            "Explore the products, or ask NatFish directly",
            "To learn more about available NatFish and Belizean Pride products, "
            "explore our Products page or contact NatFish on WhatsApp at "
            f"{MOBILE_DISPLAY}.",
            [
                '<a class="btn btn--primary" href="seafood-services.html">View NatFish seafood products</a>',
                f'<a class="btn btn--whatsapp" href="https://wa.me/{WHATSAPP}" target="_blank" rel="noopener noreferrer">{ICON_WA} Message NatFish on WhatsApp</a>',
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
    "natfish-ai.html": natfish_ai,
    "contact.html": contact,
    "insights.html": insights,
    ARTICLE["slug"]: article_page,
}


# Comments in these templates explain layout decisions to whoever edits them
# next. They are not for the public: shipping them puts build commentary in the
# source of a customer-facing page, which is the same class of thing as the
# internal notes the client asked to have taken off the rendered pages.
COMMENT_RE = re.compile(r"[ \t]*<!--(?!\[if).*?-->[ \t]*\n?", re.S)


def strip_comments(html):
    return COMMENT_RE.sub("", html)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, builder in PAGES.items():
        path = OUT / name
        path.write_text(strip_comments(builder()), encoding="utf-8")
        print(f"{name:26} {path.stat().st_size / 1024:6.1f} KB")


if __name__ == "__main__":
    main()
