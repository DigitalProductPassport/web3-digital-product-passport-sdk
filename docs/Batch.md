# Batch

Client for the `IntegratedProductPassportBatch` contract. Each production batch is minted as an ERC-721 token (name `DigitalProductPassport`, symbol `DPP`) whose token ID is the batch ID. The contract stores the batch amount, assembly time and transport details, and tracks the batch's origin and current location.

The contract must be linked to `ProductPassport`, `ComplexManagement` and `Geolocation` (`initializeContracts`). [`deploySystem`](../README.md#deploy-the-full-system) sets this up.

## Creating an instance

```typescript
import { Batch, Config } from '@digitalproductpassport/solidity-sdk';

const batch = new Batch(Config.createSigner(), {
  address: '0x...', // defaults to PRODUCT_PASSPORT_BATCH_ADDRESS
});
```

## Data types

```typescript
interface NewBatch {
  amount: BigNumberish; // must be greater than zero
  assemblingTime: BigNumberish;
  transportDetails: string;
  productId: BigNumberish; // must reference an existing product
}

interface BatchDetails {
  amount: bigint;
  assemblingTime: bigint;
  transportDetails: string;
  currentGeolocationId: string;
  originGeolocationId: string;
}

interface BatchFullDetails {
  batch: BatchDetails;
  product: ProductData;
  complex: Complex;
  currentLocation: GeoLocation;
  originLocation: GeoLocation;
}
```

## Methods

| Method                                                                 | Description                                                                                                               |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `deployBatch(initialOwner?)`                                           | Deploys a new contract, connects the client to it, and returns its address.                                               |
| `initializeContracts(productPassport, complexManagement, geolocation)` | Links the other contracts. Owner only.                                                                                    |
| `createBatch(batchId, batch: NewBatch)`                                | Creates a batch and mints its NFT to the contract owner. The origin is the location of the product's complex. Owner only. |
| `updateBatchLocation(batchId, geolocationId, location?)`               | Moves a batch. See the limitation below. Owner only.                                                                      |
| `getBatch(batchId)`                                                    | Returns the stored `BatchDetails`. Unknown batches have `amount` 0.                                                       |
| `getBatchDetails(batchId, productId)`                                  | Returns the batch with its product, complex, current location and origin.                                                 |
| `setTokenURI(batchId, uri)` / `tokenURI(batchId)`                      | Link the NFT to off-chain metadata, for example an IPFS JSON file.                                                        |
| `ownerOf(batchId)`                                                     | Returns the NFT holder.                                                                                                   |
| `owner()` / `transferOwnership(newOwner)`                              | Ownership of the contract.                                                                                                |
| `getContract()`                                                        | The TypeChain contract, for ERC-721 calls such as `transferFrom` or `approve`.                                            |

### Moving a batch

`updateBatchLocation` asks the `Geolocation` contract to create the target location when it does not exist. With the standard deployment, `Geolocation` is owned by `ComplexManagement`, so that creation reverts. Move batches to existing locations instead, for example the geolocation of another complex:

```typescript
await complexManagement.addComplex('WAREHOUSE-1', {
  complexName: 'Sao Paulo Warehouse',
  complexCountry: 'Brazil',
  complexAddress: 'Rua Logistica, 50',
  complexSiteType: 'Warehouse',
  complexIndustry: 'Logistics',
  geolocationId: 'GEO-WAREHOUSE-1',
  latitude: '-23.5505',
  longitude: '-46.6333',
  additionalInfo: 'Distribution center',
});

await batch.updateBatchLocation(1, 'GEO-WAREHOUSE-1');
```

## Example

```typescript
await batch.createBatch(1, {
  amount: 100,
  assemblingTime: 3600,
  transportDetails: 'Truck BR-101',
  productId: 1,
});
await batch.setTokenURI(1, 'ipfs://QmBatchMetadata');

const {
  batch: details,
  currentLocation,
  originLocation,
} = await batch.getBatchDetails(1, 1);
```

## License

MIT
