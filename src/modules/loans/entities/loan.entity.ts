import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LoanStatus } from '../../../common/enums/loan-status.enum';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

/**
 * Loan entity representing a vehicle financing application
 */
@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  vehicleId: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.loans)
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  // Applicant Information (encrypted in production)
  @Column()
  applicantName: string;

  @Column()
  applicantEmail: string;

  @Column()
  applicantPhone: string;

  @Column({ nullable: true })
  applicantAddress: string;

  @Column({ type: 'text', nullable: true })
  applicantEmployment: string; // JSON with employment details

  // Financial Information
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthlyIncome: number;

  @Column({ type: 'integer' })
  creditScore: number; // 300-850

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  requestedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  downPayment: number;

  @Column({ type: 'integer' })
  loanTermMonths: number; // Loan duration in months

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  interestRate: number; // Annual interest rate (e.g., 0.08 = 8%)

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthlyPayment: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalPayable: number; // Total amount to be paid over loan term

  // Loan Status and Metadata
  @Column({
    type: 'text',
    default: LoanStatus.PENDING,
  })
  status: LoanStatus;

  @Column({ type: 'text', nullable: true })
  statusReason: string; // Reason for rejection/approval

  @Column({ type: 'text', nullable: true })
  eligibilityCheck: string; // JSON of eligibility criteria checked

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  loanToValueRatio: number; // LTV ratio

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  debtToIncomeRatio: number; // DTI ratio

  // Dates
  @Column({ type: 'datetime', nullable: true })
  approvedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  disbursedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}