import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { Public } from '../../common/decorators/api-response.decorator';

/**
 * Controller handling vehicle-related HTTP requests
 * Provides RESTful endpoints for vehicle management
 */
@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  /**
   * Create a new vehicle
   * POST /vehicles
   */
  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Vehicle with VIN already exists',
  })
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  /**
   * Get all vehicles with optional filtering
   * GET /vehicles
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all vehicles with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Vehicles retrieved successfully',
  })
  async findAll(@Query() queryDto: QueryVehicleDto) {
    return this.vehiclesService.findAll(queryDto);
  }

  /**
   * Get vehicle statistics
   * GET /vehicles/statistics
   */
  @Get('statistics')
  @Public()
  @ApiOperation({ summary: 'Get vehicle statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics() {
    return this.vehiclesService.getStatistics();
  }

  /**
   * Get vehicle by VIN
   * GET /vehicles/vin/:vin
   */
  @Get('vin/:vin')
  @Public()
  @ApiOperation({ summary: 'Get vehicle by VIN' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  async findByVin(@Param('vin') vin: string) {
    return this.vehiclesService.findByVin(vin);
  }

  /**
   * Get vehicle by ID
   * GET /vehicles/:id
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  async findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  /**
   * Update vehicle information
   * PATCH /vehicles/:id
   */
  @Patch(':id')
  @Public()
  @ApiOperation({ summary: 'Update vehicle information' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  /**
   * Delete a vehicle (soft delete)
   * DELETE /vehicles/:id
   */
  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a vehicle' })
  @ApiResponse({
    status: 204,
    description: 'Vehicle deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  async remove(@Param('id') id: string) {
    await this.vehiclesService.remove(id);
  }
}