import { expect } from 'chai';
import { DigitalProductPassport } from '../src';

describe('DigitalProductPassport SDK - Product Passport Creation', function () {
  let dppSdk: DigitalProductPassport;

  before(function () {
    const contractAddress = process.env.PRODUCT_PASSPORT_ADDRESS || undefined;
    dppSdk = new DigitalProductPassport(contractAddress);
  });

  it('should create a product passport', async function () {
    const productDetails = {
      productId: 1,
      description: 'Sample Product',
      manuals: ['QmbnzbFDcmtJhyw5XTLkcnkJMhW86YZg6oc3FsNBeN2r4W'],
      specifications: ['QmbnzbFDcmtJhyw5XTLkcnkJMhW86YZg6oc3FsNBeN2r4W'],
      batchNumber: '2023-001',
      productionDate: '2023-06-20',
      expiryDate: '2023-12-31',
      certifications: 'FDA-5678',
      warrantyInfo: 'Not applicable',
      materialComposition: 'Sample materials',
      complianceInfo: 'Compliant with standards',
      ipfs: 'QmWDYhFAaT89spcqbKYboyCm6mkYSxKJaWUuS18Akmw96t'
    };

    try {
      await dppSdk.createProductPassport(productDetails);
      const passport = await dppSdk.getProductPassport(productDetails.productId);

      expect(passport.productId).to.equal(productDetails.productId);
      expect(passport.description).to.equal(productDetails.description);
      expect(passport.manuals).to.deep.equal(productDetails.manuals);
      expect(passport.specifications).to.deep.equal(productDetails.specifications);
      expect(passport.batchNumber).to.equal(productDetails.batchNumber);
      expect(passport.productionDate).to.equal(productDetails.productionDate);
      expect(passport.expiryDate).to.equal(productDetails.expiryDate);
      expect(passport.certifications).to.equal(productDetails.certifications);
      expect(passport.warrantyInfo).to.equal(productDetails.warrantyInfo);
      expect(passport.materialComposition).to.equal(productDetails.materialComposition);
      expect(passport.complianceInfo).to.equal(productDetails.complianceInfo);
      expect(passport.ipfs).to.equal(productDetails.ipfs);
    } catch (error) {
      if (error instanceof Error) {
        expect.fail(`Error creating or retrieving product passport: ${error.message}`);
      } else {
        expect.fail(`Unknown error creating or retrieving product passport: ${error}`);
      }
    }
  });
});
