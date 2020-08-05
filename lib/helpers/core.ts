import {
  PolicyInterface,
  Action,
  Resource,
  Principal,
  ActionObject,
  ResourceObject,
  PrincipalObject,
  DynamicIdentifier,
  DynamicIdentifierItem,
  DynamicIdentifierVector,
  ANY,
  DELIMITER,
  DYNAMIC_IDENTIFIER_PROPS_MAPPING,
} from '../interfaces/policy';
import { WrongPolicyPropFormat } from '../errors/wrong-policy-prop-format.error';

export abstract class CoreHelper {
  static readonly ANY = <ANY>'*';

  public static encode(
    policy: PolicyInterface,
    beatify: boolean = false,
  ): string {
    return beatify
      ? JSON.stringify(policy, null, '  ')
      : JSON.stringify(policy);
  }

  public static decode(rawPolicy: string): PolicyInterface {
    return JSON.parse(rawPolicy);
  }

  public isDynamicVector(
    x:
      | DynamicIdentifier<Action | Resource | Principal>
      | DynamicIdentifierVector<Action | Resource | Principal>,
  ): x is DynamicIdentifierVector<Action | Resource | Principal> {
    return Array.isArray(x);
  }

  public isDynamicItem(
    x: DynamicIdentifier<Action | Resource | Principal>,
  ): x is DynamicIdentifierItem<Action | Resource | Principal> {
    return (
      typeof x === 'object' &&
      typeof (x as DynamicIdentifierItem<Action | Resource | Principal>)
        .parse === 'function' &&
      'value' in x
    );
  }

  public parseDynamicIdentifier(
    rawPolicy: PolicyInterface | any,
    prop: string,
    value: string | ANY,
  ): ActionObject | ResourceObject | PrincipalObject {
    const assignmentsVector = DYNAMIC_IDENTIFIER_PROPS_MAPPING[prop];
    let valuesVector = value
      .split(DELIMITER)
      .map((x) => x.trim())
      .map((x) => (x.length <= 0 ? CoreHelper.ANY : x));

    if (assignmentsVector.length < valuesVector.length) {
      throw new WrongPolicyPropFormat(rawPolicy, prop, assignmentsVector);
    } else if (valuesVector.length < assignmentsVector.length) {
      // fill in missing props with '*'
      valuesVector = [
        ...valuesVector,
        ...new Array(assignmentsVector.length - valuesVector.length).fill(
          CoreHelper.ANY,
        ),
      ];
    }

    const identifierObject = <
      ActionObject | ResourceObject | PrincipalObject
    >{};

    for (const i in assignmentsVector) {
      const itemAssignment = assignmentsVector[i];
      const itemValue = valuesVector[i];
      identifierObject[itemAssignment] = itemValue;
    }

    return identifierObject;
  }

  public normalizeDynamicIdentifier(
    thing:
      | Resource
      | ResourceObject
      | Action
      | ActionObject
      | Principal
      | PrincipalObject,
    prop: string,
  ): ActionObject | ResourceObject | PrincipalObject {
    if (typeof thing === 'string') {
      return this.parseDynamicIdentifier({ [prop]: thing }, prop, thing);
    }

    return thing;
  }
}
