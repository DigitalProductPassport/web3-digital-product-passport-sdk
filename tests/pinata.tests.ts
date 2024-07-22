import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import PinataClient from "@pinata/sdk"
import * as pinataModule from '../src/utils/pinata';
import Config from '../src/config';

describe('Pinata', function () {
  let pinataStub: sinon.SinonStubbedInstance<PinataClient>;

  before(function () {
    const pinataInstance = new pinataSDK(Config.getPinataApiKey(), Config.getPinataSecretApiKey());
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
