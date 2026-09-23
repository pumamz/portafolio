/**
 * Revision visual automatizada con Playwright.
 *
 * Abre el sitio en un navegador real y ejerce lo que no se puede
 * comprobar leyendo el HTML: recorre la transformacion del hero paso a
 * paso, mide donde aterriza cada pieza, comprueba que el fondo pinta
 * pixeles y cambia de tema. Deja capturas en `.playwright/`.
 *
 * No es una suite de tests: es un par de ojos. Informa de lo que ve y
 * marca lo que no cuadra.
 *
 * LA REGLA DE ORO DE ESTE FICHERO: cada comprobacion mide el RESULTADO
 * RENDERIZADO, nunca la presencia de una clase. Todos los fallos visuales
 * de este proyecto —un canvas que renderizaba sin verse, una esfera
 * colapsada, las animaciones de scroll muertas, el foco del puntero
 * clavado en el centro— tenian el marcado correcto.
 *
 * Uso:
 *   bun run build && bunx astro preview --port 4330
 *   BASE_URL=http://localhost:4330 bun run check:visual
 */

import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:4330';
const OUT = '.playwright';

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  const mark = ok === true ? 'OK   ' : ok === false ? 'FALLO' : 'INFO ';
  console.log(`${mark} ${name}${detail ? ` :: ${detail}` : ''}`);
}

/** El scroll se fija a pelo: `scrollIntoView` y las esperas de
 *  "actionability" de Playwright aguardan a que el elemento este quieto, y
 *  aqui nada lo esta. */
async function scrollTo(page, y) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(260);
}

