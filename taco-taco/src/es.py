# -*- coding: utf-8 -*-
"""Spanish for every word on the site, keyed by the English it replaces.

The builder renders the site in English, then walks the finished pages and
swaps each run of text and each reader-facing attribute for its entry here.
Anything it cannot find is reported by name at the end of the build and the
build stops, so a page can never ship half translated.

Three kinds of string are deliberately left in English:

  Item names as the kitchen receives them. A guest reading the Spanish page
  sees "Burrito Estilo Mexicano", and that is what the basket shows, but the
  order that arrives on WhatsApp says "Mexican Style Burrito", because that is
  what is printed on the menu behind the counter. The name a customer reads
  and the name the kitchen matches are two different jobs.

  Proper nouns. The brand lockup, the reviewers' names, the beer labels and
  the agency credit are names, not words.

  The dish names that are already Spanish. Birria, carnitas, al pastor, pico
  de gallo, consome and the rest are what they are called in both languages.

Reviews carry a translation the customers did not write, so the Spanish page
labels them as translated rather than passing them off as their own words.
"""

# Strings that are built from a name at run time. Keeping them as patterns
# means one line here instead of fifty near-identical dictionary entries, and
# the name inside is translated on its own.
PATTERNS = [
 (r"^(?P<x>Monday|Tuesday) only$", "Solo los {x}"),
 (r"^%s only$",                    "Solo los %s"),
 (r"^View photo of (?P<x>.+)$",   "Ver foto de {x}"),
 (r"^Choose meat for (?P<x>.+)$", "Elija la carne para {x}"),
 (r"^Watch: (?P<x>.+)$",          "Ver: {x}"),
 (r"^(?P<x>.+) offer$",           "Oferta: {x}"),
 (r"^Deal (?P<n>\d+)$",           "Oferta {n}"),
 (r"^(?P<n>[\d.]+) out of 5$",    "{n} de 5"),
 (r"^(?P<x>Choose \d+ (?:drinks|desserts)) (?P<n>\d+)$", "{x} {n}"),
 (r"^from \$(?P<n>\d+)$",         "desde ${n}"),
 (r"^\$(?P<n>\d+) ea$",           "${n} c/u"),
 (r"^(?P<n>\d+) items?$",         "{n} artículos"),
]

# Names that stay as they are: brands, people and the Spanish dish words.
KEEP = {
 "Taco Taco Mexican Restaurant", "Taco Taco", "Mexican Restaurant", "Taco",
 "Austere Automations", "Facebook", "Instagram", "Tiktok", "TikTok",
 # the address is the address, in either language
 "11 Aloe Vera Ave, West Belmopan", "11 Aloe Vera Ave, West Belmopan, Belize",
 "11 Aloe Vera Ave., West Belmopan",
 "connect.tacotaco.bz", "Taco Taco Connect",
 "Belikin Beer", "Belikin Stout", "Lighthouse", "Guinness Stout", "Landshark",
 "Ova Drive", "Red Stripe", "Heineken", "Coke", "Ginger Ale",
 "Carne Asada", "Pollo Asado", "Carnitas", "Al Pastor", "Birria", "Horchata",
 "Chocoflan", "Tres Leches", "Chorizo", "Pico de Gallo", "Menudo Soup",
 "Klerysa Heredia", "Melisa Alvarenga", "Jesus Ortega", "Isridio Hernandez",
 "Hector Tiul", "David Funez", "Hern Mar", "Garden Tree Apt", "John Dunn",
 "K. Jevon .D", "Mexicali", "Top", "Info",
}

ES = {}

