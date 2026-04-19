import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { Lease, LeaseStatus } from './entities/lease.entity';

@Injectable()
export class LeasesService {
  constructor(
    @InjectRepository(Lease)
    private readonly leasesRepository: Repository<Lease>,
  ) {}

  createForUser(userId: number, createLeaseDto: CreateLeaseDto) {
    const lease = this.leasesRepository.create({
      ...createLeaseDto,
      userId,
      status: LeaseStatus.PENDING,
    });
    return this.leasesRepository.save(lease);
  }

  findForUser(userId: number) {
    return this.leasesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findAll() {
    return this.leasesRepository.find({
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: number, status: LeaseStatus) {
    const lease = await this.leasesRepository.findOne({ where: { id } });
    if (!lease) {
      throw new NotFoundException('Lease not found');
    }

    lease.status = status;
    return this.leasesRepository.save(lease);
  }
}
