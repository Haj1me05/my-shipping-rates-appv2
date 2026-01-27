import { CarrierAdapter, RateRequest, USPSAPIResponse, CarrierError } from './adapter';
import { ShippingRate, ServiceSpeed } from '@/types/domain';

const USPS_SERVICE_MAP: Record<string, { code: string; name: string }> = {
  PRIORITY_MAIL: { code: 'priority', name: 'Priority Mail' },
  PRIORITY_MAIL_EXPRESS: { code: 'express', name: 'Priority Mail Express' },
  GROUND_ADVANTAGE: { code: 'ground', name: 'Ground Advantage' },
  MEDIA_MAIL: { code: 'media', name: 'Media Mail' },
};

const USPS_SPEED_MAP: Record<string, ServiceSpeed> = {
  PRIORITY_MAIL: 'two-day',
  PRIORITY_MAIL_EXPRESS: 'overnight',
  GROUND_ADVANTAGE: 'economy',
  MEDIA_MAIL: 'economy',
};

export class USPSAdapter implements CarrierAdapter {
  async fetchRates(request: RateRequest): Promise<ShippingRate[]> {
    try {
      const response = await this.callUSPSAPI(request);
      return this.adaptUSPSResponse(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new CarrierError('USPS', message, true);
    }
  }

  private async callUSPSAPI(_request: RateRequest): Promise<USPSAPIResponse> {
    // Simulate API call with mock data
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Mock response for demonstration
    // COMMENTED OUT - USPS rates disabled to test FedEx only
    /*
    return {
      RateV4Response: {
        Package: {
          Postage: [
            {
              MailService: 'PRIORITY_MAIL',
              Rate: '28.95',
            },
            {
              MailService: 'PRIORITY_MAIL_EXPRESS',
              Rate: '45.50',
            },
            {
              MailService: 'GROUND_ADVANTAGE',
              Rate: '12.50',
            },
          ],
        },
      },
    };
    */

    // Return empty response since USPS is disabled
    return {
      RateV4Response: {
        Package: {
          Postage: [],
        },
      },
    };
  }

  private adaptUSPSResponse(response: USPSAPIResponse): ShippingRate[] {
    const postage = response.RateV4Response?.Package?.Postage;

    if (!postage || !Array.isArray(postage)) {
      return [];
    }

    return postage
      .filter((item): item is typeof item & { MailService: string; Rate: string } =>
        Boolean(item.MailService && item.Rate)
      )
      .map((item) => this.transformToShippingRate(item));
  }

  private transformToShippingRate(postage: { MailService: string; Rate: string }): ShippingRate {
    const serviceInfo = USPS_SERVICE_MAP[postage.MailService] || {
      code: postage.MailService.toLowerCase(),
      name: postage.MailService,
    };

    const baseRate = Number.parseFloat(postage.Rate);
    const estimatedDeliveryDate = this.calculateDeliveryDate(postage.MailService);

    return {
      id: `usps-${serviceInfo.code}-${Date.now()}`,
      carrier: 'USPS',
      serviceCode: serviceInfo.code,
      serviceName: serviceInfo.name,
      speed: USPS_SPEED_MAP[postage.MailService] || 'standard',
      features: this.extractFeatures(postage.MailService),
      baseRate,
      additionalFees: [],
      totalCost: baseRate,
      estimatedDeliveryDate,
      guaranteedDelivery: postage.MailService === 'PRIORITY_MAIL_EXPRESS',
    };
  }

  private extractFeatures(serviceType: string): string[] {
    const features: string[] = [];

    if (serviceType === 'PRIORITY_MAIL_EXPRESS') {
      features.push('Guaranteed Delivery');
      features.push('Money-Back Guarantee');
    }

    if (serviceType === 'PRIORITY_MAIL') {
      features.push('Signature Available');
    }

    return features;
  }

  private calculateDeliveryDate(serviceType: string): Date {
    const today = new Date();
    const daysToAdd: Record<string, number> = {
      PRIORITY_MAIL_EXPRESS: 1,
      PRIORITY_MAIL: 2,
      GROUND_ADVANTAGE: 5,
      MEDIA_MAIL: 7,
    };

    const days = daysToAdd[serviceType] || 3;
    const deliveryDate = new Date(today);
    deliveryDate.setDate(deliveryDate.getDate() + days);
    return deliveryDate;
  }

  trackPackage?(_trackingNumber: string): Promise<any> {
    throw new Error('USPS tracking not implemented');
  }
}
