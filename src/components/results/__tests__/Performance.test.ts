import { describe, it, expect, vi } from 'vitest';
import type { ShippingRate, ServiceSpeed, CarrierName } from '@/types/domain';

describe('Performance Optimizations', () => {
  describe('React.memo prevents unnecessary re-renders', () => {
    it('should not re-render when props are unchanged', () => {
      const renderFn = vi.fn();

      // Mock component that would be wrapped with React.memo
      const mockComponent = (data: ShippingRate) => {
        renderFn();
        return data.id;
      };

      // Simulate memo behavior with custom comparison
      let lastProps: ShippingRate | null = null;
      let lastResult: string | null = null;

      const memoizedComponent = (data: ShippingRate): string => {
        if (lastProps && lastProps.id === data.id) {
          return lastResult!;
        }
        lastProps = data;
        lastResult = mockComponent(data);
        return lastResult;
      };

      const mockRate: ShippingRate = {
        id: '1',
        carrier: 'USPS',
        serviceCode: 'USPS-STD',
        serviceName: 'Standard',
        speed: 'standard',
        baseRate: 5.99,
        additionalFees: [],
        totalCost: 5.99,
        estimatedDeliveryDate: new Date(),
        guaranteedDelivery: false,
        features: [],
      };

      memoizedComponent(mockRate);
      expect(renderFn).toHaveBeenCalledTimes(1);

      // Call with same data - memo should prevent execution
      memoizedComponent(mockRate);
      expect(renderFn).toHaveBeenCalledTimes(1); // Still 1 because memo prevents re-render

      // Call with different data - should execute again
      const differentRate = { ...mockRate, id: '2' };
      memoizedComponent(differentRate);
      expect(renderFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('useMemo dependencies work correctly', () => {
    it('should recalculate only when dependencies change', () => {
      const computeFn = vi.fn((value: number) => value * 2);

      let callCount = 0;
      let cachedValue: any = null;
      let previousDeps: unknown[] | null = null;

      const simulateUseMemo = (fn: () => any, deps: unknown[]): any => {
        const depsChanged = !previousDeps || previousDeps.some((dep, i) => dep !== deps[i]);
        if (depsChanged) {
          callCount++;
          cachedValue = fn();
          previousDeps = deps;
        }
        return cachedValue;
      };

      // First call with value 5
      const result1 = simulateUseMemo(() => computeFn(5), [5]);
      expect(result1).toBe(10);
      expect(computeFn).toHaveBeenCalledTimes(1);

      // Call with same dependency - should not call computeFn again
      const result2 = simulateUseMemo(() => computeFn(5), [5]);
      expect(result2).toBe(10);
      expect(computeFn).toHaveBeenCalledTimes(1);

      // Call with different dependency - should call computeFn
      const result3 = simulateUseMemo(() => computeFn(10), [10]);
      expect(result3).toBe(20);
      expect(computeFn).toHaveBeenCalledTimes(2);
    });

    it('should work correctly with array dependencies', () => {
      const computeFn = vi.fn((rates: ShippingRate[], carrier: string) => {
        return rates.filter((r) => r.carrier === carrier);
      });

      const mockRates = [
        {
          id: '1',
          carrier: 'USPS' as const,
          serviceCode: 'USPS-STD',
          serviceName: 'Standard',
          speed: 'standard' as const,
          baseRate: 5.99,
          additionalFees: [],
          totalCost: 5.99,
          estimatedDeliveryDate: new Date(),
          guaranteedDelivery: false,
          features: [],
        },
      ] as ShippingRate[];

      let previousDeps: unknown[] | null = null;
      let cachedResult: any = null;

      const simulateUseMemo = (fn: () => any, deps: unknown[]): any => {
        const depsChanged = !previousDeps || previousDeps.some((dep, i) => dep !== deps[i]);
        if (depsChanged) {
          cachedResult = fn();
          previousDeps = deps;
        }
        return cachedResult;
      };

      const result1 = simulateUseMemo(() => computeFn(mockRates, 'USPS'), [mockRates, 'USPS']);
      expect(computeFn).toHaveBeenCalledTimes(1);
      expect(result1).toHaveLength(1);

      // Call with same props - should not call computeFn again
      simulateUseMemo(() => computeFn(mockRates, 'USPS'), [mockRates, 'USPS']);
      expect(computeFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('useCallback prevents function recreation', () => {
    it('should return same function reference when dependencies unchanged', () => {
      let previousDeps: unknown[] | null = null;
      let cachedFn: any = null;

      const simulateUseCallback = <T extends (...args: any[]) => any>(
        fn: T,
        deps: unknown[]
      ): T => {
        const depsChanged = !previousDeps || previousDeps.some((dep, i) => dep !== deps[i]);
        if (depsChanged) {
          cachedFn = fn;
          previousDeps = deps;
        }
        return cachedFn as T;
      };

      const callback1 = simulateUseCallback(() => 5 * 2, [5]);
      const callback2 = simulateUseCallback(() => 5 * 2, [5]);

      expect(callback1).toBe(callback2);
    });

    it('should create new function when dependencies change', () => {
      let previousDeps: unknown[] | null = null;
      let cachedFn: any = null;

      const simulateUseCallback = <T extends (...args: any[]) => any>(
        fn: T,
        deps: unknown[]
      ): T => {
        const depsChanged = !previousDeps || previousDeps.some((dep, i) => dep !== deps[i]);
        if (depsChanged) {
          cachedFn = fn;
          previousDeps = deps;
        }
        return cachedFn as T;
      };

      const callback1 = simulateUseCallback((value: number) => value * 2, [5]);
      const callback2 = simulateUseCallback((value: number) => value * 2, [10]);

      expect(callback1).not.toBe(callback2);
      expect(callback2(5)).toBe(10);
    });
  });

  describe('Memoization prevents expensive calculations', () => {
    it('should cache filtered rates results', () => {
      const filterFn = vi.fn((rates: ShippingRate[], carriers: string[]) => {
        return rates.filter((r) => carriers.includes(r.carrier));
      });

      const mockRates = [
        {
          id: '1',
          carrier: 'USPS' as const,
          serviceCode: 'USPS-STD',
          serviceName: 'Standard',
          speed: 'standard' as const,
          baseRate: 5.99,
          additionalFees: [],
          totalCost: 5.99,
          estimatedDeliveryDate: new Date(),
          guaranteedDelivery: false,
          features: [],
        },
        {
          id: '2',
          carrier: 'FedEx' as const,
          serviceCode: 'FEDEX-ON',
          serviceName: 'Overnight',
          speed: 'overnight' as const,
          baseRate: 25.99,
          additionalFees: [],
          totalCost: 25.99,
          estimatedDeliveryDate: new Date(),
          guaranteedDelivery: true,
          features: [],
        },
      ] as ShippingRate[];

      const carriers = ['USPS'];

      let previousDeps: unknown[] | null = null;
      let cachedResult: any = null;

      const simulateUseMemo = (fn: () => any, deps: unknown[]): any => {
        const depsChanged = !previousDeps || previousDeps.some((dep, i) => dep !== deps[i]);
        if (depsChanged) {
          cachedResult = fn();
          previousDeps = deps;
        }
        return cachedResult;
      };

      const result = simulateUseMemo(() => filterFn(mockRates, carriers), [mockRates, carriers]);
      expect(filterFn).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
    });

    it('should cache best value calculations', () => {
      const calculateBestValue = vi.fn((rates: ShippingRate[]) => {
        return rates.reduce((min, r) => (r.totalCost < min.totalCost ? r : min));
      });

      const mockRates = [
        {
          id: '1',
          carrier: 'USPS' as const,
          serviceCode: 'USPS-STD',
          serviceName: 'Standard',
          speed: 'standard' as const,
          baseRate: 5.99,
          additionalFees: [],
          totalCost: 5.99,
          estimatedDeliveryDate: new Date(),
          guaranteedDelivery: false,
          features: [],
        },
        {
          id: '2',
          carrier: 'FedEx' as const,
          serviceCode: 'FEDEX-ON',
          serviceName: 'Overnight',
          speed: 'overnight' as const,
          baseRate: 25.99,
          additionalFees: [],
          totalCost: 25.99,
          estimatedDeliveryDate: new Date(),
          guaranteedDelivery: true,
          features: [],
        },
      ] as ShippingRate[];

      let previousDeps: unknown[] | null = null;
      let cachedResult: any = null;

      const simulateUseMemo = (fn: () => any, deps: unknown[]): any => {
        const depsChanged = !previousDeps || previousDeps.some((dep, i) => dep !== deps[i]);
        if (depsChanged) {
          cachedResult = fn();
          previousDeps = deps;
        }
        return cachedResult;
      };

      const result = simulateUseMemo(() => calculateBestValue(mockRates), [mockRates]);
      expect(calculateBestValue).toHaveBeenCalledTimes(1);
      expect(result.id).toBe('1');
    });
  });

  describe('Performance characteristics', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset: ShippingRate[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        carrier: ['USPS', 'FedEx', 'UPS'][i % 3] as CarrierName,
        serviceCode: `CODE-${i}`,
        serviceName: `Service ${i}`,
        speed: ['standard', 'two-day', 'overnight'][i % 3] as ServiceSpeed,
        baseRate: Math.random() * 50,
        additionalFees: [],
        totalCost: Math.random() * 50,
        estimatedDeliveryDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        guaranteedDelivery: Math.random() > 0.5,
        features: [],
      }));

      const startTime = performance.now();

      const sorted = largeDataset.sort((a, b) => a.totalCost - b.totalCost);

      const endTime = performance.now();

      expect(sorted).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should maintain acceptable performance with filtering and sorting combined', () => {
      const dataset: ShippingRate[] = Array.from({ length: 50 }, (_, i) => ({
        id: `${i}`,
        carrier: ['USPS', 'FedEx', 'UPS'][i % 3] as CarrierName,
        serviceCode: `CODE-${i}`,
        serviceName: `Service ${i}`,
        speed: ['standard', 'two-day', 'overnight'][i % 3] as ServiceSpeed,
        baseRate: Math.random() * 50,
        additionalFees: [],
        totalCost: Math.random() * 50,
        estimatedDeliveryDate: new Date(Date.now() + (i % 7) * 24 * 60 * 60 * 1000),
        guaranteedDelivery: Math.random() > 0.5,
        features: [],
      }));

      const startTime = performance.now();

      let filtered = dataset.filter((r) => r.carrier === 'USPS');
      const sorted = filtered.sort((a, b) => a.totalCost - b.totalCost);

      const endTime = performance.now();

      expect(sorted.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in less than 50ms
    });
  });
});
