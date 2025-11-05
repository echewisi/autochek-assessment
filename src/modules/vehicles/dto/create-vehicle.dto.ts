import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  Length,
  IsArray,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleCondition } from '../../../common/enums/vehicle-condition.enum';

/**
 * DTO for creating a new vehicle
 * Validates all required and optional vehicle data
 */
export class CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle Identification Number (VIN)',
    example: '1HGBH41JXMN109186',
    minLength: 17,
    maxLength: 17,
  })
  @IsString()
  @Length(17, 17, { message: 'VIN must be exactly 17 characters' })
  vin: string;

  @ApiProperty({
    description: 'Vehicle manufacturer',
    example: 'Toyota',
  })
  @IsString()
  @MinLength(2)
  make: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Camry',
  })
  @IsString()
  @MinLength(2)
  model: string;

  @ApiProperty({
    description: 'Manufacturing year',
    example: 2020,
    minimum: 1900,
  })
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({
    description: 'Current mileage in kilometers',
    example: 45000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  mileage: number;

  @ApiPropertyOptional({
    description: 'Vehicle condition',
    enum: VehicleCondition,
    example: VehicleCondition.GOOD,
  })
  @IsOptional()
  @IsEnum(VehicleCondition)
  condition?: VehicleCondition;

  @ApiPropertyOptional({
    description: 'Vehicle color',
    example: 'Silver',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Transmission type',
    example: 'Automatic',
  })
  @IsOptional()
  @IsString()
  transmission?: string;

  @ApiPropertyOptional({
    description: 'Fuel type',
    example: 'Petrol',
  })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiPropertyOptional({
    description: 'Engine size',
    example: '2.5L',
  })
  @IsOptional()
  @IsString()
  engineSize?: string;

  @ApiPropertyOptional({
    description: 'Additional features (JSON string or array)',
    example: ['Sunroof', 'Leather Seats', 'Navigation'],
  })
  @IsOptional()
  features?: string | string[];

  @ApiPropertyOptional({
    description: 'Vehicle trim level',
    example: 'XLE',
  })
  @IsOptional()
  @IsString()
  trim?: string;

  @ApiPropertyOptional({
    description: 'Original purchase price',
    example: 25000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({
    description: 'License plate number',
    example: 'ABC-1234',
  })
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @ApiPropertyOptional({
    description: 'Vehicle description',
    example: 'Well-maintained family sedan with low mileage',
  })
  @IsOptional()
  @IsString()
  description?: string;


  @ApiPropertyOptional({
    description: 'Whether the vehicle is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}