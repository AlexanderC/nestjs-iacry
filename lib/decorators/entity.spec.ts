import 'reflect-metadata';
import {
  Entity,
  isEntity,
  toDynamicIdentifier,
  toPlainDynamicIdentifier,
} from './entity';
import { ENTITY_META_FIELD, ID_META_FIELD } from './constants';
import { DecoratorError } from '../errors/decorator.error';

describe('Entity decorator', () => {
  it('should use constructor name lowercased as entity name when no options provided', () => {
    @Entity()
    class Book {
      id = '1';
    }

    const instance = new Book();
    const entityFn = Reflect.getMetadata(ENTITY_META_FIELD, Book);
    expect(entityFn(instance)).toBe('book');
  });

  it('should use provided name when options.name is set', () => {
    @Entity({ name: 'CustomName' })
    class Book {
      id = '1';
    }

    const instance = new Book();
    const entityFn = Reflect.getMetadata(ENTITY_META_FIELD, Book);
    expect(entityFn(instance)).toBe('CustomName');
  });

  it('should read name from instance field when options.nameField is set', () => {
    @Entity({ nameField: 'type' })
    class Book {
      id = '1';
      type = 'novel';
    }

    const instance = new Book();
    const entityFn = Reflect.getMetadata(ENTITY_META_FIELD, Book);
    expect(entityFn(instance)).toBe('novel');
  });

  it('should read id from instance field when options.idField is set', () => {
    @Entity({ idField: 'pk' })
    class Book {
      pk = '99';
    }

    const instance = new Book();
    const idFn = Reflect.getMetadata(ID_META_FIELD, Book);
    expect(idFn(instance)).toBe('99');
  });

  it('should read id from instance.id by default', () => {
    @Entity()
    class Book {
      id = '42';
    }

    const instance = new Book();
    const idFn = Reflect.getMetadata(ID_META_FIELD, Book);
    expect(idFn(instance)).toBe('42');
  });

  it('should add toDynamicIdentifier to the prototype', () => {
    @Entity()
    class Book {
      id = '1';
    }

    const instance = new Book();
    expect(typeof (instance as any).toDynamicIdentifier).toBe('function');
  });
});

describe('isEntity', () => {
  it('should return true for decorated class instances', () => {
    @Entity()
    class Book {
      id = '1';
    }

    const instance = new Book();
    expect(isEntity(instance)).toBe(true);
  });

  it('should return false for plain objects', () => {
    expect(isEntity({ id: '1' })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isEntity(null)).toBeFalsy();
  });

  it('should return false for undefined', () => {
    expect(isEntity(undefined)).toBeFalsy();
  });
});

describe('toDynamicIdentifier', () => {
  it('should return { entity, id } for a decorated instance', () => {
    @Entity({ name: 'book' })
    class Book {
      id = '5';
    }

    const instance = new Book();
    const result = toDynamicIdentifier(instance);
    expect(result).toEqual({ entity: 'book', id: '5' });
  });

  it('should throw DecoratorError for non-entity objects', () => {
    expect(() => toDynamicIdentifier({ id: '1' })).toThrow(DecoratorError);
    expect(() => toDynamicIdentifier({ id: '1' })).toThrow(
      'Target object should use @Entity() decorator',
    );
  });
});

describe('toPlainDynamicIdentifier', () => {
  it('should return "entity:id" string', () => {
    @Entity({ name: 'book' })
    class Book {
      id = '7';
    }

    const instance = new Book();
    const result = toPlainDynamicIdentifier(instance);
    expect(result).toBe('book:7');
  });
});
