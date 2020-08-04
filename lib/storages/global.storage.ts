import { PrincipalObject } from '../interfaces/policy';
import { PolicyStorage } from '../interfaces/policy-storage';
import { PolicyInterface } from '../interfaces/policy';
import { BaseError } from '../errors/iacry.error';

export class GlobalStorage implements PolicyStorage {
  readonly readonly: boolean = true;

  constructor(public readonly policies = <Array<string | PolicyInterface>>[]) {}

  async fetch(
    _principal: PrincipalObject,
  ): Promise<Array<string | PolicyInterface>> {
    return this.policies;
  }

  async fetchBySid(
    _sid: string,
    _principal: PrincipalObject,
  ): Promise<Array<string | PolicyInterface>> {
    return []; // to avoid conflicts
  }

  async save(
    _principal: PrincipalObject,
    _rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number> {
    throw this.DisallowedException('save');
  }

  async add(
    _principal: PrincipalObject,
    _rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number> {
    throw this.DisallowedException('add');
  }

  async purge(_principal: PrincipalObject): Promise<number> {
    throw this.DisallowedException('purge');
  }

  saveBySid(
    _sid: string,
    _principal: PrincipalObject,
    _rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number> {
    throw this.DisallowedException('saveBySid');
  }

  private DisallowedException(method: string): BaseError {
    return new BaseError(
      `PolicyInterface Storage method ${method}() invocation not allowed`,
    );
  }
}
