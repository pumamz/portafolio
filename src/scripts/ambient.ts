/**
 * Efecto ambiental: foco de fondo, ligado al puntero y con vida propia.
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
    /* Las variables se escriben en un subarbol pequeno, NO en la seccion.

       Escribir una propiedad personalizada invalida el estilo de todo el
       subarbol que cuelga de ella, y de esta seccion cuelga el hero
       entero. Con un bucle a 60 fps escribiendo ahi, el coste se nota:
       paso con --morph-p en <html>, que hundio el bloqueo a 19-24 fps.
       El destino declarado solo contiene las dos capas de fondo. */
    const target = section.querySelector<HTMLElement>('[data-reactive-grid-target]') ?? section;

    let frame = 0;
    let ocioso = 0;
    /* El reloj avanza SOLO mientras deriva, asi que al volver de una
       pausa el foco sigue donde lo dejo en lugar de saltar. */
    let fase = 0;
    let ultimo = 0;
    let x = 50;
    let y = 40;
    let power = 0;

    const escribir = () => {
      target.style.setProperty('--grid-x', `${x.toFixed(2)}%`);
      target.style.setProperty('--grid-y', `${y.toFixed(2)}%`);
      target.style.setProperty('--grid-power', power.toFixed(3));
    };

    /**
     * Deriva sola cuando nadie mueve el raton.
     *
     * Dos senos de periodos primos entre si: el recorrido no se repite a
     * simple vista, que es lo que separa "esta vivo" de "hay un bucle".
     * La intensidad se queda a media asta, por debajo de la que da el
     * puntero, para que seguir el raton siga notandose mas.
     */
    let ultimoEscrito = 0;
    const derivar = (t: number) => {
      if (!ultimo) ultimo = t;
      fase += t - ultimo;
      ultimo = t;
      frame = requestAnimationFrame(derivar);

      /* A ~25 escrituras por segundo, no a 60.

         Cada escritura obliga a recomponer una mascara radial a pantalla
         completa, que es de lo mas caro que hay en CSS. A 60 Hz el reposo
         caia a 45 fps. Esto se mueve a unos 90 px por segundo: a 25 Hz se
         ve igual de fluido y cuesta menos de la mitad. */
      if (t - ultimoEscrito < 40) return;
      ultimoEscrito = t;

      // Periodos de ~11 s y ~4 s. Con los de ~45 s que habia antes el
      // movimiento existia pero no se percibia: 8 px por segundo se lee
      // como una pantalla quieta.
      x = 50 + Math.sin(fase / 1800) * 30 + Math.sin(fase / 700) * 9;
      y = 42 + Math.cos(fase / 2300) * 24 + Math.cos(fase / 900) * 8;
      power += (0.45 - power) * 0.05;
      escribir();
    };

    const pararDeriva = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      ultimo = 0;
    };

    const arrancarDeriva = () => {
      if (frame || document.hidden) return;
      frame = requestAnimationFrame(derivar);
    };

    const onMove = (event: PointerEvent) => {
      pararDeriva();
      window.clearTimeout(ocioso);
      const rect = section.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width) * 100;
      y = ((event.clientY - rect.top) / rect.height) * 100;
      power = 1;
      escribir();
      // Tras un rato quieto, el foco retoma su paseo.
      ocioso = window.setTimeout(arrancarDeriva, 1400);
    };

    const onLeave = () => {
      window.clearTimeout(ocioso);
      arrancarDeriva();
    };

    // Con la pestana oculta no se gastan fotogramas en un adorno.
    const onVisibility = () => (document.hidden ? pararDeriva() : arrancarDeriva());

    section.addEventListener('pointermove', onMove, { passive: true });
    section.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    arrancarDeriva();

    cleanups.push(() => {
      pararDeriva();
      window.clearTimeout(ocioso);
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
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
