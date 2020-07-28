import { PrincipalObject } from '../interfaces/policy';
import { PolicyStorage } from '../interfaces/policy-storage';
import { PolicyInterface } from '../interfaces/policy';

export class MultipleStorage implements PolicyStorage {
  readonly readonly: boolean = false;

  constructor(public storages: Array<PolicyStorage> = []) {}

  async fetch(principal: PrincipalObject): Promise<Array<string | PolicyInterface>> {
    const result = await Promise.all(
      this.storages.map(storage => storage.fetch(principal)),
    );

    return result.reduce((accumulator: Array<string | PolicyInterface>, current: Array<string | PolicyInterface>) => {
      return accumulator.concat(...current);
    });
  }

  async save(principal: PrincipalObject, rawPolicies: Array<string | PolicyInterface>): Promise<number> {
    const result = await Promise.all(
      this.storages
        .filter(storage => !storage.readonly)
        .map(storage => storage.save(principal, rawPolicies)),
    );

    return result.reduce((accumulator: number, current: number) => {
      return Math.min(accumulator, current);
    });
  }

  async add(principal: PrincipalObject, rawPolicies: Array<string | PolicyInterface>): Promise<number> {
    const result = await Promise.all(
      this.storages
        .filter(storage => !storage.readonly)
        .map(storage => storage.add(principal, rawPolicies)),
    );

    return result.reduce((accumulator: number, current: number) => {
      return Math.min(accumulator, current);
    });
  }

  async purge(principal: PrincipalObject): Promise<number> {
    const result = await Promise.all(
      this.storages
        .filter(storage => !storage.readonly)
        .map(storage => storage.purge(principal)),
    );

    return result.reduce((accumulator: number, current: number) => {
      return Math.max(accumulator, current);
    });
  }
}