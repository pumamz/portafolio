# 0002 - Tailwind CSS v4 con tokens semanticos en capas

- **Estado:** aceptado
- **Fecha:** 2026-07-26

## Contexto

El sitio necesita tema claro y oscuro, una identidad visual "audaz" que quiza se
ajuste durante el desarrollo, y consistencia total entre secciones.

El fallo clasico en portafolios es el color improvisado: se escribe
`text-gray-500` en un sitio, `text-gray-600` en otro, y al cabo de tres semanas
hay catorce grises sin criterio y el tema oscuro es imposible de anadir.

## Decision

Tailwind CSS v4 con una arquitectura de **tres capas** en `src/styles/global.css`:

1. **Primitivos** (`--n-500`, `--a-base`): valores crudos en OKLCH.
   Nunca se usan directamente en un componente.
2. **Semanticos** (`--text-muted`, `--surface`, `--accent`): describen
   _intencion_, no apariencia. El tema oscuro reasigna **solo** esta capa.
3. **Puente a Tailwind** (`@theme inline`): expone la capa semantica como
   utilidades (`bg-surface`, `text-text-muted`).

Los componentes usan **exclusivamente** utilidades de la capa 3.

## Alternativas consideradas

### CSS Modules o CSS plano

Descartado. Astro ya aisla los estilos por componente, pero se pierde la
consistencia de escala que da un sistema de utilidades: cada componente
reinventa sus margenes.

### Tailwind con `dark:` en cada utilidad

Descartado. Obliga a escribir `bg-white dark:bg-neutral-900` en cada elemento.
Duplica el codigo, es facil olvidar una mitad, y cambiar la paleta obliga a
buscar y reemplazar por todo el proyecto. Con tokens semanticos se escribe
`bg-surface` una sola vez y el tema oscuro ya funciona.

### Una libreria de componentes (shadcn/ui, DaisyUI)

Descartado para v1. Aportan velocidad, pero imponen una estetica reconocible
que contradice el objetivo de un diseno audaz y distintivo. Un portafolio que
parece una plantilla no diferencia.

## Consecuencias

### Positivas

- Cambiar toda la identidad de color = editar tres lineas (`--a-soft/base/deep`).
- El tema oscuro no requiere tocar ni un componente.
- OKLCH garantiza brillo percibido uniforme entre matices, cosa que HEX no hace.
- Imposible que aparezcan "catorce grises": la paleta esta cerrada por diseno.

### Negativas / coste asumido

- Indireccion: para saber que color es `bg-surface` hay que abrir `global.css`.
- `@theme inline` es obligatorio y poco intuitivo. Sin `inline`, las utilidades
  congelan el valor del tema claro en build y el modo oscuro deja de funcionar.
- OKLCH exige navegadores modernos (sin soporte en Safari anterior a 15.4).
