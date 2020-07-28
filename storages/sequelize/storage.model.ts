import {
  Column, Model, Table, CreatedAt, UpdatedAt, DataType,
  DeletedAt, AllowNull, PrimaryKey, AutoIncrement,
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { PrincipalObject, PolicyInterface } from '../../interfaces/policy';
import { CoreHelper } from '../../helpers/core';

@Table({
  timestamps: true, // add the timestamp attributes (updatedAt, createdAt)
  paranoid: true, // don't delete database entries but set the newly added attribute deletedAt
})
export class PoliciesStorage<T> extends Model<PoliciesStorage<T>> implements PrincipalObject {
  @PrimaryKey
  @AutoIncrement
  @Column
  pk: number;

  @AllowNull(true)
  @Column
  id: string;

  @AllowNull(true)
  @Column
  entity: string;

  @Column(DataType.TEXT)
  policy: string; // @todo: change to blob?

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;

  static async savePrincipalPolicies(principal: PrincipalObject, rawPolicies: Array<string | PolicyInterface>, attach = true): Promise<number> {
    if (!attach) {
      await this.destroyByPrincipal(principal);
    }

    const result = await this.bulkCreate(
      rawPolicies.map(policy => ({
        entity: principal.entity === CoreHelper.ANY ? null : this.normalizePolicyItem(principal.entity),
        id: principal.id === CoreHelper.ANY ? null : principal.id,
        policy: typeof policy === 'string' ? policy : JSON.stringify(policy),
      })),
    );

    return result.length;
  }

  static async destroyByPrincipal(principal: PrincipalObject): Promise<number> {
    const payload = {
      where: {
        entity: {
          [Op.or]: [null], // select for global scope
        },
        id: {
          [Op.or]: [null], // select for global scope
        },
      },
    };

    // allow any entity
    if (principal.entity === CoreHelper.ANY) {
      delete payload.where.entity;
    } else {
      payload.where.entity[Op.or].push(
        this.normalizePolicyItem(principal.entity),
      );
    }

    // allow any entity
    if (principal.id === CoreHelper.ANY) {
      delete payload.where.id;
    } else {
      payload.where.id[Op.or].push(principal.id);
    }

    // remove empty where clause
    if (!payload.where.entity && !payload.where.id) {
      delete payload.where;
    }

    return this.destroy(payload);
  }

  static async findByPrincipal(principal: PrincipalObject): Promise<Array<string>> {
    const payload = {
      where: {
        entity: {
          [Op.or]: [null], // select for global scope
        },
        id: {
          [Op.or]: [null], // select for global scope
        },
      },
      attributes: ['policy'],
    };

    // allow any entity
    if (principal.entity === CoreHelper.ANY) {
      delete payload.where.entity;
    } else {
      payload.where.entity[Op.or].push(
        this.normalizePolicyItem(principal.entity),
      );
    }

    // allow any entity
    if (principal.id === CoreHelper.ANY) {
      delete payload.where.id;
    } else {
      payload.where.id[Op.or].push(principal.id);
    }

    // remove empty where clause
    if (!payload.where.entity && !payload.where.id) {
      delete payload.where;
    }

    const entries = await this.findAll(payload);
    return entries.map(({ policy }) => policy);
  }

  static normalizePolicyItem(item: string): string {
    return item.toLowerCase();
  }
}