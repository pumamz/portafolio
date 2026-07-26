---
lang: es
translationKey: psicopedagogico
slug: sistema-psicopedagogico
title: Sistema de Gestion Psicopedagogica
tagline: Plataforma para que una unidad de atencion universitaria gestione pacientes, citas y seguimientos en un solo lugar.
problem: >-
  UDIPSAI, la unidad de atencion psicopedagogica de la Universidad Catolica de
  Cuenca, necesitaba llevar el ciclo completo de atencion a sus pacientes:
  registro, fichas medicas, agenda de citas y seguimiento de cada caso. Al
  tratarse de informacion clinica, no bastaba con almacenar datos: cada
  profesional debia ver unicamente lo que le correspondia.
solution: >-
  Construi una plataforma completa con Spring Boot en el backend y React con
  TypeScript y Tailwind CSS en el frontend, sobre PostgreSQL. La decision de
  arquitectura mas importante fue separar el sistema en modulos independientes
  con un control de permisos por rol atravesando todos ellos, en lugar de un
  unico CRUD con validaciones dispersas. Elegi PostgreSQL por encima de MySQL por
  su manejo de integridad referencial estricta, algo no negociable cuando los
  registros son historiales clinicos.
impact: >-
  Entregado a UDIPSAI cubriendo el ciclo completo de atencion: pacientes, fichas
  medicas, citas, usuarios, permisos y seguimientos. Lo desarrolle integramente
  yo: modelo de datos, backend, frontend y sistema de permisos, asumiendo cada
  decision tecnica de principio a fin.
role: Desarrollador full-stack (proyecto individual)
period: 2025 - 2026
stack:
  - Spring Boot
  - Java
  - React
  - TypeScript
  - Tailwind CSS
  - PostgreSQL
featured: true
order: 1
draft: false
---

Proyecto de Vinculacion con la Sociedad de la Universidad Catolica de Cuenca.

<!--
CONFIRMADO 2026-07-26: proyecto individual, sin equipo. El CV afirma
liderazgo de equipo en este proyecto; esa mencion debe corregirse en el CV
para que no contradiga al sitio.

TODO (Daniel): sigue faltando lo que mas peso tiene:
  - Cuantos profesionales de UDIPSAI usan el sistema
  - Cuantos pacientes o fichas gestiona
  - Cuantos modulos o tablas tiene finalmente
  - Cuanto duraba antes un proceso que ahora es inmediato
-->
