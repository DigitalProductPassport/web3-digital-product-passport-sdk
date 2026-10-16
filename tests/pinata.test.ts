import { expect } from 'chai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  DocumentLoaderToIPFS,
  setPinataClient,
  uploadFileToPinata,
  uploadJSONToPinata,
  type PinataUploader,
} from '../src/index.js';
import { expectRejection } from './fixtures.js';

type PinResponse = Awaited<ReturnType<PinataUploader['pinJSONToIPFS']>>;
const pinned = (hash: string) =>
  ({ IpfsHash: hash, PinSize: 1, Timestamp: '' }) as PinResponse;

/**
 * Pinata double that records uploads and returns a hash per upload.
 */
const fakePinata = (failFiles: string[] = []) => {
  const uploads: string[] = [];
  const client: PinataUploader = {
    pinJSONToIPFS: async () => {
      uploads.push('json');
      return pinned('QmJsonHash');
    },
    pinFileToIPFS: async (stream: fs.ReadStream) => {
      const name = path.basename(String(stream.path));
      if (failFiles.includes(name)) {
        throw new Error('Failed to upload file');
      }
      uploads.push(name);
      return pinned(`Qm-${name}`);
    },
  };
  return { client, uploads };
};

let dir: string;

const writeFile = (name: string, content: string) => {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  return filePath;
};

beforeEach(function () {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dpp-sdk-'));
});

afterEach(function () {
  setPinataClient(null);
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('Pinata', function () {
  it('uploads JSON and returns the IPFS hash', async function () {
    setPinataClient(fakePinata().client);

    expect(await uploadJSONToPinata({ key: 'value' })).to.equal('QmJsonHash');
  });

  it('wraps JSON upload errors', async function () {
    setPinataClient({
      ...fakePinata().client,
      pinJSONToIPFS: async () => {
        throw new Error('Failed to upload JSON');
      },
    });

    await expectRejection(
      uploadJSONToPinata({}),
      'Error uploading JSON to Pinata: Failed to upload JSON',
    );
  });

  it('uploads a file and returns the IPFS hash', async function () {
    setPinataClient(fakePinata().client);
    const filePath = writeFile('manual.pdf', 'manual');

    expect(await uploadFileToPinata(filePath)).to.equal('Qm-manual.pdf');
  });

  it('wraps file upload errors', async function () {
    setPinataClient(fakePinata(['manual.pdf']).client);
    const filePath = writeFile('manual.pdf', 'manual');

    await expectRejection(
      uploadFileToPinata(filePath),
      'Error uploading file to Pinata: Failed to upload file',
    );
  });
});

describe('DocumentLoaderToIPFS', function () {
  const writeConfig = () => {
    const jsonConfigPath = writeFile(
      'product.json',
      JSON.stringify({ key: 'value' }),
    );
    return writeFile(
      'config.json',
      JSON.stringify({
        productId: '12345',
        description: 'Example Product',
        manuals: [
          writeFile('manual1.pdf', 'm1'),
          writeFile('manual2.pdf', 'm2'),
        ],
        specifications: [writeFile('spec1.pdf', 's1')],
        jsonConfigPath,
      }),
    );
  };

  it('uploads the product documents and returns their IPFS hashes', async function () {
    const { client, uploads } = fakePinata();
    setPinataClient(client);

    const result = await DocumentLoaderToIPFS(writeConfig());

    expect(result).to.deep.equal({
      productId: '12345',
      description: 'Example Product',
      manuals: ['Qm-manual1.pdf', 'Qm-manual2.pdf'],
      specifications: ['Qm-spec1.pdf'],
    });
    expect(uploads).to.deep.equal([
      'json',
      'manual1.pdf',
      'manual2.pdf',
      'spec1.pdf',
    ]);
  });

  it('skips documents that fail to upload', async function () {
    setPinataClient(fakePinata(['manual1.pdf']).client);

    const result = await DocumentLoaderToIPFS(writeConfig());

    expect(result.manuals).to.deep.equal(['Qm-manual2.pdf']);
  });

  it('throws if the JSON upload fails', async function () {
    setPinataClient({
      ...fakePinata().client,
      pinJSONToIPFS: async () => {
        throw new Error('Failed to upload JSON');
      },
    });

    await expectRejection(
      DocumentLoaderToIPFS(writeConfig()),
      'Error updating product passport with IPFS CIDs: Error uploading JSON to Pinata: Failed to upload JSON',
    );
  });
});
