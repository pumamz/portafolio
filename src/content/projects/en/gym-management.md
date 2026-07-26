---
lang: en
translationKey: gimnasio
slug: gym-management
title: Gym Management System
tagline: Membership, sales and access control for a gym, deployed to the cloud.
problem: >-
  A gym lives on its memberships, and every membership is an expiry date someone
  has to check at the door. Tracking by hand who is up to date, who lapsed and
  what was sold each day is slow and invites mistakes that cost money.
solution: >-
  A system with Spring Boot and Spring Security on the backend, React with
  Bootstrap on the frontend and MySQL for storage, covering users, sales,
  memberships and access control. The decision I learned most from was bringing
  in Spring Security from the start instead of bolting authentication on at the
  end: access control is not a login screen, it is a rule that cuts across every
  endpoint in the system.
impact: >-
  The first system I deployed outside my own machine, onto an AWS EC2 instance.
  That meant facing everything a local environment hides: provisioning the
  server, configuring the operating system, opening the right ports in security
  groups, managing environment variables and making the application reachable
  from the internet. A system that works locally does not simply work on a
  server, and this is where I learned exactly why.
role: Project lead and full-stack developer
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

University project.
