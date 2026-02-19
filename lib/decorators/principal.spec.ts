import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { Principal, extractDynamicIdentifier } from './principal';
import { PRINCIPAL_META_FIELD, REQUEST_USER } from './constants';

describe('Principal decorator', () => {
  it('should set REQUEST_USER as default metadata when no argument provided', () => {
    class TestController {
      @Principal()
      handle() {}
    }

    const ctrl = new TestController();
    const metadata = Reflect.getMetadata(PRINCIPAL_META_FIELD, ctrl.handle);
    expect(metadata).toBe(REQUEST_USER);
  });

  it('should set the provided string as metadata', () => {
    class TestController {
      @Principal('user:1')
      handle() {}
    }

    const ctrl = new TestController();
    const metadata = Reflect.getMetadata(PRINCIPAL_META_FIELD, ctrl.handle);
    expect(metadata).toBe('user:1');
  });
});

describe('extractDynamicIdentifier (principal)', () => {
  it('should return null when no metadata is present', () => {
    function noMeta() {}
    const result = extractDynamicIdentifier(noMeta);
    expect(result).toBeNull();
  });

  it('should return the metadata value when no execution context is provided', () => {
    class TestController {
      @Principal('admin:5')
      handle() {}
    }

    const ctrl = new TestController();
    const result = extractDynamicIdentifier(ctrl.handle);
    expect(result).toBe('admin:5');
  });

  it('should process template variables from request context', () => {
    class TestController {
      @Principal('user:{user.id}')
      handle() {}
    }

    const ctrl = new TestController();

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: { id: '7' } }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;

    const result = extractDynamicIdentifier(ctrl.handle, mockContext);
    expect(result).toBe('user:7');
  });
});
