import { Policy } from './policy';
import { Effect } from './interfaces/policy';

const FULL_POLICY = {
  Sid: 'FullPolicy',
  Effect: Effect.ALLOW,
  Action: 'company:create',
  Resource: 'user:',
  Principal: 'root',
};

const MINIMAL_POLICY = {
  Effect: Effect.ALLOW,
  Action: 'company:create',
};

function createPolicy(raw: any, fromString = false): Policy {
  return new Policy(fromString ? JSON.stringify(raw) : raw);
}

describe('PolicyInterface', () => {
  it('can be either created from string or policy object', () => {
    expect.assertions(4);
    expect(() => {
      const policy = createPolicy(FULL_POLICY, true);
      expect(policy.toJSON()).toMatchObject(FULL_POLICY);
    }).not.toThrow();
    expect(() => {
      const policy = createPolicy(FULL_POLICY);
      expect(policy.toJSON()).toMatchObject(FULL_POLICY);
    }).not.toThrow();
  });

  it('should allow creating with minimal policy', () => {
    expect.assertions(2);
    expect(() => {
      const policy = createPolicy(MINIMAL_POLICY);
      expect(policy.toJSON()).toMatchObject(MINIMAL_POLICY);
    }).not.toThrow();
  });

  it('should not allow creating incomplete policy', () => {
    expect(() => {
      const brokenPolicy = { ...MINIMAL_POLICY };
      delete brokenPolicy.Effect;
      createPolicy(brokenPolicy);
    }).toThrow();
  });

  it('should parse dynamic props structure', () => {
    expect.assertions(4);
    expect(() => {
      const policy = createPolicy(FULL_POLICY);
      const repr = policy.toJSON(true);
      expect(repr.Action).toMatchObject({ service: 'company', action: 'create' });
      expect(repr.Resource).toMatchObject({ entity: 'user', id: Policy.ANY });
      expect(repr.Principal).toMatchObject({ entity: 'root', id: Policy.ANY });
    }).not.toThrow();
  });

  it('should return a vector when calling property() method', () => {
    expect.assertions(3);
    expect(() => {
      const policy = createPolicy(MINIMAL_POLICY);

      expect(policy.property('Action')).toMatchObject([{ service: 'company', action: 'create' }]);
      expect(policy.property('Resource')).toMatchObject([]);
    }).not.toThrow();
  });
});
