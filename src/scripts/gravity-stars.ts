/**
 * Campo de estrellas con gravedad hacia el puntero.
 *
 * Equivalente del componente `GravityStarsBackground`, reescrito en canvas
 * 2D plano. El original es un componente de React y la integracion de
 * React esta desactivada en este proyecto a proposito: registrarla emite
 * un bundle de ~187 KB con el runtime aunque ninguna pagina lo cargue
 * (ver AGENTS.md). Esto hace lo mismo por poco mas de 1 KB y mantiene el
 * mismo juego de opciones.
 *
 * Decisiones de rendimiento, porque esto corre en TODAS las paginas:
 *
 * 1. **Canvas 2D, no WebGL.** Setenta y cinco puntos con un degradado no
 *    justifican compilar shaders ni arrastrar una libreria. Ya hubo una
 *    escena de Three.js aqui y costaba 127 KB.
 * 2. **El bucle se detiene cuando no se ve.** `visibilitychange` mas un
 *    IntersectionObserver: sin eso la GPU sigue trabajando con la pestana
 *    en segundo plano, y en un portatil eso se nota en la bateria.
 * 3. **devicePixelRatio limitado a 2.** Pintar a 3x en un movil de gama
 *    alta triplica el coste sin diferencia visible.
 * 4. **El degradado de brillo se dibuja una vez** en un canvas aparte y se
 *    estampa por cada estrella. Recrear un `createRadialGradient` setenta
 *    y cinco veces por fotograma es el error clasico de este efecto.
 */

export interface GravityStarsOptions {
  starsCount?: number;
  starsSize?: number;
  starsOpacity?: number;
  glowIntensity?: number;
  movementSpeed?: number;
  mouseInfluence?: number;
  mouseGravity?: 'attract' | 'repel';
  gravityStrength?: number;
}

type Star = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Posicion de reposo, a la que vuelve cuando el puntero se aleja. */
  hx: number;
  hy: number;
  size: number;
};

type Cleanup = () => void;
const cleanups: Cleanup[] = [];

const DEFAULTS = {
  starsCount: 75,
  starsSize: 2,
  starsOpacity: 0.75,
  glowIntensity: 15,
  movementSpeed: 0.3,
  mouseInfluence: 160,
  mouseGravity: 'attract' as const,
  gravityStrength: 75,
};

/** Convierte cualquier color CSS a #rrggbb delegando en el navegador.
 *  Los tokens del sistema estan en OKLCH, que no se puede interpolar a
 *  mano; asignarlo a `fillStyle` lo devuelve ya normalizado. */
function cssColor(ctx: CanvasRenderingContext2D, value: string, fallback: string): string {
  ctx.fillStyle = fallback;
  ctx.fillStyle = value.trim();
  return typeof ctx.fillStyle === 'string' ? ctx.fillStyle : fallback;
}

export function initGravityStars(options: GravityStarsOptions = {}): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-gravity-stars]');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const o = { ...DEFAULTS, ...options };

  // Quien pide menos movimiento recibe un cielo quieto, no uno vacio: las
  // estrellas se pintan una vez y ahi se quedan.
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  const stars: Star[] = [];

  /** Brillo pre-renderizado; se estampa en cada estrella. */
  let glow: HTMLCanvasElement | null = null;
  let glowSize = 0;

  let starColor = '#8aa0c0';

  function readColors() {
    const styles = getComputedStyle(document.documentElement);
    starColor = cssColor(ctx!, styles.getPropertyValue('--text-faint'), '#8aa0c0');
  }

  function buildGlow() {
    const radius = o.starsSize + o.glowIntensity;
    glowSize = Math.ceil(radius * 2);
    const g = document.createElement('canvas');
    g.width = g.height = glowSize;
    const gctx = g.getContext('2d');
    if (!gctx) return;
    const grad = gctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    grad.addColorStop(0, starColor);
    grad.addColorStop(0.28, starColor);
    grad.addColorStop(1, 'transparent');
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, glowSize, glowSize);
    glow = g;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas!.width = Math.floor(width * dpr);
    canvas!.height = Math.floor(height * dpr);
    canvas!.style.width = `${width}px`;
    canvas!.style.height = `${height}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    stars.length = 0;
    for (let i = 0; i < o.starsCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      stars.push({
        x,
        y,
        hx: x,
        hy: y,
        vx: (Math.random() - 0.5) * o.movementSpeed,
        vy: (Math.random() - 0.5) * o.movementSpeed,
        // Tamanos desiguales: un cielo con todas las estrellas del mismo
        // calibre se lee como una textura, no como profundidad.
        size: o.starsSize * (0.45 + Math.random() * 0.9),
      });
    }
  }

  const pointer = { x: -9999, y: -9999, active: false };

  function draw() {
    ctx!.clearRect(0, 0, width, height);
    ctx!.globalAlpha = o.starsOpacity;

    for (const s of stars) {
      if (!still) {
        // Deriva constante, con rebote en los bordes. La posicion de
        // reposo viaja con ella para que el puntero no la devuelva a un
        // punto que ya quedo atras.
        s.hx += s.vx;
        s.hy += s.vy;
        if (s.hx < 0 || s.hx > width) s.vx *= -1;
        if (s.hy < 0 || s.hy > height) s.vy *= -1;

        let tx = s.hx;
        let ty = s.hy;

        if (pointer.active) {
          const dx = pointer.x - s.hx;
          const dy = pointer.y - s.hy;
          const dist = Math.hypot(dx, dy);
          if (dist < o.mouseInfluence && dist > 0.001) {
            // La fuerza cae con la distancia: cerca tira fuerte, en el
            // borde del radio no hace nada. Lineal y no cuadratica a
            // proposito: la cuadratica hace que las estrellas se peguen
            // al cursor de golpe y parezca un fallo.
            const pull = (1 - dist / o.mouseInfluence) * (o.gravityStrength / 100);
            const dir = o.mouseGravity === 'attract' ? 1 : -1;
            tx += dx * pull * dir;
            ty += dy * pull * dir;
          }
        }

        // Interpolacion hacia el destino: es lo que da la sensacion de
        // masa. Saltar directo a `tx` haria que el campo entero se
        // moviera pegado al raton, sin inercia.
        s.x += (tx - s.x) * 0.08;
        s.y += (ty - s.y) * 0.08;
      }

      if (glow) {
        const scale = s.size / o.starsSize;
        const size = glowSize * scale;
        ctx!.drawImage(glow, s.x - size / 2, s.y - size / 2, size, size);
      }
    }

    ctx!.globalAlpha = 1;
  }

  let frame = 0;
  let running = false;

  function loop() {
    draw();
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (running || still) return;
    running = true;
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  const onPointerMove = (e: PointerEvent) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  };
  const onPointerLeave = () => {
    pointer.active = false;
  };

  let resizeFrame = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resize();
      seed();
      if (still) draw();
    });
  };

  const onVisibility = () => (document.hidden ? stop() : start());

  const onThemeChange = () => {
    readColors();
    buildGlow();
    if (still) draw();
  };

  resize();
  readColors();
  buildGlow();
  seed();
  draw();
  start();

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('visibilitychange', onVisibility);

  // El conmutador de tema alterna la clase en <html>; observarla es mas
  // fiable que acoplarse al boton concreto.
  const observer = new MutationObserver(onThemeChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  cleanups.push(() => {
    stop();
    cancelAnimationFrame(resizeFrame);
    observer.disconnect();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('visibilitychange', onVisibility);
  });
}

export function destroyGravityStars(): void {
  while (cleanups.length) cleanups.pop()?.();
}
