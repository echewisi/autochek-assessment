// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';
import { Valuation } from '../modules/valuations/entities/valuation.entity';
import { Loan } from '../modules/loans/entities/loan.entity';
import { Offer } from '../modules/offers/entities/offer.entity';

/**
 * Database configuration for TypeORM
 * Uses in-memory SQLite for development and testing
 */
export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'sqlite',
  database: ':memory:',
  entities: [Vehicle, Valuation, Loan, Offer],
  synchronize: true, // Auto-create schema (only for development)
  logging: process.env.NODE_ENV === 'development',
  dropSchema: false,
});