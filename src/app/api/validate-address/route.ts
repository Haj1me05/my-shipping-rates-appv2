/**
 * Route Handler: Address Validation
 * Delegates to Server Action in src/actions/validate-address.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAddress } from '@/actions/validate-address';

/**
 * POST /api/validate-address
 * Accepts FormData with address fields and returns validation results
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await validateAddress(formData);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Route handler error:', error);
    return NextResponse.json(
      {
        success: false,
        errors: {
          general: ['An unexpected error occurred'],
        },
      },
      { status: 500 }
    );
  }
}
