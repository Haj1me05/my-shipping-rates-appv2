/**
 * AddressStep Component
 * Step 2: Origin and destination address forms
 */

'use client';

import { Address, ValidationError } from '@/types/domain';
import { AddressForm } from '@/components/ui/AddressForm';

export interface AddressStepProps {
  originAddress: Partial<Address>;
  destinationAddress: Partial<Address>;
  onOriginChange: (address: Partial<Address>) => void;
  onDestinationChange: (address: Partial<Address>) => void;
  errors?: ValidationError[];
  disabled?: boolean;
}

/**
 * Address step component with origin and destination forms
 */
export function AddressStep({
  originAddress,
  destinationAddress,
  onOriginChange,
  onDestinationChange,
  errors = [],
  disabled = false,
}: Readonly<AddressStepProps>) {
  // Filter errors by address type
  const originErrors = errors.filter((err) => !err.message.includes('Destination'));
  const destErrors = errors.filter(
    (err) => !err.message.includes('Origin') && !err.message.includes('Destination')
  );

  return (
    <div className="space-y-6">
      <AddressForm
        value={originAddress}
        onChange={onOriginChange}
        validationErrors={originErrors}
        disabled={disabled}
        title="Origin Address"
        showAllFields={true}
      />

      <AddressForm
        value={destinationAddress}
        onChange={onDestinationChange}
        validationErrors={destErrors}
        disabled={disabled}
        title="Destination Address"
        showAllFields={true}
      />
    </div>
  );
}
