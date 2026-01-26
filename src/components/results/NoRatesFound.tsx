'use client';

/**
 * Empty state when no rates are available
 */
export function NoRatesFound() {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">📦</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">No Rates Found</h2>
      <p className="text-gray-600 mb-6">
        We couldn&apos;t find any shipping rates for your request. Please try adjusting your package
        details or destination.
      </p>
      <a
        href="/calculator"
        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Go Back to Calculator
      </a>
    </div>
  );
}
