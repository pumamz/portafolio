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
  El sistema llego a emitir comprobantes aceptados por el SRI en su ambiente de
  pruebas, que es la certificacion previa obligatoria antes de facturar de
  verdad. Ese detalle importa: significa que los documentos pasaron las
  validaciones reales del organismo, no solo las mias. La integracion se hizo
  contra una especificacion externa, obligatoria y no negociable, que es
  exactamente como se trabaja en la industria.
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
CONFIRMADO 2026-07-26: comprobantes aceptados por el SRI en su ambiente de
pruebas (certificacion previa obligatoria).

TODO (Daniel):
  - Numero aproximado de comprobantes emitidos en la certificacion
  - Tamano del equipo y tu rol exacto
  - Algun problema concreto de la API del SRI que tuvieras que resolver.
    Los detalles de integracion son lo que mas valora un tech lead: una
    anecdota de depuracion real vale mas que la lista de modulos.
-->
