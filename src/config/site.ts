/**
 * Datos del sitio y de la persona.
 *
 * Fuente unica de verdad para nombre, enlaces y metadatos.
 * Cambiar el correo aqui lo cambia en el header, el footer, el JSON-LD y
 * las etiquetas Open Graph a la vez.
 *
 * Origen de los datos: docs/perfil.md (extraido del CV).
 * Telefono y direccion exacta se omiten deliberadamente: el repositorio es
 * publico y un dato personal indexado atrae spam.
 */

export const site = {
  /** Nombre corto para el sitio. El legal completo es Cesar Daniel Puma Munoz. */
  name: 'Daniel Puma',

  /** Describe lo que hace, no un titulo academico que aun esta en curso.
   *  La condicion de estudiante se declara de forma explicita en "Sobre mi". */
  jobTitle: {
    es: 'Desarrollador de Software',
    en: 'Software Developer',
  },

  /** TODO: reemplazar por el dominio real antes del primer deploy publico. */
  url: 'https://portafolio.vercel.app',

  email: 'dpumamunoz@gmail.com',

  location: { es: 'Cuenca, Ecuador', en: 'Cuenca, Ecuador' },

  /** Vacio = no se renderiza el enlace. Pendiente de definir por el autor. */
  social: {
    github: '',
    linkedin: '',
    x: '',
  },

  /** Vacio = no se muestra el boton de descarga.
   *  Pendiente: subir a public/ una version del CV sin datos personales. */
  cv: {
    es: '',
    en: '',
  },

  /** Meta description. Entre 150 y 160 caracteres es lo optimo. */
  description: {
    es: 'Desarrollador de software en Cuenca, Ecuador. Construyo sistemas empresariales completos con Spring Boot, React y PostgreSQL, del backend al despliegue.',
    en: 'Software developer in Cuenca, Ecuador. I build complete enterprise systems with Spring Boot, React and PostgreSQL, from backend to deployment.',
  },

  ogImage: '/og-default.png',
} as const;

export type Site = typeof site;
