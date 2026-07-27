# AGENTS.md

Contexto e instrucciones para agentes de IA que trabajen en este repositorio.
`CLAUDE.md` es un enlace simbolico a este fichero.

## Que es esto

Portafolio personal bilingue (ES/EN). Objetivo doble: conseguir empleo y captar
clientes freelance. **El propio sitio es la prueba tecnica**, asi que la calidad
del codigo, el rendimiento y la accesibilidad no son opcionales.

Antes de tomar cualquier decision de producto, leer
[`docs/requirements.md`](./docs/requirements.md).
Antes de cuestionar una decision tecnica, leer [`docs/adr/`](./docs/adr/).

## Stack

| Pieza      | Version | Nota                                           |
| ---------- | ------- | ---------------------------------------------- |
| Astro      | 7.x     | Framework. Cero JS por defecto.                |
| Tailwind   | 4.x     | Via `@tailwindcss/vite`, sin fichero de config |
| React      | 19.x    | Instalado, **integracion desactivada**         |
| TypeScript | 6.x     | Fijado: TS 7 rompe `astro check`               |
| Bun        | 1.3     | Gestor de paquetes. Nunca usar npm aqui.       |

## Comandos

```bash
bun run dev           # servidor de desarrollo
bun run build         # astro check + build (debe pasar antes de commit)
bun run build:fast    # build sin type-check, para iterar rapido
bun run check         # solo type-check
bun run format        # prettier --write
```

Para desarrollo en segundo plano: `bunx astro dev --background`, y luego
`astro dev stop` / `astro dev status` / `astro dev logs`.

## Reglas del proyecto

Estas reglas existen por una razon documentada. Si alguna estorba, discutirla
antes de saltarsela.

1. **Ningun texto visible se escribe dentro de un componente.**
   Los textos de interfaz van en `src/i18n/ui.ts`; el contenido largo, en
   `src/content/`. Motivo: el sitio es bilingue y `ui.ts` tiene comprobacion de
   paridad en tiempo de compilacion (ADR-0003).

2. **Ningun color escrito a mano.**
   Solo utilidades semanticas: `bg-surface`, `text-text-muted`, `bg-accent`.
   Nunca `text-neutral-500` ni `#1a1a1a`. Motivo: el tema oscuro reasigna solo
   la capa semantica; saltarsela rompe el modo oscuro (ADR-0002).

3. **Antes de crear una isla, comprobar si basta CSS.**
   Por defecto, `.astro`. React solo si hay estado real que CSS no pueda
   expresar. Ver la trampa documentada mas abajo: cuesta 187 KB equivocarse.

4. **Toda animacion respeta `prefers-reduced-motion`.**
   Hay una regla global en `global.css`, pero ojo: una animacion con `both`
   deja el estado inicial congelado, asi que ademas hay que restaurar
   explicitamente la visibilidad (ver `Hero.astro`).

5. **Cada pagina nueva necesita su equivalente en el otro idioma**, con
   `hreflang` correcto via la prop `altPath` de `BaseLayout`.

6. **`bun run build` debe pasar antes de dar una tarea por terminada.**
   Incluye `astro check`. Cero errores.

## Flujo de trabajo con git

**Nunca se trabaja directamente en `main`.** `main` es la rama de produccion:
cada push a `main` dispara un despliegue automatico en Vercel.

```
develop  <- todo el trabajo ocurre aqui
   |
   | merge cuando esta verificado
   v
main     <- despliega a produccion automaticamente
```

| Rama       | Proposito                                                |
| ---------- | -------------------------------------------------------- |
| `main`     | Produccion. Solo recibe merges desde `develop`.          |
| `develop`  | Integracion. Rama de trabajo por defecto.                |
| `feat/...` | Opcional, para cambios grandes. Se fusiona en `develop`. |

Vercel genera un **despliegue de vista previa** para `develop` con su propia
URL. Sirve para revisar en produccion real antes de tocar el sitio publico.

### Publicar cambios

```bash
# En develop, con el trabajo terminado
bun run build          # debe pasar; incluye astro check
git add -A && git commit -m "..."
git push origin develop

# Promover a produccion
git checkout main
git merge develop --no-ff
git push origin main   # dispara el despliegue
git checkout develop   # volver al sitio de trabajo
```

`--no-ff` es deliberado: fuerza un commit de fusion, de modo que el historial
de `main` muestra que entro cada publicacion y permite revertir una entrega
completa con un solo comando.

