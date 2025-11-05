import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferStatus } from '../../common/enums/offer-status.enum';
import { LoggerUtil } from '../../common/utils/logger.util';

@Injectable()
export class OffersService {
  private readonly logger = new LoggerUtil('OffersService');

  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
  ) {}

  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    this.logger.log('Creating new offer', { title: createOfferDto.title });
    
    const offer = this.offerRepository.create({
      ...createOfferDto,
      status: OfferStatus.ACTIVE,
    });
    
    return await this.offerRepository.save(offer);
  }

  async findAll() {
    return await this.offerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findActive() {
    const now = new Date();
    return await this.offerRepository.find({
      where: {
        status: OfferStatus.ACTIVE,
      },
      order: { interestRate: 'ASC' },
    });
  }

  async findByVehicle(vehicleId: string) {
    const now = new Date();
    return await this.offerRepository.find({
      where: {
        vehicleId,
        status: OfferStatus.ACTIVE,
      },
      order: { interestRate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Offer> {
    const offer = await this.offerRepository.findOne({ where: { id } });
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    return offer;
  }

  async update(id: string, updateOfferDto: UpdateOfferDto): Promise<Offer> {
    const offer = await this.findOne(id);
    Object.assign(offer, updateOfferDto);
    return await this.offerRepository.save(offer);
  }

  async remove(id: string): Promise<void> {
    const offer = await this.findOne(id);
    offer.status = OfferStatus.WITHDRAWN;
    await this.offerRepository.save(offer);
  }
}
