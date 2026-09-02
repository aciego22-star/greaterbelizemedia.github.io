#!/usr/bin/env python3
"""Shared shell for the NATFISH pages: head, header, footer, components.

Imported by build_pages.py. The generated .html files are the deliverable and
can be hand-edited afterwards.

Accuracy tiers used throughout:
  VERIFIED FACT              supported by the research sources in the brief
  DESIGN / COPY TREATMENT    presentation, no factual claim
  CLIENT CONFIRMATION REQ.   never written onto a public page, see INTERNAL-NOTES
"""

import hashlib
import json
import pathlib

from build_icons import icon

SITE = "NATFISH"

# --------------------------------------------------------- cache busting --
#
# WHY THIS EXISTS. netlify.toml serves /assets/* with
# `max-age=31536000, immutable`, and `immutable` means exactly that: the
# browser is told never to revalidate for a year. With stable filenames, a
# returning visitor therefore keeps the CSS and JavaScript they first
# downloaded no matter what is deployed afterwards. The HTML updates (it is
# max-age=0), but it keeps pointing at the same asset URLs, so the update
# never lands. That is not hypothetical - it is what made a freshly deployed
# site look unchanged in one browser and correct in another.
#
# A content hash in the query string fixes it without giving up the caching:
# the URL changes only when the bytes change, so an unchanged asset stays
# cached for a year and a changed one is a different URL and is fetched.
#
# The hash is read from disk AT BUILD TIME, so `python3 tools/build_pages.py`
# has to be the LAST step after editing any stylesheet or script. Running it
# first would stamp the previous hash. make-netlify-zip.sh verifies this
# before packaging and refuses to build a zip with stale hashes.

ASSETS = pathlib.Path(__file__).resolve().parent.parent


def asset(rel):
    """`assets/css/natfish.css` -> `assets/css/natfish.css?v=<8 hex>`.

    A missing file returns the plain path rather than failing the build: the
    generators must still run on a checkout that has not built its derivatives
    yet, and a missing stylesheet is a louder failure elsewhere anyway.
    """
    path = ASSETS / rel
    if not path.is_file():
        return rel
    digest = hashlib.sha256(path.read_bytes()).hexdigest()[:8]
    return f"{rel}?v={digest}"

# The exact registered name supplied by the client for V2. The earlier build
# carried an apostrophe-and-hyphen spelling of the middle two words, which is
# not how the co-operative writes its own name.
LEGAL = "National Fishermen Producers Co-operative Society Ltd."
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
MOBILE_DISPLAY = "+501 628-1449"
MOBILE_HREF = "+5016281449"
WHATSAPP = "5016281449"

EMAIL = "nationalfishermen@gmail.com"
ADDRESS = "#1 Angel Lane, Belize City, Belize"
# Newly supplied by the client. Nothing on the site claimed opening hours
# before this, deliberately: the fabricated hours on the V1 storefront image
# were one of the reasons that image had to be destroyed.
HOURS = "Monday to Friday, 8:00 a.m. to 5:00 p.m."
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
VIDEO_TITLE = "The National Fishermen Co-operative of Belize"
VIDEO_SOURCE = "Ocean Link"

SRC_FISHWISE = "https://fishwise.org/dive-deeper/resource/belize-fisheries-the-story-of-the-national-fishermens-co-operative-in-belize/"
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
    ("Insights", "insights.html"),
    ("Gallery", "gallery.html"),
    ("NATFISH AI", "natfish-ai.html"),
    ("Contact", "contact.html"),
]

BUYER_CTA = "contact.html#order"

LOGO_ALT = "NATFISH &ndash; National Fishermen Producers Co-operative Society Ltd."

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
# The three approved homepage hero images. Separate folder because their
# provenance is different: these are illustrative sea-and-boat photographs from
# the original concept pack, not photographs the General Manager supplied of
# NATFISH's own people and rooms. Their alt text follows the concept-imagery
# rule from the original brief and never asserts that a person, vessel or catch
# belongs to NATFISH.
CONCEPT = "assets/img/concept"
# GALLERY  ten photographs the client supplied for the Gallery page, already
#          standardised by them to 1600x1200 and sorted into three named
#          classifications. Their own folder because the supplied filenames
#          collide numerically with official/, and because two of them carry
#          "belizean-pride" in the name, which img_dir() otherwise routes to
#          products/ - the folder for recreations rather than photographs.
GALLERY = "assets/img/gallery"

