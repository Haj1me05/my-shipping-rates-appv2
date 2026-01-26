/**
 * ServiceSpeedSelector Component
 * Radio group for service speed selection
 */

'use client';

import { ServiceSpeed } from '@/types/domain';
import { FormField } from './FormField';

const SERVICE_SPEEDS: { value: ServiceSpeed; label: string; description: string }[] = [
  {
    value: 'overnight',
    label: 'Overnight',
    description: 'Next business day delivery',
  },
  {
    value: 'two-day',
    label: '2-Day',
    description: 'Delivery within 2 business days',
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'Delivery within 3-5 business days',
  },
  {
    value: 'economy',
    label: 'Economy',
    description: 'Economical delivery within 5-7 business days',
  },
];

export interface ServiceSpeedSelectorProps {
  value: ServiceSpeed;
  onChange: (speed: ServiceSpeed) => void;
  disabled?: boolean;
}

/**
 * Accessible service speed selector with radio buttons
 */
export function ServiceSpeedSelector({
  value,
  onChange,
  disabled = false,
}: Readonly<ServiceSpeedSelectorProps>) {
  return (
    <FormField
      label="Shipping Speed"
      htmlFor="service-speed"
      required
      description="Select your preferred delivery speed"
    >
      <fieldset className="border-l-4 border-blue-500 pl-4 py-2">
        <legend className="sr-only">Service Speed Options</legend>
        <div className="space-y-3">
          {SERVICE_SPEEDS.map((speed) => (
            <label
              key={speed.value}
              className="flex items-start cursor-pointer p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition"
            >
              <input
                type="radio"
                name="serviceSpeed"
                value={speed.value}
                checked={value === speed.value}
                onChange={(e) => onChange(e.target.value as ServiceSpeed)}
                disabled={disabled}
                className="mt-1 mr-3"
                aria-label={speed.label}
              />
              <div>
                <p className="font-medium text-gray-900">{speed.label}</p>
                <p className="text-sm text-gray-600">{speed.description}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>
    </FormField>
  );
}
