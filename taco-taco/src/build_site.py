# -*- coding: utf-8 -*-
"""Generates the Taco Taco site (multi-page, external assets) from the fragments
in _single.html. Run:  python3 src/build_site.py"""
import re, os, sys, json, shutil, hashlib
from deals_data import DEALS, FEATURED, STR
from blog_data import HUB, ARTICLES
from reviews_data import REVIEWS, HOME_ORDER, STR_REVIEWS
from menu_data import CATEGORIES as MENU_CATS, INTRO as MENU_INTRO, MEATS, MEAT_SURCHARGE
from about_data import ABOUT
from faq_data import FAQ, HEAD as FAQ_HEAD
import promo_data
import i18n
from es import ES, JS as JS_ES

# The reviews and the About copy were written in both languages from the start.
# Fold them into the same table the rest of the site is translated through, so
# there is one lookup and one missing-strings report rather than three.
for _r in REVIEWS:
    if _r.get("en") and _r.get("es"):
        ES.setdefault(_r["en"], _r["es"])
def _fold_about(node):
    if isinstance(node, dict):
        if "en" in node and "es" in node and isinstance(node["en"], str):
            ES.setdefault(node["en"], node["es"]); return
        for v in node.values(): _fold_about(v)
    elif isinstance(node, list):
        for v in node: _fold_about(v)
_fold_about(ABOUT)

LANGS = [("en", "", "English"), ("es", "es/", "Espa\u00f1ol")]

SRC  = os.path.join(os.path.dirname(__file__), "_single.html")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIST = os.path.join(ROOT, "dist")

SITE_URL   = "https://tacotaco.bz"
BRAND      = "Taco Taco Mexican Restaurant"
BRAND_SHORT= "Mexican Restaurant"
WA_NUMBER  = "5016134677"   # The restaurant. 613-4677, the number on the road sign.
                            # Switched off the test line 2026-09-20, for launch.
                            # Stamped into site.js at build time so the number
                            # lives in one place, and printed at the end of every
                            # build so it cannot go live on the wrong line.

# Social profiles. Leave a value empty and that button simply does not render,
# so the live site never shows a dead link.
SOCIAL = {
 "facebook":  "https://www.facebook.com/share/19WWfiQNEV/?mibextid=wwXIfr",
              # Supplied 18 Sep 2026 and it replaces the two sent before it.
              # A facebook.com/share/ link is a redirect, not the page itself,
              # so it cannot be read from here to check where it lands.
 "instagram": "https://www.instagram.com/tacotacomexicanrestaurant",
 "tiktok":    "https://www.tiktok.com/@tacotacomexicanfood",
}

# Address and hours come from the menu the restaurant printed most recently,
# which is the authority. They are defined once here and swept through every
# page below, because keeping copies in the template is how they drifted before.
ADDRESS   = "11 Aloe Vera Ave, West Belmopan, Belize"
ADDRESS_SHORT = "11 Aloe Vera Ave, West Belmopan"
HOURS     = [("Mon to Thu", "10:00 AM to 8:00 PM"),
             ("Fri to Sun", "8:00 AM to 8:00 PM")]
HOURS_SCHEMA = [(["Monday","Tuesday","Wednesday","Thursday"], "10:00", "20:00"),
                (["Friday","Saturday","Sunday"],              "08:00", "20:00")]
# The widest a deployed photograph is allowed to be. Nothing on the site ever
# draws a master larger than the lightbox, and the lightbox is bounded by the
# viewport, so the 1600px copies some of these were shipped at were paying for
# pixels no phone and no laptop ever displayed. The originals in src/ keep their
# full size, because the thumbnails and grid copies are cut from them.
# The promotion window, turned into plain UTC milliseconds here so the browser
# never has to reason about a timezone. Belize is UTC-6 all year.
def _promo_ms(stamp):
    import datetime as _dt
    d = _dt.datetime.strptime(stamp, "%Y-%m-%d %H:%M:%S")
    d = d.replace(tzinfo=_dt.timezone(_dt.timedelta(hours=promo_data.TZ_OFFSET_HOURS)))
    return int(d.timestamp() * 1000)

PROMO_FROM = _promo_ms(promo_data.STARTS)
PROMO_TO   = _promo_ms(promo_data.ENDS) + 999     # inclusive of that last second

def promo_live():
    """Is the promotion worth putting on the page at all?

    A build made after the window has closed leaves the popup out of the HTML
    entirely rather than shipping markup that can never be shown. Inside the
    window the browser is still the one that decides, by its own clock, which is
    what lets the promotion end on the night of the 30th without a redeploy."""
    import time as _t
    return promo_data.ACTIVE and _t.time() * 1000 <= PROMO_TO

MASTER_MAX = 1400

# The one-link page. It is its own site on its own subdomain, so it is named
# here once and every mention on this site is built from these two lines.
CONNECT_URL  = "https://connect.tacotaco.bz"
CONNECT_HOST = "connect.tacotaco.bz"

MAPS_Q    = "Taco+Taco+Mexican+Restaurant,+Belmopan,+Belize"
MAPS_LINK = "https://www.google.com/maps/search/?api=1&query=" + MAPS_Q
MAPS_EMBED= "https://www.google.com/maps?q=" + MAPS_Q + "&output=embed"

# Google rating. These two are facts from the listing; the reviews themselves
# live in reviews_data.py. No aggregateRating is emitted anywhere: Google's own
# guidelines forbid republishing ratings gathered on another site.
RATING       = 4.9
REVIEW_COUNT = 10

# YouTube/Vimeo entries. Empty list hides the whole video section.
# Add like: {"src":"https://www.youtube.com/embed/XXXX","title":"Birria tacos"}
# His words, with the punctuation tidied.
REEL_SUB  = ("Touch play and see what is cooking in our kitchen, and what the staff "
             "and customers of Taco Taco are up to.")
VIDEO_SUB = "Straight from the restaurant. Turn the sound up."

VIDEOS = [
 {"id": "meet-the-team",   "title": "Meet the team",
  "alt": "The Taco Taco kitchen team in their aprons behind the counter"},
 {"id": "on-the-griddle",  "title": "On the griddle",
  "alt": "Patties and a burrito cooking on the flat top at Taco Taco"},
 {"id": "dance-for-tacos", "title": "Dance for free tacos",
  "alt": "Two guests dancing in the dining room at Taco Taco"},
 {"id": "come-see-us",     "title": "Come see us",
  "alt": "The dining room, the drinks jars and a taco bowl at Taco Taco"},
 {"id": "the-spread",      "title": "The spread",
  "alt": "A table laid for a group at Taco Taco, and plates of chimichangas, nachos and a torta"},
 {"id": "sweet-trays",     "title": "Sweet trays",
  "alt": "Trays of iced cinnamon rolls and pastries at Taco Taco"},
 {"id": "dance-for-tacos-2", "title": "Dance for tacos 2.0",
  "alt": "Staff and customers dancing through the dining room at Taco Taco under the party lights"},
 {"id": "happy-hour",      "title": "Happy hour",
  "alt": "A card announcing Taco Taco's first official happy hour, 2PM to 6PM"},
]
for _v in VIDEOS:
    _v.setdefault("src",    "assets/video/%s.mp4" % _v["id"])
    _v.setdefault("poster", "assets/img/video-%s.jpg" % _v["id"])

# Photos we can honestly attach to a menu item. Only unmistakable matches:
# a wrong photo on a menu misrepresents the food a customer is paying for.
ITEM_IMG = {
 # Every pairing is checked against the photograph the restaurant printed beside
 # that item on its own menu. Anything we cannot match confidently is left blank
 # rather than filled with a lookalike.
 "1 Corn Taco":                    "hero-plate.jpg",
 "1 Flour Taco":                   "hero-plate.jpg",
 "Order of Tacos (4)":             "dish-09.jpg",
 "Order of Flour Tacos (4)":       "dish-09.jpg",
 "Two Mexican Tacos Plato Combo":  "badge-01.jpg",
 "1 Birria Taco":                  "badge-02.jpg",
 "Order of Birria Tacos (4)":      "badge-02.jpg",
 "Birria Tacos Plato Combo":       "gal-birria-combo.jpg",
 "Taco Bowl Grande":               "dish-01.jpg",
 "1 Tostada":                      "dish-10.jpg",
 "Order of Tostadas (4)":          "dish-10.jpg",
 # The restaurant's own photographs of its own plates, which beat a stock-looking
 # one every time on a menu.
 "Regular Torta":                  "menu-torta.jpg",
 "Torta del Rey":                  "menu-torta-del-rey.jpg",
 "California Style Burrito":       "menu-california-burrito.jpg",
 "Fry Jack Breakfast":             "menu-fry-jack.jpg",
 # Each of these photographs is an order rather than one item. The single lines
 # share them on the restaurant's say-so: it is the same food, and a picture of
 # the plate beats the house placeholder on a line a customer is choosing from.
 "Order of Mexican Chalupas":      "menu-chalupas.jpg",
 "1 Mexican Chalupa":              "menu-chalupas.jpg",
 "Order of Hardshell Tacos":       "menu-hardshell-tacos.jpg",
 "1 Hardshell Taco":               "menu-hardshell-tacos.jpg",
 "Birria Soup":                    "menu-birria-soup.jpg",
 "Breakfast Burrito":              "menu-breakfast-burrito.jpg",
 "Burger":                         "menu-burger.jpg",
 "Chocoflan":                      "menu-chocoflan.jpg",
 "Carne Plato Combo":              "menu-carne-plato.jpg",
 "Mexican Style Burrito":          "menu-burrito.jpg",
 "Carne Asada Fries":              "menu-carne-asada-fries.jpg",
 "Mexican Pizza":                  "menu-mexican-pizza.jpg",
 "Crunch Wrap":                    "menu-crunch-wrap.jpg",
 "Chilaquiles":                    "menu-chilaquiles.jpg",
 "Waffle or Pancake Sandwich":     "dish-03.jpg",
 "Pancakes or Waffle Only":        "menu-only-pancakes.jpg",
 # Desserts. These are the restaurant's own photographs rather than studio
 # renders, which is why they are framed the way they are: this is the cake that
 # actually comes out of that kitchen. Tres Leches is made in more than one
 # flavour, so the menu shows one and the gallery carries another.
 "Order of Churros":               "menu-churros.jpg",
 "Tres Leches":                    "menu-tres-leches.jpg",
 "Cheesecake":                     "menu-cheesecake.jpg",
 "Cinnamon Rolls":                 "menu-cinnamon-rolls.jpg",
 "Cookies":                        "menu-cookies.jpg",
 "Frapp\u00e9":                      "fav-04.jpg",

 # From the two photo packages, each checked against the printed menu.
 "Order of Flautas":               "menu-flautas.jpg",
 "Fajitas Plato Combo":            "menu-fajitas-plato.jpg",
 "Mexican Hot Dog":                "menu-mexican-hotdog.jpg",
 "Birria Ramen":                   "menu-birria-ramen.jpg",
 "Birria Pizza":                   "menu-birria-pizza.jpg",
 "Two Birria Quesadillas":         "menu-birria-quesadillas.jpg",
 "Chimichanga":                    "menu-chimichanga.jpg",
 "Mini Chimichanga Plato Combo":   "menu-mini-chimichanga.jpg",
 "Fresh Natural Juice":            "menu-natural-juice.jpg",
 "Natural Juice":                  "menu-natural-juice.jpg",
 "Huevos Rancheros":               "menu-huevos-rancheros.jpg",
 "Mexican Quesadilla":             "menu-quesadilla.jpg",
 "Waffle or Pancake Breakfast":    "menu-pancake-breakfast.jpg",
 # The package called this one chilaquiles. It is the nachos plate: same photo the
 # menu prints beside Nachos, and chilaquiles on this menu come topped with eggs.
 "Nachos":                         "menu-nachos.jpg",
 # A smothered burrito under salsa roja, which is what sets Burrito de Mojado
 # apart from the plain Mexican Style Burrito.
 "Burrito de Mojado":              "menu-burrito-mojado.jpg",
 "Mini Taco Bowl":                 "menu-mini-taco-bowl.jpg",
 "Order of Mini Taco Bowls (4)":   "menu-mini-taco-bowl.jpg",
 "Menudo Soup, Small":             "menu-menudo.jpg",
 "Menudo Soup, Large":             "menu-menudo.jpg",

 # Drinks. These are studio product renders rather than the brands' own photos,
 # so they are close likenesses rather than exact trade dress. Belikin Stout
 # now has the plain stout rather than the Chocolate Stout that was supplied
 # first, which is a different bottle from the one this item sells.
 "Belikin Beer":                   "menu-belikin-beer.jpg",
 "Belikin Stout":                  "menu-belikin-stout.jpg",
 "Lighthouse":                     "menu-lighthouse.jpg",
 "Guinness Stout":                 "menu-guinness-stout.jpg",
 "Landshark":                      "menu-landshark.jpg",
 "Ova Drive":                      "menu-ova-drive.jpg",
 "Red Stripe":                     "menu-red-stripe.jpg",
 "Heineken":                       "menu-heineken.jpg",
 "Soft Drinks":                    "menu-soft-drinks.jpg",
 "Soda Water":                     "menu-soda-water.jpg",
 # Extras and sides, all nine of them. The two $8 plates are shown with the
 # chips they come with; the $4 sauces are shown in the bowl on their own, which
 # is what that price buys. Pico de Gallo is the chopped one and Salsa is the
 # saucier one: both are tomato, onion, chilli and cilantro, and the difference
 # on a plate is how far the tomato has been broken down.
 "Fries":                          "menu-fries.jpg",
 "Guacamole and Chips":            "menu-guac-chips.jpg",
 "Salsa and Chips":                "menu-salsa-chips.jpg",
 "Beans":                          "menu-beans.jpg",
 "Rice":                           "menu-rice.jpg",
 "Salsa":                          "menu-salsa.jpg",
 "Sour Cream":                     "menu-sour-cream.jpg",
 "Guacamole Sauce":                "menu-guac-sauce.jpg",
 "Pico de Gallo":                  "menu-pico-de-gallo.jpg",

 "Hot Coffee":                     "menu-hot-coffee.jpg",
 "Hot Tea":                        "menu-hot-tea.jpg",
 "Iced Coffee":                    "menu-iced-coffee.jpg",
 "Water":                          "menu-water.jpg",

 # The five meats, photographed in the pans they are held in. Sent 2026-09-19
 # and named by the restaurant one by one, so each of these is the meat the
 # kitchen means by that word, not a lookalike from a plate shot.
 "Pollo Asado":                    "menu-pollo-asado.jpg",
 "Carne Asada":                    "menu-carne-asada.jpg",
 "Birria":                         "menu-birria.jpg",
 "Carnitas":                       "menu-carnitas.jpg",
 "Al Pastor":                      "menu-al-pastor.jpg",
}