# ---------------------------------------------------------------- chrome
ES.update({
 # navigation and header
 "Home": "Inicio",
 "Menu": "Menú",
 "Deals": "Ofertas",
 "Gallery": "Galería",
 "Blog": "Blog",
 "Reviews": "Reseñas",
 "About": "Nosotros",
 "About Us": "Sobre nosotros",
 "Contact": "Contacto",
 "Order Online": "Ordene en línea",
 "Browse": "Explorar",
 "Browse the menu": "Vea el menú",
 "Browse the menu, tap": "Vea el menú, toque",
 "Location": "Ubicación",
 "Call": "Llame",
 "Open Daily": "Abierto todos los días",
 "Service": "Servicio",
 "Address": "Dirección",
 "Hours": "Horario",
 "Visit / Contact": "Visítenos / Contáctenos",
 "Info": "Datos",
 "Top": "Arriba",
 "Back to top": "Volver arriba",
 "Close": "Cerrar",
 "View": "Ver",
 "At": "En",

 # hours and service, in both the long and the short form
 "Mon to Thu 10AM to 8PM": "Lun a Jue 10AM a 8PM",
 "Fri to Sun 8AM to 8PM": "Vie a Dom 8AM a 8PM",
 "Mon to Thu: 10:00 AM to 8:00 PM": "Lun a Jue: 10:00 AM a 8:00 PM",
 "Fri to Sun: 8:00 AM to 8:00 PM": "Vie a Dom: 8:00 AM a 8:00 PM",
 "Dine-In · Takeout · Delivery · Family Friendly":
   "Para comer aquí · Para llevar · A domicilio · Ambiente familiar",
 "Dine-In · Takeout · Delivery": "Para comer aquí · Para llevar · A domicilio",
 "Dine In · Takeout · Delivery": "Para comer aquí · Para llevar · A domicilio",

 # hero and the ribbons that run across it
 "Order Authentic": "Ordene auténtico",
 "l1:Order Authentic": "Ordene auténticos",
 "l2:Mexicali": "tacos",
 "l3:Style Tacos": "estilo mexicali",
 "Style Tacos": "Tacos Estilo",
 "deco:Style Tacos": "Tacos Estilo",
 "Mexicali": "Mexicali",
 "Authentic Mexicali style tacos in Belmopan. Made fresh, made for you.":
   "Tacos auténticos estilo mexicali en Belmopán. Hechos frescos, hechos para usted.",
 "View Menu": "Ver el menú",
 "Now taking orders online": "Ahora tomamos pedidos en línea",
 "Come Hungry · Leave Happy": "Venga con hambre · Salga feliz",
 "AUTHENTIC MEXICALI STYLE •": "AUTÉNTICO ESTILO MEXICALI •",
 "MADE FRESH DAILY • MADE FRESH DAILY •":
   "HECHO FRESCO A DIARIO • HECHO FRESCO A DIARIO •",
 "Bold Flavor. Authentic Mexicali Style.  ·  Come Hungry. Leave Happy.":
   "Sabor intenso. Auténtico estilo mexicali.  ·  Venga con hambre. Salga feliz.",

 # section headings, including the two halves of each split title
 "Crowd": "Los favoritos",
 "Favorites": "de la casa",
 "deco:Favorites": "de la casa",
 "Featured Favorites": "Favoritos destacados",
 "A few of the dishes our Belmopan neighbors keep coming back for.":
   "Algunos de los platillos por los que nuestros vecinos de Belmopán siguen volviendo.",
 "Deals &": "Ofertas y",
 "Combos": "combos",
 "deco:Combos": "combos",
 "Limited Time": "Por tiempo limitado",
 "Combos built for sharing, and lunch deals that get you in and out.":
   "Combos hechos para compartir y ofertas de almuerzo que lo atienden rápido.",
 "View All Deals": "Ver todas las ofertas",
 "See What Our": "Vea lo que dicen",
 "Customers Are Saying": "nuestros clientes",
 "deco:Customers Are Saying": "nuestros clientes",
 "Read The Reviews": "Lea las reseñas",
 "What Our": "Lo que dicen",
 "Customers Say": "nuestros clientes",
 "deco:Customers Say": "nuestros clientes",
 "Read Them On Google": "Léalas en Google",
 "Watch": "Video",
 "What Is": "Qué se está",
 "Cooking": "cocinando",
 "deco:Cooking": "cocinando",
 "In The": "En la",
 "Kitchen": "cocina",
 "deco:Kitchen": "cocina",
 "Touch play and see what is cooking in our kitchen, and what the staff and customers of Taco Taco are up to.":
   "Toque reproducir y vea qué se está cocinando en nuestra cocina, y qué hacen el personal y los clientes de Taco Taco.",
 "Straight from the restaurant. Turn the sound up.":
   "Directo del restaurante. Suba el volumen.",
 "Come": "Venga a",
 "Say Hello": "saludarnos",
 "deco:Say Hello": "saludarnos",
 "Find Us": "Encuéntrenos",
 "deco:Find Us": "encontrarnos",
 "Where To": "Dónde",
 "Open in Google Maps": "Abrir en Google Maps",
 "Map to Taco Taco Mexican Restaurant": "Mapa hacia Taco Taco Mexican Restaurant",
 "Real food, real plates, straight from Taco Taco.":
   "Comida real, platos reales, directo de Taco Taco.",
 "Page": "Página",
 "Not Found": "no encontrada",
 "deco:Not Found": "no encontrada",
 "That page has moved or never existed. The menu is still right here.":
   "Esa página se movió o nunca existió. El menú sigue aquí mismo.",
 "See The Menu": "Ver el menú",
 "Back Home": "Volver al inicio",

 # ordering, the basket and the WhatsApp hand-off
 "Order on WhatsApp": "Pida por WhatsApp",
 "Send on WhatsApp": "Enviar por WhatsApp",
 "Send Order via WhatsApp": "Enviar pedido por WhatsApp",
 "Start Your Order": "Comience su pedido",
 "Explore Our Menu": "Explore nuestro menú",
 "Add": "Agregar",
 "Add To Basket": "Agregar al carrito",
 "Added": "Agregado",
 "Clear": "Vaciar",
 "Total": "Total",
 "Your Basket": "Su carrito",
 "Your basket": "Su carrito",
 "Review your basket": "Revise su carrito",
 "Close basket": "Cerrar el carrito",
 "Open your basket to check items, quantities and total.":
   "Abra su carrito para revisar artículos, cantidades y total.",
 "View Your Basket": "Ver su carrito",
 "Choose your options": "Elija sus opciones",
 "Please choose...": "Por favor elija...",
 "Previous deal": "Oferta anterior",
 "Next deal": "Oferta siguiente",
 "Every current Taco Taco offer. Pick your options and send it straight to WhatsApp.":
   "Todas las ofertas vigentes de Taco Taco. Elija sus opciones y envíelas directo por WhatsApp.",
 "Tap \"Add\" on anything you like to build your basket.":
   "Toque \"Agregar\" en lo que quiera para armar su carrito.",
 "Tap \"Send Order via WhatsApp\" and we confirm pickup or delivery.":
   "Toque \"Enviar pedido por WhatsApp\" y confirmamos si lo recoge o se lo llevamos.",
 "to build your basket, then send your order straight to us on WhatsApp. Quick and simple, no app needed.":
   "para armar su carrito, y luego envíenos su pedido directo por WhatsApp. Rápido y sencillo, sin necesidad de otra aplicación.",
 "Prices in Belize dollars (BZD). We confirm your order and pickup or delivery options on WhatsApp.":
   "Precios en dólares beliceños (BZD). Confirmamos su pedido y las opciones de recoger o entrega por WhatsApp.",

 # footer
 "Created by": "Creado por",
 "© 2026 Taco Taco Mexican Restaurant. All rights reserved.":
   "© 2026 Taco Taco Mexican Restaurant. Todos los derechos reservados.",
 "Taco Taco Mexican Restaurant. Authentic Mexicali style food, made fresh daily.":
   "Taco Taco Mexican Restaurant. Comida auténtica estilo mexicali, hecha fresca a diario.",
 "Come see us": "Venga a vernos",
 "Download it instead": "Descárguelo en su lugar",
 "Your browser cannot play this clip.": "Su navegador no puede reproducir este video.",
})

