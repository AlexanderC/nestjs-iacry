import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('policies_storage')
export class PoliciesStorageEntity {
  @PrimaryGeneratedColumn()
  pk: number;

  @Index('policy_typeorm_sid')
  @Column({ type: 'varchar', nullable: true })
  sid: string | null;

  @Index('policy_typeorm_principal_id')
  @Column({ type: 'varchar', nullable: true })
  id: string | null;

  @Index('policy_typeorm_principal_entity')
  @Column({ type: 'varchar', nullable: true })
  entity: string | null;

  @Column({ type: 'text' })
  policy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
