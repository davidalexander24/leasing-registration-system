import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseStatusDto } from './dto/update-lease-status.dto';
import { LeasesService } from './leases.service';

@UseGuards(JwtAuthGuard)
@Controller('leases')
export class LeasesController {
  constructor(private readonly leasesService: LeasesService) {}

  @Post()
  createLease(
    @CurrentUser('userId') userId: number,
    @Body() createLeaseDto: CreateLeaseDto,
  ) {
    return this.leasesService.createForUser(userId, createLeaseDto);
  }

  @Get('me')
  getMyLeases(@CurrentUser('userId') userId: number) {
    return this.leasesService.findForUser(userId);
  }

  @Get()
  getAllLeases() {
    return this.leasesService.findAll();
  }

  @Patch(':id/status')
  updateLeaseStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeaseStatusDto: UpdateLeaseStatusDto,
  ) {
    return this.leasesService.updateStatus(id, updateLeaseStatusDto.status);
  }
}