async function run() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });
  const page = await ctx.newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  check('La portada carga', true, await page.title());
  check('Sin errores de JavaScript', errors.length === 0, errors.join(' | ') || 'ninguno');

  /* ---------------- El script del hero se hace cargo ---------------- */
  const morphOn = await page.evaluate(
    () => document.documentElement.dataset.morph ?? 'sin activar',
  );
  check('La transformacion se activa', morphOn === 'on', morphOn);

  const pinH = await page.evaluate(() => {
    const pin = document.querySelector('[data-morph-pin]');
    return pin
      ? Math.round((pin.getBoundingClientRect().height / window.innerHeight) * 100) / 100
      : 0;
  });
  check('El hero queda anclado', pinH > 1.4, `${pinH} pantallas de alto`);

  /* ---------------- El fondo de estrellas pinta ----------------
     Se captura, se oculta el lienzo y se vuelve a capturar. Si los dos
     archivos son identicos, el canvas no esta aportando un solo pixel.
     Paso con el campo de particulas y solo se detecto asi. */
  const withStars = await page.screenshot({ clip: { x: 900, y: 200, width: 400, height: 400 } });
  await page.evaluate(() => {
    const c = document.querySelector('[data-gravity-stars]');
    if (c) c.style.visibility = 'hidden';
  });
  await page.waitForTimeout(200);
  const withoutStars = await page.screenshot({
    clip: { x: 900, y: 200, width: 400, height: 400 },
  });
  await page.evaluate(() => {
    const c = document.querySelector('[data-gravity-stars]');
    if (c) c.style.visibility = '';
  });
  check(
    'El fondo de estrellas aporta pixeles',
    Buffer.compare(withStars, withoutStars) !== 0,
    `${withStars.length} vs ${withoutStars.length} bytes`,
  );

  /* ---------------- El foco sigue al puntero ----------------
     Se lee --grid-x en la seccion antes y despues de mover el raton. Si
     no cambia, el efecto esta muerto aunque la clase este puesta: es
     justo el fallo que tuvo este proyecto. */
  const readGrid = () =>
    page.evaluate(() => {
      const s = document.querySelector('[data-reactive-grid]');
      return s ? getComputedStyle(s).getPropertyValue('--grid-x').trim() : 'sin seccion';
    });
  await page.mouse.move(300, 300);
  await page.waitForTimeout(150);
  const g1 = await readGrid();
  await page.mouse.move(1100, 600);
  await page.waitForTimeout(150);
  const g2 = await readGrid();
  check('El foco sigue al puntero', g1 !== g2 && g2 !== '', `${g1} -> ${g2}`);

  await page.screenshot({ path: `${OUT}/01-hero-inicio.png` });

  /* ---------------- El recorrido de la transformacion ---------------- */
  /* El avance NO es el scroll partido por el alto del contenedor: la
     transformacion se recorre en (alto del contenedor - una pantalla),
     que es el tramo durante el cual la seccion esta pegada arriba. Medir
     con la otra cuenta hacia que el fotograma del 50% saliera ya
     terminado. */
  const vh = 900;
  const travel = vh * 1.9 - vh;
  for (const [i, frac] of [0.3, 0.6, 0.9].entries()) {
    await scrollTo(page, travel * frac);
    const p = await page.evaluate(() =>
      Number(getComputedStyle(document.documentElement).getPropertyValue('--morph-p')),
    );
    check(`Fotograma al ${Math.round(frac * 100)}%`, Math.abs(p - frac) < 0.06, `--morph-p = ${p}`);
    await page.screenshot({ path: `${OUT}/0${i + 2}-morph-${Math.round(frac * 100)}.png` });
  }

  /* El panel derecho tiene que estar visible a media transformacion: es
     lo que evita que dos tercios de pantalla se queden vacios. */
  await scrollTo(page, travel * 0.55);
  const reveal = await page.evaluate(() => {
    const el = document.querySelector('[data-hero-reveal]');
    if (!el) return { op: -1 };
    const r = el.getBoundingClientRect();
    return { op: Number(getComputedStyle(el).opacity), w: Math.round(r.width) };
  });
  check(
    'La derecha no se queda vacia a media transformacion',
    reveal.op > 0.5,
    `opacidad ${reveal.op}, ancho ${reveal.w}px`,
  );

  /* ---------------- Aterrizaje: la prueba de fuego ----------------
     Se compara la caja de cada pieza del hero con la de su destino en el
     carril. Si el script mide bien, coinciden al pixel. */
  /* Justo al final del recorrido, con la seccion todavia pegada arriba:
     un pixel mas y se despega, las piezas se van con ella y la
     comparacion saldria desviada una pantalla entera. */
  await scrollTo(page, travel);
  await page.waitForTimeout(400);

  const landing = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('[data-morph]').forEach((el) => {
      const key = el.dataset.morph;
      const to = document.querySelector(`[data-morph-to="${key}"]`);
      if (!to) return;
      const a = el.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      out.push({
        key,
        dx: Math.round(a.left - b.left),
        dy: Math.round(a.top - b.top),
        dw: Math.round(a.width - b.width),
      });
    });
    return out;
  });

  const worst = landing.reduce(
    (m, p) => Math.max(m, Math.abs(p.dx), Math.abs(p.dy), Math.abs(p.dw)),
    0,
  );
  check(
    'Cada pieza aterriza sobre su destino',
    worst <= 3,
    landing.map((p) => `${p.key}:${p.dx},${p.dy},${p.dw}`).join(' | '),
  );

  const done = await page.evaluate(() => document.documentElement.dataset.morphDone !== undefined);
  check('Se cede el relevo al carril', done, done ? 'si' : 'no se marco morphDone');

  await page.screenshot({ path: `${OUT}/05-carril-formado.png` });

  /* ---------------- El carril sobrevive al hero ---------------- */
  await scrollTo(page, vh * 3.4);
  const rail = await page.evaluate(() => {
    const el = document.querySelector('[data-morph-to="name"]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      top: Math.round(r.top),
      left: Math.round(r.left),
      vis: getComputedStyle(el).visibility,
    };
  });
  check(
    'El carril sigue en pantalla al pasar de largo',
    rail !== null && rail.vis === 'visible' && rail.top >= 0 && rail.top < 200,
    rail ? `arriba ${rail.top}px, izq ${rail.left}px, ${rail.vis}` : 'sin nombre en el carril',
  );
  await page.screenshot({ path: `${OUT}/06-seccion-proyectos.png` });

  /* ---------------- Sin scroll horizontal ---------------- */
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check('Sin scroll horizontal', overflow <= 0, `${overflow}px de desbordamiento`);

  /* ---------------- Tema claro ---------------- */
  await scrollTo(page, 0);
  await page.evaluate(() => {
    const b = document.querySelector('[data-theme-toggle]');
    if (b) b.click();
  });
  await page.waitForTimeout(500);
  const isLight = await page.evaluate(() => !document.documentElement.classList.contains('dark'));
  check('El conmutador cambia a tema claro', isLight);
  await page.screenshot({ path: `${OUT}/07-hero-claro.png` });

  /* ---------------- Movil: ni anclaje ni transformacion ---------------- */
  const mob = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
    hasTouch: true,
    isMobile: true,
  });
  const mpage = await mob.newPage();
  await mpage.goto(BASE, { waitUntil: 'networkidle' });
  await mpage.waitForTimeout(800);

  const mMorph = await mpage.evaluate(() => document.documentElement.dataset.morph ?? 'apagado');
  check('En movil no hay transformacion', mMorph === 'apagado', mMorph);

  const mPin = await mpage.evaluate(() => {
    const pin = document.querySelector('[data-morph-pin]');
    return pin
      ? Math.round((pin.getBoundingClientRect().height / window.innerHeight) * 100) / 100
      : 0;
  });
  check('En movil no hay zona muerta', mPin < 1.35, `${mPin} pantallas de alto`);

  const mOver = await mpage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check('Movil sin scroll horizontal', mOver <= 0, `${mOver}px de desbordamiento`);
  await mpage.screenshot({ path: `${OUT}/08-movil-hero.png` });

  await browser.close();

  const failed = results.filter((r) => r.ok === false);
  console.log(`\n${results.length - failed.length}/${results.length} comprobaciones pasan`);
  if (failed.length) {
    console.log('FALLAN:');
    failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
    process.exitCode = 1;
  }
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
