'use client';

import { memo } from 'react';

interface FeaturesListProps {
  features: string[];
}

/**
 * Displays rate features as chips
 */
export const FeaturesList = memo(function FeaturesList({ features }: FeaturesListProps) {
  if (!features || features.length === 0) {
    return <p className="text-gray-400 text-sm">No features</p>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {features.map((feature, idx) => (
        <span
          key={idx}
          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
        >
          {feature}
        </span>
      ))}
    </div>
  );
});
