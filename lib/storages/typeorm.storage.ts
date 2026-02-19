import { PrincipalObject } from '../interfaces/policy';
import { PolicyStorage } from '../interfaces/policy-storage';
import { PolicyInterface } from '../interfaces/policy';
import { CoreHelper } from '../helpers/core';

export interface TypeOrmRepository {
  find(options: any): Promise<any[]>;
  save(entities: any[]): Promise<any[]>;
  delete(criteria: any): Promise<{ affected?: number }>;
  create(entityLike: any): any;
}

export class TypeOrmStorage implements PolicyStorage {
  readonly readonly: boolean = false;

  constructor(private readonly storageRepository: TypeOrmRepository | any) {}

  async fetch(
    principal: PrincipalObject,
  ): Promise<Array<string | PolicyInterface>> {
    const entries = await this.repository.find({
      where: this.buildWhere(principal),
      select: ['policy'],
    });
    return entries.map((entry: any) => entry.policy);
  }

  async fetchBySid(
    sid: string,
    principal: PrincipalObject,
  ): Promise<Array<string | PolicyInterface>> {
    const entries = await this.repository.find({
      where: this.buildWhere(principal, sid),
      select: ['policy'],
    });
    return entries.map((entry: any) => entry.policy);
  }

  async save(
    principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number> {
    await this.destroyByPrincipal(principal);
    return this.insertPolicies(principal, rawPolicies);
  }

  async add(
    _principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number> {
    return this.insertPolicies(_principal, rawPolicies);
  }

  async saveBySid(
    sid: string,
    principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number> {
    await this.destroyByPrincipal(principal, sid);
    return this.insertPolicies(principal, rawPolicies);
  }

  async purge(principal: PrincipalObject): Promise<number> {
    return this.destroyByPrincipal(principal);
  }

  get repository(): TypeOrmRepository {
    if (!this.isRepository(this.storageRepository)) {
      throw new TypeError(
        'Policies repository must be a TypeORM Repository instance',
      );
    }
    return this.storageRepository;
  }

  protected isRepository(x: any): x is TypeOrmRepository {
    return (
      x &&
      typeof x === 'object' &&
      typeof x.find === 'function' &&
      typeof x.save === 'function' &&
      typeof x.delete === 'function' &&
      typeof x.create === 'function'
    );
  }

  private async insertPolicies(
    principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
  ): Promise<number> {
    const entities = rawPolicies.map((rawPolicy) => {
      const policy =
        typeof rawPolicy === 'string'
          ? CoreHelper.decode(rawPolicy)
          : rawPolicy;
      return this.repository.create({
        sid: policy.Sid || null,
        entity: this.normalizePrincipalField(principal.entity),
        id: this.normalizePrincipalField(principal.id),
        policy: CoreHelper.encode(policy),
      });
    });
    const result = await this.repository.save(entities);
    return result.length;
  }

  private async destroyByPrincipal(
    principal: PrincipalObject,
    sid?: string,
  ): Promise<number> {
    const where: any = {};
    const entity = this.normalizePrincipalField(principal.entity);
    const id = this.normalizePrincipalField(principal.id);

    if (entity !== null) {
      where.entity = entity;
    }
    if (id !== null) {
      where.id = id;
    }
    if (sid) {
      where.sid = sid;
    }

    const result = await this.repository.delete(
      Object.keys(where).length > 0 ? where : {},
    );
    return result.affected || 0;
  }

  private buildWhere(principal: PrincipalObject, sid?: string): any[] {
    const entity = this.normalizePrincipalField(principal.entity);
    const id = this.normalizePrincipalField(principal.id);

    // Build conditions: match specific principal OR global (null) policies
    const conditions: any[] = [];
    const baseCondition: any = {};

    if (sid) {
      baseCondition.sid = sid;
    }

    if (entity !== null && id !== null) {
      // Match: exact principal + global (null/null)
      conditions.push({ ...baseCondition, entity, id });
      conditions.push({ ...baseCondition, entity: null, id: null });
    } else if (entity !== null) {
      conditions.push({ ...baseCondition, entity });
      conditions.push({ ...baseCondition, entity: null, id: null });
    } else if (id !== null) {
      conditions.push({ ...baseCondition, id });
      conditions.push({ ...baseCondition, entity: null, id: null });
    } else {
      // Wildcard principal — match everything
      conditions.push(baseCondition);
    }

    return conditions;
  }

  private normalizePrincipalField(value: string | number | '*'): string | null {
    if (!value || value === CoreHelper.ANY) {
      return null;
    }
    return typeof value === 'string' ? value.toLowerCase() : String(value);
  }
}