# ---------------------------------------------------------------- the menu
ES.update({
 "Bold Flavor · Authentic Mexicali Style": "Sabor intenso · Auténtico estilo mexicali",
 "The": "El",
 "deco:Menu": "menú",
 "Mexican style food made fresh in Belmopan. Prices in Belize dollars (BZD).":
   "Comida estilo mexicano hecha fresca en Belmopán. Precios en dólares beliceños (BZD).",
 "Meat choices for tacos, burritos, plates and bowls: Carne Asada, Pollo Asado, Carnitas and Al Pastor. Birria is available on any of them for $1 more.":
   "Opciones de carne para tacos, burritos, platos y bowls: carne asada, pollo asado, carnitas y al pastor. La birria está disponible en cualquiera de ellos por $1 más.",
 "Tap Add on any item to build your order, then send it to us on WhatsApp to confirm.":
   "Toque Agregar en cualquier platillo para armar su pedido, y envíenoslo por WhatsApp para confirmar.",
 "View Full Menu": "Ver el menú completo",
 "Collapse Menu": "Ocultar el menú",
 "Menu categories": "Categorías del menú",

 # categories
 "Meat Options": "Opciones de carne",
 "Choose your meat for tacos, burritos, plates and more":
   "Elija su carne para tacos, burritos, platos y más",
 "Burritos": "Burritos",
 "Mexican Tacos": "Tacos mexicanos",
 "Flautas": "Flautas",
 "Menudo Soup": "Sopa de menudo",
 "Tortas": "Tortas",
 "Plato Combos": "Combos de plato",
 "Beef Burgers": "Hamburguesas de res",
 "Nachos": "Nachos",
 "Mexican Hot Dog": "Hot dog mexicano",
 "Birria": "Birria",
 "Carne Asada Fries": "Papas con carne asada",
 "Mexican Pizza": "Pizza mexicana",
 "Taco Bowls": "Taco bowls",
 "Chimichanga": "Chimichanga",
 "Mexican Quesadilla": "Quesadilla mexicana",
 "Crunch Wrap": "Crunch wrap",
 "Tostadas": "Tostadas",
 "Hardshell Tacos": "Tacos dorados",
 "Breakfast": "Desayuno",
 "Served all day": "Servido todo el día",
 "Extras / Sides": "Extras / Acompañamientos",
 "Desserts": "Postres",
 "Ask what is available": "Pregunte qué hay disponible",
 "Drinks": "Bebidas",
 "Breakfast Drinks": "Bebidas de desayuno",
 "Beers": "Cervezas",

 # meat chooser
 "Meat": "Carne",
 "Grilled beef": "Res a la parrilla",
 "Grilled chicken": "Pollo a la parrilla",
 "Pork": "Cerdo",
 "Beef": "Res",
 "Chicken": "Pollo",
 "Pollo": "Pollo",
 "Bacon": "Tocino",
 "Ham": "Jamón",
 "Add $1 to any item": "Agregue $1 a cualquier platillo",
 "Birria (+$1)": "Birria (+$1)",

 # item names: what the guest reads. The order the kitchen receives keeps the
 # English name from their own printed menu.
 "Mexican Style Burrito": "Burrito estilo mexicano",
 "California Style Burrito": "Burrito estilo California",
 "Burrito de Mojado": "Burrito de mojado",
 "1 Corn Taco": "1 taco de maíz",
 "1 Flour Taco": "1 taco de harina",
 "Order of Tacos (4)": "Orden de tacos (4)",
 "Order of Flour Tacos (4)": "Orden de tacos de harina (4)",
 "Order of Flautas": "Orden de flautas",
 "Menudo Soup, Small": "Sopa de menudo, pequeña",
 "Menudo Soup, Large": "Sopa de menudo, grande",
 "Regular Torta": "Torta regular",
 "Torta del Rey": "Torta del Rey",
 "Bread, meat of your choice, beans, lettuce, bacon, sausage, egg, pico de gallo, sour cream and guacamole sauce, served with fries and a fried jalapeno":
   "Pan, la carne de su elecci\u00f3n, frijoles, lechuga, tocino, salchicha, huevo, pico de gallo, crema y salsa de guacamole, servida con papas fritas y un jalape\u00f1o frito",
 "Two Mexican Tacos Plato Combo": "Combo de plato con dos tacos mexicanos",
 "Carne Plato Combo": "Combo de plato de carne",
 "Fajitas Plato Combo": "Combo de plato de fajitas",
 "Burger": "Hamburguesa",
 "1 Birria Taco": "1 taco de birria",
 "Order of Birria Tacos (4)": "Orden de tacos de birria (4)",
 "Birria Tacos Plato Combo": "Combo de plato de tacos de birria",
 "Birria Pizza": "Pizza de birria",
 "Birria Ramen": "Ramen de birria",
 "Birria Soup": "Sopa de birria",
 "Two Birria Burritos": "Dos burritos de birria",
 "Two Birria Quesadillas": "Dos quesadillas de birria",
 "Taco Bowl Grande": "Taco bowl grande",
 "Mini Taco Bowl": "Mini taco bowl",
 "Order of Mini Taco Bowls (4)": "Orden de mini taco bowls (4)",
 "Mini Chimichanga Plato Combo": "Combo de plato de mini chimichangas",
 "1 Tostada": "1 tostada",
 "Order of Tostadas (4)": "Orden de tostadas (4)",
 "1 Hardshell Taco": "1 taco dorado",
 "Order of Hardshell Tacos": "Orden de tacos dorados",
 "1 Mexican Chalupa": "1 chalupa mexicana",
 "Order of Mexican Chalupas": "Orden de chalupas mexicanas",
 "Waffle or Pancake Breakfast": "Desayuno de wafle o panqueques",
 "Fry Jack Breakfast": "Desayuno de fry jacks",
 "Pancakes or Waffle Only": "Solo panqueques o wafle",
 "Waffle or Pancake Sandwich": "Sándwich de wafle o panqueque",
 "Huevos Mexicano": "Huevos a la mexicana",
 "Huevos Rancheros": "Huevos rancheros",
 "Chilaquiles": "Chilaquiles",
 "Breakfast Burrito": "Burrito de desayuno",
 "Omelette": "Omelette",
 "Fries": "Papas fritas",
 "Guacamole and Chips": "Guacamole con totopos",
 "Salsa and Chips": "Salsa con totopos",
 "Beans": "Frijoles",
 "Rice": "Arroz",
 "Salsa": "Salsa",
 "Sour Cream": "Crema",
 "Guacamole Sauce": "Salsa de guacamole",
 "Cheesecake": "Pastel de queso",
 "Cookies": "Galletas",
 "Cinnamon Rolls": "Roles de canela",
 "Order of Churros": "Orden de churros",
 "Fresh Natural Juice": "Jugo natural fresco",
 "Soft Drinks": "Refrescos",
 "Water": "Agua",
 "Soda Water": "Agua mineral",
 "Sweet Tea": "Té dulce",
 "Frappé": "Frappé",
 "Hot Coffee": "Café caliente",
 "Hot Tea": "Té caliente",
 "Natural Juice": "Jugo natural",
 "Sweet Tea, Breakfast": "Té dulce, desayuno",
 "Iced Coffee": "Café helado",

 # item descriptions
 "Flour tortilla, meat of your choice, rice, beans, pico de gallo, sour cream and cheese":
   "Tortilla de harina, la carne de su elección, arroz, frijoles, pico de gallo, crema y queso",
 "Flour tortilla, guacamole, fries, meat of your choice, pico de gallo, sour cream and cheese":
   "Tortilla de harina, guacamole, papas fritas, la carne de su elección, pico de gallo, crema y queso",
 "Flour tortilla, meat of your choice, rice, beans, pico de gallo, sour cream and cheese, topped with salsa roja":
   "Tortilla de harina, la carne de su elección, arroz, frijoles, pico de gallo, crema y queso, bañado en salsa roja",
 "2 corn tortillas or 1 flour tortilla, meat of your choice, onions, cilantro, guac sauce and salsa":
   "2 tortillas de maíz o 1 de harina, la carne de su elección, cebolla, cilantro, salsa de guacamole y salsa",
 "6 rolled up corn tortillas filled with carnitas pulled pork, topped with lettuce, pico de gallo, cheese, sour cream and guac sauce":
   "6 tortillas de maíz enrolladas y rellenas de carnitas, cubiertas con lechuga, pico de gallo, queso, crema y salsa de guacamole",
 "Traditional Mexican soup made with tender beef tripe, cow foot and pig feet in a rich red chili broth, served with your choice of tortillas or bread":
   "Sopa mexicana tradicional hecha con panza de res, pata de res y patitas de cerdo en un caldo espeso de chile rojo, servida con tortillas o pan a su elección",
 "Telera bread, beans, meat of your choice, pico de gallo, lettuce and cheese, served with fries":
   "Pan telera, frijoles, la carne de su elección, pico de gallo, lechuga y queso, servida con papas fritas",
 "Telera bread, beans, meat, pico de gallo, lettuce & cheese, with fries":
   "Pan telera, frijoles, carne, pico de gallo, lechuga y queso, con papas fritas",
 "Two tacos, meat of your choice, served with a side of rice and beans":
   "Dos tacos con la carne de su elección, servidos con arroz y frijoles",
 "Meat of your choice, served with rice, beans, pico de gallo salad and corn tortillas":
   "La carne de su elección, servida con arroz, frijoles, ensalada de pico de gallo y tortillas de maíz",
 "Fajitas beef meat with onions and sweet peppers, served with rice, beans and tortillas":
   "Fajitas de res con cebolla y chile dulce, servidas con arroz, frijoles y tortillas",
 "Burger bread stuffed with a homemade beef patty, cheese, lettuce, tomato, grilled onions, mayo, ketchup and mustard, served with fries":
   "Pan de hamburguesa relleno de carne de res casera, queso, lechuga, tomate, cebolla a la parrilla, mayonesa, salsa de tomate y mostaza, servida con papas fritas",
 "Corn chips topped with meat of your choice, cheese, beans, pico de gallo, sour cream and guac sauce":
   "Totopos cubiertos con la carne de su elección, queso, frijoles, pico de gallo, crema y salsa de guacamole",
 "Hot dog bread, sausage wrapped in bacon, topped with onions and sweet peppers, mayo, ketchup and mustard, served with fries":
   "Pan de hot dog, salchicha envuelta en tocino, cubierta con cebolla y chile dulce, mayonesa, salsa de tomate y mostaza, servido con papas fritas",
 "Two birria tacos with a side of rice and beans, served with a consomé":
   "Dos tacos de birria con arroz y frijoles, servidos con consomé",
 "Two large tortillas stuffed with birria meat, cheese, onion and cilantro, served with consomé and salsa":
   "Dos tortillas grandes rellenas de birria, queso, cebolla y cilantro, servidas con consomé y salsa",
 "Noodles, birria broth and meat, served with onions and cilantro":
   "Fideos, caldo de birria y carne, servidos con cebolla y cilantro",
 "Birria broth and meat, served with corn tortillas":
   "Caldo de birria y carne, servidos con tortillas de maíz",
 "Loaded fries with carne asada meat, pico de gallo, cheese, sour cream and guac sauce":
   "Papas fritas cargadas con carne asada, pico de gallo, queso, crema y salsa de guacamole",
 "Loaded fries with carne asada, pico de gallo, cheese & guac sauce":
   "Papas fritas cargadas con carne asada, pico de gallo, queso y salsa de guacamole",
 "Two large tortillas stuffed with ground beef, topped with a homemade tomato sauce and cheese, served with sour cream":
   "Dos tortillas grandes rellenas de carne molida, cubiertas con salsa de tomate casera y queso, servidas con crema",
 "Large deep fried tortilla bowl filled with rice, beans, meat of your choice, pico de gallo, cheese, sour cream and guac sauce":
   "Bowl grande de tortilla frita relleno de arroz, frijoles, la carne de su elección, pico de gallo, queso, crema y salsa de guacamole",
 "Deep fried tortilla bowl with rice, beans, meat & all the fixings":
   "Bowl de tortilla frita con arroz, frijoles, carne y todos los complementos",
 "Mini deep fried tortillas filled with beans, meat of your choice, lettuce, pico de gallo, cheese, sour cream and guac sauce":
   "Mini tortillas fritas rellenas de frijoles, la carne de su elección, lechuga, pico de gallo, queso, crema y salsa de guacamole",
 "Deep fried burrito filled with rice, beans, meat of your choice, pico de gallo, sour cream, cheese and guac sauce, served with a lettuce salad":
   "Burrito frito relleno de arroz, frijoles, la carne de su elección, pico de gallo, crema, queso y salsa de guacamole, servido con ensalada de lechuga",
 "Two mini size chimichangas filled with meat of your choice, served with rice and beans":
   "Dos chimichangas pequeñas rellenas con la carne de su elección, servidas con arroz y frijoles",
 "A large tortilla filled with meat of your choice, cheese and pico de gallo, served with sour cream":
   "Una tortilla grande rellena con la carne de su elección, queso y pico de gallo, servida con crema",
 "Flour tortilla filled with beans, ground beef, nacho cheese, lettuce and pico de gallo, hardshell tortilla wrapped and grilled, served with sour cream and our crunch wrap sauce":
   "Tortilla de harina rellena de frijoles, carne molida, queso nacho, lechuga y pico de gallo, con una tostada dentro, envuelta y dorada a la plancha, servida con crema y nuestra salsa crunch wrap",
 "Hard corn tortilla topped with beans, meat of your choice, lettuce, pico de gallo, cheese, sour cream, guac sauce and salsa":
   "Tortilla de maíz dorada cubierta con frijoles, la carne de su elección, lechuga, pico de gallo, queso, crema, salsa de guacamole y salsa",
 "Deep fried corn hard shells filled with ground beef, lettuce, cheese and sour cream":
   "Conchas de maíz fritas rellenas de carne molida, lechuga, queso y crema",
 "Deep fried flour shells filled with ground beef, lettuce, pico de gallo, cheese and sour cream":
   "Conchas de harina fritas rellenas de carne molida, lechuga, pico de gallo, queso y crema",
 "Waffles or pancakes with eggs, ham or bacon. Hard, medium, soft or scrambled eggs":
   "Wafles o panqueques con huevos, jamón o tocino. Huevos duros, término medio, tiernos o revueltos",
 "Fry jacks served with two eggs, a side of beans and two ham or bacon":
   "Fry jacks servidos con dos huevos, frijoles y dos porciones de jamón o tocino",
 "Two mini waffles or two mini pancakes filled with a fried egg, cheese, and bacon or ham. Hard, medium or soft egg":
   "Dos mini wafles o dos mini panqueques rellenos de huevo frito, queso y tocino o jamón. Huevo duro, término medio o tierno",
 "Scrambled eggs with tomato and sweet pepper, a side of beans, served with corn or flour tortillas or toast bread":
   "Huevos revueltos con tomate y chile dulce, frijoles, servidos con tortillas de maíz o harina o pan tostado",
 "Two hardshell tortillas topped with beans, eggs, tomato sauce, cheese and sour cream, served with rice and beans, or three hardshell tortillas topped with beans, eggs, tomato sauce, sour cream and cheese only. Choice of hard, medium or soft eggs":
   "Dos tortillas doradas cubiertas con frijoles, huevos, salsa de tomate, queso y crema, servidas con arroz y frijoles, o tres tortillas doradas cubiertas con frijoles, huevos, salsa de tomate, crema y queso solamente. Huevos duros, término medio o tiernos, a su elección",
 "Corn chips mixed with salsa roja sauce, topped with two eggs, beans, onion and cilantro, cheese and sour cream":
   "Totopos mezclados con salsa roja, cubiertos con dos huevos, frijoles, cebolla y cilantro, queso y crema",
 "Large flour tortilla filled with fries, beans, eggs and meat":
   "Tortilla de harina grande rellena de papas fritas, frijoles, huevos y carne",
 "Scrambled eggs filled with cheese and meat, topped with a homemade tomato sauce and cheese, served with tortilla or toast bread":
   "Huevos revueltos rellenos de queso y carne, cubiertos con salsa de tomate casera y queso, servidos con tortilla o pan tostado",
 "Ask your waiter what flavors are available": "Pregúntele a su mesero qué sabores hay disponibles",
 "Ask availability of flavors": "Pregunte por la disponibilidad de sabores",
 "Ask your waiter what is in stock": "Pregúntele a su mesero qué hay disponible",
 "Coke and ginger ale": "Coca-Cola y ginger ale",
 "Coffee or chocolate": "Café o chocolate",
 "Coffee or chocolate, blended and topped with cream":
   "Café o chocolate, licuado y coronado con crema",
 "Carne asada, al pastor, carnitas & more": "Carne asada, al pastor, carnitas y más",
 "With rich beef consomé for dipping": "Con consomé de res para remojar",
})

