# -*- coding: utf-8 -*-
"""Customer reviews, supplied with Spanish already written.

Each review carries "en" and "es", so the Spanish pass is a language switch
rather than a translation job. Emoji were stripped to match house style.

HOME_ORDER is the rotation on the home page and deliberately excludes the two
reviews that have a rating but no written text; those still appear on the
reviews page, as rating-only entries.
"""

# Long and short alternate so the four visible cards always read as a mix
# rather than four long paragraphs followed by four one-liners.
HOME_ORDER = ['melisa-alvarenga', 'isridio-hernandez', 'klerysa-heredia', 'hern-mar',
              'jesus-ortega', 'hector-tiul', 'david-funez', 'garden-tree-apt']

REVIEWS = [
 {
  "id":     'klerysa-heredia',
  "name":   'Klerysa Heredia',
  "rating": 5,
  "source": 'Google',
  "en":     'The best Mexican restaurant around!! I eat there all the time. It reminds me so much of Mexico and the authenticity in it. Will definitely come back over and over.',
  "es":     '¡El mejor restaurante mexicano de la zona! Como allí todo el tiempo. Me recuerda muchísimo a México y a su autenticidad. Definitivamente volveré una y otra vez.',
 },
 {
  "id":     'melisa-alvarenga',
  "name":   'Melisa Alvarenga',
  "rating": 5,
  "source": 'Google',
  "en":     'Walking into this place, it just feels right. It’s got that cozy, welcoming vibe that instantly makes you feel at home, whether you’re by yourself or with a group. And the food? Absolutely incredible. Seriously, every dish tastes like it was made with love, care and flavor.',
  "es":     'Entrar a este lugar simplemente se siente bien. Tiene un ambiente acogedor y agradable que te hace sentir como en casa al instante, ya sea que vengas solo o con un grupo. ¿Y la comida? Absolutamente increíble. De verdad, cada plato sabe como si estuviera hecho con amor, cuidado y muchísimo sabor.',
 },
 {
  "id":     'jesus-ortega',
  "name":   'Jesus Ortega',
  "rating": 5,
  "source": 'Google',
  "en":     'My grandma is a picky eater, and she didn’t have any trouble choosing from their menu. The environment and people made it feel like home away from home.',
  "es":     'Mi abuela es muy exigente para comer y no tuvo ningún problema para escoger del menú. El ambiente y las personas hicieron que se sintiera como un hogar lejos de casa.',
 },
 {
  "id":     'david-funez',
  "name":   'David Funez',
  "rating": 5,
  "source": 'Google',
  "en":     'Best Mexican food I’ve had!!! Recipe from Phoenix, Arizona, so it’s super authentic and flavorful. Definitely will come back when I go back to Belize!!!! 10/10',
  "es":     '¡La mejor comida mexicana que he probado! La receta viene de Phoenix, Arizona, así que es súper auténtica y llena de sabor. Definitivamente volveré cuando regrese a Belize. ¡10/10!',
 },
 {
  "id":     'isridio-hernandez',
  "name":   'Isridio Hernandez',
  "rating": 5,
  "source": 'Google',
  "en":     'Best Mexican food in Belize!!!',
  "es":     '¡La mejor comida mexicana en Belize!',
 },
 {
  "id":     'hern-mar',
  "name":   'Hern Mar',
  "rating": 5,
  "source": 'Google',
  "en":     'Birria tacos are mouth-watering.',
  "es":     'Los tacos de birria se hacen agua la boca.',
 },
 {
  "id":     'hector-tiul',
  "name":   'Hector Tiul',
  "rating": 5,
  "source": 'Google',
  "en":     'Great service. Food on point Atmosphere cool.',
  "es":     'Excelente servicio. La comida, en su punto y el ambiente, genial.',
 },
 {
  "id":     'john-dunn',
  "name":   'John Dunn',
  "rating": 5,
  "source": 'Google',
  "en":     '',
  "es":     '',
 },
 {
  "id":     'k-jevon-d',
  "name":   'K. Jevon .D',
  "rating": 4,
  "source": 'Google',
  "en":     '',
  "es":     '',
 },
 {
  "id":     'garden-tree-apt',
  "name":   'Garden Tree Apt',
  "rating": 5,
  "source": 'Google',
  "en":     'The best, and the menu is unlimited with great food!',
  "es":     '¡De lo mejor, con un menú muy amplio y excelente comida!',
 },
]

STR_REVIEWS = {
  "home_title_a": "See What Our",
  "home_title_b": "Customers Are Saying",
  "home_kicker":  "Reviews",
  "via":          "via Google",
  "no_text":      "Rated without a written review",
}
