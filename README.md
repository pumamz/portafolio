# Portafolio personal

Sitio personal bilingue (espanol / ingles) construido con Astro, React y
Tailwind CSS. Estatico, sin JavaScript en el cliente salvo donde se necesita.

> **Estado:** en construccion. La infraestructura esta lista; falta el contenido
> real y las secciones. Ver [pendientes](./docs/requirements.md#7-pendiente-de-definir).

## Requisitos

- [Bun](https://bun.sh) 1.3 o superior
- Node.js 22.12 o superior

## Puesta en marcha

```bash
bun install
bun run dev
```

El sitio queda en `http://localhost:4321`.

## Comandos

| Comando              | Que hace                                       |
| -------------------- | ---------------------------------------------- |
| `bun run dev`        | Servidor de desarrollo con recarga en caliente |
| `bun run build`      | Comprueba tipos y compila a `./dist/`          |
| `bun run build:fast` | Compila sin comprobar tipos (iteracion rapida) |
| `bun run preview`    | Sirve la compilacion de produccion en local    |
| `bun run check`      | Solo comprobacion de tipos                     |
| `bun run format`     | Formatea todo el proyecto con Prettier         |

> Este proyecto usa **Bun**, no npm. Ejecutar `npm install` generaria un
> `package-lock.json` en conflicto con `bun.lock`. Ver [ADR-0006](./docs/adr/0006-bun.md).

## Como anadir un proyecto al portafolio

No hace falta tocar codigo. Se crean **dos** ficheros Markdown:

1. `src/content/projects/es/mi-proyecto.md`
2. `src/content/projects/en/my-project.md`

Ambos deben compartir el mismo `translationKey`. Usa como plantilla
`_plantilla.md` y `_template.md` (los ficheros con `_` no se publican).

Los campos `problem`, `solution` e `impact` son **obligatorios** a proposito: un
proyecto sin problema declarado ni impacto medible es una captura de pantalla,
no un caso de estudio. El build falla si faltan.

## Como cambiar la identidad visual

Todo el color sale de cuatro variables en
[`src/styles/global.css`](./src/styles/global.css):

```css
--a-soft: oklch(0.93 0.04 15);
--a-base: oklch(0.6 0.18 15);
--a-deep: oklch(0.42 0.15 15);
--a-shadow: oklch(0.26 0.09 15);
```

El ultimo numero es el matiz (0-360); **15 es rojo vino**. Cambiarlo en las
cuatro lineas reidentifica el sitio entero, en tema claro y oscuro, sin tocar
ningun componente.

## Documentacion

| Documento                                    | Responde a                      |
| -------------------------------------------- | ------------------------------- |
| [Requerimientos](./docs/requirements.md)     | Que construimos y para quien    |
| [Sistema de diseno](./docs/design-system.md) | Como se ve y por que            |
| [ADR](./docs/adr/)                           | Por que cada decision tecnica   |
| [AGENTS.md](./AGENTS.md)                     | Convenciones para agentes de IA |

## Estructura

```
src/
  config/site.ts       Datos personales y enlaces
  content/projects/    Proyectos en Markdown (es/ y en/)
  i18n/                Textos de interfaz y utilidades de idioma
  layouts/             Layout base con SEO y metadatos
  components/          Componentes .astro e islas de React
  pages/               Rutas: / (es) y /en/ (en)
  styles/global.css    Sistema de diseno
docs/                  Requerimientos, diseno y decisiones
```

## Licencia

Codigo bajo licencia MIT. El contenido (textos, imagenes, CV) es propiedad del
autor y no se incluye en la licencia.
