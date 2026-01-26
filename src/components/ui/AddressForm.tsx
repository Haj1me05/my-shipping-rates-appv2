/**
 * AddressForm Component
 * Complete address input form with validation error display
 */

'use client';

import { Address, ValidationError } from '@/types/domain';
import { FormField } from './FormField';

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
  'DC',
  'PR',
  'VI',
  'GU',
  'AS',
  'MP',
];

const CANADIAN_PROVINCES = [
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NS',
  'NT',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT',
];

export interface AddressFormProps {
  value: Partial<Address>;
  onChange: (address: Partial<Address>) => void;
  validationErrors?: ValidationError[];
  disabled?: boolean;
  showAllFields?: boolean;
  title?: string;
}

/**
 * Accessible address form component with real-time validation
 */
export function AddressForm({
  value,
  onChange,
  validationErrors = [],
  disabled = false,
  showAllFields = true,
  title = 'Address',
}: Readonly<AddressFormProps>) {
  const getErrorForField = (field: string): string | undefined => {
    return validationErrors.find((err) => err.field === field)?.message;
  };

  const getStateOptions = () => {
    if (value.country === 'CA' || value.country === 'CAN') {
      return CANADIAN_PROVINCES;
    }
    return US_STATES;
  };

  const stateLabel = value.country === 'CA' || value.country === 'CAN' ? 'Province' : 'State';

  return (
    <fieldset className="border border-gray-300 rounded-md p-4 mb-4">
      <legend className="text-lg font-semibold mb-4">{title}</legend>

      {showAllFields && (
        <FormField
          label="Full Name"
          htmlFor={`${title}-name`}
          required
          error={getErrorForField('name')}
        >
          <input
            id={`${title}-name`}
            type="text"
            value={value.name || ''}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-required="true"
            aria-invalid={!!getErrorForField('name')}
            aria-describedby={getErrorForField('name') ? `${title}-name-error` : undefined}
          />
        </FormField>
      )}

      <FormField
        label="Street Address"
        htmlFor={`${title}-street1`}
        required
        error={getErrorForField('street1')}
      >
        <input
          id={`${title}-street1`}
          type="text"
          value={value.street1 || ''}
          onChange={(e) => onChange({ ...value, street1: e.target.value })}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-required="true"
          aria-invalid={!!getErrorForField('street1')}
          aria-describedby={getErrorForField('street1') ? `${title}-street1-error` : undefined}
        />
      </FormField>

      <FormField label="Apt, Suite, etc. (Optional)" htmlFor={`${title}-street2`}>
        <input
          id={`${title}-street2`}
          type="text"
          value={value.street2 || ''}
          onChange={(e) => onChange({ ...value, street2: e.target.value })}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </FormField>

      <FormField label="City" htmlFor={`${title}-city`} required error={getErrorForField('city')}>
        <input
          id={`${title}-city`}
          type="text"
          value={value.city || ''}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-required="true"
          aria-invalid={!!getErrorForField('city')}
          aria-describedby={getErrorForField('city') ? `${title}-city-error` : undefined}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label={stateLabel}
          htmlFor={`${title}-state`}
          required
          error={getErrorForField('state')}
        >
          <select
            id={`${title}-state`}
            value={value.state || ''}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-required="true"
            aria-invalid={!!getErrorForField('state')}
            aria-describedby={getErrorForField('state') ? `${title}-state-error` : undefined}
          >
            <option value="">Select {stateLabel}</option>
            {getStateOptions().map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Postal Code"
          htmlFor={`${title}-postalCode`}
          required
          error={getErrorForField('postalCode')}
        >
          <input
            id={`${title}-postalCode`}
            type="text"
            value={value.postalCode || ''}
            onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={value.country === 'CA' || value.country === 'CAN' ? 'A1A 1A1' : '12345'}
            aria-required="true"
            aria-invalid={!!getErrorForField('postalCode')}
            aria-describedby={
              getErrorForField('postalCode') ? `${title}-postalCode-error` : undefined
            }
          />
        </FormField>
      </div>

      <FormField
        label="Country"
        htmlFor={`${title}-country`}
        required
        error={getErrorForField('country')}
      >
        <select
          id={`${title}-country`}
          value={value.country || 'US'}
          onChange={(e) => onChange({ ...value, country: e.target.value })}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-required="true"
          aria-invalid={!!getErrorForField('country')}
          aria-describedby={getErrorForField('country') ? `${title}-country-error` : undefined}
        >
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
        </select>
      </FormField>

      {showAllFields && (
        <FormField label="Phone (Optional)" htmlFor={`${title}-phone`}>
          <input
            id={`${title}-phone`}
            type="tel"
            value={value.phone || ''}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>
      )}
    </fieldset>
  );
}
