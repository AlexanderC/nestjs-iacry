/** Modules **/
export { CoreModule as IACryModule } from './core.module';

/** Constants **/
export {
  SEQUELIZE_STORAGE,
  IOREDIS_CACHE,
  IS_ALLOWED,
  IS_ALLOWED_ANY,
  IS_ALLOWED_IMPLICIT,
} from './constants';
export { REQUEST_USER } from './decorators/constants';

/** Interfaces **/
export { Options as IACryModuleOptions } from './interfaces/module.options';
export { AsyncOptions as IACryModuleAsyncOptions } from './interfaces/module-async.options';
export { OptionsFactory as IACryModuleOptionsFactory } from './interfaces/module-options.factory';
export { PolicyStorage } from './interfaces/policy-storage';
export { MatcherResult } from './interfaces/matcher-result';
export {
  PolicyInterface,
  Effect,
  Action,
  ActionObject,
  Resource,
  ResourceObject,
  Principal,
  PrincipalObject,
  DynamicIdentifierItem,
  DynamicIdentifier,
  DynamicIdentifierVector,
} from './interfaces/policy';
export { Cache } from './storages/cache/cache.interface';

/** Services **/
export { CoreService as IACryService } from './core.service';

/** Models **/
export { PoliciesStorage as PoliciesStorageSequelizeModel } from './storages/sequelize/storage.model';

/** Decorators */
export { Entity as IACryEntity } from './decorators/entity';
export { Action as IACryAction } from './decorators/action';
export { Resource as IACryResource } from './decorators/resource';
export { Principal as IACryPrincipal } from './decorators/principal';
export { Firewall as IACryFirewall } from './decorators/firewall';
export { FirewallGuard as IACryFirewallGuard } from './decorators/firewall.guard';

/** Internals */
export { Policy } from './policy';
export { PolicyVector } from './policy-vector';
export { Matcher } from './matcher';
export { Firewall } from './firewall';

/** Errors */
export { BaseError as IACryError } from './errors/iacry.error';
export { DecoratorError as IACryDecoratorError } from './errors/decorator.error';
export { MissingPolicyProps } from './errors/missing-policy-props.error';
export { WrongPolicyPropFormat } from './errors/wrong-policy-prop-format.error';
