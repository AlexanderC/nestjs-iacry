export const SID = 'Sid';
export const ACTION = 'Action';
export const EFFECT = 'Effect';
export const RESOURCE = 'Resource';
export const PRINCIPAL = 'Principal';
export const ENTITY_FIELD = 'entity';
export const ID_FIELD = 'id';
export const DYNAMIC_IDENTIFIER_PROPS = [ACTION, RESOURCE, PRINCIPAL];
export const DYNAMIC_IDENTIFIER_PROPS_MAPPING = {
  [ACTION]: ['service', 'action'], // @ref ActionObject
  [RESOURCE]: [ENTITY_FIELD, ID_FIELD], // @ref ResourceObject
  [PRINCIPAL]: [ENTITY_FIELD, ID_FIELD], // @ref PrincipalObject
};
export const REQUIRED_PROPS = [EFFECT, ACTION];
export const DELIMITER = ':';

export enum Effect {
  ALLOW = 'Allow',
  DENY = 'Deny',
}

export type ANY = '*';
export interface ActionObject {
  readonly service: string | ANY;
  readonly action: string | ANY;
}
export type Action = string | ActionObject;
export interface ResourceObject {
  readonly entity: string | ANY;
  readonly id: number | string | ANY;
}
export type Resource = string | ResourceObject;
export interface PrincipalObject {
  readonly entity: string | ANY;
  readonly id: number | string | ANY;
}
export type Principal = string | PrincipalObject;
export type DynamicIdentifierItem<T> = {
  value: T;
  parse(thing: T): Array<string | ANY>;
};
export type DynamicIdentifier<T> = T | DynamicIdentifierItem<T>;
export type DynamicIdentifierVector<T> = Array<DynamicIdentifier<T>>;

export interface PolicyInterface {
  Sid?: string; // policy identifier
  Effect: Effect; // Allow | Deny
  Action: DynamicIdentifier<Action> | DynamicIdentifierVector<Action>; // What Action: e.g. "book:update"
  Resource?: DynamicIdentifier<Resource> | DynamicIdentifierVector<Resource>; // Object of the Action: e.g. "book:33"
  Principal?: DynamicIdentifier<Principal> | DynamicIdentifierVector<Principal>; // Whom: e.g. "user:1"
}
