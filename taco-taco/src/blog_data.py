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
 # Newest first: the hub and the sitemap both walk this list in order.
 {
  "slug":  "birria-belmopan.html",
  "date":  "2026-10-22",
  "date_label": "October 22, 2026",
  "title": "Birria, Eight Ways: Tacos, Ramen, Pizza and the Consomé",
  "seo_title": "Birria in Belmopan | Birria Tacos, Ramen and Pizza | Taco Taco Belize",
  "meta":  "What birria is and the eight ways Taco Taco Mexican Restaurant in Belmopan serves "
           "it: birria tacos, the plato combo, birria pizza, birria ramen, birria soup, "
           "burritos and quesadillas, all with consomé for dipping.",
  "hero":  "birria-wide.jpg",
  "hero_fallback": "gal-birria-combo.jpg",
  "hero_alt": "A plate of birria tacos with rice, guacamole and a cup of consomé at Taco Taco "
              "Mexican Restaurant in Belmopan Belize",
  "excerpt": "The dish that quietly took over our menu. What birria actually is, why it comes "
             "with a cup of broth, and the eight different ways you can order it.",
  "blocks": [
   {"t":"p","x":"Order birria anywhere and the first thing you notice is that it arrives with "
                "a cup of something on the side. People sometimes set it aside, thinking it is "
                "a soup they did not ask for."},
   {"t":"p","x":"It is not. **That cup is the point.**"},

   {"t":"h","x":"What Birria Actually Is"},
   {"t":"p","x":"Birria is meat slow-cooked in a seasoned broth until it pulls apart on its "
                "own. No knife, no effort: it simply gives way."},
   {"t":"p","x":"The broth it cooked in does not get thrown away. It is served alongside as "
                "**consomé**, and you dip. Taco into the cup, lift, eat, repeat. The tortilla "
                "takes on the broth, the meat is already soft, and the whole thing turns into "
                "something you eat with both hands and no conversation."},
   {"t":"img","src":"menu-birria.jpg",
    "x":"Slow-cooked birria meat pulled apart in its broth at Taco Taco Mexican Restaurant in "
        "Belmopan Belize"},
   {"t":"p","x":"That is the entire idea, and it is why birria has travelled the way it has."},

   {"t":"h","x":"Start With The Tacos"},
   {"t":"p","x":"If you have never had birria before, start here."},
   {"t":"p","x":"A single **birria taco is $6**, so you can try one without committing. An "
                "**order of four is $24**. If you would rather make a meal of it, the **Birria "
                "Tacos Plato Combo at $22** brings two birria tacos with a side of rice and "
                "beans, served with a consomé."},
   {"t":"p","x":"The plato combo is the one to order if you want to understand the dish "
                "properly, because the rice and beans give the consomé somewhere else to go "
                "once the tacos are gone."},

   {"t":"h","x":"Birria Ramen, The One People Photograph"},
   {"t":"p","x":"**Birria Ramen is $16**: noodles, birria broth and meat, served with onions "
                "and cilantro."},
   {"t":"p","x":"This is the dish that stops people mid-scroll. The broth that normally sits in "
                "a cup on the side becomes the whole bowl, the noodles soak in it, and the meat "
                "goes in on top. It should not work as neatly as it does."},
   {"t":"img","src":"menu-birria-ramen.jpg",
    "x":"Birria ramen at Taco Taco Belmopan, noodles lifted from a bowl of birria broth with "
        "onions and cilantro"},
   {"t":"p","x":"If you want the broth without the noodles, **Birria Soup is also $16**: birria "
                "broth and meat, served with corn tortillas."},

   {"t":"h","x":"Birria Pizza"},
   {"t":"p","x":"**Birria Pizza, $25.** Two large tortillas stuffed with birria meat, cheese, "
                "onion and cilantro, served with consomé and salsa."},
   {"t":"img","src":"menu-birria-pizza.jpg",
    "x":"Birria pizza at Taco Taco Belmopan, two large tortillas stuffed with birria meat and "
        "cheese, cut into wedges and served with consomé"},
   {"t":"p","x":"It comes cut into wedges, which makes it the obvious thing to put in the "
                "middle of a table when nobody can agree on an order."},

   {"t":"h","x":"Burritos And Quesadillas"},
   {"t":"p","x":"Two more ways in, and both are **$16**: **Two Birria Burritos**, or **Two "
                "Birria Quesadillas**. Two to an order, so they share without anybody having to "
                "be generous about it."},
   {"t":"img","src":"menu-birria-quesadillas.jpg",
    "x":"Two birria quesadillas on a plate with a cup of consomé at Taco Taco Mexican "
        "Restaurant in Belmopan"},

   {"t":"h","x":"Or Put Birria On Something Else"},
   {"t":"p","x":"Birria is also a meat choice in its own right. Anywhere the menu says *meat of "
                "your choice*, you can **add $1 and make it birria**."},
   {"t":"p","x":"Burritos, tortas, taco bowls, chimichangas, nachos, carne asada fries. If it "
                "takes a meat, it takes birria."},

   {"t":"h","x":"If You Want All Of It"},
   {"t":"p","x":"Two of our current deals are built entirely around it."},
   {"t":"p","x":"**The Birria Promotion is $100**, and it is close to the whole list in one order: "
                "two birria quesadillas, two birria burritos, a birria ramen, an order of four "
                "birria tacos and a birria pizza, with four Cokes on the house."},
   {"t":"p","x":"**Sunday Funday is $50** for eight birria tacos, with a dessert on the house "
                "alongside them: tres leches, cinnamon rolls or chocoflan."},
   {"t":"cta","x":"See The Birria Deals","href":"deals-combos.html"},

   {"t":"h","x":"One Thing Worth Knowing"},
   {"t":"p","x":"Birria orders come with birria or carnitas pork, and no other meats. It is the "
                "one part of the menu that does not open all the way up, and that is on "
                "purpose: those two are what belong in the broth."},
   {"t":"social"},

   {"t":"h","x":"Come And Dip Something"},
   {"t":"p","x":"We are at **11 Aloe Vera Ave., West Belmopan**, open **Monday to Thursday from "
                "10AM** and **Friday to Sunday from 8AM**, until 8PM every day."},
   {"t":"p","x":"Order online and send it straight to us on WhatsApp, or come and sit down and "
                "let the consomé arrive hot."},
   {"t":"kicker","x":"Dip it. That is the whole instruction."},
   {"t":"cta","x":"Start Your Order","href":"menu.html"},
  ],
 },
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