# The gallery grid, with a real description of each plate rather than a generic
# label: it is what a screen reader reads out and what search engines index.
# Shrimp tostadas are not on the current menu, so that photograph is not shown.
GALLERY = [
 ("badge-01.jpg", "Two Mexican tacos with rice and refried beans"),
 ("badge-02.jpg", "Birria tacos served with consomé for dipping"),
 ("hero-plate.jpg", "A plate of Mexican tacos with avocado salsa"),
 ("gal-street-tacos.jpg", "Street tacos topped with onion, cilantro and avocado salsa"),
 ("dish-09.jpg", "Street tacos with onion, cilantro and avocado salsa, with a natural juice"),
 ("gal-tacos-lime.jpg", "Tacos served with a wedge of lime"),
 ("gal-birria-combo.jpg", "Birria tacos plato combo with rice, beans and consomé"),
 ("gal-crispy-tacos.jpg", "Crispy folded birria tacos with consomé"),
 ("menu-birria-pizza.jpg", "Birria pizza cut into wedges, with consomé in the centre"),
 ("gal-birria-ramen.jpg", "Birria ramen in a rich red broth"),
 ("menu-birria-quesadillas.jpg", "Birria quesadillas with a cup of consomé"),
 ("menu-menudo.jpg", "Menudo soup served with lime"),
 ("dish-10.jpg", "Mexican tostadas topped with lettuce, cheese, sour cream and avocado salsa"),
 ("gal-tostadas.jpg", "Four tostadas topped with meat, lettuce and cream"),
 ("menu-mini-taco-bowl.jpg", "Mini taco bowls topped with meat and salsa"),
 ("dish-01.jpg", "Taco bowl grande in a fried tortilla shell"),
 ("gal-taco-bowl.jpg", "Taco salad served in a fried tortilla bowl"),
 ("menu-quesadilla.jpg", "Mexican quesadilla with melted cheese, served with sour cream"),
 ("menu-chimichanga.jpg", "Chimichanga with a lettuce salad"),
 ("menu-mini-chimichanga.jpg", "Mini chimichanga plato combo with rice and beans"),
 ("gal-smothered-burrito.jpg", "Burritos smothered in salsa roja and melted cheese"),
 ("menu-burrito.jpg", "Grilled burrito cut in half"),
 ("dish-07.jpg", "Crunch wrap cut open, layered with beef and melted cheese"),
 ("menu-flautas.jpg", "Flautas topped with lettuce, pico de gallo and cream"),
 ("menu-fajitas-plato.jpg", "Fajitas plato combo with peppers, rice and beans"),
 ("menu-mexican-hotdog.jpg", "Mexican hot dog wrapped in bacon, served with fries"),
 ("dish-04.jpg", "Carne asada fries loaded with meat, cheese and sauces"),
 ("gal-loaded-fries.jpg", "Loaded fries with meat, cheese and sauces"),
 ("gal-loaded-chips.jpg", "Two plates of loaded corn chips"),
 ("menu-nachos.jpg", "Nachos topped with jalapeños, cream and pico de gallo"),
 ("fav-01.jpg", "Torta with fries, served in a basket"),
 ("dish-08.jpg", "Torta with grilled meat and a roasted chile, served with fries"),
 ("dish-05.jpg", "Torta served in a basket"),
 ("menu-huevos-rancheros.jpg", "Huevos rancheros with rice and refried beans"),
 ("dish-06.jpg", "Chorizo con huevo breakfast plate with refried beans, avocado and fried tortillas"),
 ("menu-pancake-breakfast.jpg", "Pancakes with bacon and eggs"),
 ("gal-pancakes.jpg", "Pancake breakfast plate with bacon and eggs"),
 ("dish-03.jpg", "Waffle sandwiches with bacon and egg"),
 ("gal-waffle-sandwich.jpg", "Waffle breakfast sandwich with bacon, egg and cheese"),
 ("menu-jugo-natural.jpg", "Two natural juices"),
 ("gal-drinks.jpg", "Three cold drinks"),
 ("fav-04.jpg", "Frappés topped with whipped cream"),
 ("fav-02.jpg", "A tray of Taco Taco sides and salsas"),
 ("gal-tres-leches-pink.jpg", "A slice of strawberry tres leches, sitting in its milk"),
]

PAGES = [("index.html","Home"),("menu.html","Menu"),("deals-combos.html","Deals"),
         ("gallery.html","Gallery"),("fresh-from-our-kitchen.html","Blog"),
         ("reviews.html","Reviews"),("about.html","About")]


# Small copies for the places a photo is shown small. A 62px menu thumbnail has
# no business downloading a 1600px photograph, and a gallery page of 43 full-size
# plates is several megabytes. The full file is still what the lightbox opens.
_DERIV = {}
def derivative(fn, maxw, sub):
    """Write a downscaled copy under dist/assets/img/<sub>/ and return (path,w,h)."""
    key = (fn, maxw, sub)
    if key in _DERIV: return _DERIV[key]
    src = os.path.join(os.path.dirname(__file__), "assets", "img", fn)
    out_rel = "assets/img/%s/%s" % (sub, fn)
    try:
        from PIL import Image
        dst = os.path.join(DIST, *out_rel.split("/"))
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with Image.open(src) as im:
            im = im.convert("RGB")
            if im.width > maxw:
                im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
            im.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
            res = (out_rel, im.width, im.height)
    except Exception as e:
        print("  !! derivative failed for %s: %s: %s" % (fn, type(e).__name__, e))
        wh = img_size(fn) or (0, 0)
        res = ("assets/img/" + fn, wh[0], wh[1])
    _DERIV[key] = res
    return res


def hours_html():
    return "<br>".join("%s: %s" % h for h in HOURS)


def esc(t):
    return (str(t).replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace('"',"&quot;"))

def deal_price_label(d):
    if "price" in d: return "$%d" % d["price"]
    ps = [o["price"] for c in d["choices"] if c.get("priced") for o in c["options"]]
    return "%s $%d" % (STR["from"], min(ps)) if ps else ""

def choice_control(d, c):
    """One labelled control (or a row of them when the choice repeats)."""
    wrap_attrs = ' data-choice="%s"' % c["id"]
    if c.get("showIf"):
        wrap_attrs += ' data-showif="%s" data-showif-eq="%s" hidden' % (
            esc(c["showIf"]["choice"]), esc(c["showIf"]["equals"]))
    out = ['<div class="opt"%s>' % wrap_attrs,
           '<span class="opt-label">%s</span>' % esc(c["label"])]
    if c.get("type") == "radio":
        out.append('<div class="opt-radios">')
        for i, o in enumerate(c["options"]):
            lab = o["label"] if isinstance(o, dict) else o
            pr  = ' data-price="%d"' % o["price"] if isinstance(o, dict) else ''
            extra = ' <em>$%d</em>' % o["price"] if isinstance(o, dict) else ''
            rid = "r-%s-%s-%d" % (d["id"], c["id"], i)
            out.append('<input type="radio" id="%s" name="%s-%s" value="%s"%s>'
                       '<label for="%s">%s%s</label>' % (rid, d["id"], c["id"], esc(lab), pr, rid, esc(lab), extra))
        out.append('</div>')
    else:
        n = c.get("repeat", 1)
        out.append('<div class="opt-selects">')
        for i in range(n):
            opts = "".join('<option value="%s">%s</option>' % (esc(o), esc(o)) for o in c["options"])
            out.append('<select class="opt-sel" data-part="%d" aria-label="%s%s">'
                       '<option value="">%s...</option>%s</select>'
                       % (i, esc(c["label"]), (" %d" % (i+1)) if n > 1 else "", esc(STR["pick_one"]), opts))
        out.append('</div>')
    out.append('</div>')
    return "".join(out)

_FLYER_DIM={}
def flyer_dim(fn):
    if fn not in _FLYER_DIM:
        try:
            from PIL import Image
            with Image.open(os.path.join(os.path.dirname(__file__),"assets","img",fn)) as im:
                _FLYER_DIM[fn]=im.size
        except Exception:
            _FLYER_DIM[fn]=(760,1013)
    return _FLYER_DIM[fn]

def deal_card(d):
    day = ('<span class="deal-day">%s</span>' % esc(STR["only_on"] % d["day"])) if d.get("day") else ""
    note = ('<p class="deal-note">%s</p>' % esc(d["note"])) if d.get("note") else ""
    opts = "".join(choice_control(d, c) for c in d["choices"])
    return (
     '<article class="deal" id="deal-%s" data-deal="%s">'
     '<div class="deal-flyer"><img src="assets/img/%s" alt="%s offer" loading="lazy" width="%d" height="%d" '
     'data-zoom="assets/img/%s" data-zoom-title="%s" tabindex="0" role="button"></div>'
     '<div class="deal-body">%s<h3 class="deal-title">%s</h3>'
     '<p class="deal-desc">%s</p><div class="deal-price">%s</div>%s'
     '<div class="deal-opts"><span class="opt-head">%s</span>%s</div>'
     '<p class="deal-warn" role="alert" hidden></p>'
     '<button type="button" class="btn btn-red deal-add">%s</button>'
     '</div></article>'
     % (d["id"], d["id"], d["flyer"], esc(d["title"]),
        flyer_dim(d["flyer"])[0], flyer_dim(d["flyer"])[1], d["flyer"], esc(d["title"]),
        day, esc(d["title"]), esc(d["desc"]),
        deal_price_label(d), note, esc(STR["choose"]), opts, esc(STR["add"])))

def deals_page_body():
    cards = "".join(deal_card(d) for d in DEALS)
    return ('\n <section class="blk" id="deals-all">\n  <div class="container">\n'
            '   <div class="sec-head"><span class="sec-kicker">%s</span>'
            '<h2 class="sec-title">Deals &amp; <span class="deco">Combos</span></h2>'
            '<p class="sec-sub">%s</p></div>\n   <div class="deal-grid">%s</div>\n'
            '  </div>\n </section>' % (esc(STR["section_kicker"]), esc(STR["page_sub"]), cards))

# Drawn marks, not emoji: they take the brand colours and stay crisp at any size.
ABOUT_ICONS = {
 # Solid silhouettes with one stroked detail each. An outline-only mark turns to
 # mush at 26px; a filled shape still reads as a flame, a chilli and a bag.
 "flame": '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
          '<path class="f" fill-rule="evenodd" d="M12 1.6c3.4 2.9 6.4 6.5 6.4 10.3a6.4 6.4 0 1 1-12.8 0'
          'C5.6 8.1 8.6 4.5 12 1.6zm0 16.9a2.7 2.7 0 0 0 2.7-2.7c0-1.9-2.7-4-2.7-4s-2.7 2.1-2.7 4'
          'A2.7 2.7 0 0 0 12 18.5z"/>'
          '</svg>',
 "chili": '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
          '<g transform="translate(-1.4 -1.8)">'   # the drawn mass sits low and right; centre it
          '<path class="f" d="M17.9 6.9 c2 2.6 1.5 6.4 -1 9.4 c-2.5 3 -6.4 4.6 -9.9 4.3 '
          'c3.3 -1.2 6.2 -3.3 7.9 -6.2 c1.5 -2.4 1.7 -5.1 1 -7.5 z"/>'
          '<path class="s" d="M16.9 6.6 c-.7 -1.2 -.6 -2.5 .3 -3.4"/>'
          '<path class="s" d="M17.2 3.2 c1.4 0 2.5 .8 3 2.1"/>'
          '</g></svg>',
 "bag":   '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
          '<path class="s" d="M8.8 8.1V6.2a3.2 3.2 0 0 1 6.4 0v1.9"/>'
          '<path class="f" d="M4.9 8.3h14.2l-1.1 11.8a1.1 1.1 0 0 1-1.1 1H7.1a1.1 1.1 0 0 1-1.1-1L4.9 8.3z"/>'
          '</svg>',
}


