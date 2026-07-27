/**
 * Esfera de tecnologias arrastrable.
 *
 * Por que CSS 3D y no Three.js, teniendo Three ya cargado:
 * en WebGL cada logo seria una textura, y se perderia el SVG nitido a
 * cualquier escala, el color de marca por tema, el texto seleccionable y
 * el acceso por teclado. Aqui son los mismos elementos HTML de siempre,
 * colocados en un espacio tridimensional real con `preserve-3d`.
 *
 * El truco de orientacion: cada logo debe mirar siempre a la camara pese a
 * estar rotado sobre la esfera. Se consigue aplicando al hijo la inversa
 * exacta de la cadena de rotaciones, en orden inverso. Las rotaciones se
 * cancelan por pares hasta la identidad, asi que el logo queda de frente
 * sin necesidad de recalcular matrices en JavaScript.
 */

const FRICTION = 0.94;
const DRAG_SENSITIVITY = 0.35;
const IDLE_SPIN = 0.055;
/** Por encima de esto se considera arrastre, no clic. */
const DRAG_THRESHOLD_PX = 4;

type Cleanup = () => void;
const cleanups: Cleanup[] = [];

export function initTechSphere() {
  const root = document.querySelector<HTMLElement>('[data-sphere]');
  if (!root) return;

  const stage = root.querySelector<HTMLElement>('[data-sphere-stage]');
  if (!stage) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Rotacion acumulada de la esfera, en grados.
  let rotX = -12;
  let rotY = 0;
  // Velocidad angular, en grados por fotograma.
  let velX = 0;
  let velY = IDLE_SPIN;

  let dragging = false;
  let pointerId: number | null = null;
  let lastX = 0;
  let lastY = 0;
  let travelled = 0;
  let frame = 0;
  let visible = true;

  const RAD = Math.PI / 180;

  /**
   * Posicion angular de cada logo, leida una sola vez del marcado.
   *
   * Se cachea porque calcular la profundidad exige estos dos valores en
   * cada fotograma, y `getComputedStyle` dentro del bucle de animacion
   * forzaria un recalculo de estilos dieciocho veces por cuadro.
   */
  const items = [...stage.querySelectorAll<HTMLElement>('.sphere-item')].map((el) => {
    const face = el.querySelector<HTMLElement>('.sphere-face');
    return {
      face,
      theta: parseFloat(el.style.getPropertyValue('--theta')) * RAD,
      phi: parseFloat(el.style.getPropertyValue('--phi')) * RAD,
    };
  });

  /**
   * Atenua los logos segun su profundidad.
   *
   * Sin esto la esfera se lee como una nube plana de iconos: la mente
   * necesita que lo lejano se vea mas tenue para reconstruir el volumen.
   * Se calcula la coordenada Z de cada logo tras aplicar las dos
   * rotaciones globales, y se mapea a opacidad.
   */
  function applyDepth() {
    const gx = rotX * RAD;
    const gy = rotY * RAD;
    const cosGx = Math.cos(gx);
    const sinGx = Math.sin(gx);
    const cosGy = Math.cos(gy);
    const sinGy = Math.sin(gy);

    for (const item of items) {
      if (!item.face) continue;

      // Posicion en la esfera unidad, antes de la rotacion global.
      const cosPhi = Math.cos(item.phi);
      const x = cosPhi * Math.sin(item.theta);
      const y = -Math.sin(item.phi);
      const z = cosPhi * Math.cos(item.theta);

      // Rotacion global en Y y despues en X; solo interesa la Z final.
      const zAfterY = z * cosGy - x * sinGy;
      const zFinal = y * sinGx + zAfterY * cosGx;

      // zFinal va de -1 (fondo) a 1 (frente).
      const t = (zFinal + 1) / 2;
      item.face.style.opacity = String(0.22 + t * 0.78);
    }
  }

  function apply() {
    // Los hijos leen estas dos variables para cancelar la rotacion global
    // y quedar siempre de frente.
    stage!.style.setProperty('--sphere-x', `${rotX}deg`);
    stage!.style.setProperty('--sphere-y', `${rotY}deg`);
    applyDepth();
  }

  function loop() {
    if (!dragging) {
      // Inercia: la velocidad decae, y cuando casi se ha detenido se
      // recupera el giro lento de reposo. Sin esto la esfera se queda
      // muerta tras el primer arrastre y parece rota.
      velX *= FRICTION;
      velY *= FRICTION;
      if (Math.abs(velY) < IDLE_SPIN) {
        velY += (IDLE_SPIN - velY) * 0.02;
      }
    }

    rotX += velX;
    rotY += velY;
    // El eje vertical se limita: pasado el polo la esfera se ve del reves
    // y el efecto se rompe.
    rotX = Math.max(-70, Math.min(70, rotX));

    apply();
    frame = requestAnimationFrame(loop);
  }

  /* --- Arrastre ------------------------------------------------------ */

  const onPointerDown = (event: PointerEvent) => {
    dragging = true;
    pointerId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    travelled = 0;
    velX = 0;
    velY = 0;
    stage.setPointerCapture(event.pointerId);
    root.dataset.dragging = '';
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging || event.pointerId !== pointerId) return;

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    travelled += Math.abs(dx) + Math.abs(dy);

    velY = dx * DRAG_SENSITIVITY;
    // Invertido: arrastrar hacia abajo debe inclinar la esfera hacia el
    // observador, no alejarla.
    velX = -dy * DRAG_SENSITIVITY;

    rotY += velY;
    rotX = Math.max(-70, Math.min(70, rotX + velX));
    apply();
  };

  const endDrag = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    dragging = false;
    pointerId = null;
    delete root.dataset.dragging;

    // Si el puntero apenas se movio, fue un clic: los enlaces internos
    // deben seguir funcionando y no quedar bloqueados por el arrastre.
    if (travelled < DRAG_THRESHOLD_PX) {
      velX = 0;
      velY = IDLE_SPIN;
    }
  };

  /* --- Ciclo de vida -------------------------------------------------- */

  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) start();
      else stop();
    },
    { threshold: 0 },
  );

  function start() {
    if (frame || reduced) return;
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  const onVisibility = () => {
    if (document.visibilityState === 'visible' && visible) start();
    else stop();
  };

  apply();

  if (reduced) {
    // Sin movimiento continuo, pero la esfera sigue siendo arrastrable:
    // reducir movimiento no significa eliminar la interaccion.
    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
  } else {
    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    observer.observe(root);
    document.addEventListener('visibilitychange', onVisibility);
    start();
  }

  cleanups.push(() => {
    stop();
    observer.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    stage.removeEventListener('pointerdown', onPointerDown);
    stage.removeEventListener('pointermove', onPointerMove);
    stage.removeEventListener('pointerup', endDrag);
    stage.removeEventListener('pointercancel', endDrag);
  });
}

export function destroyTechSphere() {
  while (cleanups.length) cleanups.pop()?.();
}
