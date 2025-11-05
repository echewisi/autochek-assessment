import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

/**
 * Valuation entity representing a vehicle valuation
 * Stores estimated vehicle values and valuation metadata
 */
@Entity('valuations')
export class Valuation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  vehicleId: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.valuations)
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  estimatedValue: number; // Current market value

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  tradeInValue: number; // Trade-in value

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  retailValue: number; // Retail value

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  privatePartyValue: number; // Private party value

  @Column({ nullable: true })
  valuationSource: string; // API source or model used

  @Column({ type: 'text', nullable: true })
  valuationFactors: string; // JSON of factors affecting valuation

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceScore: number; // Confidence in valuation (0-100)

  @Column({ type: 'text', nullable: true })
  marketTrends: string; // JSON of market trend data

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'datetime', nullable: true })
  validUntil: Date; // Valuation expiration date

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}