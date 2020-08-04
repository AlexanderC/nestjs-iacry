import { PolicyInterface, PrincipalObject } from './policy';

export interface PolicyStorage {
  readonly readonly: boolean;
  fetch(principal: PrincipalObject): Promise<Array<string | PolicyInterface>>;
  save(
    principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number>;
  add(
    principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number>;
  purge(principal: PrincipalObject): Promise<number>;
  fetchBySid(
    sid: string,
    principal: PrincipalObject,
  ): Promise<Array<string | PolicyInterface>>;
  saveBySid(
    sid: string,
    principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number>;
}
