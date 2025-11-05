// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ValuationsModule } from './modules/valuations/valuations.module';
import { LoansModule } from './modules/loans/loans.module';
import { OffersModule } from './modules/offers/offers.module';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { validationSchema } from './config/validation.schema';

/**
 * Root application module
 * Configures all feature modules and global providers
 */
@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
      envFilePath: ['.env', '.env.local'],
    }),
    
    // Database module
    TypeOrmModule.forRoot(databaseConfig()),
    
    // Feature modules
    VehiclesModule,
    ValuationsModule,
    LoansModule,
    OffersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}