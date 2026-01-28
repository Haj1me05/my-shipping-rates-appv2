'use client';

import { useCallback, useMemo } from 'react';
import type { ShippingRate, ServiceSpeed } from '@/types/domain';

interface RatesFiltersProps {
  rates: ShippingRate[];
  onSpeedToggle: (speed: ServiceSpeed) => void;
  onSortChange: (field: 'price' | 'speed' | 'carrier') => void;
  selectedSpeeds: ServiceSpeed[];
  sortBy: 'price' | 'speed' | 'carrier';
}

/**
 * Filtering and sorting controls
 */
export function RatesFilters({
  rates,
  onSpeedToggle,
  onSortChange,
  selectedSpeeds,
  sortBy,
}: RatesFiltersProps) {
  // Get unique speeds from rates
  const uniqueSpeeds = useMemo(() => {
    return Array.from(new Set(rates.map((r) => r.speed as ServiceSpeed)));
  }, [rates]);

  const handleSpeedChange = useCallback(
    (speed: ServiceSpeed) => {
      onSpeedToggle(speed);
    },
    [onSpeedToggle]
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSortChange(e.target.value as 'price' | 'speed' | 'carrier');
    },
    [onSortChange]
  );

  return (
    <div className="bg-gray-100 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Speed Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Delivery Speed</label>
          <div className="space-y-2">
            {uniqueSpeeds.map((speed) => (
              <label key={speed} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSpeeds.includes(speed)}
                  onChange={() => handleSpeedChange(speed)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700 capitalize">{speed}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="sort" className="block text-sm font-semibold text-gray-900 mb-3">
            Sort By
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={handleSortChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="price">Lowest Price</option>
            <option value="speed">Fastest Delivery</option>
            <option value="carrier">Carrier Name</option>
          </select>
        </div>
      </div>
    </div>
  );
}
