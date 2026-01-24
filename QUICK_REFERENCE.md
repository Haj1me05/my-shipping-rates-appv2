# Quick Reference Guide - Phase 1 Complete

## Project Overview

**Multi-Carrier Shipping Rate Calculator** - A Next.js 16 application for calculating shipping rates across multiple carriers (USPS, FedEx, UPS, DHL) using design patterns and strict TypeScript.

---

## Key Files & Locations

### Type Definitions
- [src/types/domain.ts](src/types/domain.ts) - All core type definitions

### Architecture Documentation
- [docs/architecture.md](docs/architecture.md) - Detailed pattern documentation
- [PHASE1_SUMMARY.md](PHASE1_SUMMARY.md) - Phase 1 completion summary

### Configuration Files
- [.env.local](.env.local) - Environment variables (carrier credentials)
- [tsconfig.json](tsconfig.json) - TypeScript strict mode configuration
- [.prettierrc](.prettierrc) - Code formatting rules
- [eslint.config.mjs](eslint.config.mjs) - ESLint configuration

---

## Main Type Hierarchy

```typescript
// Core Domain
Package → { dimensions, weight, type, declaredValue }
Address → { name, street1, city, state, country, ... }
ShippingOptions → { speed, insurance, signature, ... }

// Rate Information
ShippingRate → { carrier, serviceName, baseRate, fees, totalCost }
Fee → { type, amount, description }

// API Contracts
RateRequest → { package, origin, destination, options }
RateResponse → { rates[], errors[], timestamp }
```

---

## Design Patterns Reference

| Pattern | Location | Purpose |
|---------|----------|---------|
| **Strategy** | `src/services/rate-calculators/` | Different rate calc algorithms per carrier |
| **Factory** | `src/factories/carrier-factory.ts` | Create carrier instances |
| **Decorator** | `src/services/fee-decorators/` | Stack fees dynamically |
| **Adapter** | `src/adapters/carrier-adapters/` | Normalize external APIs |
| **Singleton** | `src/config/carrier-config.ts` | Single config source |

---

## Directory Structure Quick Guide

```
src/
├── app/                    # Next.js pages & API routes
├── components/             # React UI components
├── services/               # Business logic (strategies, decorators)
├── adapters/               # External API normalization
├── factories/              # Carrier factory pattern
├── config/                 # Singleton configuration
├── types/                  # TypeScript definitions
├── lib/                    # Utilities & helpers
├── hooks/                  # Custom React hooks
└── tests/                  # Unit & integration tests
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Verify TypeScript compilation
npx tsc --noEmit

# Run ESLint
npm run lint

# Format code with Prettier
npx prettier --write .

# Run tests (when implemented)
npm test
```

---

## Carrier Information

**Configured Carriers:**
- USPS (United States Postal Service)
- FedEx (Federal Express)
- UPS (United Parcel Service)
- DHL (DHL Express)

**Environment Configuration:**
- API Keys stored in `.env.local`
- Sandbox mode flags available
- Base URLs configurable per carrier

---

## Next Phase Tasks

### Phase 2: Core Service Implementation
1. Implement `RateCalculationStrategy` for each carrier
2. Create `RateDecorator` implementations for fees
3. Develop `CarrierAdapter` for external APIs
4. Implement `CarrierFactory` for instance creation
5. Build `CarrierConfigManager` (Singleton)

### Phase 3: UI Components
1. Package input form
2. Address input form
3. Shipping options form
4. Rates display component
5. Error handling component

### Phase 4: API Integration
1. POST `/api/rates` endpoint
2. Request validation
3. Carrier orchestration
4. Response aggregation

### Phase 5: Testing & Deployment
1. Unit tests for services
2. Integration tests for APIs
3. E2E tests for flows
4. Production deployment setup

---

## TypeScript Strict Mode

All the following are **ENABLED**:
- ✓ `strict` - All strict flags
- ✓ `noImplicitAny` - No implicit any types
- ✓ `strictNullChecks` - Strict null checking
- ✓ `strictFunctionTypes` - Strict function types
- ✓ `noUnusedLocals` - Error on unused variables
- ✓ `noUnusedParameters` - Error on unused parameters
- ✓ `noFallthroughCasesInSwitch` - Error on switch fallthrough

This ensures **maximum type safety** at compile time.

---

## Code Style

**Prettier Configuration:**
- 2-space indentation
- 100 character line width
- Single quotes
- Trailing commas (ES5 style)
- Semicolons enabled

**ESLint:**
- Next.js recommended rules
- TypeScript support
- React hooks rules

---

## Git Workflow

```bash
# View commit history
git log --oneline

# Check status
git status

# Stage changes
git add .

# Commit with message
git commit -m "Feature: description"

# Push to remote (when configured)
git push origin main
```

---

## Important Notes

1. **No Implicit Any** - All types must be explicit. The compiler will error on missing type annotations.

2. **Unused Variables** - The compiler errors on unused local variables or parameters.

3. **Environment Variables** - Always use `.env.local` for sensitive data. Never commit actual API keys.

4. **Carrier Configuration** - Use `.env.local` to set sandbox flags and credentials.

5. **Type Definitions** - Always export types from `src/types/domain.ts` for consistency.

---

## Helpful Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Design Patterns Guide](docs/architecture.md)
- [Architecture Documentation](docs/architecture.md)

---

**Status:** ✓ Phase 1 Complete  
**Last Updated:** January 24, 2026  
**Ready for Development:** Yes
