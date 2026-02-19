---
title: Home
---

# nestjs-iacry

**Identity and Access Management (IAM) module for NestJS**, inspired by [AWS IAM](https://aws.amazon.com/iam/).

Define fine-grained access policies using a familiar Allow/Deny model with glob-pattern matching, then enforce them via decorators or a programmatic service API.

## Features

- **AWS IAM-inspired policies** with `Allow` / `Deny` effects, `Action`, `Resource`, and `Principal` fields
- **Glob-pattern matching** via [micromatch](https://github.com/micromatch/micromatch) (negation, pipes, wildcards)
- **Decorator-based guards** for controller routes (`@IACryAction`, `@IACryResource`, `@IACryPrincipal`, `@IACryFirewall`)
- **Programmatic API** via `IACryService.isGranted()`
- **Multiple storage backends**: Sequelize, TypeORM, in-memory, or custom
- **Optional caching** via ioredis with configurable TTL
- **Sid-based policy management** for system-managed policy lifecycles
- **NestJS 9, 10, and 11** compatible

## Quick Navigation

- [Getting Started](getting-started.md) - Installation and basic setup
- [Configuration](configuration.md) - Module options and async configuration
- [Storage Adapters](storage-adapters.md) - Sequelize, TypeORM, custom adapters
- [Decorators](decorators.md) - Route-level authorization with decorators
- [Service API](service-api.md) - Programmatic policy management and authorization
- [Policies](policies.md) - Policy structure, Dynamic Identifiers, pattern matching
- [Caching](caching.md) - Redis caching and custom cache adapters
- [Advanced](advanced.md) - Custom adapters, multiple storage, strict mode
