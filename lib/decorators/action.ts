import { ExecutionContext } from '@nestjs/common';
import { Action, DELIMITER } from '../interfaces/policy';
import {
  ACTION_META_FIELD,
  CTRL_SERVICE_REGEXP,
  CTRL_ACTION_PLACEHOLDER,
} from './constants';
import { dynamicIdentifierExtractor } from './helper';

export const extractDynamicIdentifier = dynamicIdentifierExtractor<Action>(
  ACTION_META_FIELD,
  {
    preHook(value: any, ctx?: ExecutionContext): any {
      if (!ctx || value !== CTRL_ACTION_PLACEHOLDER) {
        return value;
      }

      const parts = [
        (ctx.getClass().name || '').replace(CTRL_SERVICE_REGEXP, ''), // e.g. BookController
        ctx.getHandler().name, // e.g. update
      ];

      return parts
        .filter(Boolean)
        .map((part) => part.toLowerCase())
        .join(DELIMITER); // e.g. book:update
    },
  },
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
    Reflect.defineMetadata(
      ACTION_META_FIELD,
      action || CTRL_ACTION_PLACEHOLDER,
      descriptor.value,
    );
    return descriptor;
  };
}
