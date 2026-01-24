# Multi-Carrier Shipping Rate Calculator - Architecture Documentation

## Overview

This document outlines the architectural design and design patterns used in the Multi-Carrier Shipping Rate Calculator application. The architecture prioritizes type safety, scalability, and maintainability while adhering to SOLID principles.

---

## System Architecture

### Component Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│    (React Components, Forms, Results Display)            │
├─────────────────────────────────────────────────────────┤
│                  Business Logic Layer                    │
│  (Services, Strategies, Decorators, Validators)         │
├─────────────────────────────────────────────────────────┤
│                    Adapter Layer                         │
│    (Carrier Adapters, External API Integration)         │
├─────────────────────────────────────────────────────────┤
│                    Data Access Layer                     │
│    (Configuration, Type Definitions, Utilities)         │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
User Input (Form)
       ↓
   [Validation]
       ↓
  RateRequest
       ↓
[Factory Pattern] → Carrier Services
       ↓
[Strategy Pattern] → Rate Calculation
       ↓
[Decorator Pattern] → Apply Additional Fees
       ↓
[Adapter Pattern] → Normalize External APIs
       ↓
  RateResponse
       ↓
[Results Display] → UI
```

---

## Design Patterns

### 1. Strategy Pattern - Rate Calculation Algorithms

**Location:** `src/services/rate-calculators/`

**Purpose:** Encapsulate different rate calculation algorithms for each carrier, allowing runtime selection and swapping of implementations.

**Why:** Each carrier (USPS, FedEx, UPS, DHL) has unique rate calculation logic, surcharges, and rules. The Strategy pattern lets us implement these variations cleanly without conditional logic scattered throughout the codebase.

**Interface:**

```typescript
export interface RateCalculationStrategy {
  calculateRate(rateRequest: RateRequest): Promise<ShippingRate[]>;
  validateRequest(rateRequest: RateRequest): ValidationResult;
}
```

**Implementations:**

- `USPSRateCalculator`
- `FedExRateCalculator`
- `UPSRateCalculator`
- `DHLRateCalculator`

**Benefits:**

- Isolates carrier-specific logic
- Easy to add new carriers
- Testable in isolation
- Follows Open/Closed Principle

---

### 2. Factory Method Pattern - Carrier Instance Creation

**Location:** `src/factories/carrier-factory.ts`

**Purpose:** Create and configure appropriate carrier service instances based on carrier name without exposing instantiation logic.

**Why:** The application needs to instantiate different carrier services dynamically based on user selection. The Factory pattern centralizes this logic, making it easy to manage carrier registration and lifecycle.

**Implementation:**

```typescript
class CarrierFactory {
  static createCalculator(carrier: CarrierName): RateCalculationStrategy;
  static getAvailableCarriers(): CarrierName[];
  static registerCalculator(
    carrier: CarrierName,
    strategy: RateCalculationStrategy,
  ): void;
}
```

**Benefits:**

- Centralizes carrier instantiation
- Decouples client code from concrete implementations
- Easy to register new carriers
- Supports carrier availability configuration

---

### 3. Decorator Pattern - Additional Services/Fees

**Location:** `src/services/fee-decorators/`

**Purpose:** Dynamically add fees (insurance, signature, fragile handling, Saturday delivery) to shipping rates without modifying the original rate objects.

**Why:** Fees are optional and can be combined in various ways. Rather than creating a matrix of subclasses, decorators let us compose fees flexibly at runtime.

**Interface:**

```typescript
export interface RateDecorator {
  decorate(rate: ShippingRate, options: ShippingOptions): ShippingRate;
}
```

**Implementations:**

- `InsuranceDecorator` - Adds insurance fee
- `SignatureDecorator` - Adds signature requirement fee
- `FragileHandlingDecorator` - Adds fragile item handling fee
- `SaturdayDeliveryDecorator` - Adds Saturday delivery fee

**Decorator Stack Example:**

```
Base Rate ($15.00)
    ↓ [InsuranceDecorator]
Rate with Insurance ($16.50)
    ↓ [SignatureDecorator]
Rate with Insurance + Signature ($18.00)
    ↓ [SaturdayDeliveryDecorator]
