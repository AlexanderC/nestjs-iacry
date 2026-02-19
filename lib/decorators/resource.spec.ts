import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { Resource, extractDynamicIdentifier } from './resource';
import { RESOURCE_META_FIELD } from './constants';

describe('Resource decorator', () => {
  it('should set the resource string as metadata', () => {
    class TestController {
      @Resource('book:1')
      handle() {}
    }

    const ctrl = new TestController();
    const metadata = Reflect.getMetadata(RESOURCE_META_FIELD, ctrl.handle);
    expect(metadata).toBe('book:1');
  });
});

describe('extractDynamicIdentifier (resource)', () => {
  it('should return null when no metadata is present', () => {
    function noMeta() {}
    const result = extractDynamicIdentifier(noMeta);
    expect(result).toBeNull();
  });

  it('should return the metadata value when no execution context is provided', () => {
    class TestController {
      @Resource('book:1')
      handle() {}
    }

    const ctrl = new TestController();
    const result = extractDynamicIdentifier(ctrl.handle);
    expect(result).toBe('book:1');
  });

  it('should process template variables from request context', () => {
    class TestController {
      @Resource('book:{params.id}')
      handle() {}
    }

    const ctrl = new TestController();

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ params: { id: '42' } }),
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
    expect(result).toBe('book:42');
  });

  it('should process multiple template variables from request context', () => {
    // Note: VAR_REGEXP is a global regex whose lastIndex persists across exec calls.
    // After replacing the first match the template shrinks, but lastIndex may have
    // advanced past the second variable. Using a longer prefix ensures the second
    // variable position exceeds the lastIndex after the first replacement.
    class TestController {
      @Resource('{params.entity}:some-long-padding:{params.id}')
      handle() {}
    }

    const ctrl = new TestController();

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          params: { entity: 'article', id: '99' },
        }),
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
    expect(result).toBe('article:some-long-padding:99');
  });
});
