import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleCondition } from '../../../common/enums/vehicle-condition.enum';


export class ValuationRequestDto {
  @ApiPropertyOptional({
    description: 'Existing vehicle ID in system',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({
    description: 'Vehicle VIN (if vehicle not in system)',
    example: '1HGBH41JXMN109186',
  })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional({
    description: 'Current mileage for valuation',
    example: 50000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mileage?: number;

  @ApiPropertyOptional({
    description: 'Vehicle condition',
    enum: VehicleCondition,
    example: VehicleCondition.GOOD,
  })
  @IsOptional()
  @IsEnum(VehicleCondition)
  condition?: VehicleCondition;

  @ApiPropertyOptional({
    description: 'Location/city for market adjustment',
    example: 'Lagos',
  })
  @IsOptional()
  @IsString()
  location?: string;
}