/**
 * Validation Chain Unit Tests
 * Tests for all validators and the chain of responsibility pattern
 */

import { describe, it, expect } from 'vitest';
import { Address, Package } from '@/types/domain';
import {
  RequiredAddressFieldsValidator,
  PostalCodeFormatValidator,
  StateCodeValidator,
  DimensionsValidator,
  WeightValidator,
  DeclaredValueValidator,
} from '@/services/validators/validation-chain';
import { createAddressValidationChain, createPackageValidationChain } from '@/services/validators';

describe('Address Validators', () => {
  describe('RequiredAddressFieldsValidator', () => {
    it('should reject address with empty required fields', () => {
      const validator = new RequiredAddressFieldsValidator();
      const invalidAddress: Address = {
        name: 'John Doe',
        street1: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      };

      const result = validator.validate(invalidAddress);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.field === 'street1')).toBe(true);
    });

    it('should accept address with all required fields', () => {
      const validator = new RequiredAddressFieldsValidator();
      const validAddress: Address = {
        name: 'John Doe',
        street1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'US',
      };

      const result = validator.validate(validAddress);

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('PostalCodeFormatValidator', () => {
    it('should accept valid US ZIP code (5 digits)', () => {
      const validator = new PostalCodeFormatValidator();
      const address: Address = {
        name: 'John Doe',
        street1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'US',
      };

      const result = validator.validate(address);

      expect(result.isValid).toBe(true);
    });

    it('should accept valid US ZIP code (ZIP+4 format)', () => {
      const validator = new PostalCodeFormatValidator();
      const address: Address = {
        name: 'John Doe',
        street1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701-1234',
        country: 'US',
      };

      const result = validator.validate(address);

      expect(result.isValid).toBe(true);
    });

    it('should reject invalid US ZIP code', () => {
      const validator = new PostalCodeFormatValidator();
      const address: Address = {
        name: 'John Doe',
        street1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '123',
        country: 'US',
      };

      const result = validator.validate(address);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'postalCode')).toBe(true);
    });

    it('should accept valid Canadian postal code', () => {
      const validator = new PostalCodeFormatValidator();
      const address: Address = {
        name: 'Jane Doe',
        street1: '456 King St',
        city: 'Toronto',
        state: 'ON',
        postalCode: 'M5H 2A1',
        country: 'CA',
      };

      const result = validator.validate(address);

      expect(result.isValid).toBe(true);
    });

    it('should reject invalid Canadian postal code', () => {
      const validator = new PostalCodeFormatValidator();
      const address: Address = {
        name: 'Jane Doe',
        street1: '456 King St',
        city: 'Toronto',
        state: 'ON',
        postalCode: '12345',
        country: 'CA',
      };

      const result = validator.validate(address);

      expect(result.isValid).toBe(false);
    });
  });

  describe('StateCodeValidator', () => {
    it('should accept valid US state code', () => {
      const validator = new StateCodeValidator();
      const address: Address = {
        name: 'John Doe',
        street1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'US',
      };

      const result = validator.validate(address);

      expect(result.isValid).toBe(true);
    });

    it('should reject invalid US state code', () => {
      const validator = new StateCodeValidator();
      const address: Address = {
        name: 'John Doe',
        street1: '123 Main St',
        city: 'Springfield',
        state: 'XX',
        postalCode: '62701',
        country: 'US',
      };

      const result = validator.validate(address);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_US_STATE')).toBe(true);
    });

    it('should accept valid Canadian province code', () => {
      const validator = new StateCodeValidator();
      const address: Address = {
        name: 'Jane Doe',
        street1: '456 King St',
        city: 'Toronto',
        state: 'ON',
        postalCode: 'M5H 2A1',
        country: 'CA',
      };

      const result = validator.validate(address);

      expect(result.isValid).toBe(true);
    });

    it('should reject invalid Canadian province code', () => {
      const validator = new StateCodeValidator();
      const address: Address = {
        name: 'Jane Doe',
        street1: '456 King St',
        city: 'Toronto',
        state: 'XX',
        postalCode: 'M5H 2A1',
        country: 'CA',
      };

      const result = validator.validate(address);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_CA_PROVINCE')).toBe(true);
    });
  });
});

