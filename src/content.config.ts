import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Colecciones de contenido.
 *
 * Por que existe este archivo:
 * el esquema Zod convierte errores de contenido en errores de BUILD.
 * Si olvidas el `impact` de un proyecto o escribes mal una URL, el
 * sitio no compila y te enteras en local, no un reclutador en produccion.
 *
 * Estrategia bilingue: un fichero por idioma, enlazados por `translationKey`.
 * Asi cada idioma puede tener su propio slug en la URL
 * (/proyectos/tienda-online y /en/projects/online-store) sin duplicar logica.
 */

const projects = defineCollection({
  // El prefijo "_" NO excluye ficheros del loader de contenido
  // (a diferencia de src/pages/). Se excluye explicitamente para que
  // las plantillas de referencia no se publiquen como proyectos.
  loader: glob({ pattern: ['**/*.md', '!**/_*'], base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      lang: z.enum(['es', 'en']),
      /** Mismo valor en la version ES y EN del mismo proyecto. */
      translationKey: z.string(),
      /** Slug de la URL en ese idioma. Puede diferir entre idiomas. */
      slug: z.string(),

      title: z.string().max(60),
      /** Una linea que resume el proyecto. Aparece en la tarjeta. */
      tagline: z.string().max(120),

      /* --- Narrativa del caso de estudio ---
         Obligatorias a proposito: un proyecto sin problema declarado
         ni impacto medible es una captura de pantalla, no un caso. */
      problem: z.string(),
      solution: z.string(),
      impact: z.string(),

      role: z.string(),
      /** Formato libre: "2025", "2024 - 2025", "3 meses".
       *  coerce porque YAML convierte `period: 2025` en numero. */
      period: z.coerce.string(),
      stack: z.array(z.string()).min(1),

      repoUrl: z.string().url().optional(),
      liveUrl: z.string().url().optional(),

      cover: image().optional(),
      coverAlt: z.string().optional(),

      /** Los destacados abren la seccion con tarjeta grande. */
      featured: z.boolean().default(false),
      /** Menor numero = aparece antes. */
      order: z.number().default(99),
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects };
