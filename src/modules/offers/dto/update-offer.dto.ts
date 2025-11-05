import { PartialType } from '@nestjs/swagger';
import { CreateOfferDto } from './create-offer.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { OfferStatus } from '../../../common/enums/offer-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOfferDto extends PartialType(CreateOfferDto) {
  @ApiPropertyOptional({ enum: OfferStatus })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}