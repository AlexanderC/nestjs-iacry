import * as micromatch from 'micromatch';
import {
  Effect,
  Action,
  Resource,
  Principal,
  ActionObject,
  ResourceObject,
  PrincipalObject,
  ACTION,
  RESOURCE,
  PRINCIPAL,
  DYNAMIC_IDENTIFIER_PROPS_MAPPING,
  ANY,
} from './interfaces/policy';
import { MatcherResult } from './interfaces/matcher-result';
import { PolicyVector } from './policy-vector';
import { Matcher as MatcherInterface } from './interfaces/matcher';
import { CoreHelper } from './helpers/core';

export class Matcher extends CoreHelper implements MatcherInterface {
  constructor(public readonly strict = false) {
    super();
  }

  match(
    rawResource: Resource | ResourceObject,
    rawAction: Action | ActionObject,
    rawPrincipal: Principal | PrincipalObject,
    policies: PolicyVector,
  ): MatcherResult {
    const resource = this.normalizeDynamicIdentifier(rawResource, RESOURCE);
    const action = this.normalizeDynamicIdentifier(rawAction, ACTION);
    const principal = this.normalizeDynamicIdentifier(rawPrincipal, PRINCIPAL);

    let result = <MatcherResult>{
      allow: [],
      deny: [],
      abstain: [],
    };

    for (const policy of policies) {
      const resourceMatch = this.matchDynamicIdentifierVector(
        resource,
        <Array<ResourceObject>>policy.property(RESOURCE),
        RESOURCE,
      );
      const actionMatch = this.matchDynamicIdentifierVector(
        action,
        <Array<ActionObject>>policy.property(ACTION),
        ACTION,
      );
      const principalMatch = this.matchDynamicIdentifierVector(
        principal,
        <Array<PrincipalObject>>policy.property(PRINCIPAL),
        PRINCIPAL,
      );

      if (resourceMatch && actionMatch && principalMatch) {
        switch (policy.Effect) {
          case Effect.ALLOW:
            result.allow.push(policy);
            break;
          case Effect.DENY:
          default: // something went extremely wrong o_O
            result.deny.push(policy);
        }
      } else {
        result.abstain.push(policy);
      }
    }

    return result;
  }

  private matchDynamicIdentifierVector(
    source: ResourceObject | ActionObject | PrincipalObject,
    targets: Array<ActionObject | ResourceObject | PrincipalObject>,
    prop: string,
  ): boolean {
    // match anything if the policy doesn't specify any rules
    if (targets.length <= 0) {
      return true;
    }

    return (
      targets
        .map((target) => this.matchDynamicIdentifier(source, target, prop))
        // match any of the element of action or resource or principal
        .filter(Boolean).length > 0
    );
  }

  private matchDynamicIdentifier(
    source: ResourceObject | ActionObject | PrincipalObject,
    target: ActionObject | ResourceObject | PrincipalObject,
    prop: string,
  ): boolean {
    const matchProps = DYNAMIC_IDENTIFIER_PROPS_MAPPING[prop];

    return (
      matchProps
        .map((key) => this.matchItem(source[key], target[key]))
        .filter(Boolean).length === matchProps.length
    );
  }

  private matchItem(
    rawSource: string | number | ANY,
    rawTarget: string | number | ANY,
  ): boolean {
    return micromatch.isMatch(
      this.normalizeValue(rawSource, true),
      this.normalizeValue(rawTarget),
    ) || micromatch.isMatch(
      this.normalizeValue(rawTarget, true),
      this.normalizeValue(rawSource),
    );
  }

  private normalizeValue(rawValue: string | number | ANY, raw: boolean = false): string {
    let value = rawValue.toString();

    if (!this.strict) {
      value = value.toLowerCase();
    }

    return raw ? value : value.replace(new RegExp(
      `\\${Matcher.ANY}+`
    ), Matcher.ANY.repeat(2));
  }
}
