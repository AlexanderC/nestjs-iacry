import * as clone from 'clone';
import {
  PolicyInterface,
  Effect,
  Action,
  Resource,
  Principal,
  ActionObject,
  ResourceObject,
  PrincipalObject,
  DynamicIdentifier,
  DynamicIdentifierVector,
  DYNAMIC_IDENTIFIER_PROPS,
} from './interfaces/policy';
import { CoreHelper } from './helpers/core';
import { MissingPolicyProps } from './errors/missing-policy-props.error';

/**
 * @todo Move serialization to an abstraction
 */
export class Policy extends CoreHelper implements PolicyInterface {
  readonly Sid: string;
  readonly Effect: Effect;
  readonly Action: DynamicIdentifier<Action> | DynamicIdentifierVector<Action>;
  readonly Resource:
    | DynamicIdentifier<Resource>
    | DynamicIdentifierVector<Resource>;
  readonly Principal:
    | DynamicIdentifier<Principal>
    | DynamicIdentifierVector<Principal>;

  constructor(rawPolicy: string | PolicyInterface) {
    super();
    let policy = <PolicyInterface>{};

    if (typeof rawPolicy === 'string') {
      policy = Policy.decode(rawPolicy);
    } else {
      policy = clone(rawPolicy);
    }

    this.normalizePolicyDynamicIdentifiers(policy);
    MissingPolicyProps.assert(policy);
    Object.assign(this, policy);
  }

  property(
    prop: string,
  ): string | Effect | Array<ActionObject | ResourceObject | PrincipalObject> {
    if (DYNAMIC_IDENTIFIER_PROPS.includes(prop)) {
      if (!this.isDynamicVector(this[prop])) {
        if (!this.isDynamicItem(this[prop])) {
          // supposably an empty property
          return [];
        }
        return [this[prop].parse()];
      }

      return this[prop].map((item) => item.parse());
    }

    return this[prop];
  }

  toJSON(parse = false): PolicyInterface {
    const { Sid, Effect, Action, Resource, Principal } = this;
    const rawPolicy = clone({ Sid, Effect, Action, Resource, Principal });

    if (parse) {
      this.unpackPolicyDynamicIdentifiers(rawPolicy);
    } else {
      this.removePolicyDynamicIdentifiers(rawPolicy);
    }

    return rawPolicy;
  }

  protected unpackPolicyDynamicIdentifiers(rawPolicy: PolicyInterface): void {
    for (const prop of DYNAMIC_IDENTIFIER_PROPS) {
      if (this.isDynamicVector(rawPolicy[prop])) {
        for (const i in rawPolicy[prop]) {
          if (this.isDynamicItem(rawPolicy[prop][i])) {
            rawPolicy[prop][i] = rawPolicy[prop][i].parse();
          }
          continue;
        }
        continue;
      }

      if (this.isDynamicItem(rawPolicy[prop])) {
        rawPolicy[prop] = rawPolicy[prop].parse();
      }
    }
  }

  protected removePolicyDynamicIdentifiers(rawPolicy: PolicyInterface): void {
    for (const prop of DYNAMIC_IDENTIFIER_PROPS) {
      if (this.isDynamicVector(rawPolicy[prop])) {
        for (const i in rawPolicy[prop]) {
          if (this.isDynamicItem(rawPolicy[prop][i])) {
            rawPolicy[prop][i] = rawPolicy[prop][i].value;
          }
          continue;
        }
        continue;
      }

      if (this.isDynamicItem(rawPolicy[prop])) {
        rawPolicy[prop] = rawPolicy[prop].value;
      }
    }
  }

  protected normalizePolicyDynamicIdentifiers(
    rawPolicy: PolicyInterface,
  ): void {
    const self = this;

    for (const prop of DYNAMIC_IDENTIFIER_PROPS) {
      if (!rawPolicy.hasOwnProperty(prop)) {
        continue;
      }

      if (this.isDynamicVector(rawPolicy[prop])) {
        for (const i in rawPolicy[prop]) {
          if (this.isDynamicItem(rawPolicy[prop][i])) {
            continue;
          }

          rawPolicy[prop][i] = {
            value: rawPolicy[prop][i].toString(),
            parse(): ActionObject | ResourceObject | PrincipalObject {
              return self.parseDynamicIdentifier(rawPolicy, prop, this.value);
            },
          };
        }
        continue;
      }

      if (this.isDynamicItem(rawPolicy[prop])) {
        continue;
      }

      rawPolicy[prop] = {
        value: rawPolicy[prop].toString(),
        parse(): ActionObject | ResourceObject | PrincipalObject {
          return self.parseDynamicIdentifier(rawPolicy, prop, this.value);
        },
      };
    }
  }
}
