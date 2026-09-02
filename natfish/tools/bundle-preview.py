#!/usr/bin/env python3
"""Bundle the NATFISH site into one self-contained HTML file.

The preview is published as a hosted artifact, which renders a single file under
a strict content-security policy. Nothing external can load, so the CSS, the
script and every image are inlined and the eight pages become hash routes.

Run from the natfish/ folder:
    python3 tools/bundle-preview.py

Output: natfish-preview.html
"""
import base64
import html as html_mod
import json
import pathlib
import re
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "natfish-preview.html"

PAGES = [
    ("index", "index.html"),
    ("about", "about.html"),
    ("seafood-services", "seafood-services.html"),
    ("seafood-seasons", "seafood-seasons.html"),
    ("responsible", "responsible.html"),
    ("news", "news.html"),
    ("gallery", "gallery.html"),
    ("natfish-ai", "natfish-ai.html"),
    ("contact", "contact.html"),
    # Added with the Insights section. Without them the nav's Insights link and
    # every "read the article" button were dead ends in the shareable preview,
    # which is the one place the client actually clicks the site.
    ("insights", "insights.html"),
    ("insights-belizean-caribbean-spiny-lobster",
     "insights-belizean-caribbean-spiny-lobster.html"),
]


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def between(html, start, end):
    """Inclusive slice from the first `start` to the first `end` after it."""
    i = html.index(start)
    j = html.index(end, i) + len(end)
    return html[i:j]


# --------------------------------------------------------------- images --

_IMG_CACHE = {}


def data_uri(rel):
    """One WebP as a base64 data URI, keyed by its path without the extension.

    The V2 photography lives in two folders (official/ and products/), so the
    key carries the folder as well as the stem.

    The 800w tier, not 1400w: fourteen photographs at 1400w came to 4.6 MB of
    base64 and the artifact is viewed in a single scrolling page, where 800w is
    already past the point of visible difference. WebP only, no JPEG fallback,
    since anything that can open an artifact can decode WebP.
    """
    if rel not in _IMG_CACHE:
        # 800w for everything that has it. The hero's portrait crop does not:
        # it is only ever served to a phone, so its tiers are 360 to 1080 and
        # 720 is the one closest to the same visual budget.
        for tier in (800, 720):
            path = ROOT / "assets" / "img" / f"{rel}-{tier}.webp"
            if path.is_file():
                break
        else:
            raise SystemExit(f"ERROR: no derivative to inline for {rel}")
        _IMG_CACHE[rel] = ("data:image/webp;base64,"
                           + base64.b64encode(path.read_bytes()).decode())
    return _IMG_CACHE[rel]


# One or more <source> elements: the hero's art-directed pairs carry three.
PICTURE_RE = re.compile(
    r"<picture>\s*(?:<source[^>]*>\s*)+(<img\b[^>]*>)\s*</picture>", re.S
)
# Every folder under assets/img/ that holds photography. Named once: a folder
# missing from this alternation is not an error, it just silently ships with
# real relative URLs the artifact's CSP cannot fetch, which is how the client's
# gallery set first came out blank in the preview.
IMG_DIRS = "official|products|concept|gallery"

STEM_RE = re.compile(rf"assets/img/((?:{IMG_DIRS})/[\w-]+?)-\d+\.jpg")
# The phone crop of an art-directed hero, and the media query that selects it.
PHONE_SOURCE_RE = re.compile(
    rf'<source media="([^"]*)"[^>]*srcset="assets/img/'
    rf'((?:{IMG_DIRS})/[\w-]+?-mobile)-\d+\.webp'
)


