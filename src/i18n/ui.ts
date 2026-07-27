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
    'nav.contact': 'Contacto',
    'nav.skipToContent': 'Saltar al contenido principal',
    'nav.toggleTheme': 'Cambiar tema',
    'nav.toggleMenu': 'Abrir menu',

    'hero.role': 'Ingeniero de Software',
    'hero.cta.primary': 'Hablemos',
    'hero.cta.secondary': 'Ver proyectos',
    'hero.scroll': 'Desplaza',

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
    'stack.intro': 'Solo tecnologias que he usado en los proyectos de arriba.',

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
    'nav.contact': 'Contact',
    'nav.skipToContent': 'Skip to main content',
    'nav.toggleTheme': 'Toggle theme',
    'nav.toggleMenu': 'Open menu',

    'hero.role': 'Software Engineer',
    'hero.cta.primary': "Let's talk",
    'hero.cta.secondary': 'View work',
    'hero.scroll': 'Scroll',

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
    'stack.intro': 'Only technologies I have used in the projects above.',

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
