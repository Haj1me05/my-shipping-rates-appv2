'use server';

import { z } from 'zod';
import { Address, ValidationError } from '@/types/domain';
import { createAddressValidationChain } from '@/services/validators';

/**
 * Zod schema for address validation
 */
const AddressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State code must be exactly 2 characters'),
  postalCode: z.string().min(5, 'Postal code must be at least 5 characters'),
  country: z.string().length(2, 'Country code must be exactly 2 characters'),
  phone: z.string().optional(),
});

/**
 * Response type for validation
 */
export interface ValidationResponse {
  success: boolean;
  errors?: Record<string, string[]>;
  fieldErrors?: ValidationError[];
}

/**
 * Server action to validate an address
 * Performs both structural validation (Zod) and business logic validation (validation chain)
 */
export async function validateAddress(formData: FormData): Promise<ValidationResponse> {
  try {
    // Extract form data
    const data = Object.fromEntries(formData);

    // Perform Zod validation
    const parseResult = AddressSchema.safeParse(data);

    if (!parseResult.success) {
      // Return flattened Zod errors
      const errors = parseResult.error.flatten().fieldErrors;
      return {
        success: false,
        errors: errors as Record<string, string[]>,
      };
    }

    // Convert to Address type
    const address: Address = {
      name: parseResult.data.name,
      street1: parseResult.data.street1,
      street2: parseResult.data.street2,
      city: parseResult.data.city,
      state: parseResult.data.state,
      postalCode: parseResult.data.postalCode,
      country: parseResult.data.country,
      phone: parseResult.data.phone,
    };

    // Apply business logic validation using chain of responsibility
    const validationChain = createAddressValidationChain();
    const validationResult = validationChain.validate(address);

    if (!validationResult.isValid) {
      return {
        success: false,
        fieldErrors: validationResult.errors,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Address validation error:', error);
    return {
      success: false,
      errors: {
        general: ['An unexpected error occurred during validation'],
      },
    };
  }
}
