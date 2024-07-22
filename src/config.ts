import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
dotenv.config();

/**
 * Interface representing the product details loaded from a file.
 */
interface ProductDetails {
  productId: number;
  description: string;
  manuals: string[];
  specifications: string[];
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  certifications: string;
  warrantyInfo: string;
  materialComposition: string;
  complianceInfo: string;
  ipfs: string;
}

/**
 * Interface defining the configuration methods for the application.
 */
interface Config {
  loadProductDetails: (filePath: string) => ProductDetails;
  getProviderUrl: () => string;
  getPrivateKey: () => string;
  getPinataApiKey: () => string;
  getPinataSecretApiKey: () => string;
  getGasAmount: () => string;
  getGweiBid: () => string;
  getProductPassportAddress: () => string;
  getBatchContractAddress: () => string;
}

/**
 * Loads product details from a JSON file.
 *
 * @param filePath - The path to the product details JSON file. Defaults to 'product-details.json' if not specified.
 * @returns An object containing product details.
 * @throws Error if the file does not exist or cannot be read.
 */
const loadProductDetails = (filePath: string = process.env.PRODUCT_DETAILS_FILE || 'product-details.json'): ProductDetails => {
  const productDetailsPath = path.resolve(__dirname, '..', filePath);

  if (!fs.existsSync(productDetailsPath)) {
    throw new Error(`Product details file not found at ${productDetailsPath}`);
  }

  const productDetails = JSON.parse(fs.readFileSync(productDetailsPath, 'utf-8')) as ProductDetails;
  return productDetails;
};

/**
 * Retrieves the URL of the Ethereum provider from the environment variables.
 *
 * @returns The provider URL as a string.
 */
const getProviderUrl = (): string => {
  return process.env.PROVIDER_URL || '';
};

/**
 * Retrieves the private key for the Ethereum wallet from the environment variables.
 *
 * @returns The private key as a string.
 */
const getPrivateKey = (): string => {
  return process.env.PRIVATE_KEY || '';
};

/**
 * Retrieves the address of the ProductPassport contract from the environment variables.
 *
 * @returns The ProductPassport contract address as a string.
 */
const getProductPassportAddress = (): string => {
  return process.env.PRODUCT_PASSPORT_ADDRESS || ''; 
};

/**
 * Retrieves the address of the Batch contract from the environment variables.
 *
 * @returns The Batch contract address as a string.
 */
const getBatchContractAddress = (): string => {
  return process.env.PRODUCT_PASSPORT_BATCH_ADDRESS || ''; 
};

/**
 * Retrieves the Pinata API key from the environment variables.
 *
 * @returns The Pinata API key as a string.
 */
const getPinataApiKey = (): string => {
  return process.env.PINATA_API_KEY || '';
};

/**
 * Retrieves the Pinata Secret API key from the environment variables.
 *
 * @returns The Pinata Secret API key as a string.
 */
const getPinataSecretApiKey = (): string => {
  return process.env.PINATA_SECRET_API_KEY || '';
};

/**
 * Retrieves the gas amount from the environment variables.
 *
 * @returns The gas amount as a string.
 */
const getGasAmount = (): string => {
  return process.env.GAS_AMOUNT || "254362";
};

/**
 * Retrieves the Gwei bid amount from the environment variables.
 *
 * @returns The Gwei bid amount as a string.
 */
const getGweiBid = (): string => {
  return process.env.GWEI_BID || "3";
};

// Export the Config object with all configuration methods
const Config: Config = {
  loadProductDetails,
  getProviderUrl,
  getPrivateKey,
  getPinataApiKey,
  getPinataSecretApiKey,
  getGasAmount,
  getGweiBid,
  getProductPassportAddress,
  getBatchContractAddress,
};

export default Config;
