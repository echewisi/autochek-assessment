import { PartialType } from '@nestjs/swagger';
import { CreateVehicleDto } from './create-vehicle.dto';

/**
 * DTO for updating vehicle information
 * All fields are optional (partial update)
 */
export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}