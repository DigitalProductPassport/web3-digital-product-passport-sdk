# ProductPassports

`ProductPassports` is a TypeScript class for interacting with the Product Passport smart contract on the Ethereum blockchain. This class provides functionality to deploy, manage, and interact with the Product Passport smart contract, including deploying contracts, retrieving product passports, and setting product information.

## Usage

### Creating an Instance

```typescript
const productPassports = new ProductPassports(provider, privateKey, gweiBid);
```

### Methods

#### `deployProductPassport(initialOwner?: string): Promise<string>`

Deploys a new ProductPassport contract.

- **Parameters:**
  - `initialOwner` (optional): The address of the initial owner of the contract.
- **Returns:** The address of the deployed ProductPassport contract.

#### `getProductPassport(productId: number): Promise<any>`

Retrieves the product passport for a given product ID.

- **Parameters:**
  - `productId`: The ID of the product.
- **Returns:** The product passport information.

#### `setProductPassportInfo(contractAddress: string, productId: string, productDetails: any): Promise<any>`

Sets the product passport information for a given product ID.

- **Parameters:**
  - `contractAddress`: The address of the ProductDetails contract.
  - `productId`: The ID of the product.
  - `productDetails`: An object containing product details.
- **Returns:** The transaction receipt.

#### `getProduct(productId: string): Promise<any>`

Retrieves product information for a given product ID.

- **Parameters:**
  - `productId`: The ID of the product.
- **Returns:** The product information.

#### `setProductData(productId: number, productData: any): Promise<any>`

Sets the product data for a given product ID.

- **Parameters:**
  - `productId`: The ID of the product.
  - `productData`: An object containing product data.
- **Returns:** The transaction receipt.

#### `getProductData(productId: number): Promise<any>`

Retrieves the product data for a given product ID.

- **Parameters:**
  - `productId`: The ID of the product.
- **Returns:** The product data.

#### `authorizeEntity(contractAddress: string, entityAddress: string): Promise<any>`

Authorizes an entity to interact with the ProductPassport contract.

- **Parameters:**
  - `contractAddress`: The address of the ProductPassport contract.
  - `entityAddress`: The address of the entity to be authorized.
- **Returns:** The transaction receipt.

## Configuration

Configure the class using your `.env` file or environment variables. Make sure to include:

- `PROVIDER_URL`
- `PRIVATE_KEY`
- `PRODUCT_PASSPORT_ADDRESS`

## Example

```typescript
(async () => {
  try {
    const passportAddress = await productPassports.deployProductPassport();
    console.log(`Deployed ProductPassport contract at: ${passportAddress}`);
    
    const productPassport = await productPassports.getProductPassport(123);
    console.log('Product Passport:', productPassport);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

## License

This project is licensed under the MIT License 