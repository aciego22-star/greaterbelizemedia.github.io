# -*- coding: utf-8 -*-
"""The menu, transcribed from the restaurant's own printed menu.

Every user-visible string lives here so the Spanish pass is one file to
translate rather than a re-cut of the page.

Item fields:
  name    what the guest reads and what the kitchen receives on WhatsApp
  desc    optional one-line description
  price   number in Belize dollars; omit for a listing with no price of its own
  each    True renders "$6 ea" instead of "$6"
  meat    True gives the item the standard meat chooser
  options an explicit chooser list, for the breakfast plates that offer
          bacon or ham rather than the taco meats

Spelling in the printed menu has been tidied where it is plainly a typo
(oinions, gorund, freid, deeo, calupas, suace, noddles, scrabled, torilla,
pankcake, garnde, cornchipps, pull pork). Nothing about an item, a price or a
portion has been changed, added or guessed. Where the printed menu does not
say how many come in an order, neither does this file.
"""

MEATS = ["Carne Asada", "Pollo Asado", "Carnitas", "Al Pastor", "Birria"]
# The printed menu prices birria a dollar above the other meats.
MEAT_SURCHARGE = {"Birria": 1}
BREAKFAST_MEATS = ["Bacon", "Ham"]

INTRO = {
 "kicker": "Bold Flavor · Authentic Mexican Style",
 "title_a": "The",
 "title_b": "Menu",
 "sub": "Mexican style food made fresh in Belmopan. Prices in Belize dollars (BZD).",
 "note": "Meat choices for tacos, burritos, plates and bowls: Carne Asada, Pollo Asado, "
         "Carnitas and Al Pastor. Birria is available on any of them for $1 more.",
 "hint": "Tap Add on any item to build your order, then send it to us on WhatsApp to confirm.",
 "full": "View Full Menu",
 "basket": "View Your Basket",
 "choose_meat": "Choose meat for %s",
}

