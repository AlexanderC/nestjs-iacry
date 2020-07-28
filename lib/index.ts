/** Modules **/
export { CoreModule as IACryModule } from './iacry.module';

/** Constants **/
export {
  SEQUELIZE_STORAGE,
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

/** Services **/
export { CoreService as IACryService } from './iacry.service';

/** Models **/
export { PoliciesStorage as PoliciesStorageSequelizeModel } from './storages/sequelize/storage.model';

/** Decorators */
export { Entity as IACryEntity } from './decorators/entity';
export { Action as IACryAction } from './decorators/action';
export { Resource as IACryResource } from './decorators/resource';
export { Principal as IACryPrincipal } from './decorators/principal';
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
