# Despliegue en Vercel

Este proyecto es **estatico**: Vercel ejecuta el build y sirve HTML ya
generado. No hay servidor, ni funciones, ni base de datos que configurar.

## Configuracion ya resuelta

[`vercel.json`](../vercel.json) fija todo lo que Vercel necesita, para que la
deteccion automatica no cambie de criterio entre despliegues:

| Ajuste            | Valor                           | Por que                                                                |
| ----------------- | ------------------------------- | ---------------------------------------------------------------------- |
| `installCommand`  | `bun install --frozen-lockfile` | Fuerza Bun y falla si `bun.lock` no cuadra                             |
| `buildCommand`    | `bun run build`                 | Incluye `astro check`: los errores de tipos rompen el deploy           |
| `outputDirectory` | `dist`                          | Donde Astro deja el sitio                                              |
| `trailingSlash`   | `true`                          | Coincide con las rutas que genera `path()`, evita redirecciones dobles |

**`--frozen-lockfile` es deliberado.** Si `package.json` y `bun.lock` no
coinciden, el despliegue falla en lugar de instalar versiones distintas a las
probadas en local. Un portafolio que funciona en tu maquina y se rompe en
produccion es peor que uno que no despliega.

### Cabeceras de seguridad

Tambien en `vercel.json`. Son gratis y un tech lead que abra las herramientas de
desarrollo las va a ver:

- `X-Content-Type-Options: nosniff` - impide que el navegador adivine tipos MIME
- `Referrer-Policy: strict-origin-when-cross-origin` - no filtra la ruta completa
  a sitios externos
- `Permissions-Policy` - desactiva camara, microfono y geolocalizacion
- `Content-Security-Policy: frame-ancestors 'none'` - previene clickjacking
- `Strict-Transport-Security` - obliga HTTPS en visitas posteriores
- `Cache-Control: immutable` en `/_astro/*` - los assets llevan hash en el
  nombre, asi que se pueden cachear un ano sin riesgo

## Opcion A - GitHub + Vercel (recomendada)

Despliegue automatico en cada `push` y una vista previa por rama.

### 1. Crear el repositorio en GitHub

En [github.com/new](https://github.com/new), **sin** README ni `.gitignore`
(este proyecto ya los tiene). Puede ser publico o privado; publico suma, porque
un tech lead va a querer leer el codigo.

### 2. Conectar y subir

```bash
git remote add origin https://github.com/TU_USUARIO/portafolio.git
git push -u origin main
```

### 3. Importar en Vercel

1. Entra en [vercel.com/new](https://vercel.com/new) e inicia sesion con GitHub.
2. Selecciona el repositorio.
3. **No cambies nada** en la pantalla de configuracion: `vercel.json` ya la fija.
4. Pulsa **Deploy**.

El nombre del proyecto determina la URL: `<nombre>.vercel.app`.

### 4. Ajustar la URL en el codigo

Con la URL definitiva, actualizar en **dos** sitios:

- [`astro.config.mjs`](../astro.config.mjs) -> campo `site`
- [`src/config/site.ts`](../src/config/site.ts) -> campo `url`

De ahi salen el sitemap, las URLs canonicas, `hreflang` y las etiquetas Open
Graph. Si quedan mal, Google indexa direcciones que no existen.

Commit, push, y el redespliegue es automatico.

## Opcion B - Vercel CLI, sin GitHub

Util para publicar hoy mismo. Pierdes los despliegues automaticos.

```bash
bunx vercel login     # abre el navegador
bunx vercel           # vista previa
bunx vercel --prod    # produccion
```

## Verificacion posterior al despliegue

- [ ] `/` carga en espanol y `/en/` en ingles
- [ ] El conmutador de idioma navega correctamente en ambos sentidos
- [ ] El tema oscuro persiste al recargar y al navegar entre paginas
- [ ] No hay destello blanco al cargar en tema oscuro
- [ ] `/sitemap-index.xml` responde
- [ ] El codigo fuente muestra `hreflang` y el JSON-LD de tipo Person
- [ ] Lighthouse en movil: cuatro categorias por encima de 95

## Cuando llegue el dominio propio

Ver [ADR-0005](./adr/0005-hosting.md): la decision de empezar con subdominio
gratuito esta tomada, pero con revision pendiente **antes de enviar
candidaturas**. Un enlace `.vercel.app` en un CV se lee como proyecto de
practicas aunque el sitio sea excelente.

Migrar es trivial: anadir el dominio en el panel de Vercel, apuntar los DNS y
actualizar los dos campos de URL del paso 4.
