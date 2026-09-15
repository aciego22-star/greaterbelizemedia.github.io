# -*- coding: utf-8 -*-
"""Deals & Combos data, transcribed from the flyers.

Every user-visible string sits in this file so the Spanish pass can translate one
place. `wa` lines are what the restaurant receives: real food and the customer's
choices, never the flyer or its filename. {id} is replaced by the selection;
a line whose placeholders are all empty is dropped.
"""

LUNCH_DRINKS = ["Watermelon", "Horchata", "Sorrel", "Lime", "Orange Juice",
                "Cucumber & Lime", "Pineapple", "Coke", "Ginger Ale"]
MEGA_DRINKS  = ["Watermelon", "Lime", "Orange", "Horchata", "Sorrel", "Mango",
                "Pineapple", "Dragon Fruit Lime", "Cucumber Lime"]
DESSERTS     = ["Chocoflan", "Tres Leches", "Cinnamon Rolls", "Bread Pudding"]
FILLINGS     = ["Birria", "Chicken", "Beef", "Pork"]
LUNCH_MEATS  = ["Al Pastor", "Carnitas", "Carne Asada", "Chicken"]

# Which four appear in the home page carousel, in order. Reorder or swap ids here.
FEATURED = ["any-2-for-15", "mega-combo", "grande-burrito", "birria-quesadillas"]

