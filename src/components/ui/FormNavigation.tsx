/**
 * FormNavigation Component
 * Previous/Next buttons with step progress indicator
 */

'use client';

import React from 'react';

export interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isPreviousDisabled?: boolean;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * Get className for step indicator
 */
function getStepClassName(isCurrent: boolean, isCompleted: boolean): string {
  const baseClasses =
    'w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors';
  if (isCurrent) {
    return `${baseClasses} bg-blue-600 text-white`;
  }
  if (isCompleted) {
    return `${baseClasses} bg-green-600 text-white`;
  }
  return `${baseClasses} bg-gray-200 text-gray-600`;
}

/**
 * Get aria-label for step
 */
function getStepAriaLabel(
  step: number,
  totalSteps: number,
  isCurrent: boolean,
  isCompleted: boolean
): string {
  const baseLabel = `Step ${step} of ${totalSteps}`;
  if (isCompleted) return `${baseLabel} - completed`;
  if (isCurrent) return `${baseLabel} - current`;
  return baseLabel;
}

/**
 * Navigation component with step indicator
 */
export function FormNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isNextDisabled = false,
  isPreviousDisabled = false,
  onCancel,
  loading = false,
}: Readonly<FormNavigationProps>) {
  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const step = i + 1;
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <React.Fragment key={step}>
                <div
                  className={getStepClassName(isCurrent, isCompleted)}
                  role="status"
                  aria-label={getStepAriaLabel(step, totalSteps, isCurrent, isCompleted)}
                >
                  {isCompleted ? '✓' : step}
                </div>

                {step < totalSteps && (
                  <div
                    className={`flex-1 h-1 mx-1 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <span className="text-sm text-gray-600 ml-4">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-between">
        <div className="flex gap-3">
          <button
            onClick={onPrevious}
            disabled={isPreviousDisabled || loading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Go to previous step"
          >
            ← Previous
          </button>

          <button
            onClick={onNext}
            disabled={isNextDisabled || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label={`Go to next step${loading ? ' (loading)' : ''}`}
          >
            {loading ? 'Loading...' : 'Next →'}
          </button>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Cancel form"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
