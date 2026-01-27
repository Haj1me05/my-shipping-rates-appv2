import type { RateRequest, RateResponse } from '@/types/domain';

/**
 * Fetch rates from the API
 * This function is called within Suspense boundaries in React 19
 */
export async function fetchRates(request: RateRequest): Promise<RateResponse> {
  try {
    // Get the base URL from environment or construct from window location
    const baseUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.host}`
        : process.env.NEXT_PUBLIC_API_URL || '';

    const apiUrl = `${baseUrl}/api/rates`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data: RateResponse = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch rates: ${message}`);
  }
}

/**
 * Create a promise that can be used with React 19's use() hook
 */
export function createRatesPromise(request: RateRequest): Promise<RateResponse> {
  return fetchRates(request);
}
