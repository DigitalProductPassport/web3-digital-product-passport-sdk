import type { BigNumberish } from 'ethers';
import type { ProductPassport as ProductPassportContract } from './contracts/ProductPassport.js';
import type { ComplexManagement as ComplexManagementContract } from './contracts/ComplexManagement.js';
import type { IntegratedProductPassportBatch as BatchContract } from './contracts/ExtendedProductPassport.sol/IntegratedProductPassportBatch.js';

/**
 * A location stored in the Geolocation contract.
 */
export interface GeoLocation {
  latitude: string;
  longitude: string;
  additionalInfo: string;
}

/**
 * A production site ("complex") stored in the ComplexManagement contract.
 */
export interface Complex {
  complexName: string;
  complexCountry: string;
  complexAddress: string;
  complexSiteType: string;
  complexIndustry: string;
  geolocationId: string;
}

/**
 * Input for `ComplexManagement.addComplex`. The complex location is stored in
 * the Geolocation contract under `geolocationId`.
 */
export interface NewComplex extends Complex, GeoLocation {}

/**
 * Input for `ComplexManagement.updateComplex`. The geolocation of a complex cannot be changed.
 */
export type ComplexUpdate = Omit<Complex, 'geolocationId'>;

/**
 * Product data stored in the ProductPassport contract.
 */
export interface ProductData {
  description: string;
  /** IPFS hashes (or URIs) of the product manuals. */
  manuals: string[];
  /** IPFS hashes (or URIs) of the product specifications. */
  specifications: string[];
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  certifications: string;
  warrantyInfo: string;
  /** Addresses of the passports of the materials the product is made of. Must not be empty. */
  materialComposition: string[];
  /** ID of the complex where the product was made. The complex must exist. */
  complexId: string;
}

/**
 * Input for `ProductPassport.updateProduct`. The complex of a product cannot be changed.
 */
export type ProductUpdate = Omit<ProductData, 'complexId'>;

/**
 * A product together with the geolocation of the complex where it was made.
 */
export interface ProductDetails {
  product: ProductData;
  origin: GeoLocation;
}

/**
 * Batch data stored in the IntegratedProductPassportBatch contract.
 */
export interface BatchDetails {
  amount: bigint;
  assemblingTime: bigint;
  transportDetails: string;
  currentGeolocationId: string;
  originGeolocationId: string;
}

/**
 * Input for `IntegratedProductPassportBatch.createBatch`.
 */
export interface NewBatch {
  /** Number of items in the batch. Must be greater than zero. */
  amount: BigNumberish;
  assemblingTime: BigNumberish;
  transportDetails: string;
  /** ID of an existing product. The batch origin is taken from the product's complex. */
  productId: BigNumberish;
}

/**
 * A batch together with its product, complex and locations.
 */
export interface BatchFullDetails {
  batch: BatchDetails;
  product: ProductData;
  complex: Complex;
  currentLocation: GeoLocation;
  originLocation: GeoLocation;
}

type ProductDataOutput = ProductPassportContract.ProductDataStructOutput;
type GeoLocationOutput = {
  latitude: string;
  longitude: string;
  additionalInfo: string;
};
type ComplexOutput = ComplexManagementContract.ComplexStructOutput;
type BatchDetailsOutput = BatchContract.BatchDetailsStructOutput;

// ethers returns read-only Result objects; these helpers turn them into plain objects.

export const toGeoLocation = (geo: GeoLocationOutput): GeoLocation => ({
  latitude: geo.latitude,
  longitude: geo.longitude,
  additionalInfo: geo.additionalInfo,
});

export const toComplex = (complex: ComplexOutput): Complex => ({
  complexName: complex.complexName,
  complexCountry: complex.complexCountry,
  complexAddress: complex.complexAddress,
  complexSiteType: complex.complexSiteType,
  complexIndustry: complex.complexIndustry,
  geolocationId: complex.geolocationId,
});

export const toProductData = (product: ProductDataOutput): ProductData => ({
  description: product.description,
  manuals: Array.from(product.manuals),
  specifications: Array.from(product.specifications),
  batchNumber: product.batchNumber,
  productionDate: product.productionDate,
  expiryDate: product.expiryDate,
  certifications: product.certifications,
  warrantyInfo: product.warrantyInfo,
  materialComposition: Array.from(product.materialComposition),
  complexId: product.complexId,
});

export const toBatchDetails = (batch: BatchDetailsOutput): BatchDetails => ({
  amount: batch.amount,
  assemblingTime: batch.assemblingTime,
  transportDetails: batch.transportDetails,
  currentGeolocationId: batch.currentGeolocationId,
  originGeolocationId: batch.originGeolocationId,
});
