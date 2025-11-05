import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { PaginationResult } from '../../common/interfaces/pagination-result.interface';
import { LoggerUtil } from '../../common/utils/logger.util';

/**
 * Service handling all vehicle-related business logic
 * Manages vehicle data ingestion, retrieval, and updates
 */
@Injectable()
export class VehiclesService {
  private readonly logger = new LoggerUtil('VehiclesService');

  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  /**
   * Create a new vehicle in the system
   * Validates VIN uniqueness and normalizes data
   */
  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    this.logger.log('Creating new vehicle', { vin: createVehicleDto.vin });

    // Check if VIN already exists
    const existingVehicle = await this.vehicleRepository.findOne({
      where: { vin: createVehicleDto.vin },
    });

    if (existingVehicle) {
      throw new ConflictException(
        `Vehicle with VIN ${createVehicleDto.vin} already exists`,
      );
    }

    // Validate year is not in the future
    if (createVehicleDto.year > new Date().getFullYear() + 1) {
      throw new BadRequestException('Vehicle year cannot be in the future');
    }

    // Normalize features to JSON string if array provided
    const normalizedFeatures: string | undefined = Array.isArray(
      createVehicleDto.features,
    )
      ? JSON.stringify(createVehicleDto.features)
      : createVehicleDto.features;

    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      features: normalizedFeatures,
      vin: createVehicleDto.vin.toUpperCase(), // Normalize VIN to uppercase
    });

    const savedVehicle = await this.vehicleRepository.save(vehicle);
    this.logger.log('Vehicle created successfully', { id: savedVehicle.id });

    return savedVehicle;
  }

  /**
   * Retrieve all vehicles with optional filtering and pagination
   */
  async findAll(
    queryDto: QueryVehicleDto,
  ): Promise<PaginationResult<Vehicle>> {
    this.logger.log('Fetching vehicles', queryDto);

    const { make, model, minYear, maxYear, condition, vin } = queryDto;
    const pageNum = queryDto.page ?? 1;
    const limitNum = queryDto.limit ?? 10;

    // Build dynamic query
    const queryBuilder = this.vehicleRepository.createQueryBuilder('vehicle');

    if (make) {
      queryBuilder.andWhere('LOWER(vehicle.make) LIKE LOWER(:make)', {
        make: `%${make}%`,
      });
    }

    if (model) {
      queryBuilder.andWhere('LOWER(vehicle.model) LIKE LOWER(:model)', {
        model: `%${model}%`,
      });
    }

    if (minYear) {
      queryBuilder.andWhere('vehicle.year >= :minYear', { minYear });
    }

    if (maxYear) {
      queryBuilder.andWhere('vehicle.year <= :maxYear', { maxYear });
    }

    if (condition) {
      queryBuilder.andWhere('vehicle.condition = :condition', { condition });
    }

    if (vin) {
      queryBuilder.andWhere('vehicle.vin = :vin', { vin: vin.toUpperCase() });
    }

    // Add pagination
    const skip = (pageNum - 1) * limitNum;
    queryBuilder.skip(skip).take(limitNum);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Retrieve a single vehicle by ID
   */
  async findOne(id: string): Promise<Vehicle> {
    this.logger.log('Fetching vehicle by ID', { id });

    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['valuations', 'loans'],
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  /**
   * Retrieve a vehicle by VIN
   */
  async findByVin(vin: string): Promise<Vehicle> {
    this.logger.log('Fetching vehicle by VIN', { vin });

    const vehicle = await this.vehicleRepository.findOne({
      where: { vin: vin.toUpperCase() },
      relations: ['valuations', 'loans'],
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with VIN ${vin} not found`);
    }

    return vehicle;
  }

  /**
   * Update vehicle information
   */
  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    this.logger.log('Updating vehicle', { id });

    const vehicle = await this.findOne(id);

    // If VIN is being updated, check for conflicts
    if (updateVehicleDto.vin && updateVehicleDto.vin !== vehicle.vin) {
      const existingVehicle = await this.vehicleRepository.findOne({
        where: { vin: updateVehicleDto.vin.toUpperCase() },
      });

      if (existingVehicle) {
        throw new ConflictException(
          `Vehicle with VIN ${updateVehicleDto.vin} already exists`,
        );
      }
    }

    // Normalize features when provided
    const normalizedFeatures: string | undefined = Array.isArray(
      updateVehicleDto.features,
    )
      ? JSON.stringify(updateVehicleDto.features)
      : updateVehicleDto.features;



    Object.assign(vehicle, {
      ...updateVehicleDto,
      features: normalizedFeatures,
      ...(updateVehicleDto.vin && { vin: updateVehicleDto.vin.toUpperCase() }),
    });

    const updatedVehicle = await this.vehicleRepository.save(vehicle);
    this.logger.log('Vehicle updated successfully', { id });

    return updatedVehicle;
  }

  /**
   * Soft delete a vehicle (mark as inactive)
   */
  async remove(id: string): Promise<void> {
    this.logger.log('Deleting vehicle', { id });

    const vehicle = await this.findOne(id);
    vehicle.isActive = false;
    await this.vehicleRepository.save(vehicle);

    this.logger.log('Vehicle deleted successfully', { id });
  }

  /**
   * Get vehicle statistics
   */
  async getStatistics() {
    this.logger.log('Fetching vehicle statistics');

    const total = await this.vehicleRepository.count();
    const active = await this.vehicleRepository.count({
      where: { isActive: true },
    });

    // Get count by make
    const byMake = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .select('vehicle.make', 'make')
      .addSelect('COUNT(*)', 'count')
      .groupBy('vehicle.make')
      .getRawMany();

    // Get count by year
    const byYear = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .select('vehicle.year', 'year')
      .addSelect('COUNT(*)', 'count')
      .groupBy('vehicle.year')
      .orderBy('vehicle.year', 'DESC')
      .getRawMany();

    return {
      total,
      active,
      inactive: total - active,
      byMake,
      byYear,
    };
  }
}