import type { RateRequest, RateResponse } from '@/types/domain';

const STORAGE_KEY = 'shipping-rate-results';
const TTL_MS = 1000 * 60 * 30; // 30 minutes

/**
 * Stored results with timestamp for expiration
 */
export interface StoredResults {
  response: RateResponse;
  request: RateRequest;
  timestamp: number;
}

/**
 * Save rate calculation results to localStorage
 */
export function saveResults(request: RateRequest, response: RateResponse): void {
  try {
    const stored: StoredResults = {
      response,
      request,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    // Silently fail if localStorage unavailable
    console.warn('Failed to save results to localStorage', error);
  }
}

/**
 * Load cached rate results from localStorage
 * Returns null if not found or expired
 */
export function loadResults(): StoredResults | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data: StoredResults = JSON.parse(stored);

    // Check if expired
    const isExpired = Date.now() - data.timestamp > TTL_MS;
    if (isExpired) {
      clearResults();
      return null;
    }

    return data;
  } catch (error) {
    // Silently fail if JSON parse fails
    console.warn('Failed to load results from localStorage', error);
    return null;
  }
}

/**
 * Clear stored results from localStorage
 */
export function clearResults(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear results from localStorage', error);
  }
}

/**
 * Check if valid cached results exist
 */
export function hasValidResults(): boolean {
  return loadResults() !== null;
}