def about_section(lang="en"):
    """About: the food spread beside the copy, three compact points, two ways to order.
    The wide photograph is for the two column layout and the tall one for a phone,
    picked by the browser rather than cropped down from one file."""
    L = lambda d: esc(d[lang])
    lead = "".join('<p class="about-lead">%s</p>' % L(p) for p in ABOUT["lead"])
    cards = "".join(
      '<div class="apoint"><span class="apoint-ico ico-%s">%s</span>'
      '<h3>%s</h3><p>%s</p></div>'
      % (pt["icon"], ABOUT_ICONS.get(pt["icon"], ""), L(pt["title"]), L(pt["body"]))
      for pt in ABOUT["points"])
    wide_w, wide_h = img_size("about-spread-wide.webp") or (1200, 675)
    shot = (
      '<figure class="about-shot">'
      '<picture>'
      '<source media="(max-width:760px)" srcset="assets/img/about-spread-tall.webp">'
      '<img src="assets/img/about-spread-wide.webp" alt="%s" loading="lazy" decoding="async" '
      'width="%d" height="%d" data-zoom="assets/img/about-spread-wide.webp" tabindex="0" role="button">'
      '</picture></figure>' % (L(ABOUT["image_alt"]), wide_w, wide_h))
    return (
 '<!-- ===== ABOUT ===== -->\n <section class="blk about" id="about">\n  <div class="container">\n'
 '   <div class="about-wrap">\n'
 '    <div class="about-copy">\n'
 '     <span class="sec-kicker">%s</span>\n'
 '     <h2 class="sec-title">%s <span class="deco">%s</span></h2>\n'
 '     %s\n'
 '    </div>\n'
 '    %s\n'
 '   </div>\n'
 '   <div class="about-points">%s</div>\n'
 '   <p class="about-cta">'
 '<a class="btn btn-green" href="menu.html">%s</a>'
 '<button type="button" class="btn btn-red wa-send js-wa-start">%s</button></p>\n'
 '  </div>\n </section>'
 % (L(ABOUT["kicker"]), L(ABOUT["title_a"]), L(ABOUT["title_b"]), lead, shot, cards,
    L(ABOUT["cta_menu"]), L(ABOUT["cta_wa"])))


# Spanish for the day labels in HOURS, so the sentence the FAQ speaks is built
# from the same single source as the footer rather than typed out again.
DAYS_ES = {"Mon to Thu": "de lunes a jueves", "Fri to Sun": "de viernes a domingo"}
for _lab, _ in HOURS:
    if _lab not in DAYS_ES:
        sys.exit("HOURS label %r has no Spanish in DAYS_ES" % _lab)

DAYS_EN = {"Mon to Thu": "Monday to Thursday", "Fri to Sun": "Friday to Sunday"}
for _lab, _ in HOURS:
    if _lab not in DAYS_EN:
        sys.exit("HOURS label %r has no long form in DAYS_EN" % _lab)

def _cap(t):
    return t[:1].upper() + t[1:]

def hours_sentence(lang):
    """One plain sentence a person, or an answer engine, can quote, built from
    the same HOURS the footer and the opening-hours markup are built from."""
    if lang == "en":
        return " ".join("%s, %s." % (DAYS_EN[lab], win) for lab, win in HOURS)
    return " ".join(_cap("%s, de %s." % (DAYS_ES[lab], win.replace(" to ", " a ")))
                    for lab, win in HOURS)

PHONES     = {"en": "613-4677 or 802-2332", "es": "613-4677 o 802-2332"}

def faq_fill(text, lang):
    return text.format(addr=ADDRESS, hours_short=hours_sentence(lang), phone=PHONES[lang])

# Both languages of every answer go into the same table the rest of the site is
# translated through, so the Spanish page gets the Spanish answer rather than a
# machine pass over the English one.
for _f in FAQ:
    for _k in ("q", "a"):
        ES.setdefault(faq_fill(_f[_k]["en"], "en"), faq_fill(_f[_k]["es"], "es"))
for _k, _v in FAQ_HEAD.items():
    ES.setdefault(_v["en"], _v["es"])


def faq_section(lang="en"):
    """The questions people ask, answered in the open.

    Not an accordion. An answer engine will read text inside a closed panel, but
    a person scanning on a phone will not, and the whole point of this section is
    that the answer is right there without a second tap."""
    L = lambda d: esc(d[lang])
    items = "".join(
      '<div class="qa" id="q-%s"><h3>%s</h3><p>%s</p></div>'
      % (f["id"], esc(faq_fill(f["q"][lang], lang)), esc(faq_fill(f["a"][lang], lang)))
      for f in FAQ)
    return ('\n <!-- ===== FAQ ===== -->\n <section class="blk faq-sec" id="faq">\n  <div class="container">\n'
            '   <div class="sec-head"><span class="sec-kicker">%s</span>'
            '<h2 class="sec-title">%s <span class="deco">%s</span></h2>'
            '<p class="sec-sub">%s</p></div>\n'
            '   <div class="qa-grid">%s</div>\n'
            '   <p class="map-cta"><a class="btn btn-red" href="menu.html">%s</a></p>\n'
            '  </div>\n </section>'
            % (L(FAQ_HEAD["kicker"]), L(FAQ_HEAD["title_a"]), L(FAQ_HEAD["title_b"]),
               L(FAQ_HEAD["sub"]), items, L(FAQ_HEAD["more"])))


def menu_section():
    """The whole menu, built from menu_data so one file holds every string."""
    def item_row(it):
        bits = ['<div class="mi"><div class="mi-l"><span class="mi-name">%s</span>' % esc(it["name"])]
        if it.get("desc"):
            bits.append('<span class="mi-desc">%s</span>' % esc(it["desc"]))
        bits.append("</div>")
        if it.get("price") is not None:
            label = "$%d%s" % (it["price"], " ea" if it.get("each") else "")
            bits.append('<span class="mi-price">%s</span>' % label)
            opts = it.get("options") or (MEATS if it.get("meat") else None)
            bits.append('<div class="mi-controls">')
            if opts:
                bits.append('<select class="mi-meat" aria-label="%s">%s</select>'
                            % (esc(MENU_INTRO["choose_meat"] % it["name"]),
                               "".join(
                                 # value stays the plain meat name, so the kitchen
                                 # reads "Birria", not "Birria (+$1)"
                                 '<option value="%s"%s>%s</option>'
                                 % (esc(o),
                                    (' data-add="%d"' % MEAT_SURCHARGE[o]) if o in MEAT_SURCHARGE else "",
                                    esc(o + (" (+$%d)" % MEAT_SURCHARGE[o] if o in MEAT_SURCHARGE else "")))
                                 for o in opts)))
            bits.append('<button type="button" class="add-btn" data-name="%s" data-price="%s"%s>Add</button>'
                        % (esc(it["name"]), label, ' data-meat="1"' if opts else ""))
            bits.append("</div>")
        bits.append("</div>")
        return "".join(bits)

    cats = []
    for c in MENU_CATS:
        bar = '<div class="cat-bar"><span class="cat-name">%s</span>%s</div>' % (
              esc(c["name"]),
              '<span class="cat-sub">%s</span>' % esc(c["sub"]) if c.get("sub") else "")
        # A description shared by every item in the group reads as shouting inside
        # the uppercase bar, so it sits under it in normal case.
        note = '<p class="cat-note">%s</p>' % esc(c["note"]) if c.get("note") else ""
        cats.append('<div class="mcat">%s%s%s</div>'
                    % (bar, note, "".join(item_row(i) for i in c["items"])))

    return (
 '<!-- ===== MENU ===== -->\n <section class="blk menu-sec" id="menu">\n  <div class="container">\n'
 '   <div class="sec-head">\n'
 '    <span class="sec-kicker">%s</span>\n'
 '    <h2 class="sec-title">%s <span class="deco">%s</span></h2>\n'
 '    <p class="sec-sub">%s</p>\n'
 '   </div>\n'
 '   <div class="menu-collapse" id="menu-collapse">\n    <div class="menu-grid">\n     %s\n    </div>\n'
 '    <p class="menu-note">%s</p>\n'
 '    <p class="menu-hint">%s</p>\n'
 '   </div>\n'
 '   <div class="menu-toggle-wrap"><button type="button" id="menu-toggle" class="btn btn-green">%s</button></div>\n'
 '   <div class="menu-cta"><button type="button" class="btn btn-red js-open-basket">%s</button></div>\n'
 '  </div>\n </section>'
 % (esc(MENU_INTRO["kicker"]), esc(MENU_INTRO["title_a"]), esc(MENU_INTRO["title_b"]),
    esc(MENU_INTRO["sub"]), "\n".join(cats), esc(MENU_INTRO["note"]),
    esc(MENU_INTRO["hint"]), esc(MENU_INTRO["full"]), esc(MENU_INTRO["basket"])))


def deals_band():
    """Home page carousel of the featured flyers."""
    by = {d["id"]: d for d in DEALS}
    feat = [by[i] for i in FEATURED if i in by]
    # Only the first flyer is on screen. The rest carry their source in data-src so
    # the home page does not pull about 600KB of artwork nobody is looking at yet;
    # the carousel fetches each one just before it slides in.
    def slide(n, d):
        src = ('src="assets/img/%s" fetchpriority="high"' % d["flyer"] if n == 0
               else 'data-src="assets/img/%s" loading="lazy"' % d["flyer"])
        wh = img_size(d["flyer"])
        dims = ' width="%d" height="%d"' % wh if wh else ""
        return ('<a class="dcar-slide" href="deals-combos.html#deal-%s" aria-label="%s">'
                '<img %s alt="%s offer"%s decoding="async">'
                '<span class="dcar-cap"><b>%s</b><em>%s</em></span></a>'
                % (d["id"], esc(d["title"]), src, esc(d["title"]), dims,
                   esc(d["title"]), deal_price_label(d)))
    slides = "".join(slide(n, d) for n, d in enumerate(feat))
    dots = "".join('<button type="button" class="dcar-dot" aria-label="Deal %d"></button>' % (i+1)
                   for i in range(len(feat)))
    return ('\n <!-- ===== DEALS ===== -->\n <section class="blk deals-band" id="deals">\n  <div class="container">\n'
            '   <div class="sec-head"><span class="sec-kicker">%s</span>'
            '<h2 class="sec-title">Deals &amp; <span class="deco">Combos</span></h2>'
            '<p class="sec-sub">%s</p></div>\n'
            '   <div class="dcar" id="dcar"><div class="dcar-view"><div class="dcar-track">%s</div></div>'
            '<button type="button" class="dcar-nav dcar-prev" aria-label="%s">&#8249;</button>'
            '<button type="button" class="dcar-nav dcar-next" aria-label="%s">&#8250;</button>'
            '<div class="dcar-dots">%s</div></div>\n'
            '   <p class="map-cta"><a class="btn btn-red" href="deals-combos.html">%s</a></p>\n'
            '  </div>\n </section>'
            % (esc(STR["section_kicker"]), esc(STR["section_sub"]), slides,
               esc(STR["prev"]), esc(STR["next"]), dots, esc(STR["view_all"])))


def has_img(fn):
    return os.path.isfile(os.path.join(os.path.dirname(__file__), "assets", "img", fn))

def img_size(fn):
    """Real pixel size, so the browser can reserve the right box before it loads.
    Returns None if Pillow is missing, and the caller simply omits the attributes."""
    try:
        from PIL import Image
        here = os.path.join(DIST, "assets", "img", fn)
        if not os.path.exists(here):
            here = os.path.join(os.path.dirname(__file__), "assets", "img", fn)
        with Image.open(here) as im:
            return im.size
    except Exception:
        return None

