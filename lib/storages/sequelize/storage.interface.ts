import { PrincipalObject, PolicyInterface } from '../../interfaces/policy';

export interface Storage {
  savePrincipalPolicies(
    principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
    attach?: boolean,
    sid?: string,
  ): Promise<number>;
  findByPrincipal(
    principal: PrincipalObject,
    sid?: string,
  ): Promise<Array<string>>;
  destroyByPrincipal(principal: PrincipalObject, sid?: string): Promise<number>;
}
