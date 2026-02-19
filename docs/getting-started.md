---
title: Getting Started
---

# Getting Started

## Installation

```bash
npm install --save nestjs-iacry
```

Install a storage backend (pick one, or use in-memory only):

```bash
# For Sequelize
npm install --save sequelize sequelize-typescript

# For TypeORM
npm install --save typeorm
```

Optionally, install a cache adapter:

```bash
npm install --save ioredis
```

## Minimal Setup (In-Memory Only)

The simplest configuration uses hardcoded in-memory policies with no database:

```typescript
import { Module } from '@nestjs/common';
import { IACryModule, Effect } from 'nestjs-iacry';

@Module({
  imports: [
    IACryModule.forRoot({
      policies: [
        {
          Effect: Effect.ALLOW,
          Action: '*',
          Principal: 'admin',
        },
        {
          Effect: Effect.ALLOW,
          Action: 'book:read',
          Principal: 'user:*',
        },
      ],
    }),
  ],
})
export class AppModule {}
```

## Setup with Database Storage

For dynamic policies stored in a database, see [Storage Adapters](storage-adapters.md).

## Decorate Your Entity Models

Mark your domain models with `@IACryEntity()` so the library can extract principal/resource identifiers automatically:

```typescript
import { IACryEntity } from 'nestjs-iacry';

@IACryEntity()
export class User {
  id: string;
}

@IACryEntity()
export class Book {
  id: string;
}
```

See [Decorators](decorators.md) for `@IACryEntity` options.

## Protect a Route

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { IACryFirewall, IACryFirewallGuard } from 'nestjs-iacry';

@Controller('books')
export class BookController {
  @IACryFirewall({ resource: 'book:{params.id}' })
  @UseGuards(AuthGuard, IACryFirewallGuard)
  @Post(':id')
  async update() {
    // only reachable if the policy allows it
  }
}
```

## Check Permissions Programmatically

```typescript
import { IACryService } from 'nestjs-iacry';

@Controller('books')
export class BookController {
  constructor(private readonly iacry: IACryService) {}

  @Post(':id')
  async update(@User() user, @Book() book) {
    if (!(await this.iacry.isGranted('book:update', user, book))) {
      throw new ForbiddenException();
    }
  }
}
```

Next: [Configuration](configuration.md)
