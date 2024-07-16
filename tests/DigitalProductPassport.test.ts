import { expect } from 'chai';
import Web3 from 'web3';
import { DigitalProductPassport } from '../src/DigitalProductPassport';
import ProductPassportABI from '@digitalproductpassport/smartcontracts/abi/json/contracts/ProductPassport.sol/ProductPassport.json';
import { AbiItem } from 'web3-utils';

const abi: AbiItem[] = ProductPassportABI;
const web3 = new Web3(provider);

describe('DigitalProductPassport', function () {
  let dpp: DigitalProductPassport;
  let accounts: string[];

  it('should create a product passport', async function () {
    const productDetails = {
      productId: 1,
      description: 'Test Product',
      manuals: ['Manual1', 'Manual2'],
      specifications: ['Spec1', 'Spec2'],
      batchNumber: 'Batch001',
      productionDate: '2022-01-01',
      expiryDate: '2023-01-01',
      certifications: 'Certification1',
      warrantyInfo: 'Warranty1',
      materialComposition: 'Material1',
      complianceInfo: 'Compliance1',
      ipfs: 'QmTestHash'
    };
    const tx = await dpp.createProductPassport(productDetails);
    expect(tx).to.have.property('transactionHash');
  });

  it('should get a product passport', async function () {
    const passport = await dpp.getProductPassport(1);
    expect(passport).to.have.property('description', 'Test Product');
  });
});
