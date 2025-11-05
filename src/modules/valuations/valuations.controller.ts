import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ValuationsService } from './valuations.service';
import { ValuationRequestDto } from './dto/valuation-request.dto';
import { CreateValuationDto } from './dto/create-valuation.dto';
import { Public } from '../../common/decorators/api-response.decorator';

/**
 * Controller handling valuation-related HTTP requests
 */
@ApiTags('Valuations')
@Controller('valuations')
export class ValuationsController {
  constructor(private readonly valuationsService: ValuationsService) {}

  /**
   * Request vehicle valuation
   * POST /valuations/request
   */
  @Post('request')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request vehicle valuation' })
  @ApiResponse({
    status: 200,
    description: 'Valuation calculated successfully',
  })
  async requestValuation(@Body() requestDto: ValuationRequestDto) {
    return this.valuationsService.requestValuation(requestDto);
  }

  /**
   * Create manual valuation
   * POST /valuations
   */
  @Post()
  @Public()
  @ApiOperation({ summary: 'Create manual valuation' })
  @ApiResponse({
    status: 201,
    description: 'Valuation created successfully',
  })
  async create(@Body() createDto: CreateValuationDto) {
    return this.valuationsService.create(createDto);
  }

  /**
   * Get valuation by ID
   * GET /valuations/:id
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get valuation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Valuation retrieved successfully',
  })
  async findOne(@Param('id') id: string) {
    return this.valuationsService.findOne(id);
  }

  /**
   * Get valuations by vehicle ID
   * GET /valuations/vehicle/:vehicleId
   */
  @Get('vehicle/:vehicleId')
  @Public()
  @ApiOperation({ summary: 'Get all valuations for a vehicle' })
  @ApiResponse({
    status: 200,
    description: 'Valuations retrieved successfully',
  })
  async findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.valuationsService.findByVehicle(vehicleId);
  }

  /**
   * Get latest valuation for vehicle
   * GET /valuations/vehicle/:vehicleId/latest
   */
  @Get('vehicle/:vehicleId/latest')
  @Public()
  @ApiOperation({ summary: 'Get latest active valuation for a vehicle' })
  @ApiResponse({
    status: 200,
    description: 'Latest valuation retrieved successfully',
  })
  async getLatestValuation(@Param('vehicleId') vehicleId: string) {
    return this.valuationsService.getLatestValuation(vehicleId);
  }
}