import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoanEligibilityResult } from './dto/loan-eligibility.dto';
import { LoggerUtil } from '../../common/utils/logger.util';

/**
 * Service for checking loan eligibility
 * Implements business rules for loan approval
 */
@Injectable()
export class LoanEligibilityService {
  private readonly logger = new LoggerUtil('LoanEligibilityService');
  private readonly loanConfig: any;

  constructor(private configService: ConfigService) {
    this.loanConfig = this.configService.get('loanConfig');
  }

  /**
   * Check loan eligibility based on predefined criteria
   */
  checkEligibility(params: {
    creditScore: number;
    vehicleValue: number;
    requestedAmount: number;
    downPayment: number;
    monthlyIncome: number;
    loanTermMonths: number;
    existingDebts?: number;
  }): LoanEligibilityResult {
    this.logger.log('Checking loan eligibility', params);

    const {
      creditScore,
      vehicleValue,
      requestedAmount,
      downPayment,
      monthlyIncome,
      loanTermMonths,
      existingDebts = 0,
    } = params;

    const reasons: string[] = [];
    const result: LoanEligibilityResult = {
      isEligible: true,
      reasons: [],
      checks: {
        creditScore: {
          passed: false,
          value: creditScore,
          required: this.loanConfig.minCreditScore,
        },
        loanToValue: {
          passed: false,
          value: 0,
          maximum: this.loanConfig.maxLoanToValueRatio,
        },
        downPayment: {
          passed: false,
          value: 0,
          minimum: this.loanConfig.minDownPaymentPercentage,
        },
        debtToIncome: {
          passed: false,
          value: 0,
          maximum: 0.43, // 43% DTI ratio maximum
        },
        loanTerm: {
          passed: false,
          value: loanTermMonths,
          maximum: this.loanConfig.maxLoanTermMonths,
        },
      },
    };

    // 1. Credit Score Check
    if (creditScore >= this.loanConfig.minCreditScore) {
      result.checks.creditScore.passed = true;
    } else {
      result.isEligible = false;
      reasons.push(
        `Credit score ${creditScore} is below minimum required ${this.loanConfig.minCreditScore}`,
      );
    }

    // 2. Loan-to-Value Ratio Check (use financed amount = requested - downPayment)
    const financedAmount = Math.max(0, requestedAmount - downPayment);
    const ltvRatio = financedAmount / vehicleValue;
    result.checks.loanToValue.value = ltvRatio;

    if (ltvRatio <= this.loanConfig.maxLoanToValueRatio) {
      result.checks.loanToValue.passed = true;
    } else {
      result.isEligible = false;
      reasons.push(
        `Loan-to-value ratio ${(ltvRatio * 100).toFixed(2)}% exceeds maximum ${(this.loanConfig.maxLoanToValueRatio * 100).toFixed(2)}%`,
      );
    }

    // 3. Down Payment Check
    const downPaymentPercentage = (downPayment / vehicleValue) * 100;
    result.checks.downPayment.value = downPaymentPercentage;

    if (downPaymentPercentage >= this.loanConfig.minDownPaymentPercentage) {
      result.checks.downPayment.passed = true;
    } else {
      result.isEligible = false;
      reasons.push(
        `Down payment ${downPaymentPercentage.toFixed(2)}% is below minimum ${this.loanConfig.minDownPaymentPercentage}%`,
      );
    }

    // 4. Debt-to-Income Ratio Check
    const interestRate = this.determineInterestRate(creditScore);
    const monthlyPayment = this.calculateMonthlyPayment(
      financedAmount,
      interestRate,
      loanTermMonths,
    );
    const totalMonthlyDebt = monthlyPayment + existingDebts;
    const dtiRatio = totalMonthlyDebt / monthlyIncome;
    result.checks.debtToIncome.value = dtiRatio;

    if (dtiRatio <= 0.43) {
      // 43% is standard DTI limit
      result.checks.debtToIncome.passed = true;
    } else {
      result.isEligible = false;
      reasons.push(
        `Debt-to-income ratio ${(dtiRatio * 100).toFixed(2)}% exceeds maximum 43%`,
      );
    }

    // 5. Loan Term Check
    if (loanTermMonths <= this.loanConfig.maxLoanTermMonths) {
      result.checks.loanTerm.passed = true;
    } else {
      result.isEligible = false;
      reasons.push(
        `Loan term ${loanTermMonths} months exceeds maximum ${this.loanConfig.maxLoanTermMonths} months`,
      );
    }

    // Set results
    result.reasons = reasons;
    
    if (result.isEligible) {
      result.recommendedInterestRate = interestRate;
      result.maxApprovedAmount = requestedAmount;
    } else {
      // Calculate maximum eligible amount if not eligible
      const maxLoanAmount = Math.min(
        vehicleValue * this.loanConfig.maxLoanToValueRatio,
        monthlyIncome * 0.43 * loanTermMonths - existingDebts * loanTermMonths,
      );
      result.maxApprovedAmount = Math.max(0, maxLoanAmount);
    }

    this.logger.log('Eligibility check completed', {
      isEligible: result.isEligible,
      reasons: result.reasons,
    });

    return result;
  }

  /**
   * Determine interest rate based on credit score
   */
  determineInterestRate(creditScore: number): number {
    const rates = this.loanConfig.interestRates;

    if (creditScore >= 750) return rates.excellent;
    if (creditScore >= 700) return rates.good;
    if (creditScore >= 650) return rates.fair;
    return rates.poor;
  }

  /**
   * Calculate monthly payment using amortization formula
   */
  calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    months: number,
  ): number {
    if (annualRate === 0) {
      return Math.round((principal / months) * 100) / 100;
    }

    const monthlyRate = annualRate / 12;
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    this.logger.log('Monthly payment calculated', { principal, annualRate, months, payment });

    return Math.round(payment * 100) / 100;
  }

  /**
   * Calculate total payable amount
   */
  calculateTotalPayable(monthlyPayment: number, months: number): number {
    return Math.round(monthlyPayment * months * 100) / 100;
  }
}