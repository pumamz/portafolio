# Sistema de diseno

> Implementacion: [`src/styles/global.css`](../src/styles/global.css)
> Direccion: **audaz en tipografia y movimiento, sobrio en estructura**

Este documento explica el _porque_ de cada decision visual. El CSS es la fuente
de verdad de los _valores_; aqui esta el criterio para usarlos.

---

## 1. Color

### Arquitectura en tres capas

```
PRIMITIVOS          SEMANTICOS            UTILIDADES
--n-950             --text                text-text
--a-base      -->   --accent        -->   bg-accent
oklch(...)          (cambia en .dark)     (lo unico que se usa)
```

**Regla inviolable:** los componentes usan **solo** la capa de utilidades.
Nunca `text-neutral-500`, nunca `#1a1a1a`, nunca `var(--n-500)`.

Motivo: el tema oscuro reasigna unicamente la capa semantica. Un componente que
salte esa capa se queda con el color del tema claro y rompe el modo oscuro. Es
el bug mas comun en sitios con doble tema.

### Por que OKLCH y no HEX

En OKLCH el primer valor es la luminosidad **percibida**. Dos colores con el
mismo valor de `L` se ven igual de brillantes aunque sean de matices distintos —
algo que HEX y HSL no garantizan (el amarillo puro y el azul puro en HSL tienen
la misma "luminosidad" nominal y se perciben radicalmente distintos).

Consecuencia practica: se puede cambiar el matiz del acento sin recalcular todos
los contrastes.

### Tokens semanticos disponibles

| Token            | Uso                                         |
| ---------------- | ------------------------------------------- |
| `bg`             | Fondo de la pagina                          |
| `bg-subtle`      | Fondo de seccion alterna, para marcar ritmo |
| `surface`        | Tarjetas y paneles                          |
| `surface-raised` | Elementos por encima de una tarjeta         |
| `border`         | Separadores normales                        |
| `border-strong`  | Bordes que necesitan presencia              |
| `text`           | Texto principal                             |
| `text-muted`     | Texto secundario, descripciones             |
| `text-faint`     | Metadatos, fechas, notas al pie             |
| `accent`         | CTA, enlaces, elemento activo               |
| `accent-surface` | Fondo tenue para resaltados y etiquetas     |
| `on-accent`      | Texto sobre fondo de acento                 |

### Uso del acento

El color de acento es **escaso por diseno**. Cuando todo destaca, nada destaca.

- Maximo **un** elemento de acento por pantalla visible.
- Se reserva para la accion que quieres que ocurra: la CTA primaria.
- Los enlaces de navegacion usan `text` con subrayado, no acento.

### El acento: rojo vino

Decision cerrada. Matiz **15** en OKLCH, con **cuatro** tonos en vez de tres.

| Primitivo    | Valor                 | Para que                          |
| ------------ | --------------------- | --------------------------------- |
| `--a-soft`   | `oklch(0.93 0.04 15)` | Fondos tenues y etiquetas (claro) |
| `--a-base`   | `oklch(0.60 0.18 15)` | Acento en **tema oscuro**         |
| `--a-deep`   | `oklch(0.42 0.15 15)` | Acento en **tema claro**          |
| `--a-shadow` | `oklch(0.26 0.09 15)` | Superficies tenues (oscuro)       |

**Por que cuatro y no tres.** Un burdeos autentico es oscuro por definicion, y
sobre un fondo casi negro simplemente desaparece. El tema claro usa `--a-deep`
(contraste ~5:1 con blanco encima); el oscuro necesita `--a-base`, mas luminoso,
para seguir siendo legible sin dejar de leerse como vino.

**Consecuencia importante:** `--text-on-accent` se **invierte** entre temas.
Sobre el vino profundo del tema claro va texto blanco; sobre el vino luminoso
del tema oscuro va texto casi negro. Por eso existe ese token: escribir
`text-white` a mano sobre un boton de acento romperia el contraste en un tema.

---

## 2. Tipografia

| Rol        | Familia             | Por que                                                 |
| ---------- | ------------------- | ------------------------------------------------------- |
| Display    | Bricolage Grotesque | Variable, con caracter. Aporta lo "audaz" sin recargar. |
| Cuerpo     | Inter               | Disenada para pantalla, legible a tamano pequeno.       |
| Monoespac. | JetBrains Mono      | Etiquetas tecnicas, stack, detalles de codigo.          |

Las tres son **variables y auto-alojadas** via Fontsource. Auto-alojar evita una
peticion a un dominio externo (mas rapido, y sin implicaciones de RGPD que si
tiene Google Fonts). Al ser variables, un unico fichero cubre todos los pesos.

### Escala fluida

Los tamanos usan `clamp(min, preferido, max)`, que interpola con el viewport sin
media queries. El termino central lleva `vw`, y los extremos lo acotan:

