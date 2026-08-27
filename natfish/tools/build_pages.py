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
    ADDRESS, ALT, BUYER_CTA, COMMITTEE, EMAIL, FOUNDED_DATE, GM_EMAIL, GM_NAME,
    GM_TITLE, ICON_ARROW, ICON_MAIL, ICON_PHONE, ICON_PIN, ICON_WA, LEGAL,
    LEGAL_NO_DOT, MAPS, MARKETS, MEMBERS, MOBILE_DISPLAY, MOBILE_HREF,
    RECREATION_NOTE, SHORT, TEL2_DISPLAY, TEL2_HREF, TEL_DISPLAY, TEL_HREF,
    VIDEO_ID, VIDEO_SOURCE, VIDEO_TITLE, WHATSAPP, SRC_BELTRAIDE,
    SRC_FISHERIES_DEPT, SRC_FISHERYPROGRESS, SRC_FISHSOURCE, SRC_FISHWISE,
    AI_PAGE, HOURS, RULE_WAVE, contact_strip, cta_band, footer, head, header, hero_picture,
    hero_preload, identity_ribbon, logo_full, page_hero, picture,
)

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

EMAIL_SUBJECT = "NATFISH Seafood Buyer Enquiry"
EMAIL_BODY = """Hello NATFISH,

I would like to enquire about purchasing seafood.

Name:
Company:
Country or location:
Telephone or WhatsApp:

Product required (delete those that do not apply):
  - Frozen Spiny Lobster Tails
  - Frozen Lobster Head Meat
  - Frozen Whole Raw Lobster
  - Frozen Whole Cooked Lobster
  - Frozen Queen Conch, 85% Cleaned
  - Lionfish Fillet

Approximate quantity:
Preferred timeframe:
Packaging or preparation requirements:
Destination or delivery location:
Additional information:

Thank you."""

