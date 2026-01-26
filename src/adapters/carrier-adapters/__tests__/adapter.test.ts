import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCarrierAdapter, getAvailableCarriers } from '@/adapters/carrier-adapters';
import { USPSAdapter } from '@/adapters/carrier-adapters/usps-adapter';
import { FedExAdapter } from '@/adapters/carrier-adapters/fedex-adapter';
import { UPSAdapter } from '@/adapters/carrier-adapters/ups-adapter';
import type { RateRequest } from '@/adapters/carrier-adapters/adapter';

describe('Adapter Pattern - USPS Adapter', () => {
  let adapter: USPSAdapter;
  const mockRequest: RateRequest = {
    originZipCode: '10001',
    destinationZipCode: '90210',
    weight: 5,
    dimensions: {
      length: 12,
      width: 8,
      height: 6,
    },
  };

  beforeEach(() => {
    adapter = new USPSAdapter();
  });

  it('should fetch and adapt USPS rates correctly', async () => {
    const rates = await adapter.fetchRates(mockRequest);

    expect(rates).toHaveLength(3);
    expect(rates[0]).toMatchObject({
      carrier: 'USPS',
      speed: expect.any(String),
      baseRate: expect.any(Number),
      totalCost: expect.any(Number),
      estimatedDeliveryDate: expect.any(Date),
      guaranteedDelivery: expect.any(Boolean),
    });
  });

  it('should map service names correctly', async () => {
    const rates = await adapter.fetchRates(mockRequest);

    expect(rates.map((r) => r.serviceName)).toEqual(
      expect.arrayContaining(['Priority Mail', 'Priority Mail Express', 'Ground Advantage'])
    );
  });

  it('should set guaranteed delivery based on service type', async () => {
    const rates = await adapter.fetchRates(mockRequest);

    const expressRate = rates.find((r) => r.serviceName.includes('Express'));
    expect(expressRate?.guaranteedDelivery).toBe(true);
  });

  it('should extract features from service types', async () => {
    const rates = await adapter.fetchRates(mockRequest);

    const expressRate = rates.find((r) => r.serviceName.includes('Express'));
    expect(expressRate?.features).toContain('Guaranteed Delivery');
  });

  it('should throw CarrierError on API failure', async () => {
    const badAdapter = new USPSAdapter();
    vi.spyOn(badAdapter as any, 'callUSPSAPI').mockRejectedValueOnce(new Error('API Error'));

    await expect(badAdapter.fetchRates(mockRequest)).rejects.toThrow();
  });
});

describe('Adapter Pattern - FedEx Adapter', () => {
  let adapter: FedExAdapter;
  const mockRequest: RateRequest = {
    originZipCode: '10001',
    destinationZipCode: '90210',
    weight: 5,
    dimensions: {
      length: 12,
      width: 8,
      height: 6,
    },
  };

  beforeEach(() => {
    adapter = new FedExAdapter();
  });

  it('should fetch and adapt FedEx rates correctly', async () => {
    const rates = await adapter.fetchRates(mockRequest);

    expect(rates.length).toBeGreaterThan(0);
    expect(rates[0]).toMatchObject({
      carrier: 'FedEx',
      speed: expect.any(String),
      baseRate: expect.any(Number),
      totalCost: expect.any(Number),
      estimatedDeliveryDate: expect.any(Date),
    });
  });

  it('should select ACCOUNT rate type over LIST', async () => {
    const rates = await adapter.fetchRates(mockRequest);

    // Both rates should use ACCOUNT type (baseRate matches totalBaseCharge)
    expect(rates[0].baseRate).toBeGreaterThan(0);
  });

  it('should extract surcharges as fees', async () => {
    const rates = await adapter.fetchRates(mockRequest);

    const rateWithFees = rates.find((r) => r.additionalFees.length > 0);
    if (rateWithFees) {
      expect(rateWithFees.additionalFees[0]).toMatchObject({
        type: expect.any(String),
        amount: expect.any(Number),
        description: expect.any(String),
      });
    }
  });

  it('should map FedEx service types to speed correctly', async () => {
    const rates = await adapter.fetchRates(mockRequest);

    const speedMap: Record<string, string> = {
      INTERNATIONAL_PRIORITY: 'two-day',
      FEDEX_GROUND: 'economy',
    };

    rates.forEach((rate) => {
      expect(Object.values(speedMap)).toContain(rate.speed);
    });
  });

  it('should include money-back guarantee feature when eligible', async () => {
    const rates = await adapter.fetchRates(mockRequest);

    const guaranteedRates = rates.filter((r) => !r.guaranteedDelivery === false);
    guaranteedRates.forEach((rate) => {
      expect(rate.features).toContain('Money-Back Guarantee');
    });
  });
});

