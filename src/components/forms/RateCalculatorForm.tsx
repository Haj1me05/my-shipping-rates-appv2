/**
 * RateCalculatorForm Component
 * Main form container that orchestrates the multi-step form
 */

'use client';

import { useEffect, useState } from 'react';
import { usePackageForm } from '@/hooks/usePackageForm';
import { PackageDetailsStep } from './PackageDetailsStep';
import { AddressStep } from './AddressStep';
import { ShippingOptionsStep } from './ShippingOptionsStep';
import { ReviewStep } from './ReviewStep';
import { FormNavigation } from '@/components/ui/FormNavigation';

export interface RateCalculatorFormProps {
  onSuccess?: (requestData: any) => void;
  onCancel?: () => void;
}

/**
 * Multi-step rate calculator form with validation and persistence
 */
export function RateCalculatorForm({ onSuccess, onCancel }: RateCalculatorFormProps) {
  const form = usePackageForm();
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // Show resume prompt if there's saved state
  useEffect(() => {
    if (form.hasRestoredState && form.state.currentStep === 1) {
      setShowResumePrompt(true);
    }
  }, [form.hasRestoredState, form.state.currentStep]);

  const handleResumeYes = () => {
    setShowResumePrompt(false);
  };

  const handleResumeNo = () => {
    form.discardAndStart();
    setShowResumePrompt(false);
  };

  const handleNext = () => {
    form.nextStep();
  };

  const handlePrevious = () => {
    form.previousStep();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      form.reset();
    }
  };

  const handleEditStep = (step: number) => {
    form.goToStep(step);
  };

  const handleSubmit = async () => {
    const success = await form.submitForm();
    if (success && onSuccess) {
      onSuccess({
        package: form.state.package,
        originAddress: form.state.originAddress,
        destinationAddress: form.state.destinationAddress,
        options: form.state.shippingOptions,
      });
    }
  };

  // Resume prompt
  if (showResumePrompt) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
        <h2 className="text-xl font-bold mb-2 text-yellow-900">Resume Previous Session?</h2>
        <p className="text-yellow-800 mb-4">
          We found your previous shipping rate calculation form. Would you like to continue where
          you left off?
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleResumeYes}
            className="px-6 py-2 bg-yellow-600 text-white rounded-md font-medium hover:bg-yellow-700 transition"
          >
            Resume
          </button>
          <button
            onClick={handleResumeNo}
            className="px-6 py-2 border border-yellow-400 text-yellow-900 rounded-md font-medium hover:bg-yellow-100 transition"
          >
            Start Fresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calculate Shipping Rates</h1>
        <p className="text-gray-700 mt-2">
          Get accurate shipping rates from multiple carriers in just a few steps.
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        {/* Step Content */}
        <div className="mb-8" role="region" aria-label={`Step ${form.state.currentStep} of 4`}>
          {form.state.currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Package Details</h2>
              <PackageDetailsStep
                package={form.state.package}
                onChange={form.updatePackage}
                errors={form.state.stepErrors.packageStep}
              />
            </div>
          )}

          {form.state.currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Addresses</h2>
              <AddressStep
                originAddress={form.state.originAddress}
                destinationAddress={form.state.destinationAddress}
                onOriginChange={form.updateOriginAddress}
                onDestinationChange={form.updateDestinationAddress}
                errors={form.state.stepErrors.addressStep}
              />
            </div>
          )}

          {form.state.currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Shipping Options</h2>
              <ShippingOptionsStep
                options={form.state.shippingOptions}
                onChange={form.updateShippingOptions}
              />
            </div>
          )}

          {form.state.currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Review & Calculate</h2>
              <ReviewStep
                package={form.state.package}
                originAddress={form.state.originAddress}
                destinationAddress={form.state.destinationAddress}
                shippingOptions={form.state.shippingOptions}
                onEdit={handleEditStep}
              />
            </div>
          )}
        </div>

        {/* Navigation or Submit */}
        {form.state.currentStep < 4 ? (
          <FormNavigation
            currentStep={form.state.currentStep}
            totalSteps={4}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isPreviousDisabled={form.state.currentStep === 1}
            isNextDisabled={
              form.state.stepErrors.packageStep.length > 0 && form.state.currentStep === 1
            }
            onCancel={handleCancel}
            loading={form.state.submitting}
          />
        ) : (
          <div className="flex gap-3 justify-between">
            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={form.state.submitting}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>

              <button
                onClick={handleSubmit}
                disabled={form.state.submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                aria-busy={form.state.submitting}
              >
                {form.state.submitting && (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {form.state.submitting ? 'Calculating...' : 'Calculate Rates'}
              </button>
            </div>

            <button
              onClick={handleCancel}
              disabled={form.state.submitting}
              className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
