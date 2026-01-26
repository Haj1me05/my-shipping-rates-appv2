'use client';

import type { CarrierError } from '@/types/domain';

interface RatesErrorDisplayProps {
  errors: CarrierError[];
}

/**
 * Displays carrier errors and failures
 */
export function RatesErrorDisplay({ errors }: RatesErrorDisplayProps) {
  const recoverableErrors = errors.filter((e) => e.recoverable);
  const fatalErrors = errors.filter((e) => !e.recoverable);

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-red-900">Service Issues</h3>

      {fatalErrors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-red-800">
            <strong>Failed to fetch rates:</strong>
          </p>
          <ul className="space-y-1">
            {fatalErrors.map((error, idx) => (
              <li key={idx} className="text-sm text-red-700">
                <strong>{error.carrier}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recoverableErrors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-yellow-800">
            <strong>Temporary issues (will retry):</strong>
          </p>
          <ul className="space-y-1">
            {recoverableErrors.map((error, idx) => (
              <li key={idx} className="text-sm text-yellow-700">
                <strong>{error.carrier}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
