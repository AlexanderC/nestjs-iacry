import { ExecutionContext } from '@nestjs/common';
import * as dotProp from 'dot-prop';
import { isEntity, toPlainDynamicIdentifier } from './entity';
import { DecoratorError } from '../errors/decorator.error';
import { VAR_REGEXP } from './constants';

export function processTemplate(template: string, context: object): string {
  let match;

  while ((match = VAR_REGEXP.exec(template)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (match.index === VAR_REGEXP.lastIndex) {
      VAR_REGEXP.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    let [definition, varPath] = match;
    varPath = varPath.trim();

    if (!dotProp.has(context, varPath)) {
      throw new DecoratorError(
        `Unable to find ${varPath} property in Request from metadata field`,
      );
    }

    let varValue = dotProp.get(context, varPath);

    if (isEntity(varValue)) {
      varValue = toPlainDynamicIdentifier(varValue);
    }

    template = template.replace(definition, varValue.toString());
  }

  return template;
}

type DIEHook = (value: any, ctx?: ExecutionContext) => any;

export function dynamicIdentifierExtractor<T>(
  metadataField: string,
  hooks?: { preHook?: DIEHook; postHook?: DIEHook },
): (target: object | Function, ctx?: ExecutionContext) => T | any | null {
  return (
    target: object | Function,
    ctx?: ExecutionContext,
  ): T | any | null => {
    if (!Reflect.hasMetadata(metadataField, target)) {
      return null;
    }

    const { preHook, postHook } = hooks || {};
    let value = Reflect.getMetadata(metadataField, target);

    if (preHook) {
      value = preHook(value, ctx);
    }

    if (!ctx || typeof value !== 'string') {
      return value;
    }

    // @ref https://docs.nestjs.com/controllers
    // request.{session | params | body | query | headers | ip}
    const request = ctx.switchToHttp().getRequest();

    value = processTemplate(value, request);

    if (postHook) {
      value = postHook(value, ctx);
    }

    return value;
  };
}
