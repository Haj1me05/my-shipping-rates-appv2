/**
 * ReviewStep Component
 * Step 4: Summary of all inputs with edit buttons
 */

'use client';

import { Package, Address, ShippingOptions } from '@/types/domain';

export interface ReviewStepProps {
  package: Partial<Package>;
  originAddress: Partial<Address>;
  destinationAddress: Partial<Address>;
  shippingOptions: Partial<ShippingOptions>;
  onEdit: (step: number) => void;
  disabled?: boolean;
}

const SERVICE_SPEED_LABELS: Record<string, string> = {
  overnight: 'Overnight',
  'two-day': '2-Day',
  standard: 'Standard',
  economy: 'Economy',
};

/**
 * Review step showing summary of all form inputs with edit capability
 */
export function ReviewStep({
  package: pkg,
  originAddress,
  destinationAddress,
  shippingOptions,
  onEdit,
  disabled = false,
}: Readonly<ReviewStepProps>) {
  return (
    <div className="space-y-6">
      {/* Package Summary */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Package Details</h3>
          <button
            onClick={() => onEdit(1)}
            disabled={disabled}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
            aria-label="Edit package details"
          >
            Edit
          </button>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Type:</dt>
            <dd className="font-medium">{pkg.type?.toUpperCase()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Dimensions:</dt>
            <dd className="font-medium">
              {pkg.dimensions?.length} × {pkg.dimensions?.width} × {pkg.dimensions?.height}{' '}
              {pkg.dimensions?.unit}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Weight:</dt>
            <dd className="font-medium">
              {pkg.weight?.value} {pkg.weight?.unit}
            </dd>
          </div>
          {pkg.declaredValue && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Declared Value:</dt>
              <dd className="font-medium">${pkg.declaredValue.toFixed(2)}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Origin Address Summary */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">From</h3>
          <button
            onClick={() => onEdit(2)}
            disabled={disabled}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
            aria-label="Edit origin address"
          >
            Edit
          </button>
        </div>
        <address className="text-sm not-italic space-y-1">
          <p className="font-medium">{originAddress.name}</p>
          <p>{originAddress.street1}</p>
          {originAddress.street2 && <p>{originAddress.street2}</p>}
          <p>
            {originAddress.city}, {originAddress.state} {originAddress.postalCode}
          </p>
          <p>{originAddress.country}</p>
          {originAddress.phone && <p>{originAddress.phone}</p>}
        </address>
      </div>

      {/* Destination Address Summary */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">To</h3>
          <button
            onClick={() => onEdit(2)}
            disabled={disabled}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
            aria-label="Edit destination address"
          >
            Edit
          </button>
        </div>
        <address className="text-sm not-italic space-y-1">
          <p className="font-medium">{destinationAddress.name}</p>
          <p>{destinationAddress.street1}</p>
          {destinationAddress.street2 && <p>{destinationAddress.street2}</p>}
          <p>
            {destinationAddress.city}, {destinationAddress.state} {destinationAddress.postalCode}
          </p>
          <p>{destinationAddress.country}</p>
          {destinationAddress.phone && <p>{destinationAddress.phone}</p>}
        </address>
      </div>

      {/* Shipping Options Summary */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Shipping Options</h3>
          <button
            onClick={() => onEdit(3)}
            disabled={disabled}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
            aria-label="Edit shipping options"
          >
            Edit
          </button>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Service Speed:</dt>
            <dd className="font-medium">
              {SERVICE_SPEED_LABELS[shippingOptions.speed || 'standard']}
            </dd>
          </div>

          {shippingOptions.signatureRequired && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Signature Required:</dt>
              <dd className="font-medium text-green-600">✓ Yes</dd>
            </div>
          )}

          {shippingOptions.insurance && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Insurance:</dt>
              <dd className="font-medium text-green-600">
                ✓ ${shippingOptions.insuredValue?.toFixed(2) || '0.00'}
              </dd>
            </div>
          )}

          {shippingOptions.fragileHandling && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Fragile Handling:</dt>
              <dd className="font-medium text-green-600">✓ Yes</dd>
            </div>
          )}

          {shippingOptions.saturdayDelivery && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Saturday Delivery:</dt>
              <dd className="font-medium text-green-600">✓ Yes</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          ✓ Review all details above carefully. Click &quot;Calculate Rates&quot; to see available
          shipping options and pricing.
        </p>
      </div>
    </div>
  );
}
