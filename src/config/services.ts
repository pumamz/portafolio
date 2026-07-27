/**
 * Servicios ofrecidos.
 *
 * Existe porque el sitio tiene DOS objetivos (ver `docs/requirements.md`) y
 * hasta ahora solo cubria uno. Un reclutador entra a juzgar el trabajo; un
 * cliente potencial entra a saber si le puedes resolver un problema, y eso
 * no se deduce de una lista de proyectos universitarios.
 *
 * Regla de honestidad: aqui solo entra lo que ya esta construido y
 * desplegado en la seccion de proyectos. Ofrecer algo que no se ha hecho
 * nunca se descubre en la primera llamada y cuesta el encargo entero.
 */

export interface Service {
  icon: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
  /** Entregables concretos. Nada de adjetivos: cosas que se reciben. */
  points: { es: string[]; en: string[] };
}

export const services: Service[] = [
  {
    icon: 'lucide:layout-dashboard',
    title: {
      es: 'Sistemas de gestion a medida',
      en: 'Custom management systems',
    },
    description: {
      es: 'Aplicaciones internas completas: usuarios, permisos, registros y reportes. Lo mismo que ya funciona en una unidad de atencion universitaria y en un gimnasio.',
      en: 'Complete internal applications: users, permissions, records and reports. The same thing already running at a university care unit and at a gym.',
    },
    points: {
      es: [
        'Autenticacion y roles con Spring Security',
        'Modelo de datos relacional en PostgreSQL o MySQL',
        'Panel en React o Angular',
      ],
      en: [
        'Authentication and roles with Spring Security',
        'Relational data model in PostgreSQL or MySQL',
        'Dashboard in React or Angular',
      ],
    },
  },
  {
    icon: 'lucide:server',
    title: {
      es: 'APIs e integraciones',
      en: 'APIs and integrations',
    },
    description: {
      es: 'Servicios REST y conexion con sistemas de terceros que no se pueden negociar, como la facturacion electronica del SRI.',
      en: 'REST services and integration with third-party systems you do not get to negotiate with, such as Ecuador tax authority e-invoicing.',
    },
    points: {
      es: [
        'API REST documentada con Spring Boot',
        'Integracion con servicios externos y validaciones fiscales',
        'Despliegue en AWS, Railway o Vercel',
      ],
      en: [
        'Documented REST API with Spring Boot',
        'Third-party integration and regulatory validation',
        'Deployment on AWS, Railway or Vercel',
      ],
    },
  },
  {
    icon: 'lucide:gauge',
    title: {
      es: 'Sitios de producto y landing pages',
      en: 'Product sites and landing pages',
    },
    description: {
      es: 'Paginas rapidas, accesibles y bilingues. Este mismo sitio carga menos de 8 KB de JavaScript antes del primer pintado.',
      en: 'Fast, accessible, bilingual pages. This very site ships under 8 KB of JavaScript before first paint.',
    },
    points: {
      es: [
        'Astro o React con Tailwind CSS',
        'SEO tecnico, datos estructurados y dos idiomas',
        'Presupuesto de rendimiento medido, no prometido',
      ],
      en: [
        'Astro or React with Tailwind CSS',
        'Technical SEO, structured data and two languages',
        'A measured performance budget, not a promised one',
      ],
    },
  },
];
