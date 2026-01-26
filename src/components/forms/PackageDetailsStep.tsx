/**
 * PackageDetailsStep Component
 * Step 1: Package type, dimensions, weight, and declared value
 */

'use client';

import { Package, PackageType, ValidationError } from '@/types/domain';
import { DimensionsInput } from '@/components/ui/DimensionsInput';
import { WeightInput } from '@/components/ui/WeightInput';
import { FormField } from '@/components/ui/FormField';
import { useDimensionalWeight } from '@/hooks/useDimensionalWeight';

export interface PackageDetailsStepProps {
  package: Partial<Package>;
  onChange: (pkg: Partial<Package>) => void;
  errors?: ValidationError[];
  disabled?: boolean;
}

const PACKAGE_TYPES = [
  { value: 'envelope', label: 'Envelope' },
  { value: 'box', label: 'Box' },
  { value: 'tube', label: 'Tube' },
  { value: 'custom', label: 'Custom' },
];

/**
 * Package details form step component
 */
export function PackageDetailsStep({
  package: pkg,
  onChange,
  errors = [],
  disabled = false,
}: Readonly<PackageDetailsStepProps>) {
  const weightData = useDimensionalWeight(
    pkg.dimensions || { length: 0, width: 0, height: 0, unit: 'in' },
    pkg.weight || { value: 0, unit: 'lbs' }
  );

  const getErrorForField = (field: string): string | undefined => {
    return errors.find((err) => err.field === field)?.message;
  };

  return (
    <div className="space-y-6">
      <FormField
        label="Package Type"
        htmlFor="packageType"
        required
        description="Select the type of package you're shipping"
      >
        <div className="grid grid-cols-2 gap-3">
          {PACKAGE_TYPES.map((type) => (
            <label key={type.value} className="cursor-pointer">
              <input
                type="radio"
                name="packageType"
                value={type.value}
                checked={pkg.type === type.value}
                onChange={(e) => onChange({ ...pkg, type: e.target.value as PackageType })}
                disabled={disabled}
                className="mr-2"
                aria-label={type.label}
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </FormField>

      <DimensionsInput
        length={pkg.dimensions?.length || 0}
        width={pkg.dimensions?.width || 0}
        height={pkg.dimensions?.height || 0}
        unit={pkg.dimensions?.unit || 'in'}
        onChange={(dimensions) => onChange({ ...pkg, dimensions })}
        errors={errors}
        disabled={disabled}
      />

      <WeightInput
        value={pkg.weight?.value || 0}
        unit={pkg.weight?.unit || 'lbs'}
        onChange={(weight) => onChange({ ...pkg, weight })}
        errors={errors}
        disabled={disabled}
        showDimensionalWeight={{
          actual: weightData.actualWeight,
          dimensional: weightData.dimensionalWeight,
          billable: weightData.billableWeight,
          isDimensionalApplied: weightData.isDimensionalWeightApplied,
        }}
      />

      <FormField
        label="Declared Value (Optional)"
        htmlFor="declaredValue"
        description="Insurance value of package contents"
        error={getErrorForField('declaredValue')}
      >
        <div className="flex gap-2">
          <span className="flex items-center">$</span>
          <input
            id="declaredValue"
            type="number"
            value={pkg.declaredValue || ''}
            onChange={(e) =>
              onChange({
                ...pkg,
                declaredValue: e.target.value ? Number.parseFloat(e.target.value) : undefined,
              })
            }
            disabled={disabled}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-describedby={getErrorForField('declaredValue') ? 'declaredValue-error' : undefined}
          />
        </div>
      </FormField>
    </div>
  );
}