```css
--text-4xl: clamp(3rem, 2rem + 5vw, 6rem);
/*          movil   crece con pantalla  tope */
```

| Token       | Uso                                     |
| ----------- | --------------------------------------- |
| `text-5xl`  | Titular del hero. Uno por sitio.        |
| `text-4xl`  | Titulos de seccion.                     |
| `text-3xl`  | Titulos de caso de estudio.             |
| `text-2xl`  | Subtitulos.                             |
| `text-lg`   | Texto destacado, entradilla.            |
| `text-base` | Cuerpo.                                 |
| `text-sm`   | Metadatos.                              |
| `text-xs`   | Etiquetas en mayusculas, monoespaciado. |

### Detalles de composicion

- Titulos con `letter-spacing: -0.03em`. A tamanos grandes el espaciado por
  defecto se ve suelto; el tracking negativo compacta y da presencia.
- `text-wrap: balance` en titulos evita la linea huerfana de una sola palabra.
- `text-wrap: pretty` en parrafos mejora los finales de linea.
- Medida de lectura maxima **65-75 caracteres** (`max-w-prose`). Mas ancho y el
  ojo pierde el salto de linea.

---

## 3. Espaciado y ritmo

Se usa la escala de Tailwind (multiplos de `0.25rem`), restringida a estos pasos
para mantener ritmo: **2, 4, 6, 8, 12, 16, 24, 32**.

| Contexto                      | Valor             |
| ----------------------------- | ----------------- |
| Espaciado vertical de seccion | `py-24` a `py-32` |
| Margen lateral movil          | `px-6`            |
| Ancho maximo de contenido     | `max-w-5xl`       |
| Separacion entre tarjetas     | `gap-8`           |

**Principio de proximidad:** el espacio _antes_ de un titulo de seccion debe ser
claramente mayor que el espacio _despues_. Si son iguales, el titulo flota sin
pertenecer a su contenido y la pagina pierde estructura.

---

## 4. Movimiento

La direccion es audaz, asi que el movimiento hace trabajo real de diseno. Con
tres reglas que lo mantienen del lado correcto:

1. **CSS nativo antes que librerias.** `view-transitions` y animaciones ligadas
   al scroll estan en el navegador. Importar 40 KB de una libreria de animacion
   para lo que el CSS ya hace contradice el ADR-0001.
2. **Nada bloquea la lectura.** El contenido es legible desde el primer
   fotograma. La animacion acompana, no gobierna.
3. **`prefers-reduced-motion` es obligatorio**, no opcional. Ya esta aplicado de
   forma global en `global.css`. Quien lo active recibe el sitio completo,
   estatico.

| Token                     | Valor  | Uso                            |
| ------------------------- | ------ | ------------------------------ |
| `--animate-duration-fast` | 150 ms | Hover, foco, cambios de estado |
| `--animate-duration-base` | 300 ms | Entradas, transiciones de tema |
| `--animate-duration-slow` | 600 ms | Revelados al hacer scroll      |
| `--ease-out-quint`        | —      | Movimiento general de UI       |
| `--ease-spring`           | —      | Acentos expresivos, con rebote |

**Regla del 300:** si una animacion tarda mas de 300 ms en algo que el usuario
inicio (un clic, un hover), se percibe como lentitud, no como elegancia. Las
duraciones largas se reservan para lo que ocurre sin que lo pidan.

---

## 5. Accesibilidad

No es una fase final: son restricciones de diseno desde el principio.

- **Contraste** minimo 4.5:1 en texto normal, 3:1 en texto grande (WCAG 2.2 AA).
- **Foco visible** siempre. Ya definido globalmente con `:focus-visible`.
  Eliminar un outline sin sustituirlo deja el sitio inutilizable con teclado.
- **Objetivos tactiles** de 44x44 px minimo en movil.
- **Jerarquia de encabezados** sin saltos: un solo `h1` por pagina, sin pasar de
  `h2` a `h4`. Los lectores de pantalla navegan por esta estructura.
- **El color nunca es el unico portador de informacion.** Un enlace se distingue
  ademas por subrayado; un estado, ademas por icono o texto.
- **Enlace de salto al contenido** como primer elemento enfocable. Ya implementado.

---

## 6. Checklist antes de dar por buena una seccion

- [ ] Funciona en claro y en oscuro
- [ ] Legible a 320 px de ancho, sin scroll horizontal
- [ ] Navegable solo con teclado, con foco siempre visible
- [ ] Ningun color escrito a mano; solo tokens semanticos
- [ ] Contraste verificado en ambos temas
- [ ] Coherente con `prefers-reduced-motion` activado
- [ ] Ningun texto codificado en el componente: todo en `ui.ts` o en contenido
