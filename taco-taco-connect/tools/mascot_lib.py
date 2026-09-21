"""
Shared machinery for the mascot's alternate poses.

Two tools derive images from assets/mascot.png: make-sleeping-mascot.py and
make-coffee-mascot.py. Both need the same three things, so they live here rather
than in two drifting copies:

  * the arms, cut from the top corners and rotated about the shoulder
  * the face, found in the artwork rather than measured by hand
  * seam fill, which erases a feature by interpolating the face tone across it

Read make-sleeping-mascot.py for why each is built the way it is; the reasoning
is documented there and not repeated here.
"""
import sys

import cv2
import numpy as np


class Art:
    """assets/mascot.png plus the masks every pose needs."""

    def __init__(self, path):
        self.src = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
        if self.src is None:
            sys.exit(f"{path} not found; run tools/extract-mascot.py first")
        self.h, self.w = self.src.shape[:2]
        self.alpha = self.src[..., 3]
        self.hsv = cv2.cvtColor(self.src[..., :3], cv2.COLOR_BGR2HSV)
        self.dark = ((self.hsv[..., 2] < 95) & (self.alpha > 200)).astype(np.uint8)
        self.bright = ((self.hsv[..., 1] < 55) & (self.hsv[..., 2] > 195)
                       & (self.alpha > 200)).astype(np.uint8)

    # ---- arms ---------------------------------------------------------------
    def arm(self, x0, x1, y0, y1):
        box = np.zeros((self.h, self.w), np.uint8)
        box[y0:y1, x0:x1] = 255
        sel = ((self.alpha > 60) & (box > 0)).astype(np.uint8)
        n, lbl, st, _ = cv2.connectedComponentsWithStats(sel, 8)
        if n < 2:
            sys.exit(f"no artwork found in arm box ({x0},{x1},{y0},{y1})")
        _, i = max((st[i, 4], i) for i in range(1, n))
        return lbl == i

    def rotate(self, img, pivot, deg):
        M = cv2.getRotationMatrix2D(pivot, deg, 1.0)
        return cv2.warpAffine(img, M, (self.w, self.h), flags=cv2.INTER_CUBIC,
                              borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))

    # ---- the face, found rather than measured -------------------------------
    def face(self):
        nb, lb, sb, cb = cv2.connectedComponentsWithStats(self.bright, 8)
        if nb < 3:
            sys.exit("no eye whites found in assets/mascot.png")
        eye_ids = sorted(range(1, nb), key=lambda i: -sb[i, 4])[:2]
        if sb[eye_ids[1], 4] < sb[eye_ids[0], 4] * 0.45:
            sys.exit("the two largest white shapes are not a pair of eyes; check the artwork")
        eyes = []
        for i in sorted(eye_ids, key=lambda i: cb[i][0]):
            x, y, cw, ch, _ = sb[i]
            eyes.append((int(x + cw / 2), int(y + ch / 2), int(cw / 2 + 16), int(ch / 2 + 16)))

        eye_mask = np.zeros((self.h, self.w), np.uint8)
        for cx, cy, rx, ry in eyes:
            cv2.ellipse(eye_mask, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
        eye_bot = max(cy + ry for _, cy, _, ry in eyes)
        ex0 = min(cx - rx for cx, _, rx, _ in eyes)
        ex1 = max(cx + rx for cx, _, rx, _ in eyes)

        teeth = np.zeros((self.h, self.w), np.uint8)
        for i in range(1, nb):
            if sb[i, 4] > 500 and cb[i][1] > eye_bot and ex0 - 160 < cb[i][0] < ex1 + 160:
                teeth[lb == i] = 255
        if not teeth.any():
            sys.exit("no teeth found below the eyes; check the artwork")
        teeth_d = cv2.dilate(teeth, np.ones((9, 9), np.uint8))

        mous = self.dark.copy()
        mous[eye_mask > 0] = 0
        for x in np.where(teeth_d.any(0))[0]:
            mous[np.where(teeth_d[:, x])[0].min():, x] = 0
        nm, lm, sm, _ = cv2.connectedComponentsWithStats(mous, 8)
        mous_id = max(range(1, nm), key=lambda i: sm[i, 4] if sm[i, 2] < self.w * 0.6 else 0)
        moustache = lm == mous_id
        mous_bottom = np.full(self.w, -1)
        for x in np.where(moustache.any(0))[0]:
            mous_bottom[x] = np.where(moustache[:, x])[0].max()

        wide = cv2.dilate(teeth, np.ones((31, 31), np.uint8))
        grin = np.zeros((self.h, self.w), np.uint8)
        lip_bottom = 0
        for x in np.where(wide.any(0))[0]:
            ys = np.where(wide[:, x])[0]
            top = mous_bottom[x] + 4 if mous_bottom[x] >= 0 else ys.min()
            tb = np.where(teeth_d[:, x])[0].max() if teeth_d[:, x].any() else ys.max()
            bot, y = tb + 6, tb
            while y < tb + 26 and y < self.h - 1 and not self.dark[y, x]:
                y += 1
            if y < tb + 26:
                e = y
                while e < self.h - 1 and self.dark[e, x] and e - y < 16:
                    e += 1
                if e - y < 16:
                    bot = e + 4
            bot = min(bot, tb + 20)
            lip_bottom = max(lip_bottom, bot)
            if top < bot:
                grin[top:bot, x] = 255

        gx0, gx1 = np.where(wide.any(0))[0][[0, -1]]
        stray = self.bright * 255
        stray[:eye_bot, :] = 0
        stray[lip_bottom:, :] = 0
        stray[:, :max(0, gx0 - 30)] = 0
        stray[:, gx1 + 30:] = 0
        for i in eye_ids:
            stray[lb == i] = 0
        grin |= cv2.dilate(stray, np.ones((15, 15), np.uint8))
        grin[moustache] = 0

        eye_blobs = [lb == i for i in sorted(eye_ids, key=lambda i: cb[i][0])]
        return {"eyes": eyes, "eye_mask": eye_mask, "eye_blobs": eye_blobs,
                "moustache": moustache, "grin": grin}

    # ---- erasing a feature --------------------------------------------------
    def _clean(self, mask, y, x, step, reach=60):
        for _ in range(reach):
            if x < 0 or x >= self.w:
                return None
            if mask[y, x] == 0 and self.alpha[y, x] > 245 and int(self.src[y, x, :3].max()) > 120:
                return x
            x += step
        return None

    def seam_fill(self, img, mask):
        out = img.astype(np.float32).copy()
        for y in range(self.h):
            xs = np.where(mask[y] > 0)[0]
            if not len(xs):
                continue
            runs, start = [], xs[0]
            for i in range(1, len(xs)):
                if xs[i] != xs[i - 1] + 1:
                    runs.append((start, xs[i - 1]))
                    start = xs[i]
            runs.append((start, xs[-1]))
            for x0, x1 in runs:
                lx = self._clean(mask, y, x0 - 1, -1)
                rx = self._clean(mask, y, x1 + 1, +1)
                if lx is None and rx is None:
                    continue
                cl = out[y, lx if lx is not None else rx]
                cr = out[y, rx if rx is not None else lx]
                t = np.linspace(0, 1, x1 - x0 + 3)[1:-1][:, None]
                out[y, x0:x1 + 1] = cl * (1 - t) + cr * t
        return np.clip(out, 0, 255).astype(np.uint8)

    def erase(self, rgb, mask):
        """Seam fill, blended in softly so the edges of the mask do not show."""
        mask = np.where(mask > 0, 255, 0).astype(np.uint8)
        filled = self.seam_fill(rgb, mask)
        soft = (cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 3.5) / 255.0)[..., None]
        return np.clip(rgb * (1 - soft) + filled * soft, 0, 255).astype(np.uint8)


def over(bot, top):
    ta, ba = top[..., 3:4] / 255.0, bot[..., 3:4] / 255.0
    oa = ta + ba * (1 - ta)
    rgb = np.where(oa > 1e-6,
                   (top[..., :3] * ta + bot[..., :3] * ba * (1 - ta)) / np.maximum(oa, 1e-6), 0)
    return np.dstack([rgb, oa * 255])


def save_set(rgb, alpha, assets, stem):
    """Write <stem>.webp, <stem>-400.webp and a quantised <stem>.png."""
    from PIL import Image
    out = Image.fromarray(np.dstack([cv2.cvtColor(rgb, cv2.COLOR_BGR2RGB), alpha]), "RGBA")
    out.save(assets / f"{stem}.webp", quality=86, method=6)
    out.resize((out.width // 2, out.height // 2), Image.LANCZOS).save(
        assets / f"{stem}-400.webp", quality=86, method=6)
    out.quantize(colors=255, method=Image.FASTOCTREE).save(assets / f"{stem}.png", optimize=True)
    for f in (f"{stem}.webp", f"{stem}-400.webp", f"{stem}.png"):
        print(f"  {f}: {(assets / f).stat().st_size / 1024:.1f} KB")
