const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

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
  getProductPassportAddress: () => string;
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
  return process.env.PRODUCT_PASSPORT_ADDRESS || ''; // Default to empty string if not provided
};

const config: Config = {
  loadProductDetails,
  getProviderUrl,
  getPrivateKey,
  getProductPassportAddress
};

export default config;