# Intrinsic dimensions of the largest derivative, written by
# tools/process-v2-images.py. Carried into width/height on every <img> so no
# image can shift the layout while it loads.
from v2_dims import DIMS  # noqa: E402
from hero_dims import HERO_DIMS, HERO_TIERS_BY_STEM  # noqa: E402
from gallery_dims import GALLERY_DIMS, GALLERY_GROUPS  # noqa: E402
from news_dims import NEWS_DIMS  # noqa: E402

DIMS = {**DIMS, **HERO_DIMS, **GALLERY_DIMS, **NEWS_DIMS}

RECREATION_NOTE = (
    "Packaging photography on this page was recreated from NATFISH product "
    "material. It illustrates presentation and format only."
)

ALT = {
    "01-lobster-packing-team-wide":
        "NATFISH workers in hairnets, masks and aprons preparing lobster along a "
        "stainless steel bench in the co-operative&rsquo;s processing room.",
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
    "news-food-taipei-2026-delegation":
        "National Fishermen delegation at Food Taipei Mega Shows 2026 in Taiwan.",
    "hero-lobster-diver-dock":
        "A diver walking along a wooden dock with a string of freshly caught "
        "spiny lobster in one hand and his fins in the other.",
    "hero-lobster-boat-catch":
        "Two fishers aboard a skiff tied up at a dock, a morning catch of spiny "
        "lobster filling the hull and packed into crates.",
    "hero-diver-lobster-catch":
        "A diver in a wetsuit standing in open turquoise water, holding a "
        "spiny lobster up by its antennae.",
    "hero-belizean-pride-range":
        "Belizean Pride packaging beside the NATFISH mark: a carton of "
        "wild-caught Caribbean spiny lobster, a box of spiny lobster head meat "
        "and individually wrapped tails.",
    "hero-trade-show-stand":
        "A seafood trade show stand hung with Belizean Pride banners, four "
        "people in matching shirts standing behind a table of spiny lobster "
        "and conch cartons.",
    "hero-2-boat-leaving-harbour":
        "A small fishing boat heading out of the harbour past moored skiffs and "
        "the waterfront.",
    # ---- the client's supplied gallery set --------------------------------
    # Alt text and captions below are the client's own words, supplied with the
    # images and used verbatim. Do not paraphrase them: they are the client's
    # statement about their own photographs, and three of them name NATFISH
    # directly, which is theirs to assert and not ours.
    "01-lobster-fisher-boat-catch":
        "Belizean lobster fisher aboard a boat filled with a fresh spiny "
        "lobster catch",
    "02-lobster-harvest-boat":
        "Two Belizean lobster fishers displaying their catch aboard a harvest "
        "boat",
    "03-belizean-pride-frozen-lobster-10kg":
        "Belizean Pride wild-caught Caribbean spiny lobster in a 10-kilogram box",
    "04-belizean-pride-lobster-head-meat":
        "Belizean Pride packaged spiny lobster head meat",
    "05-frozen-fish-fillets-box":
        "Individually packaged frozen fish fillets prepared for distribution",
    "06-frozen-fish-portions-box":
        "Individually packaged frozen fish portions in a distribution box",
    "07-belizean-pride-exhibition-display":
        "Belizean Pride lobster and conch products displayed at an "
        "international exhibition",
    "08-natfish-delegation-black-uniforms":
        "NATFISH representatives standing behind a Belizean Pride product "
        "display",
    "09-natfish-delegation-white-uniforms":
        "NATFISH delegation in white uniforms behind a Belizean Pride "
        "exhibition display",
    "10-natfish-team-group":
        "NATFISH team members and partners gathered for a group photograph",
    "01-belizean-pride-lobster-cases":
        "Cartons of frozen Belizean spiny lobster tails packed for cold storage.",
    "02-belizean-pride-orange-lobster-tails":
        "A carton of individually bagged cooked spiny lobster tails.",
    "03-belizean-pride-raw-lobster-tails":
        "A carton of individually bagged raw spiny lobster tails.",
    "04-wild-caught-frozen-conch":
        "A carton of frozen queen conch meat, bagged for shipping.",
}

