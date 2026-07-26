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
  Primer sistema que lidere de principio a fin, coordinando al equipo y
  repartiendo el trabajo. Tambien fue el primero que desplegue en AWS, lo que
  significo enfrentarme a que un sistema que funciona en local no funciona sin
  mas en un servidor: variables de entorno, puertos, base de datos remota y
  acceso desde fuera.
role: Lider de proyecto y desarrollador full-stack
period: 2024
stack:
  - Spring Boot
  - Java
  - Spring Security
  - React
  - Bootstrap
  - MySQL
  - AWS
featured: false
order: 3
draft: false
---

Proyecto universitario.

<!--
TODO (Daniel): para reforzarlo, anade si lo recuerdas:
  - Tamano del equipo que lideraste
  - Si el gimnasio era real o un caso de estudio
  - Que servicio concreto de AWS usaste (EC2, RDS, Elastic Beanstalk...)
    Ser especifico con la infraestructura suma mucho, y encaja con tu
    interes declarado en infraestructura y seguridad.
-->
