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
  Construimos una plataforma completa con Spring Boot en el backend y React con
  TypeScript y Tailwind CSS en el frontend, sobre PostgreSQL. La decision de
  arquitectura mas importante fue separar el sistema en modulos independientes
  con un control de permisos por rol atravesando todos ellos, en lugar de un
  unico CRUD con validaciones dispersas. Elegimos PostgreSQL por encima de MySQL
  por su manejo de integridad referencial estricta, algo no negociable cuando los
  registros son historiales clinicos.
impact: >-
  Entregado a UDIPSAI cubriendo el ciclo completo de atencion: pacientes, fichas
  medicas, citas, usuarios, permisos y seguimientos. Fue mi proyecto de mayor
  responsabilidad: lidere el equipo, asigne tareas, revise el codigo de mis
  companeros y valide cada funcionalidad antes de darla por terminada.
role: Lider de proyecto y desarrollador full-stack
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
TODO (Daniel): este caso gana mucho con numeros. Anade los que conozcas:
  - Cuantas personas formaban el equipo que lideraste
  - Cuantos profesionales o pacientes usan el sistema
  - Cuantos modulos o tablas tiene finalmente
  - Cuanto duraba antes un proceso que ahora es inmediato
Sustituye o amplia el campo `impact` con esos datos.
-->
