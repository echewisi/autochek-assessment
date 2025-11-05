export interface LoanEligibilityResult {
  isEligible: boolean;
  reasons: string[];
  checks: {
    creditScore: { passed: boolean; value: number; required: number };
    loanToValue: { passed: boolean; value: number; maximum: number };
    downPayment: { passed: boolean; value: number; minimum: number };
    debtToIncome: { passed: boolean; value: number; maximum: number };
    loanTerm: { passed: boolean; value: number; maximum: number };
  };
  recommendedInterestRate?: number;
  maxApprovedAmount?: number;
}