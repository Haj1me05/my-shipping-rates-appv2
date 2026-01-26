/**
 * Validation Factory Functions
 * Creates pre-configured validation chains for different validation scenarios
 */

import { Address, Package } from '@/types/domain';
import {
  Validator,
  RequiredAddressFieldsValidator,
  PostalCodeFormatValidator,
  StateCodeValidator,
  DimensionsValidator,
  WeightValidator,
  DeclaredValueValidator,
} from './validation-chain';

/**
 * Creates a validation chain for address validation
 * Validators are chained in logical order:
 * 1. Required fields must be present
 * 2. Postal code format is valid for the country
 * 3. State code is valid for the country
 */
export function createAddressValidationChain(): Validator<Address> {
  const requiredFieldsValidator = new RequiredAddressFieldsValidator();
  const postalCodeValidator = new PostalCodeFormatValidator();
  const stateCodeValidator = new StateCodeValidator();

  requiredFieldsValidator.setNext(postalCodeValidator).setNext(stateCodeValidator);

  return requiredFieldsValidator;
}

/**
 * Creates a validation chain for package validation
 * Validators are chained in logical order:
 * 1. Dimensions are positive and within limits
 * 2. Weight is positive and under carrier limits
 * 3. Declared value (if provided) is valid
 */
export function createPackageValidationChain(): Validator<Package> {
  const dimensionsValidator = new DimensionsValidator();
  const weightValidator = new WeightValidator();
  const declaredValueValidator = new DeclaredValueValidator();

  dimensionsValidator.setNext(weightValidator).setNext(declaredValueValidator);

  return dimensionsValidator;
}
