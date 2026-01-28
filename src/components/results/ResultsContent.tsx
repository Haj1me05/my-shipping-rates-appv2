'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { RatesDisplay } from './RatesDisplay';
import { createRatesPromise } from '@/lib/rates-api';
import type { RateRequest, RateResponse } from '@/types/domain';

// Global promise cache - keyed by request string to ensure same request returns same promise
const promiseCache = new Map<string, { promise: Promise<RateResponse>; request: RateRequest }>();

/**
 * Results content component that uses useSearchParams
 * This is wrapped in a Suspense boundary by the parent page
 */
export function ResultsContent() {
  const searchParams = useSearchParams();
  const requestString = searchParams.get('request') || '';

  // Parse and memoize the request data
  const { ratesPromise, selectedSpeed } = useMemo(() => {
    if (!requestString) {
      throw new Error('No rate request found');
    }

    // Check if we already have a cached promise for this request string
    if (promiseCache.has(requestString)) {
      const cached = promiseCache.get(requestString)!;
      return {
        ratesPromise: cached.promise,
        selectedSpeed: cached.request.options?.speed,
      };
    }

    // Parse the request and create new promise
    try {
      const parsedRequest: RateRequest = JSON.parse(decodeURIComponent(requestString));
      const promise = createRatesPromise(parsedRequest);

      // Cache it for future renders
      promiseCache.set(requestString, { promise, request: parsedRequest });

      return {
        ratesPromise: promise,
        selectedSpeed: parsedRequest.options?.speed,
      };
    } catch (error) {
      console.error('Failed to parse request:', error);
      throw new Error('Invalid rate request format');
    }
  }, [requestString]);

  return <RatesDisplay ratesPromise={ratesPromise} selectedSpeed={selectedSpeed} />;
}
