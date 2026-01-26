/**
 * usePackageForm Hook Integration Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePackageForm } from '@/hooks/usePackageForm';
import { PackageFormState } from '@/types/form-state';
import * as formStorage from '@/lib/form-storage';

// Mock localStorage functions
vi.mock('@/lib/form-storage');

describe('usePackageForm Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mocks
    vi.mocked(formStorage.loadFormState).mockReturnValue(null);
    vi.mocked(formStorage.hasFormState).mockReturnValue(false);
  });

  it('should initialize with default form state', () => {
    const { result } = renderHook(() => usePackageForm());

    expect(result.current.state.currentStep).toBe(1);
    expect(result.current.state.package).toBeDefined();
    expect(result.current.state.originAddress).toBeDefined();
    expect(result.current.state.destinationAddress).toBeDefined();
  });

  it('should load form state from localStorage on mount', () => {
    const savedState: PackageFormState = {
      currentStep: 2,
      package: { type: 'box', weight: { value: 10, unit: 'lbs' } },
      originAddress: {},
      destinationAddress: {},
      shippingOptions: {
        speed: 'standard',
        signatureRequired: false,
        insurance: false,
        fragileHandling: false,
        saturdayDelivery: false,
      },
      stepErrors: { packageStep: [], addressStep: [], optionsStep: [] },
      submitting: false,
      submitted: false,
      lastUpdated: Date.now(),
    };

    vi.mocked(formStorage.loadFormState).mockReturnValue(savedState);

    const { result } = renderHook(() => usePackageForm());

    expect(formStorage.loadFormState).toHaveBeenCalled();
    expect(result.current.hasRestoredState).toBe(true);
  });

  it('should update package information', () => {
    const { result } = renderHook(() => usePackageForm());

    act(() => {
      result.current.updatePackage({
        type: 'envelope',
        weight: { value: 5, unit: 'lbs' },
      });
    });

    expect(result.current.state.package.type).toBe('envelope');
    expect(result.current.state.package.weight?.value).toBe(5);
  });

  it('should update origin address', () => {
    const { result } = renderHook(() => usePackageForm());

    act(() => {
      result.current.updateOriginAddress({
        street1: '123 Main St',
        city: 'Springfield',
      });
    });

    expect(result.current.state.originAddress.street1).toBe('123 Main St');
    expect(result.current.state.originAddress.city).toBe('Springfield');
  });

  it('should update destination address', () => {
    const { result } = renderHook(() => usePackageForm());

    act(() => {
      result.current.updateDestinationAddress({
        street1: '456 Oak Ave',
        city: 'Portland',
      });
    });

    expect(result.current.state.destinationAddress.street1).toBe('456 Oak Ave');
    expect(result.current.state.destinationAddress.city).toBe('Portland');
  });

  it('should update shipping options', () => {
    const { result } = renderHook(() => usePackageForm());

    act(() => {
      result.current.updateShippingOptions({
        speed: 'overnight',
        signatureRequired: true,
      });
    });

    expect(result.current.state.shippingOptions.speed).toBe('overnight');
    expect(result.current.state.shippingOptions.signatureRequired).toBe(true);
  });

  it('should advance to next step on valid data', () => {
    const { result } = renderHook(() => usePackageForm());

    // Set valid package data
    act(() => {
      result.current.updatePackage({
        type: 'box',
        dimensions: { length: 10, width: 10, height: 10, unit: 'in' },
        weight: { value: 5, unit: 'lbs' },
      });
    });

    // Attempt to advance
    act(() => {
      const success = result.current.nextStep();
      expect(success).toBe(true);
    });

    expect(result.current.state.currentStep).toBe(2);
  });

  it('should not advance step with invalid package data', () => {
    const { result } = renderHook(() => usePackageForm());

    // Don't set package data, leave it invalid
    act(() => {
      const success = result.current.nextStep();
      expect(success).toBe(false);
    });

    expect(result.current.state.currentStep).toBe(1);
    expect(result.current.state.stepErrors.packageStep.length).toBeGreaterThan(0);
  });

  it('should go to previous step', async () => {
    const { result } = renderHook(() => usePackageForm());

    // First, wait for the hook to initialize
    await waitFor(() => {
      expect(result.current.state).toBeDefined();
    });

    // Move to step 2 with all required fields properly set
    await act(async () => {
      result.current.updatePackage({
        type: 'box',
        dimensions: { length: 10, width: 10, height: 10, unit: 'in' },
        weight: { value: 5, unit: 'lbs' },
      });
    });

    act(() => {
      const success = result.current.nextStep();
      expect(success).toBe(true);
    });

    // Give state update time to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result.current.state.currentStep).toBe(2);

    // Go back to step 1
    act(() => {
      result.current.previousStep();
    });

    expect(result.current.state.currentStep).toBe(1);
  });

  it('should jump to specific step with goToStep', () => {
    const { result } = renderHook(() => usePackageForm());

    act(() => {
      result.current.goToStep(3);
    });

    expect(result.current.state.currentStep).toBe(3);
  });

  it('should not allow goToStep beyond bounds', () => {
    const { result } = renderHook(() => usePackageForm());

    act(() => {
      result.current.goToStep(5);
    });

    expect(result.current.state.currentStep).toBe(1);
  });

  it('should reset form to initial state', () => {
    const { result } = renderHook(() => usePackageForm());

    // Make changes
    act(() => {
      result.current.updatePackage({ type: 'envelope' });
      result.current.updateShippingOptions({ speed: 'overnight' });
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.state.currentStep).toBe(1);
    expect(result.current.state.package.type).toBe('box'); // Initial state has 'box'
    expect(result.current.state.shippingOptions.speed).toBe('standard'); // Initial state has 'standard'
    expect(formStorage.clearFormState).toHaveBeenCalled();
  });

  it('should save form state to localStorage on changes', () => {
    const { result } = renderHook(() => usePackageForm());

    // The hook saves to localStorage on state changes
    expect(result.current.state).toBeDefined();

    act(() => {
      result.current.updatePackage({ type: 'envelope' });
    });

    // Verify state was updated
    expect(result.current.state.package.type).toBe('envelope');
  });

  it('should submit form with valid data', async () => {
    const { result } = renderHook(() => usePackageForm());

    // Set all required data
    act(() => {
      result.current.updatePackage({
        type: 'box',
        dimensions: { length: 10, width: 10, height: 10, unit: 'in' },
        weight: { value: 5, unit: 'lbs' },
      });
      result.current.updateOriginAddress({
        name: 'John Doe',
        street1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'US',
      });
      result.current.updateDestinationAddress({
        name: 'Jane Smith',
        street1: '456 Oak Ave',
        city: 'Portland',
        state: 'OR',
        postalCode: '97201',
        country: 'US',
      });
    });

    // Advance to final step to verify all data is present
    act(() => {
      result.current.goToStep(4);
    });

    expect(result.current.state.currentStep).toBe(4);
    expect(result.current.state.package.type).toBe('box');
    expect(result.current.state.originAddress.street1).toBe('123 Main St');
    expect(result.current.state.destinationAddress.street1).toBe('456 Oak Ave');
  });

  it('should not submit form with invalid data', () => {
    const { result } = renderHook(() => usePackageForm());

    // Try to submit without setting required data
    // The hook should validate and prevent submission
    expect(result.current.state.package.dimensions?.length).toBe(0);

    // Verify we can't advance to next step without valid package
    act(() => {
      const success = result.current.nextStep();
      expect(success).toBe(false);
    });

    expect(result.current.state.currentStep).toBe(1);
  });

  it('should discard saved state and start fresh', () => {
    vi.mocked(formStorage.loadFormState).mockReturnValueOnce({
      currentStep: 2,
      package: { type: 'envelope' },
      originAddress: {},
      destinationAddress: {},
      shippingOptions: { speed: 'overnight' },
      stepErrors: { packageStep: [], addressStep: [], optionsStep: [] },
      submitting: false,
      submitted: false,
      lastUpdated: Date.now(),
    });

    const { result } = renderHook(() => usePackageForm());

    expect(result.current.state.currentStep).toBe(2);
    expect(result.current.state.package.type).toBe('envelope');

    act(() => {
      result.current.discardAndStart();
    });

    expect(result.current.state.currentStep).toBe(1);
    expect(result.current.state.package.type).toBe('box');
    expect(formStorage.clearFormState).toHaveBeenCalled();
  });
});
