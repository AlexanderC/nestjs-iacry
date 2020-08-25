import { Effect } from './interfaces/policy';
import { PolicyVector } from './policy-vector';
import { Matcher } from './matcher';

// allow company creation by any user
const ALLOW_POLICY = {
  Effect: Effect.ALLOW,
  Action: 'company:create',
  Resource: 'user',
};
const MULTIPLE_ACTION_ALLOW_POLICY = {
  Effect: Effect.ALLOW,
  Action: [ 'company:create', 'company:otheraction' ],
  Resource: 'user',
};
const ORED_ALLOW_POLICY = {
  Effect: Effect.ALLOW,
  Action: 'company:!(delete|update)',
  Resource: 'user',
};
const CUSTOM_ASTERISC_ALLOW_POLICY = {
  Effect: Effect.ALLOW,
  Action: 'company:create',
  Resource: 'user',
  Principal: '*/admin',
};

// deny company creation by user with ID=1
const DENY_POLICY = {
  Effect: Effect.DENY,
  Action: 'company:create',
  Resource: ':1',
};
const NEGATED_DENY_POLICY = {
  Effect: Effect.DENY,
  Action: 'company:create',
  Resource: ':!1',
};

// abstain on any action from service=whatever
const ABSTAIN_POLICY = {
  Effect: Effect.ALLOW,
  Action: '*:otheraction',
};

const MATCH = {
  RESOURCE: 'user:1',
  ACTION: '*:create',
  PRINCIPAL: 'root',
  ROLE_AWARE_PRINCIPAL: 'root/admin',
};

describe('Matcher', () => {
  it('should proper match given policies', () => {
    expect.assertions(8);
    expect(() => {
      const matcher = new Matcher();
      const policies = PolicyVector.create(
        ALLOW_POLICY,
        DENY_POLICY,
        ABSTAIN_POLICY,
      );
      const result = matcher.match(
        MATCH.RESOURCE,
        MATCH.ACTION,
        MATCH.PRINCIPAL,
        policies,
      );

      expect(Object.keys(result)).toMatchObject(['allow', 'deny', 'abstain']);
      expect(result.allow.length).toEqual(1);
      expect(result.deny.length).toEqual(1);
      expect(result.abstain.length).toEqual(1);
      expect(result.allow[0].toJSON()).toEqual(ALLOW_POLICY);
      expect(result.deny[0].toJSON()).toEqual(DENY_POLICY);
      expect(result.abstain[0].toJSON()).toEqual(ABSTAIN_POLICY);
    }).not.toThrow();
  });

  it('should proper match given policies for an array of actions', () => {
    expect.assertions(8);
    expect(() => {
      const matcher = new Matcher();
      const policies = PolicyVector.create(
        MULTIPLE_ACTION_ALLOW_POLICY,
        DENY_POLICY,
        ABSTAIN_POLICY,
      );
      const result = matcher.match(
        MATCH.RESOURCE,
        MATCH.ACTION,
        MATCH.PRINCIPAL,
        policies,
      );

      expect(Object.keys(result)).toMatchObject(['allow', 'deny', 'abstain']);
      expect(result.allow.length).toEqual(1);
      expect(result.deny.length).toEqual(1);
      expect(result.abstain.length).toEqual(1);
      expect(result.allow[0].toJSON()).toEqual(MULTIPLE_ACTION_ALLOW_POLICY);
      expect(result.deny[0].toJSON()).toEqual(DENY_POLICY);
      expect(result.abstain[0].toJSON()).toEqual(ABSTAIN_POLICY);
    }).not.toThrow();
  });

  it('should proper match policies for a negated resource', () => {
    expect.assertions(8);
    expect(() => {
      const matcher = new Matcher();
      const policies = PolicyVector.create(
        ALLOW_POLICY,
        NEGATED_DENY_POLICY,
        ABSTAIN_POLICY,
      );
      const result = matcher.match(
        MATCH.RESOURCE,
        MATCH.ACTION,
        MATCH.PRINCIPAL,
        policies,
      );

      expect(Object.keys(result)).toMatchObject(['allow', 'deny', 'abstain']);
      expect(result.allow.length).toEqual(1);
      expect(result.deny.length).toEqual(0);
      expect(result.abstain.length).toEqual(2);
      expect(result.allow[0].toJSON()).toEqual(ALLOW_POLICY);
      expect(result.abstain[0].toJSON()).toEqual(NEGATED_DENY_POLICY);
      expect(result.abstain[1].toJSON()).toEqual(ABSTAIN_POLICY);
    }).not.toThrow();
  });

  it('should proper match policies for an ORed resource', () => {
    expect.assertions(8);
    expect(() => {
      const matcher = new Matcher();
      const policies = PolicyVector.create(
        ORED_ALLOW_POLICY,
        DENY_POLICY,
        ABSTAIN_POLICY,
      );
      const result = matcher.match(
        MATCH.RESOURCE,
        MATCH.ACTION,
        MATCH.PRINCIPAL,
        policies,
      );

      expect(Object.keys(result)).toMatchObject(['allow', 'deny', 'abstain']);
      expect(result.allow.length).toEqual(1);
      expect(result.deny.length).toEqual(1);
      expect(result.abstain.length).toEqual(1);
      expect(result.allow[0].toJSON()).toEqual(ORED_ALLOW_POLICY);
      expect(result.deny[0].toJSON()).toEqual(DENY_POLICY);
      expect(result.abstain[0].toJSON()).toEqual(ABSTAIN_POLICY);
    }).not.toThrow();
  });

  it('should proper match policies for custom "*" pattern', () => {
    expect.assertions(8);
    expect(() => {
      const matcher = new Matcher();
      const policies = PolicyVector.create(
        CUSTOM_ASTERISC_ALLOW_POLICY,
        DENY_POLICY,
        ABSTAIN_POLICY,
      );
      const result = matcher.match(
        MATCH.RESOURCE,
        MATCH.ACTION,
        MATCH.ROLE_AWARE_PRINCIPAL,
        policies,
      );

      expect(Object.keys(result)).toMatchObject(['allow', 'deny', 'abstain']);
      expect(result.allow.length).toEqual(1);
      expect(result.deny.length).toEqual(1);
      expect(result.abstain.length).toEqual(1);
      expect(result.allow[0].toJSON()).toEqual(CUSTOM_ASTERISC_ALLOW_POLICY);
      expect(result.deny[0].toJSON()).toEqual(DENY_POLICY);
      expect(result.abstain[0].toJSON()).toEqual(ABSTAIN_POLICY);
    }).not.toThrow();
  });
});
