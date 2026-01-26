/**
 * useDimensionalWeight Hook Tests
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDimensionalWeight } from '@/hooks/useDimensionalWeight';
import { PackageDimensions, PackageWeight } from '@/types/domain';

describe('useDimensionalWeight Hook', () => {
  it('should calculate dimensional weight for inches', () => {
    const dimensions: PackageDimensions = {
      length: 10,
      width: 8,
      height: 6,
      unit: 'in',
    };
    const weight: PackageWeight = { value: 5, unit: 'lbs' };

    const { result } = renderHook(() => useDimensionalWeight(dimensions, weight));

    const expected = (10 * 8 * 6) / 139; // Approximately 3.44 lbs
    expect(result.current.dimensionalWeight).toBeCloseTo(expected, 2);
  });

  it('should calculate dimensional weight for centimeters', () => {
    const dimensions: PackageDimensions = {
      length: 30,
      width: 20,
      height: 15,
      unit: 'cm',
    };
    const weight: PackageWeight = { value: 2, unit: 'kg' };

    const { result } = renderHook(() => useDimensionalWeight(dimensions, weight));

    // (30 * 20 * 15) / 5000 * 2.20462
    const expected = ((30 * 20 * 15) / 5000) * 2.20462; // Approximately 5.95 lbs
    expect(result.current.dimensionalWeight).toBeCloseTo(expected, 2);
  });

  it('should use billable weight when dimensional weight is greater', () => {
    const dimensions: PackageDimensions = {
      length: 20,
      width: 20,
      height: 20,
      unit: 'in',
    };
    const weight: PackageWeight = { value: 5, unit: 'lbs' };

    const { result } = renderHook(() => useDimensionalWeight(dimensions, weight));

    expect(result.current.isDimensionalWeightApplied).toBe(true);
    expect(result.current.billableWeight).toBe(result.current.dimensionalWeight);
  });

  it('should use actual weight when it is greater than dimensional weight', () => {
    const dimensions: PackageDimensions = {
      length: 5,
      width: 5,
      height: 5,
      unit: 'in',
    };
    const weight: PackageWeight = { value: 50, unit: 'lbs' };

    const { result } = renderHook(() => useDimensionalWeight(dimensions, weight));

    expect(result.current.isDimensionalWeightApplied).toBe(false);
    expect(result.current.billableWeight).toBe(50);
  });

  it('should convert weight to pounds correctly', () => {
    const dimensions: PackageDimensions = {
      length: 10,
      width: 10,
      height: 10,
      unit: 'in',
    };
    const weight: PackageWeight = { value: 2, unit: 'kg' };

    const { result } = renderHook(() => useDimensionalWeight(dimensions, weight));

    // 2 kg * 2.20462 ≈ 4.41 lbs
    expect(result.current.actualWeight).toBeCloseTo(4.41, 1);
  });

  it('should memoize calculations', () => {
    const dimensions: PackageDimensions = {
      length: 10,
      width: 10,
      height: 10,
      unit: 'in',
    };
    const weight: PackageWeight = { value: 5, unit: 'lbs' };

    const { result: result1 } = renderHook(() => useDimensionalWeight(dimensions, weight));
    const { result: result2 } = renderHook(() => useDimensionalWeight(dimensions, weight));

    expect(result1.current.dimensionalWeight).toBe(result2.current.dimensionalWeight);
    expect(result1.current.billableWeight).toBe(result2.current.billableWeight);
  });

  it('should handle zero weight', () => {
    const dimensions: PackageDimensions = {
      length: 10,
      width: 10,
      height: 10,
      unit: 'in',
    };
    const weight: PackageWeight = { value: 0, unit: 'lbs' };

    const { result } = renderHook(() => useDimensionalWeight(dimensions, weight));

    expect(result.current.actualWeight).toBe(0);
    expect(result.current.isDimensionalWeightApplied).toBe(true);
  });

  it('should handle large dimensions', () => {
    const dimensions: PackageDimensions = {
      length: 100,
      width: 50,
      height: 50,
      unit: 'in',
    };
    const weight: PackageWeight = { value: 100, unit: 'lbs' };

    const { result } = renderHook(() => useDimensionalWeight(dimensions, weight));

    const expected = (100 * 50 * 50) / 139; // Approximately 179.86 lbs
    expect(result.current.dimensionalWeight).toBeCloseTo(expected, 1);
  });
});
