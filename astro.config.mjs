// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // URL de produccion. Se usa para generar sitemap.xml, canonical y og:url
  // absolutos. Debe coincidir con `url` en src/config/site.ts.
  site: 'https://pumamz.vercel.app',

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
    // Los iconos se inlinean como SVG en tiempo de build: sin peticiones
    // extra, sin fuente de iconos y sin JavaScript en el cliente.
    icon({
      include: {
        'simple-icons': ['*'],
        lucide: ['*'],
      },
    }),
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
