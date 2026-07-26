import { ui, defaultLang, type Lang } from './ui';

/**
 * Detecta el idioma a partir de la URL.
 * Con `prefixDefaultLocale: false`, "/" es espanol y "/en/..." es ingles.
 */
export function getLangFromUrl(url: URL): Lang {
  const [, segment] = url.pathname.split('/');
  if (segment in ui) return segment as Lang;
  return defaultLang;
}

/**
 * Devuelve la funcion traductora del idioma dado.
 *
 *   const t = useTranslations(lang);
 *   t('nav.work')  // -> "Proyectos"
 *
 * El tipo de retorno esta atado a las claves reales, asi que un typo
 * como t('nav.wrok') es un error de compilacion, no una cadena vacia.
 */
export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/**
 * Segmentos de ruta traducidos.
 * Las URLs tambien son contenido: /en/proyectos delataria una traduccion
 * a medias, y las URLs localizadas posicionan mejor en cada mercado.
 */
export const routes = {
  es: { work: 'proyectos' },
  en: { work: 'projects' },
} as const;

/**
 * Construye una ruta absoluta ya localizada.
 *   path(en, 'projects/mi-app') -> "/en/projects/mi-app"
 *   path(es, 'proyectos')       -> "/proyectos"
 */
export function path(lang: Lang, subpath = ''): string {
  const clean = subpath.replace(/^\/+|\/+$/g, '');
  const prefix = lang === defaultLang ? '' : `/${lang}`;
  return clean ? `${prefix}/${clean}/` : `${prefix}/`;
}

/** Idioma alternativo, para el conmutador de idioma. */
export function otherLang(lang: Lang): Lang {
  return lang === 'es' ? 'en' : 'es';
}

/** Codigos BCP-47 para <html lang> y metadatos Open Graph. */
export const localeCodes: Record<Lang, string> = {
  es: 'es-ES',
  en: 'en-US',
};
