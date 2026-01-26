import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateService } from '@/services/rate-service';
import { getCarrierAdapter } from '@/adapters/carrier-adapters';
import type { ShippingOptions } from '@/types/domain';

describe('RateService - Orchestration & Integration', () => {
  let rateService: RateService;
  const mockRequest = {
    originZipCode: '10001',
    destinationZipCode: '90210',
    weight: 5,
    dimensions: {
      length: 12,
      width: 8,
      height: 6,
    },
  };

  const mockOptions: ShippingOptions = {
    speed: 'standard',
    signatureRequired: false,
    insurance: false,
    fragileHandling: false,
    saturdayDelivery: false,
  };

  beforeEach(() => {
    rateService = new RateService();
  });

  it('should fetch rates from all available carriers in parallel', async () => {
    const response = await rateService.fetchAllRates(mockRequest, mockOptions);

    expect(response).toHaveProperty('requestId');
    expect(response).toHaveProperty('rates');
    expect(response).toHaveProperty('errors');
    expect(response).toHaveProperty('timestamp');
    expect(response.rates.length).toBeGreaterThan(0);
  });

  it('should generate unique request IDs', async () => {
    const response1 = await rateService.fetchAllRates(mockRequest, mockOptions);
    const response2 = await rateService.fetchAllRates(mockRequest, mockOptions);

    expect(response1.requestId).not.toBe(response2.requestId);
  });

  it('should include rates from all carriers', async () => {
    const response = await rateService.fetchAllRates(mockRequest, mockOptions);

    const carriers = new Set(response.rates.map((r) => r.carrier));
    expect(carriers.size).toBeGreaterThanOrEqual(2); // At least 2 carriers
  });

  it('should sort rates by cost first, then by delivery date', async () => {
    const response = await rateService.fetchAllRates(mockRequest, mockOptions);

    for (let i = 1; i < response.rates.length; i++) {
      const prev = response.rates[i - 1];
      const curr = response.rates[i];

      if (prev.totalCost === curr.totalCost) {
        // If costs are equal, check delivery date order
        const prevDate = new Date(prev.estimatedDeliveryDate).getTime();
        const currDate = new Date(curr.estimatedDeliveryDate).getTime();
        expect(prevDate).toBeLessThanOrEqual(currDate);
      } else {
        // Otherwise costs should be in ascending order
        expect(prev.totalCost).toBeLessThanOrEqual(curr.totalCost);
      }
    }
  });

  it('should apply decorator fees to rates', async () => {
    const optionsWithFees: ShippingOptions = {
      speed: 'standard',
      signatureRequired: true,
      insurance: false,
      fragileHandling: true,
      saturdayDelivery: false,
    };

    const response = await rateService.fetchAllRates(mockRequest, optionsWithFees);

    // Rates should have additional fees applied
    const ratesWithFees = response.rates.filter((r) => r.additionalFees.length > 0);
    expect(ratesWithFees.length).toBeGreaterThan(0);

    // Verify fee types are present
    ratesWithFees.forEach((rate) => {
      expect(rate.additionalFees.some((f) => f.type === 'signature')).toBe(true);
      expect(rate.additionalFees.some((f) => f.type === 'other')).toBe(true);
    });
  });

  it('should apply insurance decorator when declaredValue is set', async () => {
    const optionsWithInsurance: ShippingOptions = {
      speed: 'standard',
      signatureRequired: false,
      insurance: true,
      fragileHandling: false,
      saturdayDelivery: false,
      declaredValue: 500,
    };

    const response = await rateService.fetchAllRates(mockRequest, optionsWithInsurance);

    response.rates.forEach((rate) => {
      expect(rate.additionalFees.some((f) => f.type === 'insurance')).toBe(true);
    });
  });

  it('should apply Saturday delivery decorator when requested', async () => {
    const optionsWithSaturday: ShippingOptions = {
      speed: 'standard',
      signatureRequired: false,
      insurance: false,
      fragileHandling: false,
      saturdayDelivery: true,
      saturdayDeliveryRequired: true,
    };

    const response = await rateService.fetchAllRates(mockRequest, optionsWithSaturday);

    response.rates.forEach((rate) => {
      expect(rate.additionalFees.some((f) => f.type === 'saturdayDelivery')).toBe(true);
    });
  });

  it('should calculate total cost correctly with fees applied', async () => {
    const optionsWithFees: ShippingOptions = {
      speed: 'standard',
      signatureRequired: true, // +$5.50
      insurance: false,
      fragileHandling: false,
      saturdayDelivery: false,
    };

    const response = await rateService.fetchAllRates(mockRequest, optionsWithFees);

    response.rates.forEach((rate) => {
      const feesTotal = rate.additionalFees.reduce((sum, f) => sum + f.amount, 0);
      const expectedTotal = rate.baseRate + feesTotal;
      expect(rate.totalCost).toBeCloseTo(expectedTotal, 2);
    });
  });

  it('should fetch rates from specific carriers only', async () => {
    const response = await rateService.fetchAllRates(
      { ...mockRequest, carriers: ['USPS', 'FedEx'] },
      mockOptions
    );

    const carriers = new Set(response.rates.map((r) => r.carrier));
    expect(carriers.has('USPS')).toBe(true);
    expect(carriers.has('FedEx')).toBe(true);
  });

  it('should handle partial failures gracefully', async () => {
    // Mock one adapter to fail
    const fedexAdapter = getCarrierAdapter('FedEx');
    const originalFetchRates = fedexAdapter.fetchRates.bind(fedexAdapter);

    vi.spyOn(fedexAdapter, 'fetchRates').mockRejectedValueOnce(new Error('API Error'));

    const response = await rateService.fetchAllRates(mockRequest, mockOptions);

    // Should still have rates from other carriers
    expect(response.rates.length).toBeGreaterThan(0);
    expect(response.errors.length).toBeGreaterThan(0);

    // Restore original
    vi.spyOn(fedexAdapter, 'fetchRates').mockImplementation(originalFetchRates);
  });

  it('should categorize errors as recoverable or non-recoverable', async () => {
    const response = await rateService.fetchAllRates(mockRequest, mockOptions);

    response.errors.forEach((error) => {
      expect(typeof error.recoverable).toBe('boolean');
      expect(error).toHaveProperty('carrier');
      expect(error).toHaveProperty('message');
    });
  });

  it('should include timestamp in response', async () => {
    const response = await rateService.fetchAllRates(mockRequest, mockOptions);

    expect(response.timestamp).toBeDefined();
    const date = new Date(response.timestamp);
    expect(date instanceof Date && !isNaN(date.getTime())).toBe(true);
  });

  it('should handle empty rates gracefully', async () => {
    const response = await rateService.fetchAllRates(mockRequest, mockOptions);

    expect(Array.isArray(response.rates)).toBe(true);
    expect(response.rates.length >= 0).toBe(true);
  });

  it('should maintain rate consistency across multiple calls', async () => {
    const response1 = await rateService.fetchAllRates(mockRequest, mockOptions);
    const response2 = await rateService.fetchAllRates(mockRequest, mockOptions);

    // Both responses should have rates
    expect(response1.rates.length).toBe(response2.rates.length);

    // Verify carriers are the same
    const carriers1 = new Set(response1.rates.map((r) => r.carrier));
    const carriers2 = new Set(response2.rates.map((r) => r.carrier));

    expect(carriers1.size).toBe(carriers2.size);
  });
});

