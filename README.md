# Multi-Carrier Shipping Rate Calculator

A sophisticated Next.js 16 application demonstrating advanced design patterns for calculating shipping rates across multiple carriers (USPS, FedEx, UPS, DHL) with React 19 and strict TypeScript.

---

## Project Overview

This application showcases a professional-grade shipping rate calculator built for the logistics industry. It demonstrates how enterprise design patterns (Adapter, Decorator, Factory, Singleton) can be effectively combined to build scalable, maintainable systems.

**Key Design Patterns Demonstrated:**

- 🔌 **Adapter Pattern** - Normalizing diverse carrier APIs into consistent interfaces
- 🎨 **Decorator Pattern** - Composing dynamic shipping fees without class explosion
- 🏭 **Factory Pattern** - Centralized creation of carrier service instances
- 📦 **Singleton Pattern** - Unified configuration management across the application

**Target Industry:** Logistics & Shipping (B2B SaaS)

---

## Features

- ✅ **Multi-Step Form with Validation** - 4-step form with real-time validation using Zod and custom validators
- ✅ **Parallel Carrier Rate Fetching** - Fetch rates from multiple carriers simultaneously with error handling
- ✅ **Smart Recommendations** - Identify best value, fastest, and most economical options
- ✅ **Responsive Design** - Mobile-first approach using Tailwind CSS 4
- ✅ **Persistence Features** - localStorage integration with automatic state recovery
- ✅ **Type-Safe Implementation** - 100% TypeScript with strict mode enabled
- ✅ **Comprehensive Test Coverage** - 70%+ coverage with unit and integration tests

---

## Architecture

### Design Patterns Overview

| Pattern       | Location                         | Purpose                                                                                       |
| ------------- | -------------------------------- | --------------------------------------------------------------------------------------------- |
| **Adapter**   | `src/adapters/carrier-adapters/` | Normalize heterogeneous carrier APIs into consistent `ShippingRate` interface                 |
| **Decorator** | `src/services/fee-decorators/`   | Dynamically compose optional fees (insurance, signature, fragile handling, Saturday delivery) |
| **Factory**   | `src/factories/`                 | Centralize instantiation of carrier service strategies                                        |
| **Singleton** | `src/config/carrier-config.ts`   | Single point of access for credentials and carrier configuration                              |

For detailed architecture documentation, see [docs/architecture.md](docs/architecture.md).

### Tech Stack

**Frontend**

- Next.js 16.1.4 - React framework with Server Actions
- React 19.2.3 - UI library with latest features
- React DOM 19.2.3 - DOM rendering

**Language & Type Safety**

- TypeScript 5 - Strict mode for compile-time safety
- Zod 4.3.6 - Runtime schema validation

**Styling & UI**

- Tailwind CSS 4 - Utility-first CSS framework
- PostCSS 4 - CSS transformation

**Testing**

- Vitest 4.0.18 - Fast unit test runner
- @testing-library/react 16.3.2 - Component testing utilities
- @testing-library/jest-dom 6.9.1 - DOM matchers
- jsdom 27.4.0 - DOM simulation

**Development Tools**

- ESLint 9 - Code quality and consistency
- Prettier 3.8.1 - Code formatting
- Babel React Compiler - Automatic optimization

**Date Handling**

- date-fns 4.1.0 - Modern date utility library

---

## Getting Started

### Prerequisites

- **Node.js 18+** (18.17 or later recommended)
- **npm 9+** or **yarn 3+** or **pnpm**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/my-shipping-rates-appv2.git
   cd my-shipping-rates-appv2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Carrier API Credentials
   NEXT_PUBLIC_USPS_API_KEY=your_usps_key_here
   NEXT_PUBLIC_FEDEX_API_KEY=your_fedex_key_here
   NEXT_PUBLIC_UPS_API_KEY=your_ups_key_here
   NEXT_PUBLIC_DHL_API_KEY=your_dhl_key_here

   # API Endpoints
   NEXT_PUBLIC_USPS_API_URL=https://secure.shippingapis.com/
   NEXT_PUBLIC_FEDEX_API_URL=https://apis.fedex.com/
   NEXT_PUBLIC_UPS_API_URL=https://onlinetools.ups.com/
   NEXT_PUBLIC_DHL_API_URL=https://api.dhl.com/

   # Environment
   NEXT_PUBLIC_ENVIRONMENT=development
   ```

### Development Commands

| Command                 | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `npm run dev`           | Start development server at http://localhost:3000 |
| `npm run build`         | Build production-optimized bundle                 |
| `npm start`             | Start production server                           |
| `npm test`              | Run all tests with Vitest                         |
| `npm test -- src/hooks` | Run tests for specific directory                  |
| `npm run lint`          | Run ESLint for code quality                       |
| `npm run lint -- --fix` | Automatically fix linting issues                  |

### Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test -- src/hooks/__tests__/usePackageForm.test.ts

# Run tests matching pattern
npm test -- --grep "validation"
```

---

## Project Structure

