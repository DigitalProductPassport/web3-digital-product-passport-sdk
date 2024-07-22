import { expect } from 'chai';
import { ethers } from 'ethers';
import ProductPassports from '../src/ProductPassport'; 
import config from '../src/config';

describe('ProductPassports', function () {
  let productPassports: ProductPassports;
  let provider: ethers.JsonRpcProvider;
  let signer: ethers.Wallet;
  const privateKey = 'your-private-key'; 
  const gweiBid = 20;

  before(async function () {
    provider = new ethers.JsonRpcProvider('http://localhost:8545');
    signer = new ethers.Wallet(privateKey, provider);
    productPassports = new ProductPassports(provider, privateKey, gweiBid);
  });

  it('should deploy a product passport contract', async function () {
    const address = await productPassports.deployProductPassport();
    expect(address).to.be.a('string');
    expect(address).to.have.lengthOf(42); // Check if it's a valid Ethereum address
  });

  it('should create a product passport', async function () {
    const productDetails = {
      description: 'Test Product',
      manuals: ['Manual1', 'Manual2'],
      specifications: ['Spec1', 'Spec2'],
      batchNumber: 'Batch001',
      productionDate: '2022-01-01',
      expiryDate: '2023-01-01',
      certifications: 'Certification1',
      warrantyInfo: 'Warranty1',
      materialComposition: 'Material1',
      complianceInfo: 'Compliance1'
    };

    const productPassportAddress = await productPassports.deployProductPassport();
    await productPassports.setProductData(1, productDetails);
    const product = await productPassports.getProductData(1);
    expect(product).to.have.property('description', 'Test Product');
  });

  it('should retrieve a product passport', async function () {
    const product = await productPassports.getProductData(1);
    expect(product).to.have.property('description', 'Test Product');
  });
});
