import {
  Action,
  Resource,
  Principal,
  PRINCIPAL,
  ActionObject,
  ResourceObject,
  PrincipalObject,
} from './interfaces/policy';
import { MatcherResult } from './interfaces/matcher-result';
import { Matcher } from './matcher';
import { GlobalStorage } from './storages/global.storage';
import { PolicyVector } from './policy-vector';
import { Matcher as MatcherInterface } from './interfaces/matcher';
import { PolicyStorage } from './interfaces/policy-storage';
import { CoreHelper } from './helpers/core';

export class Firewall extends CoreHelper {
  constructor(
    public readonly storage: PolicyStorage,
    public readonly matcher: MatcherInterface,
  ) {
    super();
  }

  static create(storage?: PolicyStorage, matcher?: MatcherInterface): Firewall {
    return new this(storage || new GlobalStorage(), matcher || new Matcher());
  }

  async isAllowed(
    rawResource: Resource | ResourceObject,
    rawAction: Action | ActionObject,
    rawPrincipal: Principal | PrincipalObject,
  ): Promise<boolean> {
    const resolution = await this.resolve(rawResource, rawAction, rawPrincipal);
    return resolution.allow.length > 0 && resolution.deny.length <= 0;
  }

  async isAllowedAny(
    rawResource: Resource | ResourceObject,
    rawAction: Action | ActionObject,
    rawPrincipal: Principal | PrincipalObject,
  ): Promise<boolean> {
    const resolution = await this.resolve(rawResource, rawAction, rawPrincipal);
    return resolution.allow.length > 0;
  }

  async isAllowedImplicit(
    rawResource: Resource | ResourceObject,
    rawAction: Action | ActionObject,
    rawPrincipal: Principal | PrincipalObject,
  ): Promise<boolean> {
    const resolution = await this.resolve(rawResource, rawAction, rawPrincipal);
    return resolution.deny.length <= 0;
  }

  protected async resolve(
    rawResource: Resource | ResourceObject,
    rawAction: Action | ActionObject,
    rawPrincipal: Principal | PrincipalObject,
  ): Promise<MatcherResult> {
    const principal = <PrincipalObject>(
      this.normalizeDynamicIdentifier(rawPrincipal, PRINCIPAL)
    );
    const rawPolicies = await this.storage.fetch(principal);
    const policies = PolicyVector.create(...rawPolicies);

    return this.matcher.match(rawResource, rawAction, principal, policies);
  }
}
