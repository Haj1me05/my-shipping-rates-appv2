import { ShippingRate, TrackingInfo } from '@/types/domain';

export interface RateRequest {
  originZipCode: string;
  destinationZipCode: string;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  declaredValue?: number;
  serviceType?: 'overnight' | 'two-day' | 'standard' | 'economy';
  insuranceRequired?: boolean;
  signatureRequired?: boolean;
  saturdayDeliveryRequired?: boolean;
}

export interface TrackingRequest {
  trackingNumber: string;
}

export interface CarrierAdapter {
  fetchRates(request: RateRequest): Promise<ShippingRate[]>;
  trackPackage?(trackingNumber: string): Promise<TrackingInfo>;
}

// USPS API Response Types
export interface USPSAPIResponse {
  RateV4Response?: {
    Package?: {
      Postage?: Array<{
        MailService: string;
        Rate: string;
        ClassID?: string;
      }>;
      Error?: {
        Description: string;
      };
    };
  };
}

// FedEx API Response Types
export interface FedExRateResponse {
  output: {
    rateReplyDetails: FedExRateReplyDetail[];
    alerts?: FedExAlert[];
  };
}

export interface FedExRateReplyDetail {
  serviceType: string;
  serviceName: string;
  serviceDescription: {
    code: string;
    names?: string[];
  };
  signatureOptionType?: string;
  operationalDetail?: {
    deliveryDay?: string;
    transitTime?: string;
    ineligibleForMoneyBackGuarantee?: boolean;
    commitDate?: string;
  };
  ratedShipmentDetails: FedExRatedShipment[];
  commit?: {
    dateDetail?: {
      dayCxsFormat?: string;
    };
  };
}

export interface FedExRatedShipment {
  rateType: string;
  totalBaseCharge: number;
  totalNetCharge: number;
  shipmentRateDetail?: {
    surCharges?: FedExSurcharge[];
  };
}

export interface FedExSurcharge {
  type: string;
  description: string;
  amount: number;
}

export interface FedExAlert {
  code: string;
  message: string;
  alertType: 'NOTE' | 'WARNING' | 'ERROR';
}

// UPS API Response Types
export interface UPSRateResponse {
  RateModels?: UPSRateModel[];
  errors?: Array<{
    code: string;
    message: string;
  }>;
}

export interface UPSRateModel {
  Shipment?: {
    ShipmentRatingOptions?: {
      NegotiatedRateCharges?: {
        TotalCharge?: {
          MonetaryValue: string;
        };
      };
    };
    Service?: Array<{
      Code: string;
      Description: string;
    }>;
    ChargeWeight?: {
      Value: string;
    };
    DeliveryTimeInformation?: {
      DeliveryTime?: string;
      DeliveryDate?: string;
    };
  };
}

export class CarrierError extends Error {
  constructor(
    readonly carrier: string,
    readonly message: string,
    readonly recoverable: boolean
  ) {
    super(message);
    this.name = 'CarrierError';
  }
}
