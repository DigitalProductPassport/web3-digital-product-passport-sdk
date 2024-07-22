# Batch

`Batch` is a TypeScript class for managing batch product passport  contracts on the Ethereum blockchain. This class provides methods to deploy, set, and retrieve batch details from a Batch contract.


## Usage

### Creating an Instance

```typescript
const batch = new Batch(provider, privateKey, gweiBid);
```

### Methods

#### `deployBatch(initialOwner?: string): Promise<string>`

Deploys a new Batch contract.

- **Parameters:**
  - `initialOwner` (optional): The address of the initial owner of the contract.
- **Returns:** The address of the deployed Batch contract.

#### `setBatch(batchId: string, batchDetails: any): Promise<void>`

Sets the details of a batch in the Batch contract.

- **Parameters:**
  - `batchId`: The identifier for the batch.
  - `batchDetails`: An object containing details of the batch.
- **Throws:** Error if the Batch contract address is not initialized or the transaction fails.

#### `getBatch(batchId: string): Promise<any>`

Retrieves details of a batch from the Batch contract.

- **Parameters:**
  - `batchId`: The identifier for the batch.
- **Returns:** The details of the batch.

## Configuration

Configure the class using your `.env` file or environment variables. Make sure to include:

- `PROVIDER_URL`
- `PRIVATE_KEY`
- `BATCH_CONTRACT_ADDRESS`

## Example

```typescript
(async () => {
  try {
    const batchAddress = await batch.deployBatch();
    console.log(`Deployed Batch contract at: ${batchAddress}`);
    
    await batch.setBatch('Batch001', {
      productIds: [1, 2, 3],
      productionDate: '2022-01-01',
      expiryDate: '2023-01-01',
      location: 'Test Location'
    });
    
    const batchDetails = await batch.getBatch('Batch001');
    console.log('Batch Details:', batchDetails);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

## License

This project is licensed under the MIT License 