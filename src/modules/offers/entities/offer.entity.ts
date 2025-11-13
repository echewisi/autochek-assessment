// src/modules/offers/entities/offer.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OfferStatus } from '../../../common/enums/offer-status.enum';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  vehicleId: string;

  @Column({ nullable: true })
  loanId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  interestRate: number;

  @Column({ type: 'integer' })
  termMonths: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  maxLoanAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  minDownPaymentPercent: number;

  @Column({ type: 'integer', nullable: true })
  minCreditScore: number;

  @Column({
    type: 'text',
    default: OfferStatus.ACTIVE,
  })
  status: OfferStatus;

  @Column({ type: 'date', nullable: true })
  validFrom: string;

  @Column({ type: 'date', nullable: true })
  validUntil: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ type: 'text', nullable: true })
  benefits: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}