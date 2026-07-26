---
lang: en
translationKey: facturacion
slug: electronic-invoicing
title: Electronic Invoicing System
tagline: A commercial management system issuing invoices valid before Ecuador's tax authority, from order to receipt.
problem: >-
  A business cannot invoice however it likes: in Ecuador every receipt must meet
  the format and validation rules required by the SRI (the national tax
  authority) and be accepted by its services before it is legally valid. The
  challenge was not building a shopping cart, but making the whole commercial
  flow end in a fiscally correct, accepted document.
solution: >-
  A complete system in Spring Boot with Angular and MySQL covering orders,
  suppliers, cash registers, products, sales, invoices and users, integrated with
  the SRI APIs. The hard part was validation: we implemented the fiscal checks
  before submitting the receipt rather than reacting to the authority's
  rejection. A rejected receipt means redoing the process with the customer
  standing there, so we chose to fail early and inside the system.
impact: >-
  A working system that issues receipts compliant with SRI regulations. Its real
  value as portfolio evidence is that the integration was built against an
  external, mandatory and non-negotiable specification: the authority does not
  adapt its API to your code, exactly as happens in industry.
role: Full-stack developer
period: 2025 - 2026
stack:
  - Spring Boot
  - Java
  - Angular
  - MySQL
  - SRI API
featured: true
order: 2
draft: false
---

University project.
