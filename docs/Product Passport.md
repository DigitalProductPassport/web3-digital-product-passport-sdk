# ProductPassports

Client for the `ProductPassport` contract. A product passport stores the product description, manuals and specifications (usually IPFS hashes), batch number, production and expiry dates, certifications, warranty, material composition, and the ID of the complex where the product was made.

The contract must be linked to `ComplexManagement` (`setComplexManagement`), and every product must reference an existing complex. [`deploySystem`](../README.md#deploy-the-full-system) sets this up.

## Creating an instance

```typescript
import { Config, ProductPassports } from '@digitalproductpassport/solidity-sdk';

const passports = new ProductPassports(Config.createSigner(), {
  address: '0x...', // defaults to PRODUCT_PASSPORT_ADDRESS
  gweiBid: 3, // optional gas price in Gwei
  logger: console, // optional, use silentLogger to disable logs
});
```

## Data types

```typescript
interface ProductData {
  description: string;
  manuals: string[];
  specifications: string[];
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  certifications: string;
  warrantyInfo: string;
  materialComposition: string[]; // addresses, must not be empty
  complexId: string; // must reference an existing complex
}

type ProductUpdate = Omit<ProductData, 'complexId'>;

interface ProductDetails {
  product: ProductData;
  origin: GeoLocation; // location of the product's complex
}
```

## Methods

| Method                                               | Description                                                                       |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| `deployProductPassport(initialOwner?)`               | Deploys a new contract, connects the client to it, and returns its address.       |
| `setComplexManagement(address)`                      | Links the ComplexManagement contract. Owner only.                                 |
| `getComplexManagement()`                             | Returns the linked ComplexManagement address.                                     |
| `createProduct(productId, product: ProductData)`     | Creates a passport. Reverts if the ID exists or the complex does not. Owner only. |
| `updateProduct(productId, product: ProductUpdate)`   | Updates a passport. The complex is not changed. Owner only.                       |
| `removeProduct(productId)`                           | Removes a passport. Owner only.                                                   |
| `getProductDetails(productId)`                       | Returns `{ product, origin }`. Reverts if the product does not exist.             |
| `getProduct(productId)`                              | Returns the `ProductData` only.                                                   |
| `productExists(productId)`                           | Returns `true` if the product exists.                                             |
| `owner()` / `transferOwnership(newOwner)`            | Ownership of the contract.                                                        |
| `attach(address)` / `getAddress()` / `getContract()` | Connect to another contract, read the address, or get the TypeChain contract.     |

Write methods return the `ContractTransactionReceipt`.

## Example

```typescript
await passports.createProduct(1, {
  description: 'Brigadeiro',
  manuals: ['QmManualHash'],
  specifications: ['QmSpecHash'],
  batchNumber: 'BRG-2026-001',
  productionDate: '2026-06-20',
  expiryDate: '2026-12-31',
  certifications: 'FDA-5678',
  warrantyInfo: 'Not applicable',
  materialComposition: ['0x0000000000000000000000000000000000000001'],
  complexId: 'COMPLEX-1',
});

const { product, origin } = await passports.getProductDetails(1);
console.log(product.description, origin.latitude, origin.longitude);
```

`Config.loadProductDetails(filePath?)` reads a JSON file with the `ProductData` fields plus a `productId`, which can be passed straight to `createProduct`:

```typescript
const { productId, ...product } = Config.loadProductDetails(
  'product-details.json',
);
await passports.createProduct(productId, product);
```

## License

MIT
