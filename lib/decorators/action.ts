import { Action, DELIMITER } from '../interfaces/policy';
import { ACTION_META_FIELD } from './constants';
import { dynamicIdentifierExtractor } from './helper';

export const extractDynamicIdentifier = dynamicIdentifierExtractor<Action>(
  ACTION_META_FIELD,
);

/**
 * @use @Action() // target:key
 *      @Action('book:update')
 *      // request.{session | params | body | query | headers | ip}
 */
export function Action(action?: Action): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    if (!action) {
      action = `${target.constructor.name.toLowerCase()}${DELIMITER}${String(
        key,
      )}`;
    }

    Reflect.defineMetadata(ACTION_META_FIELD, action, descriptor.value);
    return descriptor;
  };
}
