/**
 * Interacciones de puntero: inclinacion 3D de tarjetas.
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
 *
 * RETIRADO - botones magneticos. Los botones se desplazaban hacia el cursor
 * dentro de un radio. Se quito a peticion del autor. Nota para el futuro:
 * un boton que huye del sitio donde el visitante apunta convierte un clic
 * seguro en uno que hay que perseguir, y el desplazamiento obligaba a
 * redondear a enteros y a activar `will-change` a mano para que no
 * desaparecieran los bordes de 1px. Mucho coste para un guino.
 */

const MAX_TILT_DEG = 5;

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

export function initPointerEffects() {
  if (!canHover() || prefersReducedMotion()) return;
  initTilt();
}

export function destroyPointerEffects() {
  while (cleanups.length) cleanups.pop()?.();
}
