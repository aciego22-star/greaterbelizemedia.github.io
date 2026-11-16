// Spanish dental blog. Same slugs as ../blog.mjs. Translation draft for clinic review before public launch.

export const blogIndex = {
  title: 'El blog dental de ConfiDent',
  intro: 'Guías breves para las preguntas que surgen antes de una cita. Descubra qué traer, qué preguntar y cómo aprovechar mejor la conversación con su equipo dental.',
  metaDescription: 'Guías sencillas de ConfiDent Oral Care en Belize City para preparar su visita dental, sus retenedores y su consulta de dentaduras.',
};

export const articles = [
  {
    slug: 'getting-ready-for-your-first-dental-visit',
    title: 'Cómo prepararse para su primera visita dental',
    excerpt: 'Una lista breve de preguntas y datos útiles puede hacer más fácil preparar su primera visita.',
    sections: [
      ['Elija de qué quiere hablar', 'Empiece con una pregunta sencilla. ¿Quiere programar una limpieza, revisar un diente o entender un tratamiento del que ha oído hablar? Si tiene varias cosas en mente, ponga primero la más importante. Una consulta es la oportunidad de contar lo que le importa y recibir ayuda para decidir en qué orden atenderlo.'],
      ['Pregunte qué debe traer', 'Llame a la clínica antes de su visita si tiene radiografías o registros recientes de otro dentista. Pregunte qué necesita el equipo y cómo prefieren recibirlo. Si hay un retenedor o una dentadura que quiere que el dentista revise, pregunte si debe traerlo. Hablarlo con anticipación le evita adivinar qué será útil ese día.'],
      ['Cuéntele al equipo qué le haría sentir más cómodo', 'A algunos pacientes les gusta saber qué va a pasar antes de cada paso. Otros prefieren hacer sus preguntas primero y hablar de lo que encuentra el dentista al final. Si siente nervios o le preocupa la sensibilidad, dígalo al llegar. Pregunte cómo puede indicar que quiere hacer una pausa o tomarse un momento durante la visita.'],
      ['Salga con un siguiente paso claro', 'Antes de irse, pregunte qué encontró el dentista, si hay alguna decisión que tomar y si necesita otra visita. Si le proponen un tratamiento, pregunte qué implicaría la cita y cuándo puede recibir información sobre su costo. También puede preguntar a quién llamar si le surge una duda después.'],
    ],
    explore: [
      { label: 'Su primera visita', href: '/first-visit' },
      { label: 'Solicitar una cita', href: '/appointments' },
    ],
  },
  {
    slug: 'what-to-ask-about-retainers',
    title: '¿Qué debo preguntar sobre los retenedores?',
    excerpt: 'Preguntas para llevar cuando hable de cómo encaja un retenedor en su vida después de la ortodoncia.',
    sections: [
      ['Empiece por el tipo de retenedor que tiene', 'Los retenedores ayudan a mantener los dientes en su posición después del tratamiento de ortodoncia. Un retenedor fijo va adherido a la cara interna de los dientes. Un retenedor removible se puede quitar para limpiarlo y se usa según el horario que recomiende la ortodoncista. El tipo que tenga influye en lo que conviene preguntar en una revisión.'],
      ['Hable de los detalles prácticos', 'Si tiene un retenedor fijo, pídale a su ortodoncista que le muestre cómo recomienda limpiar a su alrededor. Si es removible, pregunte cómo debe sentirse cuando ajusta bien, cómo cuidarlo y qué horario de uso le corresponde. También puede preguntar cuándo traer el retenedor para una revisión.'],
      ['Traiga el aparato si algo ha cambiado', 'Si un retenedor removible se siente diferente o uno fijo parece haberse aflojado, comuníquese con la clínica y explique qué cambió. Traiga el retenedor o las piezas que conserve si el equipo se lo pide. Una evaluación permite a la ortodoncista revisar el aparato y comentar si conviene algún trabajo, un reemplazo o un seguimiento.'],
      ['Sepa cómo comunicarse con el equipo', 'Cuando le coloquen o revisen un retenedor, pregunte en la clínica cómo programar una revisión si cambia su ajuste o se pierde. Si su tratamiento original se hizo en otro lugar, pregunte qué registros ayudarían al equipo a entender su atención. Son preguntas útiles aunque hoy no necesite un aparato nuevo.'],
    ],
    explore: [
      { label: 'Ortodoncia y aparatos protectores', href: '/services/orthodontics-protective-appliances' },
      { label: 'Contactar al equipo', href: '/contact' },
    ],
  },
  {
    slug: 'preparing-for-a-denture-consultation',
    title: 'Cómo prepararse para una consulta de dentaduras',
    excerpt: 'Una guía para hablar de una primera dentadura, un reemplazo provisional o una dentadura que ya usa.',
    sections: [
      ['Describa qué quiere mejorar', 'Identifique las situaciones de todos los días que le gustaría hacer más fáciles. Puede ser hablar con comodidad, sentirse más tranquilo al comer con otras personas o lograr un mejor ajuste de la dentadura que ya tiene. Los ejemplos concretos le dan al dentista un punto de partida y facilitan hablar de lo que podría lograr un aparato nuevo o ajustado.'],
      ['Pregunte de qué tipo de dentadura se trata', 'Las dentaduras parciales reemplazan algunos dientes de una arcada. Las dentaduras completas reemplazan todos los dientes de una arcada superior o inferior. Una dentadura inmediata puede formar parte de un plan que incluya la extracción de dientes. Pregunte qué tiene en mente el dentista para su situación y qué tendría que pasar antes de fabricar o colocar una dentadura.'],
      ['Deje espacio para preguntas sobre el ajuste y el seguimiento', 'Pregunte cómo revisa la clínica el ajuste, cuándo podría ser útil un seguimiento y a quién puede contactar si tiene dudas mientras se adapta. Si el plan incluye una dentadura inmediata, pregunte cómo podría afectar la cicatrización a su ajuste y si podrían necesitarse ajustes.'],
      ['Traiga lo que le ayude a explicar la situación', 'Si ya tiene una dentadura, pregunte si el dentista quiere que la traiga. Piense en algunos ejemplos de cuándo nota más el ajuste, como al hablar o al comer. Aproveche la visita para tener una idea de las decisiones que vienen y de cuáles pueden esperar hasta después de un examen.'],
    ],
    explore: [
      { label: 'Dentaduras y prostodoncia', href: '/services/dentures-prosthodontics' },
      { label: 'Solicitar una consulta', href: '/appointments' },
    ],
  },
];
