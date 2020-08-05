import { BaseError } from './iacry.error';
import { PolicyInterface, REQUIRED_PROPS } from '../interfaces/policy';
import { CoreHelper } from '../helpers/core';

export class MissingPolicyProps extends BaseError {
  constructor(policy: PolicyInterface, ...props) {
    super(
      `Missing required properties >> ${props.join(
        ', ',
      )}\nFrom: ${CoreHelper.encode(policy, true)}`,
    );
  }

  static assert(policy: PolicyInterface) {
    const missingProps = [];

    for (const prop of REQUIRED_PROPS) {
      if (!policy.hasOwnProperty(prop)) {
        missingProps.push(prop);
      }
    }

    if (missingProps.length > 0) {
      throw new this(policy, missingProps);
    }
  }
}
