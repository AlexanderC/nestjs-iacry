import { BaseError } from './iacry.error';
import { PolicyInterface, REQUIRED_PROPS } from '../interfaces/policy';

export class MissingPolicyProps extends BaseError {
  constructor(policy: PolicyInterface, ...props) {
    super(`Missing required properties >> ${props.join(', ')}\nFrom: ${JSON.stringify(policy)}`);
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