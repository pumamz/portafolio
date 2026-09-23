/**
 * El hero se transforma en el carril lateral mientras esta anclado.
 *
 * Cada pieza del hero —nombre, indice, redes, retrato— vuela hasta el
 * hueco que le corresponde en el carril, encogiendo por el camino. No es
 * un relevo entre dos juegos de elementos: los que vuelan son los del
 * hero, y al aterrizar caen exactamente sobre su pareja del carril.
 *
 * ---------------------------------------------------------------------
 * EL ANCLAJE ES LO QUE HACE QUE ESTO NO TIEMBLE.
 *
 * La version anterior dejaba el hero desplazandose y compensaba sumando
 * el scroll a cada pieza para dejarlas clavadas en la ventana. Eso no
 * puede ir fino: el compositor desplaza la pagina por su cuenta y el
 * transform que escribe JavaScript llega siempre un fotograma tarde, asi
 * que las piezas bailaban contra el carril, que si es `fixed` de verdad.
 * Ese era el parpadeo.
 *
 * Ahora la seccion va en `position: sticky` dentro de un contenedor alto.
 * Mientras se recorre ese contenedor, el hero se queda quieto en pantalla
 * y sus hijos NO se desplazan: el transform depende solo del avance, no
 * del scroll. Sin compensacion no hay desfase, y sin desfase no hay
 * parpadeo.
 *
 * El avance sale de cuanto se lleva recorrido del contenedor, asi que el
 * bloqueo y la animacion son la misma cosa y no pueden desincronizarse.
 * ---------------------------------------------------------------------
 *
 * No hay ni un numero magico de posicion: getBoundingClientRect() mide
 * donde esta cada pieza y donde esta su destino, y resta. Se recalcula al
 * cambiar el tamano de la ventana.
 *
 * Si no se ejecuta —sin JavaScript, en movil, o con
 * `prefers-reduced-motion`— el carril esta visible desde el principio y
 * el hero se queda quieto: se pierde la transformacion, no la navegacion.
 */

type Pair = {
  el: HTMLElement;
  target: HTMLElement;
  stagger: number;
  dx: number;
  dy: number;
  scale: number;
};

type Cleanup = () => void;
const cleanups: Cleanup[] = [];

/** Por debajo de este ancho no hay carril lateral, asi que no hay viaje. */
const DESKTOP = '(min-width: 64rem)';

/** Desfase maximo entre la primera pieza y la ultima. */
const MAX_STAGGER = 0.16;

/** A partir de aqui se considera aterrizado y se cede el relevo. */
const LANDED = 0.995;

/**
 * Frenada larga: las piezas salen decididas y se posan. `linear` delata
 * movimiento generado por defecto y aqui se notaria mucho, porque son
 * nueve cosas moviendose a la vez.
 */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

