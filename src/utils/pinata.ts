import fs from 'fs';
import pinataSDK from '@pinata/sdk';
import Config from '../config';

// Initialize Pinata SDK with API keys from the configuration
const pinata = new pinataSDK(Config.getPinataApiKey(), Config.getPinataSecretApiKey());

/**
 * Uploads JSON data to Pinata and returns the IPFS hash of the uploaded JSON.
 *
 * @param jsonData - The JSON data to be uploaded to Pinata.
 * @returns A promise that resolves to the IPFS hash of the uploaded JSON data.
 * @throws Error if there is an issue with the upload process or communication with Pinata.
 */
export const uploadJSONToPinata = async (jsonData: any): Promise<string> => {
  try {
    // Upload JSON data to Pinata
    const result = await pinata.pinJSONToIPFS(jsonData);
    return result.IpfsHash;
  } catch (error: any) {
    console.error(`Error uploading JSON to Pinata: ${error.message}`, error);
    throw new Error(`Error uploading JSON to Pinata: ${error.message}`);
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
    // Create a readable stream from the file path
    const readableStreamForFile = fs.createReadStream(filePath);

    // Upload the file to Pinata
    const result = await pinata.pinFileToIPFS(readableStreamForFile);
    return result.IpfsHash;
  } catch (error: any) {
    console.error(`Error uploading file to Pinata: ${error.message}`, error);
    throw new Error(`Error uploading file to Pinata: ${error.message}`);
  }
};