```
my-shipping-rates-appv2/
├── src/
│   ├── actions/                    # React Server Actions
│   │   └── validate-address.ts     # Address validation logic
│   │
│   ├── adapters/                   # Adapter Pattern Implementation
│   │   └── carrier-adapters/       # Carrier-specific API adapters
│   │       ├── adapter.ts          # Base adapter interface
│   │       ├── fedex-adapter.ts    # FedEx API normalization
│   │       ├── ups-adapter.ts      # UPS API normalization
│   │       ├── usps-adapter.ts     # USPS API normalization
│   │       └── index.ts            # Adapter exports
│   │
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout component
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles
│   │   ├── api/                    # API routes
│   │   │   ├── rates/route.ts      # GET /api/rates endpoint
│   │   │   └── validate-address/route.ts
│   │   └── results/
│   │       └── page.tsx            # Results display page
│   │
│   ├── components/                 # React Components
│   │   ├── forms/                  # Multi-step form components
│   │   │   ├── AddressStep.tsx     # Address input step
│   │   │   ├── PackageDetailsStep.tsx
│   │   │   ├── RateCalculatorForm.tsx    # Main form orchestrator
│   │   │   ├── ReviewStep.tsx      # Review & submit step
│   │   │   └── ShippingOptionsStep.tsx   # Options selection
│   │   │
│   │   ├── results/                # Results display components
│   │   │   ├── BestValueBadge.tsx  # Best value indicator
│   │   │   ├── CarrierLogo.tsx     # Carrier branding
│   │   │   ├── FeaturesList.tsx    # Service features
│   │   │   ├── FeeBreakdown.tsx    # Fee itemization
│   │   │   ├── NoRatesFound.tsx    # Empty state
│   │   │   ├── RateCard.tsx        # Individual rate display
│   │   │   ├── RatesComparisonTable.tsx  # Tabular view
│   │   │   ├── RatesDisplay.tsx    # Results layout
│   │   │   ├── RatesErrorDisplay.tsx     # Error handling
│   │   │   ├── RatesFilters.tsx   # Filter & sort controls
│   │   │   ├── ResultsSkeletonLoader.tsx # Loading state
│   │   │   └── SortIcon.tsx        # Sort indicator
│   │   │
│   │   └── ui/                     # Reusable UI components
│   │       ├── AddressForm.tsx     # Address input form
│   │       ├── DimensionsInput.tsx # Dimension fields
│   │       ├── FormField.tsx       # Generic form field wrapper
│   │       ├── FormNavigation.tsx  # Step navigation
│   │       ├── ServiceSpeedSelector.tsx  # Service level selector
│   │       ├── SubmitButton.tsx    # Accessible submit button
│   │       └── WeightInput.tsx     # Weight input component
│   │
│   ├── config/                     # Singleton Pattern
│   │   └── carrier-config.ts       # Centralized configuration
│   │
│   ├── factories/                  # Factory Pattern
│   │   └── (carrier factory implementation)
│   │
│   ├── hooks/                      # Custom React Hooks
│   │   ├── useAddressValidation.ts # Real-time address validation
│   │   ├── useDimensionalWeight.ts # Billable weight calculator
│   │   ├── usePackageForm.ts       # Multi-step form state
│   │   └── __tests__/              # Hook tests
│   │
│   ├── lib/                        # Utility Functions
│   │   ├── form-storage.ts         # localStorage helpers
│   │   ├── rates-api.ts            # API client for rates
│   │   └── results-storage.ts      # Results persistence
│   │
│   ├── services/                   # Business Logic Layer
│   │   ├── rate-service.ts         # Core rate calculation orchestration
│   │   ├── fee-decorators/         # Decorator Pattern
│   │   │   ├── decorator.ts        # Base decorator interface
│   │   │   └── __tests__/
│   │   ├── rate-calculators/       # Strategy Pattern (carrier-specific)
│   │   ├── validators/             # Chain of Responsibility
│   │   │   ├── index.ts            # Validator registry
│   │   │   ├── validation-chain.ts # Composable validators
│   │   │   └── __tests__/
│   │   └── __tests__/
│   │
│   ├── types/                      # TypeScript Domain Types
│   │   ├── domain.ts               # Shipping domain models
│   │   └── form-state.ts           # Form state types
│   │
│   └── tests/                      # Test Utilities
│       ├── integration/            # Integration test examples
│       └── unit/                   # Unit test utilities
│
├── docs/
│   └── architecture.md             # Detailed architecture guide
│
├── public/                         # Static assets
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.ts              # Tailwind CSS config
├── vitest.config.ts                # Vitest configuration
├── eslint.config.mjs               # ESLint configuration
├── postcss.config.mjs              # PostCSS configuration
└── package.json                    # Dependencies and scripts
```

### Folder Purposes