describe('Package Validators', () => {
  describe('DimensionsValidator', () => {
    it('should reject negative dimensions', () => {
      const validator = new DimensionsValidator();
      const pkg: Package = {
        id: 'pkg-1',
        dimensions: {
          length: -5,
          width: 10,
          height: 10,
          unit: 'in',
        },
        weight: { value: 5, unit: 'lbs' },
        type: 'box',
      };

      const result = validator.validate(pkg);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'length')).toBe(true);
    });

    it('should reject dimensions exceeding USPS limit (inches)', () => {
      const validator = new DimensionsValidator();
      const pkg: Package = {
        id: 'pkg-1',
        dimensions: {
          length: 100,
          width: 50,
          height: 50,
          unit: 'in',
        },
        weight: { value: 5, unit: 'lbs' },
        type: 'box',
      };

      const result = validator.validate(pkg);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'DIMENSIONS_EXCEED_LIMIT')).toBe(true);
    });

    it('should accept valid dimensions (inches)', () => {
      const validator = new DimensionsValidator();
      const pkg: Package = {
        id: 'pkg-1',
        dimensions: {
          length: 10,
          width: 10,
          height: 10,
          unit: 'in',
        },
        weight: { value: 5, unit: 'lbs' },
        type: 'box',
      };

      const result = validator.validate(pkg);

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('WeightValidator', () => {
    it('should reject negative weight', () => {
      const validator = new WeightValidator();
      const pkg: Package = {
        id: 'pkg-1',
        dimensions: {
          length: 10,
          width: 10,
          height: 10,
          unit: 'in',
        },
        weight: { value: -5, unit: 'lbs' },
        type: 'box',
      };

      const result = validator.validate(pkg);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'weight')).toBe(true);
    });

    it('should reject weight exceeding carrier limit (150 lbs)', () => {
      const validator = new WeightValidator();
      const pkg: Package = {
        id: 'pkg-1',
        dimensions: {
          length: 10,
          width: 10,
          height: 10,
          unit: 'in',
        },
        weight: { value: 200, unit: 'lbs' },
        type: 'box',
      };

      const result = validator.validate(pkg);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'WEIGHT_EXCEEDS_LIMIT')).toBe(true);
    });

    it('should accept valid weight', () => {
      const validator = new WeightValidator();
      const pkg: Package = {
        id: 'pkg-1',
        dimensions: {
          length: 10,
          width: 10,
          height: 10,
          unit: 'in',
        },
        weight: { value: 50, unit: 'lbs' },
        type: 'box',
      };

      const result = validator.validate(pkg);

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('DeclaredValueValidator', () => {
    it('should reject negative declared value', () => {
      const validator = new DeclaredValueValidator();
      const pkg: Package = {
        id: 'pkg-1',
        dimensions: {
          length: 10,
          width: 10,
          height: 10,
          unit: 'in',
        },
        weight: { value: 5, unit: 'lbs' },
        type: 'box',
        declaredValue: -100,
      };

      const result = validator.validate(pkg);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'declaredValue')).toBe(true);
    });

    it('should accept positive declared value', () => {
      const validator = new DeclaredValueValidator();
      const pkg: Package = {
        id: 'pkg-1',
        dimensions: {
          length: 10,
          width: 10,
          height: 10,
          unit: 'in',
        },
        weight: { value: 5, unit: 'lbs' },
        type: 'box',
        declaredValue: 100,
      };

      const result = validator.validate(pkg);

      expect(result.isValid).toBe(true);
    });

    it('should accept package without declared value', () => {
      const validator = new DeclaredValueValidator();
      const pkg: Package = {
        id: 'pkg-1',
        dimensions: {
          length: 10,
          width: 10,
          height: 10,
          unit: 'in',
        },
        weight: { value: 5, unit: 'lbs' },
        type: 'box',
      };

      const result = validator.validate(pkg);

      expect(result.isValid).toBe(true);
    });
  });
});

describe('Validation Chains', () => {
  describe('Address Validation Chain', () => {
    it('should pass all validators for valid address', () => {
      const chain = createAddressValidationChain();
      const validAddress: Address = {
        name: 'John Doe',
        street1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'US',
      };

      const result = chain.validate(validAddress);

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should fail at first validator for missing required fields', () => {
      const chain = createAddressValidationChain();
      const invalidAddress: Address = {
        name: 'John Doe',
        street1: '',
        city: '',
        state: 'IL',
        postalCode: '62701',
        country: 'US',
      };

      const result = chain.validate(invalidAddress);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail at postal code validator for invalid format', () => {
      const chain = createAddressValidationChain();
      const invalidAddress: Address = {
        name: 'John Doe',
        street1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: 'INVALID',
        country: 'US',
      };

      const result = chain.validate(invalidAddress);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'postalCode')).toBe(true);
    });
  });

  describe('Package Validation Chain', () => {
    it('should pass all validators for valid package', () => {
      const chain = createPackageValidationChain();
      const validPackage: Package = {
        id: 'pkg-1',
        dimensions: {
          length: 10,
          width: 10,
          height: 10,
          unit: 'in',
        },
        weight: { value: 5, unit: 'lbs' },
        type: 'box',
        declaredValue: 100,
      };

      const result = chain.validate(validPackage);

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should fail at dimensions validator for exceeding size limit', () => {
      const chain = createPackageValidationChain();
      const invalidPackage: Package = {
        id: 'pkg-1',
        dimensions: {
          length: 100,
          width: 50,
          height: 50,
          unit: 'in',
        },
        weight: { value: 5, unit: 'lbs' },
        type: 'box',
      };

      const result = chain.validate(invalidPackage);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'DIMENSIONS_EXCEED_LIMIT')).toBe(true);
    });

    it('should fail at weight validator for exceeding weight limit', () => {
      const chain = createPackageValidationChain();
      const invalidPackage: Package = {
        id: 'pkg-1',
        dimensions: {
          length: 10,
          width: 10,
          height: 10,
          unit: 'in',
        },
        weight: { value: 200, unit: 'lbs' },
        type: 'box',
      };

      const result = chain.validate(invalidPackage);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'WEIGHT_EXCEEDS_LIMIT')).toBe(true);
    });
  });
});
