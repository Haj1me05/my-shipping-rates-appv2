'use client';

import { use, useState, useMemo, useCallback, useEffect } from 'react';
import { RatesComparisonTable } from './RatesComparisonTable';
import { RateCard } from './RateCard';
import { RatesFilters } from './RatesFilters';
import { RatesErrorDisplay } from './RatesErrorDisplay';
import { NoRatesFound } from './NoRatesFound';
import type { RateResponse, ServiceSpeed } from '@/types/domain';

interface RatesDisplayProps {
  readonly ratesPromise: Promise<RateResponse>;
  readonly selectedSpeed?: ServiceSpeed;
}

/**
 * Main display component that uses React 19's use() hook
 * Consumes the promise and conditionally renders results
 */
export function RatesDisplay({ ratesPromise, selectedSpeed }: RatesDisplayProps) {
  const rawData = use(ratesPromise);

  // Convert ISO string dates back to Date objects
  const data = useMemo(
    () => ({
      ...rawData,
      rates: rawData.rates.map((rate) => ({
        ...rate,
        estimatedDeliveryDate:
          typeof rate.estimatedDeliveryDate === 'string'
            ? new Date(rate.estimatedDeliveryDate)
            : rate.estimatedDeliveryDate,
      })),
    }),
    [rawData]
  );

  const [isMobile, setIsMobile] = useState(false);
  const [selectedSpeeds, setSelectedSpeeds] = useState<ServiceSpeed[]>(
    selectedSpeed ? [selectedSpeed] : []
  );
  const [sortBy, setSortBy] = useState<'price' | 'speed' | 'carrier'>('price');

  // Detect mobile viewport
  useEffect(() => {
    if (globalThis.window) {
      const handleResize = () => setIsMobile(globalThis.window.innerWidth < 768);
      handleResize();
      globalThis.window.addEventListener('resize', handleResize);
      return () => globalThis.window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Save results to localStorage after successful fetch
  useMemo(() => {
    if (data.rates.length > 0) {
      // Results are automatically saved via API response
      // The original request is stored in ResultsContent cache
    }
  }, [data]);

  // Handle speed filter change
  const handleSpeedToggle = useCallback((speed: ServiceSpeed) => {
    setSelectedSpeeds((prev) =>
      prev.includes(speed) ? prev.filter((s) => s !== speed) : [...prev, speed]
    );
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((field: 'price' | 'speed' | 'carrier') => {
    setSortBy(field);
  }, []);

  // Show error message if carriers had failures
  if (data.errors && data.errors.length > 0 && data.rates.length === 0) {
    return <RatesErrorDisplay errors={data.errors} />;
  }

  // Show empty state if no rates
  if (!data.rates || data.rates.length === 0) {
    return (
      <>
        {data.errors && <RatesErrorDisplay errors={data.errors} />}
        <NoRatesFound />
      </>
    );
  }

  // Generate plural suffix for rates
  const rateLabel = data.rates.length === 1 ? 'rate' : 'rates';

  // Results summary
  const summaryText = `Showing ${data.rates.length} ${rateLabel} from all carriers`;

  return (
    <div className="space-y-6">
      {/* Errors from partial failures */}
      {data.errors && data.errors.length > 0 && <RatesErrorDisplay errors={data.errors} />}

      {/* Summary text */}
      <div className="text-sm text-gray-600">
        <p>{summaryText}</p>
        <p className="text-xs mt-1">
          Request ID: <code className="bg-gray-100 px-2 py-1 rounded">{data.requestId}</code>
        </p>
      </div>

      {/* Filters and sorting */}
      <RatesFilters
        rates={data.rates}
        onSpeedToggle={handleSpeedToggle}
        onSortChange={handleSortChange}
        selectedSpeeds={selectedSpeeds}
        sortBy={sortBy}
      />

      {/* Desktop table view */}
      {!isMobile && (
        <div className="hidden md:block">
          <RatesComparisonTable
            rates={data.rates}
            selectedSpeeds={selectedSpeeds}
            sortBy={sortBy}
          />
        </div>
      )}

      {/* Mobile card view */}
      {isMobile && (
        <div className="md:hidden space-y-4">
          {data.rates.map((rate) => (
            <RateCard key={rate.id} rate={rate} />
          ))}
        </div>
      )}
    </div>
  );
}
