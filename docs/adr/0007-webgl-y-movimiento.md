# 0007 - WebGL con Three.js para el campo de particulas

- **Estado:** aceptado
- **Fecha:** 2026-07-26
- **Relacion:** matiza el [ADR-0001](./0001-framework.md), que priorizaba
  "cero JavaScript por defecto"

## Contexto

La direccion de diseno acordada era "audaz en tipografia y movimiento, sobrio
en estructura", implementada solo con CSS. Tras ver el sitio construido, el
autor pidio explicitamente un salto de nivel: animaciones 3D, escenas WebGL y
una interactividad al nivel de las paginas de producto de Apple.

Se le presentaron cuatro opciones con su coste medido y eligio **WebGL
completo**, entendiendo que multiplica por mas de veinte el JavaScript del
sitio. Es una decision informada del propietario del producto, no un descuido.

Conviene registrar un dato que se pasa por alto a menudo: las paginas de
producto de Apple **no usan 3D en tiempo real** para sus secuencias de scroll,
sino cientos de imagenes pre-renderizadas. El 3D interactivo lo reservan para
configuradores concretos.

## Decision

Anadir una escena WebGL de particulas al hero, con **Three.js directo** y
shaders propios, mas una capa de microinteracciones.

Cuatro restricciones acotan el coste:

1. **Three.js se carga con `import()` dinamico dentro de
   `requestIdleCallback`.** No aparece en el HTML inicial ni lleva
   `modulepreload`, de modo que no compite con el primer pintado.
2. **Un unico objeto `Points` con shaders propios.** Toda la simulacion vive
   en la GPU; JavaScript no toca posiciones por fotograma.
3. **El bucle se detiene** cuando el hero sale de pantalla o la pestana pasa a
   segundo plano.
4. **La densidad se adapta** al ancho de pantalla y a `deviceMemory`: entre
   1.800 y 8.000 particulas.

Con `prefers-reduced-motion: reduce` o sin soporte de WebGL, la escena no llega
a cargarse: se sirve el resplandor CSS que ya existia.

## Alternativas consideradas

### React Three Fiber

Descartada. Habria obligado a reactivar la integracion de React (unos 45 KB
comprimidos adicionales) para envolver una escena que no necesita arbol de
componentes ni estado declarativo. Three.js directo hace lo mismo por menos.

### Secuencia de imagenes pre-renderizadas

El metodo real de Apple. Descartada porque exige producir los fotogramas en
Blender y su peso en red seria comparable o mayor, sin ganar interactividad:
una secuencia no reacciona al cursor.

### Solo CSS 3D

Era la recomendacion tecnica y se descarto por decision del autor. Habria
mantenido el sitio en 5,4 KB con transformaciones 3D reales, pero sin
particulas ni reactividad al puntero.

## Consecuencias

### Positivas

- La carga inicial apenas se mueve: de 5,4 KB a **6,7 KB** comprimidos.
- Con la escena ya descargada, el coste de red total sigue por debajo del de
  una sola fotografia sin optimizar de las que llevan muchos portafolios.
- Un unico `draw call` para hasta 8.000 particulas.
- Nada del contenido depende de que WebGL funcione.

### Negativas / coste asumido

- **128 KB comprimidos de Three.js** que el visitante acaba descargando. Es
  mas de veinte veces el peso del resto del sitio junto.
- **Consumo de GPU y bateria** mientras el hero esta visible, mitigado pero no
  eliminado por la parada automatica.
- El presupuesto declarado en `requirements.md` sube de 30 KB a 30 KB
  **iniciales** mas un techo separado de 150 KB diferidos.
- Mas superficie de fallo: contextos WebGL perdidos, controladores antiguos,
  navegadores en modo ahorro. De ahi la deteccion de soporte previa.
- `three` es ahora una dependencia con actualizaciones frecuentes y cambios de
  API entre versiones menores.

## Revision pendiente

Medir Lighthouse en movil sobre produccion. Si la puntuacion de rendimiento
cae por debajo de 90, la primera palanca es limitar la carga de la escena a
escritorio, que era la opcion hibrida descartada al principio.
