// src/modules/loans/dto/create-loan.dto.ts
import {
  IsString,
  IsEmail,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoanDto {
  @ApiProperty({
    description: 'Vehicle ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  vehicleId: string;

  @ApiProperty({
    description: 'Applicant full name',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2)
  applicantName: string;

  @ApiProperty({
    description: 'Applicant email',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  applicantEmail: string;

  @ApiProperty({
    description: 'Applicant phone number',
    example: '+234-XXX-XXX-XXXX',
  })
  @IsString()
  applicantPhone: string;

  @ApiPropertyOptional({
    description: 'Applicant address',
    example: '123 Main Street, Lagos',
  })
  @IsOptional()
  @IsString()
  applicantAddress?: string;

  @ApiPropertyOptional({
    description: 'Employment details (JSON)',
  })
  @IsOptional()
  @IsString()
  applicantEmployment?: string;

  @ApiProperty({
    description: 'Monthly income',
    example: 500000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  monthlyIncome: number;

  @ApiProperty({
    description: 'Credit score (300-850)',
    example: 720,
    minimum: 300,
    maximum: 850,
  })
  @IsInt()
  @Min(300)
  @Max(850)
  creditScore: number;

  @ApiProperty({
    description: 'Requested loan amount',
    example: 5000000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  requestedAmount: number;

  @ApiProperty({
    description: 'Down payment amount',
    example: 1000000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  downPayment: number;

  @ApiProperty({
    description: 'Loan term in months',
    example: 48,
    minimum: 12,
    maximum: 96,
  })
  @IsInt()
  @Min(12)
  @Max(96)
  loanTermMonths: number;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}