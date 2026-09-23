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
  /* Las variables se escriben en un subarbol pequeno, no en la seccion:
     escribirlas en la seccion invalidaria el estilo del hero entero en
     cada fotograma. Hay que leerlas donde de verdad viven. */
  const readGrid = () =>
    page.evaluate(() => {
      const s = document.querySelector('[data-reactive-grid-target]');
      return s ? getComputedStyle(s).getPropertyValue('--grid-x').trim() : 'sin destino';
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
    /* --morph-p NO esta en <html>: se escribe en el contenedor anclado y
       en el carril, para no invalidar el estilo del documento entero en
       cada fotograma. Hay que leerla donde de verdad vive. */
    const p = await page.evaluate(() =>
      Number(
        getComputedStyle(document.querySelector('[data-morph-pin]')).getPropertyValue('--morph-p'),
      ),
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
    /* Se compara la TINTA, no la caja. Comparando cajas esta comprobacion
       daba 0,0,0 en verde mientras el nombre aterrizaba un 44% mas grande:
       las dos son elementos de bloque y sus cajas miden el contenedor. */
    const ink = (el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      const box = r.getBoundingClientRect();
      return box.width > 0 ? box : el.getBoundingClientRect();
    };
    const out = [];
    document.querySelectorAll('[data-morph]').forEach((el) => {
      const key = el.dataset.morph;
      const to = document.querySelector(`[data-morph-to="${key}"]`);
      if (!to) return;
      const a = ink(el);
      const b = ink(to);
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

  /* ---------------- Un solo juego de controles usable ----------------
     Los conmutadores de tema e idioma existen dos veces: en el hero y en
     el carril. Si los dos estan a opacidad cero, no hay ninguno usable;
     si los dos estan vivos, el foco pasa por controles invisibles. Se
     comprueba el relevo en los dos extremos del recorrido. */
  const controles = async (y) => {
    await scrollTo(page, y);
    return page.evaluate(() => {
      const op = (el) => {
        let o = 1;
        let n = el;
        while (n && n !== document.body) {
          o *= Number(getComputedStyle(n).opacity);
          n = n.parentElement;
        }
        return o;
      };
      const usable = (el) => op(el) > 0.5 && !el.closest('[inert]');
      const cuenta = (q) => [...document.querySelectorAll(q)].filter(usable).length;
      return {
        hero: cuenta('[data-hero-fade] [data-theme-toggle]'),
        carril: cuenta('[data-rail-late] [data-theme-toggle]'),
      };
    });
  };
  const arriba = await controles(0);
  const abajo = await controles(travel);
  check(
    'Siempre exactamente un conmutador de tema usable',
    arriba.hero === 1 && arriba.carril === 0 && abajo.hero === 0 && abajo.carril === 1,
    `arriba hero/carril ${arriba.hero}/${arriba.carril}, al final ${abajo.hero}/${abajo.carril}`,
  );

  /* ---------------- El color de las estrellas sale del tema ----------
     Asignar un OKLCH a fillStyle NO devuelve hexadecimal: la conversion
     fallaba en silencio y se pintaba siempre un color de reserva escrito
     a mano, igual en los dos temas. */
  const starRgb = await page.evaluate(() => {
    const g = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#000';
    g.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--text-faint')
      .trim();
    g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    return `${d[0]}, ${d[1]}, ${d[2]}`;
  });
  check('Las estrellas toman el color del tema', starRgb !== '160, 176, 200', starRgb);

  /* ---------------- El hero no se queda quieto ----------------------
     Sin tocar el raton, el foco de fondo tiene que seguir derivando: es lo
     que evita que la pagina en reposo parezca una captura de pantalla. */
  await page.mouse.move(700, 400);
  await page.waitForTimeout(1900); // pasa el plazo de inactividad
  const q1 = await readGrid();
  await page.waitForTimeout(900);
  const q2 = await readGrid();
  check('El foco deriva solo en reposo', q1 !== q2 && q2 !== '', `${q1} -> ${q2}`);

  /* ---------------- La guarda de medicion manda de verdad ------------
     `hero-morph.ts` apaga las animaciones de adorno mientras mide. Si esa
     regla pierde por especificidad —paso: empataba con la que Astro emite
     para el estilo del componente, y en un empate gana la que va despues—
     las medidas se toman con una letra a medio entrar y las piezas
     aterrizan desviadas. Aqui se comprueba el efecto, no la regla. */
  const guarda = await page.evaluate(() => {
    const el = document.querySelector('[data-anima]');
    if (!el) return 'sin elementos decorados';
    document.documentElement.dataset.morphMeasuring = '';
    const conGuarda = getComputedStyle(el).animationName;
    delete document.documentElement.dataset.morphMeasuring;
    return conGuarda;
  });
  check('La guarda de medicion apaga el adorno', guarda === 'none', guarda);

  /* ---------------- El carril no asoma durante el hero ---------------
     Un filete puesto como `border` de un contenedor se pinta siempre,
     por mucho que sus hermanos esten a opacidad cero: asi se colaba un
     separador del carril flotando sobre la primera pantalla. */
  await scrollTo(page, 0);
  const asoma = await page.evaluate(() => {
    const el = document.querySelector('[data-rail]');
    const fuera = [];
    /* Opacidad ACUMULADA: la del nodo no basta, porque lo habitual es que
       el que esta a cero sea un ancestro. */
    const opacidad = (n) => {
      let o = 1;
      let x = n;
      while (x && x !== document.body) {
        o *= Number(getComputedStyle(x).opacity);
        x = x.parentElement;
      }
      return o;
    };
    el.querySelectorAll('*').forEach((n) => {
      const cs = getComputedStyle(n);
      if (opacidad(n) < 0.02 || cs.visibility === 'hidden') return;
      const pintaBorde = ['Top', 'Right', 'Bottom', 'Left'].some(
        (l) => parseFloat(cs[`border${l}Width`]) > 0,
      );
      const pintaFondo = cs.backgroundColor !== 'rgba(0, 0, 0, 0)';
      if ((pintaBorde || pintaFondo) && n.getBoundingClientRect().width > 0) {
        fuera.push(n.tagName + '.' + String(n.className).slice(0, 30));
      }
    });
    return fuera;
  });
  check('El carril no asoma durante el hero', asoma.length === 0, asoma.join(' | ') || 'nada');

  /* ---------------- El primer pintado ya llega en su sitio ----------
     El HTML sale con el carril entero visible, que es lo correcto cuando
     no hay JavaScript. Sin un estado de arranque aplicado en el <head>,
     la pagina se pintaba asi una vez y el modulo lo ocultaba un instante
     despues: se veia el carril aparecer y desaparecer de golpe. Se
     comprueba bloqueando el modulo, que es exactamente lo que el
     visitante tiene en pantalla durante ese primer fotograma. */
  const ctxBoot = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const pBoot = await ctxBoot.newPage();
  await pBoot.route(/PointerEffects.*\.js/, (route) => route.abort());
  await pBoot.goto(BASE, { waitUntil: 'networkidle' });
  await pBoot.waitForTimeout(500);
  const arranque = await pBoot.evaluate(() => {
    const op = (q) => Number(getComputedStyle(document.querySelector(q)).opacity);
    const vis = (q) => getComputedStyle(document.querySelector(q)).visibility;
    const pin = document.querySelector('[data-morph-pin]');
    return {
      panel: op('[data-rail-panel]'),
      nombreCarril: vis('[data-morph-to="name"]'),
      nombreHero: vis('[data-morph="name"]'),
      alto: pin.offsetHeight / window.innerHeight,
    };
  });
  check(
    'El carril no parpadea en el primer pintado',
    arranque.panel === 0 && arranque.nombreCarril === 'hidden' && arranque.nombreHero === 'visible',
    `panel ${arranque.panel}, carril ${arranque.nombreCarril}, hero ${arranque.nombreHero}`,
  );
  check(
    'Sin zona muerta si el modulo no carga',
    arranque.alto < 1.05,
    `${Math.round(arranque.alto * 100) / 100} pantallas`,
  );
  await ctxBoot.close();

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

  /* ---------------- Sin transformacion, sin navegacion duplicada ------
     Con prefers-reduced-motion, sin JavaScript, o al cargar por debajo de
     lg, el script no se hace cargo. Si en ese estado el hero y el carril
     quedan los dos vivos, el indice se tabula y se recita dos veces. */
  for (const [nombre, opciones] of [
    ['prefers-reduced-motion', { reducedMotion: 'reduce' }],
    ['sin JavaScript', { javaScriptEnabled: false }],
  ]) {
    const ctx2 = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: 'dark',
      ...opciones,
    });
    const pg = await ctx2.newPage();
    await pg.goto(BASE, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(600);
    const dup = await pg.evaluate(() => {
      const vis = (el) => {
        let n = el;
        while (n && n !== document) {
          const cs = getComputedStyle(n);
          if (cs.visibility === 'hidden' || cs.display === 'none' || n.inert) return false;
          n = n.parentElement;
        }
        return true;
      };
      const t = [...document.querySelectorAll('a[href],button')]
        .filter(vis)
        .map((a) => (a.textContent.trim() || a.ariaLabel || '?').replace(/\s+/g, ' '));
      // GitHub y LinkedIn salen dos veces a proposito: hero y pie.
      return [...new Set(t.filter((x, i) => t.indexOf(x) !== i))].filter(
        (x) => !/^(GitHub|LinkedIn)$/.test(x),
      );
    });
    check(`Sin navegacion duplicada con ${nombre}`, dup.length === 0, dup.join(', ') || 'ninguna');
    await ctx2.close();
  }

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
