/**
 * Application configuration
 * Centralized configuration for all app settings
 */
export const appConfig = () => ({
  port: parseInt(process.env.PORT || '', 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API Keys
  rapidApiKey: process.env.RAPIDAPI_KEY,
  rapidApiHost: process.env.RAPIDAPI_HOST || 'vin-lookup.p.rapidapi.com',
  apiKey: process.env.API_KEY,
  
  // Security
  encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-prod',
  
  // Loan Configuration
  loanConfig: {
    minCreditScore: parseInt(process.env.MIN_CREDIT_SCORE || '', 10) || 600,
    maxLoanToValueRatio: parseFloat(process.env.MAX_LOAN_TO_VALUE_RATIO || '') || 0.8,
    minDownPaymentPercentage: parseFloat(process.env.MIN_DOWN_PAYMENT_PERCENTAGE || '') || 10,
    maxLoanTermMonths: parseInt(process.env.MAX_LOAN_TERM_MONTHS || '', 10) || 72,
    interestRates: {
      excellent: 0.05, // 5% for credit score >= 750
      good: 0.08, // 8% for credit score >= 700
      fair: 0.12, // 12% for credit score >= 650
      poor: 0.18, // 18% for credit score >= 600
    },
  },
});