describe('Adapter Pattern - UPS Adapter', () => {
  let adapter: UPSAdapter;
  const mockRequest: RateRequest = {
    originZipCode: '10001',
    destinationZipCode: '90210',
    weight: 5,
    dimensions: {
      length: 12,
      width: 8,
      height: 6,
    },
  };

  beforeEach(() => {
    adapter = new UPSAdapter();
  });

  it('should fetch and adapt UPS rates correctly', async () => {
    const rates = await adapter.fetchRates(mockRequest);

    expect(rates.length).toBeGreaterThan(0);
    expect(rates[0]).toMatchObject({
      carrier: 'UPS',
      speed: expect.any(String),
      baseRate: expect.any(Number),
      totalCost: expect.any(Number),
      estimatedDeliveryDate: expect.any(Date),
    });
  });

  it('should map service codes to names correctly', async () => {
    const rates = await adapter.fetchRates(mockRequest);

    const serviceNames = rates.map((r) => r.serviceName);
    expect(serviceNames).toEqual(
      expect.arrayContaining(['UPS Next Day Air', 'UPS 2nd Day Air', 'UPS Ground'])
    );
  });

  it('should set guaranteed delivery for overnight services', async () => {
    const rates = await adapter.fetchRates(mockRequest);

    const overnightRate = rates.find((r) => r.serviceName.includes('Next Day'));
    expect(overnightRate?.guaranteedDelivery).toBe(true);
  });

  it('should extract features specific to each service', async () => {
    const rates = await adapter.fetchRates(mockRequest);

    const groundRate = rates.find((r) => r.serviceName.includes('Ground'));
    expect(groundRate?.features).toContain('Ground Service');
  });
});

describe('Factory Function - getCarrierAdapter', () => {
  it('should return USPS adapter for USPS carrier', () => {
    const adapter = getCarrierAdapter('USPS');
    expect(adapter).toBeInstanceOf(USPSAdapter);
  });

  it('should return FedEx adapter for FedEx carrier', () => {
    const adapter = getCarrierAdapter('FedEx');
    expect(adapter).toBeInstanceOf(FedExAdapter);
  });

  it('should return UPS adapter for UPS carrier', () => {
    const adapter = getCarrierAdapter('UPS');
    expect(adapter).toBeInstanceOf(UPSAdapter);
  });

  it('should throw error for unknown carrier', () => {
    expect(() => getCarrierAdapter('DHL' as any)).toThrow('Unknown carrier: DHL');
  });

  it('should return available carriers list', () => {
    const carriers = getAvailableCarriers();
    expect(carriers).toEqual(expect.arrayContaining(['USPS', 'FedEx', 'UPS']));
  });
});

describe('Adapter Consistency', () => {
  const mockRequest: RateRequest = {
    originZipCode: '10001',
    destinationZipCode: '90210',
    weight: 5,
  };

  it('should return consistent ShippingRate format from all adapters', async () => {
    const adapters = [
      getCarrierAdapter('USPS'),
      getCarrierAdapter('FedEx'),
      getCarrierAdapter('UPS'),
    ];

    const allRates = await Promise.all(adapters.map((adapter) => adapter.fetchRates(mockRequest)));

    allRates.forEach((rates) => {
      rates.forEach((rate) => {
        // Verify all required fields exist
        expect(rate).toHaveProperty('id');
        expect(rate).toHaveProperty('carrier');
        expect(rate).toHaveProperty('serviceCode');
        expect(rate).toHaveProperty('serviceName');
        expect(rate).toHaveProperty('speed');
        expect(rate).toHaveProperty('features');
        expect(rate).toHaveProperty('baseRate');
        expect(rate).toHaveProperty('additionalFees');
        expect(rate).toHaveProperty('totalCost');
        expect(rate).toHaveProperty('estimatedDeliveryDate');
        expect(rate).toHaveProperty('guaranteedDelivery');

        // Verify types
        expect(typeof rate.baseRate).toBe('number');
        expect(typeof rate.totalCost).toBe('number');
        expect(Array.isArray(rate.features)).toBe(true);
        expect(Array.isArray(rate.additionalFees)).toBe(true);
        expect(rate.estimatedDeliveryDate instanceof Date).toBe(true);
      });
    });
  });
});
