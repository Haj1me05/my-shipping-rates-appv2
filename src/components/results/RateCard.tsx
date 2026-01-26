'use client';

import { useState, memo } from 'react';
import { FeeBreakdown } from './FeeBreakdown';
import { FeaturesList } from './FeaturesList';
import { CarrierLogo } from './CarrierLogo';
import { BestValueBadge } from './BestValueBadge';
import type { ShippingRate } from '@/types/domain';

interface RateCardProps {
  rate: ShippingRate;
  isBestValue?: boolean;
}

/**
 * Mobile-friendly card view for individual rates
 */
const RateCardComponent = ({ rate, isBestValue = false }: RateCardProps) => {
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);

  const deliveryDate = new Date(rate.estimatedDeliveryDate);
  const today = new Date();
  const businessDays = Math.ceil(
    (deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white border-2 border-transparent hover:border-blue-400 rounded-lg shadow p-6 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <CarrierLogo carrier={rate.carrier} className="w-12 h-12" />
          <div>
            <h3 className="font-bold text-lg text-gray-900">{rate.carrier}</h3>
            <p className="text-sm text-gray-600">{rate.serviceName}</p>
          </div>
        </div>
        {isBestValue && <BestValueBadge type="value" />}
      </div>

      {/* Cost and Delivery Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-600 mb-1">Total Cost</p>
          <p className="text-2xl font-bold text-green-600">${rate.totalCost.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Delivery</p>
          <p className="text-lg font-semibold text-gray-900">
            {deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          <p className="text-xs text-gray-600">{businessDays} business days</p>
        </div>
      </div>

      {/* Features */}
      <div className="mb-4">
        <p className="text-xs text-gray-600 mb-2">Features</p>
        <FeaturesList features={rate.features} />
      </div>

      {/* Fee Breakdown Toggle */}
      {rate.additionalFees.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showFeeBreakdown ? '▼' : '▶'} {showFeeBreakdown ? 'Hide' : 'Show'} fee breakdown
          </button>
          {showFeeBreakdown && (
            <FeeBreakdown baseRate={rate.baseRate} additionalFees={rate.additionalFees} />
          )}
        </div>
      )}

      {/* Action Button */}
      <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors">
        Select This Rate
      </button>
    </div>
  );
};

export const RateCard = memo(RateCardComponent, (prevProps, nextProps) => {
  return prevProps.rate.id === nextProps.rate.id && prevProps.isBestValue === nextProps.isBestValue;
});