Final Rate with All Fees ($21.00)
```

**Benefits:**

- Flexible fee composition
- Keeps classes focused and single-responsible
- Easy to add new fee types
- Avoids complex inheritance hierarchies

---

### 4. Adapter Pattern - External API Integration

**Location:** `src/adapters/carrier-adapters/`

**Purpose:** Normalize different carrier API response formats into a consistent `ShippingRate` structure.

**Why:** External carrier APIs (USPS, FedEx, UPS, DHL) each return different response formats. Adapters translate their unique schemas into our standardized domain model.

**Interface:**

```typescript
export interface CarrierAdapter {
  getCarrier(): CarrierName;
  getRates(request: RateRequest): Promise<ShippingRate[]>;
}
```

**Implementations:**

- `USPSAdapter` - Normalizes USPS Web Tools API responses
- `FedExAdapter` - Normalizes FedEx Web Services API responses
- `UPSAdapter` - Normalizes UPS Shipping API responses
- `DHLAdapter` - Normalizes DHL Express API responses

**Adapter Responsibility:**

1. Translate domain `RateRequest` to carrier-specific request format
2. Call external API with credentials from `CarrierConfig`
3. Parse carrier response and map to `ShippingRate[]`
4. Handle carrier-specific errors and edge cases

**Benefits:**

- Isolates external API coupling
- Provides consistent interface for rate retrieval
- Easy API version upgrades
- Supports A/B testing different carriers

---

### 5. Singleton Pattern - Configuration Management

**Location:** `src/config/carrier-config.ts`

**Purpose:** Provide a single, global point of access to carrier credentials, API endpoints, and configuration settings.

**Why:** Configuration (API keys, endpoints, sandbox/production flags) needs to be accessed throughout the application but should only be initialized once.

**Implementation:**

```typescript
class CarrierConfigManager {
  private static instance: CarrierConfigManager;
  private config: AppConfig;

  private constructor(config: AppConfig);

  static getInstance(): CarrierConfigManager;
  getConfig(): AppConfig;
  getCarrierConfig(carrier: CarrierName): CarrierConfig;
  isCarrierEnabled(carrier: CarrierName): boolean;
}
```

**Configuration Sources:**

1. Environment variables (`.env.local`)
2. Default configuration fallbacks
3. Runtime configuration updates

**Benefits:**

- Single source of truth for configuration
- Thread-safe credential access
- Environment-specific settings
- Easy credential rotation

---

## Service Architecture

### Rate Calculation Service

**Location:** `src/services/rate-calculator.ts`

**Responsibilities:**

1. Coordinate rate calculation across selected carriers
2. Apply decorator pattern for additional fees
3. Aggregate results from multiple carriers
4. Handle errors gracefully

**Flow:**

```typescript
async getRates(request: RateRequest): Promise<RateResponse> {
  // 1. Validate request
  // 2. For each selected carrier:
  //    a. Get strategy from factory
  //    b. Calculate base rates
  //    c. Apply fee decorators based on options
  // 3. Aggregate results
  // 4. Return response with rates and errors
}
```

---

## Validation Layer

### Validation Strategy

- **Runtime Validation:** Use Zod for request validation
- **Type Validation:** TypeScript strict mode for compile-time checking
- **Custom Validators:** Domain-specific validation rules

**Validation Responsibilities:**

- Package dimensions and weight
- Address completeness and format
- Carrier availability
- Service speed/carrier compatibility

---

## Error Handling

### Error Classification

1. **Recoverable Errors** (carrier-specific)
   - Carrier API unavailable → retry with another carrier
   - Invalid address format → return error to user
2. **Non-Recoverable Errors** (application-level)
   - Missing configuration → fail fast
   - Invalid package dimensions → validation error

### Error Response Structure

```typescript
interface RateResponse {
  rates: ShippingRate[]; // Successfully calculated rates
  errors: CarrierError[]; // Carrier-specific errors
  timestamp: string; // When request was processed
}
```

---

## Type Safety

### TypeScript Configuration

- **Strict Mode:** Enabled
- **No Implicit Any:** Enforced
- **Strict Null Checks:** Enforced
- **Strict Function Types:** Enforced
- **No Unused Locals:** Enforced
- **No Fallthrough Cases:** Enforced

### Type Hierarchy

```
Domain Types (domain.ts)
    ↓
Interface Definitions (Strategies, Adapters, Decorators)
    ↓
Implementation Classes
    ↓
React Components (Props typed)
    ↓
