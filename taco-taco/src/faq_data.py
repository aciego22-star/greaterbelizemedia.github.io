# -*- coding: utf-8 -*-
"""The questions people actually ask, answered from what the restaurant told us.

Answer engines and AI assistants quote short, direct answers to plainly worded
questions, so each answer here leads with the fact and stops. Nothing in this
file is invented: every answer traces back to the printed menu, the address and
hours on it, the phone numbers, or the way the ordering flow on this site
actually works. Questions we cannot answer from those sources are not here at
all, because a confident wrong answer about a restaurant is worse than no
answer: someone drives across Belmopan on the strength of it.

{addr}, {hours_short} and {phone} are filled in from the same single source the
rest of the site uses, so these answers can never drift from the footer.
"""

FAQ = [
 {"id": "where",
  "q": {"en": "Where is Taco Taco Mexican Restaurant?",
        "es": "¿Dónde queda Taco Taco Mexican Restaurant?"},
  "a": {"en": "We are at {addr}. You can open the location in Google Maps from the "
              "map further down this page.",
        "es": "Estamos en {addr}. Puede abrir la ubicación en Google Maps desde el "
              "mapa que aparece más abajo en esta página."}},

 {"id": "hours",
  "q": {"en": "What are your opening hours?",
        "es": "¿Cuál es su horario?"},
  "a": {"en": "{hours_short} We are open seven days a week.",
        "es": "{hours_short} Abrimos los siete días de la semana."}},

 {"id": "order",
  "q": {"en": "How do I place an order?",
        "es": "¿Cómo hago un pedido?"},
  "a": {"en": "Tap Add on anything you want on the menu, then send the basket to us on "
              "WhatsApp. We reply to confirm your order and whether you are picking it "
              "up or having it delivered. You can also call {phone}.",
        "es": "Toque Agregar en lo que quiera del menú y envíenos el carrito por "
              "WhatsApp. Le respondemos para confirmar su pedido y si lo recoge o se lo "
              "llevamos. También puede llamar al {phone}."}},

 {"id": "app",
  "q": {"en": "Do I need an app to order?",
        "es": "¿Necesito una aplicación para pedir?"},
  "a": {"en": "No. Ordering happens in your browser and finishes in WhatsApp, which you "
              "already have. There is nothing to download and no account to create.",
        "es": "No. El pedido se arma en su navegador y termina en WhatsApp, que ya tiene. "
              "No hay nada que descargar ni ninguna cuenta que crear."}},

 {"id": "delivery",
  "q": {"en": "Do you do takeout and delivery?",
        "es": "¿Hacen entregas y pedidos para llevar?"},
  "a": {"en": "Yes. Taco Taco is dine-in, takeout and delivery, and the restaurant is "
              "family friendly. Tell us which you want when you send your order.",
        "es": "Sí. En Taco Taco puede comer aquí, pedir para llevar o a domicilio, y el "
              "restaurante es de ambiente familiar. Díganos cuál prefiere al enviar su pedido."}},

 {"id": "meats",
  "q": {"en": "What meats can I choose?",
        "es": "¿Qué carnes puedo elegir?"},
  "a": {"en": "Tacos, burritos, plates and bowls come with your choice of carne asada, "
              "pollo asado, carnitas or al pastor. Birria is available on any of them "
              "for one dollar more.",
        "es": "Los tacos, burritos, platos y bowls vienen con la carne de su elección: "
              "carne asada, pollo asado, carnitas o al pastor. La birria está disponible "
              "en cualquiera de ellos por un dólar más."}},

 {"id": "birria",
  "q": {"en": "What is birria, and how do you serve it?",
        "es": "¿Qué es la birria y cómo la sirven?"},
  "a": {"en": "Birria is meat slow-cooked in a seasoned broth until it pulls apart, and "
              "the broth is served alongside as consomé for dipping. We serve it as "
              "tacos, as a plato combo with rice and beans, as birria pizza, as birria "
              "ramen, as a soup, and in burritos and quesadillas.",
        "es": "La birria es carne cocida lentamente en un caldo sazonado hasta que se "
              "deshace, y el caldo se sirve al lado como consomé para remojar. La "
              "servimos en tacos, en combo de plato con arroz y frijoles, como pizza de "
              "birria, como ramen de birria, como sopa, y en burritos y quesadillas."}},

 {"id": "breakfast",
  "q": {"en": "Do you serve breakfast, and until when?",
        "es": "¿Sirven desayuno, y hasta qué hora?"},
  "a": {"en": "Yes, and breakfast is served all day. The plates include huevos rancheros, "
              "huevos a la mexicana, chilaquiles, fry jacks, waffles and pancakes, "
              "omelettes and a breakfast burrito.",
        "es": "Sí, y el desayuno se sirve todo el día. Los platos incluyen huevos "
              "rancheros, huevos a la mexicana, chilaquiles, fry jacks, wafles y "
              "panqueques, omelettes y un burrito de desayuno."}},

 {"id": "prices",
  "q": {"en": "What currency are the prices in?",
        "es": "¿En qué moneda están los precios?"},
  "a": {"en": "Every price on this site is in Belize dollars (BZD).",
        "es": "Todos los precios de este sitio están en dólares beliceños (BZD)."}},

 # Added 2026-09-19 from the restaurant's own happy hour announcement. The card
 # names the window and two prices and stops there, so this answer does too: no
 # days of the week, because it does not say which, and no "normally $x",
 # because it does not say which taco the $4 replaces.
 {"id": "happy-hour",
  "q": {"en": "Do you have a happy hour?",
        "es": "¿Tienen happy hour?"},
  "a": {"en": "Yes. Happy hour runs from 2:00 PM to 6:00 PM. Mexican tacos are $4 each "
              "and birria tacos are $5 each during that window. Call {phone} to check "
              "it is on before you set out.",
        "es": "Sí. El happy hour es de 2:00 PM a 6:00 PM. Durante esa franja los tacos "
              "mexicanos cuestan $4 cada uno y los tacos de birria $5 cada uno. Llame al "
              "{phone} para confirmar antes de salir."}},

 {"id": "deals",
  "q": {"en": "Do you have specials or combos?",
        "es": "¿Tienen especiales o combos?"},
  "a": {"en": "Yes. There is a happy hour from 2:00 PM to 6:00 PM, Monday specials, a "
              "Taco Tuesday special, several lunch combos that come with fries and a "
              "drink, and a Mega Combo built for sharing. They are all on the deals page "
              "with their current prices.",
        "es": "Sí. Hay happy hour de 2:00 PM a 6:00 PM, especiales de lunes, un especial "
              "de martes de tacos, varios combos de almuerzo que vienen con papas fritas y "
              "bebida, y un Mega combo hecho para compartir. Todos están en la página de "
              "ofertas con sus precios vigentes."}},
]

HEAD = {
 "kicker": {"en": "Questions", "es": "Preguntas"},
 "title_a": {"en": "Common", "es": "Preguntas"},
 "title_b": {"en": "Questions", "es": "frecuentes"},
 "sub": {"en": "The things people ask us most, answered straight.",
         "es": "Lo que más nos preguntan, respondido sin rodeos."},
 "more": {"en": "See The Full Menu", "es": "Ver el menú completo"},
 "link": {"en": "Common Questions", "es": "Preguntas frecuentes"},
}
