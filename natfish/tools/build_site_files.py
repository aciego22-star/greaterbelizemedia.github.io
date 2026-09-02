#!/usr/bin/env python3
"""Generate site.webmanifest, robots.txt and sitemap.xml.

They are generated rather than hand-written for one reason: the sitemap must
list exactly the canonical URLs the pages declare, and a hand-kept list drifts
the first time a page is added. Both are built from the same PAGES map the
HTML is built from, and from the same SITE_URL the canonicals use.
"""
import pathlib
import sys
import xml.etree.ElementTree as ET

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from build_shell import LEGAL, SITE_SHORT, SITE_URL  # noqa: E402
from build_pages import ARTICLE, PAGES  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Brand colours, straight from the stylesheet's tokens.
THEME = "#052b45"        # --navy-800, the header and footer navy
BACKGROUND = "#ffffff"

# Pages that must never be indexed, and so must never be in the sitemap.
# Nothing qualifies today; the map is here so a future private page is a data
# change rather than a code change.
NOINDEX = set()


def canonical(name):
    return SITE_URL + "/" if name == "index.html" else f"{SITE_URL}/{name}"


def manifest():
    data = f"""{{
  "name": "{LEGAL}",
  "short_name": "{SITE_SHORT}",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "{THEME}",
  "background_color": "{BACKGROUND}",
  "icons": [
    {{
      "src": "android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }},
    {{
      "src": "android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }}
  ]
}}
"""
    (ROOT / "site.webmanifest").write_text(data, encoding="utf-8")
    return "site.webmanifest"


def robots():
    """Production robots. Indexing is permitted here on purpose.

    The temporary preview host is kept out of the index by an X-Robots-Tag
    header in netlify.toml, not by this file, so that going live is a matter of
    deleting one clearly marked block rather than remembering to rewrite this.
    """
    data = f"""# {LEGAL}
User-agent: *
Allow: /

Sitemap: {SITE_URL}/sitemap.xml
"""
    (ROOT / "robots.txt").write_text(data, encoding="utf-8")
    return "robots.txt"


def sitemap():
    urlset = ET.Element("urlset",
                        {"xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9"})
    names = [n for n in PAGES if n not in NOINDEX]
    # Homepage first, then the rest in the order the site presents them.
    names.sort(key=lambda n: (n != "index.html", list(PAGES).index(n)))
    for name in names:
        url = ET.SubElement(urlset, "url")
        ET.SubElement(url, "loc").text = canonical(name)
        if name == "index.html":
            ET.SubElement(url, "priority").text = "1.0"
        elif name == ARTICLE["slug"]:
            # The one page with a real publication date to declare.
            ET.SubElement(url, "lastmod").text = ARTICLE["date_iso"]
    ET.indent(urlset, space="  ")
    xml = ET.tostring(urlset, encoding="unicode")
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n' + xml + "\n", encoding="utf-8")
    return f"sitemap.xml ({len(names)} URLs)"


def main():
    for made in (manifest(), robots(), sitemap()):
        print(f"  {made}")


if __name__ == "__main__":
    main()
