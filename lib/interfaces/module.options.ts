import { PolicyStorage } from './policy-storage';
import { PolicyInterface } from './policy';
import { Cache } from '../storages/cache/cache.interface';
import { CachedStorageOptions } from '../storages/cached.storage';

export interface Options {
  storage: string | PolicyStorage; // dynamic policy storage (e.g. sequelize)
  storageRepository?: any; // if database storage specified
  cache?: string | Cache; // dynamic policy storage cache (e.g. ioredis)
  cacheClient?: any; // if cache adapter specified
  cacheOptions?: CachedStorageOptions; // if cache adapter specified
  strict?: boolean; // case sensitive matcher, default false
  policies?: Array<string | PolicyInterface>; // hardcoded policies
}
