import { PolicyVector } from './policy-vector';
import { Policy } from './policy';
import { Effect } from './interfaces/policy';
import { CoreHelper } from './helpers/core';

const MINIMAL_POLICY = {
  Effect: Effect.ALLOW,
  Action: 'company:create',
};

describe('PolicyVector', () => {
  it('can be created from string, policy object and policy instance', () => {
    expect.assertions(2);
    expect(() => {
      const vector = PolicyVector.create(
        MINIMAL_POLICY,
        CoreHelper.encode(MINIMAL_POLICY),
        new Policy(MINIMAL_POLICY),
      );
      expect(vector.toJSON()).toEqual(Array(3).fill(MINIMAL_POLICY));
    }).not.toThrow();
  });
});
