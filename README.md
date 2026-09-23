# Portafolio personal

Sitio personal bilingue (espanol / ingles) construido con Astro y Tailwind CSS.
Estatico, con 5.6 KB de JavaScript comprimido.
No hay JavaScript diferido: los efectos del hero son CSS.

**En vivo:** [pumamz.vercel.app](https://pumamz.vercel.app) ·
[version en ingles](https://pumamz.vercel.app/en/)

> **Estado:** las ocho secciones de la portada, el indice de proyectos y las
> paginas de detalle estan construidas en los dos idiomas. Lo que falta es
> contenido: numeros de impacto en los casos de estudio, enlaces a repositorio
> y el CV en PDF. Ver [pendientes](./docs/requirements.md#7-pendiente-de-definir).

## Requisitos

- [Bun](https://bun.sh) 1.3 o superior
- Node.js 22.12 o superior

## Puesta en marcha

```bash
bun install
bun run dev
```

El sitio queda en `http://localhost:4321`.

## Ramas

**No se trabaja en `main`.** Cada push a `main` despliega a produccion.

- `develop` - rama de trabajo. Vercel le genera una URL de vista previa propia.
- `main` - produccion. Solo recibe merges desde `develop`.

```bash
git checkout develop           # aqui se trabaja
# ... cambios, commits ...
git push origin develop        # genera vista previa en Vercel

git checkout main              # promover a produccion
git merge develop --no-ff
git push origin main           # despliega
git checkout develop           # volver a trabajar
```

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
--a-soft: oklch(0.93 0.03 250);
--a-base: oklch(0.68 0.15 250);
--a-deep: oklch(0.42 0.14 255);
--a-shadow: oklch(0.25 0.08 258);
```

El ultimo numero es el matiz (0-360); **250 es azul marino**. Cambiarlo en las
cuatro lineas reidentifica el sitio entero, en tema claro y oscuro, sin tocar
ningun componente.

Los neutrales tambien llevan matiz azul y suben de croma conforme se oscurecen,
de modo que el fondo del tema oscuro **es** marino y no un negro con un boton
azul encima. Si cambias el acento, muevelos con el o dejaran de pertenecer a la
misma familia.

La unica pieza que no sigue esa variable es
[`public/og-default.png`](./public/og-default.png), la imagen que se ve al
compartir el enlace: es un PNG estatico de 1200x630 con el acento ya
rasterizado. Si cambias el matiz, hay que rehacerla.

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
