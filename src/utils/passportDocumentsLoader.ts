import fs from 'fs';
import { uploadJSONToPinata, uploadFileToPinata } from './pinata';

/**
 * Interface representing the details of a product.
 */
interface ProductDetails {
  productId: string;
  description: string;
  manuals: string[];
  specifications: string[];
}

/**
 * Interface representing the configuration needed to load and update a product.
 */
interface Config {
  productId: string;
  description: string;
  manuals: string[];
  specifications: string[];
  jsonConfigPath: string;
}

/**
 * Loads a product configuration from a JSON file, uploads the associated JSON data
 * and files to IPFS using Pinata, and returns the updated product details with IPFS hashes.
 * 
 * @param configPath - The path to the JSON configuration file containing product details and file paths.
 * @returns A promise that resolves to an object containing updated product details with IPFS CIDs.
 * @throws Error if there is an issue reading the configuration file, uploading data to Pinata,
 *         or any other unexpected errors during the process.
 */
export const DocumentLoaderToIPFS = async (configPath: string): Promise<ProductDetails> => {
  try {
    // Read and parse the configuration file
    const configData: Config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const { productId, description, manuals, specifications, jsonConfigPath } = configData;

    // Read and parse the JSON data file
    const jsonData = JSON.parse(fs.readFileSync(jsonConfigPath, 'utf8'));

    // Upload JSON data to Pinata and get the IPFS hash
    const jsonIpfsHash = await uploadJSONToPinata(jsonData);
    console.log(`JSON uploaded to Pinata with IPFS hash: ${jsonIpfsHash}`);

    const fileIpfsHashes: { [key: string]: string[] } = {
      manuals: [],
      specifications: []
    };

    // Function to upload files to Pinata and store their IPFS hashes
    const uploadFiles = async (filePaths: string[], key: string) => {
      for (const filePath of filePaths) {
        try {
          const fileIpfsHash = await uploadFileToPinata(filePath);
          fileIpfsHashes[key].push(fileIpfsHash);
          console.log(`File ${filePath} uploaded to Pinata with IPFS hash: ${fileIpfsHash}`);
        } catch (error: any) {
          console.error(`Failed to upload file ${filePath}: ${error.message}`);
        }
      }
    };

    // Upload manuals and specifications files to Pinata
    await uploadFiles(manuals, 'manuals');
    await uploadFiles(specifications, 'specifications');

    // Prepare the updated product details with IPFS hashes
    const updatedProductDetails: ProductDetails = {
      productId,
      description,
      manuals: fileIpfsHashes['manuals'],
      specifications: fileIpfsHashes['specifications']
    };

    console.log('Product details updated with IPFS CIDs:', updatedProductDetails);
    return updatedProductDetails;

  } catch (error: any) {
    console.error(`Error updating product passport with IPFS CIDs: ${error.message}`, error);
    throw new Error(`Error updating product passport with IPFS CIDs: ${error.message}`);
  }
};
