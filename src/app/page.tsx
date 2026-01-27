'use client';

import { RateCalculatorForm } from '@/components/forms/RateCalculatorForm';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleSuccess = (requestData: any) => {
    // Encode the request data and navigate to results page
    const encodedRequest = encodeURIComponent(JSON.stringify(requestData));
    router.push(`/results?request=${encodedRequest}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shipping Rate Calculator</h1>
          <p className="text-lg text-gray-700">
            Get competitive rates from multiple carriers in seconds
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-300">
          <RateCalculatorForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
