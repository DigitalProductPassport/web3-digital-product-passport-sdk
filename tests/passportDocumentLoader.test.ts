import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import { uploadJSONToPinata, uploadFileToPinata } from '../src/utils/pinata';
import { DocumentLoaderToIPFS } from '../src/utils/passportDocumentsLoader';

describe('DocumentLoaderToIPFS', function () {
  let readFileSyncStub: sinon.SinonStub;
  let uploadJSONToPinataStub: sinon.SinonStub;
  let uploadFileToPinataStub: sinon.SinonStub;

  beforeEach(function () {
    readFileSyncStub = sinon.stub(fs, 'readFileSync');
    uploadJSONToPinataStub = sinon.stub(uploadJSONToPinata, 'uploadJSONToPinata');
    uploadFileToPinataStub = sinon.stub(uploadFileToPinata, 'uploadFileToPinata');
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should successfully update product passport with IPFS CIDs', async function () {
    const jsonConfigPath = 'path/to/jsonConfig.json';
    const configPath = 'path/to/config.json';

    const configData = {
      productId: '12345',
      description: 'Example Product',
      manuals: ['path/to/manual1.pdf', 'path/to/manual2.pdf'],
      specifications: ['path/to/spec1.pdf', 'path/to/spec2.pdf'],
      jsonConfigPath
    };

    const jsonData = { key: 'value' };
    const jsonIpfsHash = 'QmJsonHash';
    const manualIpfsHashes = ['QmManual1', 'QmManual2'];
    const specificationIpfsHashes = ['QmSpec1', 'QmSpec2'];

    readFileSyncStub.withArgs(configPath, 'utf8').returns(JSON.stringify(configData));
    readFileSyncStub.withArgs(jsonConfigPath, 'utf8').returns(JSON.stringify(jsonData));

    uploadJSONToPinataStub.resolves({ IpfsHash: jsonIpfsHash });

    uploadFileToPinataStub
      .withArgs('path/to/manual1.pdf')
      .resolves({ IpfsHash: manualIpfsHashes[0] });
    uploadFileToPinataStub
      .withArgs('path/to/manual2.pdf')
      .resolves({ IpfsHash: manualIpfsHashes[1] });
    uploadFileToPinataStub
      .withArgs('path/to/spec1.pdf')
      .resolves({ IpfsHash: specificationIpfsHashes[0] });
    uploadFileToPinataStub
      .withArgs('path/to/spec2.pdf')
      .resolves({ IpfsHash: specificationIpfsHashes[1] });

    const result = await DocumentLoaderToIPFS(configPath);

    expect(result).to.deep.equal({
      productId: '12345',
      description: 'Example Product',
      manuals: manualIpfsHashes,
      specifications: specificationIpfsHashes
    });
  });

  it('should throw an error if JSON upload fails', async function () {
    const configPath = 'path/to/config.json';
    const jsonConfigPath = 'path/to/jsonConfig.json';
    const configData = {
      productId: '12345',
      description: 'Example Product',
      manuals: [],
      specifications: [],
      jsonConfigPath
    };

    readFileSyncStub.withArgs(configPath, 'utf8').returns(JSON.stringify(configData));
    readFileSyncStub.withArgs(jsonConfigPath, 'utf8').returns('{}');
    
    uploadJSONToPinataStub.rejects(new Error('Failed to upload JSON'));

    try {
      await DocumentLoaderToIPFS(configPath);
    } catch (error: any) {
      expect(error.message).to.equal('Error updating product passport with IPFS CIDs: Error uploading JSON to Pinata: Failed to upload JSON');
    }
  });

  it('should handle file upload errors gracefully', async function () {
    const configPath = 'path/to/config.json';
    const jsonConfigPath = 'path/to/jsonConfig.json';
    const configData = {
      productId: '12345',
      description: 'Example Product',
      manuals: ['path/to/manual1.pdf'],
      specifications: ['path/to/spec1.pdf'],
      jsonConfigPath
    };

    const jsonData = { key: 'value' };
    const jsonIpfsHash = 'QmJsonHash';

    readFileSyncStub.withArgs(configPath, 'utf8').returns(JSON.stringify(configData));
    readFileSyncStub.withArgs(jsonConfigPath, 'utf8').returns(JSON.stringify(jsonData));

    uploadJSONToPinataStub.resolves({ IpfsHash: jsonIpfsHash });

    uploadFileToPinataStub
      .withArgs('path/to/manual1.pdf')
      .rejects(new Error('Failed to upload file'));

    try {
      await DocumentLoaderToIPFS(configPath);
    } catch (error: any) {
      expect(error.message).to.equal('Error updating product passport with IPFS CIDs: Error uploading file to Pinata: Failed to upload file');
    }
  });
});
