import 'reflect-metadata';
import { BaseError } from './iacry.error';
import { DecoratorError } from './decorator.error';
import { MissingPolicyProps } from './missing-policy-props.error';
import { WrongPolicyPropFormat } from './wrong-policy-prop-format.error';
import { CacheError } from '../storages/cache/cache.error';
import { Effect, PolicyInterface } from '../interfaces/policy';

describe('BaseError', () => {
  it('should be an instance of Error', () => {
    const error = new BaseError('base error message');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseError);
  });

  it('should contain the provided message', () => {
    const error = new BaseError('something went wrong');
    expect(error.message).toBe('something went wrong');
  });
});

describe('DecoratorError', () => {
  it('should be an instance of BaseError', () => {
    const error = new DecoratorError('decorator issue');
    expect(error).toBeInstanceOf(BaseError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should contain the provided message', () => {
    const error = new DecoratorError('bad decorator');
    expect(error.message).toBe('bad decorator');
  });
});

describe('MissingPolicyProps', () => {
  it('should include missing prop names in the message', () => {
    const policy = {} as PolicyInterface;
    const error = new MissingPolicyProps(policy, 'Effect', 'Action');
    expect(error.message).toContain('Effect');
    expect(error.message).toContain('Action');
    expect(error).toBeInstanceOf(BaseError);
  });

  describe('assert', () => {
    it('should throw when Effect is missing', () => {
      const policy = { Action: 'company:create' } as any;
      expect(() => MissingPolicyProps.assert(policy)).toThrow(
        MissingPolicyProps,
      );
    });

    it('should throw when Action is missing', () => {
      const policy = { Effect: Effect.ALLOW } as any;
      expect(() => MissingPolicyProps.assert(policy)).toThrow(
        MissingPolicyProps,
      );
    });

    it('should not throw when required props are present', () => {
      const policy: PolicyInterface = {
        Effect: Effect.ALLOW,
        Action: 'company:create',
      };
      expect(() => MissingPolicyProps.assert(policy)).not.toThrow();
    });
  });
});

describe('WrongPolicyPropFormat', () => {
  it('should include the prop name in the message', () => {
    const policy = { Action: 'a:b:c' } as any;
    const error = new WrongPolicyPropFormat(policy, 'Action', [
      'service',
      'action',
    ]);
    expect(error.message).toContain('Action');
    expect(error.message).toContain('service:action');
    expect(error).toBeInstanceOf(BaseError);
  });
});

describe('CacheError', () => {
  it('should be an instance of BaseError', () => {
    const error = new CacheError('cache failure');
    expect(error).toBeInstanceOf(BaseError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should contain the provided message', () => {
    const error = new CacheError('redis down');
    expect(error.message).toBe('redis down');
  });
});