WHATSAPP_BODY = """Hello NATFISH. I would like to make a seafood enquiry.

Name:
Company:
Location:

Product required (delete those that do not apply):
  - Frozen Spiny Lobster Tails
  - Frozen Lobster Head Meat
  - Frozen Whole Raw Lobster
  - Frozen Whole Cooked Lobster
  - Frozen Queen Conch, 85% Cleaned
  - Lionfish Fillet

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

# The four-step handling story. Every image is an authentic client photograph
# and every one of them is portrait, which is why this renders as a portrait
# card grid rather than the usual wide band.
PROCESS = [
    ("07-lobster-washing-station", "Careful handling",
     "Landed catch is rinsed and checked at the washing station before it goes "
     "any further."),
    ("08-lobster-weighing-and-sorting", "Weighing and sorting",
     "Each lot is weighed and sorted so what leaves the room matches what the "
     "buyer agreed to."),
    ("05-lobster-tail-packing-boxes", "Packing",
     "Product is bagged and packed into cartons by hand, ready for freezing."),
    ("10-cold-storage-room", "Cold storage",
     "Packed cartons move into cold storage and stay there until they ship."),
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


def process_step(stem, title, body, n):
    """One portrait card in the handling sequence."""
    return f"""<li class="step reveal">
            <div class="step__media">
              {picture(stem, "(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 23vw", full=True)}
              <span class="step__n" aria-hidden="true">{n}</span>
            </div>
            <div class="step__body">
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </li>"""


# The four approved hero images, in the approved order.
#
# Slides 1, 3 and 4 are photographs the client supplied specifically for the hero,
# each as a pre-cropped pair: a 2400x1080 landscape frame for the desktop hero
# and a 1080x1920 portrait frame for the phone. Because the client composed
# both crops, no focal point is applied to them - the browser simply picks the
# crop that matches the frame it is filling. The diver leads: he is the one
# frame where a Belizean fisher, the dock and the lobster itself all read at a
# glance, which is what the opening slide has to carry. The trade-show stand
# closes the rotation: it is the one frame that shows the co-operative
# presenting its own branded product, so it reads as the end of the journey the
# three water shots begin.
#
# Slide 2 is the last of the original V1 concept images and has no phone crop,
# so it keeps the older treatment: one photograph with a per-slide, per-
# breakpoint focal point set in the stylesheet against .hero__slide--2, chosen
# to keep the departing boat centred as the frame narrows.
HERO_SLIDES = [
    "hero-lobster-diver-dock",
    "hero-2-boat-leaving-harbour",
    "hero-lobster-boat-catch",
    "hero-trade-show-stand",
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
            preload=hero_preload(HERO_SLIDES[0]),
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
            Four steps between the landing and the container, photographed at
            the co-operative's own facility.
          </p>
        </div>

        <ol class="steps">
          {"".join(process_step(stem, t, b, i + 1) for i, (stem, t, b) in enumerate(PROCESS))}
        </ol>
      </div>
    </section>

    <section class="section" aria-labelledby="home-seafood-h">
      <div class="container">
        <div class="section-head section-head--rule reveal section-head--center">
          {RULE_WAVE}
          <span class="eyebrow">Seafood &amp; Services</span>
          <h2 id="home-seafood-h">Six products from Belizean waters</h2>
          <p class="lede">
            Frozen spiny lobster in four preparations, frozen queen conch and
            lionfish fillet. Availability follows Belize's regulated seasons and
            is confirmed directly with NATFISH.
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

    <section class="section section--sand" aria-labelledby="home-gallery-h">
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
            <p class="lede" style="margin-bottom:0.4rem">{LEGAL}</p>
            <p class="note" style="margin:0">
              NATFISH is the working digital name for the Society.
            </p>
          </div>
        </div>

        <div class="split" style="margin-top:clamp(2.5rem,5vw,4rem)">
          <div class="reveal">
            <span class="eyebrow">History</span>
            <h2>Registered on {FOUNDED_DATE}</h2>
            <p class="stat-line">{FOUNDED_DATE}.</p>
            <p>
              {LEGAL_NO_DOT} was registered in Belize City on {FOUNDED_DATE}.
              What began with a small founding group of fishers has grown into a
              member-owned co-operative of {MEMBERS} fishers.
            </p>
            <p>
              The co-operative is owned by its members and governed by a
              {COMMITTEE}-member Managing Committee elected from the general
              membership. Members are not customers of the Society; they are its
              owners, and the committee that runs it answers to them.
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
                <span class="factlist__key">Registered</span>
                <span class="factlist__val">{FOUNDED_DATE}, Belize City</span>
              </li>
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
              A co-operative gives a fisher more than a buyer for the day's
              catch. It gives a share in the organization, a vote in how it is
              run, and a route to markets that would otherwise be out of reach.
            </p>
            <p>
              Through the Society, Belizean seafood has reached buyers in
              {MARKETS}.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="about-mile-h">
      <div class="container container--narrow">
        <div class="section-head reveal section-head--center">
          <span class="eyebrow">Milestones</span>
          <h2 id="about-mile-h">Milestones</h2>
          <p class="lede">
            Only milestones NATFISH has confirmed, or that the public record
            supports, are listed. Further history will be added as the
            co-operative supplies it.
          </p>
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
                Membership has grown from a small founding group to {MEMBERS}
                fishers.
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
          Background sources:
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

    Three of the six products have a photograph that is truthfully theirs; the
    other three have none, and no borrowed or approximate image is used for
    them. Those carry the species mark on a navy panel instead - the same
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
    {
        "name": "Frozen Spiny Lobster Tails",
        "sci": "Panulirus argus",
        "icon": "lobster",
        "img": "03-belizean-pride-raw-lobster-tails",
        "body": "Lobster tails, individually bagged and packed into cartons at "
                "the co-operative's facility.",
    },
    {
        "name": "Frozen Lobster Head Meat",
        "sci": "Panulirus argus",
        "icon": "lobster",
        "img": None,
        "body": "Head meat recovered during lobster processing and frozen for "
                "market.",
    },
    {
        "name": "Frozen Whole Raw Lobster",
        "sci": "Panulirus argus",
        "icon": "lobster",
        "img": "09-lobster-processing-table",
        "body": "Whole spiny lobster, frozen raw rather than tailed.",
    },
    {
        "name": "Frozen Whole Cooked Lobster",
        "sci": "Panulirus argus",
        "icon": "lobster",
        # The one cooked-lobster photograph supplied shows cooked *tails*, not
        # whole cooked lobster, so it would be a false label here. It runs in
        # the gallery under its own accurate caption instead.
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
        "img": None,
        "body": "Fillet from an invasive Indo-Pacific species that Belizean "
                "fishers help keep in check on the reef.",
    },
]

AVAILABILITY_NOTE = (
    'Product availability follows <a href="seafood-seasons.html">Belize&rsquo;s '
    'regulated seasons</a> and current supply. '
    '<a href="{cta}">Contact NATFISH</a> to discuss current availability, '
    'specifications and buyer requirements.'
)


def product_card(prod):
    """One catalogue entry. Photographs are only used where they are truthful."""
    if prod["img"]:
        media = f"""<div class="product__media">
              {picture(prod["img"], "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw", full=True)}
            </div>"""
    else:
        media = f"""<div class="product__media product__media--mark">
              {icon(prod["icon"], "product__mark")}
            </div>"""
    return f"""<article class="product reveal">
            {media}
            <div class="product__body">
              <h3>{prod["name"]}</h3>
              <p class="product__sci"><i>{prod["sci"]}</i></p>
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
              Source:
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
          <strong>A note on certifications.</strong> Working in accordance with
          a regulation is not the same as holding a certificate against it.
          Certifications, standards and product-specific claims should be
          confirmed directly with NATFISH, which can advise what applies to a
          given product and a given market.
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
            <p class="update-card__source">
              Source: <a href="{featured['url']}" target="_blank" rel="noopener noreferrer">{featured['source']}</a>
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="news-feature-h">
      <div class="container">
        <div class="split split--media-right">
          <div class="split__media reveal">
            {picture("02-lobster-packing-line-portrait", "(max-width: 860px) 92vw, 46vw")}
          </div>
          <div class="reveal">
            <p class="update-card__meta">
              <span class="update-card__tag">Photo feature</span>
            </p>
            <h2 id="news-feature-h">Inside NATFISH: People, Process and Product</h2>
            <p class="lede">
              A set of photographs from inside the co-operative's own facility:
              the people who receive and prepare the catch, the steps between
              landing and cold storage, and the product that leaves at the end
              of it.
            </p>
            <p class="note">
              An evergreen feature, not a dated announcement. The photographs
              were supplied by NATFISH and do not document a specific event.
            </p>
            <a class="arrow-link" href="gallery.html">View the gallery</a>
          </div>
        </div>
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

        <p class="notice reveal" style="margin-top:clamp(2rem,4vw,3rem)">
          <strong>About this page.</strong> This page carries publicly sourced
          items only, with no dates, quotes or outcomes added beyond what the
          source supports. It is built to carry NATFISH announcements, events,
          public notices and media coverage as the co-operative publishes them.
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


