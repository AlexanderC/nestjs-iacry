import 'reflect-metadata';
import { CoreHelper } from './core';
import { Effect, PolicyInterface } from '../interfaces/policy';
import { WrongPolicyPropFormat } from '../errors/wrong-policy-prop-format.error';

// CoreHelper is abstract, so we create a concrete subclass for testing instance methods
class TestableHelper extends CoreHelper {}

describe('CoreHelper', () => {
  let helper: TestableHelper;

  beforeEach(() => {
    helper = new TestableHelper();
  });

  describe('encode (static)', () => {
    it('should encode a policy to a JSON string', () => {
      const policy: PolicyInterface = {
        Effect: Effect.ALLOW,
        Action: 'company:create',
      };
      const result = CoreHelper.encode(policy);
      expect(result).toBe(JSON.stringify(policy));
      expect(typeof result).toBe('string');
    });

    it('should encode with beautification when beatify is true', () => {
      const policy: PolicyInterface = {
        Effect: Effect.DENY,
        Action: 'book:read',
      };
      const result = CoreHelper.encode(policy, true);
      expect(result).toBe(JSON.stringify(policy, null, '  '));
      expect(result).toContain('\n');
    });
  });

  describe('decode (static)', () => {
    it('should decode a JSON string to a PolicyInterface object', () => {
      const policy: PolicyInterface = {
        Effect: Effect.ALLOW,
        Action: 'company:create',
      };
      const raw = JSON.stringify(policy);
      const result = CoreHelper.decode(raw);
      expect(result).toEqual(policy);
    });
  });

  describe('isDynamicVector', () => {
    it('should return true for arrays', () => {
      expect(helper.isDynamicVector(['action1', 'action2'])).toBe(true);
      expect(helper.isDynamicVector([])).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(helper.isDynamicVector('some:string')).toBe(false);
      expect(helper.isDynamicVector({ service: 'a', action: 'b' })).toBe(false);
    });
  });

  describe('isDynamicItem', () => {
    it('should return true for an object with value property and parse function', () => {
      const item = {
        value: 'company:create',
        parse: () => ({ service: 'company', action: 'create' }),
      };
      expect(helper.isDynamicItem(item)).toBe(true);
    });

    it('should return false for a plain string', () => {
      expect(helper.isDynamicItem('company:create')).toBe(false);
    });

    it('should return false for an object missing parse function', () => {
      const item = { value: 'test' } as any;
      expect(helper.isDynamicItem(item)).toBe(false);
    });
  });

  describe('parseDynamicIdentifier', () => {
    it('should parse "company:create" for Action prop', () => {
      const result = helper.parseDynamicIdentifier(
        { Action: 'company:create' },
        'Action',
        'company:create',
      );
      expect(result).toEqual({ service: 'company', action: 'create' });
    });

    it('should parse "user:1" for Resource prop', () => {
      const result = helper.parseDynamicIdentifier(
        { Resource: 'user:1' },
        'Resource',
        'user:1',
      );
      expect(result).toEqual({ entity: 'user', id: '1' });
    });

    it('should fill missing parts with "*"', () => {
      const result = helper.parseDynamicIdentifier(
        { Action: 'company' },
        'Action',
        'company',
      );
      expect(result).toEqual({ service: 'company', action: '*' });
    });

    it('should treat empty segments as "*"', () => {
      const result = helper.parseDynamicIdentifier(
        { Resource: ':5' },
        'Resource',
        ':5',
      );
      expect(result).toEqual({ entity: '*', id: '5' });
    });

    it('should throw WrongPolicyPropFormat when too many parts are provided', () => {
      expect(() => {
        helper.parseDynamicIdentifier({ Action: 'a:b:c' }, 'Action', 'a:b:c');
      }).toThrow(WrongPolicyPropFormat);
    });
  });

  describe('normalizeDynamicIdentifier', () => {
    it('should parse a string identifier into an object', () => {
      const result = helper.normalizeDynamicIdentifier('user:42', 'Resource');
      expect(result).toEqual({ entity: 'user', id: '42' });
    });

    it('should return an object identifier unchanged', () => {
      const obj = { entity: 'book', id: '10' };
      const result = helper.normalizeDynamicIdentifier(obj, 'Resource');
      expect(result).toBe(obj);
    });
  });
});
