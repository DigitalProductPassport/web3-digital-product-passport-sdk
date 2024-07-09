import { DigitalProductPassport } from '../src/DigitalProductPassport';
import { ethers } from 'ethers';

const providerUrl = 'http://localhost:8545';
const contractAddress = '0xYourContractAddress';

describe('DigitalProductPassport', () => {
  let dpp: DigitalProductPassport;

  beforeAll(() => {
    dpp = new DigitalProductPassport(providerUrl, contractAddress);
  });

  it('should get passport data', async () => {
    const data = await dpp.getPassportData(1);
    expect(data).toBeDefined();
  });

  it('should create passport', async () => {
    const passportData = { /* some data */ };
    const tx = await dpp.createPassport(passportData);
    expect(tx).toBeDefined();
  });
});