def inline(t):
    t = esc(t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", t)
    return t

def article_body(a, socblock):
    out = []
    for b in a["blocks"]:
        k = b["t"]
        if k == "p":        out.append("<p>%s</p>" % inline(b["x"]))
        elif k == "h":      out.append('<h2 class="art-h">%s</h2>' % esc(b["x"]))
        elif k == "kicker": out.append('<p class="art-kicker">%s</p>' % esc(b["x"]))
        elif k == "img":
            # the photo may not be in the repo yet; omit rather than ship a broken image
            if has_img(b["src"]):
                out.append('<figure class="art-fig"><img src="assets/img/%s" alt="%s" '
                           'loading="lazy" data-zoom="assets/img/%s" tabindex="0" '
                           'role="button"></figure>' % (b["src"], esc(b["x"]), b["src"]))
        elif k == "cta":
            out.append('<p class="art-cta"><a class="btn btn-red" href="%s">%s</a></p>'
                       % (b["href"], esc(b["x"])))
        elif k == "social" and socblock:
            out.append('<div class="art-social">%s</div>' % socblock)
    return "".join(out)

def article_hero(a):
    return a["hero"] if has_img(a["hero"]) else a.get("hero_fallback", "hero-plate.jpg")

def article_page(a, socblock):
    return ('\n <article class="blk art">\n  <div class="container art-wrap">\n'
            '   <p class="art-back"><a href="%s">&#8249; %s</a></p>\n'
            '   <span class="sec-kicker">%s</span>\n'
            '   <h1 class="art-title">%s</h1>\n'
            '   <p class="art-date"><time datetime="%s">%s</time></p>\n'
            '   <figure class="art-hero"><img src="assets/img/%s" alt="%s" '
            'data-zoom="assets/img/%s" tabindex="0" role="button"></figure>\n'
            '   %s\n  </div>\n </article>'
            % (HUB["slug"], esc(HUB["back"]), esc(HUB["kicker"]), esc(a["title"]),
               a["date"], esc(a["date_label"]), article_hero(a), esc(a["hero_alt"]),
               article_hero(a),
               article_body(a, socblock)))

def hub_page():
    cards = "".join(
      '<a class="post" href="%s">'
      '<span class="post-img"><img src="assets/img/%s" alt="%s" loading="lazy"></span>'
      '<span class="post-body"><time class="post-date" datetime="%s">%s</time>'
      '<span class="post-title">%s</span><span class="post-ex">%s</span>'
      '<span class="post-more">%s</span></span></a>'
      % (a["slug"], article_hero(a), esc(a["hero_alt"]), a["date"], esc(a["date_label"]),
         esc(a["title"]), esc(a["excerpt"]), esc(HUB["read"]))
      for a in ARTICLES)
    return ('\n <section class="blk" id="kitchen">\n  <div class="container">\n'
            '   <div class="sec-head"><span class="sec-kicker">%s</span>'
            '<h2 class="sec-title">%s <span class="deco">%s</span></h2>'
            '<p class="sec-sub">%s</p></div>\n   <div class="post-grid">%s</div>\n'
            '  </div>\n </section>'
            % (esc(HUB["kicker"]), esc(HUB["title_a"]), esc(HUB["title_b"]),
               esc(HUB["sub"]), cards))

def article_jsonld(a):
    return '\n<script type="application/ld+json">%s</script>' % json.dumps({
      "@context":"https://schema.org","@type":"Article",
      "headline":a["title"],"datePublished":a["date"],
      "image":SITE_URL+"/assets/img/"+article_hero(a),
      "author":{"@type":"Organization","name":BRAND},
      "publisher":{"@type":"Organization","name":BRAND,
                   "logo":{"@type":"ImageObject","url":SITE_URL+"/icon-512.png"}},
      "mainEntityOfPage":SITE_URL+"/"+a["slug"],
    }, ensure_ascii=False)

def stars(v):
    """Five stars with the last one part-filled to the real average."""
    return ('<span class="stars" aria-label="%s out of 5"><span class="fill" style="width:%.1f%%">'
            '\u2605\u2605\u2605\u2605\u2605</span></span>' % (v, v/5*100))

def rating_block(cls=""):
    return ('<div class="rating %s"><span class="rating-num">%s</span>%s'
            '<span class="rating-sub">Based on %d Google reviews</span></div>'
            % (cls, RATING, stars(RATING), REVIEW_COUNT))

def reviews_band():
    """Home page: the rating, then four real reviews that rotate vertically."""
    by = {r["id"]: r for r in REVIEWS}
    first = [by[i] for i in HOME_ORDER[:4] if i in by]
    slots = "".join(
      '<figure class="rcard" data-slot="%d"><div class="rcard-in">'
      '<div class="rev-top">%s<span class="rev-src">%s</span></div>'
      '<blockquote>%s</blockquote><figcaption>%s</figcaption></div></figure>'
      % (n, stars(r["rating"]), esc(STR_REVIEWS["via"]), esc(r["en"]), esc(r["name"]))
      for n, r in enumerate(first))
    return ('\n <!-- ===== REVIEWS BAND ===== -->\n <section class="blk rev-band">\n  <div class="container">\n'
            '   <div class="sec-head"><span class="sec-kicker">%s</span>'
            '<h2 class="sec-title">%s <span class="deco">%s</span></h2>'
            '<p class="sec-sub">Our neighbours keep coming back, and they tell us why.</p></div>\n'
            '   <div class="rev-band-in">%s</div>\n'
            '   <div class="rcard-grid" id="rcards">%s</div>\n'
            '   <p class="map-cta"><a href="reviews.html" class="btn btn-red">Read The Reviews</a></p>\n'
            '  </div>\n </section>'
            % (esc(STR_REVIEWS["home_kicker"]), esc(STR_REVIEWS["home_title_a"]),
               esc(STR_REVIEWS["home_title_b"]), rating_block(), slots))

def reel_band():
    """Home page: video thumbnails drifting round a square, bumping off each other.
    Each one is a link, so it works as a plain grid of links with no JavaScript."""
    if not VIDEOS:
        return ""
    chips = "".join(
      '<a class="chip" href="gallery.html#v-%s" data-id="%s" aria-label="Watch: %s">'
      '<span class="chip-img" style="background-image:url(\'%s\')"></span>'
      '<span class="chip-play" aria-hidden="true"></span>'
      '<span class="chip-cap">%s</span></a>'
      % (v["id"], v["id"], esc(v["title"]), derivative(v["poster"].split("/")[-1], 480, "g")[0],
         esc(v["title"]))
      for v in VIDEOS[:6])
    spare = "".join(
      '<template class="chip-spare" data-id="%s" data-title="%s" data-img="%s"></template>'
      % (v["id"], esc(v["title"]), derivative(v["poster"].split("/")[-1], 480, "g")[0])
      for v in VIDEOS[6:])
    return ('\n <!-- ===== REEL ===== -->\n <section class="blk reel-sec" id="whats-cooking">\n'
            '  <div class="container">\n'
            '   <div class="sec-head"><span class="sec-kicker">Watch</span>'
            '<h2 class="sec-title">What Is <span class="deco">Cooking</span></h2>'
            '<p class="sec-sub">%s</p></div>\n'
            '   <div class="reel" id="reel">%s%s</div>\n'
            '  </div>\n </section>' % (esc(REEL_SUB), chips, spare))


def promo_modal(fname):
    """The entry popup, rendered into the page rather than built in the browser.

    Two reasons it is server-side. The Spanish pass walks finished HTML, so copy
    that lives here gets translated by the same machinery as everything else and
    the build stops if a line has no Spanish. And the words are in the markup
    for anyone reading the page without running our JavaScript.

    It carries no heading tags on purpose. normalise_headings() walks every
    h1-h6 on the page to work out the document outline, and an advertisement
    that opens on top of the page is not part of that outline: a real <h2> in
    here would push the page's own headings down a level. The title is a <p>
    that looks like a heading and is named as one through aria-labelledby.

    The button is a real link to the menu so that it works, and works in one
    tap, whether or not the script ever runs."""
    C = promo_data.COPY
    href = "menu.html#menu" if fname == "menu.html" else "menu.html"
    body = "".join("<p>%s</p>" % esc(p) for p in C["body"])
    return (
 '\n<div id="promo" class="promo" hidden>\n'
 ' <div class="promo-card" role="dialog" aria-modal="true" aria-labelledby="promo-t">\n'
 '  <button type="button" id="promo-x" class="promo-x" aria-label="%s">'
 '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
 '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'
 '</svg></button>\n'
 '  <span class="promo-mark" style="background-image:url(\'assets/img/logo.webp\')" aria-hidden="true"></span>\n'
 '  <p class="promo-flag" aria-hidden="true">\U0001F1E7\U0001F1FF \U0001F1E7\U0001F1FF</p>\n'
 '  <p class="promo-t" id="promo-t">%s</p>\n'
 '  <p class="promo-welcome">%s<span aria-hidden="true"> \U0001F32E</span></p>\n'
 '  <div class="promo-body">%s</div>\n'
 '  <p class="promo-nocode">%s</p>\n'
 '  <p class="promo-cta"><a class="btn btn-red" id="promo-go" href="%s">%s <span aria-hidden="true">&rarr;</span></a></p>\n'
 '  <p class="promo-thanks">%s</p>\n'
 '  <p class="promo-sign">%s<span aria-hidden="true"> \U0001F1E7\U0001F1FF\U0001F32E</span></p>\n'
 ' </div>\n</div>'
 % (esc(C["close"]), esc(C["title"]),
    esc(C["welcome"]), body, esc(C["nocode"]), href, esc(C["cta"]),
    esc(C["thanks"]), esc(C["signoff"])))

def connect_band():
    """Taco Taco Connect, announced rather than linked.

    It sits directly under the map because that is the end of the "how do I
    reach you" run on the home page: address, hours, service, and then the one
    address that holds all of it. The six chips name what is behind the link so
    it is not a bare URL asking to be trusted, and the host is set in type
    large enough to be read off a screen and typed into a phone by somebody who
    is looking at the page over a friend's shoulder.

    It is a plain external link. Nothing here needs JavaScript."""
    chips = ["Menu", "Order on WhatsApp", "Directions", "Hours", "Socials", "QR code"]
    row = "".join('<span class="cn-chip">%s</span>' % esc(c) for c in chips)
    return (
 '\n <!-- ===== CONNECT ===== -->\n <section class="blk cn-band" id="connect">\n  <div class="container">\n'
 '   <div class="cn-card">\n'
 '    <span class="cn-mark" style="background-image:url(\'assets/img/logo.webp\')" aria-hidden="true"></span>\n'
 '    <span class="sec-kicker cn-kicker">One Link</span>\n'
 '    <h2 class="sec-title cn-title">Taco Taco <span class="deco">Connect</span></h2>\n'
 '    <p class="cn-sub">Everything Taco Taco in one place. Save it, share it, '
 'and you will never have to hunt for us again.</p>\n'
 '    <div class="cn-chips">%s</div>\n'
 '    <p class="cn-go"><a class="btn btn-yellow" href="%s" target="_blank" rel="noopener">'
 'Open Taco Taco Connect</a></p>\n'
 '    <p class="cn-url"><a href="%s" target="_blank" rel="noopener">%s</a></p>\n'
 '   </div>\n  </div>\n </section>'
 % (row, CONNECT_URL, CONNECT_URL, esc(CONNECT_HOST)))

def storefront_shot():
    """The reviews page opens on the restaurant itself.

    One photograph, two shapes. The file is the full frame at 1200px and the
    browser picks a 900px copy on a phone; the crop is done in CSS rather than
    by shipping a second file, because at 3/2 the phone still keeps the porch,
    the banner and the road sign, which is everything worth keeping."""
    w, h = img_size("storefront.jpg") or (1200, 696)
    small, sw, _sh = derivative("storefront.jpg", 900, "h")
    alt = ("The Taco Taco Mexican Restaurant building on Aloe Vera Ave in West Belmopan, "
           "with covered seating out front and the Taco Taco road sign by the gate")
    return ('<figure class="rev-shot">'
            '<img src="assets/img/storefront.jpg" srcset="%s %dw, assets/img/storefront.jpg %dw" '
            'sizes="(min-width:1000px) 1100px, 100vw" alt="%s" width="%d" height="%d" '
            'decoding="async" fetchpriority="high" '
            'data-zoom="assets/img/storefront.jpg" tabindex="0" role="button">'
            '</figure>' % (small, sw, w, esc(alt), w, h))

def visit_band():
    """Home page: the real map with the pin, plus the details beside it."""
    return ('\n <!-- ===== VISIT ===== -->\n <section class="blk visit-sec" id="find-us">\n  <div class="container">\n'
            '   <div class="sec-head"><span class="sec-kicker">Find Us</span>'
            '<h2 class="sec-title">Come <span class="deco">Say Hello</span></h2></div>\n'
            '   <div class="visit-split">\n'
            '    <div class="map-wrap"><iframe src="%s" loading="lazy" title="Map to %s" '
            'referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>\n'
            '    <div class="visit-facts">'
            '<div class="fact"><h4>Address</h4><p>%s</p></div>'
            '<div class="fact"><h4>Hours</h4><p>%s</p></div>'
            '<div class="fact"><h4>Service</h4><p>Dine-In &middot; Takeout &middot; Delivery</p></div>'
            '</div>\n   </div>\n  </div>\n </section>'
            % (MAPS_EMBED, BRAND, ADDRESS, hours_html()))

def map_section():
    return ('\n <!-- ===== MAP ===== -->\n <section class="blk map-sec" id="find-us">\n  <div class="container">\n'
            '   <div class="sec-head"><span class="sec-kicker">Find Us</span>'
            '<h2 class="sec-title">Where To <span class="deco">Find Us</span></h2>'
            '<p class="sec-sub">%s</p></div>\n'
            '   <div class="map-wrap"><iframe src="%s" loading="lazy" title="Map to %s" '
            'referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>\n'
            '  </div>\n </section>' % (ADDRESS, MAPS_EMBED, BRAND))

def review_card(r, lang="en"):
    txt = r.get(lang) or ""
    body = ('<blockquote>%s</blockquote>' % esc(txt)) if txt else (
           '<p class="rev-notext">%s</p>' % esc(STR_REVIEWS["no_text"]))
    return ('<figure class="rev"><div class="rev-top">%s<span class="rev-src">%s</span></div>'
            '%s<figcaption>%s</figcaption></figure>'
            % (stars(r["rating"]), esc(STR_REVIEWS["via"]), body, esc(r["name"])))

def reviews_page_body():
    head = ('\n <section class="blk rev-hero">\n  <div class="container">\n'
            '   ' + storefront_shot() + '\n'
            '   <div class="sec-head"><span class="sec-kicker">Reviews</span>'
            '<h2 class="sec-title">What Our <span class="deco">Customers Say</span></h2></div>\n'
            '   %s\n   <p class="map-cta"><a class="btn btn-red" href="%s" target="_blank" rel="noopener">'
            'Read Them On Google</a></p>\n  </div>\n </section>' % (rating_block("big"), MAPS_LINK))
    withtext = [r for r in REVIEWS if r.get("en")]
    notext   = [r for r in REVIEWS if not r.get("en")]
    cards = "".join(review_card(r) for r in withtext + notext)
    return head + ('\n <section class="blk"><div class="container"><div class="rev-grid">%s</div>'
                   '</div></section>' % cards)

def frag(html, marker, endmarker="</section>"):
    i = html.find(marker)
    if i < 0: return ""
    j = html.find(endmarker, i)
    return html[i:j+len(endmarker)]

# Heading levels describe the shape of a page, and every stylesheet rule that
# touched a heading has been rewritten to key off the surrounding class instead
# of the tag, so the levels are free to say what is actually true.
#
# Eight of the nine pages had no h1 at all. Every one of them opened at h2,
# which leaves the single strongest heading on the page unsaid, and several
# then jumped straight from h2 to h4. This walks the headings in the order a
# reader meets them: the first is the page's h1, and no later one may drop more
# than one level below the one before it. Going back up is always allowed, and a
# second h1 is not.
_HTAG = re.compile(r"<h([1-6])([^>]*)>(.*?)</h\1>", re.S)

def normalise_headings(page):
    out, last, prev, had_h1 = [], 0, 0, False
    for m in _HTAG.finditer(page):
        lvl = min(int(m.group(1)), prev + 1)
        if lvl <= 1:
            lvl = 2 if had_h1 else 1
        if lvl == 1:
            had_h1 = True
        out.append(page[last:m.start()])
        out.append("<h%d%s>%s</h%d>" % (lvl, m.group(2), m.group(3), lvl))
        last, prev = m.end(), lvl
    out.append(page[last:])
    return "".join(out)


def main():
    html = open(SRC, encoding="utf-8").read()

    # Copy the assets first: the page builders below write downscaled copies into
    # dist/assets/img, and a later copytree would wipe them.
    os.makedirs(DIST, exist_ok=True)
    for sub in ("assets",):
        if os.path.isdir(os.path.join(DIST,sub)): shutil.rmtree(os.path.join(DIST,sub))
    shutil.copytree(os.path.join(os.path.dirname(__file__),"assets"), os.path.join(DIST,"assets"))

    # Cap the deployed masters. This runs before the page builders, so img_size
    # below reads the capped copy and the width and height a page states are the
    # width and height the browser will actually receive.
    try:
        from PIL import Image as _Im
        _capped, _saved = 0, 0
        _imgdir = os.path.join(DIST, "assets", "img")
        for _fn in sorted(os.listdir(_imgdir)):
            if not _fn.lower().endswith((".jpg", ".jpeg", ".png", ".webp")): continue
            _full = os.path.join(_imgdir, _fn)
            if not os.path.isfile(_full): continue
            _was = os.path.getsize(_full)
            with _Im.open(_full) as _im:
                if _im.width <= MASTER_MAX: continue
                _fmt = _im.format
                _im = _im.convert("RGB").resize(
                    (MASTER_MAX, round(_im.height * MASTER_MAX / _im.width)), _Im.LANCZOS)
                if _fmt == "WEBP": _im.save(_full, "WEBP", quality=82, method=6)
                else:              _im.save(_full, "JPEG", quality=86, optimize=True, progressive=True)
            _capped += 1; _saved += _was - os.path.getsize(_full)
        if _capped:
            print("masters capped at %dpx: %d files, %d KB saved" % (MASTER_MAX, _capped, _saved // 1024))
    except Exception as _e:
        print("  !! master cap skipped: %s: %s" % (type(_e).__name__, _e))

    # The number lives in build_site and nowhere else. site.js used to carry its
    # own copy, which is how the site ended up with a test line in one file and
    # the restaurant's line in another.
    _js = os.path.join(DIST, "assets", "js", "site.js")
    _b  = open(_js, encoding="utf-8").read()
    _b, _n = re.subn(r"var WA_NUMBER='[0-9]+';", "var WA_NUMBER='%s';" % WA_NUMBER, _b, count=1)
    if not _n:
        sys.exit("site.js no longer declares WA_NUMBER: the build cannot set the number")
    open(_js, "w", encoding="utf-8").write(_b)

    # ---------- fragments ----------
    hero   = frag(html, "<!-- ===== HERO ===== -->")
    favs   = frag(html, "<!-- ===== FEATURED FAVORITES ===== -->")
    # The favourite cards show a photo a few hundred pixels wide, so they take the
    # grid-sized copy and data-zoom still points at the full file. The hero above
    # them already downloads its own photographs at full size, so those are left
    # alone rather than fetched a second time at another size.
    HERO_IMGS = {"hero-plate.jpg", "badge-01.jpg", "badge-02.jpg", "side-01.jpg"}
    favs = re.sub(r"background-image:url\('assets/img/([^']+)'\)",
                  lambda m: m.group(0) if (m.group(1) in HERO_IMGS or not has_img(m.group(1)))
                            else "background-image:url('%s')" % derivative(m.group(1), 600, "g")[0],
                  favs)
    menu   = menu_section()
    galler = frag(html, "<!-- ===== GALLERY ===== -->")
    # Rebuild the grid from GALLERY so the tiles and their descriptions live in
    # one list rather than as hand-maintained markup.
    def tile(f, a):
        """A gallery tile.

        Two sizes and no src. A tile is 186px on a phone and 279px on a desktop,
        so one 600px file served everywhere is between two and three times more
        picture than any screen can show.

        The address goes in data-src and this file's own script fills it in as
        the tile comes near. That is not what loading="lazy" is for, and
        normally it would be the wrong thing to do, but the browser's own rule
        widens its idea of "near" to thousands of pixels on a slow connection,
        which is precisely the connection this matters on: the whole page was
        being fetched before the reader had moved. A noscript copy keeps the
        gallery working with no JavaScript at all."""
        grid,  w, h = derivative(f, 600, "g")
        small, _, _ = derivative(f, 400, "s")
        return ('<div class="gitem">'
                '<img class="lz" alt="%s" width="%d" height="%d" '
                'data-src="%s" data-srcset="%s 400w, %s 600w" '
                'sizes="(min-width:900px) 300px, 46vw" '
                'data-zoom="assets/img/%s" tabindex="0" role="button">'
                '<noscript><img src="%s" alt="%s" width="%d" height="%d" loading="lazy"></noscript>'
                '</div>'
                % (esc(a), w, h, small, small, grid, f, small, esc(a), w, h))
    tiles = "\n".join(tile(f, a) for f, a in GALLERY if has_img(f))
    galler = re.sub(r'(<div class="gal">)(.*?)(</div>\s*</div>\s*</section>)',
                    lambda m: m.group(1) + "\n    " + tiles + "\n   " + m.group(3),
                    galler, count=1, flags=re.S)
    about  = about_section()
    order  = frag(html, "<!-- ===== ORDER ===== -->")
    def between(a, b):
        i = html.find(a); j = html.find(b, i)
        return html[i:j].rstrip() if i >= 0 and j > i else ""
    banner = between('<div class="foot-banner">', "<footer")
    footer = frag(html, "<footer", "</footer>")
    dock   = between('<div class="dock">', '<div id="basket-panel"')
    basket = between('<div id="basket-panel"', "<script")
    for nm, f in [("hero",hero),("favs",favs),("menu",menu),("gallery",galler),
                  ("about",about),("order",order),("footer",footer),
                  ("dock",dock),("basket",basket)]:
        if not f: print("  !! empty fragment:", nm)

    # ---------- menu: thumbnails + real category anchors ----------
    def add_thumb(m):
        row = m.group(0)
        nm = re.search(r'class="mi-name">([^<]+)<', row)
        if not nm: return row
        name = nm.group(1)
        img = ITEM_IMG.get(name.replace("&amp;","&"), None)
        if img:
            small = derivative(img, 200, "t")[0]
            th = ('<button type="button" class="mi-thumb" '
                  'style="background-image:url(\'%s\')" '
                  'data-zoom="assets/img/%s" data-zoom-title="%s" '
                  'aria-label="View photo of %s"></button>' % (small, img, name, name))
        else:
            th = '<span class="mi-thumb mi-thumb-none" aria-hidden="true"></span>'
        return row.replace('<div class="mi-l">', th + '<div class="mi-l">', 1)
    menu = re.sub(r'<div class="mi">.*?(?=<div class="mi">|</div></div>)', add_thumb, menu, flags=re.S)

    # carry the photo onto the add button so it can fly to the basket
    def tag_btn(m):
        s = m.group(0)
        nm = re.search(r'data-name="([^"]+)"', s)
        img = ITEM_IMG.get(nm.group(1).replace("&amp;","&")) if nm else None
        return s.replace('class="add-btn"', 'class="add-btn" data-img="assets/img/%s"'%img, 1) if img else s
    menu = re.sub(r'<button type="button" class="add-btn"[^>]*>', tag_btn, menu)

    # category id anchors + quick nav
    cats = re.findall(r'class="cat-name">([^<]+)<', menu)
    def slug(c): return re.sub(r'[^a-z0-9]+','-',c.lower().replace('&amp;','and')).strip('-')
    for c in cats:
        menu = menu.replace('<div class="mcat"><div class="cat-bar"><span class="cat-name">%s<'%c,
                            '<div class="mcat" id="c-%s"><div class="cat-bar"><span class="cat-name">%s<'%(slug(c),c), 1)
    quick = ('<nav class="cat-nav" aria-label="Menu categories">'
             + "".join('<a href="#c-%s">%s</a>'%(slug(c),c) for c in cats) + '</nav>')
    # a dedicated menu page shows the whole menu: drop the collapse wrapper
    menu = menu.replace('<div class="menu-collapse" id="menu-collapse">','<div class="menu-full">')
    menu = re.sub(r'<div class="menu-toggle-wrap">.*?</div>\s*', '', menu, flags=re.S)
    menu = menu.replace('<div class="menu-grid">', quick + '<div class="menu-grid">', 1)

    # ---------- video section ----------
    # Real players, not thumbnails that pretend. Nothing is fetched until the
    # reader presses play, and the clips carry their sound: controls are native so
    # the volume is where a viewer expects it.
    vids = VIDEOS
    VIDEOS_ACTIVE = vids
    if vids:
        def player(v):
            w, h = img_size(v["poster"].split("/")[-1]) or (720, 1280)
            return ('<figure class="vplay" id="v-%s">'
                    '<video preload="none" playsinline controls poster="%s" '
                    'width="%d" height="%d" aria-label="%s">'
                    '<source src="%s" type="video/mp4">'
                    'Your browser cannot play this clip. '
                    '<a href="%s">Download it instead</a>.'
                    '</video>'
                    '<figcaption>%s</figcaption></figure>'
                    % (v["id"], v["poster"], w, h, esc(v["alt"]), v["src"], v["src"], esc(v["title"])))
        video = ('\n <!-- ===== VIDEOS ===== -->\n <section class="blk" id="videos">\n  <div class="container">\n'
                 '   <div class="sec-head"><span class="sec-kicker">Watch</span>'
                 '<h2 class="sec-title">In The <span class="deco">Kitchen</span></h2>'
                 '<p class="sec-sub">%s</p></div>\n'
                 '   <div class="vplay-grid">%s</div>\n  </div>\n </section>'
                 % (esc(VIDEO_SUB), "".join(player(v) for v in vids)))
    else:
        video = ""

    # ---------- shared chrome ----------
    head_extra = re.search(r'<meta charset.*?<link rel="stylesheet"[^>]*>', html, re.S).group(0)

    def nav(cur):
        links = "".join('<a href="%s"%s>%s</a>' % (h, ' class="on"' if h==cur else '', t)
                        for h,t in PAGES)
        return links

    header = frag(html, "<header", "</header>")
    def header_for(cur):
        h = header
        h = h.replace('href="#top"', 'href="index.html"', 1)          # brand link
        # The switch sits between the logo and the menu options, as asked: on a
        # phone that is between the logo and Browse, on a desktop between the
        # logo and the links. Filled in per language after the page is built.
        h = h.replace('<div class="nav-links">',
                      '<!--LANGSW:%s--><div class="nav-links">' % cur, 1)
        h = re.sub(r'<div class="nav-links">.*?</div>',
                   '<div class="nav-links">%s</div>'%nav(cur), h, flags=re.S)
        h = re.sub(r'<div class="mnav-drop">.*?</div>',
                   '<div class="mnav-drop">%s</div>'%nav(cur), h, flags=re.S)
        return h

    GLYPH = {
     "facebook":'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.1 23.7v-8H6.6v-3.7h2.5v-1.6c0-4.1 1.9-6 5.9-6 .4 0 1 .1 1.5.1.4.1.8.1 1.1.2v3.3c-.2 0-.4 0-.7-.1h-.7c-.7 0-1.3.1-1.7.3-.3.2-.5.4-.7.6-.3.4-.4 1-.4 1.8V12h3.9l-.4 2.1-.3 1.6h-3.2v8c5.4-.5 9.6-5 9.6-10.6C24 5.4 18.6 0 12 0S0 5.4 0 12c0 5.6 4.3 10.3 9.1 11.7z"/></svg>',
     "instagram":'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.6.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2-.1-1.3-.1-1.6-.1-4.9s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.3-.1 1.6-.1 4.9-.1M12 0C8.7 0 8.3 0 7.1.1 5.8.1 4.9.3 4.1.6c-.8.3-1.5.7-2.1 1.4C1.3 2.6.9 3.3.6 4.1.3 4.9.1 5.8.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.1 1.3.2 2.1.5 2.9.3.8.7 1.5 1.4 2.1.7.7 1.3 1.1 2.1 1.4.8.3 1.6.5 2.9.6 1.3.1 1.7.1 4.9.1s3.7 0 4.9-.1c1.3-.1 2.1-.3 2.9-.6.8-.3 1.5-.7 2.1-1.4.7-.7 1.1-1.3 1.4-2.1.3-.8.5-1.6.6-2.9.1-1.3.1-1.7.1-4.9s0-3.7-.1-4.9c-.1-1.3-.3-2.1-.6-2.9-.3-.8-.7-1.5-1.4-2.1-.6-.7-1.3-1.1-2.1-1.4-.8-.3-1.6-.5-2.9-.6C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zM12 16a4 4 0 110-8 4 4 0 010 8zm7.8-10.4a1.4 1.4 0 11-2.9 0 1.4 1.4 0 012.9 0z"/></svg>',
     "tiktok":'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.5 0h3.9c.1 1.5.6 3.1 1.8 4.2 1.1 1.1 2.7 1.6 4.2 1.8v4c-1.4 0-2.9-.3-4.2-1-.6-.3-1.1-.6-1.6-.9 0 2.9 0 5.8-.1 8.8-.1 1.4-.5 2.8-1.3 3.9-1.3 1.9-3.6 3.2-5.9 3.2-1.4.1-2.9-.3-4.1-1-2-1.2-3.4-3.4-3.7-5.7v-1.5c.2-1.9 1.1-3.7 2.6-5C5.7 9.4 8 8.7 10.2 9.1c0 1.5-.1 3-.1 4.4-1-.3-2.1-.2-3 .4-.6.4-1.1 1-1.4 1.7-.2.5-.1 1.1-.1 1.6.2 1.6 1.8 3 3.5 2.9 1.1 0 2.2-.7 2.8-1.6.2-.3.4-.7.4-1.1.1-1.8.1-3.6.1-5.4V0z"/></svg>'}
    socbtns = "".join(
        '<a class="soc soc-%s" href="%s" target="_blank" rel="noopener" aria-label="%s">%s</a>'
        % (k, v, k.capitalize(), GLYPH[k]) for k, v in SOCIAL.items() if v)
    socblock = '<div class="socials">%s</div>'%socbtns if socbtns else ""

    foot = footer.replace('<a href="#order">Order Online</a>', '<a href="menu.html">Order Online</a>')
    # One internal link, on every page, to the page that answers things. Cheap
    # for a reader and the kind of link that tells a crawler which page is the
    # authority on hours, address and how ordering works.
    foot = foot.replace('<a href="menu.html">Order Online</a>',
                        '<a href="menu.html">Order Online</a>'
                        '<a href="about.html#faq">%s</a>' % esc(FAQ_HEAD["link"]["en"]), 1)
    # Sibling of .foot-grid, not a fourth grid item, so the row spans the footer
    # and the icons sit on the centre line rather than under the first column.
    foot = foot.replace('</div>\n  <div class="foot-bottom">',
                        '</div>\n  '+socblock+'\n  <div class="foot-bottom">')

    def head_meta(fname, title, desc):
        url = SITE_URL + ("/" if fname == "index.html" else "/" + fname)
        return (
 # In the head, not at the end of the body. A defer script sitting after all the
 # markup is discovered last, so on a slow connection the browser fetched every
 # photograph before it fetched the 21KB that makes the page work: no basket, no
 # carousel, no tap handlers until the images were done. Discovered here, they
 # queue ahead of the images and still execute after parsing, as defer promises.
 '\n<script src="assets/js/deals.js" defer fetchpriority="high"></script>'
 '\n<script src="assets/js/site.js" defer fetchpriority="high"></script>'
 '\n<link rel="canonical" href="%s">'
 '<!--HREFLANG:{FN}-->'
 '<!--AUTOLANG-->'
 '\n<meta name="theme-color" content="#1f5c2e">'
 '\n<link rel="icon" href="favicon.ico" sizes="any">'
 '\n<link rel="icon" type="image/png" sizes="32x32" href="icon-32.png">'
 '\n<link rel="icon" type="image/png" sizes="16x16" href="icon-16.png">'
 '\n<link rel="apple-touch-icon" href="apple-touch-icon.png">'
 '\n<link rel="manifest" href="site.webmanifest">'
 '\n<meta property="og:type" content="website">'
 '\n<meta property="og:site_name" content="%s">'
 '\n<meta property="og:title" content="%s">'
 '\n<meta property="og:description" content="%s">'
 '\n<meta property="og:url" content="%s">'
 '\n<meta property="og:image" content="%s/share-card.jpg">'
 '\n<meta property="og:image:width" content="1200">'
 '\n<meta property="og:image:height" content="630">'
 '\n<meta name="twitter:card" content="summary_large_image">'
 '\n<meta name="twitter:title" content="%s">'
 '\n<meta name="twitter:description" content="%s">'
 '\n<meta name="twitter:image" content="%s/share-card.jpg">'
 % (url, BRAND, title, desc, url, SITE_URL, title, desc, SITE_URL)).replace("{FN}", fname)

    # ---------- the structured description of the business ----------
    # One graph per page rather than a pile of separate blocks, with stable ids,
    # so a crawler or an assistant reads "this page, on this site, about this
    # restaurant" instead of three unrelated objects that happen to share a name.
    #
    # Deliberately no aggregateRating anywhere. Google's review snippet
    # guidelines forbid marking up ratings you collected somewhere else, and
    # hers live on Google. The rating is shown to readers, and it is not claimed
    # in markup.
    RID = SITE_URL + "/#restaurant"
    WID = SITE_URL + "/#website"

    def page_url(fn, lang):
        base = SITE_URL + ("" if lang == "en" else "/es")
        return base + ("/" if fn == "index.html" else "/" + fn)

    def restaurant_node():
        prices = sorted(i["price"] for c in MENU_CATS for i in c["items"]
                        if isinstance(i.get("price"), (int, float)))
        node = {
          "@type": ["Restaurant", "LocalBusiness"], "@id": RID,
          "name": BRAND, "url": SITE_URL + "/",
          "image": [SITE_URL + "/share-card.jpg",
                    SITE_URL + "/assets/img/hero-plate.jpg",
                    SITE_URL + "/assets/img/kitchen.jpg"],
          "logo": {"@type": "ImageObject", "url": SITE_URL + "/icon-512.png"},
          "telephone": "+501-613-4677",
          "contactPoint": [
            {"@type": "ContactPoint", "telephone": "+501-613-4677", "contactType": "reservations and orders"},
            {"@type": "ContactPoint", "telephone": "+501-802-2332", "contactType": "reservations and orders"}],
          "servesCuisine": "Mexican",
          "description": "Mexicali style Mexican food made fresh in West Belmopan, Belize: "
                         "tacos, birria, burritos, quesadillas, flautas, tortas and breakfast "
                         "served all day.",
          "hasMenu": {"@id": SITE_URL + "/menu.html#menu"},
          "address": {"@type": "PostalAddress", "streetAddress": ADDRESS.split(",")[0],
                      "addressLocality": "West Belmopan", "addressRegion": "Cayo",
                      "addressCountry": "BZ"},
          "areaServed": {"@type": "City", "name": "Belmopan"},
          "hasMap": MAPS_LINK,
          "currenciesAccepted": "BZD",
          "openingHoursSpecification": [
            {"@type": "OpeningHoursSpecification", "dayOfWeek": d, "opens": o, "closes": c}
            for d, o, c in HOURS_SCHEMA],
          "sameAs": [v for v in SOCIAL.values() if v],
        }
        # priceRange straight off the menu rather than a guess at how many
        # dollar signs the place deserves
        if prices:
            node["priceRange"] = "BZD %d to BZD %d" % (prices[0], prices[-1])
        return node

    def menu_node(lang):
        """The whole printed menu, machine readable: every section, every item,
        every price. This is the piece an assistant needs to answer "what does
        a birria plato cost at Taco Taco" without guessing."""
        T = (lambda x: x) if lang == "en" else i18n.tr
        secs = []
        for c in MENU_CATS:
            items = []
            for it in c["items"]:
                shown = T(it["name"])
                m = {"@type": "MenuItem", "name": shown}
                if shown != it["name"]:
                    m["alternateName"] = it["name"]
                if it.get("desc"): m["description"] = T(it["desc"])
                img = ITEM_IMG.get(it["name"])
                if img: m["image"] = SITE_URL + "/assets/img/" + img
                if isinstance(it.get("price"), (int, float)):
                    m["offers"] = {"@type": "Offer", "price": "%g" % it["price"],
                                   "priceCurrency": "BZD"}
                items.append(m)
            sec = {"@type": "MenuSection", "name": T(c["name"]), "hasMenuItem": items}
            if c.get("note"): sec["description"] = T(c["note"])
            elif c.get("sub"): sec["description"] = T(c["sub"])
            secs.append(sec)
        return {"@type": "Menu", "@id": SITE_URL + "/menu.html#menu",
                "name": T("Menu"), "inLanguage": lang,
                "url": page_url("menu.html", lang), "hasMenuSection": secs}

    def faq_node(lang):
        return {"@type": "FAQPage", "@id": page_url("about.html", lang) + "#faq",
                "inLanguage": lang,
                "mainEntity": [
                  {"@type": "Question", "name": faq_fill(f["q"][lang], lang),
                   "acceptedAnswer": {"@type": "Answer", "text": faq_fill(f["a"][lang], lang)}}
                  for f in FAQ]}

    def crumbs_node(fn, title, lang):
        home = "Home" if lang == "en" else "Inicio"
        trail = [(home, page_url("index.html", lang))]
        art = [a for a in ARTICLES if a["slug"] == fn]
        if art:
            trail.append((i18n.tr(HUB["name"]) if lang == "es" else HUB["name"],
                          page_url(HUB["slug"], lang)))
        if fn != "index.html":
            trail.append((title.split(" | ")[0], page_url(fn, lang)))
        return {"@type": "BreadcrumbList", "@id": page_url(fn, lang) + "#crumbs",
                "itemListElement": [
                  {"@type": "ListItem", "position": n + 1, "name": nm, "item": u}
                  for n, (nm, u) in enumerate(trail)]}

    def page_jsonld(fn, title, desc, lang):
        url = page_url(fn, lang)
        g = [restaurant_node(),
             {"@type": "WebSite", "@id": WID, "url": SITE_URL + "/", "name": BRAND,
              "publisher": {"@id": RID},
              "inLanguage": [c for c, _s, _n in LANGS]},
             {"@type": "WebPage", "@id": url + "#page", "url": url,
              "name": title, "description": desc, "inLanguage": lang,
              "isPartOf": {"@id": WID}, "about": {"@id": RID},
              "primaryImageOfPage": SITE_URL + "/share-card.jpg",
              "breadcrumb": {"@id": url + "#crumbs"}},
             crumbs_node(fn, title, lang)]
        if fn == "menu.html":  g.append(menu_node(lang))
        if fn == "about.html": g.append(faq_node(lang))
        art = [a for a in ARTICLES if a["slug"] == fn]
        if art:
            a = art[0]
            g.append({
              "@type": "Article", "@id": url + "#article",
              "headline": i18n.tr(a["title"]) if lang == "es" else a["title"],
              "description": i18n.tr(a["meta"]) if lang == "es" else a["meta"],
              "datePublished": a["date"], "dateModified": a["date"],
              "inLanguage": lang,
              "image": SITE_URL + "/assets/img/" + article_hero(a),
              "author": {"@id": RID}, "publisher": {"@id": RID},
              "isPartOf": {"@id": url + "#page"},
              "mainEntityOfPage": {"@id": url + "#page"}})
        return ('\n<script type="application/ld+json">%s</script>'
                % json.dumps({"@context": "https://schema.org", "@graph": g},
                             ensure_ascii=False, separators=(",", ":")))

    def page(fname, title, body, desc, nav_as=None):
        h = head_extra
        h = re.sub(r'<title>.*?</title>', '<title>%s</title>'%title, h, flags=re.S)
        h = re.sub(r'(<meta name="description" content=")[^"]*(")', r'\1'+desc+r'\2', h)
        h = h + head_meta(fname, title, desc) + "<!--SCHEMA-->"
        return ("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n%s\n</head>\n<body>\n%s\n<main id=\"top\">\n%s\n</main>\n%s\n%s\n%s\n%s%s\n</body>\n</html>\n"
                % (h, header_for(nav_as or fname), body, banner, foot, dock, basket,
                   promo_modal(fname) if promo_live() else ""))


    # The deals carousel and the rotating reviews are drawn in the browser, so
    # their words never pass through the page translator. They get their own
    # copy of the data instead, one file per language, and site.js reads its
    # run-time strings from the same payload rather than carrying English.
    def payload(lang):
        deals = DEALS if lang == "en" else i18n.translate_json(DEALS)
        strs  = STR   if lang == "en" else i18n.translate_json(STR)
        revs  = [dict(r, en=(r.get(lang) or r.get("en") or "")) for r in REVIEWS]
        txt   = {} if lang == "en" else JS_ES
        # The promotion travels beside the deals, one copy per language, because
        # the basket and the WhatsApp message both need its words and its
        # numbers and neither should be reading them from two places.
        C = promo_data.COPY if lang == "en" else i18n.translate_json(promo_data.COPY)
        promo = {"on": promo_live(), "id": promo_data.PROMO_ID,
                 "pct": promo_data.PERCENT, "deals": promo_data.APPLY_TO_DEALS,
                 "from": PROMO_FROM, "to": PROMO_TO,
                 "line": C["line"], "subtotal": C["subtotal"],
                 "final": C["final"], "badge": C["badge"]}
        return ("window.TT_DEALS=%s;\nwindow.TT_STR=%s;\nwindow.TT_REVIEWS=%s;\n"
                "window.TT_REV_ORDER=%s;\nwindow.TT_T=%s;\nwindow.TT_WA='%s';\n"
                "window.TT_PROMO=%s;\n"
                % (json.dumps(deals, ensure_ascii=False), json.dumps(strs, ensure_ascii=False),
                   json.dumps(revs, ensure_ascii=False), json.dumps(HOME_ORDER, ensure_ascii=False),
                   json.dumps(txt, ensure_ascii=False), WA_NUMBER,
                   json.dumps(promo, ensure_ascii=False)))
    for _lang, _, _ in LANGS:
        open(os.path.join(DIST,"assets","js","deals%s.js" % ("" if _lang=="en" else "."+_lang)),
             "w",encoding="utf-8").write(payload(_lang))

    out = {
      "index.html":   ("%s | Belmopan"%BRAND, hero+favs+deals_band()+reviews_band()+order+reel_band()+visit_band()+connect_band(),
                       "%s in West Belmopan. Authentic Mexicali style tacos, birria, tortas and breakfast. Order online and send your order on WhatsApp."%BRAND),
      "deals-combos.html": ("Deals & Combos | %s"%BRAND, deals_page_body(),
                       "Taco Taco deals and combos in Belmopan: lunch combos, the Mega Combo, and Monday and Tuesday specials. Pick your options and order on WhatsApp."),
      "menu.html":    ("Menu | %s"%BRAND, menu,
                       "The full %s menu with prices in Belize dollars. Build your basket and send your order on WhatsApp."%BRAND),
      "reviews.html": ("Reviews | %s"%BRAND, reviews_page_body(),
                       "Read what customers say about %s. Rated %s out of 5 from %d Google reviews."%(BRAND,RATING,REVIEW_COUNT)),
      "fresh-from-our-kitchen.html": ("%s | %s"%(HUB["name"],BRAND), hub_page(),
                       "Stories and specials from the Taco Taco kitchen in West Belmopan."),
      "gallery.html": ("Gallery | %s"%BRAND, galler+video,
                       "Photos of the food we serve at %s in West Belmopan."%BRAND),
      "about.html":   ("About | %s"%BRAND, about+faq_section()+map_section(),
                       "About %s in West Belmopan: hours, address, how to order, what meats you can choose, "
                       "and answers to the questions we are asked most."%BRAND),
    }
    for _a in ARTICLES:
        out[_a["slug"]] = (_a["seo_title"], article_page(_a, socblock), _a["meta"])

    META = {fn: (t, d) for fn, (t, _b, d) in out.items()}
    META["404.html"] = ("Page not found | %s" % BRAND, "That page could not be found.")
    built = {}
    for fn,(title,body,desc) in out.items():
        art = [a for a in ARTICLES if a["slug"] == fn]
        p = page(fn, title, body, desc, nav_as=HUB["slug"] if art else None)
        p = p.replace("Taco Taco Mexican Style Food", BRAND).replace("Mexican Style Food", BRAND_SHORT)
        built[fn] = p

    # Sections moved onto their own pages when the site went multi-page, so any
    # href="#section" left over from the single-page build now points at nothing.
    # Send each one to the page that actually holds that id.
    where = {}
    for fn, p in built.items():
        for i in re.findall(r'id="([^"]+)"', p): where.setdefault(i, set()).add(fn)
    fixed = 0
    for fn in list(built):
        def retarget(m):
            global_fixed = None
            tgt = m.group(1)
            pages_with = where.get(tgt, set())
            if fn in pages_with or not pages_with:
                return m.group(0)
            dest = sorted(pages_with)[0]
            # a page's own headline section just links to the page
            return 'href="%s"' % dest if tgt in ("menu","gallery","about","order") else 'href="%s#%s"' % (dest, tgt)
        new, n = re.subn(r'href="#([^"]+)"', retarget, built[fn])
        changed = sum(1 for a,b in zip(re.findall(r'href="#?[^"]+"',built[fn]),
                                       re.findall(r'href="#?[^"]+"',new)) if a!=b)
        built[fn] = new; fixed += changed
    print("  cross-page links retargeted:", fixed)

    # Netlify holds /assets/* for a week, so a deploy that only changes the CSS or
    # the JS would keep serving the old file from the browser cache. The hash goes
    # in the filename rather than a ?query, because a query is only a cache key by
    # convention and some static hosts ignore or drop it. A new name is a new file
    # everywhere. The HTML itself revalidates on every request.
    fingerprint = {}
    for rel in ("assets/css/site.css", "assets/js/site.js", "assets/js/deals.js",
                "assets/js/deals.es.js"):
        full = os.path.join(DIST, *rel.split("/"))
        if not os.path.exists(full): continue
        h = hashlib.md5(open(full,"rb").read()).hexdigest()[:10]
        stem, ext = rel.rsplit(".", 1)
        hashed = "%s.%s.%s" % (stem, h, ext)
        os.rename(full, os.path.join(DIST, *hashed.split("/")))
        fingerprint[rel] = hashed

    def stamp(p):
        for rel, hashed in fingerprint.items():
            p = p.replace('"%s"' % rel, '"%s"' % hashed)
        return p

    # An image with no width/height reserves no space, so everything below it jumps
    # when it finally arrives. On a slow phone that means the button you are aiming
    # at moves out from under your thumb. The gallery was the worst of it.
    IMG_TAG = re.compile(r"<img\b([^>]*?)/?>")
    def reserve_space(p):
        def fix(m):
            attrs = m.group(1)
            if "width=" in attrs and "height=" in attrs:
                return m.group(0)
            src = re.search(r'(?:data-)?src="assets/img/([^"]+)"', attrs)
            if not src:
                return m.group(0)
            wh = img_size(src.group(1))
            if not wh:
                return m.group(0)
            return '<img%s width="%d" height="%d">' % (attrs.rstrip().rstrip("/"), wh[0], wh[1])
        return IMG_TAG.sub(fix, p)

    # ---------- the two language trees ----------
    # English at the root, Spanish under /es/ with the same filenames, so the
    # switch is always the same page in the other language and a search engine
    # can pair them with hreflang.

    def lang_switch(lang, fn):
        """EN | ES, with the page you are on marked. One tap either way."""
        to_en = fn if lang == "en" else "../" + fn
        to_es = "es/" + fn if lang == "en" else fn
        lab   = {"en": ("Read this site in English" if lang == "en" else "Lea este sitio en ingl\u00e9s"),
                 "es": ("Read this site in Spanish" if lang == "en" else "Lea este sitio en espa\u00f1ol")}
        def one(code, href, text):
            on = ' class="on" aria-current="true"' if code == lang else ""
            return ('<a%s href="%s" hreflang="%s" lang="%s" data-lang="%s" title="%s">%s</a>'
                    % (on, href, code, code, code, lab[code], text))
        return ('<div class="lang-switch" role="group" aria-label="%s">%s%s</div>'
                % ("Language" if lang == "en" else "Idioma",
                   one("en", to_en, "EN"), one("es", to_es, "ES")))

    def hreflang(lang, fn):
        en = SITE_URL + ("/" if fn == "index.html" else "/" + fn)
        es = SITE_URL + "/es/" + ("" if fn == "index.html" else fn)
        return ('\n<link rel="alternate" hreflang="en" href="%s">'
                '\n<link rel="alternate" hreflang="es" href="%s">'
                '\n<link rel="alternate" hreflang="x-default" href="%s">' % (en, es, en))

    # Land in the reader's own language, and never argue with them about it.
    # It runs before anything is painted, it only ever fires on an English page,
    # and a choice made with the switch is remembered and wins from then on.
    AUTOLANG = ("\n<script>(function(){try{"
      "var k='tt_lang',s=localStorage.getItem(k);"
      "if(s==='en')return;"
      "var l=(navigator.languages&&navigator.languages[0])||navigator.language||'';"
      "if(s!=='es'&&!/^es\\b|^es-/i.test(l))return;"
      "var f=location.pathname.split('/').pop();"
      "if(!/\\.html$/.test(f))f='index.html';"
      "location.replace('es/'+f+location.search+location.hash);"
      "}catch(e){}})();</script>")

    def to_spanish_tree(page, fn):
        """Same page, one directory down: every relative asset gains a ../."""
        page = page.replace('<html lang="en">', '<html lang="es">')
        # Any assets/ that is not already relative, whatever is in front of it.
        # A srcset is a comma separated list, so only its first address sits
        # behind a quote and a rule written around quotes missed the rest.
        page = re.sub(r'(?<![./\w])assets/', '../assets/', page)
        for f in ("favicon.ico", "icon-16.png", "icon-32.png", "apple-touch-icon.png",
                  "site.webmanifest"):
            page = page.replace('href="%s"' % f, 'href="../%s"' % f)
        # its own data payload, and its own canonical address
        if "assets/js/deals.es.js" in fingerprint or True:
            en_js = os.path.basename(fingerprint.get("assets/js/deals.js", "deals.js"))
            es_js = os.path.basename(fingerprint.get("assets/js/deals.es.js", "deals.es.js"))
            page = page.replace("js/" + en_js, "js/" + es_js)
        canon = SITE_URL + "/es/" + ("" if fn == "index.html" else fn)
        page = re.sub(r'(<link rel="canonical" href=")[^"]*(")', lambda m: m.group(1)+canon+m.group(2), page)
        page = re.sub(r'(<meta property="og:url" content=")[^"]*(")', lambda m: m.group(1)+canon+m.group(2), page)
        return page

    def finish(page, lang, fn):
        page = page.replace("<!--LANGSW:%s-->" % fn, lang_switch(lang, fn))
        page = re.sub(r"<!--LANGSW:[^>]*-->", lang_switch(lang, fn), page)   # 404 and articles
        page = page.replace("<!--HREFLANG:%s-->" % fn, hreflang(lang, fn))
        page = re.sub(r"<!--HREFLANG:[^>]*-->", "", page)
        page = page.replace("<!--AUTOLANG-->", AUTOLANG if lang == "en" else "")
        t, d = META.get(fn, (BRAND, ""))
        if lang == "es":
            t, d = i18n.tr(t, None, fn), i18n.tr(d, None, fn)
        page = page.replace("<!--SCHEMA-->",
                            "" if fn == "404.html" else page_jsonld(fn, t, d, lang))

        return normalise_headings(page)

    os.makedirs(os.path.join(DIST,"es"), exist_ok=True)
    for fn, p in built.items():
        en = finish(reserve_space(stamp(p)), "en", fn)
        open(os.path.join(DIST,fn),"w",encoding="utf-8").write(en)
        sp = i18n.translate_html(p, fn)
        sp = to_spanish_tree(finish(reserve_space(stamp(sp)), "es", fn), fn)
        open(os.path.join(DIST,"es",fn),"w",encoding="utf-8").write(sp)
        print("  wrote %-14s %5d KB  + es/%s" % (fn, len(en)//1024 or 1, fn))

    # icons and the share card
    stat = os.path.join(os.path.dirname(__file__), "static")
    for f in os.listdir(stat):
        shutil.copy2(os.path.join(stat,f), os.path.join(DIST,f))

    open(os.path.join(DIST,"site.webmanifest"),"w",encoding="utf-8").write(json.dumps({
      "name":BRAND,"short_name":"Taco Taco","start_url":"/","display":"standalone",
      "background_color":"#f7f0e0","theme_color":"#1f5c2e",
      "icons":[{"src":"/icon-192.png","sizes":"192x192","type":"image/png"},
               {"src":"/icon-512.png","sizes":"512x512","type":"image/png"}]}, indent=1))

    today = __import__("datetime").date.today().isoformat()
    # Both languages, each naming the other, so a search engine serves the right
    # one instead of guessing.
    def sm(f, sub):
        loc = SITE_URL + "/" + sub + ("" if f == "index.html" else f)
        alt = "".join('\n  <xhtml:link rel="alternate" hreflang="%s" href="%s"/>'
                      % (c, SITE_URL + "/" + sb + ("" if f == "index.html" else f))
                      for c, sb, _ in LANGS)
        return ('\n <url><loc>%s</loc><lastmod>%s</lastmod>%s\n </url>' % (loc, today, alt))
    urls = "".join(sm(f, sub) for _c, sub, _n in LANGS for f, _t in PAGES)
    open(os.path.join(DIST,"sitemap.xml"),"w",encoding="utf-8").write(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
      'xmlns:xhtml="http://www.w3.org/1999/xhtml">%s\n</urlset>\n'%urls)
    open(os.path.join(DIST,"robots.txt"),"w",encoding="utf-8").write(
      "User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n"%SITE_URL)

    # ---------- llms.txt ----------
    # An assistant asked "where can I get birria in Belmopan" does not read a
    # page, it reads whatever it can find that states facts plainly and is
    # clearly the business talking about itself. Everything below is generated
    # from the same data the pages are, so it cannot drift, and it says what we
    # do not know as plainly as what we do: an assistant that repeats a guess
    # about a restaurant sends somebody across town for nothing.
    def llms_txt():
        cats = [c["name"] for c in MENU_CATS if c["name"] != "Meat Options"]
        prices = sorted(i["price"] for c in MENU_CATS for i in c["items"]
                        if isinstance(i.get("price"), (int, float)))
        L = []
        L.append("# %s" % BRAND)
        L.append("")
        L.append("> Mexicali style Mexican food made fresh in West Belmopan, Belize. "
                 "Tacos, birria, burritos, quesadillas, flautas, tortas, and breakfast "
                 "served all day. Dine in, takeout and delivery. Orders are placed on "
                 "the website and sent to the restaurant on WhatsApp.")
        L.append("")
        L.append("## The facts")
        L.append("")
        L.append("- Name: %s" % BRAND)
        L.append("- Address: %s" % ADDRESS)
        L.append("- Phone: +501-613-4677 and +501-802-2332")
        L.append("- Hours: %s" % hours_sentence("en"))
        L.append("- Service: dine in, takeout, delivery. Family friendly.")
        L.append("- Cuisine: Mexican, Mexicali style")
        L.append("- Prices: Belize dollars (BZD), from $%d to $%d on the menu"
                 % (prices[0], prices[-1]) if prices else "- Prices: Belize dollars (BZD)")
        L.append("- Meat choices on tacos, burritos, plates and bowls: Carne Asada, "
                 "Pollo Asado, Carnitas, Al Pastor. Birria on any of them for $1 more.")
        L.append("- Languages: the site is published in English and Spanish")
        L.append("- Website: %s/" % SITE_URL)
        L.append("")
        L.append("## Pages")
        L.append("")
        for f, t in PAGES:
            L.append("- [%s](%s): %s" % (t, SITE_URL + ("/" if f == "index.html" else "/" + f),
                                         out[f][2] if f in out else ""))
        L.append("- [Common questions](%s/about.html#faq): hours, address, ordering, "
                 "meats, breakfast, deals" % SITE_URL)
        L.append("- [Menu in machine readable form](%s/menu.html): the page carries "
                 "schema.org Menu markup with every section, item and price" % SITE_URL)
        L.append("")
        L.append("## Menu sections")
        L.append("")
        L.append(", ".join(cats) + ".")
        L.append("")
        L.append("## Please do not infer")
        L.append("")
        L.append("- We have not published whether the restaurant takes card or cash only, "
                 "whether it takes reservations, whether there is parking, or whether "
                 "there are vegetarian or vegan dishes. Please do not state any of these. "
                 "Point the reader at the phone numbers above instead.")
        L.append("- The rating shown on the site was left by customers on Google. It is "
                 "not marked up as a review on this site and should not be repeated as "
                 "the restaurant's own claim.")
        L.append("- Prices and hours come from the menu the restaurant printed most "
                 "recently. Anything older found elsewhere is out of date.")
        L.append("")
        return "\n".join(L)
    open(os.path.join(DIST,"llms.txt"),"w",encoding="utf-8").write(llms_txt())
    open(os.path.join(DIST,"netlify.toml"),"w",encoding="utf-8").write(
      '[build]\n  publish = "."\n\n'
      '[[headers]]\n  for = "/assets/*"\n  [headers.values]\n'
      '    Cache-Control = "public, max-age=604800"\n\n'
      '[[headers]]\n  for = "/*.html"\n  [headers.values]\n'
      '    Cache-Control = "public, max-age=0, must-revalidate"\n'
      '    X-Content-Type-Options = "nosniff"\n'
      '    Referrer-Policy = "strict-origin-when-cross-origin"\n\n'
      # The Spanish pages are a directory down, and a rule written for the root
      # is not worth trusting to reach them. Cached HTML is what stopped the
      # reviews rotating after the last deploy; it does not get a second go.
      '[[headers]]\n  for = "/es/*"\n  [headers.values]\n'
      '    Cache-Control = "public, max-age=0, must-revalidate"\n'
      '    X-Content-Type-Options = "nosniff"\n'
      '    Referrer-Policy = "strict-origin-when-cross-origin"\n')

    # A real 404: no canonical (it would tell Google this page is the home page),
    # no Restaurant markup, and noindex so it never enters the index.
    nf_body = ('\n <section class="blk nf-sec">\n  <div class="container">\n'
               '   <div class="sec-head"><span class="sec-kicker">404</span>'
               '<h2 class="sec-title">Page <span class="deco">Not Found</span></h2>'
               '<p class="sec-sub">That page has moved or never existed. The menu is still right here.</p></div>\n'
               '   <p class="map-cta"><a class="btn btn-red" href="menu.html">See The Menu</a> '
               '<a class="btn btn-green" href="index.html">Back Home</a></p>\n'
               '  </div>\n </section>')
    nf = page("404.html", "Page not found | %s"%BRAND, nf_body, "That page could not be found.")
    nf = nf.replace("Taco Taco Mexican Style Food", BRAND).replace("Mexican Style Food", BRAND_SHORT)
    nf = re.sub(r'\n<link rel="canonical"[^>]*>', '', nf)
    nf = re.sub(r'\n<script type="application/ld\+json">.*?</script>', '', nf, flags=re.S)
    nf = nf.replace("</head>", '<meta name="robots" content="noindex">\n</head>')
    open(os.path.join(DIST,"404.html"),"w",encoding="utf-8").write(
      finish(reserve_space(stamp(nf)), "en", "404.html"))
    nf_es = to_spanish_tree(
      finish(reserve_space(stamp(i18n.translate_html(nf, "404.html"))), "es", "404.html"), "404.html")
    open(os.path.join(DIST,"es","404.html"),"w",encoding="utf-8").write(nf_es)

    print("videos:", len(VIDEOS_ACTIVE), "| socials:", [k for k,v in SOCIAL.items() if v] or "none set")
    names = {i["name"] for c in MENU_CATS for i in c["items"]}
    stray = sorted(set(ITEM_IMG) - names)
    if stray:
        print("  !! photo pinned to an item that is not on the menu:", ", ".join(stray))
    missing = [i["name"] for c in MENU_CATS for i in c["items"]
               if i.get("price") is not None and i["name"] not in ITEM_IMG]
    print("menu photos attached:", len(set(ITEM_IMG.values())), "images across", len(ITEM_IMG), "items")
    print("menu items still without a photo:", len(missing))

    # Address and opening hours are claims about the business, so a copy left over
    # from an older version must never ship. Fail loudly rather than quietly.
    STALE = ["Aloe Vera Street", "6:00 AM", "Fri to Sun 6AM", "\"opens\":\"06:00\""]
    def pages_on_disk():
        for root, _d, files in os.walk(DIST):
            for fn in sorted(files):
                if fn.endswith((".html", ".xml", ".webmanifest")):
                    yield os.path.join(root, fn), os.path.relpath(os.path.join(root, fn), DIST)
    for full, rel in pages_on_disk():
        body = open(full, encoding="utf-8").read()
        for bad in STALE:
            if bad in body:
                sys.exit("STALE BUSINESS DETAIL %r still in %s" % (bad, rel))
    print("address and hours: single source, no stale copies")

    # A photograph nobody links to still lands in the deploy folder and in the
    # visitor's download budget. Drop the ones no page, script or stylesheet asks
    # for; they stay in src, ready for whenever an item needs one again.
    refs = set()
    for full, _rel in pages_on_disk():
        refs |= set(re.findall(r"assets/img/([A-Za-z0-9._/-]+)",
                               open(full, encoding="utf-8").read()))
    for sub in ("assets/js", "assets/css"):
        d = os.path.join(DIST, *sub.split("/"))
        for fn in (os.listdir(d) if os.path.isdir(d) else []):
            refs |= set(re.findall(r"assets/img/([A-Za-z0-9._/-]+)",
                                   open(os.path.join(d, fn), encoding="utf-8", errors="ignore").read()))
    keep = {os.path.basename(r) for r in refs}
    dropped = freed = 0
    imgdir = os.path.join(DIST, "assets", "img")
    for fn in sorted(os.listdir(imgdir)):
        full = os.path.join(imgdir, fn)
        if os.path.isfile(full) and fn not in keep:
            freed += os.path.getsize(full); os.remove(full); dropped += 1
    if dropped:
        print("unreferenced images left out of the deploy: %d (%d KB)" % (dropped, freed // 1024))

    # Photographs ship as WebP. At quality 80 it is visually the same picture as
    # the JPEG it came from and a little over half the weight, and every browser
    # in use has read it for years. The sources stay JPEG; only the deploy changes.
    #
    # share-card.jpg is the one exception: it is what WhatsApp and Facebook fetch
    # for a link preview, and their crawlers are not reliable with WebP.
    KEEP_JPEG = {"share-card.jpg"}
    try:
        from PIL import Image
    except Exception:
        Image = None
    if Image:
        swapped, before, after = {}, 0, 0
        for root, _dirs, files in os.walk(os.path.join(DIST, "assets", "img")):
            for fn in sorted(files):
                if not fn.endswith(".jpg") or fn in KEEP_JPEG: continue
                src = os.path.join(root, fn)
                dst = src[:-4] + ".webp"
                with Image.open(src) as im:
                    im.convert("RGB").save(dst, "WEBP", quality=80, method=6)
                before += os.path.getsize(src); after += os.path.getsize(dst)
                rel = os.path.relpath(src, DIST).replace(os.sep, "/")
                swapped[rel] = rel[:-4] + ".webp"
                os.remove(src)
        if swapped:
            # Match on the filename after a slash, not on the full path: the
            # stylesheet reaches images as ../img/x.jpg while the pages use
            # assets/img/x.jpg, and only one of those was being caught.
            subs = [(re.compile(r"(?<=/)" + re.escape(os.path.basename(a)) + r"\b"),
                     os.path.basename(b)) for a, b in swapped.items()]
            for root, _dirs, files in os.walk(DIST):
                for fn in files:
                    if not fn.endswith((".html", ".css", ".js", ".xml", ".webmanifest")): continue
                    full = os.path.join(root, fn)
                    body = open(full, encoding="utf-8").read()
                    new = body
                    for rx, rep in subs:
                        new = rx.sub(rep, new)
                    if new != body:
                        open(full, "w", encoding="utf-8").write(new)
            print("photographs converted to webp: %d files, %d KB -> %d KB"
                  % (len(swapped), before // 1024, after // 1024))

    # Last word: every local asset a page asks for has to exist on disk.
    missing = set()
    for root, _dirs, files in os.walk(DIST):
        for fn in files:
            if not fn.endswith((".html", ".css")): continue
            full = os.path.join(root, fn)
            body = open(full, encoding="utf-8").read()
            body = body.replace("&#x27;", "'").replace("&quot;", '"')   # see below
            for ref in re.findall(r"""["'(]([A-Za-z0-9._/-]+\.(?:jpg|jpeg|png|webp|svg|ico|mp4|woff2?))["')]""", body):
                if ref.startswith(("http", "//", "data:")): continue
                target = os.path.normpath(os.path.join(os.path.dirname(full), ref))
                if not os.path.exists(target):
                    missing.add("%s -> %s" % (os.path.relpath(full, DIST), ref))
    # A page one directory down must never ask for assets/ without the ../ that
    # gets it back to the root. This is the mistake that escaped the check above
    # once already, because the path was hiding inside an escaped quote.
    for root, _dirs, files in os.walk(os.path.join(DIST, "es")):
        for fn in files:
            if not fn.endswith(".html"): continue
            body = open(os.path.join(root, fn), encoding="utf-8").read()
            body = body.replace("&#x27;", "'").replace("&quot;", '"')
            for m in re.finditer(r'(?<![./\w])assets/', body):
                if body[max(0, m.start()-3):m.start()] != "../":
                    missing.add("es/%s -> %s (missing ../)" % (fn, body[m.start():m.start()+40]))
    if missing:
        sys.exit("BROKEN ASSET REFERENCES:\n  " + "\n  ".join(sorted(missing)))
    print("asset references: every file a page asks for exists")

    # A page that is half English is worse than no Spanish page at all, so the
    # build refuses to finish while anything on it has no translation. The
    # report names the string and the page it was found on.
    gaps = i18n.report()
    if gaps:
        lines = ["%r  (%s)" % (t, ", ".join(sorted(w))) for t, w in gaps[:40]]
        sys.exit("NO SPANISH FOR %d STRING(S):\n  " % len(gaps) + "\n  ".join(lines))
    print("spanish: every string on every page has a translation")
    print("whatsapp orders go to:", WA_NUMBER,
          "(TEST line)" if WA_NUMBER != "5016134677" else "(the restaurant)")

if __name__ == "__main__":
    main()
