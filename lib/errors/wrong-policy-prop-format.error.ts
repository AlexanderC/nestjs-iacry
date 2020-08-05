import { BaseError } from './iacry.error';
import { PolicyInterface, ANY, DELIMITER } from '../interfaces/policy';
import { CoreHelper } from '../helpers/core';

export class WrongPolicyPropFormat extends BaseError {
  constructor(
    policy: PolicyInterface,
    prop: string,
    formatVector: Array<string | ANY>,
  ) {
    super(
      `Wrong policy property format for ${prop}\nExpected: "${formatVector.join(
        DELIMITER,
      )}"\nFrom: ${CoreHelper.encode(policy, true)}`,
    );
  }
}