# The client's supplied gallery captions, used verbatim and already punctuated.
# Kept apart from SHORT because SHORT entries are label fragments that the
# gallery template ends with a full stop of its own; these are finished
# sentences and must not have one appended.
CAPTION = {
    "01-lobster-fisher-boat-catch":
        "A Belizean lobster fisher displaying part of a fresh harvest.",
    "02-lobster-harvest-boat":
        "Lobster fishers displaying their catch aboard a harvest boat.",
    "03-belizean-pride-frozen-lobster-10kg":
        "Belizean Pride wild-caught Caribbean spiny lobster.",
    "04-belizean-pride-lobster-head-meat":
        "Belizean Pride spiny lobster head meat.",
    "05-frozen-fish-fillets-box":
        "Frozen fish fillets prepared for distribution.",
    "06-frozen-fish-portions-box":
        "Frozen fish portions prepared for distribution.",
    "07-belizean-pride-exhibition-display":
        "Belizean Pride products presented at an international exhibition.",
    "08-natfish-delegation-black-uniforms":
        "NATFISH representatives presenting Belizean Pride products.",
    "09-natfish-delegation-white-uniforms":
        "The NATFISH delegation representing Belizean seafood products.",
    "10-natfish-team-group":
        "NATFISH team members and partners.",
}

# The three classifications, in the client's order and with their exact labels.
GALLERY_CLASSES = [
    ("fishing", "Fishing &amp; Harvest"),
    ("products", "Products &amp; Processing"),
    ("trade", "Trade Shows &amp; Representation"),
]

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
    "news-food-taipei-2026-delegation": "The NATFISH delegation at Food Taipei 2026",
    "hero-lobster-diver-dock": "Bringing the lobster catch up the dock",
    "hero-lobster-boat-catch": "A morning lobster catch aboard the skiff",
    "hero-diver-lobster-catch": "A spiny lobster brought up from the reef",
    "hero-belizean-pride-range": "The Belizean Pride range",
    "hero-trade-show-stand": "Belizean Pride on show at a seafood trade show",
    "hero-2-boat-leaving-harbour": "Heading out of the harbour",
    # The client's set uses its supplied caption as its label too, so the
    # "View larger" announcement matches the caption a sighted visitor reads.
    "01-lobster-fisher-boat-catch": "A Belizean lobster fisher displaying part of a fresh harvest",
    "02-lobster-harvest-boat": "Lobster fishers displaying their catch aboard a harvest boat",
    "03-belizean-pride-frozen-lobster-10kg": "Belizean Pride wild-caught Caribbean spiny lobster",
    "04-belizean-pride-lobster-head-meat": "Belizean Pride spiny lobster head meat",
    "05-frozen-fish-fillets-box": "Frozen fish fillets prepared for distribution",
    "06-frozen-fish-portions-box": "Frozen fish portions prepared for distribution",
    "07-belizean-pride-exhibition-display": "Belizean Pride products presented at an international exhibition",
    "08-natfish-delegation-black-uniforms": "NATFISH representatives presenting Belizean Pride products",
    "09-natfish-delegation-white-uniforms": "The NATFISH delegation representing Belizean seafood products",
    "10-natfish-team-group": "NATFISH team members and partners",
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
    """Authentic photographs live in official/, recreations in products/.

    The hero mixes both. The client's responsive pairs are their own
    photography and sit in official/; the one surviving V1 hero is illustrative
    concept imagery and stays in concept/, which is what keeps the two
    provenances - and the two different alt-text rules - from blurring.
    """
    if stem in GALLERY_GROUPS:
        return GALLERY
    if stem.startswith("hero-"):
        base = stem.rsplit("-desktop", 1)[0].rsplit("-mobile", 1)[0]
        return OFFICIAL if base in HERO_PAIRS else CONCEPT
    if "belizean-pride" in stem or "wild-caught" in stem:
        return PRODUCTS
    return OFFICIAL