def gallery():
    return (
        head(
            "Inside NATFISH | Belize Seafood Processing Gallery",
            "Photographs from inside the NATFISH facility in Belize City: the "
            "packing team, lobster and conch processing, packing and cold "
            "storage.",
        )
        + header("gallery.html")
        + page_hero(
            "Gallery",
            "The people, the process, the product",
            "An authentic look inside the people, processing, products and "
            f"cold-storage operations of {LEGAL_NO_DOT}. Select any photograph "
            "to view it larger.",
            "Gallery",
        )
        + f"""
    <section class="section" aria-labelledby="gal-photos-h">
      <div class="container">
        <div class="section-head section-head--rule reveal section-head--center">
          {RULE_WAVE}
          <span class="eyebrow">Inside the facility</span>
          <h2 id="gal-photos-h">Photographs supplied by NATFISH</h2>
        </div>
        <div class="gallery reveal">
          {gallery_figures(GALLERY_AUTHENTIC)}
        </div>
      </div>
    </section>

    <section class="section section--sand" aria-labelledby="gal-products-h">
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

    <section class="section section--navy" aria-labelledby="gal-video-h">
      <div class="container container--narrow">
        <div class="section-head section-head--center reveal">
          <span class="eyebrow">Video</span>
          <h2 id="gal-video-h">On film</h2>
          <p class="lede" style="margin-inline:auto">
            Third-party documentary material about the co-operative. NATFISH-owned
            video will be added here as it is supplied.
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
          Courtesy of {VIDEO_SOURCE}. This is third-party documentary footage
          used with attribution. It is not NATFISH-owned production.
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
              <p class="product__sci"><i>{prod["sci"]}</i></p>
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
    "Which of the six approved products you need",
    "The approximate quantity you would like",
    "Your name, telephone number and email address",
    "Your preferred pickup or fulfilment details",
]

# The full list, for whichever route the visitor takes. Nothing here states a
# minimum, a grade, a weight, a price or a turnaround: those are the team's to
# confirm, and the page must not pre-empt them.
CHECKLIST = [
    "Your name, and your company if you are buying for one",
    "Which of the six approved products you need",
    "Approximate quantity",
    "Your preferred timeframe",
    "Telephone or WhatsApp number",
    "Email address",
    "Pickup or fulfilment details",
    "Packaging or preparation requirements, if applicable",
    "Anything else NATFISH should know",
]

# Named so a buyer can say exactly which product they mean. Both enquiry drafts
# carry the same six lines, so the pick-list on the page and the pick-list in
# the message a buyer sends never drift apart.
PRODUCT_PICKS = [p["name"] for p in CATALOGUE]


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
              a chat with {MOBILE_DISPLAY}, and the office is open {HOURS}
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
            <p>
              {HOURS}
              <span class="contact-card__tag">Office hours</span>
            </p>
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
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, builder in PAGES.items():
        path = OUT / name
        path.write_text(builder(), encoding="utf-8")
        print(f"{name:26} {path.stat().st_size / 1024:6.1f} KB")


if __name__ == "__main__":
    main()
