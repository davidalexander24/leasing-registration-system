import { IsEnum } from 'class-validator';
import { LeaseStatus } from '../entities/lease.entity';

export class UpdateLeaseStatusDto {
  @IsEnum(LeaseStatus)
  status: LeaseStatus;
}