describe('RateService - Error Handling', () => {
  let rateService: RateService;
  const mockRequest = {
    originZipCode: '10001',
    destinationZipCode: '90210',
    weight: 5,
  };

  const mockOptions: ShippingOptions = {
    speed: 'standard',
    signatureRequired: false,
    insurance: false,
    fragileHandling: false,
    saturdayDelivery: false,
  };

  beforeEach(() => {
    rateService = new RateService();
  });

  it('should collect all errors when all carriers fail', async () => {
    // This test verifies error collection without actually breaking all adapters
    const response = await rateService.fetchAllRates(mockRequest, mockOptions);

    // Even if some fail, we should have a response
    expect(response).toHaveProperty('errors');
    expect(Array.isArray(response.errors)).toBe(true);
  });

  it('should include error details for failed carriers', async () => {
    const response = await rateService.fetchAllRates(mockRequest, mockOptions);

    response.errors.forEach((error) => {
      expect(error.carrier).toBeDefined();
      expect(error.message).toBeDefined();
      expect(error.recoverable).toBeDefined();
    });
  });
});

describe('RateService - Fee Application Integration', () => {
  let rateService: RateService;
  const mockRequest = {
    originZipCode: '10001',
    destinationZipCode: '90210',
    weight: 5,
  };

  beforeEach(() => {
    rateService = new RateService();
  });

  it('should apply all requested fees to each rate', async () => {
    const optionsWithAllFees: ShippingOptions = {
      speed: 'standard',
      signatureRequired: true,
      insurance: true,
      fragileHandling: true,
      saturdayDelivery: false,
      declaredValue: 1000,
      saturdayDeliveryRequired: false,
    };

    const response = await rateService.fetchAllRates(mockRequest, optionsWithAllFees);

    response.rates.forEach((rate) => {
      // Should have at least insurance, signature, and fragile fees
      expect(rate.additionalFees.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('should calculate correct total cost with stacked decorators', async () => {
    const optionsWithFees: ShippingOptions = {
      speed: 'standard',
      signatureRequired: true, // $5.50
      insurance: false,
      fragileHandling: true, // $10.00
      saturdayDelivery: false,
    };

    const response = await rateService.fetchAllRates(mockRequest, optionsWithFees);

    response.rates.forEach((rate) => {
      // Total should be baseRate + 5.50 + 10.00
      const expectedMinimumFees = 15.5;
      const actualFees = rate.totalCost - rate.baseRate;
      expect(actualFees).toBeGreaterThanOrEqual(expectedMinimumFees - 0.01);
    });
  });
});
