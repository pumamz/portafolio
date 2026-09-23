/**
 * Diccionario de textos de interfaz.
 *
 * Regla del proyecto: NINGUNA cadena visible se escribe dentro de un
 * componente. Todas viven aqui. Beneficios concretos:
 *   1. Anadir un idioma = anadir una clave, no auditar 40 ficheros.
 *   2. TypeScript falla en build si a un idioma le falta una traduccion.
 *   3. Se pueden revisar todos los textos del sitio de una sentada.
 *
 * Los textos largos (bio, casos de estudio) NO van aqui: van en
 * content collections como Markdown.
 */

export const languages = {
  es: 'Espanol',
  en: 'English',
} as const;

export const defaultLang = 'es' as const;

export type Lang = keyof typeof languages;

export const ui = {
  es: {
    'nav.work': 'Proyectos',
    'nav.about': 'Sobre mi',
    'nav.stack': 'Stack',
    'nav.services': 'Servicios',
    'nav.contact': 'Contacto',
    'nav.skipToContent': 'Saltar al contenido principal',
    'nav.toggleTheme': 'Cambiar tema',
    'nav.toggleMenu': 'Abrir menu',

    'hero.role': 'Ingeniero de Software',
    'hero.cta.primary': 'Hablemos',
    'hero.cta.secondary': 'Ver proyectos',
    /* El titular va en dos lineas y la segunda se pinta en el acento.
       Se parten aqui y no con un <br> dentro del componente porque el
       punto de corte cambia entre idiomas. */
    'hero.claim.line1': 'Sistemas completos,',
    'hero.claim.line2': 'no prototipos.',
    'hero.claim.support':
      'Cuatro sistemas construidos de punta a punta: backend, interfaz y despliegue.',
    'hero.identity': 'Perfil',
    'hero.meta': 'Portafolio',
    'hero.index': 'Secciones',

    'work.title': 'Proyectos seleccionados',
    'work.intro':
      'Sistemas completos, cada uno con un requisito real detras. Esto es lo que resolvia cada uno.',
    'work.viewCase': 'Ver caso completo',
    'work.viewAll': 'Ver todos los proyectos',
    'work.viewLive': 'Ver en vivo',
    'work.viewCode': 'Ver codigo',
    'work.problem': 'El problema',
    'work.solution': 'La solucion',
    'work.impact': 'El impacto',
    'work.role': 'Mi rol',
    'work.period': 'Periodo',
    'work.stack': 'Tecnologias',
    'work.back': 'Volver a proyectos',
    'work.indexTitle': 'Proyectos',

    'about.title': 'Sobre mi',
    'about.education': 'Formacion',
    'about.downloadCv': 'Descargar CV',
    'about.photoAlt': 'Retrato de Daniel Puma',

    'stack.title': 'Con que trabajo',
    'stack.intro':
      'Solo tecnologias que he usado en los proyectos de arriba. Pasa el cursor para ver donde.',
    'stack.sphereLabel': 'Esfera interactiva de tecnologias',
    'stack.sphereHint': 'Arrastra para girar',

    'timeline.title': 'Como llegue hasta aqui',
    'timeline.intro':
      'Los proyectos sueltos no cuentan una progresion. En orden si: primer sistema en produccion, primera integracion con un organismo publico, primer equipo a cargo.',

    'services.title': 'En que puedo ayudarte',
    'services.intro':
      'Trabajo por encargo en proyectos donde ya he construido algo parecido. Si lo que necesitas no esta en esta lista, te lo digo antes de empezar.',
    'services.cta': 'Cuentame tu proyecto',
    'services.note':
      'Respondo en menos de 24 horas. La primera conversacion sirve para ver si encaja, y no compromete a nada.',

    'stats.projects': 'Sistemas construidos',
    'stats.led': 'Proyectos liderados',
    'stats.since': 'Programando desde',
    'stats.stack': 'Tecnologias en uso',

    'contact.title': 'Construyamos algo',
    'contact.intro':
      'Busco practicas o pasantias en sistemas empresariales, infraestructura y seguridad. Si encaja con lo que necesitas, escribeme.',
    'contact.email': 'Escribeme',
    'contact.copy': 'Copiar correo',
    'contact.copied': 'Copiado',
    'contact.availability': 'Disponible para practicas y pasantias',

    'footer.rights': 'Todos los derechos reservados',
    'footer.builtWith': 'Hecho con',

    '404.title': 'Pagina no encontrada',
    '404.body': 'La pagina que buscas no existe o cambio de direccion.',
    '404.cta': 'Volver al inicio',
  },

  en: {
    'nav.work': 'Work',
    'nav.about': 'About',
    'nav.stack': 'Stack',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'nav.skipToContent': 'Skip to main content',
    'nav.toggleTheme': 'Toggle theme',
    'nav.toggleMenu': 'Open menu',

    'hero.role': 'Software Engineer',
    'hero.cta.primary': "Let's talk",
    'hero.cta.secondary': 'View work',
    'hero.claim.line1': 'Complete systems,',
    'hero.claim.line2': 'not prototypes.',
    'hero.claim.support': 'Four systems built end to end: backend, interface and deployment.',
    'hero.identity': 'Profile',
    'hero.meta': 'Portfolio',
    'hero.index': 'Sections',

    'work.title': 'Selected work',
    'work.intro':
      'Complete systems, each with a real constraint behind it. Here is what each one solved.',
    'work.viewCase': 'Read case study',
    'work.viewAll': 'View all work',
    'work.viewLive': 'View live',
    'work.viewCode': 'View code',
    'work.problem': 'The problem',
    'work.solution': 'The solution',
    'work.impact': 'The impact',
    'work.role': 'My role',
    'work.period': 'Timeline',
    'work.stack': 'Tech stack',
    'work.back': 'Back to work',
    'work.indexTitle': 'Work',

    'about.title': 'About',
    'about.education': 'Education',
    'about.downloadCv': 'Download CV',
    'about.photoAlt': 'Portrait of Daniel Puma',

    'stack.title': 'What I work with',
    'stack.intro': 'Only technologies I have used in the projects above. Hover to see where.',
    'stack.sphereLabel': 'Interactive technology sphere',
    'stack.sphereHint': 'Drag to rotate',

    'timeline.title': 'How I got here',
    'timeline.intro':
      'Projects on their own do not show progression. In order they do: first system in production, first integration with a public authority, first team to lead.',

    'services.title': 'How I can help',
    'services.intro':
      'I take freelance work in areas where I have already built something similar. If what you need is not on this list, I will tell you before we start.',
    'services.cta': 'Tell me about your project',
    'services.note':
      'I reply within 24 hours. The first conversation is to find out whether it is a fit, and commits you to nothing.',

    'stats.projects': 'Systems built',
    'stats.led': 'Projects led',
    'stats.since': 'Coding since',
    'stats.stack': 'Technologies in use',

    'contact.title': "Let's build something",
    'contact.intro':
      'I am looking for an internship in enterprise systems, infrastructure and security. If that fits what you need, get in touch.',
    'contact.email': 'Email me',
    'contact.copy': 'Copy email',
    'contact.copied': 'Copied',
    'contact.availability': 'Available for internships',

    'footer.rights': 'All rights reserved',
    'footer.builtWith': 'Built with',

    '404.title': 'Page not found',
    '404.body': 'The page you are looking for does not exist or has moved.',
    '404.cta': 'Back home',
  },
} as const;

/**
 * Fuerza en tiempo de compilacion que EN tenga exactamente las mismas
 * claves que ES. Si anades 'nav.blog' solo a ES, `tsc` falla aqui
 * en lugar de mostrar una cadena vacia en produccion.
 */
type UiKeys = keyof (typeof ui)['es'];
type _EnsureParity = Record<Lang, Record<UiKeys, string>>;
const _check: _EnsureParity = ui;
void _check;