# ---------------------------------------------------------------- deals
ES.update({
 "Any 2 for $15 + Free Coke": "Cualquier 2 por $15 + Coca-Cola gratis",
 "Pick two Taco Taco favourites and make it a combo. Choose from burritos or quesadillas with your preferred filling, and enjoy a complimentary Coke with the deal.":
   "Elija dos favoritos de Taco Taco y hágalos combo. Escoja entre burritos o quesadillas con el relleno que prefiera, y disfrute una Coca-Cola de cortesía con la oferta.",
 "First item": "Primer platillo",
 "First item filling": "Relleno del primer platillo",
 "Second item": "Segundo platillo",
 "Second item filling": "Relleno del segundo platillo",
 "Burrito": "Burrito",
 "Quesadilla": "Quesadilla",

 "Mega Combo": "Mega combo",
 "A serious Taco Taco spread made for sharing. Tacos, birria, flautas, Mexican hot dogs and fries come together in one big combo, finished with your choice of drinks or drinks plus desserts.":
   "Un banquete de Taco Taco hecho para compartir. Tacos, birria, flautas, hot dogs mexicanos y papas fritas en un solo combo grande, con bebidas a su elección, o bebidas y postres.",
 "Mexican Tacos meat": "Carne de los tacos mexicanos",
 "Drinks, or drinks and desserts": "Bebidas, o bebidas y postres",
 "4 Drinks": "4 bebidas",
 "2 Drinks + 2 Desserts": "2 bebidas + 2 postres",
 "Choose 4 drinks": "Elija 4 bebidas",
 "Choose 2 drinks": "Elija 2 bebidas",
 "Choose 2 desserts": "Elija 2 postres",
 "Watermelon": "Sandía",
 "Sorrel": "Sorrel",
 "Lime": "Limón",
 "Orange Juice": "Jugo de naranja",
 "Orange": "Naranja",
 "Cucumber & Lime": "Pepino y limón",
 "Cucumber Lime": "Pepino con limón",
 "Pineapple": "Piña",
 "Mango": "Mango",
 "Dragon Fruit Lime": "Pitahaya con limón",
 "Bread Pudding": "Budín de pan",

 "Taco Tuesday Special": "Especial de martes de tacos",
 "Tuesday calls for tacos. Choose Taco Taco's Mexican Tacos or go for rich, cheesy Birria Tacos at a special Tuesday price.":
   "El martes pide tacos. Elija los tacos mexicanos de Taco Taco o váyase por los tacos de birria, jugosos y con mucho queso, a precio especial de martes.",
 "Choose your tacos": "Elija sus tacos",
 "Mexican Tacos (4)": "Tacos mexicanos (4)",
 "Birria Tacos (4)": "Tacos de birria (4)",
 "Birria Tacos": "Tacos de birria",
 "Tuesday only": "Solo los martes",
 "Monday only": "Solo los lunes",

 "Grande Mexican Burrito Lunch Combo": "Combo de almuerzo de burrito mexicano grande",
 "A hearty Grande Mexican Burrito served with small fries and a small drink, an easy all-in-one lunch for serious appetites.":
   "Un burrito mexicano grande y abundante, servido con papas fritas pequeñas y una bebida pequeña: un almuerzo completo para buen apetito.",
 "Small drink": "Bebida pequeña",

 "Pork Flautas Lunch Combo": "Combo de almuerzo de flautas de cerdo",
 "Crispy pork flautas loaded with Taco Taco flavour and paired with a refreshing small drink for a simple, satisfying lunch combo.":
   "Flautas de cerdo crujientes, cargadas de sabor Taco Taco y acompañadas de una bebida pequeña refrescante: un combo de almuerzo sencillo y satisfactorio.",
 "No fries included": "No incluye papas fritas",

 "Mexican Hot Dog Lunch Combo": "Combo de almuerzo de hot dog mexicano",
 "A loaded Mexican Hot Dog topped with your choice of meat, served with small fries and a small drink for a bold Taco Taco lunch.":
   "Un hot dog mexicano cargado y cubierto con la carne de su elección, servido con papas fritas pequeñas y una bebida pequeña, para un almuerzo con mucho sabor.",

 "Tostadas Lunch Combo": "Combo de almuerzo de tostadas",
 "Three crisp tostadas piled with your choice of seasoned meat and fresh toppings, paired with a small drink.":
   "Tres tostadas crujientes con la carne sazonada de su elección y complementos frescos, acompañadas de una bebida pequeña.",

 "Birria Quesadillas Lunch Combo": "Combo de almuerzo de quesadillas de birria",
 "Golden, cheesy birria quesadillas served with rich dipping consomme, small fries and a refreshing small drink.":
   "Quesadillas de birria doradas y con mucho queso, servidas con consomé para remojar, papas fritas pequeñas y una bebida pequeña refrescante.",

 "Monday Specials": "Especiales de lunes",
 "Start the week Taco Taco style with Monday-only specials on Mexican Tacos and cheesy Quesabirria Tacos.":
   "Empiece la semana al estilo Taco Taco con especiales solo de lunes en tacos mexicanos y en tacos de quesabirria con mucho queso.",
 "Choose your special": "Elija su especial",
 "4 Mexican Tacos": "4 tacos mexicanos",
 "4 Quesabirria Tacos": "4 tacos de quesabirria",
 "Tacos meat": "Carne de los tacos",
 "Deals & Combos": "Ofertas y combos",
 "Please choose": "Por favor elija",
 "from": "desde",
 "Monday": "lunes",
 "Tuesday": "martes",
})

