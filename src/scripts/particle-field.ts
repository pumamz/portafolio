/**
 * Campo de particulas reactivo en WebGL.
 *
 * Decisiones de rendimiento, porque este fichero es lo mas caro del sitio:
 *
 * 1. **Three.js directo, sin React Three Fiber.** R3F obligaria a reactivar
 *    React (+45 KB gzip) solo para envolver una escena que no necesita
 *    arbol de componentes ni estado declarativo.
 * 2. **Un unico `Points` con shaders propios.** Todas las particulas se
 *    dibujan en una sola llamada y el movimiento se calcula en la GPU.
 *    Animar posiciones en JavaScript obligaria a subir el buffer entero a
 *    la tarjeta en cada fotograma.
 * 3. **El bucle se detiene cuando no se ve.** IntersectionObserver mas
 *    visibilitychange: sin esto, la GPU seguiria trabajando con el hero
 *    fuera de pantalla o la pestana en segundo plano, y en un portatil eso
 *    se nota en la bateria.
 * 4. **Densidad segun dispositivo** y `devicePixelRatio` limitado a 2.
 *    Renderizar a 3x en un movil de gama alta triplica el coste de pintado
 *    sin diferencia visible.
 */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three';

interface Options {
  canvas: HTMLCanvasElement;
  /** Color de acento en formato CSS. Se lee del token vivo del tema. */
  accent: string;
  base: string;
}

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform vec2  uPointer;     // puntero en coordenadas normalizadas (-1..1)
  uniform float uPointerPower;// 0 sin puntero, 1 con puntero activo
  uniform float uScroll;      // 0 arriba del todo, 1 al final del hero
  uniform float uSize;

  attribute float aScale;     // variacion de tamano por particula
  attribute float aSeed;      // desfase para que no oscilen al unisono

  varying float vDepth;
  varying float vGlow;

  void main() {
    vec3 pos = position;

    // Deriva organica. Tres frecuencias distintas evitan que el conjunto
    // se lea como una onda unica y mecanica.
    float t = uTime * 0.12;
    pos.x += sin(t + aSeed * 6.283) * 0.45;
    pos.y += cos(t * 0.8 + aSeed * 4.712) * 0.45;
    pos.z += sin(t * 0.6 + aSeed * 3.141) * 0.35;

    // El scroll separa el campo en profundidad: al bajar, las particulas
    // se abren y se alejan, reforzando la sensacion de atravesarlas.
    pos.z += uScroll * 6.0;
    pos.xy *= 1.0 + uScroll * 0.25;

    // Repulsion suave alrededor del puntero. Se calcula en el plano XY
    // porque el campo es poco profundo y basta para que se sienta fisico.
    vec2 toPointer = pos.xy - uPointer * 7.0;
    float dist = length(toPointer);
    float influence = smoothstep(3.2, 0.0, dist) * uPointerPower;
    pos.xy += normalize(toPointer + 0.0001) * influence * 1.6;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Tamano con atenuacion por perspectiva: lo lejano se ve mas pequeno.
    gl_PointSize = uSize * aScale * (12.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vDepth = clamp((-mvPosition.z - 4.0) / 16.0, 0.0, 1.0);
    vGlow = influence;
  }
`;

const FRAGMENT = /* glsl */ `
  precision mediump float;

  uniform vec3 uAccent;
  uniform vec3 uBase;

  varying float vDepth;
  varying float vGlow;

  void main() {
    // gl_PointCoord va de 0 a 1 dentro del punto; se recorta a un circulo
    // con borde suave para que no se vean cuadrados.
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.1, d);
    if (alpha < 0.01) discard;

    // Las particulas cercanas al puntero viran al color de acento.
    vec3 color = mix(uBase, uAccent, clamp(vGlow * 1.6, 0.0, 1.0));

    // Y las lejanas se desvanecen, dando profundidad atmosferica.
    alpha *= mix(0.85, 0.12, vDepth);

    gl_FragColor = vec4(color, alpha);
  }
