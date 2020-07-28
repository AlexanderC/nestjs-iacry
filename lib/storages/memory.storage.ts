import { PrincipalObject } from '../interfaces/policy';
import { PolicyStorage } from '../interfaces/policy-storage';
import { PolicyInterface } from '../interfaces/policy';

export class MemoryStorage implements PolicyStorage {
  readonly readonly: boolean = false;

  constructor(public policies = <Array<string | PolicyInterface>>[]) {}

  async fetch(
    _principal: PrincipalObject,
  ): Promise<Array<string | PolicyInterface>> {
    return this.policies;
  }

  async save(
    _principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number> {
    this.policies = rawPolicies;

    return rawPolicies.length;
  }

  async add(
    _principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number> {
    this.policies.concat(rawPolicies);

    return rawPolicies.length;
  }

  async purge(_principal: PrincipalObject): Promise<number> {
    const length = this.policies.length;
    this.policies = [];

    return length;
  }
}
