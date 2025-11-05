import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class CreateValuationDto {
  @ApiProperty({
    description: 'Vehicle ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  vehicleId: string;

  @ApiProperty({
    description: 'Estimated market value',
    example: 15000,
  })
  @IsNumber()
  @Min(0)
  estimatedValue: number;

  @ApiPropertyOptional({
    description: 'Trade-in value',
    example: 13000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tradeInValue?: number;

  @ApiPropertyOptional({
    description: 'Retail value',
    example: 17000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  retailValue?: number;

  @ApiPropertyOptional({
    description: 'Private party value',
    example: 14500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  privatePartyValue?: number;

  @ApiPropertyOptional({
    description: 'Source of valuation',
    example: 'Manual Appraisal',
  })
  @IsOptional()
  @IsString()
  valuationSource?: string;

  @ApiPropertyOptional({
    description: 'Valuation factors (JSON string)',
    example: '{"age": 5, "mileage": 50000}',
  })
  @IsOptional()
  @IsString()
  valuationFactors?: string;

  @ApiPropertyOptional({
    description: 'Confidence score (0-100)',
    example: 85,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidenceScore?: number;

  @ApiPropertyOptional({
    description: 'Market trends (JSON string)',
    example: '{"trend": "stable"}',
  })
  @IsOptional()
  @IsString()
  marketTrends?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Vehicle in excellent condition',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Valuation valid until date',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  validUntil?: Date;

  @ApiPropertyOptional({
    description: 'Is valuation active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}