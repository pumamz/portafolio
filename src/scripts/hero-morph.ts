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

/**
 * A partir de aqui se considera aterrizado y se cede el relevo.
 *
 * Con margen de sobra antes del final, no pegado a el. Estaba en 0.995 y
 * producia un tirón hacia arriba intermitente: cuando la seccion se
 * despega, las piezas que vuelan son hijas suyas y suben con ella; si el
 * relevo no se habia dado todavia en ese fotograma, se veian subir. Con el
 * umbral aqui quedan 60 px de scroll de colchon entre el relevo y el
 * despegue, asi que ningun fotograma puede caer entre los dos.
 *
 * El coste es nulo: la curva de frenada deja las piezas al 99.96% del
 * recorrido en este punto, menos de un cuarto de pixel de la posicion
 * final incluso en la que mas tarde llega.
 */
const LANDED = 0.94;

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

/**
 * Caja de la TINTA, no del elemento.
 *
 * Aqui estaba el salto al final del viaje. El nombre del hero es un `h1` y
 * la firma del carril un `span` de bloque: los dos ocupan todo el ancho de
 * su contenedor, asi que el cociente de sus cajas medía la relacion entre
 * contenedores y no entre textos. Salia 200/200 = 1 y la comprobacion lo
 * daba por bueno, mientras el texto quedaba a 36.6 px contra los 25.4 px
 * del destino: un 44% de mas que saltaba de golpe al ceder el relevo.
 *
 * Un Range sobre el contenido devuelve la caja de lo que de verdad se
 * pinta, y funciona igual con texto que con una imagen.
 */
function inkRect(el: HTMLElement): DOMRect {
  const range = document.createRange();
  range.selectNodeContents(el);
  const r = range.getBoundingClientRect();
  range.detach?.();
  return r.width > 0 && r.height > 0 ? r : el.getBoundingClientRect();
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
    /* MEDIR CON LAS ANIMACIONES DE ADORNO APAGADAS.

       El hero tiene entrada y movimiento en reposo, y esta funcion se
       ejecuta otra vez cuando llegan las tipografias: esa segunda medida
       cae justo dentro de la entrada. Midiendo con una animacion a medio
       camino, el desplazamiento guardado es el de una caja que no existe y
       la pieza aterriza descolocada.

       Con la marca puesta, una regla de global.css deja en `none` la
       animacion de todo lo que decora. Es lo que permite que la entrada
       use transform sin poner en riesgo el aterrizaje. */
    html.dataset.morphMeasuring = '';

    pairs.forEach((p) => {
      p.el.style.transform = '';
    });

    distance = Math.max(1, pin!.offsetHeight - window.innerHeight);
    const stageRect = stage!.getBoundingClientRect();

    pairs.forEach((p) => {
      const box = p.el.getBoundingClientRect();
      const from = inkRect(p.el);
      const to = inkRect(p.target);
      if (from.width === 0 || to.width === 0) {
        p.dx = p.dy = 0;
        p.scale = 1;
        return;
      }
      p.scale = to.width / from.width;

      /* El escalado tiene su origen en la esquina de la CAJA, pero lo que
         tiene que aterrizar en su sitio es la TINTA. Asi que al
         desplazamiento hay que descontarle cuanto se mueve la tinta
         dentro de su propia caja al encoger.

         El destino esta en `fixed`: su caja ya esta en coordenadas de
         ventana y no depende del scroll. El origen se traduce a la
         posicion que tendra la seccion cuando este anclada arriba. */
      const dentroX = (from.left - box.left) * p.scale;
      const dentroY = (from.top - box.top) * p.scale;
      p.dx = to.left - (box.left - stageRect.left) - dentroX;
      p.dy = to.top - (box.top - stageRect.top) - dentroY;
      // El origen arriba-izquierda hace que el escalado no desplace la
      // pieza: la esquina se queda quieta y solo encoge hacia dentro.
      p.el.style.transformOrigin = 'left top';
    });

    delete html.dataset.morphMeasuring;
  }

  /**
   * Coloca cada pieza segun lo recorrido del contenedor anclado.
   *
   * Sin termino de scroll: la seccion esta quieta, asi que sus hijos
   * tambien. Es justo lo que elimina el parpadeo.
   */

  /** Avance actual, de 0 a 1. */
  function progress(): number {
    return clamp01(-pin!.getBoundingClientRect().top / distance);
  }

  /** Solo el relevo, para poder resolverlo sin esperar al rAF. */
  function marcarAterrizaje() {
    const raw = progress();
    if (raw >= LANDED) html.dataset.morphDone = '';
    else delete html.dataset.morphDone;
    setInert(heroFade, raw > 0.625);
    setInert(railLate, raw < 0.62);
  }

  /** Coloca cada pieza segun lo recorrido del contenedor anclado. */
  function apply() {
    const raw = progress();

    const p4 = raw.toFixed(4);
    scopes.forEach((el) => el.style.setProperty('--morph-p', p4));

    /* Pasado el umbral se fija el final EXACTO, sin pasar por la curva.

       A 0.94 la frenada deja las piezas a 0.41 px de su destino. Es
       invisible, pero es una discontinuidad de verdad justo en el
       fotograma del relevo, y era barato quitarla del todo. */
    const aterrizado = raw >= LANDED;

    pairs.forEach((p) => {
      const span = 1 - p.stagger;
      const t = aterrizado ? 1 : easeOut(clamp01((raw - p.stagger) / span));
      const s = 1 + (p.scale - 1) * t;
      p.el.style.transform = `translate3d(${(p.dx * t).toFixed(2)}px, ${(p.dy * t).toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
    });
  }

  let frame = 0;
  const onScroll = () => {
    /* El relevo se decide EN EL EVENTO, no en el rAF.

       Diferirlo metia un fotograma de retraso entre el scroll y el cambio,
       y era la otra mitad del tirón: con un gesto rapido, el fotograma que
       se pintaba mientras tanto ya mostraba las piezas desplazadas. Es una
       lectura y un atributo, barato. Las escrituras de transform, que son
       nueve, si siguen difiriendose. */
    marcarAterrizaje();
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
      marcarAterrizaje();
      apply();
    });
  };

  measure();
  marcarAterrizaje();
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
    marcarAterrizaje();
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