`;

/** Densidad segun el ancho de pantalla y la memoria disponible. */
function particleCount(): number {
  const width = window.innerWidth;
  // deviceMemory no existe en todos los navegadores; 4 GB es un supuesto
  // conservador cuando no se puede saber.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

  if (width < 640 || memory <= 2) return 1800;
  if (width < 1024 || memory <= 4) return 4000;
  return 8000;
}

export function createParticleField({ canvas, accent, base }: Options) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false, // innecesario en puntos redondeados; ahorra relleno
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 14;

  const count = particleCount();
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Distribucion en un elipsoide achatado: mas ancho que alto, para que
    // acompane a la forma del hero en lugar de pelearse con ella.
    const r = Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 14;
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 8;
    positions[i * 3 + 2] = r * Math.cos(phi) * 7;

    scales[i] = 0.4 + Math.random() * 1.2;
    seeds[i] = Math.random();
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aScale', new BufferAttribute(scales, 1));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));

  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new Vector2(0, 0) },
    uPointerPower: { value: 0 },
    uScroll: { value: 0 },
    uSize: { value: 2.2 },
    uAccent: { value: new Color(accent) },
    uBase: { value: new Color(base) },
  };

  const material = new ShaderMaterial({
    uniforms,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const points = new Points(geometry, material);
  scene.add(points);

  /* --- Estado de interaccion ---------------------------------------- */

  const pointerTarget = new Vector2(0, 0);
  let pointerPowerTarget = 0;
  let scrollTarget = 0;

  const clock = new Clock();
  let frame = 0;
  let running = false;
  let visible = true;

  function resize() {
    const { clientWidth, clientHeight } = canvas;
    if (clientWidth === 0 || clientHeight === 0) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }

  function render() {
    const delta = Math.min(clock.getDelta(), 0.05);
    uniforms.uTime.value += delta;

    // Interpolacion hacia el objetivo en lugar de asignacion directa: el
    // puntero salta entre eventos y sin suavizado el campo daria tirones.
    const ease = 1 - Math.pow(0.005, delta);
    uniforms.uPointer.value.lerp(pointerTarget, ease);
    uniforms.uPointerPower.value += (pointerPowerTarget - uniforms.uPointerPower.value) * ease;
    uniforms.uScroll.value += (scrollTarget - uniforms.uScroll.value) * ease;

    points.rotation.y += delta * 0.02;

    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  }

  function start() {
    if (running) return;
    running = true;
    clock.start();
    frame = requestAnimationFrame(render);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(frame);
  }

  /** Arranca o para segun visibilidad de la seccion y de la pestana. */
  function sync() {
    if (visible && document.visibilityState === 'visible') start();
    else stop();
  }

  /* --- Escuchas ------------------------------------------------------ */

  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointerTarget.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -(((event.clientY - rect.top) / rect.height) * 2 - 1),
    );
    pointerPowerTarget = 1;
  };

  const onPointerLeave = () => {
    pointerPowerTarget = 0;
  };

  const onScroll = () => {
    const rect = canvas.getBoundingClientRect();
    const progress = -rect.top / Math.max(rect.height, 1);
    scrollTarget = Math.min(Math.max(progress, 0), 1);
  };

  const onVisibility = () => sync();

  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false;
      sync();
    },
    { threshold: 0 },
  );

  const resizeObserver = new ResizeObserver(() => resize());

  // `pointermove` en window y no en el canvas: el hero tiene contenido
  // encima que se tragaria los eventos, y el canvas es pointer-events:none.
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  observer.observe(canvas);
  resizeObserver.observe(canvas);

  resize();
  onScroll();
  sync();

  /** Libera GPU y escuchas. Imprescindible con view transitions. */
  function destroy() {
    stop();
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibility);
    observer.disconnect();
    resizeObserver.disconnect();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  }

  /** Reaplica los colores del tema al conmutar claro/oscuro. */
  function setColors(nextAccent: string, nextBase: string) {
    uniforms.uAccent.value.set(nextAccent);
    uniforms.uBase.value.set(nextBase);
  }

  return { destroy, setColors };
}
