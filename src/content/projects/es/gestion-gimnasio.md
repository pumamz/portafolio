---
lang: es
translationKey: gimnasio
slug: gestion-gimnasio
title: Sistema de Gestion de Gimnasio
tagline: Control de membresias, ventas y accesos para un gimnasio, desplegado en la nube.
problem: >-
  Un gimnasio vive de sus membresias, y cada membresia es una fecha de
  vencimiento que alguien tiene que comprobar en la puerta. Llevar a mano quien
  esta al dia, quien vencio y que se vendio cada dia es lento y se presta a
  errores que cuestan dinero.
solution: >-
  Sistema con Spring Boot y Spring Security en el backend, React con Bootstrap
  en el frontend y MySQL como base de datos, con modulos de usuarios, ventas,
  membresias y control de accesos. La decision que mas aprendizaje dejo fue
  incorporar Spring Security desde el principio en lugar de anadir autenticacion
  al final: el control de accesos no es una pantalla de login, es una regla que
  atraviesa cada endpoint del sistema.
impact: >-
  Fue el primer sistema que desplegue fuera de mi maquina, en una instancia EC2
  de AWS. Eso significo enfrentarme a todo lo que un entorno local esconde:
  aprovisionar el servidor, configurar el sistema operativo, abrir los puertos
  correctos en los grupos de seguridad, gestionar variables de entorno y dejar la
  aplicacion accesible desde internet. Un sistema que funciona en local no
  funciona sin mas en un servidor, y aqui aprendi exactamente por que.
role: Lider de proyecto y desarrollador full-stack
period: 2024
stack:
  - Spring Boot
  - Java
  - Spring Security
  - React
  - Bootstrap
  - MySQL
  - AWS EC2
featured: false
order: 3
draft: false
---

Proyecto universitario.

<!--
CONFIRMADO 2026-07-26: desplegado en una instancia EC2 de AWS.

TODO (Daniel):
  - Tamano del equipo que lideraste (el CV menciona liderazgo aqui)
  - Si el gimnasio era un cliente real o un caso de estudio academico
-->
