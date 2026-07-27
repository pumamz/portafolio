# Requerimientos - Portafolio personal

> Estado: **v0.2 - en levantamiento**
> Ultima actualizacion: 2026-07-26

Este documento es la fuente de verdad sobre _que_ construimos y _para quien_.
Si una funcionalidad no se puede justificar contra un objetivo de aqui, no entra.

---

## 1. Objetivo de negocio

**Objetivo primario:** conseguir oportunidades laborales (empleo) **y** captar
clientes freelance.

Es un objetivo dual, que es el escenario mas dificil de ejecutar porque tiende a
diluir el mensaje. La estrategia acordada para resolverlo:

> **Una sola narrativa, doble salida.**
> El sitio cuenta una historia unica - "resuelvo problemas de software de punta a
> punta" - y ofrece dos llamadas a la accion con jerarquia explicita:
>
> 1. **CTA primaria** (siempre visible): contacto directo.
> 2. **CTA secundaria** (dentro de "Sobre mi"): descargar CV.

**Anti-requisito explicito:** no habra un selector "¿eres empresa o reclutador?".
Obliga al visitante a clasificarse antes de recibir valor, y el visitante nunca
trabaja. La segmentacion la resuelve la jerarquia de contenido, no un boton.

### Metricas de exito

| Metrica                                   | Objetivo a 3 meses | Como se mide        |
| ----------------------------------------- | ------------------ | ------------------- |
| Contactos cualificados recibidos          | >= 5               | Bandeja de correo   |
| Descargas de CV                           | >= 20              | Analitica de evento |
| Posicionamiento por "<nombre> + <ciudad>" | Primera pagina     | Busqueda manual     |
| Lighthouse en produccion (4 categorias)   | >= 95              | CI en cada deploy   |

---

## 2. Audiencias

Ordenadas por prioridad. El diseno sirve a la #1 sin romper a las demas.

### A1 - Reclutador tecnico / RRHH (30 segundos)

- **Comportamiento:** escanea, no lee. Busca coincidencia con la oferta.
- **Necesita:** rol, tecnologias, seniority, ubicacion, CV descargable.
- **Implicacion de diseno:** el nombre, el rol y el stack deben ser legibles
  sin hacer scroll. Si la animacion del hero retrasa esto, la animacion pierde.

### A2 - Tech lead / desarrollador senior (2-5 minutos)

- **Comportamiento:** evalua criterio tecnico. Abre el codigo fuente y el repo.
- **Necesita:** decisiones de arquitectura, calidad del propio sitio, GitHub.
- **Implicacion de diseno:** los casos de estudio deben explicar el _porque_ de
  las decisiones, no listar tecnologias. El propio repositorio es evidencia.

### A3 - Cliente potencial no tecnico (1-2 minutos)

- **Comportamiento:** busca confianza y resultados, no elegancia tecnica.
- **Necesita:** que problema resuelves, prueba de que funciono, como contactarte.
- **Implicacion de diseno:** cada proyecto necesita una linea sin jerga y un
  impacto medible. El lenguaje de las tarjetas se escribe para A3, no para A2.

---

## 3. Alcance

### 3.1 Dentro del alcance (v1)

| ID  | Requisito                    | Audiencia | Prioridad |
| --- | ---------------------------- | --------- | --------- |
| F1  | Hero con nombre, rol y CTA   | A1 A2 A3  | Debe      |
| F2  | Seccion de proyectos (casos) | A2 A3     | Debe      |
| F3  | Pagina de detalle por caso   | A2 A3     | Debe      |
| F4  | Sobre mi + descarga de CV    | A1 A3     | Debe      |
| F5  | Stack tecnologico            | A1 A2     | Debe      |
| F6  | Contacto (correo + redes)    | Todas     | Debe      |
| F7  | Bilingue ES / EN completo    | Todas     | Debe      |
| F8  | Tema claro / oscuro          | A2        | Deberia   |
| F9  | Pagina 404 propia            | Todas     | Deberia   |
| F10 | Imagenes OG por pagina       | Todas     | Deberia   |

### 3.2 Fuera del alcance (v1)

Registrado para que no se cuele por impulso a mitad de construccion:

- Blog / CMS. Solo si se compromete a publicar; un blog con una entrada de hace
  dos anos resta credibilidad en vez de sumarla.
- Formulario de contacto con backend. Un `mailto:` con el correo copiable
  convierte igual, sin servidor, sin spam y sin RGPD.
- Analitica invasiva. Si se anade, sera sin cookies (Plausible o Umami).
- Testimonios. Se anadiran cuando existan reales; inventados destruyen confianza.

---

## 4. Requisitos no funcionales

| Area               | Requisito                                                             |
| ------------------ | --------------------------------------------------------------------- |
| **Rendimiento**    | LCP < 1.5 s en 4G. JS inicial < 30 KB y diferido < 150 KB (ADR-0007). |
| **Accesibilidad**  | WCAG 2.2 AA. Navegable solo con teclado. Contraste >= 4.5:1.          |
| **Movimiento**     | Toda animacion respeta `prefers-reduced-motion`. Sin parpadeos.       |
| **SEO**            | Metadatos por pagina, `hreflang`, sitemap, JSON-LD de tipo Person.    |
| **Navegadores**    | Ultimas 2 versiones de Chrome, Firefox, Safari y Edge.                |
| **Responsive**     | 320 px a 2560 px. Sin scroll horizontal en ningun punto.              |
| **Mantenibilidad** | Anadir un proyecto = crear 2 ficheros Markdown. Sin tocar codigo.     |

---

## 5. Direccion de diseno

**Elegida:** audaz / experimental.
**Disciplina acordada:** _audaz en tipografia y movimiento, sobrio en estructura._

Riesgo asumido y registrado: un diseno espectacular con pocos proyectos genera
un contraste que juega en contra, y puede alienar a la audiencia A3. Mitigaciones:

1. El movimiento se implementa con CSS nativo (`view-transitions`,
   animaciones ligadas al scroll), no con librerias pesadas de animacion.
2. La estructura de la informacion es convencional y predecible.
3. Ninguna animacion bloquea la lectura del contenido principal.

---

## 6. Decisiones tomadas

| Tema       | Decision                              | ADR                                      |
| ---------- | ------------------------------------- | ---------------------------------------- |
| Framework  | Astro + islas de React                | [0001](./adr/0001-framework.md)          |
| Estilos    | Tailwind CSS v4 con tokens semanticos | [0002](./adr/0002-estilos-y-tokens.md)   |
| i18n       | i18n nativo de Astro, ES por defecto  | [0003](./adr/0003-i18n.md)               |
| Contenido  | Content collections validadas con Zod | [0004](./adr/0004-contenido.md)          |
| Hosting    | Vercel, subdominio gratuito           | [0005](./adr/0005-hosting.md)            |
| Runtime    | Bun como gestor de paquetes           | [0006](./adr/0006-bun.md)                |
| Movimiento | WebGL con Three.js, carga diferida    | [0007](./adr/0007-webgl-y-movimiento.md) |

---

## 7. Pendiente de definir

Bloquea la fase de contenido. Sin esto no se puede construir nada real:

- [ ] Nombre completo y titulo profesional
- [ ] Correo de contacto publico
- [ ] URLs de GitHub y LinkedIn
- [ ] Ciudad y pais
- [ ] Los 1-2 proyectos: nombre, problema, solucion, impacto, stack, enlaces
- [ ] Anos de experiencia y trayectoria resumida
- [ ] Lista de tecnologias para la seccion de stack
- [ ] Foto de perfil (fichero)
- [ ] CV en PDF (ES y EN)
- [ ] Color de acento definitivo
