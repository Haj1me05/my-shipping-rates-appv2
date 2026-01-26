/**
 * useAddressValidation Hook
 * Handles address validation with real-time feedback
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { Address, ValidationError } from '@/types/domain';
import { createAddressValidationChain } from '@/services/validators';

export interface UseAddressValidationReturn {
  errors: ValidationError[];
  isValidating: boolean;
  validate: (address: Address) => Promise<boolean>;
  validateField: (address: Address, field: keyof Address) => ValidationError[];
  clearErrors: () => void;
}

/**
 * Custom hook for address validation with debouncing and real-time feedback
 */
export function useAddressValidation(debounceMs: number = 300): UseAddressValidationReturn {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Validates a complete address (asynchronously with debounce)
   */
  const validate = useCallback(
    (address: Address): Promise<boolean> => {
      return new Promise((resolve) => {
        // Clear existing debounce timer
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        setIsValidating(true);

        // Set new debounce timer
        debounceTimer.current = setTimeout(() => {
          const chain = createAddressValidationChain();
          const result = chain.validate(address);

          setErrors(result.errors);
          setIsValidating(false);
          debounceTimer.current = null;

          resolve(result.isValid);
        }, debounceMs);
      });
    },
    [debounceMs]
  );

  /**
   * Validates a single field synchronously
   */
  const validateField = useCallback((address: Address, field: keyof Address): ValidationError[] => {
    const chain = createAddressValidationChain();
    const result = chain.validate(address);

    // Filter to only errors for this field
    return result.errors.filter((err) => err.field === field);
  }, []);

  /**
   * Clears all validation errors
   */
  const clearErrors = useCallback((): void => {
    setErrors([]);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }, []);

  return {
    errors,
    isValidating,
    validate,
    validateField,
    clearErrors,
  };
}