def inline_images(html):
    """Collapse each <picture> to one <img> keyed to a shared image table.

    The data URI is NOT written into the tag. Ten images appear across roughly
    thirty slots, so inlining each occurrence produced a 7.5 MB file. Each image
    is stored once in a lookup and the src is hydrated on load instead, which
    brings the same pixels in at about a quarter of the size.
    """

    def swap(match):
        tag = match.group(1)
        whole = match.group(0)
        stem = STEM_RE.search(tag)
        if not stem:
            return match.group(0)
        key = stem.group(1)
        # data-img is an attribute value, so a slash in the key is fine.
        data_uri(key)  # register it in the table

        # The responsive attributes are meaningless once there is one source.
        tag = re.sub(r'\s+srcset="[^"]*"', "", tag)
        tag = re.sub(r'\s+sizes="[^"]*"', "", tag)
        tag = re.sub(r'\ssrc="[^"]*"', f' data-img="{key}"', tag, count=1)
        # The lightbox reads data-full at click time; flag it for hydration.
        tag = re.sub(r'\sdata-full="[^"]*"', " data-full-img", tag)
        # Lazy loading earns nothing here: every image is already inside the
        # file as a data URI, so there is no request to defer. It also costs
        # something, because the eight pages are one document and an image in a
        # display:none route never enters the viewport to trigger its load.
        tag = tag.replace(' loading="lazy"', ' loading="eager"')
        # width/height stay on the tag: they are what stops the single-page
        # bundle from reflowing as fourteen data URIs decode.

        # The hero's two client-supplied slides are art-directed: a landscape
        # crop above 600px and a portrait one below it. Collapsing that to the
        # landscape crop alone would leave a phone viewing the preview with the
        # wrong photograph under a focal point tuned for the other one, so the
        # <picture> is kept with the phone crop as a second entry in the table.
        phone = PHONE_SOURCE_RE.search(whole)
        if phone:
            media, phone_key = phone.group(1), phone.group(2)
            data_uri(phone_key)
            return (f'<picture><source media="{media}" '
                    f'data-img-srcset="{phone_key}">{tag}</picture>')
        return tag

    return PICTURE_RE.sub(swap, html)


HYDRATE_JS = """
/* Preview bundle: fill in the image sources from the shared table. */
(function () {
  var IMAGES = __IMAGES__;
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-img]"),
    function (el) {
      var uri = IMAGES[el.getAttribute("data-img")];
      if (!uri) return;
      el.src = uri;
      if (el.hasAttribute("data-full-img")) el.setAttribute("data-full", uri);
    }
  );
  /* <source> entries for the hero's art-directed slides. */
  Array.prototype.forEach.call(
    document.querySelectorAll("source[data-img-srcset]"),
    function (el) {
      var uri = IMAGES[el.getAttribute("data-img-srcset")];
      if (uri) el.srcset = uri;
    }
  );
})();
"""


PNG_RE = re.compile(r'<img\b[^>]*\ssrc="assets/img/([\w@.-]+\.png)"[^>]*>')


def inline_png(html):
    """Inline the logo images, which are plain <img> tags rather than <picture>.

    Missing this leaves two live requests to assets/img in the bundle, and the
    artifact CSP blocks them, so the published preview loses its logo.
    """

    def swap(match):
        tag = match.group(0)
        name = match.group(1)
        # The logo appears in the header and the footer of every route, so the
        # bundle carries its data URI twice. It renders at 126px in the header
        # and at most 300px in the footer, so the 400px tier is the one to
        # inline; the 800px tier added about 600 KB for pixels nothing shows.
        name = name.replace("natfish-logo-800.png", "natfish-logo-400.png")
        raw = (ROOT / "assets" / "img" / name).read_bytes()
        uri = "data:image/png;base64," + base64.b64encode(raw).decode()
        tag = re.sub(r'\s+srcset="[^"]*"', "", tag)
        tag = re.sub(r'\s+sizes="[^"]*"', "", tag)
        return re.sub(r'\ssrc="[^"]*"', f' src="{uri}"', tag, count=1)

    return PNG_RE.sub(swap, html)


# ---------------------------------------------------------------- links --

def route_links(html):
    """Turn page links into hash routes. In-page anchors are left alone."""
    return re.sub(r'href="([a-z-]+)\.html(#[a-z-]+)?"',
                  lambda m: 'href="#/' + m.group(1) + (m.group(2) or '') + '"', html)


