"""Builds the PDF walkthrough from walkthrough-capture.cjs output.

Usage: python3 scripts/walkthrough-pdf.py <capture-dir> <output.pdf> public/img/web/confident-logo.png
"""
import json, sys
from PIL import Image, ImageDraw, ImageFont
look, out = sys.argv[1], sys.argv[2]
items = json.load(open(f'{look}/items.json'))
serif = '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
sans = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG = (251, 248, 243); INK = (43, 33, 26); GOLD = (119, 92, 46); BAR = (244, 238, 227)

def label_bar(width, text, sub=None):
    f = ImageFont.truetype(sans, max(22, width // 30)); fs = ImageFont.truetype(sans, max(16, width // 45))
    h = int(f.size * 2.6) + (int(fs.size * 1.6) if sub else 0)
    bar = Image.new('RGB', (width, h), BAR); d = ImageDraw.Draw(bar)
    # wrap
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) > width - 2 * f.size: lines.append(cur); cur = w
        else: cur = t
    lines.append(cur)
    h = int(f.size * (1.0 + 1.35 * len(lines))) + (int(fs.size * 1.6) if sub else 0)
    bar = Image.new('RGB', (width, h), BAR); d = ImageDraw.Draw(bar)
    y = int(f.size * 0.5)
    for line in lines: d.text((f.size, y), line, font=f, fill=INK); y += int(f.size * 1.35)
    if sub: d.text((f.size, y), sub, font=fs, fill=GOLD)
    d.line([(0, h - 2), (width, h - 2)], fill=GOLD, width=2)
    return bar

pages = []
# Cover
W, H = 1240, 1754
cover = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(cover)
try:
    logo = Image.open(f'{sys.argv[3]}').convert('RGBA'); logo = logo.resize((600, int(600 * logo.height / logo.width)))
    cover.paste(logo, ((W - 600) // 2, 220), logo)
except Exception as e: print('logo', e)
title = ImageFont.truetype(serif, 64); body = ImageFont.truetype(sans, 30); small = ImageFont.truetype(sans, 24)
d.text((W // 2, 560), 'Website preview walkthrough', font=title, fill=INK, anchor='mm')
d.text((W // 2, 640), 'ConfiDent Oral Care · The Boardwalk Belize', font=body, fill=GOLD, anchor='mm')
lines = ['Every page at phone size, then confident AI and the booking flow step by step,',
         'the test calendar, and desktop views.', '',
         'confident AI is shown in demo mode (scripted answers, real booking system).',
         'With an API key, the live version runs on Claude.', '',
         'All bookings shown are test bookings with sample details.']
y = 760
for l in lines: d.text((W // 2, y), l, font=small, fill=INK, anchor='mm'); y += 40
d.text((W // 2, 1180), 'Contents', font=ImageFont.truetype(serif, 40), fill=INK, anchor='mm')
y = 1240
toc = ['1–18  Pages (phone)', '19  Mobile menu', '20–26  confident AI conversation and booking', '27–31  Booking form and staff-review request', '32  Gallery photo viewer', '33  Test calendar', '34–39  Desktop views']
for t in toc: d.text((W // 2, y), t, font=small, fill=INK, anchor='mm'); y += 38
pages.append(cover)

for i, it in enumerate(items, 1):
    im = Image.open(it['file']).convert('RGB')
    if it['kind'].startswith('phone') and im.width > 640: im = im.resize((640, int(im.height * 640 / im.width)), Image.LANCZOS)
    if it['kind'] == 'desktop' and im.width > 1440: im = im.resize((1440, int(im.height * 1440 / im.width)))
    chunk = 2626 if it['kind'] == 'phone-full' else im.height
    parts = [im.crop((0, y, im.width, min(im.height, y + chunk))) for y in range(0, im.height, chunk)]
    for k, part in enumerate(parts):
        sub = f'Part {k + 1} of {len(parts)}' if len(parts) > 1 else None
        bar = label_bar(part.width, f'{i}. {it["label"]}', sub)
        page = Image.new('RGB', (part.width, bar.height + part.height), BG)
        page.paste(bar, (0, 0)); page.paste(part, (0, bar.height))
        pages.append(page)

pages[0].save(out, save_all=True, append_images=pages[1:], resolution=150, quality=72)
print('pages', len(pages))
