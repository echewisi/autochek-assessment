import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanStatusDto } from './dto/update-loan-status.dto';
import { LoanEligibilityService } from './loan-eligibility.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { ValuationsService } from '../valuations/valuations.service';
import { LoanStatus } from '../../common/enums/loan-status.enum';
import { LoggerUtil } from '../../common/utils/logger.util';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * Service handling loan application and management
 */
@Injectable()
export class LoansService {
  private readonly logger = new LoggerUtil('LoansService');

  constructor(
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
    private vehiclesService: VehiclesService,
    private valuationsService: ValuationsService,
    private eligibilityService: LoanEligibilityService,
  ) {}

  /**
   * Create new loan application
   */
  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    this.logger.log('Processing new loan application', {
      vehicleId: createLoanDto.vehicleId,
      applicant: createLoanDto.applicantEmail,
    });

    // Verify vehicle exists
    const vehicle = await this.vehiclesService.findOne(
      createLoanDto.vehicleId,
    );
    
    if (!vehicle) {
      throw new BadRequestException(`Vehicle with ID ${createLoanDto.vehicleId} does not exist!`);
    }

    // Get latest valuation or create one
    let valuation = await this.valuationsService.getLatestValuation(
      createLoanDto.vehicleId,
    );

    if (!valuation) {
      this.logger.log('No valuation found, requesting new valuation');
      valuation = await this.valuationsService.requestValuation({
        vehicleId: createLoanDto.vehicleId,
      });
    }

    const vehicleValue = valuation.estimatedValue;

    // Check eligibility
    const eligibilityResult = this.eligibilityService.checkEligibility({
      creditScore: createLoanDto.creditScore,
      vehicleValue: Number(vehicleValue),
      requestedAmount: createLoanDto.requestedAmount,
      downPayment: createLoanDto.downPayment,
      monthlyIncome: createLoanDto.monthlyIncome,
      loanTermMonths: createLoanDto.loanTermMonths,
    });

    // Calculate loan details
    const interestRate =
      eligibilityResult.recommendedInterestRate ||
      this.eligibilityService['determineInterestRate'](
        createLoanDto.creditScore,
      );

    // Use financed amount (requested - downPayment) for payment and ratios
    const financedAmount = Math.max(
      0,
      createLoanDto.requestedAmount - createLoanDto.downPayment,
    );

    const monthlyPayment = this.eligibilityService.calculateMonthlyPayment(
      financedAmount,
      interestRate,
      createLoanDto.loanTermMonths,
    );

    const totalPayable = this.eligibilityService.calculateTotalPayable(
      monthlyPayment,
      createLoanDto.loanTermMonths,
    );

    const ltvRatio = financedAmount / Number(vehicleValue);
    if (ltvRatio > 5) {
      this.logger.warn('Unrealistic LTV ratio detected', { ltvRatio, vehicleValue });
    }

    const dtiRatio = monthlyPayment / createLoanDto.monthlyIncome;
    if (dtiRatio > 1) {
      this.logger.warn('Unrealistic DTI ratio detected', { dtiRatio, monthlyPayment });
    }

    // Create loan application
    const loan = this.loanRepository.create({
      ...createLoanDto,
      status: eligibilityResult.isEligible
        ? LoanStatus.UNDER_REVIEW
        : LoanStatus.REJECTED,
      approvedAmount: eligibilityResult.isEligible
        ? financedAmount
        : undefined,
      interestRate,
      monthlyPayment,
      totalPayable,
      loanToValueRatio: ltvRatio,
      debtToIncomeRatio: dtiRatio,
      eligibilityCheck: JSON.stringify(eligibilityResult),
      statusReason: eligibilityResult.isEligible
        ? 'Passed initial eligibility checks'
        : eligibilityResult.reasons.join('; '),
      ...(eligibilityResult.isEligible ? {} : { rejectedAt: new Date() }),
    });

    const savedLoan = await this.loanRepository.save(loan);
    
    this.logger.log('Loan application created', {
      loanId: savedLoan.id,
      status: savedLoan.status,
    });

    return savedLoan;
  }

  /**
   * Get all loans with pagination
   */
  async findAll(paginationDto: PaginationDto) {
    const pageNum = paginationDto.page ?? 1;
    const limitNum = paginationDto.limit ?? 10;
    const skip = paginationDto.skip;

    const [data, total] = await this.loanRepository.findAndCount({
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
      skip,
      take: limitNum,
    });

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Get loan by ID
   */
  async findOne(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['vehicle'],
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    return loan;
  }

  /**
   * Get loans by applicant email
   */
  async findByApplicant(email: string): Promise<Loan[]> {
    return await this.loanRepository.find({
      where: { applicantEmail: email },
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update loan status
   */
  async updateStatus(
    id: string,
    updateDto: UpdateLoanStatusDto,
  ): Promise<Loan> {
    this.logger.log('Updating loan status', { id, status: updateDto.status });

    const loan = await this.findOne(id);

    // Update status-specific fields
    const updates: Partial<Loan> = {
      status: updateDto.status,
      statusReason: updateDto.statusReason,
    };

    switch (updateDto.status) {
      case LoanStatus.APPROVED:
        updates.approvedAt = new Date();
        break;
      case LoanStatus.REJECTED:
        updates.rejectedAt = new Date();
        updates.approvedAmount = undefined;
        break;
      case LoanStatus.DISBURSED:
        updates.disbursedAt = new Date();
        break;
    }

    Object.assign(loan, updates);
    const updatedLoan = await this.loanRepository.save(loan);

    this.logger.log('Loan status updated', {
      id,
      newStatus: updateDto.status,
    });

    return updatedLoan;
  }

  /**
   * Get loan statistics
   */
  async getStatistics() {
    const total = await this.loanRepository.count();

    const byStatus = await this.loanRepository
      .createQueryBuilder('loan')
      .select('loan.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('loan.status')
      .getRawMany();

    const totalApproved = await this.loanRepository
      .createQueryBuilder('loan')
      .select('SUM(loan.approvedAmount)', 'total')
      .where('loan.status IN (:...statuses)', {
        statuses: [
          LoanStatus.APPROVED,
          LoanStatus.DISBURSED,
          LoanStatus.ACTIVE,
        ],
      })
      .getRawOne();

    return {
      total,
      byStatus,
      totalApprovedAmount: totalApproved?.total || 0,
    };
  }
}