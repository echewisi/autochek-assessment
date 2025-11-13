import { DataSource } from 'typeorm';
import { Vehicle } from '../../modules/vehicles/entities/vehicle.entity';
import { Valuation } from '../../modules/valuations/entities/valuation.entity';
import { Loan } from '../../modules/loans/entities/loan.entity';
import { Offer } from '../../modules/offers/entities/offer.entity';
import { VehicleCondition } from '../../common/enums/vehicle-condition.enum';
import { LoanStatus } from '../../common/enums/loan-status.enum';
import { OfferStatus } from '../../common/enums/offer-status.enum';

/**
 * Database seeder
 * Populates the database with sample data for development and testing
 */
export class DatabaseSeeder {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [Vehicle, Valuation, Loan, Offer],
      synchronize: true,
    });
  }

  async run() {
    console.log('🌱 Starting database seeding...');

    try {
      await this.dataSource.initialize();
      console.log('✅ Database connection established');

      // Seed vehicles
      const vehicles = await this.seedVehicles();
      console.log(`✅ Seeded ${vehicles.length} vehicles`);

      // Seed valuations
      const valuations = await this.seedValuations(vehicles);
      console.log(`✅ Seeded ${valuations.length} valuations`);

      // Seed loans
      const loans = await this.seedLoans(vehicles);
      console.log(`✅ Seeded ${loans.length} loans`);

      // Seed offers
      const offers = await this.seedOffers(vehicles);
      console.log(`✅ Seeded ${offers.length} offers`);

      console.log('\n🎉 Database seeding completed successfully!');
      console.log('\nSample Data Summary:');
      console.log(`  - Vehicles: ${vehicles.length}`);
      console.log(`  - Valuations: ${valuations.length}`);
      console.log(`  - Loans: ${loans.length}`);
      console.log(`  - Offers: ${offers.length}`);
      
      await this.dataSource.destroy();
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  private async seedVehicles(): Promise<Vehicle[]> {
    const vehicleRepository = this.dataSource.getRepository(Vehicle);

    const vehiclesData = [
      {
        vin: '1HGBH41JXMN109186',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        mileage: 35000,
        condition: VehicleCondition.EXCELLENT,
        color: 'Silver',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engineSize: '2.5L',
        trim: 'XLE',
        purchasePrice: 28000,
        description: 'Well-maintained family sedan with full service history',
        features: JSON.stringify(['Sunroof', 'Leather Seats', 'Navigation', 'Backup Camera']),
      },
      {
        vin: '2HGFA1F51AH123456',
        make: 'Honda',
        model: 'Accord',
        year: 2019,
        mileage: 45000,
        condition: VehicleCondition.GOOD,
        color: 'Black',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engineSize: '2.0L',
        trim: 'Sport',
        purchasePrice: 26000,
        description: 'Sporty sedan with excellent fuel economy',
        features: JSON.stringify(['Apple CarPlay', 'Lane Keep Assist', 'Adaptive Cruise']),
      },
      {
        vin: '3GCUYTED3LG123789',
        make: 'Ford',
        model: 'F-150',
        year: 2021,
        mileage: 25000,
        condition: VehicleCondition.EXCELLENT,
        color: 'Blue',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engineSize: '3.5L',
        trim: 'XLT',
        purchasePrice: 42000,
        description: 'Powerful pickup truck perfect for work and play',
        features: JSON.stringify(['4WD', 'Tow Package', 'Bed Liner', 'Running Boards']),
      },
      {
        vin: '5YJ3E1EA1KF123456',
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        mileage: 8000,
        condition: VehicleCondition.NEW,
        color: 'White',
        transmission: 'Automatic',
        fuelType: 'Electric',
        engineSize: 'Electric Motor',
        trim: 'Long Range',
        purchasePrice: 48000,
        description: 'Electric vehicle with autopilot and premium features',
        features: JSON.stringify(['Autopilot', 'Premium Audio', 'Glass Roof', 'Fast Charging']),
      },
      {
        vin: 'WBADT43452G123456',
        make: 'BMW',
        model: '3 Series',
        year: 2018,
        mileage: 52000,
        condition: VehicleCondition.GOOD,
        color: 'Gray',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engineSize: '2.0L',
        trim: '330i',
        purchasePrice: 35000,
        description: 'Luxury sedan with premium interior',
        features: JSON.stringify(['Premium Sound', 'Heated Seats', 'Navigation', 'Sunroof']),
      },
    ];

    const vehicles = vehicleRepository.create(vehiclesData);
    return await vehicleRepository.save(vehicles);
  }

  private async seedValuations(vehicles: Vehicle[]): Promise<Valuation[]> {
    const valuationRepository = this.dataSource.getRepository(Valuation);
    const valuations: Valuation[] = [];

    for (const vehicle of vehicles) {
      const age = new Date().getFullYear() - vehicle.year;
      const baseValue = vehicle.purchasePrice || 30000;
      const depreciation = Math.pow(0.85, age);
      const estimatedValue = baseValue * depreciation;

      const valuation = valuationRepository.create({
        vehicleId: vehicle.id,
        estimatedValue: Math.round(estimatedValue),
        tradeInValue: Math.round(estimatedValue * 0.85),
        retailValue: Math.round(estimatedValue * 1.15),
        privatePartyValue: Math.round(estimatedValue * 0.95),
        valuationSource: 'Autochek Valuation Engine v1.0',
        confidenceScore: 85,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        valuationFactors: JSON.stringify({
          age,
          mileage: vehicle.mileage,
          condition: vehicle.condition,
          marketDemand: 85,
        }),
      });

      valuations.push(await valuationRepository.save(valuation));
    }

    return valuations;
  }

  private async seedLoans(vehicles: Vehicle[]): Promise<Loan[]> {
    const loanRepository = this.dataSource.getRepository(Loan);
    const loans: Loan[] = [];

    const loanData = [
      {
        vehicle: vehicles[0],
        applicantName: 'John Doe',
        applicantEmail: 'john.doe@example.com',
        applicantPhone: '+234-123-456-7890',
        monthlyIncome: 500000,
        creditScore: 750,
        requestedAmount: 20000000,
        downPayment: 3000000,
        loanTermMonths: 48,
        status: LoanStatus.APPROVED,
        interestRate: 0.05,
      },
      {
        vehicle: vehicles[1],
        applicantName: 'Jane Smith',
        applicantEmail: 'jane.smith@example.com',
        applicantPhone: '+234-987-654-3210',
        monthlyIncome: 400000,
        creditScore: 680,
        requestedAmount: 18000000,
        downPayment: 2500000,
        loanTermMonths: 60,
        status: LoanStatus.UNDER_REVIEW,
        interestRate: 0.08,
      },
      {
        vehicle: vehicles[2],
        applicantName: 'Mike Johnson',
        applicantEmail: 'mike.johnson@example.com',
        applicantPhone: '+234-555-123-4567',
        monthlyIncome: 600000,
        creditScore: 720,
        requestedAmount: 35000000,
        downPayment: 5000000,
        loanTermMonths: 60,
        status: LoanStatus.APPROVED,
        interestRate: 0.06,
      },
    ];

    for (const data of loanData) {
      const monthlyPayment = this.calculateMonthlyPayment(
        data.requestedAmount,
        data.interestRate,
        data.loanTermMonths,
      );

      const loan = loanRepository.create({
        vehicleId: data.vehicle.id,
        applicantName: data.applicantName,
        applicantEmail: data.applicantEmail,
        applicantPhone: data.applicantPhone,
        monthlyIncome: data.monthlyIncome,
        creditScore: data.creditScore,
        requestedAmount: data.requestedAmount,
        approvedAmount: data.requestedAmount,
        downPayment: data.downPayment,
        loanTermMonths: data.loanTermMonths,
        status: data.status,
        interestRate: data.interestRate,
        monthlyPayment,
        totalPayable: monthlyPayment * data.loanTermMonths,
        loanToValueRatio: data.requestedAmount / (data.vehicle.purchasePrice || 30000),
        debtToIncomeRatio: monthlyPayment / data.monthlyIncome,
      });

      loans.push(await loanRepository.save(loan));
    }

    return loans;
  }

  private async seedOffers(vehicles: Vehicle[]): Promise<Offer[]> {
    const offerRepository = this.dataSource.getRepository(Offer);
    const now = new Date();
    const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const offersData = [
      {
        vehicleId: vehicles[0].id,
        title: 'Summer Special - 4.9% APR',
        description: 'Limited time financing offer with low interest rate',
        interestRate: 0.049,
        termMonths: 48,
        maxLoanAmount: 25000000,
        minDownPaymentPercent: 10,
        minCreditScore: 700,
        validFrom: JSON.stringify(now),
        validUntil: JSON.stringify(validUntil),
        benefits: JSON.stringify(['No prepayment penalty', 'Flexible payment dates']),
      },
      {
        vehicleId: vehicles[1].id,
        title: 'First-Time Buyer Program',
        description: 'Special rates for first-time vehicle buyers',
        interestRate: 0.079,
        termMonths: 60,
        maxLoanAmount: 20000000,
        minDownPaymentPercent: 15,
        minCreditScore: 650,
        validFrom: JSON.stringify(now),
        validUntil: JSON.stringify(validUntil),
        benefits: JSON.stringify(['Credit counseling included', 'Skip first payment']),
      },
    ];

    const offers = offerRepository.create(offersData);
    console.log(offers);
    return await offerRepository.save(offers);
  }

  private calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    months: number,
  ): number {
    const monthlyRate = annualRate / 12;
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
  }
}

// Run seeder if executed directly
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}