# ------------------------------------------------------------------ ids --

ID_RE = re.compile(r'\sid="([^"]+)"')


def uniquify_ids(pages):
    """Suffix any id that appears on more than one page with its route slug.

    The shared contact band puts id="contact" on five pages. Nothing links to
    it, but duplicate ids are invalid and would confuse the lightbox and form
    lookups once every page shares one document.
    """
    counts = Counter()
    for _slug, html in pages:
        counts.update(set(ID_RE.findall(html)))
    dupes = {i for i, n in counts.items() if n > 1}
    if not dupes:
        return pages, dupes

    out = []
    for slug, html in pages:
        for old in sorted(dupes):
            if f'id="{old}"' not in html:
                continue
            new = f"{old}--{slug}"
            html = html.replace(f'id="{old}"', f'id="{new}"')
            # Rewrite every reference that could point at it, page-scoped.
            for attr in ("href=\"#", "for=\"", "aria-controls=\"",
                         "data-success-for=\"", "aria-labelledby=\""):
                html = html.replace(f'{attr}{old}"', f'{attr}{new}"')
        out.append((slug, html))
    return out, dupes


# --------------------------------------------------------------- router --

ROUTER_CSS = """
/* Preview bundle: the eight pages live in one document as hash routes. */
[data-route] { display: none; }
[data-route].is-active { display: block; }
"""

ROUTER_JS = """
/* Preview bundle router. Only hashes beginning "#/" are routes, so in-page
   anchors such as #main and #seafood still behave normally. */
(function () {
  var routes = document.querySelectorAll("[data-route]");
  var titles = __TITLES__;

  function show(slug) {
    var matched = false;
    Array.prototype.forEach.call(routes, function (el) {
      var on = el.getAttribute("data-route") === slug;
      el.classList.toggle("is-active", on);
      if (on) matched = true;
    });
    if (!matched) return show("index");

    document.title = titles[slug] || titles.index;

    Array.prototype.forEach.call(
      document.querySelectorAll(".nav__link"),
      function (a) {
        if (a.getAttribute("href") === "#/" + slug) {
          a.setAttribute("aria-current", "page");
        } else {
          a.removeAttribute("aria-current");
        }
      }
    );

    /* The bundle shares ONE launcher across all nine routes, but the real
       natfish-ai.html ships without one - the chat embed is in the page. Match
       that here, or the preview shows a pill the deployed page does not have
       (and it sat on top of the embed's caption on a phone). */
    var pill = document.querySelector(".ai-pill");
    if (pill) pill.style.display = slug === "natfish-ai" ? "none" : "";

    /* Elements inside a display:none route never trigger the observer, so the
       reveal state is set directly when a route becomes visible. */
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-route].is-active .reveal"),
      function (el) { el.classList.add("is-visible"); }
    );

    window.scrollTo(0, 0);
  }

  /* A route may carry an in-page anchor: #/contact#order */
  function current() {
    var h = window.location.hash;
    if (h.indexOf("#/") !== 0) return { slug: "index", anchor: null };
    var parts = h.slice(2).split("#");
    return { slug: parts[0], anchor: parts[1] || null };
  }

  function go() {
    var route = current();
    show(route.slug);
    if (route.anchor) {
      var target = document.getElementById(route.anchor);
      if (target) target.scrollIntoView();
    }
  }

  window.addEventListener("hashchange", function () {
    if (window.location.hash.indexOf("#/") === 0) go();
  });

  go();
})();
"""


# ----------------------------------------------------------------- main --

