/**
 * Interacciones de puntero: inclinacion 3D, cursor propio y botones
 * magneticos.
 *
 * Reglas que sigue todo este fichero:
 *
 * 1. **Solo con puntero fino.** `(pointer: fine)` excluye tactiles. En un
 *    movil no hay cursor que seguir, y un elemento que reacciona al "hover"
 *    tactil se queda pegado en su estado activo tras el toque.
 * 2. **Nada de esto es necesario para usar el sitio.** Si no se ejecuta,
 *    todo sigue funcionando: son adornos sobre elementos que ya funcionan.
 * 3. **Escrituras al DOM solo dentro de requestAnimationFrame.** Los
 *    eventos de puntero se disparan mas rapido que los fotogramas; escribir
 *    en cada evento provoca recalculos de estilo innecesarios.
 */

const MAX_TILT_DEG = 7;
const MAGNET_STRENGTH = 0.32;
const MAGNET_RADIUS = 90;

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

function initTilt() {
  const cards = document.querySelectorAll<HTMLElement>('[data-tilt]');
  if (cards.length === 0) return;

  cards.forEach((card) => {
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        // Coordenadas relativas al centro, normalizadas a -0.5..0.5
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;

        // El eje X se invierte: mover el raton hacia abajo debe hundir el
        // borde inferior, no levantarlo.
        card.style.setProperty('--tilt-y', `${(px - 0.5) * MAX_TILT_DEG * 2}deg`);
        card.style.setProperty('--tilt-x', `${-(py - 0.5) * MAX_TILT_DEG * 2}deg`);
        card.style.setProperty('--tilt-z', '12px');
        card.style.setProperty('--pointer-x', `${px * 100}%`);
        card.style.setProperty('--pointer-y', `${py * 100}%`);
      });
    };

    const onEnter = () => card.classList.add('tilt-active');

    const onLeave = () => {
      cancelAnimationFrame(frame);
      // Se quita `tilt-active` para que la transicion devuelva la tarjeta
      // a su posicion en lugar de saltar.
      card.classList.remove('tilt-active');
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--tilt-z', '0px');
    };

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);

    cleanups.push(() => {
      cancelAnimationFrame(frame);
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Botones magneticos                                                  */
/* ------------------------------------------------------------------ */

function initMagnetic() {
  const magnets = document.querySelectorAll<HTMLElement>('[data-magnetic]');
  if (magnets.length === 0) return;

  magnets.forEach((el) => {
    let frame = 0;

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
        el.style.transform = `translate(${dx * MAGNET_STRENGTH * falloff}px, ${dy * MAGNET_STRENGTH * falloff}px)`;
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.transform = '';
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    cleanups.push(() => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Cursor propio                                                       */
/* ------------------------------------------------------------------ */

function initCursor() {
  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const ring = document.querySelector<HTMLElement>('[data-cursor-ring]');
  if (!dot || !ring) return;

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let ringX = pointerX;
  let ringY = pointerY;
  let frame = 0;
  let active = false;

  const onMove = (event: PointerEvent) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!active) {
      active = true;
      // Se revela en el primer movimiento real. Mostrarlo antes lo dejaria
      // clavado en una esquina hasta que el usuario mueva el raton.
      dot.dataset.active = '';
      ring.dataset.active = '';
      ringX = pointerX;
      ringY = pointerY;
    }
  };

  const onOver = (event: PointerEvent) => {
    const target = event.target as HTMLElement | null;
    const interactive = target?.closest('a, button, [role="button"], input, summary');
    ring.classList.toggle('cursor-ring-hover', Boolean(interactive));
  };

  const onLeaveWindow = () => {
    delete dot.dataset.active;
    delete ring.dataset.active;
    active = false;
  };

  function loop() {
    // El punto sigue al puntero exacto; el anillo lo persigue con retardo.
    // Ese desfase es lo que da la sensacion de peso.
    ringX += (pointerX - ringX) * 0.18;
    ringY += (pointerY - ringY) * 0.18;

    dot!.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
    ring!.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    frame = requestAnimationFrame(loop);
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerover', onOver, { passive: true });
  document.addEventListener('pointerleave', onLeaveWindow);
  frame = requestAnimationFrame(loop);

  cleanups.push(() => {
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerleave', onLeaveWindow);
  });
}

/* ------------------------------------------------------------------ */

export function initPointerEffects() {
  if (!canHover() || prefersReducedMotion()) return;
  document.documentElement.dataset.pointerEffects = '';
  initTilt();
  initMagnetic();
  initCursor();
}

export function destroyPointerEffects() {
  while (cleanups.length) cleanups.pop()?.();
  delete document.documentElement.dataset.pointerEffects;
}