# ---------------------------------------------------------------- reviews
ES.update({
 "via Google": "vía Google",
 "Rated without a written review": "Calificación sin reseña escrita",
 # These are real customers' words. The Spanish says plainly that it is a
 # translation rather than passing invented wording off as theirs.
 "Based on 10 Google reviews": "Basado en 10 reseñas de Google, traducidas del inglés",
 "Our neighbours keep coming back, and they tell us why.":
   "Nuestros vecinos siguen volviendo, y nos dicen por qué. Reseñas traducidas del inglés.",
})

# ---------------------------------------------------------------- the clips
ES.update({
 "Meet the team": "Conozca al equipo",
 "The Taco Taco kitchen team in their aprons behind the counter":
   "El equipo de cocina de Taco Taco con sus delantales detrás del mostrador",
 "On the griddle": "En la plancha",
 "Patties and a burrito cooking on the flat top at Taco Taco":
   "Carne y un burrito cocinándose en la plancha de Taco Taco",
 "Dance for free tacos": "Baile por tacos gratis",
 "Two guests dancing in the dining room at Taco Taco":
   "Dos clientes bailando en el comedor de Taco Taco",
 "The dining room, the drinks jars and a taco bowl at Taco Taco":
   "El comedor, los vitroleros de bebidas y un taco bowl en Taco Taco",
 "The spread": "El banquete",
 "A table laid for a group at Taco Taco, and plates of chimichangas, nachos and a torta":
   "Una mesa servida para un grupo en Taco Taco, con platos de chimichangas, nachos y una torta",
 "Sweet trays": "Bandejas dulces",
 "Dance for tacos 2.0": "Baile por tacos 2.0",
 "Staff and customers dancing through the dining room at Taco Taco under the party lights":
   "Personal y clientes bailando por el comedor de Taco Taco bajo las luces de fiesta",
 "Happy hour": "Happy hour",
 "A card announcing Taco Taco's first official happy hour, 2PM to 6PM":
   "Un anuncio del primer happy hour oficial de Taco Taco, de 2PM a 6PM",
 "Trays of iced cinnamon rolls and pastries at Taco Taco":
   "Bandejas de roles de canela glaseados y panecillos en Taco Taco",
})

