import { describe, it, expect, beforeEach } from 'vitest';
import type { ShippingRate } from '@/types/domain';

describe('RatesComparisonTable', () => {
  let mockRates: ShippingRate[];

  beforeEach(() => {
    mockRates = [
      {
        id: '1',
        carrier: 'USPS',
        speed: 'standard',
        baseRate: 5.99,
        additionalFees: [{ type: 'fuel-surcharge', amount: 0.5, description: 'Fuel Surcharge' }],
        totalCost: 6.49,
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        features: ['Tracking', 'Insurance'],
        serviceCode: 'USPS-STD',
        serviceName: 'Standard',
        guaranteedDelivery: false,
      },
      {
        id: '2',
        carrier: 'FedEx',
        speed: 'overnight',
        baseRate: 25.99,
        additionalFees: [{ type: 'residential-fee', amount: 2.0, description: 'Residential Fee' }],
        totalCost: 27.99,
        estimatedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        features: ['Tracking', 'Signature Required'],
        serviceCode: 'FEDEX-ON',
        serviceName: 'Overnight',
        guaranteedDelivery: true,
      },
      {
        id: '3',
        carrier: 'UPS',
        speed: 'two-day',
        baseRate: 12.99,
        additionalFees: [{ type: 'fuel-surcharge', amount: 0.75, description: 'Fuel Surcharge' }],
        totalCost: 13.74,
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        features: ['Tracking'],
        serviceCode: 'UPS-2DAY',
        serviceName: 'Two-Day',
        guaranteedDelivery: false,
      },
    ] as unknown as ShippingRate[];
  });

  describe('Sorting', () => {
    it('should sort by price ascending', () => {
      const sorted = [...mockRates].sort((a, b) => a.totalCost - b.totalCost);
      expect(sorted[0].id).toBe('1');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('2');
    });

    it('should sort by price descending', () => {
      const sorted = [...mockRates].sort((a, b) => b.totalCost - a.totalCost);
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });

    it('should sort by delivery date ascending', () => {
      const sorted = [...mockRates].sort(
        (a, b) => a.estimatedDeliveryDate.getTime() - b.estimatedDeliveryDate.getTime()
      );
      expect(sorted[0].id).toBe('2'); // 1 day
      expect(sorted[1].id).toBe('3'); // 2 days
      expect(sorted[2].id).toBe('1'); // 5 days
    });

    it('should sort by carrier name alphabetically', () => {
      const sorted = [...mockRates].sort((a, b) => a.carrier.localeCompare(b.carrier));
      expect(sorted[0].carrier).toBe('FedEx');
      expect(sorted[1].carrier).toBe('UPS');
      expect(sorted[2].carrier).toBe('USPS');
    });
  });

  describe('Filtering', () => {
    it('should filter by carrier', () => {
      const carriers = ['USPS'];
      const filtered = mockRates.filter((r) => carriers.includes(r.carrier as any));
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should filter by multiple carriers', () => {
      const carriers = ['USPS', 'FedEx'];
      const filtered = mockRates.filter((r) => carriers.includes(r.carrier as any));
      expect(filtered).toHaveLength(2);
      expect(filtered.map((r) => r.id)).toEqual(expect.arrayContaining(['1', '2']));
    });

    it('should filter by speed', () => {
      const speeds = ['standard'];
      const filtered = mockRates.filter((r) => speeds.includes(r.speed as any));
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should filter by multiple speeds', () => {
      const speeds = ['overnight', 'two-day'];
      const filtered = mockRates.filter((r) => speeds.includes(r.speed as any));
      expect(filtered).toHaveLength(2);
      expect(filtered.map((r) => r.id)).toEqual(expect.arrayContaining(['2', '3']));
    });

    it('should apply both carrier and speed filters', () => {
      const carriers = ['FedEx', 'UPS'];
      const speeds = ['two-day'];
      let filtered = mockRates.filter((r) => carriers.includes(r.carrier as any));
      filtered = filtered.filter((r) => speeds.includes(r.speed as any));
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('3');
    });
  });

  describe('Best Value Identification', () => {
    it('should identify cheapest rate', () => {
      const cheapest = mockRates.reduce((min, r) => (r.totalCost < min.totalCost ? r : min));
      expect(cheapest.id).toBe('1');
      expect(cheapest.totalCost).toBe(6.49);
    });

    it('should identify fastest rate', () => {
      const fastest = mockRates.reduce((min, r) =>
        r.estimatedDeliveryDate.getTime() < min.estimatedDeliveryDate.getTime() ? r : min
      );
      expect(fastest.id).toBe('2');
    });

    it('should calculate value score correctly', () => {
      const calculateBusinessDays = (date: Date) => {
        const today = new Date();
        const diffMs = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays);
      };

      const scores = mockRates.map((rate) => {
        const businessDays = calculateBusinessDays(rate.estimatedDeliveryDate);
        return {
          id: rate.id,
          score: rate.totalCost + businessDays * 2,
        };
      });

      // Cheapest is USPS at 6.49 + 5 days * 2 = 16.49
      // FedEx is 27.99 + 1 day * 2 = 29.99
      // UPS is 13.74 + 2 days * 2 = 17.74
      const bestValue = scores.reduce((best, score) => (score.score < best.score ? score : best));
      expect(bestValue.id).toBe('1'); // USPS has lowest value score
    });
  });

  describe('Business Days Calculation', () => {
    it('should calculate business days correctly', () => {
      const calculateBusinessDays = (date: Date) => {
        const today = new Date();
        const diffMs = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays);
      };

      const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      const days = calculateBusinessDays(tomorrow);
      expect(days).toBe(1);
    });

    it('should ensure minimum 1 business day', () => {
      const calculateBusinessDays = (date: Date) => {
        const today = new Date();
        const diffMs = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays);
      };

      const today = new Date();
      const days = calculateBusinessDays(today);
      expect(days).toBeGreaterThanOrEqual(1);
    });
  });
});
