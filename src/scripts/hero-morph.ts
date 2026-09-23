/**
 * El hero se transforma en el carril lateral al desplazar.
 *
 * Cada pieza del hero —nombre, rol, indice, redes, ubicacion, retrato—
 * vuela hasta el hueco que le corresponde en el carril, encogiendo por el
 * camino. No es un relevo entre dos juegos de elementos: los que vuelan
 * son los del hero, y al aterrizar SON el carril. Siguen siendo los
 * mismos nodos y los mismos enlaces.
 *
 * ---------------------------------------------------------------------
 * POR QUE ESTO ES JAVASCRIPT Y NO `animation-timeline: scroll()`.
 *
 * Se intento primero en CSS puro, que es la regla de la casa. No funciona
 * para esto: una animacion de scroll solo sabe interpolar valores que le
 * escribas a mano, asi que hay que calcular a pelo el desplazamiento y la
 * escala de CADA pieza, en cada tamano de ventana. Son numeros magicos
 * que se desajustan en cuanto cambia una fuente, un padding o el ancho
 * del carril, y que no se pueden verificar sin abrir el navegador.
 *
 * Este fichero no tiene ni un numero magico: mide con
 * getBoundingClientRect() donde esta cada pieza en el hero y donde esta
 * su destino en el carril, y resta. Se recalcula al cambiar el tamano de
 * la ventana, asi que aterriza exacto en cualquier pantalla.
 *
 * Coste: menos de 2 KB. Cabe de sobra en el presupuesto, sobre todo
 * despues de que la retirada de Three.js liberara 127 KB.
 * ---------------------------------------------------------------------
 *
 * Nada de esto es necesario para usar el sitio. Si no se ejecuta, el
 * carril esta visible desde el principio y el hero se queda quieto: se
 * pierde la transformacion, no la navegacion.
 */

type Pair = {
  /** La pieza del hero, que es la que se ve y la que vuela. */
  el: HTMLElement;
  /** Su hueco en el carril. Solo se usa para medir; nunca se ve. */
  target: HTMLElement;
  /** Desfase para que las piezas no lleguen todas a la vez. */
  stagger: number;
  dx: number;
  dy: number;
  scale: number;
};

type Cleanup = () => void;
const cleanups: Cleanup[] = [];

/** Por debajo de este ancho no hay carril lateral, asi que no hay viaje. */
const DESKTOP = '(min-width: 64rem)';

/** Cuanto scroll dura la transformacion, en fraccion de ventana. */
const TRAVEL = 0.62;

/** Desfase maximo entre la primera pieza y la ultima. */
const MAX_STAGGER = 0.28;

/**
 * Frenada larga: las piezas salen decididas y se posan. `linear` delata
 * movimiento generado por defecto y aqui se notaria muchisimo, porque
 * son diez cosas moviendose a la vez.
 */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

export function initHeroMorph(): void {
  const root = document.querySelector<HTMLElement>('[data-morph-root]');
  if (!root) return;

  // Quien pide menos movimiento no recibe diez elementos volando. El
  // carril se queda como esta, visible y quieto.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const desktop = window.matchMedia(DESKTOP);
  if (!desktop.matches) return;

  const sources = Array.from(root.querySelectorAll<HTMLElement>('[data-morph]'));
  const pairs: Pair[] = [];

  sources.forEach((el, i) => {
    const key = el.dataset.morph;
    if (!key) return;
    const target = document.querySelector<HTMLElement>(`[data-morph-to="${key}"]`);
    if (!target) return;
    pairs.push({
      el,
      target,
      stagger: sources.length > 1 ? (i / (sources.length - 1)) * MAX_STAGGER : 0,
      dx: 0,
      dy: 0,
      scale: 1,
    });
  });

  if (pairs.length === 0) return;

  // Marca el documento: el CSS usa esto para ocultar las copias del
  // carril, que a partir de ahora solo sirven de regla de medir.
  document.documentElement.dataset.morph = 'on';

  let travel = window.innerHeight * TRAVEL;

  /**
   * Mide origen y destino de cada pieza.
   *
   * Se mide SIN transformacion aplicada, porque getBoundingClientRect()
   * devuelve la caja ya transformada y si no se limpia primero, cada
   * medida saldria contaminada por la anterior.
   */
  function measure() {
    pairs.forEach((p) => {
      p.el.style.transform = '';
    });

    travel = window.innerHeight * TRAVEL;
    const scroll = window.scrollY;

    pairs.forEach((p) => {
      const from = p.el.getBoundingClientRect();
      const to = p.target.getBoundingClientRect();
      if (from.width === 0 || to.width === 0) {
        p.dx = p.dy = 0;
        p.scale = 1;
        return;
      }
      /* El destino esta en `position: fixed`, asi que su caja no depende
         del scroll. El origen si: esta en el flujo. Hay que restar el
         scroll del momento de medir para pasar el origen a coordenadas de
         documento; si no, medir con la pagina desplazada (una recarga a
         media pagina, un cambio de tamano tras bajar) deja el aterrizaje
         desviado justo esos pixeles. */
      p.dx = to.left - from.left;
      p.dy = to.top - (from.top + scroll);
      p.scale = to.width / from.width;
      /* El origen arriba-izquierda hace que el escalado no desplace la
         pieza: la esquina se queda quieta y solo encoge hacia dentro.

         Sin `will-change`: esta documentado en AGENTS.md que dejarlo
         puesto de forma permanente cachea el elemento en una capa de GPU
         a resolucion fija y hace parpadear los contornos de un pixel. El
         navegador ya promueve solo lo que esta transformando. */
      p.el.style.transformOrigin = 'left top';
    });
  }

  /**
   * Coloca cada pieza segun el scroll.
   *
   * La clave: el elemento sigue EN EL FLUJO, no se pasa a `fixed`. Al
   * desplazar, subiria con la pagina; se le suma el scroll para dejarlo
   * clavado en la ventana mientras viaja. Asi no hay que reservar huecos
   * ni se descuadra la maquetacion del hero, que es lo que pasaba con la
   * version anterior.
   */
  function apply() {
    const scroll = window.scrollY;
    const raw = clamp01(scroll / travel);

    // Lo que no vuela (el panel del carril, el rol, los conmutadores)
    // aparece al ritmo del viaje. Una sola variable para todo eso: asi el
    // CSS no tiene que adivinar en que punto va la transformacion.
    document.documentElement.style.setProperty('--morph-p', raw.toFixed(3));

    pairs.forEach((p) => {
      const span = 1 - p.stagger;
      const t = easeOut(clamp01((raw - p.stagger) / span));
      const x = p.dx * t;
      const y = scroll * t + p.dy * t;
      const s = 1 + (p.scale - 1) * t;
      p.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
    });
  }

  let frame = 0;
  const onScroll = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(apply);
  };

  let resizeFrame = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (!desktop.matches) {
        destroyHeroMorph();
        return;
      }
      measure();
      apply();
    });
  };

  measure();
  apply();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  cleanups.push(() => {
    cancelAnimationFrame(frame);
    cancelAnimationFrame(resizeFrame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    delete document.documentElement.dataset.morph;
    document.documentElement.style.removeProperty('--morph-p');
    pairs.forEach((p) => {
      p.el.style.transform = '';
      p.el.style.transformOrigin = '';
    });
  });
}

export function destroyHeroMorph(): void {
  while (cleanups.length) cleanups.pop()?.();
}
