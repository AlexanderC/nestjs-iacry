import { PrincipalObject, PolicyInterface } from '../../interfaces/policy';

export interface Storage {
  savePrincipalPolicies(
    principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
    attach?: boolean,
  ): Promise<number>;
  savePrincipalPolicyBySid(
    principal: PrincipalObject,
    sid: string,
    rawPolicy: string | PolicyInterface,
  ): Promise<number>;
  findByPrincipal(
    principal: PrincipalObject,
    sid?: string,
  ): Promise<Array<string>>;
  destroyByPrincipal(principal: PrincipalObject): Promise<number>;
}
