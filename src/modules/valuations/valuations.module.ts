import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValuationsService } from './valuations.service';
import { ValuationsController } from './valuations.controller';
import { VinDecoderService } from './vin-decoder.service';
import { Valuation } from './entities/valuation.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';


@Module({
  imports: [TypeOrmModule.forFeature([Valuation]), VehiclesModule],
  controllers: [ValuationsController],
  providers: [ValuationsService, VinDecoderService],
  exports: [ValuationsService],
})
export class ValuationsModule {}