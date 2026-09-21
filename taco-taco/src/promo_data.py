# -*- coding: utf-8 -*-
"""The one place the September promotion is described.

Nothing about the discount is written anywhere else. The popup, the basket
summary and the WhatsApp message all read these numbers, and the site stops
running the promotion by the clock, in the visitor's browser, without anybody
having to rebuild or redeploy on the night of the 30th.

To turn it off early          set ACTIVE to False and rebuild.
To extend it                  move ENDS.
To change the amount          change PERCENT.
To run a different promotion  change PROMO_ID, the dates, and COPY below.
                              A new PROMO_ID matters: it is the key the browser
                              remembers a dismissal under, so reusing the old one
                              would hide the new popup from everybody who closed
                              the last one.
"""

PROMO_ID = "sep-2026-independence"
ACTIVE   = True
PERCENT  = 5

# Belize is UTC-6 the whole year round. There is no daylight saving to get
# wrong, which is why this is a plain offset rather than a timezone database.
TZ_OFFSET_HOURS = -6
STARTS = "2026-09-21 00:00:00"   # Independence Day
ENDS   = "2026-09-30 23:59:59"   # 11:59:59 PM Belize time on the 30th

# A deal already carries its own reduced price. True means the website discount
# comes off those too, which is what "5% off every order" promises the customer.
# Set False to protect the combo margins and discount only the regular menu; the
# basket and the WhatsApp message both follow this without any other change.
APPLY_TO_DEALS = True

# The customer-facing words, exactly as the restaurant asked for them. The
# Spanish comes from es.py the same way every other string on the site does, so
# the build refuses to ship if any line here has no translation.
COPY = {
 "title":    "Happy Independence Day, Belize!",
 "welcome":  "Welcome to our brand-new website!",
 "body": [
   "In celebration of Belize's Independence Day, the September Celebrations, "
   "and the launch of Taco Taco's new website, we're giving you 5% OFF every "
   "order placed through our website for the remainder of September!",
   "Whether you're dining in, picking up, or requesting delivery, simply use "
   "our new online menu, add your favorites to your basket, and send your "
   "order directly to us on WhatsApp.",
 ],
 "nocode":   "NO CODE NEEDED — your 5% discount is automatically calculated.",
 "thanks":   "Thank you, Belize, for your continued support of Taco Taco.",
 "signoff":  "Happy Independence Day!",
 "cta":      "Start My Order",
 "close":    "Close this offer",
 # The basket line and the WhatsApp line. These two must read the same, and the
 # build checks that they do.
 "line":     "September Celebration — 5% Website Discount",
 "subtotal": "Subtotal",
 "final":    "Final Order Total",
 "badge":    "5% off",
}
