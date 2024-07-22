import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
dotenv.config();

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

const loadProductDetails = (filePath: string = process.env.PRODUCT_DETAILS_FILE || 'product-details.json'): ProductDetails => {
  const productDetailsPath = path.resolve(__dirname, '..', filePath);

  if (!fs.existsSync(productDetailsPath)) {
    throw new Error(`Product details file not found at ${productDetailsPath}`);
  }

  const productDetails = JSON.parse(fs.readFileSync(productDetailsPath, 'utf-8')) as ProductDetails;
  return productDetails;
};

const getProviderUrl = (): string => {
  return process.env.PROVIDER_URL || '';
};

const getPrivateKey = (): string => {
  return process.env.PRIVATE_KEY || '';
};

const getProductPassportAddress = (): string => {
  return process.env.PRODUCT_PASSPORT_ADDRESS || ''; 
};

const getBatchContractAddress = (): string => {
  return process.env.PRODUCT_PASSPORT_BATCH_ADDRESS || ''; 
};

const getPinataApiKey = (): string => {
  return process.env.PINATA_API_KEY || '';
};

const getPinataSecretApiKey = (): string => {
  return process.env.PINATA_SECRET_API_KEY || '';
};

const getGasAmount = (): string => {
  return process.env.GAS_AMOUNT || "254362";
};

const getGweiBid = (): string => {
  return process.env.GWEI_BID || "3";
};

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
