
// src/modules/loans/loans.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanStatusDto } from './dto/update-loan-status.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Public } from '../../common/decorators/api-response.decorator';

@ApiTags('Loans')
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Submit loan application' })
  @ApiResponse({
    status: 201,
    description: 'Loan application submitted successfully',
  })
  async create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all loan applications' })
  @ApiResponse({
    status: 200,
    description: 'Loans retrieved successfully',
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.loansService.findAll(paginationDto);
  }

  @Get('statistics')
  @Public()
  @ApiOperation({ summary: 'Get loan statistics' })
  async getStatistics() {
    return this.loansService.getStatistics();
  }

  @Get('applicant/:email')
  @Public()
  @ApiOperation({ summary: 'Get loans by applicant email' })
  async findByApplicant(@Param('email') email: string) {
    return this.loansService.findByApplicant(email);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get loan by ID' })
  @ApiResponse({
    status: 200,
    description: 'Loan retrieved successfully',
  })
  async findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  @Patch(':id/status')
  @Public()
  @ApiOperation({ summary: 'Update loan status' })
  @ApiResponse({
    status: 200,
    description: 'Loan status updated successfully',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateLoanStatusDto,
  ) {
    return this.loansService.updateStatus(id, updateDto);
  }
}