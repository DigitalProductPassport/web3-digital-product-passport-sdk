import fs from 'fs';
import pinataSDK from '@pinata/sdk';
import Config from '../config';

const pinata = new pinataSDK(Config.getPinataApiKey(), Config.getPinataSecretApiKey());

export const uploadJSONToPinata = async (jsonData: any): Promise<string> => {
  try {
    const result = await pinata.pinJSONToIPFS(jsonData);
    return result.IpfsHash;
  } catch (error: any) {
    console.error(`Error uploading JSON to Pinata: ${error.message}`, error);
    throw new Error(`Error uploading JSON to Pinata: ${error.message}`);
  }
};

export const uploadFileToPinata = async (filePath: string): Promise<string> => {
  try {
    const readableStreamForFile = fs.createReadStream(filePath);

    const result = await pinata.pinFileToIPFS(readableStreamForFile);
    return result.IpfsHash;
  } catch (error: any) {
    console.error(`Error uploading file to Pinata: ${error.message}`, error);
    throw new Error(`Error uploading file to Pinata: ${error.message}`);
  }
};
