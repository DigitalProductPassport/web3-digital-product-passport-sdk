# Digital Product Passport Solidity SDK

## Introduction

Welcome to the Digital Product Passport SDK repository! This project provides a JavaScript/TypeScript SDK for interacting with Digital Product Passport (DPP) smart contracts deployed on the Ethereum blockchain and integrating with Pinata for IPFS storage.

## What is a Digital Product Passport?

A Digital Product Passport (DPP) is a comprehensive digital record that tracks a product's journey from design to disposal. It consolidates data related to material sourcing, manufacturing, and lifecycle events, providing valuable information to manufacturers, consumers, and repair services.

Instead of a physical document, the DPP is represented digitally and can be accessed through various means such as NFC chips, QR codes, or RFID tags. The DPP provides transparency and traceability throughout the product's lifecycle.

## SDK Overview

The Digital Product Passport SDK facilitates interactions with the DPP smart contracts and integrates with Pinata for storing and retrieving product-related files on IPFS.

### Key Components

- **Pinata Integration**: Upload JSON data and files to IPFS via Pinata.
- **ProductPassport**: Deploy and interact with Product Passport contracts for managing product details.

## Installation

To install the SDK, use npm:

```bash
npm install @digitalproductpassport/sdk
```

## Configuration

To securely manage configuration values, such as private keys, RPC URLs, and Pinata API keys, use a `.env` file in your project root directory.

### .env File

Create a `.env` file with the following content:

```env
# Ethereum Configuration
ETH_PROVIDER_URL=http://localhost:8545
ETH_PRIVATE_KEY=your-private-key

# Pinata Configuration
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_API_KEY=your-pinata-secret-api-key
```

Ensure you replace `your-private-key`, `your-pinata-api-key`, and `your-pinata-secret-api-key` with your actual values.

### Loading .env Configuration

The SDK uses the `dotenv` package to load environment variables from the `.env` file. Make sure to install it:

```bash
npm install dotenv
```

In your code, load the environment variables at the start of your script:

```typescript
import dotenv from 'dotenv';
dotenv.config();
```

## Usage

### Pinata Integration

To integrate with Pinata, use the provided utility functions to upload JSON data and files to IPFS.

#### Example: Uploading JSON Data

```typescript
import { uploadJSONToPinata } from '@digitalproductpassport/sdk';

const jsonData = { key: 'value' };

(async () => {
  try {
    const ipfsHash = await uploadJSONToPinata(jsonData);
    console.log(`Uploaded JSON to Pinata. IPFS Hash: ${ipfsHash}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
})();
```

#### Example: Uploading a File

```typescript
import { uploadFileToPinata } from '@digitalproductpassport/sdk';

const filePath = 'path/to/file.pdf';

