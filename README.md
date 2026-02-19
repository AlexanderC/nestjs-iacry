<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  <b>Identity and Access Management (IAM)</b> module for NestJS, inspired by <a href="https://aws.amazon.com/iam/">AWS IAM</a>.
</p>

<p align="center">
  <a href="https://npmjs.com/package/nestjs-iacry"><img src="https://img.shields.io/npm/v/nestjs-iacry.svg" alt="NPM Version" /></a>
  <a href="https://npmjs.com/package/nestjs-iacry"><img src="https://img.shields.io/npm/l/nestjs-iacry.svg" alt="Package License" /></a>
  <a href="https://npmjs.com/package/nestjs-iacry"><img src="https://img.shields.io/npm/dm/nestjs-iacry.svg" alt="NPM Downloads" /></a>
</p>

## Overview

`nestjs-iacry` provides fine-grained, policy-based access control for NestJS applications. Define Allow/Deny policies with glob-pattern matching on Actions, Resources, and Principals — then enforce them via route decorators or a programmatic service API.

## Features

- **AWS IAM-inspired policies** — familiar Allow/Deny model with Action, Resource, and Principal fields
- **Multiple storage backends** — Sequelize, TypeORM, in-memory, or bring your own
- **Decorator-based route guards** — `@IACryFirewall`, `@IACryAction`, `@IACryResource`, `@IACryPrincipal`
- **Programmatic API** — `IACryService.isGranted()` for imperative checks
- **Glob-pattern matching** — wildcards, negation, pipes via [micromatch](https://github.com/micromatch/micromatch)
- **Optional caching** — ioredis with configurable TTL, or custom cache adapters
- **Sid-based policy management** — for system-managed policy lifecycles

## Documentation

Full documentation is available at the **[Documentation Site](https://alexanderc.github.io/nestjs-iacry/)**.

- [Getting Started](https://alexanderc.github.io/nestjs-iacry/getting-started) — Installation and basic setup
- [Configuration](https://alexanderc.github.io/nestjs-iacry/configuration) — Module options and async configuration
- [Storage Adapters](https://alexanderc.github.io/nestjs-iacry/storage-adapters) — Sequelize, TypeORM, custom adapters
- [Decorators](https://alexanderc.github.io/nestjs-iacry/decorators) — Route-level authorization
- [Service API](https://alexanderc.github.io/nestjs-iacry/service-api) — Programmatic policy management
- [Policies](https://alexanderc.github.io/nestjs-iacry/policies) — Policy structure and pattern matching
- [Caching](https://alexanderc.github.io/nestjs-iacry/caching) — Redis and custom cache adapters
- [Advanced](https://alexanderc.github.io/nestjs-iacry/advanced) — Custom adapters, firewall rules, exports

## NestJS Compatibility

| NestJS Version | nestjs-iacry Version |
|----------------|---------------------|
| 11.x           | >= 0.3.0            |
| 10.x           | >= 0.2.0            |
| 9.x            | >= 0.0.12           |

## Test Coverage

| Category | Statements | Branches | Functions | Lines |
|----------|-----------|----------|-----------|-------|
| **All files** | **90.25%** | **81.92%** | **87.5%** | **90.27%** |
| Core (policy, matcher, firewall) | 100% | 91%+ | 100% | 100% |
| Decorators | 97%+ | 80%+ | 100% | 97%+ |
| Errors | 100% | 100% | 100% | 100% |
| Helpers | 100% | 94% | 100% | 100% |
| Storages | 86%+ | 81%+ | 80%+ | 86%+ |

**149 tests** across **19 test suites**.

## Development

```bash
# Run tests
npm test

# Build
npm run build

# Release
npm run format
npm run release    # or: npm run patch | minor | major
npm run deploy
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

- [Alex Cucer](https://github.com/AlexanderC)

## License

MIT
