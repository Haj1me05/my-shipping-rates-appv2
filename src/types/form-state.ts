/**
 * Form State Types
 * Defines the shape of form state for the multi-step package form
 */

import { Address, Package, ShippingOptions, ValidationError } from '@/types/domain';

/**
 * State for a single step in the form
 */
export interface StepState {
  isValid: boolean;
  isDirty: boolean;
  errors: ValidationError[];
}

/**
 * Complete state for the package form
 */
export interface PackageFormState {
  currentStep: number;
  package: Partial<Package>;
  originAddress: Partial<Address>;
  destinationAddress: Partial<Address>;
  shippingOptions: Partial<ShippingOptions>;
  stepErrors: {
    packageStep: ValidationError[];
    addressStep: ValidationError[];
    optionsStep: ValidationError[];
  };
  submitting: boolean;
  submitted: boolean;
  lastUpdated: number;
}

/**
 * Initial form state
 */
export const initialFormState: PackageFormState = {
  currentStep: 1,
  package: {
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      unit: 'in',
    },
    weight: {
      value: 0,
      unit: 'lbs',
    },
    type: 'box',
  },
  originAddress: {
    country: 'US',
  },
  destinationAddress: {
    country: 'US',
  },
  shippingOptions: {
    speed: 'standard',
    signatureRequired: false,
    insurance: false,
    fragileHandling: false,
    saturdayDelivery: false,
  },
  stepErrors: {
    packageStep: [],
    addressStep: [],
    optionsStep: [],
  },
  submitting: false,
  submitted: false,
  lastUpdated: Date.now(),
};
