/**
 * useDimensionalWeight Hook
 * Calculates billable weight based on dimensions and actual weight
 */

'use client';

import { useMemo } from 'react';
import { PackageDimensions, PackageWeight } from '@/types/domain';

export interface UseDimensionalWeightReturn {
  actualWeight: number;
  dimensionalWeight: number;
  billableWeight: number;
  isDimensionalWeightApplied: boolean;
  weightInPounds: number;
}

/**
 * Custom hook for calculating dimensional and billable weight
 * Memoizes calculations to prevent unnecessary recalculations
 */
export function useDimensionalWeight(
  dimensions: PackageDimensions,
  weight: PackageWeight
): UseDimensionalWeightReturn {
  const result = useMemo(() => {
    // Convert actual weight to pounds if necessary
    const actualWeightInPounds = weight.unit === 'lbs' ? weight.value : weight.value * 2.20462;

    // Calculate dimensional weight
    let dimensionalWeightInPounds: number;

    if (dimensions.unit === 'in') {
      // Formula for inches: (L × W × H) / 139
      dimensionalWeightInPounds = (dimensions.length * dimensions.width * dimensions.height) / 139;
    } else {
      // Formula for cm: (L × W × H) / 5000, then convert to lbs
      const volumeInCubicCm = dimensions.length * dimensions.width * dimensions.height;
      dimensionalWeightInPounds = (volumeInCubicCm / 5000) * 2.20462;
    }

    // Billable weight is the greater of actual or dimensional weight
    const billableWeight = Math.max(actualWeightInPounds, dimensionalWeightInPounds);
    const isDimensionalWeightApplied = dimensionalWeightInPounds > actualWeightInPounds;

    return {
      actualWeight: actualWeightInPounds,
      dimensionalWeight: dimensionalWeightInPounds,
      billableWeight,
      isDimensionalWeightApplied,
      weightInPounds: actualWeightInPounds,
    };
  }, [dimensions, weight]);

  return result;
}
