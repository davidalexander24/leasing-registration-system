import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateLeaseDto {
  @IsString()
  assetName: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  leaseAmount: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  termMonths: number;

  @IsDateString()
  startDate: string;
}