DEALS = [
 {
  "id": "any-2-for-15", "flyer": "flyer-any2.jpg", "price": 15,
  "title": "Any 2 for $15 + Free Coke",
  "desc": "Pick two Taco Taco favourites and make it a combo. Choose from burritos or "
          "quesadillas with your preferred filling, and enjoy a complimentary Coke with the deal.",
  "choices": [
    {"id":"item1","label":"First item","options":["Burrito","Quesadilla"]},
    {"id":"meat1","label":"First item filling","options":FILLINGS},
    {"id":"item2","label":"Second item","options":["Burrito","Quesadilla"]},
    {"id":"meat2","label":"Second item filling","options":FILLINGS},
  ],
  "wa": ["1 {meat1} {item1}", "1 {meat2} {item2}", "Free Coke"],
 },
 {
  "id": "mega-combo", "flyer": "flyer-mega.jpg", "price": 100,
  "title": "Mega Combo",
  "desc": "A serious Taco Taco spread made for sharing. Tacos, birria, flautas, Mexican hot "
          "dogs and fries come together in one big combo, finished with your choice of drinks "
          "or drinks plus desserts.",
  "choices": [
    {"id":"tacoMeat","label":"Mexican Tacos meat","options":["Beef","Chicken","Al Pastor","Carnitas"]},
    {"id":"option","label":"Drinks, or drinks and desserts","type":"radio",
     "options":["4 Drinks","2 Drinks + 2 Desserts"]},
    {"id":"drinksA","label":"Choose 4 drinks","options":MEGA_DRINKS,"repeat":4,
     "showIf":{"choice":"option","equals":"4 Drinks"}},
    {"id":"drinksB","label":"Choose 2 drinks","options":MEGA_DRINKS,"repeat":2,
     "showIf":{"choice":"option","equals":"2 Drinks + 2 Desserts"}},
    {"id":"dessertsB","label":"Choose 2 desserts","options":DESSERTS,"repeat":2,
     "showIf":{"choice":"option","equals":"2 Drinks + 2 Desserts"}},
  ],
  "wa": ["1 order Mexican Tacos (4) - {tacoMeat}", "1 order Birria Tacos (4)",
         "1 order Pork Flautas (6)", "2 Mexican Hot Dogs", "1 order Fries",
         "Drink/Dessert Option: {option}", "Drinks: {drinksA}{drinksB}",
         "Desserts: {dessertsB}"],
 },
 {
  "id": "taco-tuesday", "flyer": "flyer-tuesday.jpg", "day": "Tuesday",
  "title": "Taco Tuesday Special",
  "desc": "Tuesday calls for tacos. Choose Taco Taco's Mexican Tacos or go for rich, cheesy "
          "Birria Tacos at a special Tuesday price.",
  "choices": [
    {"id":"variant","label":"Choose your tacos","type":"radio","priced":True,
     "options":[{"label":"Mexican Tacos (4)","price":18},{"label":"Birria Tacos (4)","price":22}]},
  ],
  "wa": ["{variant}"],
 },
 {
  "id": "grande-burrito", "flyer": "flyer-burrito.jpg", "price": 22,
  "title": "Grande Mexican Burrito Lunch Combo",
  "desc": "A hearty Grande Mexican Burrito served with small fries and a small drink, an easy "
          "all-in-one lunch for serious appetites.",
  "choices": [
    {"id":"burrito","label":"Burrito","options":["Carne Asada","Carnitas","Al Pastor","Pollo"]},
    {"id":"drink","label":"Small drink","options":LUNCH_DRINKS},
  ],
  "wa": ["Burrito: {burrito}", "Small Fries", "Small Drink: {drink}"],
 },
 {
  "id": "pork-flautas", "flyer": "flyer-flautas.jpg", "price": 20,
  "title": "Pork Flautas Lunch Combo",
  "desc": "Crispy pork flautas loaded with Taco Taco flavour and paired with a refreshing small "
          "drink for a simple, satisfying lunch combo.",
  "note": "No fries included",
  "choices": [{"id":"drink","label":"Small drink","options":LUNCH_DRINKS}],
  "wa": ["Pork Flautas", "Small Drink: {drink}", "No fries included"],
 },
 {
  "id": "mexican-hotdog", "flyer": "flyer-hotdog.jpg", "price": 22,
  "title": "Mexican Hot Dog Lunch Combo",
  "desc": "A loaded Mexican Hot Dog topped with your choice of meat, served with small fries and "
          "a small drink for a bold Taco Taco lunch.",
  "choices": [
    {"id":"meat","label":"Meat","options":LUNCH_MEATS},
    {"id":"drink","label":"Small drink","options":LUNCH_DRINKS},
  ],
  "wa": ["Mexican Hot Dog: {meat}", "Small Fries", "Small Drink: {drink}"],
 },
 {
  "id": "tostadas", "flyer": "flyer-tostadas.jpg", "price": 20,
  "title": "Tostadas Lunch Combo",
  "desc": "Three crisp tostadas piled with your choice of seasoned meat and fresh toppings, "
          "paired with a small drink.",
  "choices": [
    {"id":"meat","label":"Meat","options":LUNCH_MEATS},
    {"id":"drink","label":"Small drink","options":LUNCH_DRINKS},
  ],
  "wa": ["3 Tostadas: {meat}", "Small Drink: {drink}"],
 },
 {
  "id": "birria-quesadillas", "flyer": "flyer-quesadillas.jpg", "price": 22,
  "title": "Birria Quesadillas Lunch Combo",
  "desc": "Golden, cheesy birria quesadillas served with rich dipping consomme, small fries and "
          "a refreshing small drink.",
  "choices": [
    {"id":"meat","label":"Meat","options":["Beef","Pork"]},
    {"id":"drink","label":"Small drink","options":LUNCH_DRINKS},
  ],
  "wa": ["Birria Quesadillas: {meat}", "Consomme", "Small Fries", "Small Drink: {drink}"],
 },
 {
  "id": "monday-specials", "flyer": "flyer-monday.jpg", "day": "Monday",
  "title": "Monday Specials",
  "desc": "Start the week Taco Taco style with Monday-only specials on Mexican Tacos and cheesy "
          "Quesabirria Tacos.",
  "choices": [
    {"id":"variant","label":"Choose your special","type":"radio","priced":True,
     "options":[{"label":"4 Mexican Tacos","price":18},{"label":"4 Quesabirria Tacos","price":22}]},
    {"id":"meat","label":"Tacos meat","options":["Chicken","Beef"],
     "showIf":{"choice":"variant","equals":"4 Mexican Tacos"}},
  ],
  "wa": ["{variant}", "Meat: {meat}"],
 },
]

# UI copy, kept together so the Spanish pass has a single table to translate.
STR = {
 "section_title":  "Deals & Combos",
 "section_kicker": "Limited Time",
 "section_sub":    "Combos built for sharing, and lunch deals that get you in and out.",
 "view_all":       "View All Deals",
 "page_sub":       "Every current Taco Taco offer. Pick your options and send it straight to WhatsApp.",
 "choose":         "Choose your options",
 "add":            "Add To Basket",
 "added":          "Added",
 "from":           "from",
 "pick_one":       "Please choose",
 "prev":           "Previous deal",
 "next":           "Next deal",
 "only_on":        "%s only",
}
