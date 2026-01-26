import { describe, it, expect, beforeEach } from 'vitest';
import {
  BaseRate,
  InsuranceDecorator,
  SignatureDecorator,
  FragileHandlingDecorator,
  SaturdayDeliveryDecorator,
  applyFees,
  RateComponent,
} from '@/services/fee-decorators/decorator';
import type { ShippingOptions } from '@/types/domain';

describe('Decorator Pattern - BaseRate', () => {
  it('should return the base amount as cost', () => {
    const base = new BaseRate(100, 'Standard Service');
    expect(base.getCost()).toBe(100);
  });

  it('should return service name as description', () => {
    const base = new BaseRate(100, 'Priority Mail');
    expect(base.getDescription()).toBe('Priority Mail');
  });

  it('should return empty fees array', () => {
    const base = new BaseRate(100, 'Standard Service');
    expect(base.getFees()).toEqual([]);
  });
});

describe('Decorator Pattern - InsuranceDecorator', () => {
  let baseRate: RateComponent;

  beforeEach(() => {
    baseRate = new BaseRate(100, 'Standard Service');
  });

  it('should add insurance fee to cost', () => {
    const decorated = new InsuranceDecorator(baseRate, 500);
    expect(decorated.getCost()).toBe(105); // 100 + 5 (500/100)
  });

  it('should calculate insurance as $1 per $100 of value', () => {
    const decorated = new InsuranceDecorator(baseRate, 1000);
    expect(decorated.getCost()).toBe(110); // 100 + 10 (1000/100)
  });

  it('should enforce minimum insurance of $2.50', () => {
    const decorated = new InsuranceDecorator(baseRate, 100); // Would be $1
    expect(decorated.getCost()).toBe(102.5); // 100 + 2.5 (minimum)
  });

  it('should include insurance fee in fees array', () => {
    const decorated = new InsuranceDecorator(baseRate, 500);
    const fees = decorated.getFees();
    expect(fees).toHaveLength(1);
    expect(fees[0]).toMatchObject({
      type: 'insurance',
      amount: 5,
      description: 'Declared Value Insurance',
    });
  });

  it('should preserve original description', () => {
    const decorated = new InsuranceDecorator(baseRate, 500);
    expect(decorated.getDescription()).toBe('Standard Service');
  });
});

describe('Decorator Pattern - SignatureDecorator', () => {
  let baseRate: RateComponent;

  beforeEach(() => {
    baseRate = new BaseRate(100, 'Standard Service');
  });

  it('should add fixed $5.50 signature fee', () => {
    const decorated = new SignatureDecorator(baseRate);
    expect(decorated.getCost()).toBe(105.5);
  });

  it('should include signature fee in fees array', () => {
    const decorated = new SignatureDecorator(baseRate);
    const fees = decorated.getFees();
    expect(fees).toHaveLength(1);
    expect(fees[0]).toMatchObject({
      type: 'signature',
      amount: 5.5,
      description: 'Signature Required',
    });
  });

  it('should preserve original description', () => {
    const decorated = new SignatureDecorator(baseRate);
    expect(decorated.getDescription()).toBe('Standard Service');
  });
});

describe('Decorator Pattern - FragileHandlingDecorator', () => {
  let baseRate: RateComponent;

  beforeEach(() => {
    baseRate = new BaseRate(100, 'Standard Service');
  });

  it('should add fixed $10.00 fragile handling fee', () => {
    const decorated = new FragileHandlingDecorator(baseRate);
    expect(decorated.getCost()).toBe(110);
  });

  it('should include fragile handling fee in fees array', () => {
    const decorated = new FragileHandlingDecorator(baseRate);
    const fees = decorated.getFees();
    expect(fees).toHaveLength(1);
    expect(fees[0]).toMatchObject({
      type: 'other',
      amount: 10,
      description: 'Fragile Handling',
    });
  });
});

describe('Decorator Pattern - SaturdayDeliveryDecorator', () => {
  let baseRate: RateComponent;

  beforeEach(() => {
    baseRate = new BaseRate(100, 'Standard Service');
  });

  it('should add fixed $15.00 Saturday delivery fee', () => {
    const decorated = new SaturdayDeliveryDecorator(baseRate);
    expect(decorated.getCost()).toBe(115);
  });

  it('should include Saturday delivery fee in fees array', () => {
    const decorated = new SaturdayDeliveryDecorator(baseRate);
    const fees = decorated.getFees();
    expect(fees).toHaveLength(1);
    expect(fees[0]).toMatchObject({
      type: 'saturdayDelivery',
      amount: 15,
      description: 'Saturday Delivery',
    });
  });
});

