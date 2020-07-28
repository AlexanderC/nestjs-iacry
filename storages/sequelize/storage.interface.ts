import { PrincipalObject, PolicyInterface } from '../../interfaces/policy';

export interface Storage {
  savePrincipalPolicies(principal: PrincipalObject, rawPolicies: Array<string | PolicyInterface>, attach?: boolean): Promise<number>;
  findByPrincipal(principal: PrincipalObject): Promise<Array<string>>;
  destroyByPrincipal(principal: PrincipalObject): Promise<number>;
}