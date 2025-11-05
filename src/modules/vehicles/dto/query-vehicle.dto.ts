import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleCondition } from '../../../common/enums/vehicle-condition.enum';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * DTO for querying vehicles with filters
 */
export class QueryVehicleDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by make',
    example: 'Toyota',
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({
    description: 'Filter by model',
    example: 'Camry',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Filter by minimum year',
    example: 2018,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minYear?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum year',
    example: 2023,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxYear?: number;

  @ApiPropertyOptional({
    description: 'Filter by condition',
    enum: VehicleCondition,
  })
  @IsOptional()
  @IsEnum(VehicleCondition)
  condition?: VehicleCondition;

  @ApiPropertyOptional({
    description: 'Filter by VIN',
    example: '1HGBH41JXMN109186',
  })
  @IsOptional()
  @IsString()
  vin?: string;
}