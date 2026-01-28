import { Suspense } from 'react';
import { ResultsSkeletonLoader } from '@/components/results/ResultsSkeletonLoader';
import { ResultsContent } from '@/components/results/ResultsContent';

/**
 * Results page with Suspense boundary for useSearchParams()
 * useSearchParams() is wrapped in a separate client component within Suspense
 */
export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Rate Comparison</h1>

        {/* Suspense boundary with fallback loader - required for useSearchParams() */}
        <Suspense fallback={<ResultsSkeletonLoader />}>
          <ResultsContent />
        </Suspense>
      </div>
    </div>
  );
}
