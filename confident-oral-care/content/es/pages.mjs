// Spanish page copy. Same structure as ../pages.mjs. Contact details and hours come from clinic-data.json.
// Translation draft for review by the clinic before public launch.
import { gallery as galleryEn } from '../pages.mjs';

export const home = {
  metaDescription: 'Atención dental y de ortodoncia con la Dra. Brittni Haylock, DDS y ortodoncista, en The Boardwalk Belize, Belize City. Conozca los servicios o solicite una cita.',
  hero: {
    title: 'Donde comienza la confianza',
    location: 'Atención dental y de ortodoncia en The Boardwalk Belize, Belize City.',
    body: 'Conozca a la Dra. Brittni Haylock y encuentre por dónde empezar, ya sea que le toque una limpieza, tenga una pregunta sobre sus dientes o quiera explorar la ortodoncia.',
  },
  meet: {
    title: 'Conozca a la Dra. Brittni Haylock',
    body: 'Tener tiempo para hablar de lo que le trae a consulta vale la pena. En ConfiDent Oral Care puede empezar con una consulta, preguntar por sus opciones y decidir el siguiente paso junto con su equipo dental.',
    cta: 'Conozca a la Dra. Haylock',
  },
  services: {
    title: 'Atención dental para las preguntas que tiene hoy',
    body: 'Si sabe lo que busca, explore nuestros servicios. Si no está seguro de por dónde empezar, una consulta le da un espacio para preguntar.',
  },
  firstVisit: {
    title: 'Su primera visita',
    body: 'Cuéntenos de qué le gustaría hablar. Puede preguntar por un examen, un tratamiento que está considerando o el siguiente paso después de una atención que recibió en otro lugar.',
    cta: 'Qué esperar',
  },
  inside: {
    title: 'Dentro de ConfiDent',
    body: 'Recorra nuestra recepción y vea las fotos del día de la inauguración en The Boardwalk.',
    cta: 'Ver la galería',
  },
  blog: {
    title: 'Del blog dental',
    body: 'Encuentre guías sencillas que le ayudan a prepararse para una visita y a hacer mejores preguntas sobre su atención.',
    cta: 'Leer el blog dental',
  },
};

export const about = {
  metaDescription: 'Conozca a la Dra. Brittni Haylock, DDS y ortodoncista, en ConfiDent Oral Care, una clínica dental y de ortodoncia en The Boardwalk Belize, Belize City.',
  title: 'Conozca a la Dra. Brittni Haylock',
  paragraphs: [
    'La Dra. Brittni Haylock es dentista y ortodoncista en ConfiDent Oral Care, una clínica en The Boardwalk Belize, Belize City.',
    'Quizá busca un lugar para mantener su cuidado dental de rutina, revisar una restauración que ya tiene o hablar de lo que podría implicar la ortodoncia. Una consulta les da a usted y a su equipo dental la oportunidad de hablar de sus prioridades y de las opciones que podrían convenirle.',
  ],
};

export const firstVisit = {
  metaDescription: 'Prepare su primera visita a ConfiDent Oral Care en Belize City: de qué hablar, qué traer y cómo programar una cita.',
  title: 'Su primera visita',
  steps: [
    {
      title: 'Empiece por lo que quiere conversar',
      body: 'Al solicitar una visita, elija una consulta general o de ortodoncia si ese es el tipo de cita que busca. Si no está seguro de qué elegir, el equipo puede ayudarle a encontrar el punto de partida adecuado.',
    },
    {
      title: 'Traiga las preguntas que le importan',
      body: 'Anote todo lo que le gustaría tratar, desde una inquietud dental hasta preguntas sobre comodidad, tiempos o costos. Si tiene radiografías, registros o un aparato que quiere que revisen, llame a la clínica con anticipación para preguntar qué traer.',
    },
    {
      title: 'Hable del siguiente paso',
      body: 'El dentista puede explicarle lo que encontró en su visita, si se necesita más información y qué seguimiento podría ser adecuado. Puede preguntar qué decisiones pueden esperar y qué esperar en una próxima cita.',
    },
  ],
};

const photoText = {
  reception: ['Nuestra recepción', 'Recepción blanca y letrero dorado de ConfiDent dentro de la clínica'],
  'opening-day': ['Inauguración en The Boardwalk', 'Retrato del día de la inauguración frente a ConfiDent, junto a globos blancos y dorados y el letrero de bienvenida'],
  'treatment-room': ['Nuestro consultorio', 'Consultorio con un sillón dental gris, un espejo arqueado con marco dorado y una ola iluminada en la pared'],
  celebration: ['Celebrando la inauguración', 'Dos integrantes del equipo de ConfiDent sostienen un globo en forma de diente frente al letrero dorado de ConfiDent'],
  'reception-desk': ['En la recepción', 'Una integrante del equipo de ConfiDent en la recepción, junto a rosas blancas y bajo el letrero dorado de ConfiDent'],
  'waiting-area': ['En la sala de espera', 'Dos integrantes del equipo de ConfiDent sentadas en el sofá blanco de la sala de espera con luz cálida'],
};

export const gallery = {
  metaDescription: 'Fotos de la recepción, el consultorio y la inauguración de ConfiDent Oral Care en The Boardwalk Belize, Belize City, además de videos de la clínica.',
  title: 'Un vistazo a ConfiDent',
  intro: 'Recorra nuestra recepción, el consultorio y las fotos de la inauguración de la clínica en The Boardwalk Belize.',
  photos: galleryEn.photos.map((p) => ({ ...p, title: photoText[p.id]?.[0] ?? p.title, alt: photoText[p.id]?.[1] ?? p.alt })),
  videosTitle: 'Videos',
  videosPlaceholder: 'Nuestro recorrido por la clínica viene en camino. Mientras tanto, vea más de la clínica en Instagram.',
  instagramCta: 'Ver ConfiDent en Instagram',
};

export const appointments = {
  metaDescription: 'Solicite una cita en ConfiDent Oral Care, Belize City. Pregúntele a confident AI, use el formulario de reserva, llame al +501 628-8233 o escríbanos por WhatsApp.',
  title: 'Solicitar una cita',
  intro: 'Elija un tipo de visita o pídale a confident AI que le ayude a encontrar por dónde empezar. También puede comunicarse con el equipo por teléfono o WhatsApp.',
};

export const contact = {
  metaDescription: 'Contacte a ConfiDent Oral Care en The Boardwalk Belize, Belize City: teléfono, WhatsApp, correo, horario publicado, cómo llegar, Instagram y Facebook.',
  title: 'Visítenos en The Boardwalk',
  arrange: 'Llame a la clínica o escríbanos por WhatsApp para programar una visita. El correo está disponible para consultas generales.',
  hoursNote: 'El anuncio de horario de la clínica indica las 5 p. m. como la última cita y las 6 p. m. como hora de cierre. Llame a la clínica para confirmar citas tarde.',
};