API Routes (Request/Response typed)
```

---

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (routes)/
│   │   ├── page.tsx           # Main rate calculator page
│   │   └── layout.tsx         # App layout
│   └── api/
│       └── rates/
│           └── route.ts       # Server Action for rate calculation
│
├── components/                 # React Components
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── forms/                 # Form components
│   │   ├── PackageForm.tsx
│   │   ├── AddressForm.tsx
│   │   └── OptionsForm.tsx
│   └── results/               # Results display
│       ├── RatesList.tsx
│       └── ErrorMessage.tsx
│
├── services/                   # Business Logic
│   ├── rate-calculator.ts     # Main service
│   ├── rate-calculators/      # Strategy implementations
│   │   ├── usps.ts
│   │   ├── fedex.ts
│   │   ├── ups.ts
│   │   └── dhl.ts
│   ├── fee-decorators/        # Decorator implementations
│   │   ├── insurance.ts
│   │   ├── signature.ts
│   │   ├── fragile-handling.ts
│   │   └── saturday-delivery.ts
│   └── validators/            # Validation logic
│       ├── package-validator.ts
│       └── address-validator.ts
│
├── adapters/                   # Adapter Pattern
│   └── carrier-adapters/
│       ├── usps-adapter.ts
│       ├── fedex-adapter.ts
│       ├── ups-adapter.ts
│       └── dhl-adapter.ts
│
├── factories/                  # Factory Pattern
│   └── carrier-factory.ts
│
├── config/                     # Configuration
│   └── carrier-config.ts      # Singleton
│
├── types/                      # Type Definitions
│   ├── domain.ts              # Core domain types
│   └── carrier-apis.ts        # External API types
│
├── lib/                        # Utilities
│   ├── calculations.ts        # Math utilities
│   ├── converters.ts          # Unit conversions
│   └── formatters.ts          # Data formatting
│
├── hooks/                      # Custom React Hooks
│   ├── useRates.ts
│   └── useFormState.ts
│
└── tests/                      # Test Files
    ├── unit/
    └── integration/
```

---

## Integration Points

### API Route: POST /api/rates

**Request:**

```json
{
  "package": {
    /* PackageDimensions, PackageWeight, etc. */
  },
  "originAddress": {
    /* Address fields */
  },
  "destinationAddress": {
    /* Address fields */
  },
  "options": {
    /* ShippingOptions */
  },
  "carriers": ["USPS", "FedEx", "UPS"]
}
```

**Response:**

```json
{
  "requestId": "req_123abc",
  "rates": [
    /* ShippingRate[] */
  ],
  "errors": [
    /* CarrierError[] */
  ],
  "timestamp": "2026-01-24T10:00:00Z"
}
```

---

## Future Extensibility

### Adding a New Carrier

1. **Create Strategy Implementation:**

   ```
   src/services/rate-calculators/newcarrier.ts
   ```

2. **Create Adapter:**

   ```
   src/adapters/carrier-adapters/newcarrier-adapter.ts
   ```

3. **Register in Factory:**

   ```typescript
   CarrierFactory.registerCalculator("NewCarrier", new NewCarrierCalculator());
   ```

4. **Update Configuration:**
   - Add API credentials to `.env.local`
   - Update `carrier-config.ts`

5. **Add UI Option:**
   - Update carrier selection component

---

## Performance Considerations

1. **Parallel Rate Calculations:** Fetch rates from multiple carriers concurrently
2. **Caching:** Cache rates for identical requests (within time window)
3. **Error Resilience:** Don't fail if one carrier is unavailable
4. **Timeout Handling:** Set timeouts on external API calls

---

## Security Considerations

1. **Credential Management:** Use environment variables, never hardcode
2. **API Key Rotation:** Easy configuration updates
3. **Input Validation:** Strict validation on all user inputs
4. **CORS:** Proper CORS headers on API routes
5. **Rate Limiting:** Implement rate limiting on API endpoints

---

## Testing Strategy

### Unit Tests

- Rate calculator implementations
- Decorators
- Validators
- Utility functions

### Integration Tests

- Adapter to external API
- Factory method carrier creation
- Complete rate calculation flow

### E2E Tests

- User flow from form input to results display
- Error scenarios
- Multiple carrier selection

---

## Monitoring and Logging

### Key Metrics

- Rate calculation response time
- Carrier API success/failure rates
- Error rates by carrier
- User requests per hour

### Logging Points

1. Request validation failures
2. Carrier API errors
3. Decorator application
4. Rate response aggregation

---

## Deployment Considerations

1. **Environment Configuration:** Separate `.env` files per environment
2. **API Credentials:** Use secure credential management
3. **Feature Flags:** Enable/disable carriers by environment
4. **Graceful Degradation:** Handle missing carrier configurations
5. **Monitoring:** Log errors and performance metrics
