"""Resize the event flyers shown on What's New at Universal.

Usage: python3 scripts/build-whats-new-flyers.py <originals-dir> public/site-images/whats-new

<originals-dir> holds the full-size uploads named below, downloaded from
https://universalhardware.bz/news/wp-content/uploads/<name> (not committed).
Only each post's main event flyer is used: these carry the event name, dates,
place and featured brands, and no prices. Flyers are resized, never edited.
"""
import sys
from PIL import Image

FLYERS = {
    # key: (upload name, output width)
    'mega-sale-2026': ('Mega-Sale-LinkedIn.jpg', 1200),
    'makita-clinic-mega-sale-2026': ('Makita-Clinic.jpg', 800),
    'expo-2026': ('EXPO-2026-FB-COVER-2.jpg', 1200),
    'friends-family-2026': ('ff26-main-flyer.jpeg', 800),
    'makita-clinic-friends-family-2026': ('MakitaClinic-feb2026.jpg', 800),
    'gst-holiday-2025': ('a-2025.jpeg', 800),
    'mega-sale-2025': ('Mega-Sale-INSTA-FB.jpg', 800),
    'friends-family-2025': ('FB-Cover-FF-Sale-2025.jpg', 1200),
}

src, out = sys.argv[1], sys.argv[2]
for key, (name, width) in FLYERS.items():
    im = Image.open(f'{src}/{name}').convert('RGB')
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(f'{out}/{key}.jpg', quality=82, optimize=True, progressive=True)
    im.save(f'{out}/{key}.webp', quality=80, method=6)
    print(f'{key}: {im.width}x{im.height}')
