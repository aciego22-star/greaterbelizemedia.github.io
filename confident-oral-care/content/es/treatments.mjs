// Spanish treatment copy. Same structure and slugs as ../treatments.mjs; names and aliases in Spanish.
// Translation draft for review by the clinic before public launch.

export const servicesIndex = {
  title: 'Servicios dentales y de ortodoncia en Belize City',
  intro: 'Desde una limpieza de rutina hasta una conversación sobre una corona o una dentadura que ya tiene, el mejor punto de partida depende de lo que quiera atender. Conozca la atención disponible en ConfiDent Oral Care. Si está decidiendo qué visita solicitar, una consulta es el espacio para hablar de sus preguntas.',
  metaDescription: 'Conozca los servicios dentales y de ortodoncia de ConfiDent Oral Care en The Boardwalk Belize: consultas, prevención, retenedores, coronas, tratamientos de conducto, extracciones y dentaduras.',
};

export const categories = [
  {
    slug: 'consultations-diagnostics',
    title: 'Consultas y diagnóstico',
    card: 'Hable de sus inquietudes y conozca qué información puede ayudar a su dentista a planear el siguiente paso.',
    metaDescription: 'Hable con ConfiDent Oral Care sobre consultas dentales, consultas de ortodoncia y radiografías digitales en The Boardwalk Belize, Belize City.',
    introHeading: 'Un punto de partida',
    intro: 'Una consulta le da tiempo para explicar qué le trae y hacer las preguntas que ha estado guardando. Su dentista puede comentar los hallazgos con usted y explicar si un examen, imágenes o una visita de seguimiento ayudarían a aclarar el siguiente paso.',
    names: {
      'general-consultations': 'Consultas generales',
      'orthodontic-consultations': 'Consultas de ortodoncia',
      'digital-x-rays': 'Radiografías digitales',
    },
    aliases: {
      'general-consultations': ['consulta', 'consulta general', 'consulta dental', 'primera consulta', 'chequeo', 'revisión'],
      'orthodontic-consultations': ['consulta de ortodoncia', 'ortodoncia', 'ortodoncista'],
      'digital-x-rays': ['radiografía', 'radiografias', 'rayos x', 'rayos equis'],
    },
    sections: {
      'general-consultations': 'Puede usar una consulta general para hablar del cuidado dental de todos los días, de un cambio que ha notado o de un tratamiento que está considerando. Traiga las preguntas que quiere resolver, aunque sea solo una. Su dentista puede revisar sus inquietudes y explicarle qué puede establecer un examen, qué podría necesitar una revisión más detallada y cómo decidir qué atender primero.',
      'orthodontic-consultations': 'Si tiene preguntas sobre la posición de sus dientes, cómo encaja su mordida o la ortodoncia que ha tenido antes, tráigalas a una consulta de ortodoncia. La Dra. Haylock puede revisar sus objetivos y comentar qué registros o exámenes podrían ser útiles. También es una oportunidad para preguntar cómo encajaría un plan de atención en su rutina diaria.',
      'digital-x-rays': 'Las radiografías dentales pueden ayudar a su dentista a ver detalles difíciles de evaluar solo mirando la boca, como las zonas entre los dientes o alrededor de las raíces. Su dentista puede explicarle por qué una imagen puede ser útil en su visita y qué aporta al examen. Si tiene imágenes recientes, pregunte en la clínica cómo compartirlas para su revisión.',
    },
    nextSteps: [
      { label: 'Solicitar una consulta', href: '/appointments' },
      { label: 'Planear su primera visita', href: '/first-visit' },
    ],
  },
  {
    slug: 'general-preventive-dentistry',
    title: 'Odontología general y preventiva',
    card: 'Conozca las limpiezas, el cuidado preventivo, los empastes y el blanqueamiento dental.',
    metaDescription: 'Conozca las limpiezas, el flúor, los selladores, los empastes y el blanqueamiento dental en ConfiDent Oral Care, Belize City.',
    introHeading: 'Cuidado para su salud bucal de cada día',
    intro: 'Algunas visitas son para mantener el cuidado de rutina. Otras empiezan con un cambio que ha notado, un empaste que quiere revisar o una pregunta sobre el color de sus dientes. Una visita le permite entender lo que implica y decidir qué quiere atender.',
    names: {
      cleanings: 'Limpiezas',
      'fluoride-treatments': 'Tratamientos con flúor',
      'dental-sealants': 'Selladores dentales',
      fillings: 'Empastes',
      'teeth-whitening': 'Blanqueamiento dental',
    },
    aliases: {
      cleanings: ['limpieza', 'limpieza dental', 'profilaxis'],
      'fluoride-treatments': ['flúor', 'fluor', 'fluoruro'],
      'dental-sealants': ['sellador', 'selladores'],
      fillings: ['empaste', 'relleno', 'rellenos', 'calza', 'resina', 'caries'],
      'teeth-whitening': ['blanqueamiento', 'blanquear', 'dientes blancos'],
    },
    sections: {
      cleanings: 'Una limpieza profesional elimina acumulaciones como la placa y el sarro endurecido en zonas difíciles de limpiar en casa. Puede aprovechar la visita para preguntar por las zonas de difícil acceso o por cambios que haya notado en sus encías. Si le preocupa la sensibilidad durante la limpieza, dígaselo al equipo para que puedan hablar de sus inquietudes antes de empezar.',
      'fluoride-treatments': 'El flúor ayuda a fortalecer el esmalte dental y a reducir el riesgo de caries. Una visita es la oportunidad para preguntar si el flúor profesional sería útil para usted o para un familiar y cómo encaja en su cuidado habitual. Su dentista puede tener en cuenta el estado de sus dientes y su historial de caries al hablar de las opciones.',
      'dental-sealants': 'Algunas muelas tienen surcos profundos en su superficie de masticación. Un sellador es una capa protectora que cubre esos surcos y ayuda a prevenir caries en ellos. Puede preguntar al dentista qué dientes podrían beneficiarse de los selladores y qué revisa con el tiempo para ver cómo se mantiene un sellador.',
      fillings: 'Un empaste puede restaurar la parte de un diente afectada por caries o por ciertos tipos de daño. Su dentista puede examinar la zona y explicarle si un empaste es adecuado, qué materiales podrían aplicar y qué parte del diente necesita atención. Si viene porque un empaste que ya tiene se siente diferente, mencione dónde está y cuándo notó el cambio por primera vez.',
      'teeth-whitening': 'Si le gustaría hablar de una sonrisa más luminosa, una consulta de blanqueamiento puede ayudarle a entender qué cambios podrían ser posibles. El dentista puede revisar el color de sus dientes naturales y de los empastes o coronas visibles, que responden de forma distinta al esmalte natural. Pregunte por el método disponible en la clínica, la posible sensibilidad y cómo podría ser un resultado realista para usted.',
    },
    nextSteps: [
      { label: 'Preguntar por una visita de odontología general', href: '/appointments' },
    ],
  },
  {
    slug: 'orthodontics-protective-appliances',
    title: 'Ortodoncia y aparatos protectores',
    card: 'Conozca los protectores bucales y los retenedores fijos o removibles.',
    metaDescription: 'Conozca los protectores bucales, los retenedores fijos y los retenedores removibles en ConfiDent Oral Care, Belize City.',
    introHeading: 'Apoyo para su sonrisa en el día a día',
    intro: 'El aparato adecuado depende de para qué lo necesita. Puede que busque protección al hacer deporte, ayuda para mantener la posición de los dientes después de la ortodoncia o una revisión de un retenedor que ya usa. Traiga sus preguntas y el aparato correspondiente para hablarlo con el equipo.',
    names: {
      mouthguards: 'Protectores bucales',
      'fixed-retainers': 'Retenedores fijos',
      'removable-retainers': 'Retenedores removibles',
    },
    aliases: {
      mouthguards: ['protector bucal', 'protector', 'protector deportivo'],
      'fixed-retainers': ['retenedor fijo'],
      'removable-retainers': ['retenedor removible', 'retenedor', 'retenedores'],
    },
    sections: {
      mouthguards: 'Un protector bucal amortigua los dientes y las zonas cercanas durante actividades en las que puede haber un golpe en la boca. Si practica un deporte y quiere hablar de un protector bucal, cuéntele al equipo qué deporte practica, con qué frecuencia usa protección y si ya tiene un aparato. Esos detalles ayudan al dentista a hablar del ajuste y de las opciones disponibles para usted.',
      'fixed-retainers': 'Un retenedor fijo va adherido a la cara interna de los dientes para ayudar a mantener su posición después del tratamiento de ortodoncia. Si tiene uno, puede preguntar cómo limpiar a su alrededor y cuándo revisarlo. Si lo siente flojo o diferente, comuníquese con el equipo para una evaluación del retenedor y de los dientes que sostiene.',
      'removable-retainers': 'Un retenedor removible se puede quitar para limpiarlo y se usa según el horario que recomiende su ortodoncista. Si un retenedor que ya tiene se ha desgastado, ha cambiado de ajuste o se ha perdido, el equipo puede indicarle cómo programar una revisión. Tráigalo si todavía lo tiene para que la ortodoncista pueda evaluar su estado y hablar del siguiente paso.',
    },
    nextSteps: [
      { label: 'Solicitar una consulta de ortodoncia', href: '/appointments' },
      { label: 'Conocer las consultas', href: '/services/consultations-diagnostics' },
    ],
  },
  {
    slug: 'crowns-recementation',
    title: 'Coronas y recementación',
    card: 'Hable de una corona de zirconia o haga evaluar una corona floja o que se ha salido.',
    metaDescription: 'Hable de coronas de zirconia o haga evaluar una corona floja o desprendida en ConfiDent Oral Care, Belize City.',
    introHeading: 'Una mirada de cerca a un diente o una corona',
    intro: 'A veces la conversación es sobre restaurar un diente. A veces la inquietud es una corona que ya tiene. En ambos casos, el dentista puede evaluar el diente y explicarle lo que es posible según su estado, cómo encaja en su mordida y lo que usted quiere lograr.',
    names: {
      'zirconia-crowns': 'Coronas de zirconia',
      'crown-recementation': 'Recementación de coronas',
    },
    aliases: {
      'zirconia-crowns': ['corona de zirconia', 'corona', 'coronas', 'corona de cerámica'],
      'crown-recementation': ['corona floja', 'se me cayó la corona', 'se salió la corona', 'recementar', 'recementación'],
    },
    sections: {
      'zirconia-crowns': 'Una corona cubre un diente preparado para restaurar su forma y ayudarle a funcionar. La zirconia es uno de los materiales cerámicos que se usan para coronas. Si está considerando una, puede preguntar cómo evalúa el dentista el diente, cómo se eligen el color y la forma, y qué implica el proceso desde la preparación hasta la colocación. La opción adecuada depende del diente y de su examen.',
      'crown-recementation': 'Si una corona se ha aflojado o se ha salido, tráigala si todavía la tiene. En la visita, el dentista puede evaluar la corona, el diente que está debajo y si la corona todavía ajusta lo suficiente para volver a colocarla. Esa evaluación ayuda a determinar si la recementación es posible o si se necesita otra visita o tratamiento.',
    },
    nextSteps: [
      { label: 'Contactar al equipo por una corona floja', href: '/contact' },
      { label: 'Solicitar una evaluación', href: '/appointments' },
    ],
  },
  {
    slug: 'root-canal-treatments',
    title: 'Tratamientos de conducto',
    card: 'Conozca el tratamiento de dientes delanteros y posteriores y la evaluación para un retratamiento.',
    metaDescription: 'Conozca el tratamiento de conducto de dientes delanteros y posteriores y el retratamiento endodóntico en ConfiDent Oral Care, Belize City.',
    introHeading: 'Una conversación sobre cómo conservar un diente',
    intro: 'El tratamiento de conducto atiende un problema en la pulpa, el tejido del interior del diente, cuando el dentista considera que el diente es adecuado para este enfoque. Una evaluación puede ayudarle a entender qué está evaluando el dentista, qué implicaría el tratamiento y qué restauración podría necesitar el diente después.',
    names: {
      'anterior-and-posterior-root-canal-treatment': 'Tratamiento de conducto anterior y posterior',
      'root-canal-retreatment': 'Retratamiento de conducto',
    },
    aliases: {
      'anterior-and-posterior-root-canal-treatment': ['tratamiento de conducto', 'conducto', 'endodoncia', 'matar el nervio', 'nervio'],
      'root-canal-retreatment': ['retratamiento', 'retratamiento de conducto'],
    },
    sections: {
      'anterior-and-posterior-root-canal-treatment': 'Ofrecemos tratamiento de conducto para dientes anteriores, en la parte delantera de la boca, y posteriores, hacia el fondo. La forma y el número de conductos pueden variar de un diente a otro. Pregúntele al dentista qué ha encontrado en el diente que está evaluando, qué significa eso para la visita y cómo podría restaurarse el diente después.',
      'root-canal-retreatment': 'Si un diente que ya recibió tratamiento de conducto necesita otra evaluación, el dentista puede revisar el trabajo existente y comentar si el retratamiento es una opción. Por lo general, el retratamiento implica volver a abrir el diente para evaluar, limpiar y sellar de nuevo sus conductos. Si tiene registros o imágenes del tratamiento anterior, pregunte en la clínica si debe traerlos a la consulta.',
    },
    nextSteps: [
      { label: 'Solicitar una evaluación', href: '/appointments' },
      { label: 'Preguntar a la clínica por registros anteriores', href: '/contact' },
    ],
  },
  {
    slug: 'extractions-oral-surgery',
    title: 'Extracciones y cirugía oral',
    card: 'Conozca las extracciones dentales, las extracciones quirúrgicas y la evaluación de la alveolitis seca.',
    metaDescription: 'Conozca las extracciones dentales, las extracciones quirúrgicas y la atención de la alveolitis seca en ConfiDent Oral Care, Belize City.',
    introHeading: 'Entienda el plan antes de su visita',
    intro: 'Si es posible que haya que retirar un diente, puede preguntar por qué lo recomienda el dentista, qué podría implicar la cita y cómo organizarse para el tiempo después. El examen ayuda al dentista a explicar qué enfoque es el adecuado para ese diente.',
    names: {
      'tooth-extractions': 'Extracciones dentales',
      'surgical-extractions': 'Extracciones quirúrgicas',
      'dry-socket-care': 'Atención de alveolitis seca',
    },
    aliases: {
      'tooth-extractions': ['extracción', 'extraccion', 'sacar un diente', 'sacar una muela', 'extraer'],
      'surgical-extractions': ['extracción quirúrgica', 'cirugía', 'cordal', 'muela del juicio'],
      'dry-socket-care': ['alveolitis', 'alveolitis seca'],
    },
    sections: {
      'tooth-extractions': 'Una extracción es la retirada de un diente. El dentista puede explicarle por qué se considera la extracción, qué otras opciones podrían ser relevantes y qué seguimiento podría necesitar la zona. Si se recomienda una extracción, pregunte qué pasos puede esperar en la cita y cómo comunicarse con la clínica si tiene alguna pregunta después.',
      'surgical-extractions': 'Se puede considerar un enfoque quirúrgico cuando la posición o el estado de un diente hace más difícil acceder a él. Su dentista puede explicarle cómo se evaluará el diente, por qué un enfoque quirúrgico podría ser adecuado y qué tener en cuenta para la recuperación. Comente con el equipo cualquier inquietud práctica, como viajes o compromisos de trabajo, al hablar del momento de su visita.',
      'dry-socket-care': 'La alveolitis seca es una complicación que puede presentarse después de una extracción. Si el dolor aumenta después de que le retiraron un diente, llame a la clínica para que el equipo dental le indique si debe ser atendido. En una evaluación, el dentista puede revisar la zona, hablar de lo que podría estar causando la molestia y explicar qué atención o seguimiento corresponde.',
    },
    nextSteps: [
      { label: 'Llamar a la clínica tras una extracción', href: '/contact' },
      { label: 'Solicitar una evaluación', href: '/appointments' },
    ],
  },
  {
    slug: 'dentures-prosthodontics',
    title: 'Dentaduras y prostodoncia',
    card: 'Conozca las dentaduras parciales, temporales, inmediatas y completas.',
    metaDescription: 'Conozca las dentaduras parciales, los flippers, las dentaduras inmediatas y las dentaduras completas en ConfiDent Oral Care, Belize City.',
    introHeading: 'Hable de sus opciones para reemplazar dientes',
    intro: 'Cuando faltan dientes, elegir una dentadura puede traer preguntas sobre la apariencia, la comodidad, la alimentación y lo que pasará durante el ajuste. Una consulta le da espacio para hablar de qué dientes se van a reemplazar, de sus preferencias y del seguimiento que podría necesitar mientras se adapta.',
    names: {
      'partial-dentures': 'Dentaduras parciales',
      flippers: 'Flippers (dentadura parcial temporal)',
      'immediate-dentures': 'Dentaduras inmediatas',
      'full-dentures': 'Dentaduras completas',
    },
    aliases: {
      'partial-dentures': ['dentadura parcial', 'parcial', 'placa parcial', 'prótesis parcial'],
      flippers: ['flipper', 'dentadura temporal', 'prótesis temporal'],
      'immediate-dentures': ['dentadura inmediata'],
      'full-dentures': ['dentadura completa', 'dentadura total', 'placa completa', 'dentadura', 'dentaduras', 'placa'],
    },
    sections: {
      'partial-dentures': 'Una dentadura parcial reemplaza algunos dientes que faltan cuando todavía tiene dientes naturales en la misma arcada. En una consulta puede hablar de qué espacios llenaría, cómo se ajusta la dentadura a los dientes que tiene y qué implicaría usarla y cuidarla. Traiga la dentadura parcial que ya tenga si quiere que el dentista revise su ajuste.',
      flippers: 'Un flipper es una dentadura parcial removible que se usa a menudo como opción temporal para uno o más dientes que faltan. Si está considerando un reemplazo provisional, pregunte cómo encajaría en su plan general, por cuánto tiempo el dentista espera que sea adecuado para su situación y qué puede esperar al hablar o comer con él.',
      'immediate-dentures': 'Una dentadura inmediata se fabrica con anticipación para colocarla cuando se retiran los dientes, si eso forma parte de la atención planeada. El ajuste puede cambiar a medida que la boca sana. En la visita de planificación, pregunte qué hay que preparar con antelación y qué citas de ajuste o seguimiento podrían ser adecuadas para usted.',
      'full-dentures': 'Una dentadura completa reemplaza todos los dientes de una arcada superior o inferior. Aproveche la consulta para hablar de la apariencia que le gustaría, de sus preguntas sobre el ajuste y la comodidad, y de cómo planea el dentista revisar la dentadura después de colocarla. Si ya usa dentadura, traerla puede ayudarle a mostrar al equipo qué le gustaría mejorar.',
    },
    nextSteps: [
      { label: 'Solicitar una consulta de dentaduras', href: '/appointments' },
      { label: 'Leer la guía para la consulta de dentaduras', href: '/blog/preparing-for-a-denture-consultation' },
    ],
  },
];