# ---------------------------------------------------------------- photo captions
ES.update({
 "Two Mexican tacos with rice and refried beans": "Dos tacos mexicanos con arroz y frijoles refritos",
 "Birria tacos served with consomé for dipping": "Tacos de birria servidos con consomé para remojar",
 "A plate of Mexican tacos with avocado salsa": "Un plato de tacos mexicanos con salsa de aguacate",
 "Street tacos topped with onion, cilantro and avocado salsa":
   "Tacos callejeros con cebolla, cilantro y salsa de aguacate",
 "Street tacos with onion, cilantro and avocado salsa, with a natural juice":
   "Tacos callejeros con cebolla, cilantro y salsa de aguacate, con un jugo natural",
 "Tacos served with a wedge of lime": "Tacos servidos con un gajo de limón",
 "Birria tacos plato combo with rice, beans and consomé":
   "Combo de plato de tacos de birria con arroz, frijoles y consomé",
 "Crispy folded birria tacos with consomé": "Tacos de birria doblados y crujientes con consomé",
 "Birria pizza cut into wedges, with consomé in the centre":
   "Pizza de birria cortada en rebanadas, con consomé en el centro",
 "Birria ramen in a rich red broth": "Ramen de birria en un caldo rojo espeso",
 "Birria quesadillas with a cup of consomé": "Quesadillas de birria con una taza de consomé",
 "Menudo soup served with lime": "Sopa de menudo servida con limón",
 "Mexican tostadas topped with lettuce, cheese, sour cream and avocado salsa":
   "Tostadas mexicanas con lechuga, queso, crema y salsa de aguacate",
 "Four tostadas topped with meat, lettuce and cream": "Cuatro tostadas con carne, lechuga y crema",
 "Mini taco bowls topped with meat and salsa": "Mini taco bowls con carne y salsa",
 "Taco bowl grande in a fried tortilla shell": "Taco bowl grande en una tortilla frita",
 "Taco salad served in a fried tortilla bowl": "Ensalada de taco servida en un bowl de tortilla frita",
 "Mexican quesadilla with melted cheese, served with sour cream":
   "Quesadilla mexicana con queso derretido, servida con crema",
 "Chimichanga with a lettuce salad": "Chimichanga con ensalada de lechuga",
 "Mini chimichanga plato combo with rice and beans":
   "Combo de plato de mini chimichangas con arroz y frijoles",
 "Burritos smothered in salsa roja and melted cheese":
   "Burritos bañados en salsa roja y queso derretido",
 "Grilled burrito cut in half": "Burrito a la plancha cortado por la mitad",
 "Crunch wrap cut open, layered with beef and melted cheese":
   "Crunch wrap abierto, en capas de carne de res y queso derretido",
 "Flautas topped with lettuce, pico de gallo and cream":
   "Flautas con lechuga, pico de gallo y crema",
 "Fajitas plato combo with peppers, rice and beans":
   "Combo de plato de fajitas con chiles, arroz y frijoles",
 "Mexican hot dog wrapped in bacon, served with fries":
   "Hot dog mexicano envuelto en tocino, servido con papas fritas",
 "Carne asada fries loaded with meat, cheese and sauces":
   "Papas con carne asada cargadas de carne, queso y salsas",
 "Loaded fries with meat, cheese and sauces": "Papas fritas cargadas de carne, queso y salsas",
 "Two plates of loaded corn chips": "Dos platos de totopos cargados",
 "Nachos topped with jalapeños, cream and pico de gallo":
   "Nachos con jalapeños, crema y pico de gallo",
 "Torta with fries, served in a basket": "Torta con papas fritas, servida en canasta",
 "Torta with grilled meat and a roasted chile, served with fries":
   "Torta con carne a la parrilla y un chile asado, servida con papas fritas",
 "Torta served in a basket": "Torta servida en canasta",
 "Huevos rancheros with rice and refried beans": "Huevos rancheros con arroz y frijoles refritos",
 "Chorizo con huevo breakfast plate with refried beans, avocado and fried tortillas":
   "Plato de desayuno de chorizo con huevo, frijoles refritos, aguacate y tortillas fritas",
 "Pancakes with bacon and eggs": "Panqueques con tocino y huevos",
 "Pancake breakfast plate with bacon and eggs": "Plato de desayuno de panqueques con tocino y huevos",
 "Waffle sandwiches with bacon and egg": "Sándwiches de wafle con tocino y huevo",
 "Waffle breakfast sandwich with bacon, egg and cheese":
   "Sándwich de wafle de desayuno con tocino, huevo y queso",
 "Two natural juices": "Dos jugos naturales",
 "Three cold drinks": "Tres bebidas frías",
 "Frappés topped with whipped cream": "Frappés coronados con crema batida",
 "A tray of Taco Taco sides and salsas": "Una bandeja de acompañamientos y salsas de Taco Taco",
 "A slice of strawberry tres leches, sitting in its milk":
   "Una rebanada de tres leches de fresa, reposando en su leche",
 "Fresh Mexicali style street tacos at Taco Taco":
   "Tacos callejeros frescos estilo mexicali en Taco Taco",
 "Taco Taco combo plate with tacos, fries and rice":
   "Plato combo de Taco Taco con tacos, papas fritas y arroz",
})

