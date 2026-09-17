# -*- coding: utf-8 -*-
"""Generates the Taco Taco site (multi-page, external assets) from the fragments
in _single.html. Run:  python3 src/build_site.py"""
import re, os, sys, json, shutil, hashlib
from deals_data import DEALS, FEATURED, STR
from blog_data import HUB, ARTICLES
from reviews_data import REVIEWS, HOME_ORDER, STR_REVIEWS
from menu_data import CATEGORIES as MENU_CATS, INTRO as MENU_INTRO, MEATS, MEAT_SURCHARGE

SRC  = os.path.join(os.path.dirname(__file__), "_single.html")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIST = os.path.join(ROOT, "dist")

SITE_URL   = "https://tacotaco.bz"
BRAND      = "Taco Taco Mexican Restaurant"
BRAND_SHORT= "Mexican Restaurant"
WA_NUMBER  = "5016134677"          # 613-4677

# Social profiles. Leave a value empty and that button simply does not render,
# so the live site never shows a dead link.
SOCIAL = {
 "facebook":  "https://www.facebook.com/share/14ymmYxdZTu/?mibextid=wwXIfr",
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
 "Regular Torta":                  "dish-08.jpg",
 "Mexican Style Burrito":          "menu-burrito.jpg",
 "Carne Asada Fries":              "menu-carne-asada-fries.jpg",
 "Mexican Pizza":                  "menu-mexican-pizza.jpg",
 "Crunch Wrap":                    "menu-crunch-wrap.jpg",
 "Chilaquiles":                    "menu-chilaquiles.jpg",
 "Waffle or Pancake Sandwich":     "dish-03.jpg",
 "Pancakes or Waffle Only":        "menu-only-pancakes.jpg",
 "Order of Churros":               "menu-churros.jpg",
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
 "Fresh Natural Juice":            "menu-jugo-natural.jpg",
 "Natural Juice":                  "menu-jugo-natural.jpg",
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
 # so they are close likenesses rather than exact trade dress. Belikin Stout is
 # deliberately left without one: the supplied image is a Belikin Chocolate
 # Stout, which is a different bottle from the stout this item sells.
 "Belikin Beer":                   "menu-belikin-beer.jpg",
 "Lighthouse":                     "menu-lighthouse.jpg",
 "Guinness Stout":                 "menu-guinness-stout.jpg",
 "Landshark":                      "menu-landshark.jpg",
 "Ova Drive":                      "menu-ova-drive.jpg",
 "Red Stripe":                     "menu-red-stripe.jpg",
 "Heineken":                       "menu-heineken.jpg",
 "Soft Drinks":                    "menu-soft-drinks.jpg",
 "Soda Water":                     "menu-soda-water.jpg",
 "Hot Coffee":                     "menu-hot-coffee.jpg",
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
        with Image.open(os.path.join(os.path.dirname(__file__), "assets", "img", fn)) as im:
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
        elif k == "h":      out.append('<h3 class="art-h">%s</h3>' % esc(b["x"]))
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
      for v in VIDEOS[:4])
    spare = "".join(
      '<template class="chip-spare" data-id="%s" data-title="%s" data-img="%s"></template>'
      % (v["id"], esc(v["title"]), derivative(v["poster"].split("/")[-1], 480, "g")[0])
      for v in VIDEOS[4:])
    return ('\n <!-- ===== REEL ===== -->\n <section class="blk reel-sec" id="whats-cooking">\n'
            '  <div class="container">\n'
            '   <div class="sec-head"><span class="sec-kicker">Watch</span>'
            '<h2 class="sec-title">What Is <span class="deco">Cooking</span></h2>'
            '<p class="sec-sub">%s</p></div>\n'
            '   <div class="reel" id="reel">%s%s</div>\n'
            '  </div>\n </section>' % (esc(REEL_SUB), chips, spare))


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

