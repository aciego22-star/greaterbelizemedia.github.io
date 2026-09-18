# -*- coding: utf-8 -*-
"""Turns a finished English page into the Spanish one.

The site is generated once, in English, and then walked: every run of text and
every attribute a reader actually reads is swapped for its entry in es.ES.
Doing it here rather than threading a language argument through two hundred
call sites means there is exactly one place that decides what a visitor sees,
and one report at the end naming anything that has no Spanish yet. The build
stops on that report, so a half translated page cannot ship.

What is deliberately left alone:

  script and style contents, and every structural attribute: href, src, class,
  id, style, data-price, data-zoom and the rest.

  data-name on an add button. That is the order token: it travels into the
  basket and out to the kitchen on WhatsApp, and it has to match the menu
  printed behind the counter. The Spanish page shows the translated name from
  data-disp instead, which this module attaches as it goes.

  anything with no letters in it, so a lone full stop between two bold runs
  is not reported as an untranslated string.
"""
import re, html as _html
from html.parser import HTMLParser
from es import ES, JS, PATTERNS, KEEP

# Attributes a person reads. Everything not named here is structural and is
# copied through untouched.
READABLE = {"alt", "title", "aria-label", "placeholder", "data-zoom-title",
            "aria-description"}
# <meta> and <link> carry their text in content, but only for these names.
META_KEYS = {"description", "og:title", "og:description", "og:site_name",
             "twitter:title", "twitter:description"}

RAW = {"script", "style"}
VOID = {"area","base","br","col","embed","hr","img","input","link","meta",
        "param","source","track","wbr"}

_PAT = [(re.compile(p), t) for p, t in PATTERNS]
_HAS_LETTER = re.compile(r"[^\W\d_]", re.U)

MISSING = {}


def _lookup(s, ctx=None):
    """Spanish for one string, or None if we have none."""
    if ctx and (ctx + ":" + s) in ES:
        return ES[ctx + ":" + s]
    if s in ES:
        return ES[s]
    for rx, tmpl in _PAT:
        m = rx.match(s)
        if m:
            parts = {k: (_lookup(v) or v) for k, v in m.groupdict().items()}
            return tmpl.format(**parts)
    if s in KEEP:
        return s
    return None


def tr(s, ctx=None, where=""):
    """Translate, recording anything we cannot."""
    if not s or not _HAS_LETTER.search(s):
        return s
    v = _lookup(s, ctx)
    if v is None:
        MISSING.setdefault(s, set()).add(where)
        return s
    return v


class _Spanish(HTMLParser):
    def __init__(self, where):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.raw = 0            # depth inside script/style
        self.ctx = []           # first class of each open element
        self.where = where

    # -- helpers ---------------------------------------------------------
    def _attrs(self, tag, attrs):
        keep = []
        cls = ""
        disp = None
        for k, v in attrs:
            if v is None:
                keep.append((k, None)); continue
            if k == "class":
                cls = v.split()[0] if v.split() else ""
            if k in READABLE:
                v = tr(v, None, self.where)
            elif k == "content" and tag == "meta":
                name = dict(attrs).get("name") or dict(attrs).get("property") or ""
                if name in META_KEYS:
                    v = tr(v, None, self.where)
            elif k == "data-name":
                # the order token stays English; the Spanish goes alongside it
                d = _lookup(v)
                if d and d != v:
                    disp = d
            keep.append((k, v))
        if disp is not None and not any(k == "data-disp" for k, _ in keep):
            keep.append(("data-disp", disp))
        return keep, cls

    def _emit_tag(self, tag, attrs, selfclose=False):
        s = "<" + tag
        for k, v in attrs:
            if v is None:
                s += " " + k
            else:
                # Escape for a double-quoted attribute only. Turning a single
                # quote into &#x27; would be valid HTML but it hides the quotes
                # inside style="background-image:url('assets/...')" from every
                # later pass that has to rewrite those paths.
                s += ' %s="%s"' % (k, _html.escape(v, quote=False).replace('"', "&quot;"))
        s += "/>" if selfclose else ">"
        self.out.append(s)

    # -- parser callbacks -------------------------------------------------
    def handle_starttag(self, tag, attrs):
        keep, cls = self._attrs(tag, attrs)
        self._emit_tag(tag, keep)
        if tag in RAW:
            self.raw += 1
        if tag not in VOID:
            self.ctx.append(cls)

    def handle_startendtag(self, tag, attrs):
        keep, _ = self._attrs(tag, attrs)
        self._emit_tag(tag, keep, selfclose=True)

    def handle_endtag(self, tag):
        if tag in RAW and self.raw:
            self.raw -= 1
        if tag not in VOID and self.ctx:
            self.ctx.pop()
        self.out.append("</%s>" % tag)

    def handle_data(self, data):
        if self.raw:
            self.out.append(data); return
        m = re.match(r"(?s)^(\s*)(.*?)(\s*)$", data)
        lead, core, trail = m.groups()
        if not core:
            self.out.append(data); return
        ctx = self.ctx[-1] if self.ctx else None
        self.out.append(lead + _html.escape(tr(core, ctx, self.where), quote=False) + trail)

    def handle_comment(self, data):   self.out.append("<!--%s-->" % data)
    def handle_decl(self, decl):      self.out.append("<!%s>" % decl)
    def handle_pi(self, data):        self.out.append("<?%s>" % data)
    def unknown_decl(self, data):     self.out.append("<![%s]>" % data)


def translate_html(page, where=""):
    p = _Spanish(where)
    p.feed(page)
    p.close()
    return "".join(p.out)


def translate_json(obj, where="deals.js"):
    """Same treatment for the strings handed to the browser as data.

    Keys that are identifiers, prices, filenames or the WhatsApp order lines
    are left as they are; everything a visitor reads is translated.
    """
    SKIP = {"id", "key", "flyer", "src", "poster", "href", "price", "repeat",
            "type", "priced", "showIf", "choice", "equals", "slug", "name",
            "source", "rating", "en", "es", "wa", "img"}
    def walk(o, key=None):
        if isinstance(o, dict):
            return {k: walk(v, k) for k, v in o.items()}
        if isinstance(o, list):
            return [walk(v, key) for v in o]
        if isinstance(o, str) and key not in SKIP:
            return tr(o, None, where)
        return o
    return walk(obj)


def report():
    """Every string with no Spanish, grouped, newest problems first."""
    return sorted(MISSING.items(), key=lambda kv: kv[0])
