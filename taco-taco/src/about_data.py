# -*- coding: utf-8 -*-
"""The About section, in both languages.

The English is the client's supplied copy, used word for word. The Spanish sits
beside it so the language pass is a template change rather than a rewrite.

Nothing on the site switches language yet: there is no toggle, and the pages are
still served as lang="en". The "es" strings here are ready for the day that goes
in, the same way deals_data, reviews_data and blog_data are.
"""

ABOUT = {
 "kicker": {
   "en": "About Us",
   "es": "Sobre nosotros"},

 "title_a": {
   "en": "Authentic Mexicali Flavor,",
   "es": "Auténtico sabor mexicali,"},
 "title_b": {
   "en": "Made Fresh in Belmopan",
   "es": "hecho fresco en Belmopán"},

 "lead": [
  {"en": "At Taco Taco Mexican Restaurant, we bring the bold, comforting flavors of "
         "Mexicali-style cooking to West Belmopan. From tacos and birria to burritos, "
         "quesadillas, breakfast favorites and more, our menu is built around fresh "
         "preparation, generous portions and food made to satisfy.",
   "es": "En Taco Taco Mexican Restaurant traemos los sabores intensos y reconfortantes "
         "de la cocina estilo mexicali al oeste de Belmopán. Desde tacos y birria hasta "
         "burritos, quesadillas, desayunos y mucho más, nuestro menú se basa en "
         "preparación fresca, porciones generosas y comida que satisface."},
  {"en": "Whether you are stopping in for breakfast, grabbing lunch, feeding the family "
         "or ordering your favorites to go, Taco Taco is all about good food, bold "
         "flavor and a welcoming experience.",
   "es": "Ya sea que venga a desayunar, pase por el almuerzo, alimente a la familia o "
         "pida sus favoritos para llevar, Taco Taco se trata de buena comida, sabor "
         "intenso y un ambiente acogedor."},
 ],

 "image_alt": {
   "en": "A spread of Taco Taco baskets: nachos, loaded fries, flautas, birria tacos, "
         "quesadillas and Mexican pizza",
   "es": "Una selección de canastas de Taco Taco: nachos, papas cargadas, flautas, "
         "tacos de birria, quesadillas y pizza mexicana"},

 # icon keys map to the drawn marks in build_site.ABOUT_ICONS
 "points": [
  {"icon": "flame",
   "title": {"en": "Made Fresh", "es": "Hecho fresco"},
   "body":  {"en": "Freshly prepared tortillas, grilled meats, salsas, toppings and sides "
                   "come together to create meals packed with flavor.",
             "es": "Tortillas recién preparadas, carnes a la parrilla, salsas, complementos "
                   "y guarniciones se unen para crear platillos llenos de sabor."}},
  {"icon": "chili",
   "title": {"en": "Bold Mexicali Flavor", "es": "Sabor mexicali intenso"},
   "body":  {"en": "From classic Mexican tacos to birria, quesadillas, burritos and house "
                   "favorites, every plate brings something worth coming back for.",
             "es": "Desde tacos mexicanos clásicos hasta birria, quesadillas, burritos y las "
                   "especialidades de la casa, cada plato trae algo por lo que vale la pena volver."}},
  {"icon": "bag",
   "title": {"en": "Dine In · Takeout · Delivery",
             "es": "Para comer aquí · Para llevar · A domicilio"},
   "body":  {"en": "Enjoy Taco Taco your way. Dine with us in West Belmopan, pick up your "
                   "order, or have your favorites delivered straight to your door.",
             "es": "Disfrute Taco Taco a su manera. Coma con nosotros en el oeste de Belmopán, "
                   "recoja su pedido o reciba sus favoritos en la puerta de su casa."}},
 ],

 "cta_menu": {"en": "Explore Our Menu", "es": "Explore nuestro menú"},
 "cta_wa":   {"en": "Order on WhatsApp", "es": "Pida por WhatsApp"},
}
