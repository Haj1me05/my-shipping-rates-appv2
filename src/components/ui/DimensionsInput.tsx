/**
 * DimensionsInput Component
 * Input group for length, width, height with unit selector
 */

'use client';

import { FormField } from './FormField';
import { ValidationError } from '@/types/domain';

export interface DimensionsInputProps {
  length: number;
  width: number;
  height: number;
  unit: 'in' | 'cm';
  onChange: (dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'in' | 'cm';
  }) => void;
  errors?: ValidationError[];
  disabled?: boolean;
}

/**
 * Accessible dimensions input with length, width, height fields and unit selector
 */
export function DimensionsInput({
  length,
  width,
  height,
  unit,
  onChange,
  errors = [],
  disabled = false,
}: Readonly<DimensionsInputProps>) {
  const getErrorForField = (field: string): string | undefined => {
    return errors.find((err) => err.field === field)?.message;
  };

  return (
    <div className="space-y-4">
      <FormField
        label="Dimensions"
        htmlFor="dimensions-unit"
        required
        description="Enter the package dimensions"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="flex gap-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="dimensionUnit"
                value="in"
                checked={unit === 'in'}
                onChange={(e) =>
                  onChange({ length, width, height, unit: e.target.value as 'in' | 'cm' })
                }
                disabled={disabled}
                className="mr-2"
                aria-label="Dimensions in inches"
              />
              <span>Inches</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="dimensionUnit"
                value="cm"
                checked={unit === 'cm'}
                onChange={(e) =>
                  onChange({ length, width, height, unit: e.target.value as 'in' | 'cm' })
                }
                disabled={disabled}
                className="mr-2"
                aria-label="Dimensions in centimeters"
              />
              <span>Centimeters</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="length" className="block text-sm font-medium mb-1">
              Length
              <span className="text-red-600 ml-1.5" aria-label="required">
                *
              </span>
            </label>
            <input
              id="length"
              type="number"
              value={length}
              onChange={(e) =>
                onChange({
                  length: Number.parseFloat(e.target.value) || 0,
                  width,
                  height,
                  unit,
                })
              }
              disabled={disabled}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-required="true"
              aria-invalid={!!getErrorForField('length')}
              aria-describedby={getErrorForField('length') ? 'length-error' : undefined}
            />
            {getErrorForField('length') && (
              <p id="length-error" className="text-red-600 text-sm mt-1" role="alert">
                {getErrorForField('length')}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="width" className="block text-sm font-medium mb-1">
              Width
              <span className="text-red-600 ml-1.5" aria-label="required">
                *
              </span>
            </label>
            <input
              id="width"
              type="number"
              value={width}
              onChange={(e) =>
                onChange({
                  length,
                  width: Number.parseFloat(e.target.value) || 0,
                  height,
                  unit,
                })
              }
              disabled={disabled}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-required="true"
              aria-invalid={!!getErrorForField('width')}
              aria-describedby={getErrorForField('width') ? 'width-error' : undefined}
            />
            {getErrorForField('width') && (
              <p id="width-error" className="text-red-600 text-sm mt-1" role="alert">
                {getErrorForField('width')}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="height" className="block text-sm font-medium mb-1">
              Height
              <span className="text-red-600 ml-1.5" aria-label="required">
                *
              </span>
            </label>
            <input
              id="height"
              type="number"
              value={height}
              onChange={(e) =>
                onChange({
                  length,
                  width,
                  height: Number.parseFloat(e.target.value) || 0,
                  unit,
                })
              }
              disabled={disabled}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-required="true"
              aria-invalid={!!getErrorForField('height')}
              aria-describedby={getErrorForField('height') ? 'height-error' : undefined}
            />
            {getErrorForField('height') && (
              <p id="height-error" className="text-red-600 text-sm mt-1" role="alert">
                {getErrorForField('height')}
              </p>
            )}
          </div>
        </div>
      </FormField>
    </div>
  );
}
