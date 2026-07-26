// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // TODO: reemplazar por la URL real de produccion antes del primer deploy.
  // Se usa para generar sitemap.xml, canonical y og:url absolutos.
  site: 'https://portafolio.vercel.app',

  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: {
      // false => el idioma por defecto vive en la raiz sin prefijo:
      //   /      -> espanol
      //   /en/   -> ingles
      prefixDefaultLocale: false,
    },
  },

  // React esta instalado pero su integracion NO esta activa a proposito.
  // Con la integracion registrada, Vite emite un bundle de ~187 KB con el
  // runtime de React aunque ninguna pagina lo cargue: basura que acabaria
  // desplegada. Cuando exista una isla que realmente lo necesite, se
  // reactiva anadiendo `react()` aqui y su import arriba.
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-ES', en: 'en-US' },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
