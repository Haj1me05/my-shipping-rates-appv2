/**
 * WeightInput Component
 * Weight input with unit selector (lbs/kg)
 */

'use client';

import { FormField } from './FormField';
import { ValidationError } from '@/types/domain';

export interface WeightInputProps {
  value: number;
  unit: 'lbs' | 'kg';
  onChange: (weight: { value: number; unit: 'lbs' | 'kg' }) => void;
  errors?: ValidationError[];
  disabled?: boolean;
  showDimensionalWeight?: {
    actual: number;
    dimensional: number;
    billable: number;
    isDimensionalApplied: boolean;
  };
}

/**
 * Accessible weight input with unit selector
 */
export function WeightInput({
  value,
  unit,
  onChange,
  errors = [],
  disabled = false,
  showDimensionalWeight,
}: Readonly<WeightInputProps>) {
  const getErrorForField = (field: string): string | undefined => {
    return errors.find((err) => err.field === field)?.message;
  };

  return (
    <FormField
      label="Package Weight"
      htmlFor="weight-value"
      required
      error={getErrorForField('weight')}
      description="Enter the actual weight of your package"
    >
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            id="weight-value"
            type="number"
            value={value}
            onChange={(e) => onChange({ value: Number.parseFloat(e.target.value) || 0, unit })}
            disabled={disabled}
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-required="true"
            aria-invalid={!!getErrorForField('weight')}
            aria-describedby={getErrorForField('weight') ? 'weight-error' : undefined}
          />
        </div>

        <div className="flex gap-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="weightUnit"
              value="lbs"
              checked={unit === 'lbs'}
              onChange={(e) => onChange({ value, unit: e.target.value as 'lbs' | 'kg' })}
              disabled={disabled}
              className="mr-2"
              aria-label="Weight in pounds"
            />
            <span>lbs</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="weightUnit"
              value="kg"
              checked={unit === 'kg'}
              onChange={(e) => onChange({ value, unit: e.target.value as 'lbs' | 'kg' })}
              disabled={disabled}
              className="mr-2"
              aria-label="Weight in kilograms"
            />
            <span>kg</span>
          </label>
        </div>
      </div>

      {showDimensionalWeight && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
          <p className="font-medium text-blue-900">Weight Calculation</p>
          <p className="text-blue-800">Actual: {showDimensionalWeight.actual.toFixed(2)} lbs</p>
          <p className="text-blue-800">
            Dimensional: {showDimensionalWeight.dimensional.toFixed(2)} lbs
          </p>
          <p className="font-medium text-blue-900 mt-1">
            Billable: {showDimensionalWeight.billable.toFixed(2)} lbs
            {showDimensionalWeight.isDimensionalApplied && (
              <span className="text-blue-600 ml-2">(dimensional weight applied)</span>
            )}
          </p>
        </div>
      )}
    </FormField>
  );
}
