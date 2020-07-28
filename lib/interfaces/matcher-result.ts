import { Policy } from '../policy';

export interface MatcherResult {
  allow: Array<Policy>;
  deny: Array<Policy>;
  abstain: Array<Policy>;
}
