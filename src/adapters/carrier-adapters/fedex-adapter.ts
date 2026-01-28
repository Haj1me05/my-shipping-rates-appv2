import {
  CarrierAdapter,
  RateRequest,
  FedExRateResponse,
  FedExRateReplyDetail,
  FedExRatedShipment,
  FedExSurcharge,
  CarrierError,
} from './adapter';
import { ShippingRate, ServiceSpeed, Fee } from '@/types/domain';
import { CarrierConfigManager } from '@/config/carrier-config';

const FEDEX_SPEED_MAP: Record<string, ServiceSpeed> = {
  INTERNATIONAL_FIRST: 'overnight',
  PRIORITY_OVERNIGHT: 'overnight',
  FIRST_OVERNIGHT: 'overnight',
  INTERNATIONAL_PRIORITY: 'two-day',
  FEDEX_2_DAY: 'two-day',
  INTERNATIONAL_ECONOMY: 'standard',
  FEDEX_EXPRESS_SAVER: 'standard',
  FEDEX_GROUND: 'economy',
  GROUND_HOME_DELIVERY: 'economy',
};

/**
 * Detect country code from postal code format
 */
function detectCountryFromPostalCode(postalCode: string): string {
  // Trim whitespace to handle user input inconsistencies
  const trimmed = postalCode.trim();

  // US ZIP: 5 digits or 5+4 format (12345 or 12345-6789)
  if (/^\d{5}(-\d{4})?$/.test(trimmed)) {
    return 'US';
  }

  // UK postcode: Alphanumeric with pattern like SW1A 1AA or B33 8TH
  if (/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(trimmed)) {
    return 'GB';
  }

  // Default to US if unable to determine
  return 'US';
}

/**
 * Convert region/state names to FedEx-compatible 2-character codes
 * FedEx API requires exactly 2 characters for stateOrProvinceCode
 * Handles:
 * - US states: Already 2-char, converted to uppercase
 * - UK regions: Full names (England, Scotland, Wales, Northern Ireland) → 2-char codes
 */
function convertStateToFedExCode(state: string, countryCode: string): string {
  if (!state) {
    return '';
  }

  const trimmed = state.trim();

  // If already 2 characters (US states), return as uppercase
  if (trimmed.length === 2) {
    return trimmed.toUpperCase();
  }

  // Map UK region names to 2-character codes
  const ukRegionMap: Record<string, string> = {
    England: 'EN',
    Scotland: 'SC',
    Wales: 'WA',
    'Northern Ireland': 'NI',
  };

  // UK region handling
  if (countryCode === 'GB') {
    const code = ukRegionMap[trimmed];
    if (code) {
      return code;
    }
    // If not found in map, default to EN
    return 'EN';
  }

  // US state handling - take first 2 characters and uppercase
  if (countryCode === 'US') {
    return trimmed.substring(0, 2).toUpperCase();
  }

  // Generic fallback
  return trimmed.substring(0, 2).toUpperCase();
}

export class FedExAdapter implements CarrierAdapter {
  async fetchRates(request: RateRequest): Promise<ShippingRate[]> {
    try {
      const response = await this.callFedExAPI(request);
      if (response.output.alerts) {
        this.handleAlerts(response.output.alerts);
      }
      return response.output.rateReplyDetails.map((detail) => this.adaptFedExRate(detail));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new CarrierError('FedEx', message, true);
    }
  }

