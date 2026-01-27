/**
 * Chain of Responsibility Pattern Implementation for Validation
 * Flexible validation system where each validator can pass data to the next
 */

import { Address, Package } from '@/types/domain';

/**
 * Represents an individual validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Generic validator interface that supports chaining
 */
export interface Validator<T> {
  /**
   * Sets the next validator in the chain
   * Returns the next validator for fluent API chaining
   */
  setNext(validator: Validator<T>): Validator<T>;

  /**
   * Validates the input and returns the result
   */
  validate(data: T): ValidationResult;
}

/**
 * Abstract base class for all validators
 * Implements the core chain of responsibility logic
 */
export abstract class BaseValidator<T> implements Validator<T> {
  protected nextValidator: Validator<T> | null = null;

  /**
   * Sets the next validator in the chain
   * Returns the next validator for fluent chaining
   */
  setNext(validator: Validator<T>): Validator<T> {
    this.nextValidator = validator;
    return validator;
  }

  /**
   * Validates data and passes to next validator if successful
   */
  validate(data: T): ValidationResult {
    // Perform this validator's validation
    const result = this.doValidation(data);

    // If validation fails, return immediately
    if (!result.isValid) {
      return result;
    }

    // If validation passes and there's a next validator, call it
    if (this.nextValidator) {
      return this.nextValidator.validate(data);
    }

    // If validation passes and no next validator, return success
    return result;
  }

  /**
   * Abstract method for subclasses to implement their specific validation logic
   */
  protected abstract doValidation(data: T): ValidationResult;
}

// ============================================================================
// Address Validators
// ============================================================================

/**
 * Validates that all required address fields are present and not empty
 */
