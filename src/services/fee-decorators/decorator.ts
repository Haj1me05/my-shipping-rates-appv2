import { Fee, ShippingOptions } from '@/types/domain';

export interface RateComponent {
  getCost(): number;
  getDescription(): string;
  getFees(): Fee[];
}

export class BaseRate implements RateComponent {
  constructor(
    private baseAmount: number,
    private serviceName: string
  ) {}

  getCost(): number {
    return this.baseAmount;
  }

  getDescription(): string {
    return this.serviceName;
  }

  getFees(): Fee[] {
    return [];
  }
}

export abstract class RateDecorator implements RateComponent {
  constructor(protected component: RateComponent) {}

  getCost(): number {
    return this.component.getCost();
  }

  getDescription(): string {
    return this.component.getDescription();
  }

  getFees(): Fee[] {
    return this.component.getFees();
  }
}

export class InsuranceDecorator extends RateDecorator {
  private insuranceFee: Fee;

  constructor(component: RateComponent, declaredValue: number) {
    super(component);
    this.insuranceFee = this.calculateInsurance(declaredValue);
  }

  getCost(): number {
    return this.component.getCost() + this.insuranceFee.amount;
  }

  getFees(): Fee[] {
    return [...this.component.getFees(), this.insuranceFee];
  }

  private calculateInsurance(declaredValue: number): Fee {
    // $1 per $100 of value, minimum $2.50
    const amount = Math.max(declaredValue / 100, 2.5);
    return {
      type: 'insurance',
      amount: Number.parseFloat(amount.toFixed(2)),
      description: 'Declared Value Insurance',
    };
  }
}

export class SignatureDecorator extends RateDecorator {
  private signatureFee: Fee = {
    type: 'signature',
    amount: 5.5,
    description: 'Signature Required',
  };

  getCost(): number {
    return this.component.getCost() + this.signatureFee.amount;
  }

  getFees(): Fee[] {
    return [...this.component.getFees(), this.signatureFee];
  }
}

export class FragileHandlingDecorator extends RateDecorator {
  private fragileFee: Fee = {
    type: 'other',
    amount: 10.0,
    description: 'Fragile Handling',
  };

  getCost(): number {
    return this.component.getCost() + this.fragileFee.amount;
  }

  getFees(): Fee[] {
    return [...this.component.getFees(), this.fragileFee];
  }
}

export class SaturdayDeliveryDecorator extends RateDecorator {
  private saturdayFee: Fee = {
    type: 'saturdayDelivery',
    amount: 15.0,
    description: 'Saturday Delivery',
  };

  getCost(): number {
    return this.component.getCost() + this.saturdayFee.amount;
  }

  getFees(): Fee[] {
    return [...this.component.getFees(), this.saturdayFee];
  }
}

export function applyFees(baseRate: RateComponent, options: ShippingOptions): RateComponent {
  let decorated = baseRate;

  if (options.declaredValue && options.declaredValue > 0) {
    decorated = new InsuranceDecorator(decorated, options.declaredValue);
  }

  if (options.signatureRequired) {
    decorated = new SignatureDecorator(decorated);
  }

  if (options.fragileHandling) {
    decorated = new FragileHandlingDecorator(decorated);
  }

  if (options.saturdayDeliveryRequired) {
    decorated = new SaturdayDeliveryDecorator(decorated);
  }

  return decorated;
}
