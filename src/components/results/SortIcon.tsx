'use client';

import { memo } from 'react';

interface SortIconProps {
  direction: 'asc' | 'desc';
}

/**
 * Displays sort direction indicator
 */
export const SortIcon = memo(function SortIcon({ direction }: SortIconProps) {
  return <span className="inline-block ml-2 text-sm">{direction === 'asc' ? '↑' : '↓'}</span>;
});
