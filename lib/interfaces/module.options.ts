import { PolicyStorage } from './policy-storage';
import { PolicyInterface } from './policy';

export interface Options {
  storage: string | PolicyStorage; // dynamic policy storage (e.g. sequelize)
  storageRepository?: any; // if database storage specified
  strict?: boolean; // case sensitive matcher, default false
  policies?: Array<string | PolicyInterface>; // hardcoded policies
}
