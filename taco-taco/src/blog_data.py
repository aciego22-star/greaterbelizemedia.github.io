# -*- coding: utf-8 -*-
"""Fresh from the Taco Taco Kitchen: the content hub and its articles.

Every sentence is a separate block, so the Spanish pass means adding an "es"
beside each "en" rather than re-cutting the page. Inline **bold** and *italic*
are the only markup, expanded by the builder.

House style applied to the supplied copy: no em dashes (three became colons),
no emoji, and British spellings normalised to the American ones already used
across the site ("Bold Flavor", "Crowd Favorites").

The supplied kitchen photograph is not in the repo yet. Drop it in as
assets/img/kitchen.jpg (and a 1200x675 crop as kitchen-wide.jpg) and both the
hero and the "Made in Our Kitchen" figure pick it up automatically; until then
the builder falls back and omits the figure.
"""

HUB = {
 "name":    "Fresh from the Taco Taco Kitchen",
 "slug":    "fresh-from-our-kitchen.html",
 "kicker":  "From The Kitchen",
 "title_a": "Fresh From The",
 "title_b": "Kitchen",
 "sub":     "Stories, specials and what is coming off the griddle in West Belmopan.",
 "read":    "Read The Story",
 "back":    "All Stories",
}

ARTICLES = [
 {
  "slug":  "taco-taco-mexican-restaurant-belmopan.html",
  "date":  "2026-09-22",
  "date_label": "September 22, 2026",
  "title": "More Than Tacos: Bringing Bold Mexican Flavor to Belmopan",
  "seo_title": "Taco Taco Mexican Restaurant | Mexican Food in Belmopan, Belize",
  "meta":  "Discover Taco Taco Mexican Restaurant in Belmopan, Belize. Explore Mexican tacos, "
           "birria, burritos, quesadillas, flautas, lunch combos and more, fresh from the Taco "
           "Taco kitchen.",
  "hero":  "kitchen-wide.jpg",
  "hero_fallback": "dish-09.jpg",
  "hero_alt": "Taco Taco Mexican Restaurant kitchen team preparing fresh Mexican food in "
              "Belmopan Belize",
  "excerpt": "Tortillas on the griddle, birria on the go and a menu that keeps growing. A look "
             "at what comes out of the Taco Taco kitchen every day.",
  "blocks": [
   {"t":"p","x":"There is a particular kind of sound that tells you something good is coming "
                "from the kitchen: tortillas hitting the hot griddle, meat sizzling beside them, "
                "and an order coming together one ingredient at a time."},
   {"t":"p","x":"At **Taco Taco Mexican Restaurant**, that is simply another day in the kitchen."},
   {"t":"p","x":"From our home in West Belmopan, Taco Taco is built around one straightforward "
                "idea: serve satisfying Mexican food with bold flavor, generous portions and "
                "enough variety to make choosing what to order the hardest part."},
   {"t":"p","x":"Whether you come for tacos, birria, a loaded burrito, quesadillas or something "
                "a little different, the goal remains the same: food prepared to be enjoyed, not "
                "overcomplicated."},

   {"t":"h","x":"The Taco Taco Favorites"},
   {"t":"p","x":"Tacos may be in the name, but the menu goes considerably further."},
   {"t":"p","x":"Our kitchen serves Mexican tacos with choices such as carne asada, carnitas, al "
                "pastor and chicken, alongside favorites including **birria tacos, birria "
                "quesadillas, burritos, crispy flautas, tostadas and Mexican hot dogs**."},
   {"t":"p","x":"And when one dish simply is not enough, our rotating specials and lunch "
                "combinations bring several Taco Taco favorites together."},
   {"t":"p","x":"You may have already seen some of them across our social pages: **Taco Tuesday "
                "specials, Monday deals, Grande Mexican Burrito lunch combos, Pork Flautas, "
                "Birria Quesadillas and our Mega Combo** designed for the seriously hungry."},
   {"t":"p","x":"Pair that with refreshing drinks such as horchata, watermelon, lime, sorrel, "
                "orange, pineapple or cucumber and lime, and there is always another combination "
                "to try."},
   {"t":"cta","x":"See This Week's Deals","href":"deals-combos.html"},

   {"t":"h","x":"Made in Our Kitchen"},
   {"t":"p","x":"The food you see leaving the kitchen starts right here."},
   {"t":"img","src":"kitchen.jpg",
    "x":"Taco Taco Mexican Restaurant kitchen team preparing fresh Mexican food in Belmopan Belize"},
   {"t":"p","x":"Behind every plate is a working kitchen, a hot griddle and a team preparing "
                "orders throughout the day. That matters to us because Taco Taco is not simply "
                "about putting another item on a menu."},
   {"t":"p","x":"It is about the experience of receiving something fresh, filling and made with care."},

   {"t":"h","x":"Something New Is Always Cooking"},
   {"t":"p","x":"One of the best reasons to follow Taco Taco is that the menu experience does "
                "not stand still."},
   {"t":"p","x":"We regularly introduce specials, meal combinations and different ways to enjoy "
                "familiar favorites. Our **Facebook, Instagram and TikTok** pages are where you "
                "can keep up with what is coming off the griddle, current specials and the "
                "latest from the Taco Taco kitchen."},
   {"t":"p","x":"And with our new website, discovering Taco Taco online is becoming just as easy "
                "as ordering your favorites."},
   {"t":"social"},

   {"t":"h","x":"Hungry Yet?"},
   {"t":"p","x":"If all of this has made choosing lunch considerably harder, we have done our job."},
   {"t":"p","x":"Come see us at **11 Aloe Vera Ave., West Belmopan**, explore the menu, check out "
                "our latest deals, and find your Taco Taco favorite."},
   {"t":"p","x":"Because sometimes the answer to *“What should we eat today?”* really is "
                "that simple:"},
   {"t":"kicker","x":"Tacos. Birria. Burritos. Quesadillas. Taco Taco."},
   {"t":"cta","x":"Start Your Order","href":"menu.html"},
  ],
 },
]