# ---------------------------------------------------------------- the blog
# Paragraphs that carry bold or italic arrive in pieces, because the markup
# splits them. The Spanish is written to read correctly with the pieces left
# where they are.
ES.update({
 "Fresh from the Taco Taco Kitchen": "Fresco desde la cocina de Taco Taco",
 "From The Kitchen": "Desde la cocina",
 "Fresh From The": "Fresco desde la",
 "Fresh From Our": "Fresco desde nuestra",
 "Stories, specials and what is coming off the griddle in West Belmopan.":
   "Historias, especiales y lo que está saliendo de la plancha en el oeste de Belmopán.",
 "Read The Story": "Lea la historia",
 "‹ All Stories": "‹ Todas las historias",
 "September 22, 2026": "22 de septiembre de 2026",

 "More Than Tacos: Bringing Bold Mexican Flavor to Belmopan":
   "Más que tacos: sabor mexicano intenso en Belmopán",
 "Tortillas on the griddle, birria on the go and a menu that keeps growing. A look at what comes out of the Taco Taco kitchen every day.":
   "Tortillas en la plancha, birria en marcha y un menú que no deja de crecer. Un vistazo a lo que sale de la cocina de Taco Taco cada día.",
 "Taco Taco Mexican Restaurant kitchen team preparing fresh Mexican food in Belmopan Belize":
   "El equipo de cocina de Taco Taco Mexican Restaurant preparando comida mexicana fresca en Belmopán, Belice",

 "There is a particular kind of sound that tells you something good is coming from the kitchen: tortillas hitting the hot griddle, meat sizzling beside them, and an order coming together one ingredient at a time.":
   "Hay un sonido particular que avisa que algo bueno viene de la cocina: las tortillas cayendo en la plancha caliente, la carne chisporroteando al lado y un pedido armándose ingrediente por ingrediente.",
 ", that is simply another day in the kitchen.": ", eso es simplemente otro día en la cocina.",
 "From our home in West Belmopan, Taco Taco is built around one straightforward idea: serve satisfying Mexican food with bold flavor, generous portions and enough variety to make choosing what to order the hardest part.":
   "Desde nuestra casa en el oeste de Belmopán, Taco Taco se construye sobre una idea sencilla: servir comida mexicana que llena, con sabor intenso, porciones generosas y suficiente variedad como para que lo más difícil sea decidir qué pedir.",
 "Whether you come for tacos, birria, a loaded burrito, quesadillas or something a little different, the goal remains the same: food prepared to be enjoyed, not overcomplicated.":
   "Ya sea que venga por tacos, birria, un burrito cargado, quesadillas o algo un poco distinto, el objetivo es el mismo: comida preparada para disfrutarse, sin complicaciones.",

 "The Taco Taco Favorites": "Los favoritos de Taco Taco",
 "Tacos may be in the name, but the menu goes considerably further.":
   "Los tacos estarán en el nombre, pero el menú va bastante más allá.",
 "Our kitchen serves Mexican tacos with choices such as carne asada, carnitas, al pastor and chicken, alongside favorites including":
   "Nuestra cocina sirve tacos mexicanos con opciones como carne asada, carnitas, al pastor y pollo, junto con favoritos como",
 "birria tacos, birria quesadillas, burritos, crispy flautas, tostadas and Mexican hot dogs":
   "tacos de birria, quesadillas de birria, burritos, flautas crujientes, tostadas y hot dogs mexicanos",
 "And when one dish simply is not enough, our rotating specials and lunch combinations bring several Taco Taco favorites together.":
   "Y cuando un solo platillo no alcanza, nuestros especiales rotativos y las combinaciones de almuerzo reúnen varios favoritos de Taco Taco.",
 "You may have already seen some of them across our social pages:":
   "Quizá ya haya visto algunos en nuestras redes sociales:",
 "Taco Tuesday specials, Monday deals, Grande Mexican Burrito lunch combos, Pork Flautas, Birria Quesadillas and our Mega Combo":
   "especiales de martes de tacos, ofertas de lunes, combos de almuerzo de burrito mexicano grande, flautas de cerdo, quesadillas de birria y nuestro Mega combo",
 "designed for the seriously hungry.": "pensados para quien llega con mucha hambre.",
 "Pair that with refreshing drinks such as horchata, watermelon, lime, sorrel, orange, pineapple or cucumber and lime, and there is always another combination to try.":
   "Acompáñelo con bebidas refrescantes como horchata, sandía, limón, sorrel, naranja, piña o pepino con limón, y siempre hay otra combinación por probar.",
 "See This Week's Deals": "Vea las ofertas de esta semana",

 "Made in Our Kitchen": "Hecho en nuestra cocina",
 "The food you see leaving the kitchen starts right here.":
   "La comida que ve salir de la cocina empieza justo aquí.",
 "Behind every plate is a working kitchen, a hot griddle and a team preparing orders throughout the day. That matters to us because Taco Taco is not simply about putting another item on a menu.":
   "Detrás de cada plato hay una cocina en marcha, una plancha caliente y un equipo preparando pedidos durante todo el día. Eso nos importa porque Taco Taco no se trata simplemente de poner otro platillo en un menú.",
 "It is about the experience of receiving something fresh, filling and made with care.":
   "Se trata de la experiencia de recibir algo fresco, que llena y hecho con cuidado.",

 "Something New Is Always Cooking": "Siempre se está cocinando algo nuevo",
 "One of the best reasons to follow Taco Taco is that the menu experience does not stand still.":
   "Una de las mejores razones para seguir a Taco Taco es que la experiencia del menú no se queda quieta.",
 "We regularly introduce specials, meal combinations and different ways to enjoy familiar favorites. Our":
   "Presentamos con regularidad especiales, combinaciones de comida y distintas formas de disfrutar los favoritos de siempre. Nuestras páginas de",
 "Facebook, Instagram and TikTok": "Facebook, Instagram y TikTok",
 "pages are where you can keep up with what is coming off the griddle, current specials and the latest from the Taco Taco kitchen.":
   "son donde puede enterarse de lo que sale de la plancha, los especiales del momento y lo más reciente de la cocina de Taco Taco.",
 "And with our new website, discovering Taco Taco online is becoming just as easy as ordering your favorites.":
   "Y con nuestro nuevo sitio web, descubrir Taco Taco en línea se está volviendo tan fácil como pedir sus favoritos.",

 "Hungry Yet?": "¿Ya le dio hambre?",
 "If all of this has made choosing lunch considerably harder, we have done our job.":
   "Si todo esto le complicó bastante la decisión del almuerzo, hicimos bien nuestro trabajo.",
 "Come see us at": "Venga a vernos a",
 ", explore the menu, check out our latest deals, and find your Taco Taco favorite.":
   ", explore el menú, vea nuestras ofertas más recientes y encuentre su favorito de Taco Taco.",
 "Because sometimes the answer to": "Porque a veces la respuesta a",
 "“What should we eat today?”": "“¿Qué comemos hoy?”",
 "really is that simple:": "de verdad es así de sencilla:",
 "Tacos. Birria. Burritos. Quesadillas. Taco Taco.": "Tacos. Birria. Burritos. Quesadillas. Taco Taco.",
})

# ---------------------------------------------------------------- titles and meta
ES.update({
 "Taco Taco Mexican Restaurant | Belmopan": "Taco Taco Mexican Restaurant | Belmopán",
 "Menu | Taco Taco Mexican Restaurant": "Menú | Taco Taco Mexican Restaurant",
 "Deals & Combos | Taco Taco Mexican Restaurant": "Ofertas y combos | Taco Taco Mexican Restaurant",
 "Reviews | Taco Taco Mexican Restaurant": "Reseñas | Taco Taco Mexican Restaurant",
 "Gallery | Taco Taco Mexican Restaurant": "Galería | Taco Taco Mexican Restaurant",
 "About | Taco Taco Mexican Restaurant": "Nosotros | Taco Taco Mexican Restaurant",
 "Fresh from the Taco Taco Kitchen | Taco Taco Mexican Restaurant":
   "Fresco desde la cocina de Taco Taco | Taco Taco Mexican Restaurant",
 "Taco Taco Mexican Restaurant | Mexican Food in Belmopan, Belize":
   "Taco Taco Mexican Restaurant | Comida mexicana en Belmopán, Belice",
 "Page not found | Taco Taco Mexican Restaurant": "Página no encontrada | Taco Taco Mexican Restaurant",

 "Taco Taco Mexican Restaurant in West Belmopan. Authentic Mexicali style tacos, birria, tortas and breakfast. Order online and send your order on WhatsApp.":
   "Taco Taco Mexican Restaurant en el oeste de Belmopán. Tacos auténticos estilo mexicali, birria, tortas y desayunos. Ordene en línea y envíe su pedido por WhatsApp.",
 "Taco Taco deals and combos in Belmopan: lunch combos, the Mega Combo, and Monday and Tuesday specials. Pick your options and order on WhatsApp.":
   "Ofertas y combos de Taco Taco en Belmopán: combos de almuerzo, el Mega combo y los especiales de lunes y martes. Elija sus opciones y ordene por WhatsApp.",
 "The full Taco Taco Mexican Restaurant menu with prices in Belize dollars. Build your basket and send your order on WhatsApp.":
   "El menú completo de Taco Taco Mexican Restaurant con precios en dólares beliceños. Arme su carrito y envíe su pedido por WhatsApp.",
 "Read what customers say about Taco Taco Mexican Restaurant. Rated 4.9 out of 5 from 10 Google reviews.":
   "Lea lo que dicen los clientes de Taco Taco Mexican Restaurant. Calificado 4.9 de 5 en 10 reseñas de Google.",
 "Stories and specials from the Taco Taco kitchen in West Belmopan.":
   "Historias y especiales de la cocina de Taco Taco en el oeste de Belmopán.",
 "Photos of the food we serve at Taco Taco Mexican Restaurant in West Belmopan.":
   "Fotos de la comida que servimos en Taco Taco Mexican Restaurant, en el oeste de Belmopán.",
 "About Taco Taco Mexican Restaurant in West Belmopan: hours, address, how to order, what meats you can choose, and answers to the questions we are asked most.":
   "Sobre Taco Taco Mexican Restaurant en el oeste de Belmopán: horario, dirección, cómo ordenar, qué carnes puede elegir y las respuestas a lo que más nos preguntan.",
 "That page could not be found.": "No se pudo encontrar esa página.",
 "Discover Taco Taco Mexican Restaurant in Belmopan, Belize. Explore Mexican tacos, birria, burritos, quesadillas, flautas, lunch combos and more, fresh from the Taco Taco kitchen.":
   "Descubra Taco Taco Mexican Restaurant en Belmopán, Belice. Explore tacos mexicanos, birria, burritos, quesadillas, flautas, combos de almuerzo y más, frescos de la cocina de Taco Taco.",
})

