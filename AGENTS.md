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
| Bun        | 1.3+    | Gestor de paquetes. Nunca usar npm aqui.       |
| Node       | 22.12+  | Exigido en `engines`.                          |
| Three.js   | 0.185   | Solo el campo de particulas. Carga diferida.   |
| astro-icon | 1.x     | simple-icons y lucide, inlineados como SVG en  |
|            |         | build: sin peticiones ni JS de cliente.        |

## Comandos

```bash
bun run dev           # servidor de desarrollo
bun run build         # astro check + build (debe pasar antes de commit)
bun run build:fast    # build sin type-check, para iterar rapido
bun run check         # solo type-check
bun run preview       # sirve el build de produccion en local
bun run format        # prettier --write
bun run format:check  # falla si algo no esta formateado
```

**Los comandos de este fichero son POSIX** (bash / fish). El proyecto se monto
en Windows, asi que si aparece algo con `Select-String` o `Get-ChildItem` es
un resto sin traducir.

**`node_modules` no es portable entre sistemas.** Contiene binarios nativos
(`@rolldown/binding-*`). Al clonar, o al mover el repositorio de Windows a
Linux, `bun install` antes de nada: si no, `astro` falla con
`Cannot find module '@rolldown/binding-linux-x64-gnu'`.

### Revision visual

**La hace Daniel a mano, en el navegador. No hay automatizacion de navegador
en este proyecto y no debe anadirse ninguna.** Nada de Playwright, Puppeteer
ni capturas comparadas: si un cambio toca algo que se ve, se describe que
mirar y lo comprueba el.

Conviene saber por que existe esa revision, porque limita lo que un agente
puede afirmar. Hubo cuatro fallos que el HTML no delataba: un canvas WebGL
que renderizaba sin verse, una esfera colapsada a un tercio de su tamano, un
color de marca que nunca se aplicaba, y **todas las animaciones de scroll del
sitio muertas** por una abreviada de CSS que el minificador reescribia mal
(ver trampas). En los cuatro casos la clase estaba puesta y el marcado era
correcto.

De ahi la regla: **leer el HTML no demuestra que algo se vea.** Un agente
puede verificar lo que es comprobable sin ojos — que el build pasa, que un
patron no aparece en el CSS compilado, que un fichero no entra en el bundle —
y para el resto dice explicitamente que no lo ha comprobado.

Revision en local contra el build de produccion, no contra `astro dev`, que
inyecta su barra de herramientas:

```bash
bun run build && bunx astro preview --port 4330
```

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

   **Unica excepcion:** los colores de marca de terceros en
   `src/config/stack.ts`. El azul de React es #61DAFB y ningun token puede
   expresarlo. Estan acotados a ese fichero, solo se usan en hover, y cada
   marca lleva dos valores porque el cyan de React sobre blanco es ilegible.

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
  config/stack.ts       Tecnologias, iconos y colores de marca.
  config/services.ts    Servicios ofrecidos, ES y EN.
  config/timeline.ts    Hitos de la trayectoria, ES y EN.
  content.config.ts     Esquemas Zod del contenido.
  content/projects/     Proyectos en Markdown, es/ y en/.
  content/about/        Biografia, un fichero por idioma.
  lib/projects.ts       Consultas sobre la coleccion. Ver abajo.
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
    SectionHeading.astro
    ProjectCard.astro   Tarjeta de proyecto en la portada y el indice.
    CaseStudy.astro     Cuerpo de la pagina de detalle.
    ParticleField.astro Lienzo WebGL del hero.
    TechSphere.astro    Esfera de tecnologias arrastrable.
    PointerEffects.astro  Solo arranca scripts, no renderiza nada.
    sections/           Hero, Stats, Work, About, Timeline, Stack,
                        Services y Contact, en ese orden en la portada.
  scripts/              Logica de cliente. Ver el contrato mas abajo.
    particle-field.ts   Escena Three.js. La unica carga pesada.
    tech-sphere.ts      Esfera en CSS 3D, no WebGL.
    pointer-effects.ts  Inclinacion de tarjetas.
    ambient.ts          Rejilla reactiva, contadores, profundidad de foto.
  pages/
    index.astro         -> /      (espanol, idioma por defecto)
    en/index.astro      -> /en/   (ingles)
    proyectos/          -> /proyectos/ y /proyectos/[slug]/
    en/projects/        -> /en/projects/ y /en/projects/[slug]/
    404.astro
  styles/global.css     Sistema de diseno completo en tres capas.