- **actions/** - React Server Actions for secure backend operations
- **adapters/** - API normalization layer (Adapter Pattern)
- **app/** - Next.js routing and layout
- **components/** - React UI components organized by feature
- **config/** - Application-wide configuration (Singleton Pattern)
- **factories/** - Instance creation helpers (Factory Pattern)
- **hooks/** - Custom React hooks for shared logic
- **lib/** - Pure utility functions (API clients, storage, etc.)
- **services/** - Business logic orchestration and validation
- **types/** - Centralized TypeScript type definitions
- **tests/** - Test utilities and integration test examples

---

## Learning Outcomes

### What Developers Learn

This project is an excellent learning resource for understanding:

**Design Patterns in Production**

- How to implement and combine multiple design patterns in a real application
- When to use each pattern and the trade-offs involved
- How patterns reduce code duplication and improve maintainability

**Type-Safe Architecture**

- Leveraging TypeScript's type system for compile-time safety
- Creating flexible yet type-safe abstractions
- Using generics and discriminated unions effectively

**React 19 & Next.js 16 Advanced Features**

- Server Actions for secure backend communication
- Streaming and progressive enhancement
- Advanced hook composition patterns
- App Router file-based routing

**Testing Best Practices**

- Unit testing with Vitest and React Testing Library
- Testing custom hooks in isolation
- Integration testing for complex state management
- Achieving high coverage while maintaining readable tests

**Form State Management**

- Multi-step form orchestration without external libraries
- Real-time validation with debouncing
- Form persistence and recovery
- Accessibility considerations

**API Integration Patterns**

- Adapter pattern for heterogeneous external APIs
- Error recovery strategies
- Parallel requests and aggregation
- Rate limiting and throttling

### Key Technical Skills Demonstrated

✨ **Advanced TypeScript**

- Strict type checking and strict null checks
- Generic constraints and conditional types
- Discriminated unions for type-safe operations
- Custom type guards and predicates

⚡ **React Mastery**

- Custom hooks and hook composition
- Server Components and Server Actions
- Concurrent features and Suspense boundaries
- Performance optimization with React Compiler

🏗️ **Software Architecture**

- SOLID principles in practice
- Dependency injection and inversion of control
- Separation of concerns across layers
- Service-oriented architecture

🧪 **Testing & Quality**

- Comprehensive test coverage strategies
- Mocking and test doubles
- Integration testing patterns
- Performance testing and monitoring

🔐 **Security & Validation**

- Runtime validation with Zod
- Input sanitization
- Secure API communication
- Environment-based configuration

---

## Project Status

- ✅ **Phase 1**: Core architecture with design patterns
- ✅ **Phase 2**: Multi-step form with validation, custom hooks, and accessibility
- 🚧 **Phase 3**: Rate calculation and results display (in progress)

---

## Contributing

Contributions are welcome! Please ensure:

- Tests pass: `npm test`
- Code is formatted: `npm run lint -- --fix`
- TypeScript compiles: `npx tsc --noEmit`
- New features include tests and documentation

---

## License

MIT

---

## Support

For questions or issues, please open a GitHub issue or contact the maintainers.

### Documentation

- **[PHASE2_IMPLEMENTATION.md](PHASE2_IMPLEMENTATION.md)** - Detailed Phase 2 documentation
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference guide
- **[docs/architecture.md](docs/architecture.md)** - System architecture
- **[PHASE1_SUMMARY.md](PHASE1_SUMMARY.md)** - Phase 1 documentation

### Architecture

```
src/
├── components/forms/         # Multi-step form components
├── components/ui/            # Reusable form field components
├── hooks/                    # Custom hooks (usePackageForm, etc)
├── services/validators/      # Chain of Responsibility validators
├── lib/                      # Utilities (form persistence, etc)
├── types/                    # TypeScript type definitions
├── app/                      # Next.js app routes
├── adapters/                 # Carrier API adapters
├── factories/                # Carrier factory pattern
├── config/                   # Configuration
└── tests/                    # Integration & unit tests
```

### Technology Stack

- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript (strict mode)
- **Validation**: Zod + Chain of Responsibility pattern
- **Testing**: Vitest + React Testing Library
- **Styling**: Tailwind CSS 4
- **UI Components**: Accessible, WCAG 2.1 Level AA compliant

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-first responsive design (320px minimum)
- localStorage required for form persistence

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- validation-chain.test.ts

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## Project Structure

See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for detailed directory structure and design patterns used.

## Performance

- Debounced localStorage saves (500ms)
- Debounced address validation (300-500ms)
- Memoized weight calculations
- Code splitting with Next.js
- Optimized bundle size

## Accessibility

All form components follow WCAG 2.1 Level AA guidelines:

- Proper semantic HTML
- ARIA labels and attributes
- Keyboard navigation
- Screen reader support
- Clear visual indicators
- Focus management

## Next Steps (Phase 3)

- Rate calculation from all carriers
- Results display and comparison
- Rate sorting and filtering
- Rate history and tracking
- User account management

## Contributing

Follow the established patterns from Phase 1 and maintain WCAG 2.1 Level AA accessibility compliance on all new components.

## License

Private project - for internal use only
