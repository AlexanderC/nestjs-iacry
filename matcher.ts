import {
  Effect, Action, Resource, Principal,
  ActionObject, ResourceObject, PrincipalObject,
  ACTION, RESOURCE, PRINCIPAL, NEGATION,
  DYNAMIC_IDENTIFIER_PROPS_MAPPING,
} from './interfaces/policy';
import { MatcherResult } from './interfaces/matcher-result';
import { Policy } from './policy';
import { PolicyVector } from './policy-vector';
import { Matcher as MatcherInterface } from './interfaces/matcher';
import { CoreHelper } from './helpers/core';

export class Matcher extends CoreHelper implements MatcherInterface {
  readonly NEGATION_REGEXP = new RegExp(`^\s*${NEGATION}`);

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

      const match = resourceMatch && actionMatch && principalMatch;

      if (match && policy.Effect === Effect.ALLOW) {
        result.allow.push(policy);
      } else if (match && policy.Effect === Effect.DENY) {
        result.deny.push(policy);
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
    return targets
      .map(target => this.matchDynamicIdentifier(source, target, prop))
      .filter(Boolean)
      .length === targets.length;
  }

  private matchDynamicIdentifier(
    source: ResourceObject | ActionObject | PrincipalObject,
    target: ActionObject | ResourceObject | PrincipalObject,
    prop: string,
  ): boolean {
    const matchProps = DYNAMIC_IDENTIFIER_PROPS_MAPPING[prop];

    return matchProps
      .map(key => this.matchItem(source[key], target[key]))
      .filter(Boolean)
      .length === matchProps.length;
  }

  private matchItem(rawSource: string, rawTarget: string): boolean {
    const source = this.strict ? rawSource : rawSource.toLowerCase();
    const target = this.strict ? rawTarget : rawTarget.toLowerCase();

    return source === Policy.ANY
      || target === Policy.ANY
      || this.matchSingle(source, target);
  }

  private matchSingle(source, target) {
    if (!this.isNegated(source) && !this.isNegated(target)) {
      return source === target;
    } else if (this.isNegated(source) && this.isNegated(target)) {
      return this.extractNegated(source) === this.extractNegated(target);
    } else if (this.isNegated(source)) {
      return this.extractNegated(source) !== target;
    } else {
      return source !== this.extractNegated(target);
    }
  }

  private extractNegated(rawValue: string): string {
    return rawValue.replace(this.NEGATION_REGEXP, '');
  }

  private isNegated(rawValue: string): boolean {
    return this.NEGATION_REGEXP.test(rawValue);
  }
}