/**
 * FormField Component
 * Base accessible form field wrapper
 */

'use client';

import React from 'react';

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  description?: string;
}

/**
 * Accessible form field wrapper with label, error display, and ARIA attributes
 */
export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  children,
  description,
}: FormFieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const descriptionId = description ? `${htmlFor}-description` : undefined;

  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="block mb-2 font-medium text-gray-700">
        {label}
        {required && (
          <span className="text-red-600 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {description && (
        <p id={descriptionId} className="text-sm text-gray-600 mb-2">
          {description}
        </p>
      )}

      {children}

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600 flex items-center" role="alert">
          <span className="inline-block w-4 h-4 mr-2" aria-hidden="true">
            ⚠
          </span>
          {error}
        </p>
      )}
    </div>
  );
}
