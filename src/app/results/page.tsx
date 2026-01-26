'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { RatesDisplay } from '@/components/results/RatesDisplay';
import { ResultsSkeletonLoader } from '@/components/results/ResultsSkeletonLoader';
import { createRatesPromise } from '@/lib/rates-api';
import type { RateRequest } from '@/types/domain';

/**
 * Results page with Suspense boundary for React 19
 */
export default function ResultsPage() {
  const searchParams = useSearchParams();

  // Create promise at page level (outside Suspense boundary)
  const ratesPromise = useMemo(() => {
    try {
      // Parse request from search params
      const requestData = searchParams.get('request');
      if (!requestData) {
        throw new Error('No rate request found');
      }

      const request: RateRequest = JSON.parse(decodeURIComponent(requestData));

      return createRatesPromise(request);
    } catch (error) {
      return Promise.reject(error);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Rate Comparison</h1>

        {/* Suspense boundary with fallback loader */}
        <Suspense fallback={<ResultsSkeletonLoader />}>
          <RatesDisplay ratesPromise={ratesPromise} />
        </Suspense>
      </div>
    </div>
  );
}
