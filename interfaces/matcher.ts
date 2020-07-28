import {
  Action, Resource, Principal,
  ActionObject, ResourceObject, PrincipalObject,
} from './policy';
import { PolicyVector } from '../policy-vector';
import { MatcherResult } from './matcher-result';

export interface Matcher {
  match(
    rawResource: Resource | ResourceObject,
    rawAction: Action | ActionObject,
    rawPrincipal: Principal | PrincipalObject,
    policies: PolicyVector,
  ): MatcherResult;  
}