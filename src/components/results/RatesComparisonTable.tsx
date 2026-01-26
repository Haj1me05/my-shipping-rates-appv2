'use client';

import { useState, useMemo, useCallback } from 'react';
import { BestValueBadge } from './BestValueBadge';
import { SortIcon } from './SortIcon';
import { CarrierLogo } from './CarrierLogo';
import { FeeBreakdown } from './FeeBreakdown';
import { FeaturesList } from './FeaturesList';
import type { ShippingRate, CarrierName, ServiceSpeed } from '@/types/domain';

interface RatesComparisonTableProps {
  rates: ShippingRate[];
  selectedCarriers?: CarrierName[];
  selectedSpeeds?: ServiceSpeed[];
  sortBy?: 'price' | 'speed' | 'carrier';
}

/**
 * Desktop-optimized comparison table with sorting and filtering
 */
export function RatesComparisonTable({
  rates,
  selectedCarriers = [],
  selectedSpeeds = [],
  sortBy = 'price',
}: RatesComparisonTableProps) {
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedFees, setExpandedFees] = useState<Set<string>>(new Set());

  // Memoized filtered and sorted rates
  const displayedRates = useMemo(() => {
    let filtered = [...rates];

    // Apply carrier filter
    if (selectedCarriers.length > 0) {
      filtered = filtered.filter((r) => selectedCarriers.includes(r.carrier as any));
    }

    // Apply speed filter
    if (selectedSpeeds.length > 0) {
      filtered = filtered.filter((r) => selectedSpeeds.includes(r.speed));
    }

    // Apply sorting
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'price') {
        comparison = a.totalCost - b.totalCost;
      } else if (sortBy === 'speed') {
        const dateA = new Date(a.estimatedDeliveryDate).getTime();
        const dateB = new Date(b.estimatedDeliveryDate).getTime();
        comparison = dateA - dateB;
      } else if (sortBy === 'carrier') {
        comparison = a.carrier.localeCompare(b.carrier);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [rates, selectedCarriers, selectedSpeeds, sortBy, sortDirection]);

  // Memoized best value calculations
  const bestValues = useMemo(() => {
    if (displayedRates.length === 0) {
      return { cheapest: null, fastest: null, bestValue: null };
    }

    const cheapest = displayedRates.reduce((min, r) => (r.totalCost < min.totalCost ? r : min));

    const fastest = displayedRates.reduce((min, r) => {
      const minDate = new Date(min.estimatedDeliveryDate).getTime();
      const rDate = new Date(r.estimatedDeliveryDate).getTime();
      return rDate < minDate ? r : min;
    });

    // Calculate business days and value score
    const today = new Date();
    const bestValueRate = displayedRates.reduce((best, r) => {
      const deliveryDate = new Date(r.estimatedDeliveryDate);
      const businessDays = Math.ceil(
        (deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      const score = r.totalCost + businessDays * 2;

      const bestDeliveryDate = new Date(best.estimatedDeliveryDate);
      const bestBusinessDays = Math.ceil(
        (bestDeliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      const bestScore = best.totalCost + bestBusinessDays * 2;

      return score < bestScore ? r : best;
    });

    return {
      cheapest: cheapest.id,
      fastest: fastest.id,
      bestValue: bestValueRate.id,
    };
  }, [displayedRates]);

  // Handle fee breakdown toggle
  const toggleFeeExpansion = useCallback((rateId: string) => {
    setExpandedFees((prev) => {
      const next = new Set(prev);
      if (next.has(rateId)) {
        next.delete(rateId);
      } else {
        next.add(rateId);
      }
      return next;
    });
  }, []);

  const handleSort = useCallback(
    (field: 'price' | 'speed' | 'carrier') => {
      if (sortBy === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortDirection('asc');
      }
    },
    [sortBy]
  );

  const calculateBusinessDays = (date: Date) => {
    const today = new Date();
    const days = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Carrier</th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center gap-2">
                Price
                {sortBy === 'price' && <SortIcon direction={sortDirection} />}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('speed')}
            >
              <div className="flex items-center gap-2">
                Delivery
                {sortBy === 'speed' && <SortIcon direction={sortDirection} />}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Features</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {displayedRates.map((rate) => {
            const deliveryDate = new Date(rate.estimatedDeliveryDate);
            const businessDays = calculateBusinessDays(deliveryDate);
            const isExpanded = expandedFees.has(rate.id);

            return (
              <tr key={rate.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <CarrierLogo carrier={rate.carrier} />
                    <div>
                      <p className="font-semibold text-gray-900">{rate.carrier}</p>
                      <p className="text-sm text-gray-600">{rate.serviceName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      ${rate.totalCost.toFixed(2)}
                    </span>
                    {bestValues.cheapest === rate.id && <BestValueBadge type="price" />}
                  </div>
                  {rate.additionalFees.length > 0 && (
                    <button
                      onClick={() => toggleFeeExpansion(rate.id)}
                      className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                    >
                      {isExpanded ? 'Hide' : 'Show'} fee breakdown
                    </button>
                  )}
                  {isExpanded && (
                    <FeeBreakdown baseRate={rate.baseRate} additionalFees={rate.additionalFees} />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">
                      {deliveryDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{businessDays} business days</p>
                    {bestValues.fastest === rate.id && <BestValueBadge type="speed" />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <FeaturesList features={rate.features} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
