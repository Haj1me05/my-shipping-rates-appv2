'use client';

import { memo } from 'react';
import type { Fee } from '@/types/domain';

interface FeeBreakdownProps {
  baseRate: number;
  additionalFees: Fee[];
}

/**
 * Displays base rate and additional fees breakdown
 */
export const FeeBreakdown = memo(function FeeBreakdown({
  baseRate,
  additionalFees,
}: FeeBreakdownProps) {
  const totalFees = additionalFees.reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div className="mt-2 pt-2 border-t border-gray-200 text-xs space-y-1">
      <div className="flex justify-between text-gray-600">
        <span>Base Rate:</span>
        <span>${baseRate.toFixed(2)}</span>
      </div>
      {additionalFees.map((fee, idx) => (
        <div key={idx} className="flex justify-between text-gray-600">
          <span>{fee.description}:</span>
          <span>+${fee.amount.toFixed(2)}</span>
        </div>
      ))}
      <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
        <span>Total:</span>
        <span>${(baseRate + totalFees).toFixed(2)}</span>
      </div>
    </div>
  );
});