PICTURE_TIERS = (480, 800, 1400)


def picture(stem, sizes, css="", *, eager=False, alt=None, full=False,
            ratio=None, focus=None, tiers=PICTURE_TIERS):
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

    # `tiers` defaults to the three every in-page photograph has. It is a
    # parameter because the hero pairs are generated on their own ladder and a
    # srcset that names a tier nobody wrote is a 404 on the page.
    webp = ", ".join(f"{d}/{stem}-{t}.webp {t}w" for t in tiers)
    jpg = ", ".join(f"{d}/{stem}-{t}.jpg {t}w" for t in tiers)
    fallback = tiers[min(1, len(tiers) - 1)]
    return f"""<picture>
          <source type="image/webp" srcset="{webp}" sizes="{sizes}">
          <img src="{d}/{stem}-{fallback}.jpg" srcset="{jpg}" sizes="{sizes}" width="{w}" height="{h}" alt="{alt_text}"{cls}{style}{loading}{data_full}>
        </picture>"""


# The client-approved artwork is 1789x879. Carried as a constant so every
# placement writes the same intrinsic ratio and nothing can reflow while the
# logo loads.
LOGO_W, LOGO_H = 1789, 879

LOGO_SRCSET = ("assets/img/natfish-logo-400.png 400w, "
               "assets/img/natfish-logo-800.png 800w, "
               "assets/img/natfish-logo-1200.png 1200w")


# The hero breakpoint. Below it the hero stacks and the photograph runs full
# width; above it the photograph takes 60% of a split layout. The same number
# is the media condition on the phone crop, so the art direction and the layout
# switch on the same line.
HERO_BP = 900
HERO_SIZES = f"(max-width: {HERO_BP}px) 100vw, 60vw"

# The phone crop is served below this width, not below HERO_BP. Between the two
# the hero is already stacked, but the frame there is still a wide band (768 x
# 380 on a tablet, about 2:1), and a 9:16 portrait file dropped into a 2:1 band
# keeps only a third of its height. The landscape crop is the better source for
# that shape, so the art direction switches at the width where the frame itself
# turns portrait-ish, which is not where the layout stacks.
HERO_PHONE_BP = 600

# A single-source hero has no portrait crop, so below HERO_PHONE_BP its 1.78
# landscape file is `cover`-cropped into a frame that is roughly square. The
# rendered image is then far wider than the viewport - frame height x 1.78,
# which at a 1.08 frame ratio works out near 1.9 viewport widths - and a plain
# `100vw` hint would pick a tier about half the width actually painted, which
# is visibly soft. The 190vw term states the real painted width so the browser
# picks the tier it is going to need.
HERO_SIZES_SINGLE = (f"(max-width: {HERO_PHONE_BP}px) 190vw, "
                     f"(max-width: {HERO_BP}px) 100vw, 60vw")

# Single-source heroes (the surviving concept image) still use the old three
# tiers. The client's responsive pairs carry their own, because their two crops
# have different natural widths and are served to different screens.
# The tiers a stem actually has on disk, from the generator. A source narrower
# than a tier is not upscaled, so the two most recent heroes (1672px and 1920px
# wide) have no 2400 derivative - and a srcset that listed one would be a 404 on
# the page. Never hard-code the tier list here again.
def hero_tiers(stem):
    return HERO_TIERS_BY_STEM[stem]

# Heroes the client supplied as a pre-cropped desktop/phone pair. Anything in
# this set is published as `<stem>-desktop-*` and `<stem>-mobile-*` and is
# rendered with a `media`-switched <source>, not with a focal point.
HERO_PAIRS = {
    "hero-lobster-diver-dock",
    "hero-diver-lobster-catch",
    "hero-lobster-boat-catch",
    "hero-trade-show-stand",
    "hero-belizean-pride-range",
}


def _srcset(d, stem, tiers, ext):
    return ", ".join(f"{d}/{stem}-{t}.{ext} {t}w" for t in tiers)