  private async callFedExAPI(request: RateRequest): Promise<FedExRateResponse> {
    const credentials = CarrierConfigManager.getInstance().getCarrierCredentials('FedEx');

    // Validate that we have real credentials (not demo)
    if (credentials.apiKey === 'demo-fedex-key' || credentials.apiSecret === 'demo-fedex-secret') {
      console.warn(
        '[FedEx] Using demo credentials. Set FEDEX_API_KEY and FEDEX_API_SECRET in .env for real rates.'
      );
      // Fall back to mock data for demo purposes
      // Detect countries from postal codes for proper mock data
      const originCountry = detectCountryFromPostalCode(request.originZipCode.trim());
      const destinationCountry = detectCountryFromPostalCode(request.destinationZipCode.trim());
      return this.getMockRates(originCountry, destinationCountry);
    }

    // Trim postal codes and detect country codes (before try block so they're accessible in catch)
    const originZipCode = request.originZipCode.trim();
    const destinationZipCode = request.destinationZipCode.trim();
    const originCountry = detectCountryFromPostalCode(originZipCode);
    const destinationCountry = detectCountryFromPostalCode(destinationZipCode);

    try {
      // Get authentication token first
      const token = await this.getAuthToken(credentials);

      // Build FedEx Rate Quote API request payload
      const payload: any = {
        accountNumber: {
          value: credentials.accountNumber || credentials.apiKey,
        },
        requestedShipment: {
          shipper: {
            address: {
              streetLines: [request.originAddress?.street1 || ''],
              city: request.originAddress?.city || '',
              stateOrProvinceCode: convertStateToFedExCode(
                request.originAddress?.state || '',
                originCountry
              ),
              postalCode: originZipCode,
              countryCode: originCountry,
            },
          },
          recipient: {
            address: {
              streetLines: [request.destinationAddress?.street1 || ''],
              city: request.destinationAddress?.city || '',
              stateOrProvinceCode: convertStateToFedExCode(
                request.destinationAddress?.state || '',
                destinationCountry
              ),
              postalCode: destinationZipCode,
              countryCode: destinationCountry,
            },
          },
          // Use DROPOFF_AT_FEDEX_LOCATION for all routes (including GB domestic)
          pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
          shipDateStamp: new Date().toISOString().split('T')[0],
          // Don't specify serviceType - let FedEx return all available services for the route
          // This allows the API to determine valid service options based on origin/destination
          // Use YOUR_PACKAGING for all routes - FEDEX_BOX causes SERVICE.PACKAGECOMBINATION.INVALID errors
          packagingType: 'YOUR_PACKAGING',
          rateRequestType: ['ACCOUNT', 'LIST'],
          requestedPackageLineItems: [
            {
              weight: {
                // Use LB for all routes (consistent with IN dimensions)
                units: 'LB',
                value: this.convertToLbs(request.weight),
              },
              // Include dimensions for all routes (in inches)
              ...(request.dimensions && {
                dimensions: {
                  length: Math.ceil(request.dimensions.length),
                  width: Math.ceil(request.dimensions.width),
                  height: Math.ceil(request.dimensions.height),
                  units: 'IN',
                },
              }),
              groupPackageCount: 1,
            },
          ],
        },
      };

      const rateQuoteEndpoint = `${credentials.endpoint}/rate/v1/rates/quotes`;

      console.log('[FedEx] Calling real FedEx Rate Quote API');
      console.log('[FedEx] Environment: Sandbox');
      console.log('[FedEx] Endpoint:', rateQuoteEndpoint);
      console.log('[FedEx] Account Number:', credentials.accountNumber);
      console.log('[FedEx] ===== ROUTE INFORMATION =====');
      console.log('[FedEx] Route: ' + originCountry + ' → ' + destinationCountry);
      console.log('[FedEx] Origin: ' + originZipCode + ' (' + originCountry + ')');
      console.log('[FedEx] Destination: ' + destinationZipCode + ' (' + destinationCountry + ')');
      console.log('[FedEx] Pickup Type: DROPOFF_AT_FEDEX_LOCATION (all routes)');
      console.log(
        '[FedEx] Service Type: NOT SPECIFIED - FedEx will return all applicable services'
      );
      console.log('[FedEx] Weight:', `${this.convertToLbs(request.weight)} lbs`);
      console.log('[FedEx] ==============================');
      console.log('[FedEx] Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(rateQuoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-locale': 'en_US',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[FedEx] API error response:', errorData);
        throw new Error(`FedEx API error: ${response.status} ${response.statusText}`);
      }

      const data: FedExRateResponse = await response.json();
      console.log('[FedEx] Received rates:', data.output?.rateReplyDetails?.length ?? 0);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[FedEx] API call failed:', message);
      // Fall back to mock rates on error
      console.log('[FedEx] Falling back to mock rates due to error');
      return this.getMockRates(originCountry, destinationCountry);
    }
  }

