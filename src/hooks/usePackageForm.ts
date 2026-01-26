/**
 * usePackageForm Hook
 * Manages complete multi-step form state and validation
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Address, Package, ShippingOptions, ValidationError } from '@/types/domain';
import { PackageFormState, initialFormState } from '@/types/form-state';
import { saveFormState, loadFormState, clearFormState } from '@/lib/form-storage';
import { createAddressValidationChain, createPackageValidationChain } from '@/services/validators';

export interface UsePackageFormReturn {
  state: PackageFormState;
  updatePackage: (pkg: Partial<Package>) => void;
  updateOriginAddress: (address: Partial<Address>) => void;
  updateDestinationAddress: (address: Partial<Address>) => void;
  updateShippingOptions: (options: Partial<ShippingOptions>) => void;
  nextStep: () => boolean;
  previousStep: () => void;
  goToStep: (step: number) => void;
  submitForm: () => Promise<boolean>;
  reset: () => void;
  validateCurrentStep: () => boolean;
  hasRestoredState: boolean;
  discardAndStart: () => void;
}

/**
 * Custom hook for managing multi-step form state
 * Includes validation and localStorage persistence
 */
export function usePackageForm(): UsePackageFormReturn {
  const [state, setState] = useState<PackageFormState>(initialFormState);
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = loadFormState();
    if (saved) {
      setState(saved);
      setHasRestoredState(true);
    } else {
      setHasRestoredState(false);
    }
  }, []);

  // Save state to localStorage whenever it changes (debounced)
  useEffect(() => {
    if (hasRestoredState) {
      const timer = setTimeout(() => {
        saveFormState(state);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state, hasRestoredState]);

  /**
   * Updates package information
   */
  const updatePackage = useCallback((pkg: Partial<Package>) => {
    setState((prev) => ({
      ...prev,
      package: { ...prev.package, ...pkg },
      lastUpdated: Date.now(),
    }));
  }, []);

  /**
   * Updates origin address
   */
  const updateOriginAddress = useCallback((address: Partial<Address>) => {
    setState((prev) => ({
      ...prev,
      originAddress: { ...prev.originAddress, ...address },
      lastUpdated: Date.now(),
    }));
  }, []);

  /**
   * Updates destination address
   */
  const updateDestinationAddress = useCallback((address: Partial<Address>) => {
    setState((prev) => ({
      ...prev,
      destinationAddress: { ...prev.destinationAddress, ...address },
      lastUpdated: Date.now(),
    }));
  }, []);

  /**
   * Updates shipping options
   */
  const updateShippingOptions = useCallback((options: Partial<ShippingOptions>) => {
    setState((prev) => ({
      ...prev,
      shippingOptions: { ...prev.shippingOptions, ...options },
      lastUpdated: Date.now(),
    }));
  }, []);

  /**
   * Validates the current step before advancing
   */
  const validateCurrentStep = useCallback((): boolean => {
    let stepErrors: ValidationError[] = [];

    if (state.currentStep === 1) {
      // Validate package step
      const chain = createPackageValidationChain();
      const result = chain.validate(state.package as Package);
      stepErrors = result.errors;
    } else if (state.currentStep === 2) {
      // Validate address step (both addresses)
      const chain = createAddressValidationChain();
      const originResult = chain.validate(state.originAddress as Address);
      const destResult = chain.validate(state.destinationAddress as Address);
      stepErrors = [...originResult.errors, ...destResult.errors];
    }

    if (stepErrors.length > 0) {
      setState((prev) => ({
        ...prev,
        stepErrors: {
          ...prev.stepErrors,
          packageStep: state.currentStep === 1 ? stepErrors : prev.stepErrors.packageStep,
          addressStep: state.currentStep === 2 ? stepErrors : prev.stepErrors.addressStep,
        },
      }));
      return false;
    }

    // Clear errors for this step
    setState((prev) => ({
      ...prev,
      stepErrors: {
        ...prev.stepErrors,
        packageStep: state.currentStep === 1 ? [] : prev.stepErrors.packageStep,
        addressStep: state.currentStep === 2 ? [] : prev.stepErrors.addressStep,
      },
    }));

    return true;
  }, [state.currentStep, state.package, state.originAddress, state.destinationAddress]);

  /**
   * Advances to the next step if current step is valid
   */
  const nextStep = useCallback((): boolean => {
    if (state.currentStep >= 4) {
      return false;
    }

    if (!validateCurrentStep()) {
      return false;
    }

    setState((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));

    return true;
  }, [state.currentStep, validateCurrentStep]);

  /**
   * Goes to the previous step
   */
  const previousStep = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
    }));
  }, []);

  /**
   * Jumps to a specific step (for edit functionality)
   */
  const goToStep = useCallback((step: number): void => {
    if (step >= 1 && step <= 4) {
      setState((prev) => ({
        ...prev,
        currentStep: step,
      }));
    }
  }, []);

  /**
   * Submits the complete form
   */
  const submitForm = useCallback(async (): Promise<boolean> => {
    // Validate all steps
    let allValid = true;
    const allErrors: { [key: string]: ValidationError[] } = {
      packageStep: [],
      addressStep: [],
      optionsStep: [],
    };

    // Validate package
    const packageChain = createPackageValidationChain();
    const packageResult = packageChain.validate(state.package as Package);
    if (!packageResult.isValid) {
      allValid = false;
      allErrors.packageStep = packageResult.errors;
    }

    // Validate addresses
    const addressChain = createAddressValidationChain();
    const originResult = addressChain.validate(state.originAddress as Address);
    const destResult = addressChain.validate(state.destinationAddress as Address);
    if (!originResult.isValid || !destResult.isValid) {
      allValid = false;
      allErrors.addressStep = [...originResult.errors, ...destResult.errors];
    }

    if (!allValid) {
      setState((prev) => ({
        ...prev,
        stepErrors: allErrors as any,
      }));
      return false;
    }

    // Mark as submitting
    setState((prev) => ({
      ...prev,
      submitting: true,
    }));

    try {
      // TODO: Send to server for rate calculation
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => ({
        ...prev,
        submitting: false,
        submitted: true,
      }));

      clearFormState();
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      setState((prev) => ({
        ...prev,
        submitting: false,
      }));
      return false;
    }
  }, [state.package, state.originAddress, state.destinationAddress]);

  /**
   * Resets form to initial state
   */
  const reset = useCallback((): void => {
    setState(initialFormState);
    clearFormState();
  }, []);

  /**
   * Discards saved state and starts fresh
   */
  const discardAndStart = useCallback((): void => {
    setState(initialFormState);
    clearFormState();
    setHasRestoredState(false);
  }, []);

  return {
    state,
    updatePackage,
    updateOriginAddress,
    updateDestinationAddress,
    updateShippingOptions,
    nextStep,
    previousStep,
    goToStep,
    submitForm,
    reset,
    validateCurrentStep,
    hasRestoredState,
    discardAndStart,
  };
}