def hero_picture(stem, index, *, eager):
    """One carousel slide.

    A pair slide is art-directed: the client cropped a 2400x1080 landscape
    frame for the desktop hero and a 1080x1920 portrait frame for the phone, so
    the browser is given both and picks by the same 900px line the layout uses.
    Because each crop is already composed for its own frame, no focal point is
    applied to a pair - `object-position` stays at the default centre.

    A single-source slide has no phone crop, so it keeps the older approach:
    one photograph, cropped by a per-slide focal point in the stylesheet. Those
    focal points cannot be inline styles because they differ by breakpoint.

    The alt text is the full ALT description, not the SHORT label. The hero is
    the first thing on the page and carries real meaning, so a screen reader
    should get the sentence rather than the caption.
    """
    d = img_dir(stem)
    loading = (' loading="eager" fetchpriority="high"' if eager
               else ' loading="lazy" decoding="async"')
    if stem not in HERO_PAIRS:
        w, h = DIMS[stem]
        return f"""<picture>
            <source type="image/webp" srcset="{_srcset(d, stem, hero_tiers(stem), 'webp')}" sizes="{HERO_SIZES_SINGLE}">
            <img src="{d}/{stem}-800.jpg" srcset="{_srcset(d, stem, hero_tiers(stem), 'jpg')}" sizes="{HERO_SIZES_SINGLE}" width="{w}" height="{h}" alt="{ALT[stem]}"{loading}>
          </picture>"""

    mob, desk = f"{stem}-mobile", f"{stem}-desktop"
    mw, mh = DIMS[mob]
    dw, dh = DIMS[desk]
    phone = f"(max-width: {HERO_PHONE_BP}px)"
    return f"""<picture>
            <source media="{phone}" type="image/webp" srcset="{_srcset(d, mob, hero_tiers(mob), 'webp')}" sizes="100vw" width="{mw}" height="{mh}">
            <source media="{phone}" type="image/jpeg" srcset="{_srcset(d, mob, hero_tiers(mob), 'jpg')}" sizes="100vw" width="{mw}" height="{mh}">
            <source type="image/webp" srcset="{_srcset(d, desk, hero_tiers(desk), 'webp')}" sizes="{HERO_SIZES}">
            <img src="{d}/{desk}-1400.jpg" srcset="{_srcset(d, desk, hero_tiers(desk), 'jpg')}" sizes="{HERO_SIZES}" width="{dw}" height="{dh}" alt="{ALT[stem]}"{loading}>
          </picture>"""


def hero_preload(stem):
    """Preload only the first slide.

    The other two are lazy: they are behind opacity 0 for at least seven
    seconds, and preloading all three would put two images the visitor may
    never see ahead of the fonts and the stylesheet.

    For a pair, both crops are preloaded with the matching `media`, so a phone
    fetches the portrait file and a desktop the landscape one. Without `media`
    the browser would speculatively fetch the wrong crop and then fetch the
    right one again - two full hero downloads on the first paint.
    """
    d = img_dir(stem)
    if stem not in HERO_PAIRS:
        return (f'  <link rel="preload" as="image" type="image/webp"\n'
                f'        href="{d}/{stem}-800.webp"\n'
                f'        imagesrcset="{_srcset(d, stem, hero_tiers(stem), "webp")}"'
                f' imagesizes="{HERO_SIZES_SINGLE}" fetchpriority="high">\n')

    mob, desk = f"{stem}-mobile", f"{stem}-desktop"
    phone = f"(max-width: {HERO_PHONE_BP}px)"
    return (f'  <link rel="preload" as="image" type="image/webp" media="{phone}"\n'
            f'        href="{d}/{mob}-720.webp"\n'
            f'        imagesrcset="{_srcset(d, mob, hero_tiers(mob), "webp")}"'
            f' imagesizes="100vw" fetchpriority="high">\n'
            f'  <link rel="preload" as="image" type="image/webp"'
            f' media="(min-width: {HERO_PHONE_BP + 1}px)"\n'
            f'        href="{d}/{desk}-1400.webp"\n'
            f'        imagesrcset="{_srcset(d, desk, hero_tiers(desk), "webp")}"'
            f' imagesizes="{HERO_SIZES}" fetchpriority="high">\n')


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

    Opening hours are included now that the client has supplied them.
    Deliberately still absent: aggregateRating, priceRange, hasCredential,
    makesOffer and any volume or capacity figure. None of those were supplied,
    and structured data is exactly where an unsupported claim does the most
    damage, because it is machine-read and republished verbatim.
    """
    tel = TEL_HREF
    return f"""  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "{LEGAL}",
    "alternateName": "NatFish",
    "url": "{SITE_URL}/",
    "logo": "{SITE_URL}/assets/img/natfish-logo-1200.png",
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
    "openingHoursSpecification": {{
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "17:00"
    }},
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


