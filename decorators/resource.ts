import { Resource } from '../interfaces/policy';
import { RESOURCE_META_FIELD } from './constants';
import { dynamicIdentifierExtractor } from './helper';

export const extractDynamicIdentifier = dynamicIdentifierExtractor<Resource>(RESOURCE_META_FIELD);

/**
 * @use @Resource('book:{params.id}')
 *      // request.{session | params | body | query | headers | ip}
 */
export function Resource(resource: Resource): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    Reflect.defineMetadata(RESOURCE_META_FIELD, resource, descriptor.value);
    return descriptor;
  };
}