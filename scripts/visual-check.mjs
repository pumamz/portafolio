/**
 * Revision visual automatizada con Playwright.
 *
 * Abre el sitio en un navegador real, ejerce las interacciones que no se
 * pueden comprobar leyendo el HTML (arrastrar la esfera, inclinar una
 * tarjeta, cambiar de tema) y deja capturas en `.playwright/`.
 *
 * Uso:
 *   bun run check:visual              # contra el dev server en 4321
 *   BASE_URL=http://localhost:4330 bun run check:visual
 *
 * No es una suite de tests: es un par de ojos. Informa de lo que ve y
 * marca lo que no cuadra, para revisar las capturas despues.
 */

import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const OUT = '.playwright';

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  const mark = ok === true ? 'OK   ' : ok === false ? 'FALLO' : 'INFO ';
  console.log(`${mark} ${name}${detail ? ` :: ${detail}` : ''}`);
}

async function run() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();

  /* ---------------- Escritorio ---------------- */
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });
  const page = await desktop.newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  check('La portada carga', true, await page.title());
  check('Sin errores de JavaScript', errors.length === 0, errors.join(' | ') || 'ninguno');

  /* --- Campo de particulas WebGL --- */
  const canvasReady = await page.evaluate(() => {
    const c = document.querySelector('[data-particle-field]');
    if (!c) return 'sin canvas';
    return c.dataset.ready !== undefined ? 'activo' : 'no inicializado';
  });
  check('Campo de particulas WebGL', canvasReady === 'activo', canvasReady);

  /**
   * El canvas debe APORTAR PIXELES, no solo existir.
   *
   * Un canvas con z-index negativo dentro de una seccion sin contexto de
   * apilamiento propio queda detras del fondo opaco del documento: el
   * WebGL sigue renderizando y `data-ready` sigue puesto, pero no se ve
   * absolutamente nada. Paso exactamente eso.
   *
   * La comprobacion es directa: se captura el hero, se oculta el canvas,
   * se vuelve a capturar. Si los dos archivos son identicos, el canvas no
   * esta pintando nada visible.
   */
  const withCanvas = await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await page.evaluate(() => {
    const c = document.querySelector('[data-particle-field]');
    if (c) c.style.visibility = 'hidden';
  });
  await page.waitForTimeout(300);
  const withoutCanvas = await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await page.evaluate(() => {
    const c = document.querySelector('[data-particle-field]');
    if (c) c.style.visibility = '';
  });

  check(
    'Las particulas se ven de verdad',
    !withCanvas.equals(withoutCanvas),
    withCanvas.equals(withoutCanvas)
      ? 'el canvas no aporta un solo pixel visible'
      : `diferencia de ${Math.abs(withCanvas.length - withoutCanvas.length)} bytes`,
  );

  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/01-hero-oscuro.png` });

  /* --- Esfera de tecnologias: debe girar sola --- */
  await page.locator('#stack').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);

  const readRotation = () =>
    page.evaluate(() => {
      const stage = document.querySelector('[data-sphere-stage]');
      return stage ? parseFloat(stage.style.getPropertyValue('--sphere-y')) || 0 : null;
    });

  const spin1 = await readRotation();
  await page.waitForTimeout(1000);
  const spin2 = await readRotation();
  check('La esfera gira sola', spin1 !== null && spin2 !== spin1, `${spin1} -> ${spin2}`);

  /* --- Arrastre de la esfera --- */
  const stage = page.locator('[data-sphere-stage]');

  /**
   * El escenario mide ~450 px: hay que centrarlo en pantalla antes de
   * arrastrar, o su centro cae fuera del viewport y el raton nunca lo toca.
   *
   * El scroll se hace con `evaluate` y NO con `scrollIntoViewIfNeeded`:
   * ese metodo espera a que el elemento este quieto, y la esfera gira sin
   * parar, asi que nunca lo esta y la llamada se cuelga hasta agotar el
   * tiempo. Con elementos animados hay que evitar las esperas de
   * "actionability" de Playwright.
   */
  await page.evaluate(() => {
    const el = document.querySelector('[data-sphere]');
    if (el) {
      const b = el.getBoundingClientRect();
      window.scrollBy({ top: b.top + b.height / 2 - window.innerHeight / 2, behavior: 'instant' });
    }
  });
  await page.waitForTimeout(500);

  const box = await stage.boundingBox();
  if (box) {
    const vh = page.viewportSize().height;
    const cx = box.x + box.width / 2;
    // Se acota al area visible por si el escenario sigue sin caber entero.
    const cy = Math.min(Math.max(box.y + box.height / 2, 40), vh - 40);
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(cx + i * 18, cy);
    await page.mouse.up();

    const afterDrag = await readRotation();
    await page.waitForTimeout(700);
    const afterInertia = await readRotation();
    check('Arrastrar gira la esfera', Math.abs(afterDrag - spin2) > 20, `${spin2} -> ${afterDrag}`);
    check(
      'La esfera conserva inercia al soltar',
      afterInertia > afterDrag,
      `${afterDrag} -> ${afterInertia}`,
    );
  } else {
    check('Esfera visible', false, 'sin caja de contorno');
  }

  /**
   * La esfera debe tener tamano real.
   *
   * Todos los logos son `absolute`, asi que el escenario no tiene contenido
   * en flujo: si el ancho dependiera del contenido colapsaria a cero y los
   * logos saldrian despedidos sobre el texto vecino. Paso de verdad, y
   * desde el HTML no se veia. Por eso se mide aqui.
   */
  // offsetWidth/offsetHeight y NO boundingBox(): la caja de contorno de un
  // elemento rotado en 3D es su envolvente proyectada, que cambia con cada
  // grado de giro. Lo que interesa aqui es el tamano de maquetacion.
  const sphereSize = await page
    .locator('[data-sphere-stage]')
    .evaluate((el) => ({ w: el.offsetWidth, h: el.offsetHeight }));
  const sphereOk = sphereSize.w > 380 && sphereSize.h > 380;
  check('La esfera tiene tamano real', sphereOk, `${sphereSize.w}x${sphereSize.h} de maquetacion`);

  /* --- Los logos no invaden el encabezado --- */
  const headingBottom = await page
    .locator('#stack h2')
    .evaluate((el) => el.getBoundingClientRect().bottom);
  const highestLogo = await page.evaluate(() => {
    const faces = [...document.querySelectorAll('.sphere-face')];
    return faces.length ? Math.min(...faces.map((f) => f.getBoundingClientRect().top)) : Infinity;
  });
  check(
    'Los logos no pisan el encabezado',
    highestLogo > headingBottom,
    `logo mas alto ${Math.round(highestLogo)} vs titulo ${Math.round(headingBottom)}`,
  );

  /**
   * Capturas por viewport y NO de elemento completo.
   *
   * Las animaciones de entrada estan ligadas al scroll: en una captura de
   * elemento completo, la pagina no se ha desplazado y los bloques salen
   * con su estado inicial, medio invisibles y desenfocados. Solo una
   * captura del viewport tras desplazarse de verdad muestra lo que ve una
   * persona.
   */
  await page.screenshot({ path: `${OUT}/02-stack-esfera.png` });

  /**
   * Y ya que estamos: comprobar que las tarjetas del bento SE VEN tras el
   * scroll. Si `animation-timeline` fallara, se quedarian en opacidad cero
   * y la seccion apareceria vacia sin dar ningun error.
   */
  await page.evaluate(() => {
    const grid = document.querySelector('.reveal-stagger');
    grid?.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await page.waitForTimeout(700);
  const cardOpacity = await page.evaluate(() => {
    const first = document.querySelector('.reveal-stagger > *');
    return first ? parseFloat(getComputedStyle(first).opacity) : null;
  });
  check(
    'Las tarjetas son visibles tras el scroll',
    cardOpacity !== null && cardOpacity > 0.9,
    `opacidad ${cardOpacity}`,
  );
  await page.screenshot({ path: `${OUT}/02b-stack-rejilla.png` });

  /**
   * Color de marca al pasar el cursor.
   *
   * Se compara contra el color en reposo: si no cambia, el hover no aplica.
   * La version anterior de esta comprobacion solo miraba que devolviera
   * algo, y daba OK con el gris del tema.
   */
  const reactCell = page.locator('.tech-cell').filter({ hasText: 'React' }).first();
  if ((await reactCell.count()) > 0) {
    const icon = reactCell.locator('svg').first();
    const before = await icon.evaluate((el) => getComputedStyle(el).color);
    await reactCell.hover();
    await page.waitForTimeout(500);
    const after = await icon.evaluate((el) => getComputedStyle(el).color);
    check('El hover aplica el color de marca', before !== after, `${before} -> ${after}`);
  } else {
    check('El hover aplica el color de marca', false, 'celda de React no encontrada');
  }

  /* --- Tarjetas de proyecto: inclinacion sin temblor --- */
  await page.locator('#work').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  const cardRoot = page.locator('[data-tilt-root]').first();
  const cbox = await cardRoot.boundingBox();
  if (cbox) {
    /**
     * Se recorre el borde derecho, que es donde se producia el temblor.
     *
     * IMPORTANTE: solo se muestrea la parte de la tarjeta que esta DENTRO
     * del viewport. Las tarjetas miden mas de 500 px de alto y no caben
     * enteras en pantalla; mover el raton fuera de la ventana dispara un
     * `pointerleave` legitimo y daria un falso positivo. Esta comprobacion
     * ya se equivoco una vez por ese motivo.
     */
    const vh = page.viewportSize().height;
    const top = Math.max(cbox.y, 0) + 12;
    const bottom = Math.min(cbox.y + cbox.height, vh) - 12;

    if (bottom - top < 40) {
      check('Inclinacion estable en el borde', null, 'la tarjeta no cabe en pantalla, se omite');
    } else {
      const samples = [];
      for (let i = 0; i <= 6; i++) {
        await page.mouse.move(cbox.x + cbox.width - 3, top + (bottom - top) * (i / 6));
        await page.waitForTimeout(120);
        samples.push(
          await cardRoot
            .locator('[data-tilt]')
            .evaluate((el) => el.style.getPropertyValue('--tilt-y').trim()),
        );
      }
      const stable = samples.every((s) => s !== '' && s !== '0deg');
      check('Inclinacion estable en el borde', stable, samples.join(', '));
    }
  }

  await page.screenshot({ path: `${OUT}/03-proyectos.png` });

  /* --- Contadores --- */
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.locator('[data-count-to]').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  const counts = await page
    .locator('[data-count-to]')
    .evaluateAll((els) => els.map((e) => ({ shown: e.textContent, target: e.dataset.countTo })));
  check(
    'Los contadores llegan a su valor',
    counts.every((c) => c.shown === c.target),
    JSON.stringify(counts),
  );

  /**
   * Los anclas del menu no deben dejar el titulo debajo del header.
   *
   * El header es fijo y flotante: sin un `scroll-margin` suficiente, pulsar
   * "Stack" coloca la seccion arriba del todo y el titulo queda tapado. Es
   * un fallo que no se ve en el HTML y que solo aparece al navegar.
   */
  const headerBottom = await page
    .locator('header > div > div')
    .first()
    .evaluate((el) => el.getBoundingClientRect().bottom);

  for (const id of ['work', 'about', 'stack', 'contact']) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.locator(`header nav a[href$="#${id}"]`).click();
    await page.waitForTimeout(900);

    const titleTop = await page
      .locator(`#${id} h2`)
      .evaluate((el) => el.getBoundingClientRect().top);
    check(
      `El ancla #${id} deja visible el titulo`,
      titleTop >= headerBottom - 2,
      `titulo en ${Math.round(titleTop)}, header acaba en ${Math.round(headerBottom)}`,
    );
  }

  /* --- Tema claro --- */
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('[data-theme-toggle]').click();
  await page.waitForTimeout(800);
  const isLight = await page.evaluate(() => !document.documentElement.classList.contains('dark'));
  check('El conmutador cambia a tema claro', isLight);
  await page.screenshot({ path: `${OUT}/04-hero-claro.png` });

  await page.evaluate(() => {
    document
      .querySelector('[data-sphere]')
      ?.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/05-stack-claro.png` });

  /* --- Sin scroll horizontal --- */
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check('Sin scroll horizontal', overflow <= 0, `${overflow}px de desbordamiento`);

  /* ---------------- Movil ---------------- */
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
  });
  const mpage = await mobile.newPage();
  await mpage.goto(BASE, { waitUntil: 'networkidle' });
  await mpage.waitForTimeout(1200);

  const moverflow = await mpage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check('Movil sin scroll horizontal', moverflow <= 0, `${moverflow}px de desbordamiento`);
  await mpage.screenshot({ path: `${OUT}/06-movil-hero.png` });

  await mpage.locator('#stack').scrollIntoViewIfNeeded();
  await mpage.waitForTimeout(600);
  await mpage.screenshot({ path: `${OUT}/07-movil-stack.png` });

  await browser.close();

  /* ---------------- Resumen ---------------- */
  const failed = results.filter((r) => r.ok === false);
  console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas`);
  console.log(`Capturas en ${OUT}/`);
  if (failed.length) {
    console.log('\nFallos:');
    failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
    process.exitCode = 1;
  }
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
