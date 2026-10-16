import { expect } from 'chai';
import type { NewComplex, ProductData } from '../src/index.js';

export const COMPLEX_ID = 'COMPLEX-1';
export const MATERIAL = '0x0000000000000000000000000000000000000001';

export const complex: NewComplex = {
  complexName: 'Vitoria Plant',
  complexCountry: 'Brazil',
  complexAddress: 'Av. Industrial, 100',
  complexSiteType: 'Factory',
  complexIndustry: 'Food',
  geolocationId: 'GEO-COMPLEX-1',
  latitude: '-20.3155',
  longitude: '-40.3128',
  additionalInfo: 'Main production site',
};

export const warehouse: NewComplex = {
  complexName: 'Sao Paulo Warehouse',
  complexCountry: 'Brazil',
  complexAddress: 'Rua Logistica, 50',
  complexSiteType: 'Warehouse',
  complexIndustry: 'Logistics',
  geolocationId: 'GEO-WAREHOUSE-1',
  latitude: '-23.5505',
  longitude: '-46.6333',
  additionalInfo: 'Distribution center',
};

export const product: ProductData = {
  description: 'Brigadeiro',
  manuals: ['QmManualHash'],
  specifications: ['QmSpecHash'],
  batchNumber: 'BRG-2026-001',
  productionDate: '2026-06-20',
  expiryDate: '2026-12-31',
  certifications: 'FDA-5678',
  warrantyInfo: 'Not applicable',
  materialComposition: [MATERIAL],
  complexId: COMPLEX_ID,
};

/**
 * Asserts that a promise rejects with an error whose message contains `message`.
 */
export const expectRejection = async (
  promise: Promise<unknown>,
  message: string,
): Promise<void> => {
  try {
    await promise;
  } catch (error) {
    expect((error as Error).message).to.include(message);
    return;
  }
  expect.fail(`Expected a rejection with "${message}"`);
};
