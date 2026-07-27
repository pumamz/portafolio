/**
 * Tecnologias, agrupadas por categoria, con su logotipo.
 *
 * Los iconos vienen de `simple-icons` via astro-icon y se inlinean como SVG
 * en tiempo de build: sin peticiones extra, sin fuente de iconos y sin
 * JavaScript en el cliente.
 *
 * En reposo son monocromos y toman el color del tema. El color de marca
 * aparece SOLO al pasar el cursor: en reposo, veinte logos a todo color
 * convierten la seccion en una bolsa de caramelos y ninguno destaca.
 *
 * **Excepcion documentada a la regla 2 del proyecto** (ningun color escrito
 * a mano): estos hexadecimales no son decisiones del sistema de diseno,
 * son identidad de marca de terceros. El azul de React es #61DAFB y no hay
 * token que pueda expresarlo. Estan acotados a este fichero y solo se usan
 * en hover.
 *
 * Cada marca lleva DOS valores. El cyan de React sobre fondo blanco es
 * ilegible, y el amarillo de JavaScript aun peor; el tema claro necesita
 * versiones oscurecidas que conserven el matiz identificativo.
 *
 * Las marcas monocromas por definicion (Vercel, Railway) no llevan color:
 * su negro desapareceria en tema oscuro, asi que usan el color del tema.
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
  /** Color de marca por tema. Omitir en marcas monocromas. */
  brand?: { light: string; dark: string };
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
        brand: { light: '#C1500A', dark: '#F89820' },
      },
      {
        name: 'Spring Boot',
        icon: 'simple-icons:springboot',
        note: { es: 'API de los tres sistemas', en: 'API of all three systems' },
        brand: { light: '#4A8A28', dark: '#6DB33F' },
      },
      {
        name: 'Spring Security',
        icon: 'simple-icons:springsecurity',
        note: { es: 'JWT y control de accesos', en: 'JWT and access control' },
        brand: { light: '#4A8A28', dark: '#6DB33F' },
      },
      {
        name: 'Node.js',
        icon: 'simple-icons:nodedotjs',
        note: { es: 'Herramientas y scripts', en: 'Tooling and scripts' },
        brand: { light: '#417E35', dark: '#7FC96B' },
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
        brand: { light: '#2C6BB0', dark: '#4E9BE6' },
      },
      {
        name: 'React',
        icon: 'simple-icons:react',
        note: { es: 'Tres proyectos', en: 'Three projects' },
        brand: { light: '#0E7C99', dark: '#61DAFB' },
      },
      {
        name: 'Angular',
        icon: 'simple-icons:angular',
        note: { es: 'Facturacion electronica', en: 'Electronic invoicing' },
        brand: { light: '#C3002F', dark: '#F0396A' },
      },
      {
        name: 'Tailwind CSS',
        icon: 'simple-icons:tailwindcss',
        note: { es: 'Psicopedagogico y Codary', en: 'UDIPSAI and Codary' },
        brand: { light: '#0E8CA8', dark: '#38BDF8' },
      },
      {
        name: 'JavaScript',
        icon: 'simple-icons:javascript',
        note: { es: 'Base de todo el frontend', en: 'Foundation of all frontend' },
        // El amarillo oficial (#F7DF1E) es invisible sobre blanco.
        brand: { light: '#9B7B00', dark: '#F7DF1E' },
      },
      {
        name: 'Bootstrap',
        icon: 'simple-icons:bootstrap',
        note: { es: 'Gestion de gimnasio', en: 'Gym management' },
        brand: { light: '#6A3FA0', dark: '#A681E0' },
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
        brand: { light: '#2F5FBF', dark: '#7BA7F0' },
      },
      {
        name: 'MySQL',
        icon: 'simple-icons:mysql',
        note: { es: 'Facturacion y gimnasio', en: 'Invoicing and gym' },
        brand: { light: '#00618A', dark: '#4DB8DC' },
      },
      {
        name: 'MongoDB',
        icon: 'simple-icons:mongodb',
        note: { es: 'Formacion academica', en: 'Academic coursework' },
        brand: { light: '#2E7D33', dark: '#57C25D' },
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
        brand: { light: '#BF6500', dark: '#FF9900' },
      },
      {
        // Vercel y Railway son monocromas por identidad: su negro
        // desapareceria en tema oscuro. Sin `brand`, usan el color del tema.
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
        brand: { light: '#8A6D00', dark: '#FCC624' },
      },
      {
        name: 'Git',
        icon: 'simple-icons:git',
        note: { es: 'Todos los proyectos', en: 'Every project' },
        brand: { light: '#C4341E', dark: '#F05032' },
      },
    ],
  },
];
