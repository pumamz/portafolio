import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { path, routes } from '../i18n/utils';

export type Project = CollectionEntry<'projects'>;

/**
 * Consultas sobre la coleccion de proyectos.
 *
 * Toda la logica de idioma y orden vive aqui, no en los componentes.
 * Asi un cambio en el criterio de orden se hace en un solo sitio, y las
 * paginas se limitan a pintar lo que reciben.
 */

/**
 * Proyectos de un idioma, ya ordenados y sin borradores.
 *
 * `draft` se filtra solo en produccion: en desarrollo interesa ver los
 * borradores mientras se escriben, pero nunca deben llegar al sitio publico.
 */
export async function getProjects(lang: Lang): Promise<Project[]> {
  const all = await getCollection('projects', ({ data }) => {
    if (data.lang !== lang) return false;
    return import.meta.env.PROD ? data.draft === false : true;
  });

  return all.sort((a, b) => a.data.order - b.data.order);
}

/**
 * Localiza la version del mismo proyecto en el otro idioma.
 *
 * Es la razon de ser del campo `translationKey`: permite que cada idioma
 * tenga su propio slug (/proyectos/gestion-gimnasio y /en/projects/gym-management)
 * y aun asi saber que son la misma pagina, que es lo que necesita `hreflang`.
 */
export async function getTranslation(
  project: Project,
  targetLang: Lang,
): Promise<Project | undefined> {
  const candidates = await getCollection(
    'projects',
    ({ data }) => data.lang === targetLang && data.translationKey === project.data.translationKey,
  );
  return candidates[0];
}

/** URL publica de un proyecto en su idioma. */
export function projectUrl(project: Project): string {
  const lang = project.data.lang;
  return path(lang, `${routes[lang].work}/${project.data.slug}`);
}

/** URL del indice de proyectos de un idioma. */
export function workIndexUrl(lang: Lang): string {
  return path(lang, routes[lang].work);
}
