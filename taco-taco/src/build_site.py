# -*- coding: utf-8 -*-
"""Generates the Taco Taco site (multi-page, external assets) from the fragments
in _single.html. Run:  python3 src/build_site.py"""
import re, os, sys, json, shutil
from deals_data import DEALS, FEATURED, STR
from blog_data import HUB, ARTICLES

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
 "facebook":  "https://www.facebook.com/share/1BvEg2CSYc/?mibextid=wwXIfr",
 "instagram": "https://www.instagram.com/tacotacomexicanrestaurant",
 "tiktok":    "https://www.tiktok.com/@tacotacomexicanfood",
}

ADDRESS   = "11 Aloe Vera Street, West Belmopan, Belize"
MAPS_Q    = "Taco+Taco+Mexican+Restaurant,+Belmopan,+Belize"
MAPS_LINK = "https://www.google.com/maps/search/?api=1&query=" + MAPS_Q
MAPS_EMBED= "https://www.google.com/maps?q=" + MAPS_Q + "&output=embed"

# Google rating. RATING/COUNT are facts from the listing; REVIEWS holds the real
# quotes. Nothing here is invented - an empty list simply renders the rating
# summary and a link out to Google.
RATING       = 4.9
REVIEW_COUNT = 10
REVIEWS = [
 # {"name":"Jane D.", "stars":5, "date":"June 2026", "text":"..."},
]

# YouTube/Vimeo entries. Empty list hides the whole video section.
# Add like: {"src":"https://www.youtube.com/embed/XXXX","title":"Birria tacos"}
VIDEOS = []

# Photos we can honestly attach to a menu item. Only unmistakable matches:
# a wrong photo on a menu misrepresents the food a customer is paying for.
ITEM_IMG = {
 "Street Tacos":               "dish-09.jpg",
 "2 Tacos, Arroz y Frijoles":  "badge-01.jpg",
 "Quesabirria con Consomé":"badge-02.jpg",
 "2 Quesabirria Tacos":        "badge-02.jpg",
 "4 Quesabirria Tacos":        "badge-02.jpg",
 "Mini Taco Bowl":             "dish-01.jpg",
 "Waffle Breakfast":           "dish-03.jpg",
 "Huevos Rancheros":           "dish-06.jpg",
 "Quesadilla":                 "dish-07.jpg",
 "Torta Del Rey":              "dish-08.jpg",
 "Tostada":                    "dish-10.jpg",
 "Torta":                      "fav-01.jpg",
 "Nachos":                     "fav-02.jpg",
 "Frappés":               "fav-04.jpg",
 # from the restaurant's own gallery, each checked against the dish it names
 "Burrito":                    "menu-burrito.jpg",
 "Carne Asada Fries":          "menu-carne-asada-fries.jpg",
 "Mexican Pizza":              "menu-mexican-pizza.jpg",
 "Crunch Wrap":                "menu-crunch-wrap.jpg",
 "Chilaquiles":                "menu-chilaquiles.jpg",
 "Pancakes or Waffles":        "menu-pancakes-or-waffles.jpg",
 "Pancakes & Bacon":           "menu-pancakes-bacon.jpg",
 "Only Pancakes":              "menu-only-pancakes.jpg",
 "Arroz con Leche":            "menu-arroz-con-leche.jpg",
 "Churros":                    "menu-churros.jpg",
}

PAGES = [("index.html","Home"),("menu.html","Menu"),("deals-combos.html","Deals"),
         ("gallery.html","Gallery"),("fresh-from-our-kitchen.html","Kitchen"),
         ("reviews.html","Reviews"),("about.html","About")]


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
     '<div class="deal-flyer"><img src="assets/img/%s" alt="%s offer" loading="lazy" width="%d" height="%d"></div>'
     '<div class="deal-body">%s<h3 class="deal-title">%s</h3>'
     '<p class="deal-desc">%s</p><div class="deal-price">%s</div>%s'
     '<div class="deal-opts"><span class="opt-head">%s</span>%s</div>'
     '<p class="deal-warn" role="alert" hidden></p>'
     '<button type="button" class="btn btn-red deal-add">%s</button>'
     '</div></article>'
     % (d["id"], d["id"], d["flyer"], esc(d["title"]), flyer_dim(d["flyer"])[0], flyer_dim(d["flyer"])[1], day, esc(d["title"]), esc(d["desc"]),
        deal_price_label(d), note, esc(STR["choose"]), opts, esc(STR["add"])))