(async () => {
  try {
    const ipfsHash = await uploadFileToPinata(filePath);
    console.log(`Uploaded file to Pinata. IPFS Hash: ${ipfsHash}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
})();
```

### Product Passport Component

Deploy and interact with Product Passport contracts to manage product details.

#### Example: Deploying and Using Product Passport Contract

```typescript
import { ethers } from 'ethers';
import { ProductPassport } from '@digitalproductpassport/sdk';

const provider = new ethers.JsonRpcProvider(process.env.ETH_PROVIDER_URL);
const privateKey = process.env.ETH_PRIVATE_KEY as string;
const gweiBid = 20;

const productPassport = new ProductPassport(provider, privateKey, gweiBid);

(async () => {
  try {
    const passportAddress = await productPassport.deployProductPassport();
    console.log(`Product Passport contract deployed at: ${passportAddress}`);

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

    await productPassport.setProductData(1, productDetails);
    const product = await productPassport.getProductData(1);
    console.log(`Product details: ${JSON.stringify(product)}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
})();
```

#### Example JSON Configuration

Here is an example of the JSON configuration file you might use with the SDK:

```json
{
  "productId": "12345",
  "description": "Example Product",
  "manuals": ["path/to/manual1.pdf", "path/to/manual2.pdf"],
  "specifications": ["path/to/spec1.pdf", "path/to/spec2.pdf"],
  "jsonConfigPath": "path/to/jsonConfig.json"
}
```

## Test Cases

### Pinata Integration Tests

The `test` directory contains tests for the Pinata integration. These tests ensure the correct behavior of the upload functions.

#### Running Tests

To run the tests, use:

```bash
npm test
```

### Example Test Case for Pinata Integration

```typescript
import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import PinataClient from '@pinata/sdk';
import * as pinataModule from '../src/utils/pinata';
import Config from '../src/config';

describe('Pinata', function () {
  let pinataStub: sinon.SinonStubbedInstance<PinataClient>;

  before(function () {
    const pinataInstance = new PinataClient(Config.getPinataApiKey(), Config.getPinataSecretApiKey());
    pinataStub = sinon.stub(pinataInstance) as unknown as sinon.SinonStubbedInstance<PinataClient>;
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('uploadJSONToPinata', function () {
    it('should upload JSON data to Pinata and return the IPFS hash', async function () {
      const jsonData = { key: 'value' };
      const expectedHash = 'QmTestHash';

      pinataStub.pinJSONToIPFS.resolves({ IpfsHash: expectedHash });

      const result = await pinataModule.uploadJSONToPinata(jsonData);
      expect(result).to.equal(expectedHash);
      expect(pinataStub.pinJSONToIPFS.calledOnce).to.be.true;
    });

    it('should throw an error if uploading JSON data fails', async function () {
      const jsonData = { key: 'value' };
      const errorMessage = 'Failed to upload JSON';

      pinataStub.pinJSONToIPFS.rejects(new Error(errorMessage));

      try {
        await pinataModule.uploadJSONToPinata(jsonData);
      } catch (error: any) {
        expect(error.message).to.equal(`Error uploading JSON to Pinata: ${errorMessage}`);
      }
      expect(pinataStub.pinJSONToIPFS.calledOnce).to.be.true;
    });
  });

  describe('uploadFileToPinata', function () {
    it('should upload a file to Pinata and return the IPFS hash', async function () {
      const filePath = 'test.txt';
      const expectedHash = 'QmTestHash';

      sinon.stub(fs, 'createReadStream').returns({} as any);
      pinataStub.pinFileToIPFS.resolves({ IpfsHash: expectedHash });

      const result = await pinataModule.uploadFileToPinata(filePath);
      expect(result).to.equal(expectedHash);
      expect(pinataStub.pinFileToIPFS.calledOnce).to.be.true;
    });

    it('should throw an error if uploading a file fails', async function () {
      const filePath = 'test.txt';
      const errorMessage = 'Failed to upload file';

      sinon.stub(fs, 'createReadStream').returns({} as any);
      pinataStub.pinFileToIPFS.rejects(new Error(errorMessage));

      try {
        await pinataModule.uploadFileToPinata(filePath);
      } catch (error: any) {
        expect(error.message).to.equal(`Error uploading file to Pinata: ${errorMessage}`);
      }
      expect(pinataStub.pinFileToIPFS.calledOnce).to.be.true;
    });
  });
});
```

### Product Passport Tests

The `test` directory also contains tests for the Product Passport component to ensure contract deployment and data management work as expected.

#### Example Test Case for Product Passport

```typescript
import { expect } from 'chai';
import { ethers } from 'ethers';
import ProductPassports from '../src/ProductPassport';
import config from '../src/config';

describe('ProductPassports', function () {
  let productPassports: ProductPassports;
  let provider: ethers.JsonRpcProvider;
  let signer: ethers.Wallet;
  const privateKey = process.env.ETH_PRIVATE_KEY as string;
  const gweiBid = 20;

  before(async function () {
    provider = new ethers.JsonRpcProvider(process.env.ETH_PROVIDER_URL);
    signer = new ethers.Wallet(privateKey, provider);
    productPassports = new ProductPassports(provider, privateKey, gweiBid);
  });

  it('should deploy a product passport contract', async function () {
    const address = await productPassports.deploy

ProductPassport();
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
```
