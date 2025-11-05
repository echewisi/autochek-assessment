import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoanStatus } from '../../../common/enums/loan-status.enum';

export class UpdateLoanStatusDto {
  @ApiProperty({
    description: 'New loan status',
    enum: LoanStatus,
    example: LoanStatus.APPROVED,
  })
  @IsEnum(LoanStatus)
  status: LoanStatus;

  @ApiPropertyOptional({
    description: 'Reason for status change',
    example: 'All eligibility criteria met',
  })
  @IsOptional()
  @IsString()
  statusReason?: string;
}
