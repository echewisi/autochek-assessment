import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Valuation } from './entities/valuation.entity';
import { ValuationRequestDto } from './dto/valuation-request.dto';
import { CreateValuationDto } from './dto/create-valuation.dto';
import { VinDecoderService } from './vin-decoder.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleCondition } from '../../common/enums/vehicle-condition.enum';
import { LoggerUtil } from '../../common/utils/logger.util';
import { ValuationFactors } from './interfaces/vin-lookup-response.interface';

/**
 * Service handling vehicle valuation logic
 * Integrates with VIN decoder and implements valuation algorithms
 */
@Injectable()
export class ValuationsService {
  private readonly logger = new LoggerUtil('ValuationsService');

  // Base depreciation rates by vehicle age
  private readonly depreciationRates = {
    0: 0.20,    // 20% first year
    1: 0.15,    // 15% second year
    2: 0.12,    // 12% third year
    3: 0.10,    // 10% fourth year
    4: 0.08,    // 8% fifth year
    default: 0.05, // 5% per year after
  };

  // Condition multipliers
  private readonly conditionMultipliers = {
    [VehicleCondition.NEW]: 1.0,
    [VehicleCondition.EXCELLENT]: 0.95,
    [VehicleCondition.GOOD]: 0.85,
    [VehicleCondition.FAIR]: 0.70,
    [VehicleCondition.POOR]: 0.50,
  };

  constructor(
    @InjectRepository(Valuation)
    private valuationRepository: Repository<Valuation>,
    private vinDecoderService: VinDecoderService,
    private vehiclesService: VehiclesService,
  ) {}

  /**
   * Request vehicle valuation
   * Handles both existing vehicles and VIN-based requests
   */
  async requestValuation(
    requestDto: ValuationRequestDto,
  ): Promise<Valuation> {
    this.logger.log('Processing valuation request', requestDto);

    let vehicle: Vehicle;

    // Get or create vehicle
    if (requestDto.vehicleId) {
      vehicle = await this.vehiclesService.findOne(requestDto.vehicleId);
    } else if (requestDto.vin) {
      // Try to find existing vehicle by VIN
      try {
        vehicle = await this.vehiclesService.findByVin(requestDto.vin);
      } catch (error) {
        // Vehicle doesn't exist, decode VIN and create
        const vinData = await this.vinDecoderService.decodeVin(requestDto.vin);
        
        vehicle = await this.vehiclesService.create({
          vin: requestDto.vin,
          make: vinData.make || 'Unknown',
          model: vinData.model || 'Unknown',
          year: vinData.year || new Date().getFullYear(),
          mileage: requestDto.mileage || 0,
          condition: requestDto.condition || VehicleCondition.GOOD,
          transmission: vinData.transmission,
          fuelType: vinData.fuel_type,
          engineSize: vinData.engine_size,
          trim: vinData.trim,
        });
      }
    } else {
      throw new BadRequestException(
        'Either vehicleId or vin must be provided',
      );
    }

    // Calculate valuation
    const valuation = await this.calculateValuation(vehicle, {
      mileage: requestDto.mileage || vehicle.mileage,
      condition: requestDto.condition || vehicle.condition,
      location: requestDto.location,
    });

    return valuation;
  }

