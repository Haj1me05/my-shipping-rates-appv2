/**
 * Core Domain Model for Multi-Carrier Shipping Rate Calculator
 * Comprehensive type definitions for the entire shipping domain
 */

// ============================================================================
// Package Information Types
// ============================================================================

/**
 * Represents the physical dimensions of a package
 */
export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
  unit: "in" | "cm";
}

/**
 * Represents the weight of a package
 */
export interface PackageWeight {
  value: number;
  unit: "lbs" | "kg";
}

/**
 * Union type for package types
 */
export type PackageType = "envelope" | "box" | "tube" | "custom";

/**
 * Represents a complete package for shipping
 */
export interface Package {
  id: string;
  dimensions: PackageDimensions;
  weight: PackageWeight;
  type: PackageType;
  declaredValue?: number;
}

// ============================================================================
// Address Information Types
// ============================================================================

/**
 * Represents a complete mailing address
 */
export interface Address {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// ============================================================================
// Shipping Service Options Types
// ============================================================================

/**
 * Union type for shipping service speeds
 */
export type ServiceSpeed = "overnight" | "two-day" | "standard" | "economy";

/**
 * Represents optional shipping services and features
 */
export interface ShippingOptions {
  speed: ServiceSpeed;
  signatureRequired: boolean;
  insurance: boolean;
  fragileHandling: boolean;
  saturdayDelivery: boolean;
  insuredValue?: number;
}

// ============================================================================
// Carrier and Rate Information Types
// ============================================================================

/**
 * Union type for supported carriers
 */
export type CarrierName = "USPS" | "FedEx" | "UPS" | "DHL";

/**
 * Union type for fee categories
 */
export type FeeType =
  | "insurance"
  | "signature"
  | "fragile"
  | "saturdayDelivery";

/**
 * Represents an individual fee component
 */
export interface Fee {
  type: FeeType;
  amount: number;
  description: string;
}

/**
 * Represents a complete shipping rate option from a carrier
 */
export interface ShippingRate {
  id: string;
  carrier: CarrierName;
  serviceCode: string;
  serviceName: string;
  speed: ServiceSpeed;
  features: string[];
  baseRate: number;
  additionalFees: Fee[];
  totalCost: number;
  estimatedDeliveryDate: string;
  guaranteedDelivery: boolean;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Represents a rate calculation request
 */
export interface RateRequest {
  package: Package;
  originAddress: Address;
  destinationAddress: Address;
  options: ShippingOptions;
  carriers?: CarrierName[];
}

/**
 * Represents an error from a carrier
 */
export interface CarrierError {
  carrier: CarrierName;
  message: string;
  recoverable: boolean;
}

/**
 * Represents the response from a rate calculation request
 */
export interface RateResponse {
  requestId: string;
  rates: ShippingRate[];
  errors: CarrierError[];
  timestamp: string;
}

// ============================================================================
// Validation Result Types
// ============================================================================

/**
 * Result of validation operation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Individual validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Carrier configuration for API access
 */
export interface CarrierConfig {
  carrier: CarrierName;
  apiKey: string;
  apiSecret?: string;
  baseUrl: string;
  sandbox: boolean;
  enabled: boolean;
}

/**
 * Application-wide configuration
 */
export interface AppConfig {
  carriers: Record<CarrierName, CarrierConfig>;
  appUrl: string;
  environment: "development" | "staging" | "production";
}

// ============================================================================
// Service Strategy Types
// ============================================================================

/**
 * Interface for rate calculation strategies
 */
export interface RateCalculationStrategy {
  calculateRate(rateRequest: RateRequest): Promise<ShippingRate[]>;
  validateRequest(rateRequest: RateRequest): ValidationResult;
}

/**
 * Interface for rate decorators (adding fees)
 */
export interface RateDecorator {
  decorate(rate: ShippingRate, options: ShippingOptions): ShippingRate;
}

/**
 * Interface for carrier adapters (normalizing external APIs)
 */
export interface CarrierAdapter {
  getCarrier(): CarrierName;
  getRates(request: RateRequest): Promise<ShippingRate[]>;
}
