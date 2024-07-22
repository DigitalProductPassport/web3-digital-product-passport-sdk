# Pinata Utility

This utility provides functions to interact with the Pinata service, allowing you to upload JSON data and files to IPFS via Pinata. It is designed to facilitate easy integration with Pinata for managing and storing decentralized files.

## Configuration

Ensure that your Pinata API keys are set up in your `.env` file or environment variables. The utility relies on these keys for authentication with the Pinata service.

### Environment Variables

You need to set the following environment variables:

- `PINATA_API_KEY`
- `PINATA_SECRET_API_KEY`

## Usage

### Importing

To use the utility functions, import them from the `utils` folder:

```typescript
import { uploadJSONToPinata, uploadFileToPinata } from './utils/pinata';
```

### `uploadJSONToPinata`

Uploads JSON data to Pinata and returns the IPFS hash of the uploaded JSON.

#### Parameters

- `jsonData`: The JSON data to be uploaded to Pinata.

#### Returns

- A promise that resolves to the IPFS hash of the uploaded JSON data.

#### Example

```typescript
const jsonData = {
  name: 'My JSON Data',
  description: 'Description of the JSON data',
};

uploadJSONToPinata(jsonData)
  .then((ipfsHash) => {
    console.log(`JSON uploaded to Pinata with IPFS hash: ${ipfsHash}`);
  })
  .catch((error) => {
    console.error('Failed to upload JSON to Pinata:', error);
  });
```

### `uploadFileToPinata`

Uploads a file to Pinata and returns the IPFS hash of the uploaded file.

#### Parameters

- `filePath`: The file path of the file to be uploaded to Pinata.

#### Returns

- A promise that resolves to the IPFS hash of the uploaded file.

#### Example

```typescript
const filePath = 'path/to/your/file.txt';

uploadFileToPinata(filePath)
  .then((ipfsHash) => {
    console.log(`File uploaded to Pinata with IPFS hash: ${ipfsHash}`);
  })
  .catch((error) => {
    console.error('Failed to upload file to Pinata:', error);
  });
```

## Error Handling

Both functions will throw an error if there is an issue with the upload process or communication with Pinata. Ensure that your code handles these errors appropriately.

## License

This project is licensed under the MIT License
