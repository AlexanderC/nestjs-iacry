import { PrincipalObject } from '../interfaces/policy';
import { PolicyStorage } from '../interfaces/policy-storage';
import { PolicyInterface } from '../interfaces/policy';
import { Storage } from './sequelize/storage.interface';

export class SequelizeStorage implements PolicyStorage {
  readonly readonly: boolean = false;

  constructor(private readonly storageRepository: Storage | any) {}

  async fetch(
    principal: PrincipalObject,
  ): Promise<Array<string | PolicyInterface>> {
    return this.repository.findByPrincipal(principal);
  }

  async save(
    principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number> {
    return this.repository.savePrincipalPolicies(
      principal,
      rawPolicies,
      /*attach =*/ false,
    );
  }

  async add(
    principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number> {
    return this.repository.savePrincipalPolicies(principal, rawPolicies);
  }

  async purge(principal: PrincipalObject): Promise<number> {
    return this.repository.destroyByPrincipal(principal);
  }

  get repository(): Storage {
    if (!this.isStorageModel(this.storageRepository)) {
      throw new TypeError(
        'Policies repository must extend Sequelize PoliciesStorage model',
      );
    }

    return this.storageRepository;
  }

  protected isStorageModel(x: any): x is Storage {
    return (
      typeof x === 'function' &&
      typeof (x as Storage).findByPrincipal === 'function' &&
      typeof (x as Storage).savePrincipalPolicies === 'function' &&
      typeof (x as Storage).destroyByPrincipal === 'function'
    );
  }
}
