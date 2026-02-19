import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { Action, extractDynamicIdentifier } from './action';
import { ACTION_META_FIELD, CTRL_ACTION_PLACEHOLDER } from './constants';

describe('Action decorator', () => {
  it('should set CTRL_ACTION_PLACEHOLDER as metadata when no action provided', () => {
    class TestController {
      @Action()
      handle() {}
    }

    const ctrl = new TestController();
    const metadata = Reflect.getMetadata(ACTION_META_FIELD, ctrl.handle);
    expect(metadata).toBe(CTRL_ACTION_PLACEHOLDER);
  });

  it('should set the provided action string as metadata', () => {
    class TestController {
      @Action('book:update')
      handle() {}
    }

    const ctrl = new TestController();
    const metadata = Reflect.getMetadata(ACTION_META_FIELD, ctrl.handle);
    expect(metadata).toBe('book:update');
  });
});

describe('extractDynamicIdentifier (action)', () => {
  it('should return null when no metadata is present', () => {
    function noMeta() {}
    const result = extractDynamicIdentifier(noMeta);
    expect(result).toBeNull();
  });

  it('should return the metadata value when no execution context is provided', () => {
    class TestController {
      @Action('book:read')
      handle() {}
    }

    const ctrl = new TestController();
    const result = extractDynamicIdentifier(ctrl.handle);
    expect(result).toBe('book:read');
  });

  it('should derive action from controller/method name when placeholder and context provided', () => {
    class BookController {
      @Action()
      update() {}
    }

    const ctrl = new BookController();

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
      getHandler: jest.fn().mockReturnValue({ name: 'update' }),
      getClass: jest.fn().mockReturnValue({ name: 'BookController' }),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;

    const result = extractDynamicIdentifier(ctrl.update, mockContext);
    expect(result).toBe('book:update');
  });

  it('should return the action string unchanged when not a placeholder even with context', () => {
    class TestController {
      @Action('custom:action')
      handle() {}
    }

    const ctrl = new TestController();

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
      getHandler: jest.fn().mockReturnValue({ name: 'handle' }),
      getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;

    const result = extractDynamicIdentifier(ctrl.handle, mockContext);
    expect(result).toBe('custom:action');
  });
});
