import { expect } from 'chai';
import { ethers } from 'ethers';
import { Batch } from '../src/batch'; 
import config from '../src/config'; 

describe('Batch', function () {
  let batch: Batch;
  let provider: ethers.JsonRpcProvider;
  let signer: ethers.Wallet;
  const privateKey = 'your-private-key'; 
  const gweiBid = 20;

  before(async function () {
    provider = new ethers.JsonRpcProvider('http://localhost:8545');
    signer = new ethers.Wallet(privateKey, provider);
    batch = new Batch(provider, privateKey, gweiBid);
  });

  it('should deploy a batch contract', async function () {
    const address = await batch.deployBatch();
    expect(address).to.be.a('string');
    expect(address).to.have.lengthOf(42);
  });

  it('should set batch details', async function () {
    const batchDetails = {
      productIds: [1, 2, 3],
      productionDate: '2022-01-01',
      expiryDate: '2023-01-01',
      location: 'Test Location'
    };

    const batchAddress = await batch.deployBatch();
    batch = new Batch(provider, privateKey, gweiBid);
    await batch.setBatch('Batch001', batchDetails);
    const batchData = await batch.getBatch('Batch001');
    expect(batchData).to.have.property('location', 'Test Location');
  });

  it('should retrieve batch details', async function () {
    const batchData = await batch.getBatch('Batch001');
    expect(batchData).to.have.property('location', 'Test Location');
  });
});
