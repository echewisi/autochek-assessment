// src/modules/loans/loans.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { LoanEligibilityService } from './loan-eligibility.service';
import { Loan } from './entities/loan.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { ValuationsModule } from '../valuations/valuations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan]),
    VehiclesModule,
    ValuationsModule,
  ],
  controllers: [LoansController],
  providers: [LoansService, LoanEligibilityService],
  exports: [LoansService],
})
export class LoansModule {}