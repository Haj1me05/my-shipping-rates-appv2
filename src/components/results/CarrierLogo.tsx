'use client';

import { memo } from 'react';

interface CarrierLogoProps {
  carrier: string;
  className?: string;
}

/**
 * Displays carrier logo
 */
export const CarrierLogo = memo(function CarrierLogo({
  carrier,
  className = 'w-10 h-10',
}: CarrierLogoProps) {
  // Simple colored circle with carrier initial
  const getColor = (name: string) => {
    const colors: Record<string, string> = {
      USPS: 'bg-blue-600',
      FedEx: 'bg-purple-600',
      UPS: 'bg-yellow-600',
      DHL: 'bg-red-600',
    };
    return colors[name] || 'bg-gray-600';
  };

  const initial = carrier.charAt(0);

  return (
    <div
      className={`${getColor(carrier)} rounded-lg flex items-center justify-center text-white font-bold ${className}`}
    >
      {initial}
    </div>
  );
});
