import { Injectable, Inject } from '@nestjs/common';
import { Firewall } from './firewall';
import { PolicyStorage } from './interfaces/policy-storage';
import { SequelizeStorage } from './storages/sequelize.storage';
import { MultipleStorage } from './storages/multiple.storage';
import { GlobalStorage } from './storages/global.storage';
import { BaseError } from './errors/iacry.error';
import { Matcher } from './matcher';
import { Options } from './interfaces/module.options';
import {
  IACRY_OPTIONS,
  SEQUELIZE_STORAGE,
  IOREDIS_CACHE,
  IS_ALLOWED,
  IS_ALLOWED_ANY,
  IS_ALLOWED_IMPLICIT,
} from './constants';
import {
  Action,
  ActionObject,
  Resource,
  ResourceObject,
  Principal,
  PrincipalObject,
} from './interfaces/policy';
import { CoreHelper } from './helpers/core';
import { Entity, isEntity, toDynamicIdentifier } from './decorators/entity';
import { Cache } from './storages/cache/cache.interface';
import { IoRedis } from './storages/cache/ioredis';
import { CachedStorage } from './storages/cached.storage';
import { PolicyManager } from './policy.manager';

@Injectable()
export class CoreService extends PolicyManager {
  private firewall: Firewall;

  constructor(@Inject(IACRY_OPTIONS) private readonly options: Options) {
    super(new MultipleStorage());
    this.setup(options);
  }

  /**
   * @use isGranted(
   *        'book:update' | { service: 'book', action: 'update' },
   *        'user:1' | { entity: 'user', id: 1 } | new UserModel(id=1):@\Entity,
   *        'book:33' | { entity: 'book', id: 33 } | new BookModel(id=33):@\Entity,
   *      )
   */
  async isGranted(
    rawAction: Action | ActionObject, // e.g. book:update
    rawPrincipal: Principal | PrincipalObject | Entity | object, // e.g. user:1
    rawResource: Resource | ResourceObject | Entity | object = CoreHelper.ANY, // e.g. book:1
    rule = IS_ALLOWED,
  ): Promise<boolean> {
    switch (rule) {
      case IS_ALLOWED:
      case IS_ALLOWED_ANY:
      case IS_ALLOWED_IMPLICIT:
        break;
      default:
        throw new BaseError(`Unrecognized firewall rule: ${rule}`);
    }

    const resource = <Resource | ResourceObject>(
      this.normalizeDynamicObject(rawResource)
    );
    const principal = <Principal | PrincipalObject>(
      this.normalizeDynamicObject(rawPrincipal)
    );

    return this.firewall[rule](resource, rawAction, principal);
  }

  protected setup(options: Options): void {
    // initialize persistent storage
    if (options.storage) {
      switch (typeof options.storage) {
        case 'string':
          switch (options.storage.toLowerCase()) {
            case SEQUELIZE_STORAGE:
              (this.storage as MultipleStorage).storages.push(
                new SequelizeStorage(options.storageRepository),
              );
              break;
            default:
              throw new BaseError(
                `Unrecognized PolicyInterface Storage type: ${options.storage}`,
              );
          }
          break;
        default:
          (this.storage as MultipleStorage).storages.push(
            <PolicyStorage>options.storage,
          );
      }
    }

    // initialize global storage
    if (options.policies) {
      (this.storage as MultipleStorage).storages.push(
        new GlobalStorage(options.policies),
      );
    }

    if (options.cache) {
      let cache: Cache;

      switch (typeof options.cache) {
        case 'string':
          switch (options.cache.toLowerCase()) {
            case IOREDIS_CACHE:
              cache = new IoRedis(options.cacheClient);
              break;
            default:
              throw new BaseError(
                `Unrecognized PolicyCache type: ${options.cache}`,
              );
          }
          break;
        default:
          cache = <Cache>options.cache;
      }

      this.setStorage(
        new CachedStorage(this.storage, cache, options.cacheOptions),
      );
    }

    this.firewall = Firewall.create(this.storage, new Matcher(options.strict));
  }
}
