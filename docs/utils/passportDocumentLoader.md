# Passport Documents Loader

This utility handles the loading of product configuration from a JSON file, uploads the associated JSON data and files to IPFS via Pinata, and returns the updated product details with IPFS hashes. It is designed to facilitate the integration of product documents into decentralized storage.

## Configuration

### Environment Variables

Ensure that your Pinata API keys are set up in your `.env` file or environment variables, as they are required for authentication with Pinata. The necessary environment variables are:

- `PINATA_API_KEY`
- `PINATA_SECRET_API_KEY`

### JSON Configuration File

Your configuration JSON file should specify:

- `productId`: The ID of the product.
- `description`: A description of the product.
- `manuals`: An array of file paths for manuals.
- `specifications`: An array of file paths for specifications.
- `jsonConfigPath`: The path to the JSON file that contains additional product details to upload.

## Usage

### Importing

To use the document loader function, import it from the `utils` folder:

```typescript
import { DocumentLoaderToIPFS } from './utils/passportDocumentsLoader';
```

### `DocumentLoaderToIPFS`

Loads product configuration from a JSON file, uploads JSON data and associated files to IPFS, and returns updated product details with IPFS hashes.

#### Parameters

- `configPath`: The path to the JSON configuration file containing product details and file paths.

#### Returns

- A promise that resolves to an object containing updated product details with IPFS CIDs.

#### Example

```typescript
const configPath = 'path/to/your/config.json';

DocumentLoaderToIPFS(configPath)
  .then((updatedProductDetails) => {
    console.log('Product details updated with IPFS CIDs:', updatedProductDetails);
  })
  .catch((error) => {
    console.error('Failed to update product passport with IPFS CIDs:', error);
  });
```

## Error Handling

The function will throw an error if there are issues with reading the configuration file, uploading data to Pinata, or any other unexpected errors during the process. Ensure that you handle these errors appropriately in your code.

## License

This project is licensed under the MIT License