def deals_page_body():
    cards = "".join(deal_card(d) for d in DEALS)
    return ('\n <section class="blk" id="deals-all">\n  <div class="container">\n'
            '   <div class="sec-head"><span class="sec-kicker">%s</span>'
            '<h2 class="sec-title">Deals &amp; <span class="deco">Combos</span></h2>'
            '<p class="sec-sub">%s</p></div>\n   <div class="deal-grid">%s</div>\n'
            '  </div>\n </section>' % (esc(STR["section_kicker"]), esc(STR["page_sub"]), cards))

def deals_band():
    """Home page carousel of the featured flyers."""
    by = {d["id"]: d for d in DEALS}
    feat = [by[i] for i in FEATURED if i in by]
    slides = "".join(
      '<a class="dcar-slide" href="deals-combos.html#deal-%s" aria-label="%s">'
      '<img src="assets/img/%s" alt="%s offer" loading="lazy">'
      '<span class="dcar-cap"><b>%s</b><em>%s</em></span></a>'
      % (d["id"], esc(d["title"]), d["flyer"], esc(d["title"]), esc(d["title"]), deal_price_label(d))
      for d in feat)
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
                           'loading="lazy"></figure>' % (b["src"], esc(b["x"])))
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
            '   <figure class="art-hero"><img src="assets/img/%s" alt="%s"></figure>\n'
            '   %s\n  </div>\n </article>'
            % (HUB["slug"], esc(HUB["back"]), esc(HUB["kicker"]), esc(a["title"]),
               a["date"], esc(a["date_label"]), article_hero(a), esc(a["hero_alt"]),
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
    """Home page: social proof, plus a way through to the full page."""
    return ('\n <!-- ===== REVIEWS BAND ===== -->\n <section class="blk rev-band">\n  <div class="container">\n'
            '   <div class="rev-band-in">%s<div class="rev-band-copy">'
            '<h2 class="sec-title">What Belmopan <span class="deco">Says</span></h2>'
            '<p class="sec-sub">Our neighbours keep coming back, and they tell us why.</p>'
            '<a href="reviews.html" class="btn btn-red">Read The Reviews</a></div></div>\n'
            '  </div>\n </section>' % rating_block())

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
            '<div class="fact"><h4>Hours</h4><p>Mon to Thu: 10:00 AM to 8:00 PM<br>'
            'Fri to Sun: 6:00 AM to 8:00 PM</p></div>'
            '<div class="fact"><h4>Service</h4><p>Dine-In &middot; Takeout &middot; Delivery</p></div>'
            '</div>\n   </div>\n  </div>\n </section>' % (MAPS_EMBED, BRAND, ADDRESS))

def map_section():
    return ('\n <!-- ===== MAP ===== -->\n <section class="blk map-sec" id="find-us">\n  <div class="container">\n'
            '   <div class="sec-head"><span class="sec-kicker">Find Us</span>'
            '<h2 class="sec-title">Where To <span class="deco">Find Us</span></h2>'
            '<p class="sec-sub">%s</p></div>\n'
            '   <div class="map-wrap"><iframe src="%s" loading="lazy" title="Map to %s" '
            'referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>\n'
            '  </div>\n </section>' % (ADDRESS, MAPS_EMBED, BRAND))

def reviews_page_body():
    head = ('\n <section class="blk rev-hero">\n  <div class="container">\n'
            '   <div class="sec-head"><span class="sec-kicker">Reviews</span>'
            '<h2 class="sec-title">What Our <span class="deco">Customers Say</span></h2></div>\n'
            '   %s\n   <p class="map-cta"><a class="btn btn-red" href="%s" target="_blank" rel="noopener">'
            'Read Them On Google</a></p>\n  </div>\n </section>' % (rating_block("big"), MAPS_LINK))
    if not REVIEWS:
        return head
    cards = "".join(
      '<figure class="rev"><div class="rev-top">%s<span class="rev-date">%s</span></div>'
      '<blockquote>%s</blockquote><figcaption>%s</figcaption></figure>'
      % (stars(r.get("stars",5)), r.get("date",""), r["text"], r["name"]) for r in REVIEWS)
    return head + ('\n <section class="blk"><div class="container"><div class="rev-grid">%s</div></div></section>' % cards)

def frag(html, marker, endmarker="</section>"):
    i = html.find(marker)
    if i < 0: return ""
    j = html.find(endmarker, i)
    return html[i:j+len(endmarker)]

