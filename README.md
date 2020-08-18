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
import { IACryModule, Effect, PolicyInterface, SEQUELIZE_STORAGE, IOREDIS_CACHE } from 'nestjs-iacry';
import PolicyStorage from '../models/policy-storage.model';

@Module({
  imports: [
    IACryModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: async (configService: ConfigService, redisService: RedisService) => {
        return {
          storage: SEQUELIZE_STORAGE, // dynamic policy storage (e.g. sequelize)
          storageRepository: PolicyStorage, // if database storage specified
          cache: IOREDIS_CACHE, // dynamic policy storage cache (e.g. ioredis)
          cacheClient: <IORedis.Redis>await redisService.getClient(), // if cache adapter was specified
          cacheOptions: { expire: 600 }, // policy cache expires in 10 minutes (default 1 hour)
          policies: [ // some hardcoded policies...
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
import { IACryAction, IACryResource, IACryPrincipal, IACryFirewall, IACryFirewallGuard } from 'nestjs-iacry';

@Controller()
export class BookController {
  @IACryAction('book:update')
  @IACryResource('book:{params.id}') // {params.id} is replaced with req.params.id [OPTIONAL]
  @IACryPrincipal() // taken from req.user by default
  @UseGuards(JwtAuthGuard, IACryFirewallGuard)
  @Post('book/:id')
  async update(@Request() req) { }

  // ...or the definition above might be replaced with a shorthand...
  @IACryFirewall({ resource: 'book:{params.id}' })
  @UseGuards(JwtAuthGuard, IACryFirewallGuard)
  @Post('book/:id')
  async update(@Request() req) { }

  // ...you might also combine them...
  @IACryFirewall()
  @IACryResource('book:{params.id}')
  @UseGuards(JwtAuthGuard, IACryFirewallGuard)
  @Post('book/:id')
  async update(@Request() req) { }
}
```

> Important: check out the `FirewallOptions` definition below:
> ```typescript
> export interface FirewallOptions {
>   action?: Action, // default "book:update" for BookController.update()
>   resource?: Resource, // default "*"
>   principal?: Principal, // default REQUEST_USER
> }
> ```

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
let book: Book;

const attachedPoliciesCount = await firewall.attach(user, [
  // Allow any action on the book service
  { Effect: Effect.ALLOW, Action: 'book:*'},
  // allow updating any books to any user except the user with ID=7
  { Effect: Effect.DENY, Action: ['book:update', 'book:patch'], Principal: 'user:!7' },
  // deny deleting books to all users
  { Effect: Effect.DENY, Action: 'book:delete', Principal: ['user:*'] },
]);
const attachedPoliciesCount = await firewall.upsertBySid(
  'Some policy Sid (mainly a name)',
  user,
  [{ Sid: 'Some policy Sid (mainly a name)', Effect: Effect.ALLOW, Action: 'book:*'}],
);
// oneliner to allow user patching and updating but deleting the book
const attachedPoliciesCount = await firewall.grant('book:patch|update|!delete', user, book);
const policies = await firewall.retrieve(user);
const policies = await firewall.retrieveBySid('Some policy Sid (mainly a name)', user);
const deletedPoliciesCount = await firewall.reset(user);
```

Managing a policy by it's Sid might be useful when automating policy assignments.
E.g. granting `book:update|patch|delete` on books created by the user is possible by upserting
a system managed policy w/ the sid `system:user:book` as follows:

```typescript
import { IACryService, Effect } from 'nestjs-iacry';

let firewall: IACryService;
let user: User;
let newBook: Book;

const BOOK_SID = 'system:user:book';
let policies = await firewall.retrieveBySid(BOOK_SID, user);

if (policies.length > 0) {
  policies[0] = policies[0].toJSON();
  policies[0].Resource.push(newBook.toDynamicIdentifier());
} else {
  policies = [{
    Sid: BOOK_SID, // frankly speaking this is optional o_O...
    Effect: Effect.ALLOW,
    Action: 'book:update|patch|delete',
    Resource: [newBook.toDynamicIdentifier()],
  }];
}

await firewall.upsertBySid(BOOK_SID, user, policies);
```

### Documentation

#### Policy Definition

Structure:
```typescript
interface PolicyInterface {
  Sid?: string, // policy identifier
  Effect: 'Allow' | 'Deny', // Allow | Deny
  Action: string | { service: string, action: string } | Array<string | { service: string, action: string }>, // Which action: e.g. "book:update"
  Resource?: string | { entity: string, id: number | string } | Array<string | { entity: string, id: number | string }>, // Action object: e.g. "book:33"
  Principal?: string | { entity: string, id: number | string } | Array<string | { entity: string, id: number | string }>, // Whom: e.g. "user:1"
}
```

Syntax Sugar:

- **DIs might be negated** which would mean that a `book:!33` would match any book but the one with ID=33.
- **DIs might be piped/or-ed** which would mean that a `book:!(update|delete)` would allow any action BUT updating or deleting a book.
- **DIs might contain complex match patterns** which would mean that a principal `*/admin:!33` would match an admin user from any namespace but the one with ID=33.

> More information about how `micromatch` matches strings [can be found here](https://github.com/micromatch/micromatch#matching-features).

> Important: Within the matcher `*` is replaced with `**` automatically, thus a single `*` won't work as of original micromatch docs. 

**Dynamic Identifiers** or **DIs** are considered `Action`, `Resource` and `Principal` properties.

### Development

Running tests:
```bash
npm test
```

Releasing:
```bash
npm run format
npm run release # npm run patch|minor|major
npm run deploy
```

### TODO

- [ ] Implement an abstraction over the system managed policies
- [ ] Implement policy conditional statements (e.g. update books that the user created himself)
- [ ] Add more built in conditional matchers to cover basic use-cases
- [ ] Cover most of codebase w/ tests
- [ ] Add comprehensive Documentation

### Contributing

* [Alex Cucer](https://github.com/AlexanderC)

### License

MIT