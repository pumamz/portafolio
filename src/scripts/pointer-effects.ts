/**
 * Interacciones de puntero: inclinacion 3D de tarjetas y botones magneticos.
 *
 * Reglas que sigue todo este fichero:
 *
 * 1. **Solo con puntero fino.** `(pointer: fine)` excluye tactiles. En un
 *    movil no hay cursor que seguir, y un elemento que reacciona al "hover"
 *    tactil se queda pegado en su estado activo tras el toque.
 * 2. **Nada de esto es necesario para usar el sitio.** Si no se ejecuta,
 *    todo sigue funcionando: son adornos sobre elementos que ya funcionan.
 * 3. **Escrituras al DOM solo dentro de requestAnimationFrame.** Los
 *    eventos de puntero se disparan mas rapido que los fotogramas.
 */

const MAX_TILT_DEG = 5;
const MAGNET_STRENGTH = 0.22;
const MAGNET_RADIUS = 70;

type Cleanup = () => void;

const cleanups: Cleanup[] = [];

function canHover(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ------------------------------------------------------------------ */
/* Inclinacion 3D de tarjetas                                          */
/* ------------------------------------------------------------------ */

/**
 * BUG CORREGIDO - temblor en los bordes de la tarjeta.
 *
 * Antes, las escuchas vivian en el mismo elemento que rota. Al acercar el
 * cursor a un borde, la rotacion desplazaba la tarjeta lo suficiente como
 * para salir de debajo del puntero: se disparaba `pointerleave`, la
 * tarjeta volvia a su sitio, entraba `pointerenter`, y vuelta a empezar.
 * Un bucle de realimentacion que se percibe como trabado.
 *
 * La correccion es escuchar en el CONTENEDOR de perspectiva, que nunca se
 * transforma, y escribir las variables en el hijo. El area de deteccion es
 * entonces estable pase lo que pase con la rotacion.
 */
function initTilt() {
  const roots = document.querySelectorAll<HTMLElement>('[data-tilt-root]');
  if (roots.length === 0) return;

  roots.forEach((root) => {
    const card = root.querySelector<HTMLElement>('[data-tilt]');
    if (!card) return;

    let frame = 0;
    let inside = false;

    const onMove = (event: PointerEvent) => {
      // Se mide sobre el contenedor, no sobre la tarjeta rotada: el rect de
      // un elemento con rotateX/Y crece y se mueve, y daria coordenadas
      // inestables justo en los bordes.
      const rect = root.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!inside) {
          inside = true;
          card.classList.add('tilt-active');
        }
        // El eje X se invierte: mover el raton hacia abajo debe hundir el
        // borde inferior, no levantarlo.
        card.style.setProperty('--tilt-y', `${(px - 0.5) * MAX_TILT_DEG * 2}deg`);
        card.style.setProperty('--tilt-x', `${-(py - 0.5) * MAX_TILT_DEG * 2}deg`);
        card.style.setProperty('--pointer-x', `${px * 100}%`);
        card.style.setProperty('--pointer-y', `${py * 100}%`);
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame);
      inside = false;
      // Se quita `tilt-active` para que la transicion devuelva la tarjeta a
      // su posicion en lugar de saltar.
      card.classList.remove('tilt-active');
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);

    cleanups.push(() => {
      cancelAnimationFrame(frame);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Botones magneticos                                                  */
/* ------------------------------------------------------------------ */

/**
 * BUG CORREGIDO - bordes que desaparecen.
 *
 * `will-change: transform` permanente promueve el boton a su propia capa
 * de GPU. El navegador cachea esa capa a una resolucion fija, y al
 * desplazarla con valores decimales el borde de 1px cae entre pixeles y
 * parpadea o desaparece.
 *
 * Dos correcciones: el desplazamiento se redondea a enteros, y
 * `will-change` solo se activa mientras el boton se mueve de verdad.
 */
function initMagnetic() {
  const magnets = document.querySelectorAll<HTMLElement>('[data-magnetic]');
  if (magnets.length === 0) return;

  magnets.forEach((el) => {
    let frame = 0;

    const onEnter = () => {
      el.style.willChange = 'transform';
    };

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy);

        // La atraccion se desvanece con la distancia: cerca del borde del
        // radio el desplazamiento es casi nulo y no da tirones al entrar.
        const falloff = Math.max(0, 1 - distance / (MAGNET_RADIUS + rect.width / 2));
        const x = Math.round(dx * MAGNET_STRENGTH * falloff);
        const y = Math.round(dy * MAGNET_STRENGTH * falloff);

        el.style.transform = x === 0 && y === 0 ? '' : `translate(${x}px, ${y}px)`;
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.transform = '';
      // Liberar la capa al terminar: mantenerla viva consume memoria de
      // video y es justo lo que provoca el artefacto del borde.
      el.style.willChange = '';
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    cleanups.push(() => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.style.transform = '';
      el.style.willChange = '';
    });
  });
}

/* ------------------------------------------------------------------ */

export function initPointerEffects() {
  if (!canHover() || prefersReducedMotion()) return;
  initTilt();
  initMagnetic();
}

export function destroyPointerEffects() {
  while (cleanups.length) cleanups.pop()?.();
}
