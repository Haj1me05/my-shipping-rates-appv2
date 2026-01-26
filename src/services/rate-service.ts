import {
  ShippingRate,
  ShippingOptions,
  CarrierError as DomainCarrierError,
  RateResponse,
} from '@/types/domain';
import { getCarrierAdapter, CarrierName } from '@/adapters/carrier-adapters';
import { CarrierError } from '@/adapters/carrier-adapters/adapter';
import { BaseRate, applyFees } from '@/services/fee-decorators/decorator';
import { CarrierConfigManager } from '@/config/carrier-config';

interface RateServiceRequest {
  originZipCode: string;
  destinationZipCode: string;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  declaredValue?: number;
  carriers?: CarrierName[];
}

/**
 * RateService - Orchestrates parallel rate fetching from multiple carriers
 * with error handling and fee application using decorator pattern
 */
export class RateService {
  /**
   * Fetch rates from all available carriers in parallel
   */
  async fetchAllRates(
    request: RateServiceRequest,
    options: ShippingOptions
  ): Promise<RateResponse> {
    const requestId = this.generateRequestId();
    const configManager = CarrierConfigManager.getInstance();

    // Use provided carriers or fall back to configured carriers
    let carriers = request.carriers || (['USPS', 'FedEx', 'UPS'] as CarrierName[]);

    // Filter to only configured carriers
    carriers = carriers.filter((carrier) => configManager.isCarrierConfigured(carrier));

    // Create array of promises for parallel fetching
    const promises = carriers.map((carrier) =>
      this.fetchCarrierRate(carrier, request, options).then(
        (rates) => ({ status: 'fulfilled' as const, value: rates, carrier }),
        (error) => ({ status: 'rejected' as const, reason: error, carrier })
      )
    );

    // Wait for all promises to settle
    const results = await Promise.all(promises);

    // Process results
    const rates: ShippingRate[] = [];
    const errors: DomainCarrierError[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        rates.push(...result.value);
      } else {
        const error = result.reason;
        if (error instanceof CarrierError) {
          errors.push({
            carrier: error.carrier as any,
            message: error.message,
            recoverable: error.recoverable,
          });
        } else {
          errors.push({
            carrier: result.carrier as any,
            message: error instanceof Error ? error.message : 'Unknown error',
            recoverable: true,
          });
        }
      }
    });

    // Sort rates by cost, then by delivery date
    const sortedRates = this.sortRates(rates);

    return {
      requestId,
      rates: sortedRates,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Fetch rates from a single carrier with retry logic
   */
  private async fetchCarrierRate(
    carrier: CarrierName,
    request: RateServiceRequest,
    options: ShippingOptions
  ): Promise<ShippingRate[]> {
    try {
      console.log(`[RateService] Fetching rates from ${carrier}...`);
      const adapter = getCarrierAdapter(carrier);
      const adapterRequest = {
        originZipCode: request.originZipCode,
        destinationZipCode: request.destinationZipCode,
        weight: request.weight,
        dimensions: request.dimensions,
        declaredValue: request.declaredValue,
      };

      console.log(`[RateService] ${carrier} adapter request:`, adapterRequest);
      const rates = await adapter.fetchRates(adapterRequest);
      console.log(`[RateService] ${carrier} returned ${rates.length} rates`);

      // Apply additional fees using decorator pattern
      return rates.map((rate) => this.applyAdditionalFees(rate, options));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[RateService] Error fetching from ${carrier}:`, errorMessage);
      const isRecoverable = this.isRecoverableError(error);
      if (isRecoverable && !this.wasRetried(carrier)) {
        console.log(`[RateService] Retrying ${carrier}...`);
        return this.retryWithBackoff(carrier, request, options);
      }
      throw error;
    }
  }

  /**
   * Apply decorator pattern to add fees to rate
   */
  private applyAdditionalFees(rate: ShippingRate, options: ShippingOptions): ShippingRate {
    const baseRate = new BaseRate(rate.baseRate, rate.serviceName);
    const decorated = applyFees(baseRate, options);

    return {
      ...rate,
      additionalFees: decorated.getFees(),
      totalCost: decorated.getCost(),
    };
  }

  /**
   * Retry with exponential backoff
   */
  private async retryWithBackoff(
    carrier: CarrierName,
    request: RateServiceRequest,
    options: ShippingOptions,
    maxRetries: number = 3,
    attempt: number = 0
  ): Promise<ShippingRate[]> {
    if (attempt >= maxRetries) {
      throw new Error(`Failed to fetch rates from ${carrier} after ${maxRetries} retries`);
    }

    const backoffMs = Math.pow(2, attempt) * 1000;
    await new Promise((resolve) => setTimeout(resolve, backoffMs));

    try {
      return await this.fetchCarrierRate(carrier, request, options);
    } catch (error) {
      return this.retryWithBackoff(carrier, request, options, maxRetries, attempt + 1);
    }
  }

  /**
   * Determine if error is recoverable
   */
  private isRecoverableError(error: unknown): boolean {
    if (error instanceof CarrierError) {
      return error.recoverable;
    }

    if (error instanceof Error) {
      // Network errors are recoverable
      const message = error.message.toLowerCase();
      return (
        message.includes('timeout') ||
        message.includes('econnrefused') ||
        message.includes('enotfound') ||
        message.includes('network')
      );
    }

    return true;
  }

  /**
   * Track retry attempts (simple implementation)
   */
  private retryMap = new Map<string, number>();

  private wasRetried(carrier: CarrierName): boolean {
    const count = this.retryMap.get(carrier) || 0;
    this.retryMap.set(carrier, count + 1);
    return count > 0;
  }

  /**
   * Sort rates by cost, then by delivery date
   */
  private sortRates(rates: ShippingRate[]): ShippingRate[] {
    return [...rates].sort((a, b) => {
      // First sort by cost
      const costDiff = a.totalCost - b.totalCost;
      if (costDiff !== 0) {
        return costDiff;
      }

      // Then by delivery date
      const dateA = new Date(a.estimatedDeliveryDate).getTime();
      const dateB = new Date(b.estimatedDeliveryDate).getTime();
      return dateA - dateB;
    });
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `rate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Export singleton instance for application-wide access
 */
export const rateService = new RateService();
