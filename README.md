# Autochek Vehicle Valuation & Financing API

A comprehensive backend API built with NestJS for vehicle valuation and financing services. This system handles vehicle data management, VIN-based valuations, loan applications with eligibility checks, and financing offers.

## 🚀 Features

### Core Functionality
- **Vehicle Management**: Complete CRUD operations for vehicle data with VIN validation
- **VIN Decoding**: Integration with RapidAPI VIN Lookup service (with mock fallback)
- **Vehicle Valuation**: Proprietary valuation engine considering:
  - Vehicle age and depreciation
  - Mileage adjustments
  - Condition-based pricing
  - Market demand factors
- **Loan Application Processing**: 
  - Automated eligibility checks
  - Credit score-based interest rates
  - LTV (Loan-to-Value) ratio validation
  - DTI (Debt-to-Income) ratio calculation
  - Flexible loan terms (12-96 months)
- **Financing Offers**: Promotional financing offers management
- **Data Security**: Encryption utilities for sensitive data
- **Comprehensive Logging**: Structured logging for monitoring and debugging

### Technical Features
- ✅ RESTful API design
- ✅ In-memory SQLite database (easy testing)
- ✅ Input validation with class-validator
- ✅ Swagger/OpenAPI documentation
- ✅ Global error handling
- ✅ Request/Response interceptors
- ✅ Pagination support
- ✅ Comprehensive test coverage
- ✅ TypeScript for type safety
- ✅ Industry-standard architecture

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- (Optional) RapidAPI key for VIN lookup service

## 🛠️ Installation

### 1. Clone or Extract the Project

```bash
cd autochek-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Application
PORT=3000
NODE_ENV=development
API_PREFIX=api/v1

# Database (In-Memory SQLite - no configuration needed)
DB_TYPE=sqlite
DB_DATABASE=:memory:

# API Keys (Optional - mock data used if not provided)
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=vin-lookup.p.rapidapi.com

# Security
ENCRYPTION_KEY=your-32-character-encryption-key-here
API_KEY=optional-api-key-for-protected-endpoints

# Loan Configuration
MIN_CREDIT_SCORE=600
MAX_LOAN_TO_VALUE_RATIO=0.8
MIN_DOWN_PAYMENT_PERCENTAGE=10
MAX_LOAN_TERM_MONTHS=72
```

**Note**: The API works without RapidAPI key using mock VIN data for development.

## 🚀 Running the Application

### Development Mode (with auto-reload)

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

The API will be available at:
- **API Base**: http://localhost:3000/api/v1
- **Swagger Documentation**: http://localhost:3000/api/docs


## 🌱 Database Seeding

To populate the database with sample data:

```bash
npm run seed
```

This creates sample:
- 5 vehicles (Toyota, Honda, Ford, Tesla, BMW)
- Valuations for each vehicle
- 3 loan applications with different statuses
- 2 financing offers

**Note**: Since we use in-memory SQLite, data is reset on each restart. Run seed after starting the app if needed for testing.


### Watch Mode

```bash
npm run test:watch
```


## 📚 API Documentation

### Swagger UI

Access interactive API documentation at: http://localhost:3000/api/docs

### API Endpoints Overview

#### Vehicles

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/vehicles` | Create a new vehicle |
| GET | `/api/v1/vehicles` | Get all vehicles (with filters) |
| GET | `/api/v1/vehicles/:id` | Get vehicle by ID |
| GET | `/api/v1/vehicles/vin/:vin` | Get vehicle by VIN |
| GET | `/api/v1/vehicles/statistics` | Get vehicle statistics |
| PATCH | `/api/v1/vehicles/:id` | Update vehicle |
| DELETE | `/api/v1/vehicles/:id` | Delete vehicle (soft) |

#### Valuations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/valuations/request` | Request vehicle valuation |
| POST | `/api/v1/valuations` | Create manual valuation |
| GET | `/api/v1/valuations/:id` | Get valuation by ID |
| GET | `/api/v1/valuations/vehicle/:vehicleId` | Get all valuations for vehicle |
| GET | `/api/v1/valuations/vehicle/:vehicleId/latest` | Get latest valuation |

#### Loans

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/loans` | Submit loan application |
| GET | `/api/v1/loans` | Get all loans (paginated) |
| GET | `/api/v1/loans/:id` | Get loan by ID |
| GET | `/api/v1/loans/applicant/:email` | Get loans by applicant |
| GET | `/api/v1/loans/statistics` | Get loan statistics |
| PATCH | `/api/v1/loans/:id/status` | Update loan status |

#### Offers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/offers` | Create financing offer |
| GET | `/api/v1/offers` | Get all offers |
| GET | `/api/v1/offers/active` | Get active offers |
| GET | `/api/v1/offers/vehicle/:vehicleId` | Get offers for vehicle |
| GET | `/api/v1/offers/:id` | Get offer by ID |
| PATCH | `/api/v1/offers/:id` | Update offer |
| DELETE | `/api/v1/offers/:id` | Delete offer |

### Example API Calls

