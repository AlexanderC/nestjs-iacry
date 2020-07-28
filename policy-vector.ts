import { Policy } from './policy';
import { PolicyInterface } from './interfaces/policy';

export class PolicyVector extends Array<Policy> {
  constructor(policies: Array<Policy>) {
    super();
    Object.setPrototypeOf(this, Array.prototype);
    Object.defineProperty(this, 'toJSON', {
      value: PolicyVector.prototype.toJSON.bind(this),
      writable: false,
    });
    this.push(...policies);
  }
  
  toJSON(): Array<PolicyInterface> {
    return this.map(policy => policy.toJSON());
  }

  static create(...rawPolicies: Array<string | PolicyInterface | Policy>): PolicyVector {
    const policies = <Array<Policy>>[];

    for (const rawPolicy of rawPolicies) {
      if (rawPolicy instanceof Policy) {
        policies.push(rawPolicy);
      } else {
        policies.push(new Policy(rawPolicy));
      }
    }

    return new this(policies);
  }
}
