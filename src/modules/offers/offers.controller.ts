import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Public } from '../../common/decorators/api-response.decorator';

@ApiTags('Offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create new offer' })
  create(@Body() createOfferDto: CreateOfferDto) {
    return this.offersService.create(createOfferDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all offers' })
  findAll() {
    return this.offersService.findAll();
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get active offers' })
  findActive() {
    return this.offersService.findActive();
  }

  @Get('vehicle/:vehicleId')
  @Public()
  @ApiOperation({ summary: 'Get offers for vehicle' })
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.offersService.findByVehicle(vehicleId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get offer by ID' })
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Patch(':id')
  @Public()
  @ApiOperation({ summary: 'Update offer' })
  update(@Param('id') id: string, @Body() updateOfferDto: UpdateOfferDto) {
    return this.offersService.update(id, updateOfferDto);
  }

  @Delete(':id')
  @Public()
  @ApiOperation({ summary: 'Delete offer' })
  remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }
}