def main():
    html = open(SRC, encoding="utf-8").read()

    # Copy the assets first: the page builders below write downscaled copies into
    # dist/assets/img, and a later copytree would wipe them.
    os.makedirs(DIST, exist_ok=True)
    for sub in ("assets",):
        if os.path.isdir(os.path.join(DIST,sub)): shutil.rmtree(os.path.join(DIST,sub))
    shutil.copytree(os.path.join(os.path.dirname(__file__),"assets"), os.path.join(DIST,"assets"))

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
        grid, w, h = derivative(f, 600, "g")   # tiles render at ~166px phone, ~279px desktop
        return ('<div class="gitem"><img src="%s" alt="%s" loading="lazy" width="%d" height="%d" '
                'data-zoom="assets/img/%s" tabindex="0" role="button"></div>'
                % (grid, esc(a), w, h, f))
    tiles = "\n".join(tile(f, a) for f, a in GALLERY if has_img(f))
    galler = re.sub(r'(<div class="gal">)(.*?)(</div>\s*</div>\s*</section>)',
                    lambda m: m.group(1) + "\n    " + tiles + "\n   " + m.group(3),
                    galler, count=1, flags=re.S)
    about  = frag(html, "<!-- ===== ABOUT ===== -->")
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
 % (url, BRAND, title, desc, url, SITE_URL, title, desc, SITE_URL))

    def schema_jsonld():
        """Restaurant markup. Deliberately no aggregateRating: Google's review
        snippet guidelines forbid re-publishing ratings gathered on another site,
        and hers live on Google, so marking them up here would risk a penalty."""
        import json as _j
        data = {
          "@context":"https://schema.org","@type":"Restaurant",
          "name":BRAND,"url":SITE_URL+"/","image":SITE_URL+"/share-card.jpg",
          "telephone":"+501-613-4677","servesCuisine":"Mexican",
          "hasMenu":SITE_URL+"/menu.html",
          "address":{"@type":"PostalAddress","streetAddress":ADDRESS.split(",")[0],
                     "addressLocality":"West Belmopan","addressCountry":"BZ"},
          "openingHoursSpecification":[
            {"@type":"OpeningHoursSpecification","dayOfWeek":d,"opens":o,"closes":c}
            for d,o,c in HOURS_SCHEMA],
          "sameAs":[v for v in SOCIAL.values() if v],
        }
        return '\n<script type="application/ld+json">%s</script>' % _j.dumps(data, ensure_ascii=False)

    def page(fname, title, body, desc, nav_as=None):
        h = head_extra
        h = re.sub(r'<title>.*?</title>', '<title>%s</title>'%title, h, flags=re.S)
        h = re.sub(r'(<meta name="description" content=")[^"]*(")', r'\1'+desc+r'\2', h)
        h = h + head_meta(fname, title, desc) + (schema_jsonld() if fname == "index.html" else "")
        return ("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n%s\n</head>\n<body>\n%s\n<main id=\"top\">\n%s\n</main>\n%s\n%s\n%s\n%s\n</body>\n</html>\n"
                % (h, header_for(nav_as or fname), body, banner, foot, dock, basket))


    open(os.path.join(DIST,"assets","js","deals.js"),"w",encoding="utf-8").write(
      "window.TT_DEALS=%s;\nwindow.TT_STR=%s;\nwindow.TT_REVIEWS=%s;\nwindow.TT_REV_ORDER=%s;\n"
      % (json.dumps(DEALS, ensure_ascii=False), json.dumps(STR, ensure_ascii=False),
         json.dumps(REVIEWS, ensure_ascii=False), json.dumps(HOME_ORDER, ensure_ascii=False)))

    out = {
      "index.html":   ("%s | Belmopan"%BRAND, hero+favs+deals_band()+reviews_band()+order+reel_band()+visit_band(),
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
      "about.html":   ("About | %s"%BRAND, about+map_section(),
                       "About %s: authentic Mexicali style food made fresh daily in West Belmopan."%BRAND),
    }
    for _a in ARTICLES:
        out[_a["slug"]] = (_a["seo_title"], article_page(_a, socblock), _a["meta"])

    built = {}
    for fn,(title,body,desc) in out.items():
        art = [a for a in ARTICLES if a["slug"] == fn]
        p = page(fn, title, body, desc, nav_as=HUB["slug"] if art else None)
        if art: p = p.replace("</head>", article_jsonld(art[0]) + "\n</head>")
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
    for rel in ("assets/css/site.css", "assets/js/site.js", "assets/js/deals.js"):
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

    for fn, p in built.items():
        open(os.path.join(DIST,fn),"w",encoding="utf-8").write(reserve_space(stamp(p)))
        print("  wrote %-14s %5d KB" % (fn, len(p)//1024 or 1))

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
    urls = "".join('\n <url><loc>%s</loc><lastmod>%s</lastmod></url>'
                   % (SITE_URL + ("/" if f=="index.html" else "/"+f), today) for f,_ in PAGES)
    open(os.path.join(DIST,"sitemap.xml"),"w",encoding="utf-8").write(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">%s\n</urlset>\n'%urls)
    open(os.path.join(DIST,"robots.txt"),"w",encoding="utf-8").write(
      "User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n"%SITE_URL)
    open(os.path.join(DIST,"netlify.toml"),"w",encoding="utf-8").write(
      '[build]\n  publish = "."\n\n'
      '[[headers]]\n  for = "/assets/*"\n  [headers.values]\n'
      '    Cache-Control = "public, max-age=604800"\n\n'
      '[[headers]]\n  for = "/*.html"\n  [headers.values]\n'
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
    open(os.path.join(DIST,"404.html"),"w",encoding="utf-8").write(reserve_space(stamp(nf)))

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
    for fn in sorted(os.listdir(DIST)):
        if not fn.endswith((".html", ".xml", ".webmanifest")): continue
        body = open(os.path.join(DIST, fn), encoding="utf-8").read()
        for bad in STALE:
            if bad in body:
                sys.exit("STALE BUSINESS DETAIL %r still in %s" % (bad, fn))
    print("address and hours: single source, no stale copies")

if __name__ == "__main__":
    main()
