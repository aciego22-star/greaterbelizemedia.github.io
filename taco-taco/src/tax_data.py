# -*- coding: utf-8 -*-
"""GST, in the one place it is described.

The restaurant's own register adds the tax on top of the menu price rather than
having the price absorb it. Maria Andrews, 3 November 2026: "Our system
automatically adds the 12.5 percent, so if we tell you what's the price of one
item tax inclusive we would have to do it individually for all of them. So could
you set up a system that after they get their order it marks GST tax on it. So
they could know they are paying to GST and not to us as we aren't making that."

So: menu prices stay as printed, the tax is a line of its own after the order
total, and it is labelled as tax rather than folded into the money quietly. The
last sentence is the reason it is a separate line and not a bigger number.

To change the rate        change RATE.
To stop charging it       set ACTIVE to False and rebuild.
To stop the notice early  set NOTICE_ENDS to a date that has passed.
"""

ACTIVE = True
RATE   = 12.5          # percent, added to the order total

# Belize is UTC-6 all year, so a plain offset is enough.
TZ_OFFSET_HOURS = -6
FROM = "2026-11-02"    # the day the restaurant started charging it

# Her register applies the tax to everything it rings up, deals included, so the
# site does the same. A deal priced at $100 on a flyer is charged at $112.50 at
# the counter; the website quoting $100 would simply be the wrong number.
ON_DEALS = True

# The notice is temporary on purpose. A tax is news for a few weeks and then it
# is just the price of things, and a notice that never comes down keeps drawing
# attention to it. The line on the menu and the line in the basket stay.
NOTICE = True
NOTICE_ENDS = "2026-11-30 23:59:59"

COPY = {
 # The basket line and the WhatsApp line. These two must read the same.
 "line":    "GST (12.5%)",
 "subtotal": "Subtotal",
 "total":   "Total",
 # On the menu, beside the prices, permanently.
 "menu_note": "Menu prices do not include GST. A 12.5% government sales tax is "
              "added to your order total.",
 # The notice that comes down at the end of the month.
 "notice":  "From 2 November, a 12.5% government sales tax (GST) is added to all "
            "orders, in store and online. The tax is collected for the government "
            "and is shown as its own line on your order.",
 "notice_close": "Close this notice",
}
