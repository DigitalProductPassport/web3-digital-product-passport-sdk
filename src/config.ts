import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import type { ProductData } from './types.js';
dotenv.config({ quiet: true });

/**
 * Product details loaded from a JSON file, ready to be passed to `ProductPassports.createProduct`.
 */
export interface ProductDefinition extends ProductData {
  productId: number;
}

/**
 * Interface defining the configuration methods for the application.
 */
interface Config {
  loadProductDetails: (filePath?: string) => ProductDefinition;
  getProviderUrl: () => string;
  getPrivateKey: () => string;
  getPinataApiKey: () => string;
  getPinataSecretApiKey: () => string;
  getGasAmount: () => string;
  getGweiBid: () => string;
  getProductPassportAddress: () => string;
  getBatchContractAddress: () => string;
  getGeolocationAddress: () => string;
  getComplexManagementAddress: () => string;
  createSigner: (privateKey?: string, providerUrl?: string) => ethers.Wallet;
}

/**
 * Loads product details from a JSON file.
 *
 * @param filePath - The path to the product details JSON file, relative to the current working
 *                   directory. Defaults to `PRODUCT_DETAILS_FILE` or 'product-details.json'.
 * @returns An object containing product details.
 * @throws Error if the file does not exist or cannot be read.
 */
const loadProductDetails = (
  filePath: string = process.env.PRODUCT_DETAILS_FILE || 'product-details.json',
): ProductDefinition => {
  const productDetailsPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(productDetailsPath)) {
    throw new Error(`Product details file not found at ${productDetailsPath}`);
  }

  return JSON.parse(
    fs.readFileSync(productDetailsPath, 'utf-8'),
  ) as ProductDefinition;
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
 * Retrieves the address of the IntegratedProductPassportBatch contract from the environment variables.
 *
 * @returns The batch contract address as a string.
 */
const getBatchContractAddress = (): string => {
  return process.env.PRODUCT_PASSPORT_BATCH_ADDRESS || '';
};

/**
 * Retrieves the address of the Geolocation contract from the environment variables.
 *
 * @returns The Geolocation contract address as a string.
 */
const getGeolocationAddress = (): string => {
  return process.env.GEOLOCATION_ADDRESS || '';
};

/**
 * Retrieves the address of the ComplexManagement contract from the environment variables.
 *
 * @returns The ComplexManagement contract address as a string.
 */
const getComplexManagementAddress = (): string => {
  return process.env.COMPLEX_MANAGEMENT_ADDRESS || '';
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
  return process.env.GAS_AMOUNT || '254362';
};

/**
 * Retrieves the Gwei bid amount from the environment variables.
 *
 * @returns The Gwei bid amount as a string.
 */
const getGweiBid = (): string => {
  return process.env.GWEI_BID || '3';
};

/**
 * Creates a wallet connected to a JSON-RPC provider.
 *
 * @param privateKey - The wallet private key. Defaults to `PRIVATE_KEY`.
 * @param providerUrl - The JSON-RPC URL. Defaults to `PROVIDER_URL`.
 * @returns A signer that can be passed to the contract clients.
 * @throws Error if the private key or provider URL is missing.
 */
const createSigner = (
  privateKey: string = getPrivateKey(),
  providerUrl: string = getProviderUrl(),
): ethers.Wallet => {
  if (!privateKey) {
    throw new Error('A private key is required (set PRIVATE_KEY).');
  }
  if (!providerUrl) {
    throw new Error('A provider URL is required (set PROVIDER_URL).');
  }
  return new ethers.Wallet(privateKey, new ethers.JsonRpcProvider(providerUrl));
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
  getGeolocationAddress,
  getComplexManagementAddress,
  createSigner,
};

export default Config;