  private async getAuthToken(credentials: any): Promise<string> {
    if (credentials.token) {
      console.log('[FedEx] Using static token from environment');
      return credentials.token;
    }
    // FedEx uses OAuth 2.0 - exchange credentials for access token
    const baseUrl = credentials.endpoint || 'https://apis-sandbox.fedex.com';
    const authUrl = `${baseUrl}/oauth/token`;

    const authPayload = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: credentials.apiKey,
      client_secret: credentials.apiSecret,
    });

    try {
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: authPayload.toString(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[FedEx] Auth error:', errorData);
        throw new Error(`FedEx authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[FedEx] Authentication successful');
      return data.access_token;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[FedEx] Failed to obtain auth token:', message);
      throw error;
    }
  }

  private convertToLbs(weight: number): number {
    // Assuming input weight is in the unit from request
    // For now, assume it's already in lbs, but you may need to adjust based on actual request units
    return Math.round(weight * 100) / 100;
  }

  private getMockRates(originCountry?: string, destinationCountry?: string): FedExRateResponse {
    // Check if this is a UK domestic (GB→GB) shipment
    const isUKDomestic = originCountry === 'GB' && destinationCountry === 'GB';

    if (isUKDomestic) {
      // UK domestic mock rates with realistic UK services and GBP pricing
      return {
        output: {
          rateReplyDetails: [
            {
              serviceType: 'FEDEX_UK_PRIORITY',
              serviceName: 'FedEx UK Priority',
              serviceDescription: { code: 'UK1' },
              ratedShipmentDetails: [
                {
                  rateType: 'ACCOUNT',
                  totalBaseCharge: 12.99,
                  totalNetCharge: 15.49,
                  currency: 'GBP',
                  shipmentRateDetail: {
                    surCharges: [
                      {
                        type: 'FUEL',
                        description: 'Fuel Surcharge',
                        amount: 2.5,
                      },
                    ],
                  },
                },
              ],
              operationalDetail: {
                transitTime: 'ONE_DAY',
                ineligibleForMoneyBackGuarantee: false,
              },
              commit: {
                dateDetail: { dayCxsFormat: '2026-01-28T18:00:00' },
              },
            },
            {
              serviceType: 'FEDEX_UK_STANDARD',
              serviceName: 'FedEx UK Standard',
              serviceDescription: { code: 'UK2' },
              ratedShipmentDetails: [
                {
                  rateType: 'ACCOUNT',
                  totalBaseCharge: 8.99,
                  totalNetCharge: 10.79,
                  currency: 'GBP',
                  shipmentRateDetail: {
                    surCharges: [
                      {
                        type: 'FUEL',
                        description: 'Fuel Surcharge',
                        amount: 1.8,
                      },
                    ],
                  },
                },
              ],
              operationalDetail: {
                transitTime: 'TWO_DAYS',
                ineligibleForMoneyBackGuarantee: false,
              },
              commit: {
                dateDetail: { dayCxsFormat: '2026-01-29T23:59:00' },
              },
            },
            {
              serviceType: 'FEDEX_UK_ECONOMY',
              serviceName: 'FedEx UK Economy',
              serviceDescription: { code: 'UK3' },
              ratedShipmentDetails: [
                {
                  rateType: 'ACCOUNT',
                  totalBaseCharge: 5.99,
                  totalNetCharge: 7.19,
                  currency: 'GBP',
                  shipmentRateDetail: {
                    surCharges: [
                      {
                        type: 'FUEL',
                        description: 'Fuel Surcharge',
                        amount: 1.2,
                      },
                    ],
                  },
                },
              ],
              operationalDetail: {
                transitTime: 'THREE_DAYS',
                ineligibleForMoneyBackGuarantee: true,
              },
              commit: {
                dateDetail: { dayCxsFormat: '2026-01-30T23:59:00' },
              },
            },
          ],
        },
      };
    }

    // Default mock data for US and international routes
    return {
      output: {
        rateReplyDetails: [
          {
            serviceType: 'FEDEX_GROUND',
            serviceName: 'FedEx Ground',
            serviceDescription: { code: '90' },
            ratedShipmentDetails: [
              {
                rateType: 'ACCOUNT',
                totalBaseCharge: 48.75,
                totalNetCharge: 52.5,
                shipmentRateDetail: {
                  surCharges: [
                    {
                      type: 'FUEL',
                      description: 'Fuel Surcharge',
                      amount: 3.75,
                    },
                  ],
                },
              },
            ],
            operationalDetail: {
              transitTime: 'FIVE_DAYS',
              ineligibleForMoneyBackGuarantee: false,
            },
            commit: {
              dateDetail: { dayCxsFormat: '2026-02-03T23:59:00' },
            },
          },
          {
            serviceType: 'INTERNATIONAL_PRIORITY',
            serviceName: 'FedEx International Priority',
            serviceDescription: { code: '01' },
            ratedShipmentDetails: [
              {
                rateType: 'ACCOUNT',
                totalBaseCharge: 125.5,
                totalNetCharge: 138.75,
                shipmentRateDetail: {
                  surCharges: [
                    {
                      type: 'FUEL',
                      description: 'Fuel Surcharge',
                      amount: 13.25,
                    },
                  ],
                },
              },
            ],
            operationalDetail: {
              transitTime: 'TWO_DAYS',
              ineligibleForMoneyBackGuarantee: false,
            },
            commit: {
              dateDetail: { dayCxsFormat: '2026-01-29T10:30:00' },
            },
          },
          {
            serviceType: 'INTERNATIONAL_ECONOMY',
            serviceName: 'FedEx International Economy',
            serviceDescription: { code: '03' },
            ratedShipmentDetails: [
              {
                rateType: 'ACCOUNT',
                totalBaseCharge: 75.25,
                totalNetCharge: 83.1,
                shipmentRateDetail: {
                  surCharges: [
                    {
                      type: 'FUEL',
                      description: 'Fuel Surcharge',
                      amount: 7.85,
                    },
                  ],
                },
              },
            ],
            operationalDetail: {
              transitTime: 'FOUR_DAYS',
              ineligibleForMoneyBackGuarantee: false,
            },
            commit: {
              dateDetail: { dayCxsFormat: '2026-02-02T23:59:00' },
            },
          },
        ],
      },
    };
  }

  private selectRate(details: FedExRatedShipment[]): FedExRatedShipment {
    return (
      details.find((d) => d.rateType === 'ACCOUNT') ??
      details.find((d) => d.rateType === 'LIST') ??
      details[0]
    );
  }

  private extractFeatures(detail: FedExRateReplyDetail): string[] {
    const features: string[] = [];

    if (detail.signatureOptionType && detail.signatureOptionType !== 'SERVICE_DEFAULT') {
      features.push('Signature Required');
    }

    if (detail.operationalDetail?.deliveryDay) {
      features.push(`Delivers ${detail.operationalDetail.deliveryDay}`);
    }

    if (detail.operationalDetail?.transitTime) {
      features.push(this.formatTransitTime(detail.operationalDetail.transitTime));
    }

    if (!detail.operationalDetail?.ineligibleForMoneyBackGuarantee) {
      features.push('Money-Back Guarantee');
    }

    return features;
  }

  private formatTransitTime(transitTime: string): string {
    const timeMap: Record<string, string> = {
      ONE_DAY: '1 Day',
      TWO_DAYS: '2 Days',
      THREE_DAYS: '3 Days',
      FOUR_DAYS: '4 Days',
      FIVE_DAYS: '5 Days',
    };
    return timeMap[transitTime] || transitTime;
  }

  private mapSurchargeToFee(surcharge: FedExSurcharge): Fee {
    return {
      type: this.mapSurchargeType(surcharge.type),
      amount: surcharge.amount,
      description: surcharge.description,
    };
  }

  private mapSurchargeType(
    type: string
  ): 'fuel' | 'signature' | 'insurance' | 'saturdayDelivery' | 'other' {
    const typeMap: Record<
      string,
      'fuel' | 'signature' | 'insurance' | 'saturdayDelivery' | 'other'
    > = {
      FUEL: 'fuel',
      RESIDENTIAL_DELIVERY: 'other',
      SIGNATURE_OPTION: 'signature',
      DECLARED_VALUE: 'insurance',
      SATURDAY_DELIVERY: 'saturdayDelivery',
    };
    return typeMap[type] || 'other';
  }

  private parseDeliveryDate(detail: FedExRateReplyDetail): Date {
    if (detail.commit?.dateDetail?.dayCxsFormat) {
      return new Date(detail.commit.dateDetail.dayCxsFormat);
    }

    if (detail.operationalDetail?.commitDate) {
      return new Date(detail.operationalDetail.commitDate);
    }

    // Calculate from transit time if available
    return this.calculateFromTransitTime(detail.operationalDetail?.transitTime);
  }

  private calculateFromTransitTime(transitTime?: string): Date {
    const today = new Date();
    const daysMap: Record<string, number> = {
      ONE_DAY: 1,
      TWO_DAYS: 2,
      THREE_DAYS: 3,
      FOUR_DAYS: 4,
      FIVE_DAYS: 5,
    };

    const days = transitTime ? (daysMap[transitTime] ?? 3) : 3;
    const deliveryDate = new Date(today);
    deliveryDate.setDate(deliveryDate.getDate() + days);
    return deliveryDate;
  }

  private handleAlerts(alerts: Array<{ code: string; message: string; alertType: string }>): void {
    const errors = alerts.filter((a) => a.alertType === 'ERROR');
    if (errors.length > 0) {
      throw new CarrierError('FedEx', errors[0].message, false);
    }

    alerts
      .filter((a) => a.alertType === 'WARNING')
      .forEach((a) => console.warn(`FedEx: ${a.message}`));
  }

  private adaptFedExRate(detail: FedExRateReplyDetail): ShippingRate {
    const rateDetail = this.selectRate(detail.ratedShipmentDetails);
    const deliveryDate = this.parseDeliveryDate(detail);

    return {
      id: `fedex-${detail.serviceType}-${Date.now()}`,
      carrier: 'FedEx',
      serviceCode: detail.serviceDescription.code,
      serviceName: detail.serviceName,
      speed: FEDEX_SPEED_MAP[detail.serviceType] ?? 'standard',
      features: this.extractFeatures(detail),
      baseRate: rateDetail.totalBaseCharge,
      additionalFees:
        rateDetail.shipmentRateDetail?.surCharges?.map((s) => this.mapSurchargeToFee(s)) ?? [],
      totalCost: rateDetail.totalNetCharge,
      estimatedDeliveryDate: deliveryDate,
      guaranteedDelivery: !detail.operationalDetail?.ineligibleForMoneyBackGuarantee,
    };
  }

  trackPackage?(_trackingNumber: string): Promise<any> {
    throw new Error('FedEx tracking not implemented');
  }
}
