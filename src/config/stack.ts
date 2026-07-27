/**
 * Tecnologias, agrupadas por categoria.
 *
 * Agrupadas y no como nube de logos por dos motivos:
 *   1. Un reclutador busca una tecnologia concreta; la categoria le dice
 *      donde mirar sin leerlo todo.
 *   2. La agrupacion demuestra que entiendes el papel de cada pieza, cosa
 *      que una lista plana de veinte nombres no transmite.
 *
 * Regla: aqui solo entra lo que se ha usado en un proyecto real de los que
 * aparecen en el sitio. Un listado inflado se detecta en la primera
 * pregunta tecnica de una entrevista.
 */

export const stack = [
  {
    id: 'languages',
    label: { es: 'Lenguajes', en: 'Languages' },
    items: ['Java', 'TypeScript', 'JavaScript', 'SQL', 'HTML5', 'CSS3'],
  },
  {
    id: 'backend',
    label: { es: 'Backend', en: 'Backend' },
    items: ['Spring Boot', 'Spring Security (JWT)', 'Node.js'],
  },
  {
    id: 'frontend',
    label: { es: 'Frontend', en: 'Frontend' },
    items: ['React', 'Angular', 'Tailwind CSS', 'Bootstrap'],
  },
  {
    id: 'data',
    label: { es: 'Bases de datos', en: 'Databases' },
    items: ['PostgreSQL', 'MySQL', 'MongoDB'],
  },
  {
    id: 'ops',
    label: { es: 'Infraestructura', en: 'Infrastructure' },
    items: ['AWS EC2', 'Vercel', 'Railway', 'Linux', 'Git'],
  },
] as const;

export type StackGroup = (typeof stack)[number];
