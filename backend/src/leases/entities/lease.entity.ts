import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum LeaseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('leases')
export class Lease {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  assetName: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  leaseAmount: number;

  @Column({ type: 'int' })
  termMonths: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({
    type: 'enum',
    enum: LeaseStatus,
    default: LeaseStatus.PENDING,
  })
  status: LeaseStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.leases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
