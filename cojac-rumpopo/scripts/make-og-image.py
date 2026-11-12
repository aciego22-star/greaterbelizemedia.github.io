"""Rebuilds public/og-image.jpg (social preview) from the first hero photo plus the logo.
Run from the cojac-rumpopo folder:  python3 scripts/make-og-image.py"""
from PIL import Image

src = Image.open('originals/hero/Cojacs_Hero_01_Cocktail_Desktop_16x9.png').convert('RGB')
w, h = src.size
crop_h = int(w / (1200 / 630))
top = (h - crop_h) // 2
og = src.crop((0, top, w, top + crop_h)).resize((1200, 630), Image.LANCZOS).convert('RGBA')
logo = Image.open('public/brand/cojacs-logo-640.webp').convert('RGBA')
logo = logo.resize((210, int(logo.height * 210 / logo.width)), Image.LANCZOS)
og.alpha_composite(logo, (34, 28))
og.convert('RGB').save('public/og-image.jpg', quality=86, optimize=True, progressive=True)
print('public/og-image.jpg written')
