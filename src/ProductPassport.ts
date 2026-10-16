import { ethers } from 'ethers';
import { ProductPassport__factory } from './contracts/factories/ProductPassport__factory.js';
import type { ProductPassport as ProductPassportContract } from './contracts/ProductPassport.js';
import {
  ContractClient,
  type ContractClientOptions,
} from './contractClient.js';
import {
  toGeoLocation,
  toProductData,
  type ProductData,
  type ProductDetails,
  type ProductUpdate,
} from './types.js';
import config from './config.js';

/**
 * Client for the ProductPassport contract.
 * Provides functionality to deploy, manage, and read product passports.
 *
 * Every product belongs to a complex registered in the ComplexManagement contract,
 * which must be linked with `setComplexManagement`.
 */
export class ProductPassports extends ContractClient<ProductPassportContract> {
  /**
   * @param signer - The signer used to send transactions.
   * @param options - Contract address (defaults to `PRODUCT_PASSPORT_ADDRESS`), gas price and logger.
   */
  constructor(signer: ethers.Signer, options: ContractClientOptions = {}) {
    super(
      'ProductPassport',
      ProductPassport__factory.connect,
      signer,
      options,
      config.getProductPassportAddress(),
    );
  }

  /**
   * Deploys a new ProductPassport contract and connects the client to it.
   * @param initialOwner - The contract owner. Defaults to the signer address.
   * @returns The address of the deployed contract.
   */
  async deployProductPassport(initialOwner?: string): Promise<string> {
    return this.deployWith(
      (owner, overrides) =>
        new ProductPassport__factory(this.signer).deploy(owner, overrides),
      initialOwner,
    );
  }

  /**
   * Links the ComplexManagement contract used to validate product complexes.
   * @param complexManagementAddress - The ComplexManagement contract address.
   */
  async setComplexManagement(
    complexManagementAddress: string,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('set complex management', (c, overrides) =>
      c.setComplexManagement(complexManagementAddress, overrides),
    );
  }

  /**
   * @returns The address of the linked ComplexManagement contract (the zero address if not set).
   */
  async getComplexManagement(): Promise<string> {
    return this.read('get complex management', (c) => c.complexManagement());
  }

  /**
   * Creates a product passport.
   * @param productId - The product ID. Must be unique.
   * @param product - The product data. `complexId` must reference an existing complex and
   *                  `materialComposition` must not be empty.
   */
  async createProduct(
    productId: ethers.BigNumberish,
    product: ProductData,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('create product', (c, overrides) =>
      c.createProduct(
        productId,
        product.description,
        product.manuals,
        product.specifications,
        product.batchNumber,
        product.productionDate,
        product.expiryDate,
        product.certifications,
        product.warrantyInfo,
        product.materialComposition,
        product.complexId,
        overrides,
      ),
    );
  }

  /**
   * Updates an existing product passport. The product complex is not changed.
   * @param productId - The product ID.
   * @param product - The new product data.
   */
  async updateProduct(
    productId: ethers.BigNumberish,
    product: ProductUpdate,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('update product', (c, overrides) =>
      c.updateProduct(
        productId,
        product.description,
        product.manuals,
        product.specifications,
        product.batchNumber,
        product.productionDate,
        product.expiryDate,
        product.certifications,
        product.warrantyInfo,
        product.materialComposition,
        overrides,
      ),
    );
  }

  /**
   * Removes a product passport.
   * @param productId - The product ID.
   */
  async removeProduct(
    productId: ethers.BigNumberish,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('remove product', (c, overrides) =>
      c.removeProduct(productId, overrides),
    );
  }

  /**
   * Retrieves a product passport together with the location of its complex.
   * @param productId - The product ID.
   */
  async getProductDetails(
    productId: ethers.BigNumberish,
  ): Promise<ProductDetails> {
    return this.read('retrieve product', async (c) => {
      const [product, origin] = await c.getProductDetails(productId);
      return { product: toProductData(product), origin: toGeoLocation(origin) };
    });
  }

  /**
   * Retrieves the data of a product passport.
   * @param productId - The product ID.
   */
  async getProduct(productId: ethers.BigNumberish): Promise<ProductData> {
    return (await this.getProductDetails(productId)).product;
  }

  /**
   * Checks whether a product passport exists.
   * @param productId - The product ID.
   */
  async productExists(productId: ethers.BigNumberish): Promise<boolean> {
    return this.read('check product', (c) => c.productExists(productId));
  }
}

export default ProductPassports;
