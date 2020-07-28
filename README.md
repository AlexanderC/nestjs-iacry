<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  **[WIP]** An Identity and Access Control (Management) module for Nest framework (node.js) highly inspired by the <a href="https://aws.amazon.com/iam/">AWS IAM</a>.
</p>

<p align="center">
  <a href="https://npmjs.com/package/nestjs-iacry"><img src="https://img.shields.io/npm/v/nestjs-iacry.svg" alt="NPM Version" /></a>
  <a href="https://npmjs.com/package/nestjs-iacry"><img src="https://img.shields.io/npm/l/nestjs-iacry.svg" alt="Package License" /></a>
  <a href="https://npmjs.com/package/nestjs-iacry"><img src="https://img.shields.io/npm/dm/nestjs-iacry.svg" alt="NPM Downloads" /></a>
</p>

### Installation

```sh
npm install --save nestjs-iacry sequelize-typescript
#or
yarn add nestjs-iacry sequelize-typescript
```

> Important: `sequelize-typescript` is required if you are using `sequelize` policy storage model.

### Configuration

Configure policy storage using sequelize adapter:
```typescript
// models/policies-storage.model.ts
import { PoliciesStorageSequelizeModel } from 'nestjs-iacry';

export default class PoliciesStorage extends PoliciesStorageSequelizeModel<PoliciesStorage> {  }

```

Configure your models:
```typescript
// models/user.model.ts
import { IACryEntity } from 'nestjs-iacry';

// You might optionally use dynamic name fields to allow matching like "Principal: 'admin:*'"
// @IACryEntity({ nameField: 'role' })
@IACryEntity() 
@Table({})
export default class User extends Model<User> {
  id: string;
  role?: string; // nameField
}

// models/book.model.ts
import { IACryEntity } from 'nestjs-iacry';

@IACryEntity()
@Table({})
export default class Book extends Model<Book> {
  id: string;
}
```

And finaly include the module and the service *(assume using [Nestjs Configuration](https://docs.nestjs.com/techniques/configuration))*:
```typescript
// src/app.module.ts
import { IACryModule, Effect, PolicyInterface, SEQUELIZE_STORAGE } from 'nestjs-iacry';
import PolicyStorage from '../models/policy-storage.model';

@Module({
  imports: [
    IACryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          storage: SEQUELIZE_STORAGE, // dynamic policy storage (e.g. sequelize)
          storageRepository: PolicyStorage, // if database storage specified
          policies: [ // OPTIONAL: some hardcoded policies...
            ...configService.get<Array<string | PolicyInterface>>('policies'),
            {
              // allow any action to be performed by the user
              Effect: Effect.ALLOW,
              Action: '*',
              // If used "@IACryEntity({ nameField: 'role' })" you might specify "admin"
              Principal: 'user',
            },
          ],
        };
      },
    }),
  ],
},
```

### Usage

Using firewall guard in controllers:
```typescript
// src/some-fancy.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { IACryAction, IACryResource, IACryPrincipal, IACryFirewallGuard } from 'nestjs-iacry';

@Controller()
export class BookController {
  @IACryAction('book:update')
  @IACryResource('book:{params.id}') // {params.id} is replaced with req.params.id [OPTIONAL]
  @IACryPrincipal() // taken from req.user by default
  @UseGuards(JwtAuthGuard, IACryFirewallGuard)
  @Post('book/:id')
  async update(@Request() req) { }
}
```

Using the service:
```typescript
// src/some-fancy.controller.ts
import { Controller, Post, UseGuards, UnauthorizedException } from '@nestjs/common';
import { IACryService } from 'nestjs-iacry';

@Controller()
export class BookController {
  constructor(private readonly firewall: IACryService) { }

  @UseGuards(JwtAuthGuard)
  @Post('book/:id')
  async update(@User user: User, @Book() book: Book) {
    if (!this.firewall.isGranted('book:update', user, book)) {
      throw new UnauthorizedException(`You are not allowed to update book:${book.id}`);
    }
  }
}
```

Manage user policies:
```typescript
import { IACryService, Effect } from 'nestjs-iacry';

let firewall: IACryService;
let user: User;

const attachedPoliciesCount = await firewall.attach(user, [
  // Allow any action on the book service
  { Effect: Effect.ALLOW, Action: 'book:*'},
  // allow updating any books to any user except the user with ID=7
  { Effect: Effect.DENY, Action: ['book:update', 'book:patch'], Principal: 'user:!7' },
  // deny deleting books to all users
  { Effect: Effect.DENY, Action: 'book:delete', Principal: ['user:*'] },
]);
const policies = await firewall.retrieve(user);
const deletedPoliciesCount = await firewall.reset(user);
```

### Documentation

#### Policy Definition

Structure:
```typescript
interface PolicyInterface {
  Sid?: string, // policy identified
  Effect: 'Allow' | 'Deny', // Allow | Deny
  Action: string | { service: string, action: string } | Array<string | { service: string, action: string }>, // What Action: e.g. "book:update"
  Resource?: string | { entity: string, id: number | string } | Array<string | { entity: string, id: number | string }>, // Object of the Action: e.g. "book:33"
  Principal?: string | { entity: string, id: number | string } | Array<string | { entity: string, id: number | string }>, // Whom: e.g. "user:1"
}
```

> Important: `Action`, `Resource` and `Principal` values **might be negated**, 
> which would mean that a `book:!33` would match any book but the one with ID=33.

### Development

Running tests:
```bash
npm test
```

Releasing:
```bash
npm run format
npm run prebuild
npm run release # npm run patch|minor|major
npm run deploy
```

### TODO

- [ ] Implement policy conditional statements (e.g. update books that the user created himself)
- [ ] Add caching for dynamic policy storage (e.g. `ioredis` for `sequelize`)
- [ ] Add complehensive Documentation
- [ ] Add more built in conditional matchers to cover basic use-cases
- [ ] Cover most of codebase w/ tests

### Contributing

* [Alex Cucer](https://github.com/AlexanderC)

### License

MIT