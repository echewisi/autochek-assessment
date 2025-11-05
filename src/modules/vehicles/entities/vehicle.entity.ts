import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { VehicleCondition } from '../../../common/enums/vehicle-condition.enum';
import { Valuation } from '../../valuations/entities/valuation.entity';
import { Loan } from '../../loans/entities/loan.entity';

/**
 * Vehicle entity representing a vehicle in the system
 * Stores comprehensive vehicle information for valuation and financing
 */
@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  vin: string; // Vehicle Identification Number

  @Column()
  make: string; // e.g., Toyota, Honda, Ford

  @Column()
  model: string; // e.g., Camry, Accord, F-150

  @Column()
  year: number; // Manufacturing year

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  mileage: number; // Current mileage in kilometers

  @Column({
    type: 'text',
    default: VehicleCondition.GOOD,
  })
  condition: VehicleCondition;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  transmission: string; // Manual, Automatic, CVT

  @Column({ nullable: true })
  fuelType: string; // Petrol, Diesel, Electric, Hybrid

  @Column({ nullable: true })
  engineSize: string; // e.g., 2.0L, 3.5L

  @Column({ type: 'text', nullable: true })
  features: string; // JSON string of additional features

  @Column({ nullable: true })
  trim: string; // Vehicle trim level

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  purchasePrice: number; // Original purchase price

  @Column({ nullable: true })
  licensePlate: string;

  @Column({ type: 'text', nullable: true })
  description: string;


  @Column({ default: true })
  isActive: boolean;

  // Relationships
  @OneToMany(() => Valuation, (valuation) => valuation.vehicle)
  valuations: Valuation[];

  @OneToMany(() => Loan, (loan) => loan.vehicle)
  loans: Loan[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}