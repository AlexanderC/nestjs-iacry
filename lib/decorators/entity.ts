import { DecoratorError } from '../errors/decorator.error';
import {
  ENTITY_FIELD,
  ID_FIELD,
  ResourceObject,
  PrincipalObject,
  Resource,
  Principal,
  DELIMITER,
} from '../interfaces/policy';
import { ENTITY_META_FIELD, ID_META_FIELD } from './constants';

export interface EntityOptions {
  name?: string;
  nameField?: string;
  idField?: string;
}

export interface Entity {
  [ENTITY_FIELD]?: string;
  [ID_FIELD]?: string;
}

export function isEntity(target: any): target is Entity {
  return (
    target &&
    typeof target === 'object' &&
    target.constructor &&
    typeof target.constructor === 'function' &&
    Reflect.hasMetadata(ENTITY_META_FIELD, target.constructor) &&
    Reflect.hasMetadata(ID_META_FIELD, target.constructor) &&
    typeof Reflect.getMetadata(ENTITY_META_FIELD, target.constructor) ===
      'function' &&
    typeof Reflect.getMetadata(ID_META_FIELD, target.constructor) === 'function'
  );
}

export function toDynamicIdentifier(
  target: object,
): ResourceObject | PrincipalObject {
  if (!isEntity(target)) {
    throw new DecoratorError('Target object should use @Entity() decorator');
  }

  return <ResourceObject | PrincipalObject>{
    [ENTITY_FIELD]: Reflect.getMetadata(
      ENTITY_META_FIELD,
      target.constructor,
    )(target),
    [ID_FIELD]: Reflect.getMetadata(ID_META_FIELD, target.constructor)(target),
  };
}

export function toPlainDynamicIdentifier(target: object): Resource | Principal {
  const dynamicIdentifier = toDynamicIdentifier(target);

  return `${dynamicIdentifier[ENTITY_FIELD]}${DELIMITER}${dynamicIdentifier[ID_FIELD]}`;
}

/**
 * @use @Entity()
 *      @Entity({ name: 'Book' })
 *      @Entity({ nameField: 'author' })
 *      @Entity({ idField: 'pk' })
 *      @Entity({ name: 'Book', idField: 'pk' })
 */
export function Entity(options?: EntityOptions): ClassDecorator {
  return (target: Function) => {
    if ((!options || (!options.name && !options.nameField)) && !target.name) {
      throw new DecoratorError(
        'Entity has no explicit name, nameField nor constructor defined',
      );
    }

    // @todo: Think how to avoid it...
    target.prototype.toDynamicIdentifier = function ():
      | ResourceObject
      | PrincipalObject {
      return toDynamicIdentifier(this);
    };

    Reflect.defineMetadata(
      ENTITY_META_FIELD,
      (instance: object) =>
        options && options.nameField
          ? instance[options.nameField]
          : options && options.name
            ? options.name
            : target.name.toLowerCase(),
      target,
    );
    Reflect.defineMetadata(
      ID_META_FIELD,
      (instance: object) =>
        options && options.idField
          ? instance[options.idField]
          : instance[ID_FIELD],
      target,
    );
  };
}
