import { ENTITY_FIELD, ID_FIELD } from '../interfaces/policy';

export const REQUEST_USER = '{user}';
export const META_PREFIX = 'IACRY_META_';
export const ENTITY_META_FIELD = `${META_PREFIX}${ENTITY_FIELD.toUpperCase()}`;
export const ID_META_FIELD = `${META_PREFIX}${ID_FIELD.toUpperCase()}`;
export const ACTION_META_FIELD = `${META_PREFIX}ACTION`;
export const RESOURCE_META_FIELD = `${META_PREFIX}RESOURCE`;
export const PRINCIPAL_META_FIELD = `${META_PREFIX}PRINCIPAL`;
