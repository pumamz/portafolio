/**
 * Tecnologias, agrupadas por categoria, con su logotipo.
 *
 * Los iconos vienen de `simple-icons` via astro-icon y se inlinean como SVG
 * en tiempo de build: sin peticiones extra, sin fuente de iconos y sin
 * JavaScript en el cliente.
 *
 * Son monocromos (`currentColor`) a proposito. Usar los colores de marca
 * originales convertiria la seccion en una bolsa de caramelos y romperia
 * la regla 2 del proyecto: aqui el color lo pone el tema, y el acento se
 * reserva para el estado de hover.
 *
 * Regla de contenido: solo entra lo usado en un proyecto publicado. Un
 * listado inflado se cae en la primera pregunta tecnica de una entrevista.
 */

export interface Tech {
  name: string;
  /** Identificador de Iconify. */
  icon: string;
  /** Donde se ha usado. Se muestra al pasar por encima. */
  note: { es: string; en: string };
}

export interface StackGroup {
  id: string;
  label: { es: string; en: string };
  /** Peso visual en la rejilla. Los grupos nucleares ocupan mas. */
  span: 'wide' | 'normal';
  items: Tech[];
}

export const stack: StackGroup[] = [
  {
    id: 'backend',
    label: { es: 'Backend', en: 'Backend' },
    span: 'wide',
    items: [
      {
        name: 'Java',
        // simple-icons retiro `java` por marca registrada; openjdk es el
        // sustituto oficial del propio conjunto de iconos.
        icon: 'simple-icons:openjdk',
        note: { es: 'Los cuatro sistemas', en: 'All four systems' },
      },
      {
        name: 'Spring Boot',
        icon: 'simple-icons:springboot',
        note: { es: 'API de los tres sistemas', en: 'API of all three systems' },
      },
      {
        name: 'Spring Security',
        icon: 'simple-icons:springsecurity',
        note: { es: 'JWT y control de accesos', en: 'JWT and access control' },
      },
      {
        name: 'Node.js',
        icon: 'simple-icons:nodedotjs',
        note: { es: 'Herramientas y scripts', en: 'Tooling and scripts' },
      },
    ],
  },
  {
    id: 'frontend',
    label: { es: 'Frontend', en: 'Frontend' },
    span: 'wide',
    items: [
      {
        name: 'TypeScript',
        icon: 'simple-icons:typescript',
        note: { es: 'Psicopedagogico y este sitio', en: 'UDIPSAI and this site' },
      },
      {
        name: 'React',
        icon: 'simple-icons:react',
        note: { es: 'Tres proyectos', en: 'Three projects' },
      },
      {
        name: 'Angular',
        icon: 'simple-icons:angular',
        note: { es: 'Facturacion electronica', en: 'Electronic invoicing' },
      },
      {
        name: 'Tailwind CSS',
        icon: 'simple-icons:tailwindcss',
        note: { es: 'Psicopedagogico y Codary', en: 'UDIPSAI and Codary' },
      },
      {
        name: 'JavaScript',
        icon: 'simple-icons:javascript',
        note: { es: 'Base de todo el frontend', en: 'Foundation of all frontend' },
      },
      {
        name: 'Bootstrap',
        icon: 'simple-icons:bootstrap',
        note: { es: 'Gestion de gimnasio', en: 'Gym management' },
      },
    ],
  },
  {
    id: 'data',
    label: { es: 'Datos', en: 'Data' },
    span: 'normal',
    items: [
      {
        name: 'PostgreSQL',
        icon: 'simple-icons:postgresql',
        note: { es: 'Historiales clinicos', en: 'Clinical records' },
      },
      {
        name: 'MySQL',
        icon: 'simple-icons:mysql',
        note: { es: 'Facturacion y gimnasio', en: 'Invoicing and gym' },
      },
      {
        name: 'MongoDB',
        icon: 'simple-icons:mongodb',
        note: { es: 'Formacion academica', en: 'Academic coursework' },
      },
    ],
  },
  {
    id: 'ops',
    label: { es: 'Infraestructura', en: 'Infrastructure' },
    span: 'normal',
    items: [
      {
        name: 'AWS EC2',
        icon: 'simple-icons:amazonec2',
        note: { es: 'Despliegue del gimnasio', en: 'Gym deployment' },
      },
      {
        name: 'Vercel',
        icon: 'simple-icons:vercel',
        note: { es: 'Codary y este sitio', en: 'Codary and this site' },
      },
      {
        name: 'Railway',
        icon: 'simple-icons:railway',
        note: { es: 'Entornos de prueba', en: 'Staging environments' },
      },
      {
        name: 'Linux',
        icon: 'simple-icons:linux',
        note: { es: 'Servidores y desarrollo', en: 'Servers and development' },
      },
      {
        name: 'Git',
        icon: 'simple-icons:git',
        note: { es: 'Todos los proyectos', en: 'Every project' },
      },
    ],
  },
];
