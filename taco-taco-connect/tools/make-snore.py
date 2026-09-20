#!/usr/bin/env python3
"""
Synthesise the mascot's snore: assets/snore.mp3.

    pip install numpy imageio-ffmpeg
    python3 tools/make-snore.py

Why synthesised rather than a stock sample: a licensed recording means an
account, a receipt and a renewal for two seconds of audio, and a real snore
recorded off a person sounds like a person, not like a cartoon taco. This is
built from the two parts a cartoon snore actually has, so it can be retuned
here instead of re-bought.

The rattle is the whole trick. A snore reads as a snore because a low buzz is
chopped by the soft palate at around thirty times a second; without that
flutter the same buzz is just a hum. RATTLE_HZ is the first thing to change if
it sounds wrong.

If they would rather have a real recording, drop it in at assets/snore.mp3 and
nothing else has to change: the page only ever asks for that one path.
"""
import pathlib
import subprocess
import sys

import numpy as np

SR = 22050           # a snore has nothing above ~4kHz; 22.05k halves the file
INHALE = 1.28        # seconds of the drawn-in "rrrrh"
GAP = 0.10
EXHALE = 0.80        # the softer sigh back out
RATTLE_HZ = 29.0     # palate flutter: below ~22 it gurgles, above ~40 it buzzes
F0_START, F0_END = 84.0, 104.0    # the buzz rises slightly as the breath fills
PEAK = 0.89          # leave headroom so the mp3 encoder has room to work

root = pathlib.Path(__file__).resolve().parent.parent
out = root / "assets" / "snore.mp3"


def resonator(x, freq, q):
    """Two-pole bandpass, swept sample by sample. freq is per-sample."""
    y = np.zeros_like(x)
    b1 = b2 = 0.0
    freq = np.atleast_1d(freq)
    if freq.size == 1:
        freq = np.full(x.size, freq[0])
    for i in range(x.size):
        w = 2 * np.pi * freq[i] / SR
        r = 1.0 - w / (2 * q)
        a = 2 * r * np.cos(w)
        b = -r * r
        v = x[i] + a * b1 + b * b2
        b2, b1 = b1, v
        y[i] = v * (1 - r)
    return y


def buzz(t, f0):
    """A glottal-ish rasp: the first eight harmonics, rolled off."""
    phase = 2 * np.pi * np.cumsum(f0) / SR
    return sum(np.sin(k * phase) / (k ** 1.35) for k in range(1, 9))


rng = np.random.default_rng(7)      # fixed, so a rebuild is byte-identical

# ---- the inhale: a rising buzz, chopped by the palate ------------------------
n = int(INHALE * SR)
t = np.arange(n) / SR
f0 = np.linspace(F0_START, F0_END, n)
body = buzz(t, f0)

# the flutter never closes completely, or it reads as a stutter rather than a snore
flutter = 0.5 + 0.5 * np.sin(2 * np.pi * RATTLE_HZ * t - np.pi / 2)
body *= 0.34 + 0.66 * flutter ** 1.7

# breath behind the buzz, tracking the same flutter
breath = resonator(rng.normal(0, 1, n), np.linspace(380, 620, n), 1.6)
breath *= 0.30 + 0.70 * flutter ** 1.3
body = body * 0.78 + breath * 0.5

# slow swell, then hold: a snore does not start at full volume
env = np.clip(np.linspace(0, 2.6, n), 0, 1) ** 1.5
env *= np.clip(np.linspace(3.0, 0, n), 0, 1) ** 0.6
inhale = body * env

# ---- the exhale: a softer sigh, falling away ---------------------------------
n2 = int(EXHALE * SR)
t2 = np.arange(n2) / SR
sigh = resonator(rng.normal(0, 1, n2), np.linspace(700, 430, n2), 2.4)
sigh += 0.35 * buzz(t2, np.linspace(78, 62, n2)) * (
    0.45 + 0.55 * (0.5 + 0.5 * np.sin(2 * np.pi * (RATTLE_HZ * 0.62) * t2)))
sigh *= np.clip(np.linspace(0, 5, n2), 0, 1) * np.linspace(1, 0, n2) ** 1.4
exhale = sigh * 0.42

sig = np.concatenate([inhale, np.zeros(int(GAP * SR)), exhale, np.zeros(int(0.06 * SR))])

# gentle high cut: a cartoon snore is warm, and the hiss only costs bitrate
sig = resonator(sig, 340.0, 0.62) * 1.6 + sig * 0.45

sig /= np.max(np.abs(sig)) or 1.0
sig = np.tanh(sig * 1.25) / np.tanh(1.25)        # soften the peaks
sig *= PEAK / (np.max(np.abs(sig)) or 1.0)
sig[:64] *= np.linspace(0, 1, 64)                # no click at either end
sig[-256:] *= np.linspace(1, 0, 256)

pcm = (sig * 32767).astype("<i2").tobytes()

try:
    import imageio_ffmpeg
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
    ffmpeg = "ffmpeg"

cmd = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
       "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0",
       "-codec:a", "libmp3lame", "-b:a", "48k", "-write_xing", "1", str(out)]
try:
    subprocess.run(cmd, input=pcm, check=True)
except FileNotFoundError:
    sys.exit("ffmpeg not found: pip install imageio-ffmpeg")

print(f"  snore.mp3: {out.stat().st_size / 1024:.1f} KB, "
      f"{len(sig) / SR:.2f}s, {SR} Hz mono")
