'use client';

/**
 * Animated skeleton loader for results
 */
export function ResultsSkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary skeleton */}
      <div className="h-4 w-48 bg-gray-200 rounded"></div>

      {/* Filters skeleton */}
      <div className="grid grid-cols-3 gap-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>

      {/* Table skeleton */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {/* Header */}
          <div className="grid grid-cols-4 bg-gray-100 p-4">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
          {/* Rows */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 p-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-100 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
