# 0004 - Contenido en content collections validadas con Zod

- **Estado:** aceptado
- **Fecha:** 2026-07-26

## Contexto

Los proyectos del portafolio cambian mas a menudo que el codigo. Anadir uno
nuevo, corregir una cifra o actualizar un enlace no deberia requerir tocar
componentes ni entender el sistema de diseno.

Ademas, el bilinguismo multiplica por dos cada pieza de contenido, lo que
multiplica tambien las oportunidades de que algo quede incompleto.

## Decision

El contenido vive en `src/content/projects/{es,en}/*.md`, cargado con el loader
`glob()` y validado por un esquema **Zod estricto** en `src/content.config.ts`.

El esquema **obliga** a que cada proyecto declare `problem`, `solution` e
`impact`. No son campos opcionales por decision deliberada de producto.

## Alternativas consideradas

### Datos codificados en los componentes

Descartado. Mezcla contenido y presentacion, obliga a entender el codigo para
corregir una errata, y hace imposible validar nada.

### Un CMS externo (Sanity, Contentful, Notion)

Descartado por desproporcion. Anade una dependencia de red, una cuenta que
mantener y un punto de fallo en build, para gestionar dos proyectos. Markdown en
el repositorio se versiona con git, funciona sin conexion y no caduca.

### JSON en lugar de Markdown

Descartado. JSON no admite texto largo comodo ni contenido enriquecido, y sus
mensajes de error de sintaxis son mucho peores que los de YAML frontmatter.

## Consecuencias

### Positivas

- Anadir un proyecto = crear dos ficheros Markdown. Cero codigo.
- **Los errores de contenido son errores de build.** Ya ocurrio durante el
  montaje: YAML interpretaba `period: 2025` como numero y el build fallo en
  local. Sin esquema, eso llega a produccion silenciosamente.
- Los campos obligatorios fuerzan la calidad narrativa: es imposible publicar un
  proyecto sin declarar que problema resolvia y que impacto tuvo.
- Todo el contenido esta versionado en git junto al codigo.

### Negativas / coste asumido

- Publicar un cambio de contenido requiere un commit y un deploy. Para un
  portafolio personal es aceptable; para un blog diario no lo seria.
- Hay que conocer minimamente la sintaxis de YAML frontmatter.
- El prefijo `_` **no** excluye ficheros del loader de contenido (a diferencia
  de `src/pages/`); las plantillas se excluyen explicitamente en el patron glob.
