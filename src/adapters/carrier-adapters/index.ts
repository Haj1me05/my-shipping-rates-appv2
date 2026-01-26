import { CarrierAdapter } from './adapter';
import { USPSAdapter } from './usps-adapter';
import { FedExAdapter } from './fedex-adapter';
import { UPSAdapter } from './ups-adapter';

export type CarrierName = 'USPS' | 'FedEx' | 'UPS';

const adapters: Record<CarrierName, CarrierAdapter> = {
  USPS: new USPSAdapter(),
  FedEx: new FedExAdapter(),
  UPS: new UPSAdapter(),
};

export function getCarrierAdapter(carrier: CarrierName): CarrierAdapter {
  const adapter = adapters[carrier];
  if (!adapter) {
    throw new Error(`Unknown carrier: ${carrier}`);
  }
  return adapter;
}

export function getAvailableCarriers(): CarrierName[] {
  return Object.keys(adapters) as CarrierName[];
}