## Estructura

```
src/
  config/site.ts        Datos personales y enlaces. Fuente unica de verdad.
  content.config.ts     Esquemas Zod del contenido.
  content/projects/     Proyectos en Markdown, es/ y en/.
  i18n/
    ui.ts               Todos los textos de interfaz, ES y EN.
    utils.ts            getLangFromUrl, useTranslations, path, routes.
  layouts/
    BaseLayout.astro    head, SEO, JSON-LD, tema, header y footer.
  components/
    Header.astro        Navegacion, conmutadores.
    Footer.astro
    ThemeToggle.astro   Claro/oscuro sin JavaScript de framework.
    LanguageSwitcher.astro
    sections/           Hero y demas secciones de la portada.
  pages/
    index.astro         -> /      (espanol, idioma por defecto)
    en/index.astro      -> /en/   (ingles)
  styles/global.css     Sistema de diseno completo en tres capas.
docs/
  requirements.md       Que construimos y para quien.
  design-system.md      Criterio de uso del sistema visual.
  adr/                  Decisiones tecnicas y alternativas descartadas.
```

## Presupuesto de rendimiento

Dos presupuestos separados desde el ADR-0007. Mezclarlos oculta lo unico que
importa de verdad, que es lo que bloquea el primer pintado.

| Metrica            | Presupuesto | Actual     |
| ------------------ | ----------- | ---------- |
| JS inicial (gzip)  | < 30 KB     | **6.7 KB** |
| JS diferido (gzip) | < 150 KB    | **128 KB** |
| CSS (gzip)         | < 15 KB     | **9.9 KB** |

**Regla:** nada que bloquee el primer pintado. Three.js entra por `import()`
dentro de `requestIdleCallback` y no debe aparecer nunca en el HTML inicial
ni con `modulepreload`. Comprobarlo asi tras tocar la escena:

```powershell
Select-String dist\index.html -Pattern 'modulepreload|particle-field\.'
```

Solo debe salir el atributo `data-particle-field` del canvas.

Comprobar tras cualquier cambio que anada interactividad:

```powershell
Get-ChildItem dist -Recurse -Filter *.js | Select-Object Name, Length
```

## Trampas conocidas

Descubiertas durante el montaje. Evitan repetir depuracion:

- **`@theme inline` es obligatorio** en `global.css`. Sin `inline`, Tailwind
  resuelve las variables en build y congela el tema claro: el modo oscuro deja
  de funcionar sin dar ningun error.
- **El prefijo `_` no excluye ficheros del loader de contenido**, a diferencia
  de `src/pages/`. Las plantillas se excluyen en el patron glob de
  `content.config.ts`.
- **YAML convierte `period: 2025` en numero.** Por eso el esquema usa
  `z.coerce.string()`.
- **TypeScript 7 rompe `astro check`.** El compilador nativo en Go aun no expone
  la API programatica que necesita. Mantener TS en 6.x hasta que la soporte.
- **Importar `z` desde `astro/zod`**, no desde `astro:content` (deprecado).
- **La integracion de React esta desactivada en `astro.config.mjs`.** Con ella
  registrada, Vite emite un bundle de ~187 KB con el runtime de React aunque
  ninguna pagina lo cargue. Ocurrio de verdad: el conmutador de tema se hizo
  primero como isla `client:load` y disparo el JS de 5 KB a 205 KB. Reescrito
  como `.astro` con delegacion de eventos hace lo mismo en menos de 1 KB.
  Los iconos de sol y luna se resuelven con `dark:hidden`, sin JavaScript.
- **Los listeners deben registrarse en `document`, no en el elemento.** Con
  view transitions el `<body>` se reemplaza en cada navegacion y un listener
  atado a un boton muere con el.
- **El script de tema del `<head>` no se re-ejecuta al navegar** con view
  transitions. Hay que reaplicarlo en `astro:after-swap` o el tema se pierde.

## Documentacion de Astro

Consultar antes de trabajar en cada area:

- [Rutas, rutas dinamicas y middleware](https://docs.astro.build/en/guides/routing/)
- [Componentes Astro](https://docs.astro.build/en/basics/astro-components/)
- [Componentes de framework (React)](https://docs.astro.build/en/guides/framework-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Estilos y Tailwind](https://docs.astro.build/en/guides/styling/)
- [Internacionalizacion](https://docs.astro.build/en/guides/internationalization/)