  /**
   * Calculate vehicle valuation using proprietary algorithm
   */
  private async calculateValuation(
    vehicle: Vehicle,
    options: {
      mileage: number;
      condition: VehicleCondition;
      location?: string;
    },
  ): Promise<Valuation> {
    this.logger.log('Calculating valuation', {
      vehicleId: vehicle.id,
      ...options,
    });

    // Get base value from VIN data or estimate
    const baseValue = await this.getBaseValue(vehicle);
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - vehicle.year;

    // Calculate depreciation
    const depreciationFactor = this.calculateDepreciation(vehicleAge);
    
    // Apply condition multiplier
    const conditionMultiplier =
      this.conditionMultipliers[options.condition] || 0.85;

    // Calculate mileage adjustment (reduce value by 0.02% per 1000 km over average)
    const averageAnnualMileage = 15000; // km per year
    const expectedMileage = vehicleAge * averageAnnualMileage;
    const excessMileage = Math.max(0, options.mileage - expectedMileage);
    const mileageReduction = excessMileage / 1000 * 0.0002; // 0.02% per 1000km

    // Calculate market demand (simplified - would use real market data)
    const marketDemand = this.calculateMarketDemand(vehicle);

    // Final estimated value
    const estimatedValue =
      baseValue *
      depreciationFactor *
      conditionMultiplier *
      (1 - mileageReduction) *
      marketDemand;

    // Calculate different value types
    const tradeInValue = estimatedValue * 0.85; // 15% below market
    const retailValue = estimatedValue * 1.15; // 15% above market
    const privatePartyValue = estimatedValue * 0.95; // 5% below market

    // Prepare valuation factors
    const valuationFactors: ValuationFactors = {
      age: vehicleAge,
      mileage: options.mileage,
      condition: options.condition,
      marketDemand: marketDemand * 100,
      locationAdjustment: 1.0,
      seasonalFactor: 1.0,
      depreciationRate: depreciationFactor,
    };

    // Set valuation validity (90 days)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 90);

    // Create valuation record
    const valuation = this.valuationRepository.create({
      vehicleId: vehicle.id,
      estimatedValue: Math.round(estimatedValue),
      tradeInValue: Math.round(tradeInValue),
      retailValue: Math.round(retailValue),
      privatePartyValue: Math.round(privatePartyValue),
      valuationSource: 'Autochek Valuation Engine v1.0',
      valuationFactors: JSON.stringify(valuationFactors),
      confidenceScore: 85, // Base confidence score
      validUntil,
      isActive: true,
    });

    const savedValuation = await this.valuationRepository.save(valuation);
    this.logger.log('Valuation calculated', {
      valuationId: savedValuation.id,
      estimatedValue: savedValuation.estimatedValue,
    });

    return savedValuation;
  }

  /**
   * Get base value for vehicle (from MSRP or database)
   */
  private async getBaseValue(vehicle: Vehicle): Promise<number> {
    // If purchase price is available, use it
    if (vehicle.purchasePrice && vehicle.purchasePrice > 0) {
      return vehicle.purchasePrice;
    }

    // Otherwise estimate based on make/model/year
    // This would typically come from a pricing database
    const baseValues = {
      toyota: 28000,
      honda: 27000,
      ford: 35000,
      tesla: 45000,
      bmw: 42000,
      'mercedes-benz': 50000,
      default: 30000,
    };

    const makeKey = vehicle.make.toLowerCase();
    return baseValues[makeKey] || baseValues.default;
  }

  /**
   * Calculate cumulative depreciation factor
   */
  private calculateDepreciation(age: number): number {
    let remainingValue = 1.0;

    for (let year = 0; year < age; year++) {
      const rate =
        this.depreciationRates[year] || this.depreciationRates.default;
      remainingValue *= 1 - rate;
    }

    return Math.max(remainingValue, 0.1); // Minimum 10% of original value
  }

  /**
   * Calculate market demand factor (simplified)
   */
  private calculateMarketDemand(vehicle: Vehicle): number {
    // Popular makes have higher demand
    const popularMakes = ['toyota', 'honda', 'ford', 'chevrolet'];
    const makeLower = vehicle.make.toLowerCase();

    if (popularMakes.includes(makeLower)) {
      return 1.05; // 5% premium
    }

    return 1.0; // Standard demand
  }

  /**
   * Create manual valuation
   */
  async create(createValuationDto: CreateValuationDto): Promise<Valuation> {
    this.logger.log('Creating manual valuation', createValuationDto);

    // Verify vehicle exists
    await this.vehiclesService.findOne(createValuationDto.vehicleId);

    const valuation = this.valuationRepository.create(createValuationDto);
    return await this.valuationRepository.save(valuation);
  }

  /**
   * Get valuation by ID
   */
  async findOne(id: string): Promise<Valuation> {
    const valuation = await this.valuationRepository.findOne({
      where: { id },
      relations: ['vehicle'],
    });

    if (!valuation) {
      throw new NotFoundException(`Valuation with ID ${id} not found`);
    }

    return valuation;
  }

  /**
   * Get all valuations for a vehicle
   */
  async findByVehicle(vehicleId: string): Promise<Valuation[]> {
    return await this.valuationRepository.find({
      where: { vehicleId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get latest active valuation for a vehicle
   */
  async getLatestValuation(vehicleId: string): Promise<Valuation | null> {
    const valuation = await this.valuationRepository.findOne({
      where: {
        vehicleId,
        isActive: true,
      },
      order: { createdAt: 'DESC' },
    });

    return valuation;
  }
}