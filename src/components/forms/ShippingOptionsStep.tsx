/**
 * ShippingOptionsStep Component
 * Step 3: Service speed and additional services
 */

'use client';

import { ShippingOptions } from '@/types/domain';
import { ServiceSpeedSelector } from '@/components/ui/ServiceSpeedSelector';
import { FormField } from '@/components/ui/FormField';

export interface ShippingOptionsStepProps {
  options: Partial<ShippingOptions>;
  onChange: (options: Partial<ShippingOptions>) => void;
  disabled?: boolean;
}

/**
 * Shipping options step with service speed and additional services
 */
export function ShippingOptionsStep({
  options,
  onChange,
  disabled = false,
}: Readonly<ShippingOptionsStepProps>) {
  return (
    <div className="space-y-6">
      <ServiceSpeedSelector
        value={options.speed || 'standard'}
        onChange={(speed) => onChange({ ...options, speed })}
        disabled={disabled}
      />

      <FormField
        label="Additional Services"
        htmlFor="additionalServices"
        description="Select any additional services for your shipment"
      >
        <div className="space-y-3 p-4 bg-gray-50 rounded-md border border-gray-200">
          {/* Signature Required */}
          <label className="flex items-center cursor-pointer p-2 hover:bg-white rounded transition">
            <input
              type="checkbox"
              checked={options.signatureRequired || false}
              onChange={(e) => onChange({ ...options, signatureRequired: e.target.checked })}
              disabled={disabled}
              className="mr-3 w-4 h-4"
              aria-label="Require signature on delivery"
            />
            <div>
              <p className="font-medium text-gray-900">Signature Required</p>
              <p className="text-sm text-gray-600">Recipient must sign for package (+$2.50)</p>
            </div>
          </label>

          {/* Insurance */}
          <label className="flex items-center cursor-pointer p-2 hover:bg-white rounded transition">
            <input
              type="checkbox"
              checked={options.insurance || false}
              onChange={(e) => onChange({ ...options, insurance: e.target.checked })}
              disabled={disabled}
              className="mr-3 w-4 h-4"
              aria-label="Add insurance coverage"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Insurance</p>
              <p className="text-sm text-gray-600">Protect package contents (+$1.00 - $5.00)</p>
            </div>
          </label>

          {/* Insurance Value Input */}
          {options.insurance && (
            <div className="ml-7 pl-2 border-l-2 border-blue-400">
              <FormField label="Insurance Value" htmlFor="insuredValue">
                <div className="flex gap-2">
                  <span className="flex items-center">$</span>
                  <input
                    id="insuredValue"
                    type="number"
                    value={options.insuredValue || ''}
                    onChange={(e) =>
                      onChange({
                        ...options,
                        insuredValue: e.target.value
                          ? Number.parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    disabled={disabled}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </FormField>
            </div>
          )}

          {/* Fragile Handling */}
          <label className="flex items-center cursor-pointer p-2 hover:bg-white rounded transition">
            <input
              type="checkbox"
              checked={options.fragileHandling || false}
              onChange={(e) => onChange({ ...options, fragileHandling: e.target.checked })}
              disabled={disabled}
              className="mr-3 w-4 h-4"
              aria-label="Fragile handling"
            />
            <div>
              <p className="font-medium text-gray-900">Fragile Handling</p>
              <p className="text-sm text-gray-600">Special handling for fragile items (+$3.00)</p>
            </div>
          </label>

          {/* Saturday Delivery */}
          <label className="flex items-center cursor-pointer p-2 hover:bg-white rounded transition">
            <input
              type="checkbox"
              checked={options.saturdayDelivery || false}
              onChange={(e) => onChange({ ...options, saturdayDelivery: e.target.checked })}
              disabled={disabled}
              className="mr-3 w-4 h-4"
              aria-label="Saturday delivery"
            />
            <div>
              <p className="font-medium text-gray-900">Saturday Delivery</p>
              <p className="text-sm text-gray-600">Deliver on Saturday (+$5.00)</p>
            </div>
          </label>
        </div>
      </FormField>
    </div>
  );
}