SITE_URL = "https://natfish.bz"
SITE_SHORT = "NatFish"

# The og:image alt is fixed for every page that does not override it: it
# describes the shared card, not the page.
OG_CARD_ALT = ("Belizean Pride wild-caught Caribbean spiny lobster products "
               "from NatFish in Belize.")

FAVICONS = """  <link rel="icon" href="favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
"""


def breadcrumb_jsonld(trail):
    """BreadcrumbList for a page that shows breadcrumbs.

    Absolute URLs, built from SITE_URL like every other absolute reference, so
    the structured data and the visible trail always name the same pages.
    """
    items = []
    for i, (name, path) in enumerate(trail, start=1):
        url = SITE_URL + "/" if path == "index.html" else f"{SITE_URL}/{path}"
        safe = name.replace("&rsquo;", "\u2019").replace("&amp;", "&")
        items.append(
            '      {\n'
            f'        "@type": "ListItem",\n'
            f'        "position": {i},\n'
            f'        "name": {json.dumps(safe)},\n'
            f'        "item": "{url}"\n'
            '      }'
        )
    joined = ",\n".join(items)
    return ('  <script type="application/ld+json">\n'
            '  {\n'
            '    "@context": "https://schema.org",\n'
            '    "@type": "BreadcrumbList",\n'
            '    "itemListElement": [\n'
            f'{joined}\n'
            '    ]\n'
            '  }\n'
            '  </script>\n')


def website_jsonld():
    """WebSite, homepage only. No SearchAction: the site has no search."""
    return ('  <script type="application/ld+json">\n'
            '  {\n'
            '    "@context": "https://schema.org",\n'
            '    "@type": "WebSite",\n'
            f'    "name": {json.dumps(SITE_SHORT)},\n'
            f'    "alternateName": {json.dumps(LEGAL)},\n'
            f'    "url": "{SITE_URL}/",\n'
            '    "inLanguage": "en-BZ"\n'
            '  }\n'
            '  </script>\n')


