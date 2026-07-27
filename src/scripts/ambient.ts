/**
 * Efectos ambientales: rejilla reactiva, contadores y profundidad de foto.
 *
 * Los tres comparten fichero porque los tres son adornos opcionales sobre
 * elementos que ya funcionan sin ellos, y agruparlos evita tres peticiones
 * de red para tres funciones de veinte lineas.
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
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        section.style.setProperty(
          '--grid-x',
          `${((event.clientX - rect.left) / rect.width) * 100}%`,
        );
        section.style.setProperty(
          '--grid-y',
          `${((event.clientY - rect.top) / rect.height) * 100}%`,
        );
        section.style.setProperty('--grid-power', '1');
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame);
      // Vuelve al centro en lugar de apagarse de golpe.
      section.style.setProperty('--grid-power', '0');
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

/* ------------------------------------------------------------------ */
/* Contadores                                                          */
/* ------------------------------------------------------------------ */

/**
 * Cuenta desde cero al entrar en pantalla.
 *
 * `tabular-nums` en el CSS es imprescindible: sin cifras de ancho fijo, el
 * numero cambia de anchura en cada fotograma y todo el bloque tiembla.
 */
function initCounters() {
  const counters = document.querySelectorAll<HTMLElement>('[data-count-to]');
  if (counters.length === 0) return;

  const animate = (el: HTMLElement) => {
    const target = Number(el.dataset.countTo);
    if (!Number.isFinite(target)) return;

    const duration = 1200;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubico: arranca rapido y frena, que es como se percibe
      // un contador con peso. Lineal parece un marcador de gasolinera.
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target as HTMLElement);
        // Se anima una sola vez: repetirlo en cada scroll cansa.
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 },
  );

  counters.forEach((el) => observer.observe(el));
  cleanups.push(() => observer.disconnect());
}

/* ------------------------------------------------------------------ */
/* Profundidad de la foto                                              */
/* ------------------------------------------------------------------ */

/**
 * Paralaje de dos capas sobre una imagen plana: el marco se inclina y la
 * imagen se desplaza dentro en sentido contrario. Ese desfase entre
 * contenedor y contenido es lo que el ojo interpreta como profundidad.
 */
function initPhotoDepth() {
  const frames = document.querySelectorAll<HTMLElement>('[data-photo-depth]');
  if (frames.length === 0) return;

  frames.forEach((frame) => {
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = frame.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;

        frame.style.setProperty('--photo-rx', `${-py * 10}deg`);
        frame.style.setProperty('--photo-ry', `${px * 10}deg`);
        frame.style.setProperty('--photo-shift-x', `${-px * 14}px`);
        frame.style.setProperty('--photo-shift-y', `${-py * 14}px`);
        frame.style.setProperty('--photo-light-x', `${(px + 0.5) * 100}%`);
        frame.style.setProperty('--photo-light-y', `${(py + 0.5) * 100}%`);
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(raf);
      frame.style.setProperty('--photo-rx', '0deg');
      frame.style.setProperty('--photo-ry', '0deg');
      frame.style.setProperty('--photo-shift-x', '0px');
      frame.style.setProperty('--photo-shift-y', '0px');
    };

    frame.addEventListener('pointermove', onMove, { passive: true });
    frame.addEventListener('pointerleave', onLeave);

    cleanups.push(() => {
      cancelAnimationFrame(raf);
      frame.removeEventListener('pointermove', onMove);
      frame.removeEventListener('pointerleave', onLeave);
    });
  });
}

/* ------------------------------------------------------------------ */

export function initAmbient() {
  // Los contadores se animan aunque haya puntero grueso: no dependen del
  // raton. El resto son efectos de hover y no tienen sentido sin el.
  if (!prefersReducedMotion()) initCounters();
  if (canHover() && !prefersReducedMotion()) {
    initReactiveGrid();
    initPhotoDepth();
  }
}

export function destroyAmbient() {
  while (cleanups.length) cleanups.pop()?.();
}