# ---------------------------------------------------------------- who the order is for
# The three options are labels here and kitchen words in the value attribute,
# which the translator does not touch. So a Spanish customer taps "Domicilio"
# and the ticket the kitchen reads says Delivery, exactly the way the menu item
# names already work.
ES.update({
 "Your name":                "Su nombre",
 "Who is this order for?":   "\u00bfA nombre de qui\u00e9n?",
 "How are you getting it?":  "\u00bfC\u00f3mo lo va a recibir?",
 "Pickup":                   "Recoger",
 "Dine-In":                  "Comer aqu\u00ed",
 "Delivery":                 "Domicilio",
 # the last tap before it goes
 "Is this your final order?": "\u00bfEs este su pedido final?",
 "It goes to Taco Taco on WhatsApp as soon as you tap send.":
   "Se env\u00eda a Taco Taco por WhatsApp en cuanto toque enviar.",
 "Not yet":                  "Todav\u00eda no",
 "Yes, send it":             "S\u00ed, enviarlo",
 "Prices in Belize dollars (BZD). Any final details we still need are confirmed "
 "with you on WhatsApp.":
   "Precios en d\u00f3lares belice\u00f1os (BZD). Cualquier detalle final que haga falta se "
   "confirma con usted por WhatsApp.",
 # delivery only
 "Delivery address":         "Direcci\u00f3n de entrega",
 "Street, area, and anything that helps us find you":
   "Calle, \u00e1rea y cualquier se\u00f1a que nos ayude a encontrarlo",
 "When do you want it?":     "\u00bfPara cu\u00e1ndo lo quiere?",
 "As soon as possible":      "Lo antes posible",
 "At a time":                "A una hora",
 "The delivery charge is arranged with you on WhatsApp and is not in the total below.":
   "El costo de la entrega se acuerda con usted por WhatsApp y no est\u00e1 incluido en el "
   "total de abajo.",
})

# ---------------------------------------------------------------- Taco Taco Connect
ES.update({
 "One Link": "Un solo enlace",
 "Connect":  "Connect",
 "Everything Taco Taco in one place.": "Todo Taco Taco en un solo lugar.",
 "Everything Taco Taco in one place. Save it, share it, and you will never have to "
 "hunt for us again.":
   "Todo Taco Taco en un solo lugar. Gu\u00e1rdelo, comp\u00e1rtalo y nunca m\u00e1s tendr\u00e1 que "
   "buscarnos.",
 "Open Taco Taco Connect": "Abrir Taco Taco Connect",
 "Directions": "C\u00f3mo llegar",
 "Socials":    "Redes sociales",
 "QR code":    "C\u00f3digo QR",
})

# ---------------------------------------------------------------- September promotion
# Belize's Independence Day is a Belizean occasion first, so the Spanish keeps
# the day's own name rather than a literal translation of the English phrase,
# and "happy hour"-style loanwords are avoided: "el Mes de la Patria" is what
# the September celebrations are called.
ES.update({
 "Happy Independence Day, Belize!": "\u00a1Feliz D\u00eda de la Independencia, Belice!",
 "Happy Independence Day!":         "\u00a1Feliz D\u00eda de la Independencia!",
 "Welcome to our brand-new website!": "\u00a1Bienvenido a nuestro nuevo sitio web!",
 "In celebration of Belize's Independence Day, the September Celebrations, and the "
 "launch of Taco Taco's new website, we're giving you 5% OFF every order placed "
 "through our website for the remainder of September!":
   "Para celebrar el D\u00eda de la Independencia de Belice, las Fiestas de Septiembre y "
   "el lanzamiento del nuevo sitio web de Taco Taco, le damos un 5% DE DESCUENTO en "
   "cada pedido hecho por nuestro sitio web durante el resto de septiembre.",
 "Whether you're dining in, picking up, or requesting delivery, simply use our new "
 "online menu, add your favorites to your basket, and send your order directly to "
 "us on WhatsApp.":
   "Ya sea que coma aqu\u00ed, lo recoja o pida a domicilio, use nuestro nuevo men\u00fa en "
   "l\u00ednea, agregue sus favoritos al carrito y env\u00edenos el pedido directamente por "
   "WhatsApp.",
 "NO CODE NEEDED \u2014 your 5% discount is automatically calculated.":
   "NO NECESITA C\u00d3DIGO \u2014 su 5% de descuento se calcula autom\u00e1ticamente.",
 "Thank you, Belize, for your continued support of Taco Taco.":
   "Gracias, Belice, por su apoyo constante a Taco Taco.",
 "Start My Order":   "Comenzar mi pedido",
 "Close this offer": "Cerrar esta oferta",
 # The basket and the WhatsApp message. These two have to read the same in
 # either language, and the build checks that they do.
 "September Celebration \u2014 5% Website Discount":
   "Fiestas de Septiembre \u2014 5% de descuento por la web",
 "Subtotal":          "Subtotal",
 "Website Discount":  "Descuento web",
 "Final Order Total": "Total final del pedido",
 "5% off":            "5% desc.",
})

# ---------------------------------------------------------------- the reviews page photograph
ES.update({
 "The Taco Taco Mexican Restaurant building on Aloe Vera Ave in West Belmopan, with "
 "covered seating out front and the Taco Taco road sign by the gate":
   "El edificio de Taco Taco Mexican Restaurant en Aloe Vera Ave, Belmop\u00e1n Oeste, con "
   "asientos techados al frente y el letrero de Taco Taco junto al port\u00f3n",
})

# ---------------------------------------------------------------- the language switch
ES.update({
 "English": "English",
 "Español": "Español",
 "Language": "Idioma",
 "Read this site in Spanish": "Lea este sitio en español",
 "Read this site in English": "Lea este sitio en inglés",
 "Translated from English": "Traducido del inglés",
})

# Strings the front end builds at run time. Shipped to the browser as a small
# table beside the deals data, so site.js has no English baked into it.
JS = {
 "basket_empty": "Su carrito está vacío. Toque Agregar en cualquier platillo del menú.",
 "item": "artículo", "items": "artículos",
 "decrease": "Quitar uno", "increase": "Agregar uno",
 "close_photo": "Cerrar la foto",
 "wa_open": "Hola Taco Taco, quisiera hacer un pedido.",
 "wa_intro": "¡Hola Taco Taco! Quisiera hacer este pedido:",
 "wa_total": "Total",
 "menu_open": "Ver el menú completo", "menu_close": "Ocultar el menú",
 "pick_one": "Por favor elija",
 "watch": "Ver",
 "who_name": "Su nombre",
 "who_how": "\u00bfC\u00f3mo lo va a recibir?",
 "wa_name": "Nombre",
 "wa_how": "Pedido para",
 "wa_addr": "Direcci\u00f3n",
 "wa_when": "Para",
 "wa_fee": "El costo de la entrega se confirma por WhatsApp.",
 "who_addr": "Direcci\u00f3n de entrega",
 "who_when": "\u00bfPara cu\u00e1ndo lo quiere?",
 "sent_ok": "Pedido enviado por WhatsApp.",
 "sent_undo": "Devolverlo a mi carrito",
 # the fulfilment word as the customer reads it, for the confirmation summary
 "how_pickup": "Recoger",
 "how_dinein": "Comer aqu\u00ed",
 "how_delivery": "Domicilio",
 "added": "Agregado",
}
