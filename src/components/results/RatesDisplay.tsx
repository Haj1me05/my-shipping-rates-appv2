'use client';

import { use, useState, useMemo, useCallback } from 'react';
import { RatesComparisonTable } from './RatesComparisonTable';
import { RateCard } from './RateCard';
import { RatesFilters } from './RatesFilters';
import { RatesErrorDisplay } from './RatesErrorDisplay';
import { NoRatesFound } from './NoRatesFound';
import { saveResults } from '@/lib/results-storage';
import type { RateResponse, CarrierName, ServiceSpeed } from '@/types/domain';

interface RatesDisplayProps {
  ratesPromise: Promise<RateResponse>;
}

/**
 * Main display component that uses React 19's use() hook
 * Consumes the promise and conditionally renders results
 */
export function RatesDisplay({ ratesPromise }: RatesDisplayProps) {
  const rawData = use(ratesPromise);

  // Convert ISO string dates back to Date objects
  const data = {
    ...rawData,
    rates: rawData.rates.map((rate) => ({
      ...rate,
      estimatedDeliveryDate:
        typeof rate.estimatedDeliveryDate === 'string'
          ? new Date(rate.estimatedDeliveryDate)
          : rate.estimatedDeliveryDate,
    })),
  };

  const [isMobile, setIsMobile] = useState(false);
  const [selectedCarriers, setSelectedCarriers] = useState<CarrierName[]>([]);
  const [selectedSpeeds, setSelectedSpeeds] = useState<ServiceSpeed[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'speed' | 'carrier'>('price');

  // Detect mobile viewport
  useMemo(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Save results to localStorage after successful fetch
  useMemo(() => {
    if (data.rates.length > 0) {
      saveResults(data.rates[0].id as any, data);
    }
  }, [data]);

  // Handle carrier filter change
  const handleCarrierToggle = useCallback((carrier: CarrierName) => {
    setSelectedCarriers((prev) =>
      prev.includes(carrier) ? prev.filter((c) => c !== carrier) : [...prev, carrier]
    );
  }, []);

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

  // Results summary
  const summaryText =
    selectedCarriers.length > 0
      ? `Showing ${data.rates.length} rate${data.rates.length !== 1 ? 's' : ''} from ${selectedCarriers.join(', ')}`
      : `Showing ${data.rates.length} rate${data.rates.length !== 1 ? 's' : ''} from all carriers`;

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
        onCarrierToggle={handleCarrierToggle}
        onSpeedToggle={handleSpeedToggle}
        onSortChange={handleSortChange}
        selectedCarriers={selectedCarriers}
        selectedSpeeds={selectedSpeeds}
        sortBy={sortBy}
      />

      {/* Desktop table view */}
      {!isMobile && (
        <div className="hidden md:block">
          <RatesComparisonTable
            rates={data.rates}
            selectedCarriers={selectedCarriers}
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
