import { PrincipalObject } from '../interfaces/policy';
import { PolicyStorage } from '../interfaces/policy-storage';
import { PolicyInterface } from '../interfaces/policy';
import { Cache } from './cache/cache.interface';
import { CacheError } from './cache/cache.error';

export interface CachedStorageOptions {
  expire?: number; // in seconds
  prefix?: string;
}

export class CachedStorage implements PolicyStorage {
  readonly readonly: boolean = false;
  readonly DEFAULT_OPTIONS = <CachedStorageOptions>{
    expire: 3600, // 1 hour
    prefix: 'IACRY_PCACHE/',
  };

  constructor(
    public readonly storage: PolicyStorage,
    public readonly cache: Cache,
    public options?: CachedStorageOptions,
  ) {
    if (!options) {
      this.options = this.DEFAULT_OPTIONS;
    }

    this.options = !options
      ? this.DEFAULT_OPTIONS
      : Object.assign({}, this.DEFAULT_OPTIONS, this.options);
  }

  async fetch(
    principal: PrincipalObject,
  ): Promise<Array<string | PolicyInterface>> {
    const key = this.key(principal);

    if (await this.cache.has(key)) {
      return this.decode(await this.cache.get(key));
    }

    const policies = await this.storage.fetch(principal);

    if (
      !(await this.cache.set(key, this.encode(policies), this.options.expire))
    ) {
      throw new CacheError(`Unable to store policy cache for key: ${key}`);
    }

    return policies;
  }

  async save(
    principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number> {
    await this.purgeCache(principal);
    return this.storage.save(principal, rawPolicies);
  }

  async add(
    principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number> {
    await this.purgeCache(principal);
    return this.storage.add(principal, rawPolicies);
  }

  async purge(principal: PrincipalObject): Promise<number> {
    await this.purgeCache(principal);
    return this.storage.purge(principal);
  }

  private async purgeCache(principal: PrincipalObject): Promise<void> {
    const key = this.key(principal);

    if (await this.cache.has(key)) {
      if (!(await this.cache.remove(key))) {
        throw new CacheError(`Unable to remove policy cache for key: ${key}`);
      }
    }
  }

  private encode(policies: Array<string | PolicyInterface>): string {
    return JSON.stringify(policies);
  }

  private decode(rawPolicies: string): Array<string | PolicyInterface> {
    return JSON.parse(rawPolicies);
  }

  private key(principal: PrincipalObject): string {
    return `${this.options.prefix}${principal.entity}/${principal.id}`;
  }
}
