/**
 * Efecto ambiental: rejilla de fondo que reacciona al puntero.
 *
 * Solo la usa la seccion de Stack. El hero tuvo un foco equivalente, con
 * seguimiento del raton y deriva propia, y se retiro a peticion del autor:
 * la luz moviendose distraia mas de lo que aportaba.
 *
 * Aqui vivian tambien un contador que animaba cifras y un efecto de
 * profundidad para la foto. Los dos se quedaron sin un solo elemento al
 * que aplicarse cuando se rehizo el hero, y seguian viajando al cliente:
 * se retiraron. Si vuelve a hacer falta alguno, esta en el historial.
 */

type Cleanup = () => void;
const cleanups: Cleanup[] = [];

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function canHover(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/* ------------------------------------------------------------------ */
/* Rejilla de fondo reactiva                                           */
/* ------------------------------------------------------------------ */

/**
 * La rejilla esta siempre pintada, pero enmascarada: solo se ve donde hay
 * mascara. Moviendo el centro de la mascara con el puntero se consigue el
 * efecto de superficie que responde al tacto, sin repintar la rejilla ni
 * animar ninguna propiedad que provoque reflujo.
 */
function initReactiveGrid() {
  const sections = document.querySelectorAll<HTMLElement>('[data-reactive-grid]');
  if (sections.length === 0) return;

  sections.forEach((section) => {
    const target = section.querySelector<HTMLElement>('[data-reactive-grid-target]') ?? section;

    let frame = 0;

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        target.style.setProperty(
          '--grid-x',
          `${((event.clientX - rect.left) / rect.width) * 100}%`,
        );
        target.style.setProperty(
          '--grid-y',
          `${((event.clientY - rect.top) / rect.height) * 100}%`,
        );
        target.style.setProperty('--grid-power', '1');
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame);
      // Se apaga en lugar de quedarse encendida en el ultimo punto.
      target.style.setProperty('--grid-power', '0');
    };

    section.addEventListener('pointermove', onMove, { passive: true });
    section.addEventListener('pointerleave', onLeave);

    cleanups.push(() => {
      cancelAnimationFrame(frame);
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
    });
  });
}

export function initAmbient() {
  // Los contadores se animan aunque haya puntero grueso: no dependen del
  // raton. El resto son efectos de hover y no tienen sentido sin el.
  if (canHover() && !prefersReducedMotion()) {
    initReactiveGrid();
  }
}

export function destroyAmbient() {
  while (cleanups.length) cleanups.pop()?.();
}
