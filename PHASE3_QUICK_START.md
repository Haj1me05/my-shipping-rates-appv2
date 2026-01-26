# Phase 3 Quick Start Guide

## What's New in Phase 3

**Multi-carrier rate calculation with design patterns:**

- 3 carrier adapters (USPS, FedEx, UPS)
- Dynamic fee application (insurance, signature, fragile, Saturday)
- Parallel rate fetching with error recovery
- Singleton configuration management

---

## Key Files

### Adapters (Different API formats → Unified ShippingRate)

```
src/adapters/carrier-adapters/
├── adapter.ts              # CarrierAdapter interface
├── usps-adapter.ts         # USPS implementation
├── fedex-adapter.ts        # FedEx implementation
├── ups-adapter.ts          # UPS implementation
├── index.ts                # Factory function
└── __tests__/adapter.test.ts
```

### Decorators (Add fees dynamically)

```
src/services/fee-decorators/
├── decorator.ts            # Decorator pattern classes
└── __tests__/decorator.test.ts
```

### Configuration (Singleton instance)

```
src/config/
├── carrier-config.ts       # CarrierConfigManager singleton
└── __tests__/carrier-config.test.ts
```

### Orchestration (Parallel fetching)

```
src/services/
├── rate-service.ts         # RateService orchestrator
└── __tests__/rate-service.test.ts
```

---

## Design Patterns at a Glance

### Adapter Pattern

**Problem:** Each carrier returns rates in different formats  
**Solution:** Create adapters that normalize to ShippingRate[]  
**Files:** adapter.ts, usps-adapter.ts, fedex-adapter.ts, ups-adapter.ts

### Factory Function

**Problem:** Need to get correct adapter without knowing class names  
**Solution:** `getCarrierAdapter('USPS')` returns USPSAdapter  
**Files:** index.ts

### Decorator Pattern

**Problem:** Need to add optional fees (insurance, signature, etc.)  
**Solution:** Stack decorators on BaseRate without modifying original  
**Files:** decorator.ts

### Singleton Pattern

**Problem:** Configuration should load once and be shared  
**Solution:** CarrierConfigManager.getInstance() always returns same instance  
**Files:** carrier-config.ts

---

## Common Usage

### Fetch Rates from All Carriers

```typescript
import { rateService } from '@/services/rate-service';

const response = await rateService.fetchAllRates(
  {
    originZipCode: '10001',
    destinationZipCode: '90210',
    weight: 5,
    declaredValue: 500,
  },
  {
    speed: 'standard',
    signatureRequired: true,
    insurance: false,
    fragileHandling: true,
    saturdayDelivery: false,
    declaredValue: 500,
  }
);

// response.rates = sorted by cost, then delivery date
// Each rate includes applied fees from decorators
```

### Get Specific Adapter

```typescript
import { getCarrierAdapter, getAvailableCarriers } from '@/adapters/carrier-adapters';

const fedexAdapter = getCarrierAdapter('FedEx');
const allCarriers = getAvailableCarriers(); // ['USPS', 'FedEx', 'UPS']
```

### Access Configuration

```typescript
import { carrierConfig } from '@/config/carrier-config';

const credentials = carrierConfig.getCarrierCredentials('USPS');
// { apiKey, endpoint, timeout }
```

---

## Test Coverage

**Total Tests:** 128 (all passing)

- Adapter tests: 20
- Decorator tests: 26
- Configuration tests: 14
- Rate Service tests: 18
- Phase 2 validator tests: 26
- Phase 2 hook tests: 24

**Run Tests:**

```bash
npm test -- --run
```

---

## Type Safety

✅ Zero TypeScript errors  
✅ No `any` types  
✅ Full type inference  
✅ Discriminated error unions

**Verify:**

```bash
npx tsc --noEmit
```

---

## API Response Mapping Examples

### USPS → ShippingRate

```
Priority Mail $28.95 →
{
  carrier: 'USPS',
  serviceName: 'Priority Mail',
  speed: 'two-day',
  baseRate: 28.95,
  totalCost: 28.95,
  estimatedDeliveryDate: Date,
  guaranteedDelivery: false,
}
```

### FedEx → ShippingRate

```
FedEx Ground $45.25 →
{
  carrier: 'FedEx',
  serviceName: 'FedEx Ground',
  speed: 'economy',
  baseRate: 45.25,
  additionalFees: [{type: 'fuel', amount: 3.50}],
  totalCost: 48.75,
  estimatedDeliveryDate: Date,
  guaranteedDelivery: false,
}
```

### UPS → ShippingRate

```
UPS 2nd Day Air $55.50 →
{
  carrier: 'UPS',
  serviceName: 'UPS 2nd Day Air',
  speed: 'two-day',
  baseRate: 55.50,
  totalCost: 55.50,
  estimatedDeliveryDate: Date,
  guaranteedDelivery: false,
}
```

---

## Decorator Fee Application

```typescript
// Base rate: $100
BaseRate(100) → $100

// Add insurance: $100/100 = $1 (min $2.50)
+ InsuranceDecorator(declaredValue: 100) → $102.50

// Add signature: $5.50
+ SignatureDecorator() → $108

// Add fragile handling: $10
+ FragileHandlingDecorator() → $118

// Add Saturday delivery: $15
+ SaturdayDeliveryDecorator() → $133

// Total fees: $33 ($2.50 + $5.50 + $10 + $15)
```

---

## Error Handling

**Recoverable Errors** (retried with exponential backoff):

- Timeout
- Connection refused
- Network unreachable
- DNS not found

**Non-Recoverable Errors** (not retried):

- Invalid request
- Authentication failure
- Carrier-specific validation errors

**Response on Partial Failure:**

```typescript
{
  requestId: 'rate-1234567890-abc123',
  rates: [/* rates from successful carriers */],
  errors: [
    {
      carrier: 'FedEx',
      message: 'Timeout after 30s',
      recoverable: true,
    }
  ],
  timestamp: '2026-01-24T20:46:52.000Z'
}
```

---

## Configuration from Environment

Set these for real API credentials:

```bash
USPS_API_KEY=your-key
USPS_ENDPOINT=https://secure.shippingapis.com/ShippingAPI.dll

FEDEX_API_KEY=your-key
FEDEX_API_SECRET=your-secret
FEDEX_ENDPOINT=https://apis.fedex.com/rate/v1/rates/quotes

UPS_API_KEY=your-key
UPS_API_SECRET=your-secret
UPS_ENDPOINT=https://onlinetools.ups.com/ship/v2403/rating/Rate
```

Defaults to demo keys if not set.

---

## What Works

✅ Fetch rates from USPS, FedEx, UPS in parallel  
✅ Apply fees dynamically (insurance, signature, fragile, Saturday)  
✅ Consistent rate sorting (cost → delivery date)  
✅ Error handling with retry logic  
✅ Type-safe throughout  
✅ 128 tests, all passing  
✅ Zero TypeScript errors

---

## What Comes Next (Phase 4)

- Results display UI
- Rate comparison view
- Filtering/sorting controls
- Rate detail expansion
- Selected rate confirmation

---

**Status: READY FOR PHASE 4** ✅
