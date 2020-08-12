import { CoreHelper } from './helpers/core';
import { PolicyStorage } from './interfaces/policy-storage';
import {
  PolicyInterface,
  Action,
  ActionObject,
  Resource,
  ResourceObject,
  Principal,
  PrincipalObject,
  PRINCIPAL,
  ACTION,
  RESOURCE,
  EFFECT,
  Effect,
  SID,
} from './interfaces/policy';
import { Entity } from './decorators/entity';

export class PolicyManager extends CoreHelper {
  constructor(protected storage?: PolicyStorage) {
    super();
  }

  public setStorage(storage: PolicyStorage): PolicyManager {
    this.storage = storage;
    return this;
  }

  /**
   * Will attach policies to principal
   *
   * @use reset(
   *        'user:1' | { entity: 'user', id: 1 } | new UserModel(id=1):@\Entity,
   *        [{ Sid: 'somePolicyName', Effect: Effect.ALLOW, Action: 'book:*'}]:Array<PolicyInterface>,
   *      )
   */
  async attach(
    rawPrincipal: Principal | PrincipalObject | Entity | object,
    rawPolicies?: Array<string | PolicyInterface>,
  ): Promise<number> {
    const principal = <PrincipalObject>(
      this.normalizeDynamicObject(rawPrincipal, PRINCIPAL)
    );
    return this.storage.add(principal, rawPolicies);
  }

  /**
   * Will replace all principal policies with these ones
   *
   * @use reset(
   *        'user:1' | { entity: 'user', id: 1 } | new UserModel(id=1):@\Entity,
   *        [{ Sid: 'somePolicyName', Effect: Effect.ALLOW, Action: 'book:*'}]:Array<PolicyInterface>,
   *      )
   */
  async reset(
    rawPrincipal: Principal | PrincipalObject | Entity | object,
    rawPolicies?: Array<string | PolicyInterface>,
  ): Promise<number> {
    const principal = <PrincipalObject>(
      this.normalizeDynamicObject(rawPrincipal, PRINCIPAL)
    );
    return rawPolicies
      ? this.storage.save(principal, rawPolicies)
      : this.storage.purge(principal);
  }

  /**
   * @use retrieve(
   *        'user:1' | { entity: 'user', id: 1 } | new UserModel(id=1):@\Entity,
   *      )
   */
  async retrieve(
    rawPrincipal: Principal | PrincipalObject | Entity | object,
  ): Promise<Array<PolicyInterface>> {
    const principal = <PrincipalObject>(
      this.normalizeDynamicObject(rawPrincipal, PRINCIPAL)
    );
    const rawPolicies = await this.storage.fetch(principal);
    return rawPolicies.map((rawPolicy) =>
      typeof rawPolicy === 'string' ? CoreHelper.decode(rawPolicy) : rawPolicy,
    );
  }

  /**
   * @use retrieveBySid(
   *        'somePolicyName',
   *        'user:1' | { entity: 'user', id: 1 } | new UserModel(id=1):@\Entity,
   *      )
   */
  async retrieveBySid(
    sid: string,
    rawPrincipal: Principal | PrincipalObject | Entity | object,
  ): Promise<Array<PolicyInterface>> {
    const principal = <PrincipalObject>(
      this.normalizeDynamicObject(rawPrincipal, PRINCIPAL)
    );
    const rawPolicies = await this.storage.fetchBySid(sid, principal);
    return rawPolicies.map((rawPolicy) =>
      typeof rawPolicy === 'string' ? CoreHelper.decode(rawPolicy) : rawPolicy,
    );
  }

  /**
   * @use upsertBySid(
   *        'somePolicyName',
   *        'user:1' | { entity: 'user', id: 1 } | new UserModel(id=1):@\Entity,
   *        [{ Sid: 'somePolicyName', Effect: Effect.ALLOW, Action: 'book:*'}]:Array<PolicyInterface>,
   *      )
   */
  async upsertBySid(
    sid: string,
    rawPrincipal: Principal | PrincipalObject | Entity | object,
    rawPolicies?: Array<string | PolicyInterface>,
  ): Promise<number> {
    const principal = <PrincipalObject>(
      this.normalizeDynamicObject(rawPrincipal, PRINCIPAL)
    );
    return this.storage.saveBySid(sid, principal, rawPolicies);
  }

  /**
   * @use grant(
   *        'book:update' | { service: 'book', action: 'update' },
   *        'user:1' | { entity: 'user', id: 1 } | new UserModel(id=1):@\Entity,
   *        'book:33' | { entity: 'book', id: 33 } | new BookModel(id=33):@\Entity,
   *      )
   *      grant(
   *        'book:update' | { service: 'book', action: 'update' },
   *        'user:1' | { entity: 'user', id: 1 } | new UserModel(id=1):@\Entity,
   *        'book:33' | { entity: 'book', id: 33 } | new BookModel(id=33):@\Entity,
   *        Effect.DENY,
   *        'DenyUpdatingBook33ByUser1',
   *      )
   */
  async grant(
    rawAction: Action | ActionObject, // e.g. book:update
    rawPrincipal: Principal | PrincipalObject | Entity | object, // e.g. user:1
    rawResource: Resource | ResourceObject | Entity | object = CoreHelper.ANY, // e.g. book:1
    effect: Effect = Effect.ALLOW,
    sid?: string,
  ): Promise<number> {
    const resource = <Resource | ResourceObject>(
      this.normalizeDynamicObject(rawResource)
    );
    const principal = <Principal | PrincipalObject>(
      this.normalizeDynamicObject(rawPrincipal)
    );
    const policy = {
      [SID]: sid,
      [EFFECT]: effect,
      [ACTION]: rawAction,
      [RESOURCE]: resource,
      [PRINCIPAL]: principal,
    };

    return this.attach(rawPrincipal, [policy]);
  }
}