export function initHeroMorph(): void {
  const stage = document.querySelector<HTMLElement>('[data-morph-root]');
  const pin = document.querySelector<HTMLElement>('[data-morph-pin]');
  if (!stage || !pin) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const desktop = window.matchMedia(DESKTOP);
  if (!desktop.matches) {
    /* Cargar estrecho y ensanchar dejaba la pagina en el estado roto:
       esta funcion salia antes de registrar el listener de resize, asi que
       no se reintentaba nunca. Medido: cargando a 800 px y ensanchando a
       1440 quedaban 31 enlaces tabulables (los del hero y los del carril a
       la vez) y el carril sin formar. Se escucha el cruce del umbral. */
    const onCross = () => {
      if (!desktop.matches) return;
      desktop.removeEventListener('change', onCross);
      initHeroMorph();
    };
    desktop.addEventListener('change', onCross);
    cleanups.push(() => desktop.removeEventListener('change', onCross));
    return;
  }

  const sources = Array.from(stage.querySelectorAll<HTMLElement>('[data-morph]'));
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

  const html = document.documentElement;
  html.dataset.morph = 'on';

  /* --morph-p NO se escribe en <html>.
 
     Escribirla en la raiz invalida el estilo del documento entero en cada
     fotograma, aunque solo la lean cinco elementos. Medido: el bloqueo
     del hero caia a 19-24 fps. Se escribe en los dos subarboles que la
     consumen —el contenedor anclado y el carril— y el recalculo queda
     acotado a ellos. */
  const rail = document.querySelector<HTMLElement>('[data-rail]');
  const scopes = [pin, rail].filter(Boolean) as HTMLElement[];

  const heroFade = Array.from(document.querySelectorAll<HTMLElement>('[data-hero-fade]'));
  const railLate = Array.from(document.querySelectorAll<HTMLElement>('[data-rail-late]'));

  /** `inert` quita el elemento y su contenido del recorrido de tabulacion
   *  y del arbol de accesibilidad de una vez, sin tocar la maquetacion. */
  function setInert(list: HTMLElement[], on: boolean) {
    list.forEach((el) => {
      if (el.inert !== on) el.inert = on;
    });
  }

  let distance = 1;

  /**
   * Mide origen y destino de cada pieza.
   *
   * Las medidas se toman RELATIVAS A LA SECCION anclada, no a la ventana.
   * Motivo: si se mide con la pagina a medio recorrer, la seccion puede
   * estar pegada arriba o ya saliendo, y una medida en coordenadas de
   * ventana saldria desviada justo esa diferencia. Restando la caja de la
   * seccion, el numero es el mismo se mida cuando se mida.
   */
  function measure() {
    pairs.forEach((p) => {
      p.el.style.transform = '';
    });

    distance = Math.max(1, pin!.offsetHeight - window.innerHeight);
    const stageRect = stage!.getBoundingClientRect();

    pairs.forEach((p) => {
      const from = p.el.getBoundingClientRect();
      const to = p.target.getBoundingClientRect();
      if (from.width === 0 || to.width === 0) {
        p.dx = p.dy = 0;
        p.scale = 1;
        return;
      }
      // El destino esta en `fixed`: su caja ya esta en coordenadas de
      // ventana y no depende del scroll. El origen se traduce a la
      // posicion que tendra la seccion cuando este anclada arriba.
      p.dx = to.left - (from.left - stageRect.left);
      p.dy = to.top - (from.top - stageRect.top);
      p.scale = to.width / from.width;
      // El origen arriba-izquierda hace que el escalado no desplace la
      // pieza: la esquina se queda quieta y solo encoge hacia dentro.
      p.el.style.transformOrigin = 'left top';
    });
  }

  /**
   * Coloca cada pieza segun lo recorrido del contenedor anclado.
   *
   * Sin termino de scroll: la seccion esta quieta, asi que sus hijos
   * tambien. Es justo lo que elimina el parpadeo.
   */
  function apply() {
    const top = pin!.getBoundingClientRect().top;
    const raw = clamp01(-top / distance);

    const p4 = raw.toFixed(4);
    scopes.forEach((el) => el.style.setProperty('--morph-p', p4));

    // Al aterrizar se cede el relevo a las piezas del carril. En ese
    // punto las dos estan superpuestas al pixel, asi que el cambio no se
    // ve; y a partir de ahi el carril es `fixed` de verdad, de modo que
    // sigue en su sitio cuando el hero por fin se desplaza.
    if (raw >= LANDED) html.dataset.morphDone = '';
    else delete html.dataset.morphDone;

    /* LO QUE NO SE VE NO SE TABULA.
 
       Las dos reglas de opacidad de global.css apagan elementos sin
       sacarlos del recorrido de tabulacion. Medido: cuatro paradas de Tab
       recibian el foco sin pintar un solo pixel de anillo, y dos de ellas
       —las llamadas a la accion del hero— teletransportaban la pagina
       unos 2000 px hacia atras al enfocarlas desde una seccion de abajo.
       Un usuario de teclado perdia su sitio sin ver por que.
 
       Los umbrales son los mismos que usa el CSS, no valores aparte: el
       fundido del hero llega a cero en 1/1.6 = 0.625 y el del carril
       arranca en 0.62, que es donde el otro acaba de llegar a cero. */
    setInert(heroFade, raw > 0.625);
    setInert(railLate, raw < 0.62);

    pairs.forEach((p) => {
      const span = 1 - p.stagger;
      const t = easeOut(clamp01((raw - p.stagger) / span));
      const s = 1 + (p.scale - 1) * t;
      p.el.style.transform = `translate3d(${(p.dx * t).toFixed(2)}px, ${(p.dy * t).toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
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

  /* VOLVER A MEDIR CUANDO LAS TIPOGRAFIAS ESTEN LISTAS.
 
     Las fuentes se cargan con `font-display: swap`, asi que el primer
     render usa la de reserva y el texto se recoloca unos pixeles cuando
     llega la buena. Si la medida se toma antes de ese cambio, el
     desplazamiento guardado es el de la caja equivocada y cada pieza
     aterriza desviada de forma distinta, segun cuanto se mueva SU texto.
     Medido: hasta 4.5 px de error en el indice, suficiente para que se
     viera un salto al ceder el relevo al carril. */
  document.fonts?.ready.then(() => {
    measure();
    apply();
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  cleanups.push(() => {
    cancelAnimationFrame(frame);
    cancelAnimationFrame(resizeFrame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    delete html.dataset.morph;
    delete html.dataset.morphDone;
    scopes.forEach((el) => el.style.removeProperty('--morph-p'));
    setInert(heroFade, false);
    setInert(railLate, false);
    pairs.forEach((p) => {
      p.el.style.transform = '';
      p.el.style.transformOrigin = '';
    });
  });
}

export function destroyHeroMorph(): void {
  while (cleanups.length) cleanups.pop()?.();
}
