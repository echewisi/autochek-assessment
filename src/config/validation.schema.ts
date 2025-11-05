import * as Joi from 'joi';

/**
 * Environment variables validation schema
 * Ensures all required environment variables are present and valid
 */
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  // API_PREFIX: Joi.string().default('api/v1'),
  
  // Optional API keys for external services
  RAPIDAPI_KEY: Joi.string().optional(),
  RAPIDAPI_HOST: Joi.string().default('vin-lookup.p.rapidapi.com'),
  API_KEY: Joi.string().optional(),
  
  // Security
  // ENCRYPTION_KEY: Joi.string().min(32).optional(),
  
  // Loan configuration (all optional with defaults)
  MIN_CREDIT_SCORE: Joi.number().min(300).max(850).default(600),
  MAX_LOAN_TO_VALUE_RATIO: Joi.number().min(0).max(1).default(0.8),
  MIN_DOWN_PAYMENT_PERCENTAGE: Joi.number().min(0).max(100).default(10),
  MAX_LOAN_TERM_MONTHS: Joi.number().min(12).max(96).default(72),
});