# FedEx Adapter - All Routes Support

## Overview

The FedEx adapter has been updated to properly support all four shipping route combinations with correct service selection, pickup types, and address handling.

## Supported Routes

### 1. **US → US (Domestic)**

- **Service Type**: `FEDEX_GROUND`
- **Pickup Type**: `DROPOFF_AT_FEDEX_LOCATION`
- **Description**: Standard US ground shipping
- **Transit Time**: 5 days
- **State Code Format**: 2-character US state codes (e.g., CA, NY, TX)

### 2. **UK → UK (Domestic)**

- **Service Type**: `FEDEX_GROUND`
- **Pickup Type**: `CONTACT_FEDEX_TO_SCHEDULE`
- **Description**: UK domestic ground shipping (requires FedEx contact for pickup scheduling)
- **Transit Time**: 5 days
- **Region Code Format**: 2-character mappings (England→EN, Scotland→SC, Wales→WA, Northern Ireland→NI)

### 3. **US → UK (International)**

- **Service Type**: `INTERNATIONAL_PRIORITY`
- **Pickup Type**: `DROPOFF_AT_FEDEX_LOCATION`
- **Description**: International express shipping from US to UK
- **Transit Time**: 2 days
- **State/Region Codes**: Mixed (US 2-char states + UK 2-char region codes)

### 4. **UK → US (International)**

- **Service Type**: `INTERNATIONAL_PRIORITY`
- **Pickup Type**: `CONTACT_FEDEX_TO_SCHEDULE`
- **Description**: International express shipping from UK to US
- **Transit Time**: 2 days
- **State/Region Codes**: Mixed (UK 2-char region codes + US 2-char states)

## Key Implementation Details

### Postal Code Detection

```typescript
// US: 5 digits or 5+4 format
✓ 12345
✓ 12345-6789

// UK: Alphanumeric pattern
✓ SW1A 1AA
✓ B33 8TH
✓ EC1V 9LT
```

### State/Region Code Conversion

Handles conversion of full names to 2-character FedEx API requirements:

**UK Region Mapping:**

```
England → EN
Scotland → SC
Wales → WA
Northern Ireland → NI
```

**US States:**
All standard 2-letter state codes (AL, AK, AZ, AR, CA, etc.)

### Pickup Type Selection Logic

```typescript
// UK domestic shipments ALWAYS need scheduled pickup
if (originCountry === 'GB' && destinationCountry === 'GB') {
  pickupType = 'CONTACT_FEDEX_TO_SCHEDULE';
}

// All other routes (US domestic and international) use drop-off
else {
  pickupType = 'DROPOFF_AT_FEDEX_LOCATION';
}
```

### Service Type Selection Logic

```typescript
// US Domestic
US → US → FEDEX_GROUND

// UK Domestic
GB → GB → FEDEX_GROUND

// International
US ↔ GB → INTERNATIONAL_PRIORITY
```

## Address Fields Required

All routes now properly include:

- `streetLines` - Street address (array)
- `city` - City name
- `stateOrProvinceCode` - 2-character code (converted from full names)
- `postalCode` - ZIP/Postcode (trimmed for consistency)
- `countryCode` - Country code (US or GB)

## Mock Rates Fallback

When API is unavailable, mock rates are returned for all route types:

1. **FedEx Ground** (Domestic routes)
   - Base: $48.75 | Total: $52.50 | Fuel: $3.75
   - Transit: 5 days

2. **FedEx International Priority** (International routes)
   - Base: $125.50 | Total: $138.75 | Fuel: $13.25
   - Transit: 2 days

3. **FedEx International Economy** (International alternative)
   - Base: $75.25 | Total: $83.10 | Fuel: $7.85
   - Transit: 4 days

## Error Handling

The adapter gracefully handles:

- Invalid postal code formats → Falls back to US detection
- Missing address fields → Uses empty strings
- API failures → Returns mock rates with console warnings
- Whitespace in postal codes → Automatically trimmed

## Testing All Routes

To test all four combinations:

### Test Case 1: US → US

```
Origin: 75062 (Dallas, TX, US)
Destination: 10001 (New York, NY, US)
Expected: FEDEX_GROUND, DROPOFF_AT_FEDEX_LOCATION
```

### Test Case 2: UK → UK

```
Origin: SW1A 1AA (London, England, GB)
Destination: B33 8TH (Birmingham, England, GB)
Expected: FEDEX_GROUND, CONTACT_FEDEX_TO_SCHEDULE
```

### Test Case 3: US → UK

```
Origin: 75062 (Dallas, TX, US)
Destination: SW1A 1AA (London, England, GB)
Expected: INTERNATIONAL_PRIORITY, DROPOFF_AT_FEDEX_LOCATION
```

### Test Case 4: UK → US

```
Origin: SW1A 1AA (London, England, GB)
Destination: 10001 (New York, NY, US)
Expected: INTERNATIONAL_PRIORITY, CONTACT_FEDEX_TO_SCHEDULE
```

## Logging Output

Enhanced console logging shows:

```
[FedEx] ===== ROUTE INFORMATION =====
[FedEx] Route: US → GB
[FedEx] Origin: 75062 (US)
[FedEx] Destination: SW1A 1AA (GB)
[FedEx] Service Type: INTERNATIONAL_PRIORITY
[FedEx] Pickup Type: DROPOFF_AT_FEDEX_LOCATION
[FedEx] Weight: X.XX lbs
[FedEx] ==============================
```

## Files Modified

- `src/adapters/carrier-adapters/fedex-adapter.ts`
  - Enhanced `detectCountryFromPostalCode()` with comprehensive regex patterns
  - Improved `convertStateToFedExCode()` with detailed UK region handling
  - Updated `getServiceTypeForRoute()` for all four combinations
  - Enhanced `getMockRates()` with multiple service options
  - Added detailed route logging for debugging

## Next Steps

1. ✅ FedEx adapter supports all routes
2. ⏳ Test each route combination in the application
3. ⏳ Verify API responses match expected service types
4. ⏳ Monitor for any API validation errors
5. ⏳ Fine-tune rates based on real FedEx API responses

## Notes

- Account 740561073 may have regional limitations
- Mock rates are fallback only - real API rates should be used in production
- All currency conversions handled by FedEx API response
- International rates do NOT include duties/taxes (per FedEx disclaimer)
