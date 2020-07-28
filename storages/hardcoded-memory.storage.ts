import { PrincipalObject } from '../interfaces/policy';
import { PolicyStorage } from '../interfaces/policy-storage';
import { PolicyInterface } from '../interfaces/policy';
import { BaseError } from '../errors/iacry.error';

export class HardcodedMemoryStorage implements PolicyStorage {
  readonly readonly: boolean = true;

  constructor(public readonly policies = <Array<string | PolicyInterface>>[]) {}

  async fetch(_principal: PrincipalObject): Promise<Array<string | PolicyInterface>> {
    return this.policies;
  }

  async save(_principal: PrincipalObject, _rawPolicies: Array<string | PolicyInterface>): Promise<number> {
    return this.disallowedException('save');
  }

  async add(_principal: PrincipalObject, _rawPolicies: Array<string | PolicyInterface>): Promise<number> {
    return this.disallowedException('add');
  }

  async purge(_principal: PrincipalObject): Promise<number> {
    return this.disallowedException('purge');
  }

  private disallowedException(method: string): number {
    throw new BaseError(` PolicyInterface Storage method ${method}() invocation not allowed`);
  }
}