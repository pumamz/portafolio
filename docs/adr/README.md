# Architecture Decision Records (ADR)

Un ADR documenta **una decision tecnica significativa**: por que se tomo, que
alternativas se descartaron y que consecuencias acarrea.

## Por que molestarse

1. **Tu yo futuro.** En seis meses no recordaras por que elegiste esto. Sin el
   ADR, o revives el debate entero o cambias algo que tenia una razon de ser.
2. **Entrevistas.** "¿Por que Astro y no Next?" es una pregunta real. Tener la
   respuesta escrita y razonada, con sus contrapartidas, demuestra criterio
   de ingenieria mejor que cualquier lista de tecnologias.
3. **Honestidad intelectual.** Escribir las consecuencias negativas obliga a
   admitir que toda decision tiene coste. No existe la eleccion gratis.

## Reglas

- Un fichero por decision, numerado y **inmutable**.
- Si una decision cambia, se escribe un ADR nuevo que **supersede** al anterior.
  Nunca se edita la historia: el error pasado tambien es informacion util.
- Solo decisiones con consecuencias duraderas. "Uso 4 espacios de indentacion"
  no es un ADR, es una regla de formato.

## Plantilla

```markdown
# NNNN - Titulo en presente

- **Estado:** propuesto | aceptado | superseded por ADR-XXXX
- **Fecha:** AAAA-MM-DD

## Contexto

Que problema o restriccion motiva la decision.

## Decision

Que se decide hacer, en una frase clara.

## Alternativas consideradas

Que mas se evaluo y por que se descarto.

## Consecuencias

### Positivas

### Negativas / coste asumido
```

## Indice

| ADR                                  | Decision                      | Estado   |
| ------------------------------------ | ----------------------------- | -------- |
| [0001](./0001-framework.md)          | Astro con islas de React      | Aceptado |
| [0002](./0002-estilos-y-tokens.md)   | Tailwind v4 + tokens en capas | Aceptado |
| [0003](./0003-i18n.md)               | i18n nativo, ES por defecto   | Aceptado |
| [0004](./0004-contenido.md)          | Content collections + Zod     | Aceptado |
| [0005](./0005-hosting.md)            | Vercel con subdominio gratis  | Aceptado |
| [0006](./0006-bun.md)                | Bun como gestor de paquetes   | Aceptado |
| [0007](./0007-webgl-y-movimiento.md) | WebGL con Three.js diferido   | Aceptado |
