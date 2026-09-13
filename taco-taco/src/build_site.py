# -*- coding: utf-8 -*-
"""Generates the Taco Taco site (multi-page, external assets) from the fragments
in _single.html. Run:  python3 src/build_site.py"""
import re, os, sys, json, shutil

SRC  = os.path.join(os.path.dirname(__file__), "_single.html")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIST = os.path.join(ROOT, "dist")

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
}

PAGES = [("index.html","Home"),("menu.html","Menu"),
         ("gallery.html","Gallery"),("about.html","About")]

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

    def page(fname, title, body, desc):
        h = head_extra
        h = re.sub(r'<title>.*?</title>', '<title>%s</title>'%title, h, flags=re.S)
        h = re.sub(r'(<meta name="description" content=")[^"]*(")', r'\1'+desc+r'\2', h)
        return ("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n%s\n</head>\n<body>\n%s\n<main id=\"top\">\n%s\n</main>\n%s\n%s\n%s\n%s\n<script src=\"assets/js/site.js\" defer></script>\n</body>\n</html>\n"
                % (h, header_for(fname), body, banner, foot, dock, basket))

    os.makedirs(DIST, exist_ok=True)
    for sub in ("assets",):
        if os.path.isdir(os.path.join(DIST,sub)): shutil.rmtree(os.path.join(DIST,sub))
    shutil.copytree(os.path.join(os.path.dirname(__file__),"assets"), os.path.join(DIST,"assets"))

    out = {
      "index.html":   ("%s | Belmopan"%BRAND, hero+favs+order,
                       "%s in West Belmopan. Authentic Mexicali style tacos, birria, tortas and breakfast. Order online and send your order on WhatsApp."%BRAND),
      "menu.html":    ("Menu | %s"%BRAND, menu,
                       "The full %s menu with prices in Belize dollars. Build your basket and send your order on WhatsApp."%BRAND),
      "gallery.html": ("Gallery | %s"%BRAND, galler+video,
                       "Photos of the food we serve at %s in West Belmopan."%BRAND),
      "about.html":   ("About | %s"%BRAND, about,
                       "About %s: authentic Mexicali style food made fresh daily in West Belmopan."%BRAND),
    }
    built = {}
    for fn,(title,body,desc) in out.items():
        p = page(fn, title, body, desc)
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

    print("videos:", len(VIDEOS_ACTIVE), "| socials:", [k for k,v in SOCIAL.items() if v] or "none set")
    print("menu photos attached:", len(set(ITEM_IMG.values())), "images across", len(ITEM_IMG), "items")

if __name__ == "__main__":
    main()
