# -*- coding: utf-8 -*-
"""The one place the free carnitas clip is described.

Same shape as promo_data.py and the same idea behind it: the window is turned
into plain milliseconds at build time and the visitor's own browser decides
whether the offer is still running, so this comes off by itself on the night it
ends without anybody having to rebuild or redeploy.

To turn it off early   set ACTIVE to False and rebuild.
To extend it           move ENDS.
To run the next one    change INTRO_ID, the dates, VIDEO, POSTER and COPY.
                       A new INTRO_ID matters: it is the key the browser
                       remembers a dismissal under, so reusing the old one
                       hides the new clip from everybody who closed the last.
"""

INTRO_ID = "oct-2026-free-carnitas"
ACTIVE   = True

# Belize is UTC-6 the whole year round, so a plain offset is enough.
TZ_OFFSET_HOURS = -6
STARTS = "2026-10-16 00:00:00"
# A PLACEHOLDER end date. "While supplies last" has no date in it, and an offer
# for free food that runs until somebody remembers to take it down is the kind
# that gets expensive. Move this to whatever the restaurant actually means.
ENDS   = "2026-10-31 23:59:59"

VIDEO  = "intro-free-carnitas.mp4"
POSTER = "intro-free-carnitas.jpg"

# The customer-facing words. The Spanish comes from es.py the same way every
# other string does, so the build refuses to ship if any line has no translation.
COPY = {
 "line":   "Come get your free carnitas tacos. For a limited time, while supplies last!",
 "cta":    "See The Menu",
 "close":  "Close this offer",
 "unmute": "Turn the sound on",
 "mute":   "Turn the sound off",
}
