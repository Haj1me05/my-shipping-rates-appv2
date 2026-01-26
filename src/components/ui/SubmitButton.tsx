/**
 * SubmitButton Component
 * Uses React 19's useFormStatus hook for pending state
 */

'use client';

import { useFormStatus } from 'react-dom';

export interface SubmitButtonProps {
  readonly children?: React.ReactNode;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly pendingText?: string;
}

/**
 * Submit button that shows pending state using React 19's useFormStatus
 */
export function SubmitButton({
  children = 'Submit',
  disabled = false,
  className = '',
  pendingText = 'Submitting...',
}: Readonly<SubmitButtonProps>) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={`
        px-6 py-3 bg-blue-600 text-white rounded-md font-medium
        hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
        transition flex items-center gap-2
        ${className}
      `}
      aria-busy={pending}
      aria-label={pending ? pendingText : 'Submit form'}
    >
      {pending && (
        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {pending ? pendingText : children}
    </button>
  );
}
