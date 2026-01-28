import { NextRequest, NextResponse } from 'next/server';
import { RateService } from '@/services/rate-service';
import { CarrierConfigManager } from '@/config/carrier-config';
import type { RateRequest, RateResponse } from '@/types/domain';

/**
 * POST /api/rates
 * Fetches shipping rates from multiple carriers
 */
export async function POST(request: NextRequest): Promise<NextResponse<RateResponse>> {
  try {
    console.log('[API] POST /api/rates - Request received');

    // Parse request body
    const body: RateRequest = await request.json();
    console.log('[API] Request body parsed:', {
      originZip: body.originAddress?.postalCode,
      destZip: body.destinationAddress?.postalCode,
      weight: body.package?.weight.value,
    });

    // Validate required fields
    if (!body.destinationAddress || !body.package || !body.originAddress) {
      console.log('[API] Validation failed - missing required fields');
      return NextResponse.json(
        {
          requestId: 'invalid-request',
          rates: [],
          errors: [
            {
              carrier: 'System' as any,
              message: 'Missing required fields: originAddress, destinationAddress, and package',
              recoverable: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Get only configured carriers
    const configManager = CarrierConfigManager.getInstance();
    const configuredCarriers = configManager.getConfiguredCarriers();
    console.log('[API] Configured carriers:', configuredCarriers);

    const carriersToFetch =
      body.carriers?.filter((c) => configManager.isCarrierConfigured(c)) || configuredCarriers;
    console.log('[API] Carriers to fetch:', carriersToFetch);

    if (carriersToFetch.length === 0) {
      console.log('[API] No carriers to fetch');
      return NextResponse.json(
        {
          requestId: 'no-carriers',
          rates: [],
          errors: [
            {
              carrier: 'System' as any,
              message:
                'No shipping carriers are configured. Please check your environment variables.',
              recoverable: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // Convert RateRequest to RateServiceRequest format
    const serviceRequest = {
      originAddress: body.originAddress,
      destinationAddress: body.destinationAddress,
      weight: body.package.weight.value,
      dimensions: {
        length: body.package.dimensions.length,
        width: body.package.dimensions.width,
        height: body.package.dimensions.height,
      },
      declaredValue: body.options.declaredValue,
      carriers: carriersToFetch,
    };

    console.log('[API] Service request prepared:', serviceRequest);

    // Fetch rates from configured carriers
    const rateService = new RateService();
    console.log('[API] Calling fetchAllRates...');
    const response = await rateService.fetchAllRates(serviceRequest, body.options);

    console.log(
      '[API] Success - returned',
      response.rates.length,
      'rates with',
      response.errors.length,
      'errors'
    );

    // Convert Date objects to ISO strings for JSON serialization
    const serializedResponse = {
      ...response,
      rates: response.rates.map((rate) => ({
        ...rate,
        estimatedDeliveryDate:
          rate.estimatedDeliveryDate instanceof Date
            ? rate.estimatedDeliveryDate.toISOString()
            : rate.estimatedDeliveryDate,
      })),
    };

    return NextResponse.json(serializedResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : '';
    console.error('[API] Error fetching rates:', message);
    console.error('[API] Stack trace:', stack);

    return NextResponse.json(
      {
        requestId: 'error',
        rates: [],
        errors: [
          {
            carrier: 'System' as any,
            message: `Failed to fetch rates: ${message}`,
            recoverable: false,
          },
        ],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