public/
  og-default.png        Imagen al compartir el enlace. 1200x630, estatica.
                        Se hizo a mano: si cambia el matiz de marca o el
                        nombre, hay que rehacerla o quedara desincronizada.
docs/
  requirements.md       Que construimos y para quien.
  design-system.md      Criterio de uso del sistema visual.
  deploy.md             Configuracion de Vercel y cabeceras.
  perfil.md             Datos profesionales extraidos del CV.
  adr/                  Decisiones tecnicas y alternativas descartadas.
```

### Un proyecto son dos ficheros unidos por `translationKey`

Cada idioma tiene su **propio slug** en la URL: `/proyectos/gestion-gimnasio/`
y `/en/projects/gym-management/`. Una URL a medio traducir delata el sitio
entero, y las URLs localizadas posicionan mejor en cada mercado.

`translationKey` es lo que permite saber que esos dos ficheros son la misma
pagina. `getStaticPaths` lo resuelve en build para pasarle `altPath` al
layout: sin el, el conmutador de idioma caeria en la portada en lugar del
mismo proyecto, y el `hreflang` emparejaria URLs equivocadas.

**Ninguna URL se escribe a mano.** Salen de `path()`, `projectUrl()` y
`workIndexUrl()`. Los segmentos estan traducidos (`routes` en `i18n/utils.ts`)
y `vercel.json` fija `trailingSlash: true`; una ruta literal se salta las dos
cosas y provoca una redireccion doble.

**Toda consulta a la coleccion vive en `lib/projects.ts`**, nunca en un
componente: asi un cambio en el criterio de orden se hace en un sitio y las
paginas solo pintan lo que reciben. Ojo con una diferencia deliberada entre
entornos: `draft` solo se filtra en produccion, para poder ver los borradores
mientras se escriben.

### Contrato de los scripts de cliente

Un efecto interactivo se parte en dos: el `.astro` lleva el marcado y un
`<script>` breve que arranca; la logica vive en `src/scripts/*.ts` y entra por
`import()` dinamico si es pesada.

Ese script **debe** registrar `astro:before-swap` para destruir y
`astro:after-swap` para volver a montar. Con view transitions el `<body>` se
reemplaza en cada navegacion: lo que no se libera deja escuchas colgando de
nodos muertos y, en el caso del campo de particulas, la GPU trabajando para
un canvas que ya no existe. Por eso cada modulo de `src/scripts/` exporta su
pareja `init`/`destroy`.

## Presupuesto de rendimiento

Dos presupuestos separados desde el ADR-0007. Mezclarlos oculta lo unico que
importa de verdad, que es lo que bloquea el primer pintado.

| Metrica            | Presupuesto | Actual     |
| ------------------ | ----------- | ---------- |
| JS inicial (gzip)  | < 30 KB     | **6.8 KB** |
| JS diferido (gzip) | < 150 KB    | **127 KB** |
| CSS (gzip)         | < 15 KB     | **9.4 KB** |

Las dos secciones nuevas (Trayectoria y Servicios) no anaden ni un byte de
JavaScript: la linea que se dibuja al bajar es `animation-timeline: view()`,
no un IntersectionObserver.

**Regla:** nada que bloquee el primer pintado. Three.js entra por `import()`
dentro de `requestIdleCallback` y no debe aparecer nunca en el HTML inicial
ni con `modulepreload`. Comprobarlo asi tras tocar la escena:

```bash
grep -nE 'modulepreload|particle-field\.' dist/index.html
```

No debe salir nada. El atributo `data-particle-field` del canvas no lleva
punto, asi que no casa con el patron.

Comprobar tras cualquier cambio que anada interactividad. **Se mide en gzip**,
que es lo que viaja por la red y en lo que esta expresado el presupuesto; el
tamano en disco es casi cuatro veces mayor y no significa nada:

```bash
for f in $(find dist -name '*.js'); do echo "$f $(gzip -c $f | wc -c)"; done
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
- **Nunca escuchar el puntero en un elemento que se transforma.** La
  inclinacion 3D de las tarjetas temblaba en los bordes: la rotacion apartaba
  la tarjeta de debajo del cursor, saltaba `pointerleave`, volvia a su sitio,
  entraba `pointerenter`, y vuelta a empezar. Las escuchas van en el
  contenedor de perspectiva (`data-tilt-root`), que nunca se transforma.
- **Un z-index negativo necesita `isolate` en su seccion.** El canvas de
  particulas y los resplandores usan `-z-10`. Sin `isolation: isolate` en la
  seccion, ese z negativo los coloca por detras del fondo opaco del
  documento: el WebGL seguia renderizando, `data-ready` seguia puesto, y no
  se veia absolutamente nada. Solo se detecto comparando capturas.
- **`w-full` colapsa si el padre no tiene ancho propio.** El escenario de la
  esfera tiene todos sus hijos en `absolute`, asi que no hay contenido que
  de ancho: `w-full` contra un padre de ancho automatico resolvia a 152 px
  en vez de 448 y los logos salian despedidos sobre el texto vecino. El
  ancho se fija en el contenedor exterior.
- **`var(--a, --b)` es invalido.** El valor de reserva de `var()` debe ser un
  VALOR, no el nombre de otra variable. `text-(--brand-light,--color-text)`
  generaba un color invalido. Las variables de marca llevan valor por
  defecto en CSS y las utilidades se escriben sin reserva.
- **Nunca usar la forma abreviada `animation:` junto a `animation-timeline`.**
  Lightning CSS (el minificador de Tailwind 4) pliega estas dos lineas

  ```css
  animation: reveal-up linear both;
  animation-timeline: view();
  ```

  en `animation: linear both reveal-up view()`, que pertenece a un borrador
  antiguo. La abreviada **no** admite linea temporal, asi que Chromium
  rechaza la declaracion entera y `animation-name` queda en `none`.
  Comprobado: `CSS.supports('animation','linear both foo view()')` da
  `false`.

  El sitio llevo **todas** las animaciones de scroll muertas sin ninguna
  senal: sin `both` que fije el primer fotograma, el elemento se pinta en
  su estado final y se ve correcto, solo que quieto. La unica huella era
  un `animation-range` puesto sobre un elemento con `animation-name: none`.

  Se escriben solo propiedades sueltas, dejando fuera al menos una de las
  que componen la abreviada (`animation-delay`, `animation-iteration-count`).
  Sin el juego completo el minificador no puede plegarlas.

  Para comprobarlo tras tocar `global.css`:

  ```bash
  grep -o 'animation:[^;}]*view()' dist/_astro/*.css
  ```

  No debe salir nada.

- **`will-change: transform` permanente hace desaparecer bordes de 1px.**
  Promueve el elemento a una capa de GPU cacheada a resolucion fija; al
  desplazarla con decimales el borde cae entre pixeles y parpadea. Se activa
  desde JavaScript solo mientras dura el movimiento, el desplazamiento se
  redondea a enteros, y los contornos usan `ring-outline` (box-shadow
  interior) en lugar de `border`.

## Documentacion de Astro

Consultar antes de trabajar en cada area:

- [Rutas, rutas dinamicas y middleware](https://docs.astro.build/en/guides/routing/)
- [Componentes Astro](https://docs.astro.build/en/basics/astro-components/)
- [Componentes de framework (React)](https://docs.astro.build/en/guides/framework-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Estilos y Tailwind](https://docs.astro.build/en/guides/styling/)
- [Internacionalizacion](https://docs.astro.build/en/guides/internationalization/)