#### 1. Create a Vehicle

```bash
curl -X POST http://localhost:3000/api/v1/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "1HGBH41JXMN109186",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "mileage": 35000,
    "condition": "good",
    "color": "Silver"
  }'
```

#### 2. Request Vehicle Valuation

```bash
curl -X POST http://localhost:3000/api/v1/valuations/request \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "1HGBH41JXMN109186",
    "mileage": 35000,
    "condition": "good"
  }'
```

#### 3. Submit Loan Application

```bash
curl -X POST http://localhost:3000/api/v1/loans \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "vehicle-uuid-here",
    "applicantName": "John Doe",
    "applicantEmail": "john@example.com",
    "applicantPhone": "+234-123-456-7890",
    "monthlyIncome": 500000,
    "creditScore": 720,
    "requestedAmount": 15000000,
    "downPayment": 3000000,
    "loanTermMonths": 48
  }'
```

## 🏗️ Architecture & Design Patterns

### Project Structure

```
src/
├── common/              # Shared utilities, decorators, filters
│   ├── decorators/      # Custom decorators
│   ├── dto/             # Common DTOs
│   ├── enums/           # Enumerations
│   ├── filters/         # Exception filters
│   ├── guards/          # Authentication guards
│   ├── interceptors/    # Request/Response interceptors
│   ├── interfaces/      # TypeScript interfaces
│   └── utils/           # Utility functions
├── config/              # Configuration files
├── modules/             # Feature modules
│   ├── vehicles/        # Vehicle management
│   ├── valuations/      # Valuation service
│   ├── loans/           # Loan processing
│   └── offers/          # Financing offers
├── database/            # Database seeds and migrations
├── app.module.ts        # Root module
└── main.ts              # Application entry point
```

### Design Patterns Used

1. **Repository Pattern**: TypeORM repositories for data access
2. **Service Layer Pattern**: Business logic separation
3. **DTO Pattern**: Data validation and transformation
4. **Factory Pattern**: Entity creation
5. **Strategy Pattern**: Valuation algorithms
6. **Decorator Pattern**: Custom decorators for routes
7. **Observer Pattern**: Event-driven loan processing

### Key Design Decisions

- **In-Memory SQLite**: Easy testing and demonstration without external dependencies
- **Module-based Architecture**: Clear separation of concerns
- **Global Interceptors**: Consistent response formatting
- **Centralized Configuration**: Environment-based settings
- **Comprehensive Validation**: Input validation at DTO level
- **Error Handling**: Global exception filter for consistent error responses

## 🔐 Security Features

1. **Input Validation**: Class-validator for DTO validation
2. **Data Encryption**: Utility for encrypting sensitive data
3. **API Key Guard**: Optional API key authentication
4. **SQL Injection Protection**: TypeORM parameterized queries
5. **CORS Configuration**: Configurable cross-origin requests
6. **Sensitive Data Logging**: Redaction of sensitive fields in logs

## 📊 Loan Eligibility Criteria

The system checks the following criteria for loan approval:

1. **Credit Score**: Minimum 600 (configurable)
2. **Loan-to-Value Ratio**: Maximum 80% of vehicle value
3. **Down Payment**: Minimum 10% of vehicle value
4. **Debt-to-Income Ratio**: Maximum 43%
5. **Loan Term**: Maximum 72 months (configurable)

### Interest Rate Tiers

- Excellent (≥750): 5% APR
- Good (≥700): 8% APR
- Fair (≥650): 12% APR
- Poor (≥600): 18% APR

## 🔧 Configuration Options

All configuration is managed through environment variables:

- **PORT**: Server port (default: 3000)
- **NODE_ENV**: Environment (development/production/test)
- **RAPIDAPI_KEY**: VIN lookup API key (optional)
- **MIN_CREDIT_SCORE**: Minimum credit score for loans
- **MAX_LOAN_TO_VALUE_RATIO**: Maximum LTV ratio
- **MIN_DOWN_PAYMENT_PERCENTAGE**: Minimum down payment
- **MAX_LOAN_TERM_MONTHS**: Maximum loan term

## 🐛 Troubleshooting

### Common Issues

**1. Port already in use**
```bash
# Change port in .env file or use:
PORT=3001 npm run start:dev
```

**2. TypeORM sync issues**
```bash
# Clear and restart (in-memory DB resets automatically)
npm run start:dev
```

**3. VIN Lookup fails**
- The system uses mock data when RapidAPI key is not configured
- Check RAPIDAPI_KEY in .env if you want real VIN data





## 🤝 Contributing

This is a technical assessment project. For production use:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

MIT License - feel free to use this code for learning and development.

## 🙏 Acknowledgments

- NestJS framework
- TypeORM
- RapidAPI for VIN lookup service
- Autochek team for the opportunity

## 📞 Support

For issues or questions:
- Check the Swagger documentation at `/api/docs`
- Review the code comments
- Check NestJS documentation at https://docs.nestjs.com

---

**Built with ❤️ using NestJS, TypeORM, and TypeScript**