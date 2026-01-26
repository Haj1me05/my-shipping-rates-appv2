import { CarrierName } from '@/adapters/carrier-adapters';

/**
 * Carrier credentials and configuration
 */
export interface CarrierCredentials {
  apiKey: string;
  apiSecret?: string;
  accountNumber?: string;
  endpoint: string;
  timeout: number;
}

/**
 * Configuration mapping for all carriers
 */
export interface CarrierConfiguration {
  [key: string]: CarrierCredentials;
}

/**
 * Singleton pattern: Ensures only one instance of configuration exists
 */
export class CarrierConfigManager {
  private static instance: CarrierConfigManager;
  private config: CarrierConfiguration;

  /**
   * Private constructor prevents direct instantiation
   */
  private constructor() {
    this.config = this.loadConfiguration();
  }

  /**
   * Static method to get singleton instance
   */
  public static getInstance(): CarrierConfigManager {
    if (!CarrierConfigManager.instance) {
      CarrierConfigManager.instance = new CarrierConfigManager();
    }
    return CarrierConfigManager.instance;
  }

  /**
   * Get credentials for a specific carrier
   */
  public getCarrierCredentials(carrier: CarrierName): CarrierCredentials {
    const credentials = this.config[carrier];
    if (!credentials) {
      throw new Error(`No credentials configured for carrier: ${carrier}`);
    }
    return credentials;
  }

  /**
   * Get all configured carriers
   */
  public getConfiguredCarriers(): CarrierName[] {
    return Object.keys(this.config) as CarrierName[];
  }

  /**
   * Check if a carrier is configured
   */
  public isCarrierConfigured(carrier: CarrierName): boolean {
    return carrier in this.config;
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfiguration(): CarrierConfiguration {
    return {
      USPS: {
        apiKey: process.env.USPS_API_KEY || 'demo-usps-key',
        endpoint: process.env.USPS_ENDPOINT || 'https://secure.shippingapis.com/ShippingAPI.dll',
        timeout: 30000,
      },
      FedEx: {
        apiKey: process.env.FEDEX_API_KEY || 'demo-fedex-key',
        apiSecret: process.env.FEDEX_API_SECRET || 'demo-fedex-secret',
        accountNumber: process.env.FEDEX_ACCOUNT_NUMBER || '',
        endpoint: process.env.FEDEX_API_BASE_URL || 'https://apis.fedex.com',
        timeout: 30000,
      },
      UPS: {
        apiKey: process.env.UPS_API_KEY || 'demo-ups-key',
        apiSecret: process.env.UPS_API_SECRET || 'demo-ups-secret',
        endpoint: process.env.UPS_ENDPOINT || 'https://onlinetools.ups.com/ship/v2403/rating/Rate',
        timeout: 30000,
      },
    };
  }
}

/**
 * Export singleton instance for application-wide access
 */
export const carrierConfig = CarrierConfigManager.getInstance();
