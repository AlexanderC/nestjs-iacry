import { BaseError } from './iacry.error';
import { PolicyInterface, ANY, DELIMITER } from '../interfaces/policy';

export class WrongPolicyPropFormat extends BaseError {
  constructor(
    policy: PolicyInterface,
    prop: string,
    formatVector: Array<string | ANY>,
  ) {
    super(
      `Wrong policy property format for ${prop}\nExpected: "${formatVector.join(
        DELIMITER,
      )}"\nFrom: ${JSON.stringify(policy)}`,
    );
  }
}