def main():
    html = open(SRC, encoding="utf-8").read()

    # ---------- fragments ----------
    hero   = frag(html, "<!-- ===== HERO ===== -->")
    favs   = frag(html, "<!-- ===== FEATURED FAVORITES ===== -->")
    menu   = frag(html, "<!-- ===== MENU ===== -->")
    galler = frag(html, "<!-- ===== GALLERY ===== -->")
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
            th = ('<span class="mi-thumb" style="background-image:url(\'assets/img/%s\')" '
                  'role="img" aria-label="%s"></span>' % (img, name))
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
    # TT_PREVIEW=1 fills the section with sample cards so the layout can be reviewed
    # before real clips exist. The deployed build leaves it out until VIDEOS is set,
    # because an empty "coming soon" section on a live restaurant site reads as unfinished.
    vids = VIDEOS
    if not vids and os.environ.get("TT_PREVIEW"):
        vids = [{"title":"Sample - your clip goes here","poster":"assets/img/dish-09.jpg"},
                {"title":"Sample - your clip goes here","poster":"assets/img/badge-02.jpg"},
                {"title":"Sample - your clip goes here","poster":"assets/img/fav-02.jpg"}]
    VIDEOS_ACTIVE = vids
    if vids:
        cards = "".join(
          '<div class="vid"%s%s><button type="button" class="vid-play" '
          'aria-label="Play %s"></button><span class="vid-title">%s</span></div>'
          % ((' data-src="%s"'%v["src"]) if v.get("src") else "",
             (' style="background-image:url(\'%s\')"'%v["poster"]) if v.get("poster") else "",
             v["title"], v["title"]) for v in vids)
        video = ('\n <!-- ===== VIDEOS ===== -->\n <section class="blk" id="videos">\n  <div class="container">\n'
                 '   <div class="sec-head"><span class="sec-kicker">Watch</span>'
                 '<h2 class="sec-title">In The <span class="deco">Kitchen</span></h2></div>\n'
                 '   <div class="vid-grid">%s</div>\n  </div>\n </section>' % cards)
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
    foot = foot.replace('</div>\n  <div class="foot-bottom">', socblock+'</div>\n  <div class="foot-bottom">')

    def head_meta(fname, title, desc):
        url = SITE_URL + ("/" if fname == "index.html" else "/" + fname)
        return (
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
          "address":{"@type":"PostalAddress","streetAddress":"11 Aloe Vera Street",
                     "addressLocality":"West Belmopan","addressCountry":"BZ"},
          "openingHoursSpecification":[
            {"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday"],
             "opens":"10:00","closes":"20:00"},
            {"@type":"OpeningHoursSpecification","dayOfWeek":["Friday","Saturday","Sunday"],
             "opens":"06:00","closes":"20:00"}],
          "sameAs":[v for v in SOCIAL.values() if v],
        }
        return '\n<script type="application/ld+json">%s</script>' % _j.dumps(data, ensure_ascii=False)

    def page(fname, title, body, desc, nav_as=None):
        h = head_extra
        h = re.sub(r'<title>.*?</title>', '<title>%s</title>'%title, h, flags=re.S)
        h = re.sub(r'(<meta name="description" content=")[^"]*(")', r'\1'+desc+r'\2', h)
        h = h + head_meta(fname, title, desc) + (schema_jsonld() if fname == "index.html" else "")
        return ("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n%s\n</head>\n<body>\n%s\n<main id=\"top\">\n%s\n</main>\n%s\n%s\n%s\n%s\n<script src=\"assets/js/deals.js\" defer></script>\n<script src=\"assets/js/site.js\" defer></script>\n</body>\n</html>\n"
                % (h, header_for(nav_as or fname), body, banner, foot, dock, basket))

    os.makedirs(DIST, exist_ok=True)
    for sub in ("assets",):
        if os.path.isdir(os.path.join(DIST,sub)): shutil.rmtree(os.path.join(DIST,sub))
    shutil.copytree(os.path.join(os.path.dirname(__file__),"assets"), os.path.join(DIST,"assets"))

    out = {
      "index.html":   ("%s | Belmopan"%BRAND, hero+favs+deals_band()+reviews_band()+order+visit_band(),
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

    for fn, p in built.items():
        open(os.path.join(DIST,fn),"w",encoding="utf-8").write(p)
        print("  wrote %-14s %5d KB" % (fn, len(p)//1024 or 1))

    open(os.path.join(DIST,"assets","js","deals.js"),"w",encoding="utf-8").write(
      "window.TT_DEALS=%s;\nwindow.TT_STR=%s;\n"
      % (json.dumps(DEALS, ensure_ascii=False), json.dumps(STR, ensure_ascii=False)))

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
    open(os.path.join(DIST,"404.html"),"w",encoding="utf-8").write(nf)

    print("videos:", len(VIDEOS_ACTIVE), "| socials:", [k for k,v in SOCIAL.items() if v] or "none set")
    print("menu photos attached:", len(set(ITEM_IMG.values())), "images across", len(ITEM_IMG), "items")

if __name__ == "__main__":
    main()
