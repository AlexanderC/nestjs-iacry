import { Principal } from '../interfaces/policy';
import { PRINCIPAL_META_FIELD, REQUEST_USER } from './constants';
import { dynamicIdentifierExtractor } from './helper';

export const extractDynamicIdentifier =
  dynamicIdentifierExtractor<Principal>(PRINCIPAL_META_FIELD);

/**
 * @use @Principal() // extracts request user: User:@\Entity
 *      @Principal('user:{user.id}')
 *      // request.{session | params | body | query | headers | ip}
 */
export function Principal(principal?: string | Principal): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    Reflect.defineMetadata(
      PRINCIPAL_META_FIELD,
      principal || REQUEST_USER,
      descriptor.value,
    );
    return descriptor;
  };
}
