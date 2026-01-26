# Multi-Carrier Shipping Rate Calculator

A sophisticated Next.js 16 application for calculating shipping rates across multiple carriers (USPS, FedEx, UPS, DHL) using design patterns, React 19 features, and strict TypeScript.

## Project Status

- ✅ **Phase 1**: Core architecture with design patterns (Strategy, Factory, Decorator, Adapter, Singleton)
- ✅ **Phase 2**: Multi-step form with validation, custom hooks, and accessibility
- 🚧 **Phase 3**: Rate calculation and results display (upcoming)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

### Development Commands

```bash
# Run tests
npm test

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Phase 2: Package Input Form & Validation

### Key Features

✅ **Multi-Step Form (4 Steps)**

1. Package Details - Type, dimensions, weight, value
2. Addresses - Origin and destination with validation
3. Shipping Options - Service speed and additional services
4. Review & Submit - Summary with edit capability

✅ **Chain of Responsibility Validation**

- Address validators (required fields, postal code format, state codes)
- Package validators (dimensions, weight, declared value)
- Flexible, composable validator chains

✅ **Custom React Hooks**

- `usePackageForm` - Multi-step form state management
- `useAddressValidation` - Real-time validation with debounce
- `useDimensionalWeight` - Billable weight calculation

✅ **React 19 Server Actions**

- Address validation Server Action with Zod
- Business logic validation integration
- Error handling and response formatting

✅ **Form Persistence**

- localStorage integration
- Automatic state saving with debounce
- Resume prompt for saved sessions
- Clear state after submission

✅ **Accessibility (WCAG 2.1 Level AA)**

- Semantic HTML and proper labeling
- ARIA attributes for screen readers
- Keyboard navigation support
- Color + icon error indicators
- Focus management

✅ **Comprehensive Testing**

- Unit tests for validation chains (70%+ coverage)
- Integration tests for custom hooks
- Weight calculation tests
- Form state management tests

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
