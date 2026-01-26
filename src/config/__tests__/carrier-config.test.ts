import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CarrierConfigManager, carrierConfig } from '@/config/carrier-config';

describe('Singleton Pattern - CarrierConfigManager', () => {
  let originalEnv: typeof process.env;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    // Clear singleton instance for clean tests
    vi.resetModules();
  });

  it('should return same instance on multiple getInstance calls', () => {
    const instance1 = CarrierConfigManager.getInstance();
    const instance2 = CarrierConfigManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should load configuration on instantiation', () => {
    const manager = CarrierConfigManager.getInstance();
    expect(manager).toBeDefined();
  });

  it('should retrieve credentials for USPS carrier', () => {
    const manager = CarrierConfigManager.getInstance();
    const credentials = manager.getCarrierCredentials('USPS');

    expect(credentials).toHaveProperty('apiKey');
    expect(credentials).toHaveProperty('endpoint');
    expect(credentials).toHaveProperty('timeout');
    expect(credentials.timeout).toBe(30000);
  });

  it('should retrieve credentials for FedEx carrier', () => {
    const manager = CarrierConfigManager.getInstance();
    const credentials = manager.getCarrierCredentials('FedEx');

    expect(credentials).toHaveProperty('apiKey');
    expect(credentials).toHaveProperty('apiSecret');
    expect(credentials).toHaveProperty('endpoint');
    expect(credentials).toHaveProperty('timeout');
  });

  it('should retrieve credentials for UPS carrier', () => {
    const manager = CarrierConfigManager.getInstance();
    const credentials = manager.getCarrierCredentials('UPS');

    expect(credentials).toHaveProperty('apiKey');
    expect(credentials).toHaveProperty('apiSecret');
    expect(credentials).toHaveProperty('endpoint');
    expect(credentials).toHaveProperty('timeout');
  });

  it('should throw error for unknown carrier', () => {
    const manager = CarrierConfigManager.getInstance();
    expect(() => manager.getCarrierCredentials('DHL' as any)).toThrow(
      'No credentials configured for carrier: DHL'
    );
  });

  it('should return list of configured carriers', () => {
    const manager = CarrierConfigManager.getInstance();
    const carriers = manager.getConfiguredCarriers();

    expect(carriers).toContain('USPS');
    expect(carriers).toContain('FedEx');
    expect(carriers).toContain('UPS');
  });

  it('should check if carrier is configured', () => {
    const manager = CarrierConfigManager.getInstance();

    expect(manager.isCarrierConfigured('USPS')).toBe(true);
    expect(manager.isCarrierConfigured('FedEx')).toBe(true);
    expect(manager.isCarrierConfigured('UPS')).toBe(true);
    expect(manager.isCarrierConfigured('DHL' as any)).toBe(false);
  });

  it('should load configuration from environment variables', () => {
    process.env.USPS_API_KEY = 'custom-usps-key';
    process.env.USPS_ENDPOINT = 'https://custom-endpoint.com';

    const newManager = new (CarrierConfigManager as any)();
    const credentials = newManager.getCarrierCredentials('USPS');

    expect(credentials.apiKey).toBe('custom-usps-key');
    expect(credentials.endpoint).toBe('https://custom-endpoint.com');
  });

  it('should use default values when environment variables not set', () => {
    delete process.env.FEDEX_API_KEY;
    delete process.env.FEDEX_ENDPOINT;

    const manager = CarrierConfigManager.getInstance();
    const credentials = manager.getCarrierCredentials('FedEx');

    expect(credentials.apiKey).toBe('demo-fedex-key');
    expect(credentials.endpoint).toBe('https://apis.fedex.com/rate/v1/rates/quotes');
  });

  it('should provide singleton export for application-wide access', () => {
    expect(carrierConfig).toBeDefined();
    expect(carrierConfig).toBeInstanceOf(CarrierConfigManager);
  });

  it('should maintain configuration consistency across access patterns', () => {
    const manager = CarrierConfigManager.getInstance();
    const credentials1 = manager.getCarrierCredentials('USPS');

    // Access through export
    const credentials2 = carrierConfig.getCarrierCredentials('USPS');

    expect(credentials1.apiKey).toBe(credentials2.apiKey);
    expect(credentials1.endpoint).toBe(credentials2.endpoint);
  });

  it('should handle missing credentials gracefully', () => {
    const manager = CarrierConfigManager.getInstance();

    expect(() => {
      manager.getCarrierCredentials('InvalidCarrier' as any);
    }).toThrow();
  });

  it('should provide all required credential properties', () => {
    const manager = CarrierConfigManager.getInstance();

    ['USPS', 'FedEx', 'UPS'].forEach((carrier) => {
      const credentials = manager.getCarrierCredentials(carrier as any);

      expect(credentials).toHaveProperty('apiKey');
      expect(credentials).toHaveProperty('endpoint');
      expect(credentials).toHaveProperty('timeout');
      expect(typeof credentials.apiKey).toBe('string');
      expect(typeof credentials.endpoint).toBe('string');
      expect(typeof credentials.timeout).toBe('number');
    });
  });
});
