import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeasesController } from './leases.controller';
import { LeasesService } from './leases.service';
import { Lease } from './entities/lease.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lease])],
  controllers: [LeasesController],
  providers: [LeasesService],
})
export class LeasesModule {}
