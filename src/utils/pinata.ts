import fs from 'fs';
import pinataModule from '@pinata/sdk';
import Config from '../config.js';

// @pinata/sdk is CommonJS: at runtime the default import is the client class itself,
// while its type declarations describe it as the `default` export.
type PinataClientClass = (typeof pinataModule)['default'];
const PinataClient: PinataClientClass =
  (pinataModule as unknown as { default?: PinataClientClass }).default ??
  (pinataModule as unknown as PinataClientClass);

/**
 * The subset of the Pinata client used by the SDK.
 */
export type PinataUploader = Pick<
  InstanceType<PinataClientClass>,
  'pinJSONToIPFS' | 'pinFileToIPFS'
>;

let pinata: PinataUploader | null = null;

/**
 * Replaces the Pinata client, for example to use other credentials or a test double.
 * By default a client is created from `PINATA_API_KEY` and `PINATA_SECRET_API_KEY` on first use.
 *
 * @param client - The client to use, or `null` to go back to the default client.
 */
export const setPinataClient = (client: PinataUploader | null): void => {
  pinata = client;
};

const getPinataClient = (): PinataUploader => {
  pinata ??= new PinataClient(
    Config.getPinataApiKey(),
    Config.getPinataSecretApiKey(),
  );
  return pinata;
};

/**
 * Uploads JSON data to Pinata and returns the IPFS hash of the uploaded JSON.
 *
 * @param jsonData - The JSON data to be uploaded to Pinata.
 * @returns A promise that resolves to the IPFS hash of the uploaded JSON data.
 * @throws Error if there is an issue with the upload process or communication with Pinata.
 */
export const uploadJSONToPinata = async (
  jsonData: unknown,
): Promise<string> => {
  try {
    const result = await getPinataClient().pinJSONToIPFS(jsonData);
    return result.IpfsHash;
  } catch (error) {
    const { message } = error as Error;
    console.error(`Error uploading JSON to Pinata: ${message}`);
    throw new Error(`Error uploading JSON to Pinata: ${message}`);
  }
};

/**
 * Uploads a file to Pinata and returns the IPFS hash of the uploaded file.
 *
 * @param filePath - The file path of the file to be uploaded to Pinata.
 * @returns A promise that resolves to the IPFS hash of the uploaded file.
 * @throws Error if there is an issue with reading the file, uploading it, or communication with Pinata.
 */
export const uploadFileToPinata = async (filePath: string): Promise<string> => {
  try {
    const readableStreamForFile = fs.createReadStream(filePath);
    const result = await getPinataClient().pinFileToIPFS(
      readableStreamForFile,
      {
        pinataMetadata: { name: filePath.split(/[\\/]/).pop() || filePath },
      },
    );
    return result.IpfsHash;
  } catch (error) {
    const { message } = error as Error;
    console.error(`Error uploading file to Pinata: ${message}`);
    throw new Error(`Error uploading file to Pinata: ${message}`);
  }
};
