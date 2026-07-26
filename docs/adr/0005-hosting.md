# 0005 - Desplegar en Vercel con subdominio gratuito

- **Estado:** aceptado
- **Fecha:** 2026-07-26

## Contexto

El sitio es estatico y necesita despliegue continuo desde git, con coste cero
inicial. El autor ha optado por empezar sin dominio propio.

## Decision

Desplegar en **Vercel**, conectado al repositorio de GitHub, usando el
subdominio gratuito `*.vercel.app`.

## Alternativas consideradas

### Vercel con dominio propio

**Recomendado, y aplazado - no descartado.** Un dominio `nombre.dev` cuesta unos
12 USD al ano y comunica seriedad de forma inmediata: un enlace `.vercel.app` en
un CV se lee como proyecto de practicas, aunque el sitio sea excelente.

Se pospone por decision del autor. Migrar despues es trivial - se anade el
dominio en el panel de Vercel y se actualiza `site` en `astro.config.mjs` - por
lo que aplazarlo no genera deuda tecnica.

### Cloudflare Pages

Alternativa fuerte: red mas rapida, ancho de banda ilimitado y dominios a precio
de coste. Se descarta por comodidad de los despliegues de vista previa de
Vercel, que son mejores para iterar.

### GitHub Pages

Descartado. Solo estatico, sin funciones serverless, y con menos margen si en el
futuro se quiere generar imagenes OG dinamicas o anadir un endpoint.

## Consecuencias

### Positivas

- Despliegue automatico en cada `push`. Vista previa por rama y por PR.
- HTTPS, CDN global y compresion sin configurar nada.
- Coste cero.

### Negativas / coste asumido

- **La URL resta credibilidad profesional.** Es el coste real de esta decision y
  conviene revisarla antes de empezar a enviar candidaturas.
- Sin dominio propio no hay correo profesional del tipo `hola@tunombre.dev`.
- Cambiar de dominio mas adelante implica perder el historial de SEO acumulado
  bajo `.vercel.app` (poco relevante si se hace pronto).

## Revision pendiente

Reevaluar la compra de dominio **antes del primer envio de candidaturas**.