export class RequiredAddressFieldsValidator extends BaseValidator<Address> {
  protected doValidation(data: Address): ValidationResult {
    const errors: ValidationError[] = [];

    if (!data.street1 || data.street1.trim() === '') {
      errors.push({
        field: 'street1',
        message: 'Street address is required',
        code: 'ADDRESS_STREET_REQUIRED',
      });
    }

    if (!data.city || data.city.trim() === '') {
      errors.push({
        field: 'city',
        message: 'City is required',
        code: 'ADDRESS_CITY_REQUIRED',
      });
    }

    if (!data.state || data.state.trim() === '') {
      errors.push({
        field: 'state',
        message: 'State/Province is required',
        code: 'ADDRESS_STATE_REQUIRED',
      });
    }

    if (!data.postalCode || data.postalCode.trim() === '') {
      errors.push({
        field: 'postalCode',
        message: 'Postal code is required',
        code: 'ADDRESS_POSTAL_CODE_REQUIRED',
      });
    }

    if (!data.country || data.country.trim() === '') {
      errors.push({
        field: 'country',
        message: 'Country is required',
        code: 'ADDRESS_COUNTRY_REQUIRED',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Validates that origin address is in the United States (required for US-based carriers)
 */
export class OriginCountryValidator extends BaseValidator<Address> {
  protected doValidation(data: Address): ValidationResult {
    const errors: ValidationError[] = [];
    const country = data.country.toUpperCase();

    if (country !== 'US' && country !== 'USA') {
      errors.push({
        field: 'country',
        message:
          'Origin address must be in the United States. This shipping calculator supports shipments from the US to international destinations.',
        code: 'ORIGIN_MUST_BE_US',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Validates postal code format based on country
 */
export class PostalCodeFormatValidator extends BaseValidator<Address> {
  protected doValidation(data: Address): ValidationResult {
    const errors: ValidationError[] = [];
    const country = data.country.toUpperCase();
    const postalCode = data.postalCode.trim();

    // US postal code: 5 or 9 digits (12345 or 12345-6789)
    if (country === 'US' || country === 'USA') {
      const usZipRegex = /^\d{5}(-\d{4})?$/;
      if (!usZipRegex.test(postalCode)) {
        errors.push({
          field: 'postalCode',
          message: 'US ZIP code must be 5 digits or 5+4 format',
          code: 'INVALID_US_POSTAL_CODE',
        });
      }
    }

    // UK postal code: Format like SW1A 1AA or B33 8TH
    if (country === 'GB' || country === 'UK') {
      const ukPostalRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
      if (!ukPostalRegex.test(postalCode)) {
        errors.push({
          field: 'postalCode',
          message: 'UK postcode must be in format like SW1A 1AA',
          code: 'INVALID_UK_POSTAL_CODE',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Validates state code is valid for the given country
 */
export class StateCodeValidator extends BaseValidator<Address> {
  private readonly usStates = new Set([
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
    'DC',
    'PR',
    'VI',
    'GU',
    'AS',
    'MP',
  ]);

  private readonly ukRegions = new Set(['England', 'Scotland', 'Wales', 'Northern Ireland']);

  protected doValidation(data: Address): ValidationResult {
    const errors: ValidationError[] = [];
    const country = data.country.toUpperCase();
    const state = data.state.trim();

    if (country === 'US' || country === 'USA') {
      if (!this.usStates.has(state.toUpperCase())) {
        errors.push({
          field: 'state',
          message: 'Invalid US state code',
          code: 'INVALID_US_STATE',
        });
      }
    } else if (country === 'GB') {
      if (!this.ukRegions.has(state)) {
        errors.push({
          field: 'state',
          message: 'Invalid UK region. Please select England, Scotland, Wales, or Northern Ireland',
          code: 'INVALID_UK_REGION',
        });
      }
    }
    // For other countries, state code validation is skipped

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// ============================================================================
// Package Validators
// ============================================================================

/**
 * Validates package dimensions are positive and within carrier limits
 */
export class DimensionsValidator extends BaseValidator<Package> {
  protected doValidation(data: Package): ValidationResult {
    const errors: ValidationError[] = [];
    const { length, width, height, unit } = data.dimensions;

    // Check all dimensions are positive
    if (length <= 0) {
      errors.push({
        field: 'length',
        message: 'Length must be greater than 0',
        code: 'INVALID_DIMENSION_LENGTH',
      });
    }

    if (width <= 0) {
      errors.push({
        field: 'width',
        message: 'Width must be greater than 0',
        code: 'INVALID_DIMENSION_WIDTH',
      });
    }

    if (height <= 0) {
      errors.push({
        field: 'height',
        message: 'Height must be greater than 0',
        code: 'INVALID_DIMENSION_HEIGHT',
      });
    }

    // Check against carrier limits (USPS limit: length + 2*(width + height) < 165)
    if (unit === 'in') {
      const uspsLimit = length + 2 * (width + height);
      if (uspsLimit >= 165) {
        errors.push({
          field: 'dimensions',
          message:
            'Package exceeds maximum size limit (length + 2*(width + height) must be less than 165 inches)',
          code: 'DIMENSIONS_EXCEED_LIMIT',
        });
      }
    } else if (unit === 'cm') {
      // USPS limit in cm: length + 2*(width + height) < 420 cm (165 inches)
      const uspsLimitCm = length + 2 * (width + height);
      if (uspsLimitCm >= 420) {
        errors.push({
          field: 'dimensions',
          message:
            'Package exceeds maximum size limit (length + 2*(width + height) must be less than 420 cm)',
          code: 'DIMENSIONS_EXCEED_LIMIT',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Validates package weight is positive and under carrier limits
 */
export class WeightValidator extends BaseValidator<Package> {
  protected doValidation(data: Package): ValidationResult {
    const errors: ValidationError[] = [];
    const { value, unit } = data.weight;

    // Check weight is positive
    if (value <= 0) {
      errors.push({
        field: 'weight',
        message: 'Weight must be greater than 0',
        code: 'INVALID_WEIGHT',
      });
    }

    // Check against carrier limits (common limit: 150 lbs)
    const weightInLbs = unit === 'lbs' ? value : value * 2.20462;

    if (weightInLbs > 150) {
      errors.push({
        field: 'weight',
        message: 'Package weight exceeds maximum limit of 150 lbs',
        code: 'WEIGHT_EXCEEDS_LIMIT',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Validates that declared value (if provided) is positive
 */
export class DeclaredValueValidator extends BaseValidator<Package> {
  protected doValidation(data: Package): ValidationResult {
    const errors: ValidationError[] = [];

    if (data.declaredValue !== undefined && data.declaredValue !== null) {
      if (data.declaredValue < 0) {
        errors.push({
          field: 'declaredValue',
          message: 'Declared value cannot be negative',
          code: 'INVALID_DECLARED_VALUE',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
