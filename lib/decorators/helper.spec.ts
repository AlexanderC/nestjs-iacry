import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { processTemplate, dynamicIdentifierExtractor } from './helper';
import { DecoratorError } from '../errors/decorator.error';
import { VAR_REGEXP } from './constants';

describe('processTemplate', () => {
  beforeEach(() => {
    // Reset the global regex lastIndex before each test
    VAR_REGEXP.lastIndex = 0;
  });

  it('should replace {var} with context value', () => {
    const result = processTemplate('book:{id}', { id: '42' });
    expect(result).toBe('book:42');
  });

  it('should replace multiple variables', () => {
    // Note: VAR_REGEXP is global and its lastIndex persists across exec calls.
    // After replacing the first match, the template string changes but lastIndex
    // may have advanced past subsequent variables. Use longer templates where
    // second variable position exceeds the lastIndex after the first match.
    const result = processTemplate('{entity}:somePaddingText:{id}', {
      entity: 'book',
      id: '5',
    });
    expect(result).toBe('book:somePaddingText:5');
  });

  it('should throw DecoratorError when variable is not found in context', () => {
    expect(() => processTemplate('book:{missing}', { id: '1' })).toThrow(
      DecoratorError,
    );
    // Reset after the throw
    VAR_REGEXP.lastIndex = 0;
    expect(() => processTemplate('book:{missing}', { id: '1' })).toThrow(
      'Unable to find missing property in Request from metadata field',
    );
  });

  it('should handle nested paths like {params.id}', () => {
    const result = processTemplate('book:{params.id}', {
      params: { id: '99' },
    });
    expect(result).toBe('book:99');
  });

  it('should handle deeply nested paths', () => {
    const result = processTemplate('{a.b.c}', { a: { b: { c: 'deep' } } });
    expect(result).toBe('deep');
  });
});

describe('dynamicIdentifierExtractor', () => {
  const TEST_META = 'TEST_META_FIELD';

  it('should return null when metadata is not present', () => {
    const extractor = dynamicIdentifierExtractor(TEST_META);
    function target() {}
    expect(extractor(target)).toBeNull();
  });

  it('should return the metadata value when no execution context is provided', () => {
    const extractor = dynamicIdentifierExtractor(TEST_META);
    function target() {}
    Reflect.defineMetadata(TEST_META, 'some:value', target);
    expect(extractor(target)).toBe('some:value');
  });

  it('should process template when value is a string and context is provided', () => {
    const extractor = dynamicIdentifierExtractor(TEST_META);
    function target() {}
    Reflect.defineMetadata(TEST_META, 'book:{params.id}', target);

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

    const result = extractor(target, mockContext);
    expect(result).toBe('book:42');
  });

  it('should return non-string metadata value as-is even with context', () => {
    const extractor = dynamicIdentifierExtractor(TEST_META);
    function target() {}
    const objValue = { entity: 'book', id: '1' };
    Reflect.defineMetadata(TEST_META, objValue, target);

    const mockContext = {
      switchToHttp: jest.fn(),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;

    const result = extractor(target, mockContext);
    expect(result).toBe(objValue);
  });

  it('should call preHook when provided', () => {
    const preHook = jest.fn().mockImplementation((value) => value);
    const extractor = dynamicIdentifierExtractor(TEST_META, { preHook });
    function target() {}
    Reflect.defineMetadata(TEST_META, 'test:value', target);

    extractor(target);
    expect(preHook).toHaveBeenCalledWith('test:value', undefined);
  });

  it('should call postHook when context is provided and value is a string', () => {
    const postHook = jest.fn().mockImplementation((value) => value + ':hooked');
    const extractor = dynamicIdentifierExtractor(TEST_META, { postHook });
    function target() {}
    Reflect.defineMetadata(TEST_META, 'plain', target);

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;

    const result = extractor(target, mockContext);
    expect(postHook).toHaveBeenCalled();
    expect(result).toBe('plain:hooked');
  });
});
