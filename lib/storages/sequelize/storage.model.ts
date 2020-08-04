import {
  Column,
  Model,
  Table,
  CreatedAt,
  UpdatedAt,
  DataType,
  DeletedAt,
  AllowNull,
  PrimaryKey,
  AutoIncrement,
  Index,
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { PrincipalObject, PolicyInterface } from '../../interfaces/policy';
import { CoreHelper } from '../../helpers/core';

@Table({
  timestamps: true, // add the timestamp attributes (updatedAt, createdAt)
  indexes: [
    {
      name: 'entity_id_sid',
      fields: ['entity', 'id', 'sid'],
      unique: true,
    },
  ],
})
export class PoliciesStorage<T> extends Model<PoliciesStorage<T>>
  implements PrincipalObject {
  @PrimaryKey
  @AutoIncrement
  @Column
  pk: number;

  @AllowNull(true)
  @Column
  sid: string;

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

  static async savePrincipalPolicies(
    principal: PrincipalObject,
    rawPolicies: Array<string | PolicyInterface>,
    attach = true,
  ): Promise<number> {
    if (!attach) {
      await this.destroyByPrincipal(principal);
    }

    const result = await this.bulkCreate(
      rawPolicies.map((rawPolicy) => ({
        entity:
          principal.entity === CoreHelper.ANY
            ? null
            : this.normalizePolicyItem(principal.entity),
        id: principal.id === CoreHelper.ANY ? null : principal.id,
        policy:
          typeof rawPolicy === 'string' ? rawPolicy : JSON.stringify(rawPolicy),
      })),
    );

    return result.length;
  }

  static async savePrincipalPolicyBySid(
    principal: PrincipalObject,
    sid: string,
    rawPolicy: string | PolicyInterface,
  ): Promise<number> {
    await this.upsert({
      sid,
      entity:
        principal.entity === CoreHelper.ANY
          ? null
          : this.normalizePolicyItem(principal.entity),
      id: principal.id === CoreHelper.ANY ? null : principal.id,
      policy:
        typeof rawPolicy === 'string' ? rawPolicy : JSON.stringify(rawPolicy),
    });

    return 1;
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

  static async findByPrincipal(
    principal: PrincipalObject,
    sid?: string,
  ): Promise<Array<string>> {
    const payload = {
      where: {
        entity: {
          [Op.or]: [null], // select for global scope
        },
        id: {
          [Op.or]: [null], // select for global scope
        },
        sid,
      },
      attributes: ['policy'],
    };

    if (!sid) {
      delete payload.where.sid;
    }

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

    // remove an empty where clause
    if (!payload.where.entity && !payload.where.id && !payload.where.sid) {
      delete payload.where;
    }

    const entries = await this.findAll(payload);
    return entries.map(({ policy }) => policy);
  }

  private static normalizePolicyItem(item: string): string {
    return item.toLowerCase();
  }
}