describe('Decorator Pattern - Stacking', () => {
  let baseRate: RateComponent;

  beforeEach(() => {
    baseRate = new BaseRate(100, 'Standard Service');
  });

  it('should stack multiple decorators correctly', () => {
    let decorated = baseRate;
    decorated = new InsuranceDecorator(decorated, 500); // +5
    decorated = new SignatureDecorator(decorated); // +5.5
    decorated = new FragileHandlingDecorator(decorated); // +10

    expect(decorated.getCost()).toBe(120.5); // 100 + 5 + 5.5 + 10
  });

  it('should preserve all fees when stacking', () => {
    let decorated = baseRate;
    decorated = new InsuranceDecorator(decorated, 500);
    decorated = new SignatureDecorator(decorated);
    decorated = new FragileHandlingDecorator(decorated);

    const fees = decorated.getFees();
    expect(fees).toHaveLength(3);
    expect(fees.map((f) => f.type)).toEqual(
      expect.arrayContaining(['insurance', 'signature', 'other'])
    );
  });

  it('should not modify original component', () => {
    const originalCost = baseRate.getCost();
    const decorated = new SignatureDecorator(baseRate);

    expect(baseRate.getCost()).toBe(originalCost);
    expect(decorated.getCost()).toBe(originalCost + 5.5);
  });

  it('should stack decorators in any order', () => {
    // Order 1: Insurance -> Signature -> Fragile
    let decorated1: RateComponent = baseRate;
    decorated1 = new InsuranceDecorator(decorated1, 500);
    decorated1 = new SignatureDecorator(decorated1);
    decorated1 = new FragileHandlingDecorator(decorated1);

    // Order 2: Fragile -> Insurance -> Signature
    let decorated2: RateComponent = new BaseRate(100, 'Standard Service');
    decorated2 = new FragileHandlingDecorator(decorated2);
    decorated2 = new InsuranceDecorator(decorated2, 500);
    decorated2 = new SignatureDecorator(decorated2);

    // Both orders should result in same cost
    expect(decorated1.getCost()).toBe(decorated2.getCost());
  });
});

describe('Decorator Pattern - applyFees Helper', () => {
  let baseRate: RateComponent;
  const defaultOptions: ShippingOptions = {
    speed: 'standard',
    signatureRequired: false,
    insurance: false,
    fragileHandling: false,
    saturdayDelivery: false,
  };

  beforeEach(() => {
    baseRate = new BaseRate(100, 'Standard Service');
  });

  it('should apply no fees when all options are false', () => {
    const decorated = applyFees(baseRate, defaultOptions);
    expect(decorated.getCost()).toBe(100);
    expect(decorated.getFees()).toHaveLength(0);
  });

  it('should apply insurance fee when declaredValue is set', () => {
    const options: ShippingOptions = {
      ...defaultOptions,
      declaredValue: 500,
    };
    const decorated = applyFees(baseRate, options);
    expect(decorated.getFees().some((f) => f.type === 'insurance')).toBe(true);
  });

  it('should apply signature fee when signatureRequired is true', () => {
    const options: ShippingOptions = {
      ...defaultOptions,
      signatureRequired: true,
    };
    const decorated = applyFees(baseRate, options);
    expect(decorated.getFees().some((f) => f.type === 'signature')).toBe(true);
  });

  it('should apply fragile handling fee when fragileHandling is true', () => {
    const options: ShippingOptions = {
      ...defaultOptions,
      fragileHandling: true,
    };
    const decorated = applyFees(baseRate, options);
    expect(decorated.getFees().some((f) => f.type === 'other')).toBe(true);
  });

  it('should apply Saturday delivery fee when saturdayDeliveryRequired is true', () => {
    const options: ShippingOptions = {
      ...defaultOptions,
      saturdayDeliveryRequired: true,
    };
    const decorated = applyFees(baseRate, options);
    expect(decorated.getFees().some((f) => f.type === 'saturdayDelivery')).toBe(true);
  });

  it('should apply multiple fees based on options', () => {
    const options: ShippingOptions = {
      speed: 'standard',
      signatureRequired: true,
      insurance: true,
      fragileHandling: true,
      saturdayDelivery: false,
      declaredValue: 500,
      saturdayDeliveryRequired: false,
    };
    const decorated = applyFees(baseRate, options);
    expect(decorated.getFees()).toHaveLength(3);
  });

  it('should calculate correct total cost with multiple fees', () => {
    const options: ShippingOptions = {
      speed: 'standard',
      signatureRequired: true,
      insurance: false,
      fragileHandling: true,
      saturdayDelivery: false,
      saturdayDeliveryRequired: false,
    };
    const decorated = applyFees(baseRate, options);
    // 100 + 5.5 (signature) + 10 (fragile) = 115.5
    expect(decorated.getCost()).toBe(115.5);
  });
});
