import {
  IsString,
  IsNumber,
  IsInt,
  IsDateString,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferStatus } from '../../../common/enums/offer-status.enum';

export class CreateOfferDto {
  @ApiProperty({ description: 'Vehicle ID' })
  @IsString()
  vehicleId: string;

  @ApiPropertyOptional({ description: 'Associated loan ID' })
  @IsOptional()
  @IsString()
  loanId?: string;

  @ApiProperty({ description: 'Offer title', example: 'Summer Sale - 5% APR' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Offer description',
    example: 'Special financing rate for qualified buyers',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Interest rate', example: 0.05 })
  @IsNumber()
  @Min(0)
  @Max(1)
  interestRate: number;

  @ApiProperty({ description: 'Loan term in months', example: 48 })
  @IsInt()
  @Min(12)
  @Max(96)
  termMonths: number;

  @ApiProperty({ description: 'Maximum loan amount', example: 5000000 })
  @IsNumber()
  @Min(0)
  maxLoanAmount: number;

  @ApiProperty({
    description: 'Minimum down payment percentage',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  minDownPaymentPercent: number;

  @ApiPropertyOptional({
    description: 'Minimum credit score required',
    example: 650,
  })
  @IsOptional()
  @IsInt()
  @Min(300)
  @Max(850)
  minCreditScore?: number;

  @ApiProperty({ description: 'Offer valid from date' })
  @IsDateString()
  validFrom: Date;

  @ApiProperty({ description: 'Offer valid until date' })
  @IsDateString()
  validUntil: Date;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({ description: 'Benefits (JSON)' })
  @IsOptional()
  @IsString()
  benefits?: string;
}