def head(title, description, path, og_image="official/og-card", preload="",
         extra_jsonld="", og_type="website", extra_head=""):
    """The shared document head.

    `path` is the page's own filename, and everything absolute is built from
    it: the canonical, og:url and the structured data all resolve against
    SITE_URL. That is the production domain, never the temporary preview host -
    a canonical pointing at a preview subdomain teaches search engines the
    wrong home for the page and is very hard to undo. The preview is kept out
    of the index by a header instead; see netlify.toml.

    `lang="en-BZ"` because this is Belizean English. The Spanish runtime swaps
    the attribute at load time when a visitor chooses Spanish.

    Every favicon and the manifest are referenced relatively. Every page in
    this site sits at the root, so a relative path resolves the same from all
    of them, and it keeps the site working when it is served from a
    subdirectory - which is exactly how it is previewed.
    """
    # The homepage's canonical is the bare domain, not /index.html: that is the
    # URL people link to and the one the host serves at the root, so it is the
    # one the sitemap and the canonical must both name.
    url = SITE_URL + "/" if path == "index.html" else f"{SITE_URL}/{path}"
    img = f"{SITE_URL}/assets/img/{og_image}.jpg"
    return f"""<!DOCTYPE html>
<html lang="en-BZ" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta name="theme-color" content="#052b45">
  <link rel="canonical" href="{url}">

  <meta property="og:type" content="{og_type}">
  <meta property="og:site_name" content="{SITE_SHORT}">
  <meta property="og:locale" content="en_BZ">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{OG_CARD_ALT}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{img}">
  <meta name="twitter:image:alt" content="{OG_CARD_ALT}">
{extra_head}
{FAVICONS}
  <!-- Self-hosted Bitter and Source Sans 3. The latin subsets are preloaded
       because they carry the headline and the first paragraph; font-display
       swap means the fallback shows immediately and nothing is ever invisible. -->
  <link rel="preload" href="assets/fonts/bitter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/source-sans-3-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{asset('assets/css/fonts.css')}">
  <link rel="stylesheet" href="{asset('assets/css/natfish.css')}">
{preload}{org_jsonld()}{extra_jsonld}</head>
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


# The rope-and-wave rule that used to open a section head. The client asked for
# every decorative line beside or above a title to go, and this was one of them:
# a wave glyph followed by a short horizontal stroke. It is emptied rather than
# deleted because it appears at thirteen call sites across the generators, and
# an empty string keeps those call sites honest about where the mark used to be
# should the client ever want it back. Nothing renders.
RULE_WAVE = ""


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


AI_PAGE = "natfish-ai.html"


def ai_pill():
    """The site-wide launcher.

    A real link, not a button with href="#". Its href is the NATFISH AI page,
    so the control still does something useful with JavaScript off, with the
    Chatbase embed blocked, or before the agent id has been supplied. The
    script upgrades it in place: once the widget is ready a click docks it to
    the right edge and opens the chat panel instead of navigating.

    It lives in the footer markup rather than being injected by script, so it
    is in the document from first paint and cannot cause a layout shift.

    The nested __body span exists for one reason: the pill drifts horizontally
    and bobs vertically at different speeds, and two animations cannot share
    the transform property. The outer element swims, the inner one bobs.
    """
    return f"""
  <a class="ai-pill" href="{AI_PAGE}" data-ai-open
     aria-label="Open NATFISH AI chat">
    <span class="ai-pill__body">
      <span class="ai-pill__badge" aria-hidden="true">
        <img src="assets/img/natfish-icon.png" width="180" height="180" alt="" loading="lazy" decoding="async">
      </span>
      <span class="ai-pill__label">Ask NATFISH AI</span>
    </span>
  </a>
  <p class="visually-hidden" id="ai-status" role="status" aria-live="polite"></p>
"""


def footer(with_lightbox=False, with_ai_pill=True):
    """with_ai_pill=False is for natfish-ai.html only: that page carries the
    chat embed in the page itself, so a floating "Ask NATFISH AI" launcher
    there is a button for a thing the visitor is already looking at - and on a
    phone it sat on top of the embed's caption."""
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
            {LEGAL_NO_DOT}. A member-owned Belizean co-operative registered in
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
{ai_pill() if with_ai_pill else ''}{lightbox}
  <p class="visually-hidden" id="lang-status" role="status" aria-live="polite"></p>

  <script src="{asset('assets/js/natfish-strings.js')}"></script>
  <script src="{asset('assets/js/natfish-i18n.js')}"></script>
  <script src="{asset('assets/js/natfish-seasons.js')}"></script>
  <script src="{asset('assets/js/natfish.js')}"></script>
  <script src="{asset('assets/js/natfish-ai.js')}" defer></script>
</body>
</html>
"""


def page_hero(eyebrow, title, lede, crumb, actions=""):
    """The inner-page banner.

    `actions` renders inside the band rather than as a block underneath it. A
    call to action stranded on white below the hero reads as a leftover strip,
    which is exactly the complaint that removed the previous one.
    """
    block = f'\n        <div class="page-hero__actions">{actions}</div>' if actions else ""
    return f"""
    <section class="page-hero">
      <span class="page-hero__watermark" aria-hidden="true">NATFISH</span>
      <div class="container">
        <p class="breadcrumb"><a href="index.html">Home</a><span>/</span>{crumb}</p>
        <span class="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p class="lede">{lede}</p>{block}
      </div>
    </section>
"""


def concept_note():
    """Small disclosure placed under image-led sections."""
    return f'<p class="concept-note">{CONCEPT_NOTE}</p>'
