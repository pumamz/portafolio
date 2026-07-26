# 0001 - Usar Astro con islas de React

- **Estado:** aceptado
- **Fecha:** 2026-07-26

## Contexto

El sitio es un portafolio personal bilingue: aproximadamente un 95 % de su
contenido es estatico (biografia, proyectos, experiencia) y un 5 % requiere
interactividad real (conmutador de tema, menu movil, algun efecto).

Restricciones que pesan en la decision:

- El rendimiento no es cosmetico aqui: **el propio sitio es la prueba tecnica**.
  Un portafolio de ingenieria con Lighthouse en 60 contradice su mensaje.
- El SEO importa: se busca ser encontrado por reclutadores y clientes.
- Debe soportar dos idiomas sin duplicar logica.

## Decision

Usar **Astro 7** como framework, con **React** unicamente para componentes que
necesiten estado en el cliente, cargados como islas (`client:*`).

## Alternativas consideradas

### Next.js 15 (App Router)

Descartada. Su ventaja real y no despreciable es de mercado: "Next.js" en el CV
lo reconoce mas gente en RRHH. Pero tecnicamente supone pagar complejidad que
este proyecto no usa - React Server Components, hidratacion global, ~90 KB de
JavaScript de base - para construir lo que en esencia es un sitio estatico.

El argumento de la familiaridad del reclutador se resuelve mejor por otra via:
el CV puede declarar experiencia con Next.js, mientras el sitio demuestra
criterio de seleccion de herramienta. Elegir el framework correcto para el
problema es una senal mas fuerte que usar el framework de moda.

### Vite + React (SPA)

Descartada por SEO. Una SPA sin prerenderizado se indexa peor y de forma menos
fiable, lo cual ataca directamente al objetivo de negocio de ser encontrado.

### HTML y CSS a mano

Descartada por mantenibilidad. Dos idiomas por dos idiomas de contenido
significa duplicar cada pagina a mano, y la duplicacion garantiza divergencia.

## Consecuencias

### Positivas

- Cero JavaScript por defecto. El JS solo aparece donde se pide explicitamente.
- i18n integrado en el framework, no como plugin de terceros.
- Content collections con validacion de esquema incluidas.
- Los componentes `.astro` son HTML con superpoderes: curva de aprendizaje baja.

### Negativas / coste asumido

- Menor reconocimiento del nombre "Astro" frente a "Next.js" en filtros de RRHH.
- Ecosistema mas pequeno; algunas librerias de React asumen un entorno Next.
- Hay que entender el modelo de islas y las directivas `client:*`, que es un
  modelo mental distinto al de una app React convencional.
