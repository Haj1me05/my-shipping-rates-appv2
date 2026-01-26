import { CarrierAdapter, RateRequest, UPSRateResponse, CarrierError } from './adapter';
import { ShippingRate, ServiceSpeed } from '@/types/domain';

const UPS_SERVICE_MAP: Record<string, { code: string; name: string }> = {
  '01': { code: 'ups_next_day_air', name: 'UPS Next Day Air' },
  '02': { code: 'ups_2nd_day_air', name: 'UPS 2nd Day Air' },
  '03': { code: 'ups_ground', name: 'UPS Ground' },
  '14': { code: 'ups_overnight', name: 'UPS Overnight' },
};

const UPS_SPEED_MAP: Record<string, ServiceSpeed> = {
  '01': 'overnight',
  '02': 'two-day',
  '03': 'economy',
  '14': 'overnight',
};

export class UPSAdapter implements CarrierAdapter {
  async fetchRates(request: RateRequest): Promise<ShippingRate[]> {
    try {
      const response = await this.callUPSAPI(request);
      return this.adaptUPSResponse(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new CarrierError('UPS', message, true);
    }
  }

  private async callUPSAPI(request: RateRequest): Promise<UPSRateResponse> {
    // Simulate API call with mock data
    await new Promise((resolve) => setTimeout(resolve, 120));

    return {
      RateModels: [
        {
          Shipment: {
            Service: [
              {
                Code: '01',
                Description: 'UPS Next Day Air',
              },
              {
                Code: '02',
                Description: 'UPS 2nd Day Air',
              },
              {
                Code: '03',
                Description: 'UPS Ground',
              },
            ],
            ChargeWeight: {
              Value: request.weight.toString(),
            },
            ShipmentRatingOptions: {
              NegotiatedRateCharges: {
                TotalCharge: {
                  MonetaryValue: '55.50',
                },
              },
            },
            DeliveryTimeInformation: {
              DeliveryTime: 'NEXT_BUSINESS_DAY',
              DeliveryDate: '2026-01-25',
            },
          },
        },
      ],
    };
  }

  private adaptUPSResponse(response: UPSRateResponse): ShippingRate[] {
    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message);
    }

    if (!response.RateModels || response.RateModels.length === 0) {
      return [];
    }

    const rates: ShippingRate[] = [];

    response.RateModels.forEach((model) => {
      if (!model.Shipment?.Service) return;

      model.Shipment.Service.forEach((service) => {
        const baseRate = this.extractBaseRate(model);
        const serviceInfo = UPS_SERVICE_MAP[service.Code] || {
          code: service.Code.toLowerCase(),
          name: service.Description,
        };

        rates.push({
          id: `ups-${serviceInfo.code}-${Date.now()}`,
          carrier: 'UPS',
          serviceCode: serviceInfo.code,
          serviceName: serviceInfo.name,
          speed: UPS_SPEED_MAP[service.Code] || 'standard',
          features: this.extractFeatures(service.Code),
          baseRate,
          additionalFees: [],
          totalCost: baseRate,
          estimatedDeliveryDate: this.calculateDeliveryDate(service.Code),
          guaranteedDelivery: service.Code === '01' || service.Code === '14',
        });
      });
    });

    return rates;
  }

  private extractBaseRate(model: { Shipment?: { ShipmentRatingOptions?: any } }): number {
    const charge =
      model.Shipment?.ShipmentRatingOptions?.NegotiatedRateCharges?.TotalCharge?.MonetaryValue;

    if (charge) {
      return Number.parseFloat(charge);
    }

    return 0;
  }

  private extractFeatures(serviceCode: string): string[] {
    const features: string[] = [];

    if (serviceCode === '01' || serviceCode === '14') {
      features.push('Guaranteed Delivery');
    }

    if (serviceCode === '02') {
      features.push('Standard Delivery');
    }

    if (serviceCode === '03') {
      features.push('Ground Service');
    }

    features.push('Signature Available');

    return features;
  }

  private calculateDeliveryDate(serviceCode: string): Date {
    const today = new Date();
    const daysToAdd: Record<string, number> = {
      '01': 1,
      '02': 2,
      '03': 5,
      '14': 1,
    };

    const days = daysToAdd[serviceCode] || 3;
    const deliveryDate = new Date(today);
    deliveryDate.setDate(deliveryDate.getDate() + days);
    return deliveryDate;
  }

  trackPackage?(_trackingNumber: string): Promise<any> {
    throw new Error('UPS tracking not implemented');
  }
}