CATEGORIES = [
 {"name": "Meat Options",
  "sub": "Choose your meat for tacos, burritos, plates and more",
  "items": [
   {"name": "Carne Asada", "desc": "Grilled beef"},
   {"name": "Pollo Asado", "desc": "Grilled chicken"},
   {"name": "Carnitas",    "desc": "Pork"},
   {"name": "Al Pastor",   "desc": "Pork"},
   {"name": "Birria",      "desc": "Add $1 to any item"},
  ]},

 {"name": "Burritos", "items": [
   {"name": "Mexican Style Burrito", "price": 16, "meat": True,
    "desc": "Flour tortilla, meat of your choice, rice, beans, pico de gallo, sour cream and cheese"},
   {"name": "California Style Burrito", "price": 18, "meat": True,
    "desc": "Flour tortilla, guacamole, fries, meat of your choice, pico de gallo, sour cream and cheese"},
   {"name": "Burrito de Mojado", "price": 20, "meat": True,
    "desc": "Flour tortilla, meat of your choice, rice, beans, pico de gallo, sour cream and cheese, "
            "topped with salsa roja"},
  ]},

 {"name": "Mexican Tacos",
  "note": "2 corn tortillas or 1 flour tortilla, meat of your choice, onions, cilantro, "
         "guac sauce and salsa",
  "items": [
   {"name": "1 Corn Taco",  "price": 5,  "meat": True},
   {"name": "1 Flour Taco", "price": 6,  "meat": True},
   {"name": "Order of Tacos (4)", "price": 20, "meat": True},
   {"name": "Order of Flour Tacos (4)", "price": 24, "meat": True},
  ]},

 {"name": "Flautas", "items": [
   {"name": "Order of Flautas", "price": 15,
    "desc": "6 rolled up corn tortillas filled with carnitas pulled pork, topped with lettuce, "
            "pico de gallo, cheese, sour cream and guac sauce"},
  ]},

 {"name": "Menudo Soup",
  "note": "Traditional Mexican soup made with tender beef tripe, cow foot and pig feet in a rich "
         "red chili broth, served with your choice of tortillas or bread",
  "items": [
   {"name": "Menudo Soup, Small", "price": 15},
   {"name": "Menudo Soup, Large", "price": 25},
  ]},

 {"name": "Tortas", "items": [
   {"name": "Regular Torta", "price": 20, "meat": True,
    "desc": "Telera bread, beans, meat of your choice, pico de gallo, lettuce and cheese, "
            "served with fries"},
   # Not on the printed menu we transcribed. Added on the restaurant's word,
   # 19 September 2026, with the price and the fillings as they gave them.
   {"name": "Torta del Rey", "price": 30, "meat": True,
    "desc": "Bread, meat of your choice, beans, lettuce, bacon, sausage, egg, pico de gallo, "
            "sour cream and guacamole sauce, served with fries and a fried jalapeno"},
  ]},

 {"name": "Plato Combos", "items": [
   {"name": "Two Mexican Tacos Plato Combo", "price": 20, "meat": True,
    "desc": "Two tacos, meat of your choice, served with a side of rice and beans"},
   {"name": "Carne Plato Combo", "price": 25, "meat": True,
    "desc": "Meat of your choice, served with rice, beans, pico de gallo salad and corn tortillas"},
   {"name": "Fajitas Plato Combo", "price": 25,
    "desc": "Fajitas beef meat with onions and sweet peppers, served with rice, beans and tortillas"},
  ]},

 {"name": "Beef Burgers", "items": [
   # Description corrected on the restaurant's word, 19 September 2026. The
   # transcription from the printed menu listed bacon; it does not come with
   # bacon, the patty is house made and the onions are grilled.
   {"name": "Burger", "price": 25,
    "desc": "Burger bread stuffed with a homemade beef patty, cheese, lettuce, tomato, "
            "grilled onions, mayo, ketchup and mustard, served with fries"},
  ]},

 {"name": "Nachos", "items": [
   {"name": "Nachos", "price": 25, "meat": True,
    "desc": "Corn chips topped with meat of your choice, cheese, beans, pico de gallo, "
            "sour cream and guac sauce"},
  ]},

 {"name": "Mexican Hot Dog", "items": [
   {"name": "Mexican Hot Dog", "price": 18,
    "desc": "Hot dog bread, sausage wrapped in bacon, topped with onions and sweet peppers, "
            "mayo, ketchup and mustard, served with fries"},
  ]},

 {"name": "Birria", "items": [
   {"name": "1 Birria Taco", "price": 6},
   {"name": "Order of Birria Tacos (4)", "price": 24},
   {"name": "Birria Tacos Plato Combo", "price": 22,
    "desc": "Two birria tacos with a side of rice and beans, served with a consomé"},
   {"name": "Birria Pizza", "price": 25,
    "desc": "Two large tortillas stuffed with birria meat, cheese, onion and cilantro, "
            "served with consomé and salsa"},
   {"name": "Birria Ramen", "price": 16,
    "desc": "Noodles, birria broth and meat, served with onions and cilantro"},
   {"name": "Birria Soup", "price": 16,
    "desc": "Birria broth and meat, served with corn tortillas"},
   {"name": "Two Birria Burritos", "price": 16},
   {"name": "Two Birria Quesadillas", "price": 16},
  ]},

 {"name": "Carne Asada Fries", "items": [
   {"name": "Carne Asada Fries", "price": 25,
    "desc": "Loaded fries with carne asada meat, pico de gallo, cheese, sour cream and guac sauce"},
  ]},

 {"name": "Mexican Pizza", "items": [
   {"name": "Mexican Pizza", "price": 25,
    "desc": "Two large tortillas stuffed with ground beef, topped with a homemade tomato sauce "
            "and cheese, served with sour cream"},
  ]},

 {"name": "Taco Bowls", "items": [
   {"name": "Taco Bowl Grande", "price": 25, "meat": True,
    "desc": "Large deep fried tortilla bowl filled with rice, beans, meat of your choice, "
            "pico de gallo, cheese, sour cream and guac sauce"},
   {"name": "Mini Taco Bowl", "price": 6, "each": True, "meat": True,
    "desc": "Mini deep fried tortillas filled with beans, meat of your choice, lettuce, "
            "pico de gallo, cheese, sour cream and guac sauce"},
   {"name": "Order of Mini Taco Bowls (4)", "price": 24, "meat": True},
  ]},

 {"name": "Chimichanga", "items": [
   {"name": "Chimichanga", "price": 18, "meat": True,
    "desc": "Deep fried burrito filled with rice, beans, meat of your choice, pico de gallo, "
            "sour cream, cheese and guac sauce, served with a lettuce salad"},
   {"name": "Mini Chimichanga Plato Combo", "price": 25, "meat": True,
    "desc": "Two mini size chimichangas filled with meat of your choice, served with rice and beans"},
  ]},

 {"name": "Mexican Quesadilla", "items": [
   {"name": "Mexican Quesadilla", "price": 20, "meat": True,
    "desc": "A large tortilla filled with meat of your choice, cheese and pico de gallo, "
            "served with sour cream"},
  ]},

 {"name": "Crunch Wrap", "items": [
   {"name": "Crunch Wrap", "price": 15,
    "desc": "Flour tortilla filled with beans, ground beef, nacho cheese, lettuce and pico de gallo, "
            "hardshell tortilla wrapped and grilled, served with sour cream and our crunch wrap sauce"},
  ]},

 {"name": "Tostadas",
  "note": "Hard corn tortilla topped with beans, meat of your choice, lettuce, pico de gallo, "
         "cheese, sour cream, guac sauce and salsa",
  "items": [
   {"name": "1 Tostada", "price": 6, "meat": True},
   {"name": "Order of Tostadas (4)", "price": 24, "meat": True},
  ]},

 {"name": "Hardshell Tacos", "items": [
   {"name": "1 Hardshell Taco", "price": 6,
    "desc": "Deep fried corn hard shells filled with ground beef, lettuce, cheese and sour cream"},
   {"name": "Order of Hardshell Tacos", "price": 24},
   {"name": "1 Mexican Chalupa", "price": 7,
    "desc": "Deep fried flour shells filled with ground beef, lettuce, pico de gallo, cheese "
            "and sour cream"},
   {"name": "Order of Mexican Chalupas", "price": 28},
  ]},

 {"name": "Breakfast", "sub": "Served all day", "items": [
   {"name": "Waffle or Pancake Breakfast", "price": 18, "options": BREAKFAST_MEATS,
    "desc": "Waffles or pancakes with eggs, ham or bacon. Hard, medium, soft or scrambled eggs"},
   {"name": "Fry Jack Breakfast", "price": 22, "options": BREAKFAST_MEATS,
    "desc": "Fry jacks served with two eggs, a side of beans and two ham or bacon"},
   {"name": "Pancakes or Waffle Only", "price": 10},
   {"name": "Waffle or Pancake Sandwich", "price": 12, "options": BREAKFAST_MEATS,
    "desc": "Two mini waffles or two mini pancakes filled with a fried egg, cheese, and bacon or ham. "
            "Hard, medium or soft egg"},
   {"name": "Huevos Mexicano", "price": 18,
    "desc": "Scrambled eggs with tomato and sweet pepper, a side of beans, served with corn or "
            "flour tortillas or toast bread"},
   {"name": "Huevos Rancheros", "price": 18,
    "desc": "Two hardshell tortillas topped with beans, eggs, tomato sauce, cheese and sour cream, "
            "served with rice and beans, or three hardshell tortillas topped with beans, eggs, "
            "tomato sauce, sour cream and cheese only. Choice of hard, medium or soft eggs"},
   {"name": "Chilaquiles", "price": 18,
    "desc": "Corn chips mixed with salsa roja sauce, topped with two eggs, beans, onion and cilantro, "
            "cheese and sour cream"},
   {"name": "Breakfast Burrito", "price": 16, "options": ["Bacon", "Chorizo", "Ham"],
    "desc": "Large flour tortilla filled with fries, beans, eggs and meat"},
   {"name": "Omelette", "price": 18, "options": BREAKFAST_MEATS,
    "desc": "Scrambled eggs filled with cheese and meat, topped with a homemade tomato sauce "
            "and cheese, served with tortilla or toast bread"},
  ]},

 {"name": "Extras / Sides", "items": [
   {"name": "Fries", "price": 5},
   {"name": "Guacamole and Chips", "price": 8},
   {"name": "Salsa and Chips", "price": 8},
   {"name": "Beans", "price": 4},
   {"name": "Rice", "price": 4},
   {"name": "Salsa", "price": 4},
   {"name": "Sour Cream", "price": 4},
   {"name": "Guacamole Sauce", "price": 4},
   {"name": "Pico de Gallo", "price": 4},
  ]},

 {"name": "Desserts", "sub": "Ask what is available", "items": [
   {"name": "Chocoflan", "price": 12},
   {"name": "Cheesecake", "price": 14, "desc": "Ask your waiter what flavors are available"},
   {"name": "Tres Leches", "price": 12},
   {"name": "Cookies", "price": 5},
   {"name": "Cinnamon Rolls", "price": 12},
   {"name": "Order of Churros", "price": 12},
  ]},

 {"name": "Drinks", "items": [
   {"name": "Fresh Natural Juice", "price": 8, "desc": "Ask availability of flavors"},
   {"name": "Soft Drinks", "price": 3, "desc": "Coke and ginger ale"},
   {"name": "Water", "price": 2},
   {"name": "Soda Water", "price": 3},
   {"name": "Sweet Tea", "price": 10},
   {"name": "Frappé", "price": 12, "desc": "Coffee or chocolate"},
  ]},

 {"name": "Breakfast Drinks", "items": [
   {"name": "Hot Coffee", "price": 6},
   {"name": "Hot Tea", "price": 6},
   {"name": "Natural Juice", "price": 8, "desc": "Ask your waiter what is in stock"},
   {"name": "Sweet Tea, Breakfast", "price": 12},
   {"name": "Iced Coffee", "price": 12},
  ]},

 {"name": "Beers", "items": [
   {"name": "Belikin Beer", "price": 5},
   {"name": "Belikin Stout", "price": 5},
   {"name": "Lighthouse", "price": 5},
   {"name": "Guinness Stout", "price": 6},
   {"name": "Landshark", "price": 6},
   {"name": "Ova Drive", "price": 7},
   {"name": "Red Stripe", "price": 7},
   {"name": "Heineken", "price": 8},
  ]},
]