def main():
    index = read("index.html")

    # One shared header, footer and lightbox lifted from the homepage.
    header = between(index, '<header class="site-header">', "</header>")
    footer = between(index, '<footer class="site-footer">', "</footer>")
    # The floating launcher sits after </footer> in the shared shell, so the
    # slice above stops just short of it. Missing this shipped a preview whose
    # stylesheet and script both knew about the pill while the markup was not
    # there at all, which is exactly as invisible as not building it.
    pill = between(index, '<a class="ai-pill"', "</a>") + \
        between(index, '<p class="visually-hidden" id="ai-status"', "</p>")
    lightbox = between(read("gallery.html"), '<div class="lightbox" id="lightbox"',
                       "</figure>\n  </div>")

    # Inline the webfonts as data URIs. A relative ../fonts/ URL cannot resolve
    # in a single-file artifact, and without this the preview silently drops to
    # the Georgia fallback while the real site shows Bitter.
    font_css = read("assets/css/fonts.css")

    def embed_font(match):
        name = match.group(1)
        raw = (ROOT / "assets" / "fonts" / name).read_bytes()
        uri = "data:font/woff2;base64," + base64.b64encode(raw).decode()
        return f'url("{uri}")'

    font_css = re.sub(r'url\("\.\./fonts/([\w.-]+)"\)', embed_font, font_css)
    css = font_css + "\n" + read("assets/css/natfish.css")
    # All four scripts, in load order, so the bundle behaves like the site.
    js = "\n".join(read("assets/js/" + n) for n in (
        "natfish-strings.js", "natfish-i18n.js",
        "natfish-seasons.js", "natfish.js", "natfish-ai.js",
    ))

    titles = {}
    pages = []
    for slug, filename in PAGES:
        html = read(filename)
        # Unescaped, because this is assigned to document.title as plain text.
        raw_title = re.search(r"<title>(.*?)</title>", html, re.S).group(1).strip()
        titles[slug] = html_mod.unescape(raw_title)
        body = between(html, '<main id="main">', "</main>")
        body = body[len('<main id="main">'):-len("</main>")]
        pages.append((slug, body))

    pages, dupes = uniquify_ids(pages)

    routes = []
    for slug, body in pages:
        body = route_links(inline_png(inline_images(body)))
        routes.append(f'<div data-route="{slug}">{body}</div>')

    # json.dumps, not manual quoting: the legal name carries an apostrophe that
    # naive quote swapping turns into a string terminator.
    router = ROUTER_JS.replace("__TITLES__", json.dumps(titles))
    hydrate = HYDRATE_JS.replace("__IMAGES__", json.dumps(_IMG_CACHE))

    # A short static title so the artifact gallery shows a name rather than the
    # full legal name. Deliberately unversioned: the preview is republished to
    # the same URL for each revision, and a title carrying a version number
    # goes stale the moment it is. The router replaces it with each page's real
    # title as soon as it runs, so the browser tab stays correct.
    doc = "\n".join([
        "<title>NATFISH</title>",
        f"<style>\n{css}\n{ROUTER_CSS}</style>",
        '<a class="skip-link" href="#main">Skip to main content</a>',
        route_links(inline_png(header)),
        '<main id="main">',
        "\n".join(routes),
        "</main>",
        route_links(inline_png(footer)),
        inline_png(pill),
        lightbox,
        # The flag has to be set before natfish-ai.js runs. The artifact is one
        # file under a CSP that blocks every external host, so the Chatbase
        # frame can never load here; the script shows an honest note in its
        # place rather than an empty box that reads as a broken build.
        f"<script>window.NATFISH_PREVIEW = true;\n{hydrate}\n{js}\n{router}</script>",
        "",
    ])

    OUT.write_text(doc, encoding="utf-8")

    kb = OUT.stat().st_size / 1024
    print(f"{OUT.name}: {kb:,.0f} KB ({kb/1024:.2f} MB)")
    print(f"routes: {', '.join(s for s, _ in PAGES)}")
    print(f"images inlined: {len(_IMG_CACHE)}")
    print(f"ids uniquified: {', '.join(sorted(dupes)) or 'none'}")
    if kb > 16 * 1024:
        raise SystemExit("ERROR: over the 16 MB artifact limit")


if __name__ == "__main__":
    main()
