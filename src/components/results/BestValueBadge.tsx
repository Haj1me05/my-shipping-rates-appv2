'use client';

import { memo } from 'react';

interface BestValueBadgeProps {
  type: 'price' | 'speed' | 'value';
}

/**
 * Visual badge for best value rates
 */
export const BestValueBadge = memo(function BestValueBadge({ type }: BestValueBadgeProps) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    price: { bg: 'bg-green-100', text: 'text-green-800', label: 'Cheapest' },
    speed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Fastest' },
    value: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Best Value' },
  };

  const style = styles[type];

  return (
    <span
      className={`inline-block ${style.bg} ${style.text} text-xs font-semibold px-2 py-1 rounded`}
    >
      ⭐ {style.label}
    </span>
  );
});
