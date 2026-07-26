---
lang: es
translationKey: facturacion
slug: facturacion-electronica
title: Sistema de Facturacion Electronica
tagline: Sistema de gestion comercial que emite facturas validas ante el SRI, desde el pedido hasta el comprobante.
problem: >-
  Un negocio no puede facturar como quiera: en Ecuador cada comprobante debe
  cumplir el formato y las validaciones que exige el SRI, y ser aceptado por sus
  servicios antes de tener validez legal. El reto no era construir un carrito de
  ventas, sino que todo el flujo comercial terminara en un documento fiscalmente
  correcto y aceptado.
solution: >-
  Un sistema completo en Spring Boot con Angular y MySQL que cubre pedidos,
  proveedores, cajas, productos, ventas, facturas y usuarios, integrado con las
  APIs del SRI. La parte dificil fue la validacion: implementamos las
  comprobaciones fiscales antes de enviar el comprobante, en lugar de reaccionar
  al rechazo del organismo. Un comprobante rechazado obliga a rehacer el proceso
  con el cliente delante, asi que preferimos fallar temprano y dentro del sistema.
impact: >-
  Sistema funcional que emite comprobantes conformes a la normativa del SRI.
  Su valor real como pieza de portafolio es que la integracion se hizo contra una
  especificacion externa, obligatoria y no negociable: el organismo no adapta su
  API a lo que uno programe, exactamente igual que ocurre en la industria.
role: Desarrollador full-stack
period: 2025 - 2026
stack:
  - Spring Boot
  - Java
  - Angular
  - MySQL
  - API del SRI
featured: true
order: 2
draft: false
---

Proyecto universitario.

<!--
TODO (Daniel): datos que reforzarian este caso:
  - Numero de facturas emitidas en pruebas o en uso real
  - Cuantos modulos o entidades tiene el sistema
  - Tamano del equipo y tu rol exacto
  - Algun problema concreto de la API del SRI que tuvieras que resolver
    (los detalles de integracion son lo que mas valora un tech lead)
-->
