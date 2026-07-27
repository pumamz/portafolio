/**
 * Trayectoria.
 *
 * Los proyectos, sueltos, no cuentan una progresion. Puestos en orden si:
 * primer sistema en 2024, primer despliegue en la nube ese mismo ano,
 * primera integracion con un organismo publico en 2025, primer equipo a
 * cargo en 2026. Eso es lo que responde a la pregunta que de verdad se
 * hace quien contrata: "hacia donde va esta persona".
 *
 * Todo lo de aqui sale de `docs/perfil.md`. Nada inventado.
 */

export type MilestoneKind = 'education' | 'project' | 'role';

export interface Milestone {
  /** Se muestra tal cual, en monoespaciada. */
  period: string;
  kind: MilestoneKind;
  title: { es: string; en: string };
  detail: { es: string; en: string };
}

/** Icono por tipo de hito. Centralizado para no repetirlo en la plantilla. */
export const milestoneIcon: Record<MilestoneKind, string> = {
  education: 'lucide:graduation-cap',
  project: 'lucide:code-xml',
  role: 'lucide:users',
};

// Orden inverso: lo mas reciente primero. Quien lee un portafolio quiere
// saber donde estas hoy antes de saber donde empezaste.
export const timeline: Milestone[] = [
  {
    period: '2026 - 2027',
    kind: 'role',
    title: {
      es: 'Web Master, rama estudiantil IEEE',
      en: 'Web Master, IEEE student branch',
    },
    detail: {
      es: 'Responsable de la presencia web de la rama IEEE de la Universidad Catolica de Cuenca.',
      en: 'Responsible for the web presence of the IEEE student branch at Universidad Catolica de Cuenca.',
    },
  },
  {
    period: '2025 - 2026',
    kind: 'role',
    title: {
      es: 'Lider tecnico de un equipo de cuatro',
      en: 'Tech lead of a four-person team',
    },
    detail: {
      es: 'Sistema de gestion psicopedagogica para UDIPSAI: asignacion de tareas, revision de codigo y validacion de funcionalidades sobre datos clinicos reales.',
      en: 'Psychopedagogical management system for UDIPSAI: task assignment, code review and feature validation over real clinical data.',
    },
  },
  {
    period: '2025',
    kind: 'project',
    title: {
      es: 'Primera integracion con un organismo publico',
      en: 'First integration with a public authority',
    },
    detail: {
      es: 'Facturacion electronica contra las APIs del SRI. Una especificacion externa, obligatoria y sin margen de interpretacion.',
      en: 'E-invoicing against the Ecuadorian tax authority APIs. An external specification, mandatory and with no room for interpretation.',
    },
  },
  {
    period: '2024',
    kind: 'project',
    title: {
      es: 'Primer sistema en produccion, primer despliegue en AWS',
      en: 'First system in production, first AWS deployment',
    },
    detail: {
      es: 'Gestion de gimnasio con control de accesos y membresias. Aqui empezo el interes por la infraestructura.',
      en: 'Gym management with access control and memberships. This is where the interest in infrastructure started.',
    },
  },
  {
    period: '2023',
    kind: 'education',
    title: {
      es: 'Ingenieria en Software',
      en: 'Software Engineering',
    },
    detail: {
      es: 'Universidad Catolica de Cuenca. En curso.',
      en: 'Universidad Catolica de Cuenca. In progress.',
    },
  },
];
