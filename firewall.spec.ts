import { Effect, PrincipalObject } from './interfaces/policy';
import { Firewall } from './firewall';

// allow company creation by any user
const ALLOW_POLICY = {
  Effect: Effect.ALLOW,
  Action: 'company:create',
  Resource: 'user',
};

// deny company creation by user with ID=1
const DENY_POLICY = {
  Effect: Effect.DENY,
  Action: 'company:create',
  Resource: ':1',
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
};

const USER_PRINCIPAL = <PrincipalObject>{ entity: 'user', id: 1 };

describe('Firewall', () => {
  let firewall: Firewall;

  beforeEach(() => {
    firewall = Firewall.create();
  });

  it('should return true for isAllowed() if no deny and at least one allow policy matched', () => {
    expect.assertions(2);
    expect(async () => {
      await firewall.storage.save(USER_PRINCIPAL, [ALLOW_POLICY, ABSTAIN_POLICY]);
      expect(await firewall.isAllowed(
        MATCH.RESOURCE,
        MATCH.ACTION,
        MATCH.PRINCIPAL,
      )).toBeTruthy();
    }).not.toThrow();
  });

  it('should return false for isAllowed() if a deny policy matched despite any allowance', () => {
    expect.assertions(2);
    expect(async () => {
      await firewall.storage.save(USER_PRINCIPAL, [ALLOW_POLICY, DENY_POLICY]);
      expect(await firewall.isAllowed(
        MATCH.RESOURCE,
        MATCH.ACTION,
        MATCH.PRINCIPAL,
      )).toBeFalsy();
    }).not.toThrow();
  });

  it('should return true for isAllowedImplicit() if no deny policy matched despite missing explicit allowance', () => {
    expect.assertions(2);
    expect(async () => {
      await firewall.storage.save(USER_PRINCIPAL, [ABSTAIN_POLICY]);
      expect(await firewall.isAllowedImplicit(
        MATCH.RESOURCE,
        MATCH.ACTION,
        MATCH.PRINCIPAL,
      )).toBeTruthy();
    }).not.toThrow();
  });

  it('should return false for isAllowedImplicit() if a deny policy matched despite any allowance', () => {
    expect.assertions(2);
    expect(async () => {
      await firewall.storage.save(USER_PRINCIPAL, [ABSTAIN_POLICY, DENY_POLICY]);
      expect(await firewall.isAllowedImplicit(
        MATCH.RESOURCE,
        MATCH.ACTION,
        MATCH.PRINCIPAL,
      )).toBeFalsy();
    }).not.toThrow();
  });

  it('should return true for isAllowedAny() if an allow policy matched despite any explicit deny', () => {
    expect.assertions(2);
    expect(async () => {
      await firewall.storage.save(USER_PRINCIPAL, [ALLOW_POLICY, DENY_POLICY]);
      expect(await firewall.isAllowedAny(
        MATCH.RESOURCE,
        MATCH.ACTION,
        MATCH.PRINCIPAL,
      )).toBeTruthy();
    }).not.toThrow();
  });

  it('should return false for isAllowedAny() if no allow policy matched', () => {
    expect.assertions(2);
    expect(async () => {
      await firewall.storage.save(USER_PRINCIPAL, [ABSTAIN_POLICY, DENY_POLICY]);
      expect(await firewall.isAllowedAny(
        MATCH.RESOURCE,
        MATCH.ACTION,
        MATCH.PRINCIPAL,
      )).toBeFalsy();
    }).not.toThrow();
  });
});
