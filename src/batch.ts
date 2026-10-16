import { ethers } from 'ethers';
import { IntegratedProductPassportBatch__factory } from './contracts/factories/ExtendedProductPassport.sol/IntegratedProductPassportBatch__factory.js';
import type { IntegratedProductPassportBatch } from './contracts/ExtendedProductPassport.sol/IntegratedProductPassportBatch.js';
import {
  ContractClient,
  type ContractClientOptions,
} from './contractClient.js';
import {
  toBatchDetails,
  toComplex,
  toGeoLocation,
  toProductData,
  type BatchDetails,
  type BatchFullDetails,
  type GeoLocation,
  type NewBatch,
} from './types.js';
import config from './config.js';

/**
 * Client for the IntegratedProductPassportBatch contract, which mints an ERC-721 token (`DPP`)
 * for each production batch and tracks where the batch is.
 *
 * The contract must be linked to ProductPassport, ComplexManagement and Geolocation with
 * `initializeContracts`. `deploySystem` sets this up.
 */
export class Batch extends ContractClient<IntegratedProductPassportBatch> {
  /**
   * @param signer - The signer used to send transactions.
   * @param options - Contract address (defaults to `PRODUCT_PASSPORT_BATCH_ADDRESS`), gas price and logger.
   */
  constructor(signer: ethers.Signer, options: ContractClientOptions = {}) {
    super(
      'IntegratedProductPassportBatch',
      IntegratedProductPassportBatch__factory.connect,
      signer,
      options,
      config.getBatchContractAddress(),
    );
  }

  /**
   * Deploys a new IntegratedProductPassportBatch contract and connects the client to it.
   * @param initialOwner - The contract owner. Defaults to the signer address.
   * @returns The address of the deployed contract.
   */
  async deployBatch(initialOwner?: string): Promise<string> {
    return this.deployWith(
      (owner, overrides) =>
        new IntegratedProductPassportBatch__factory(this.signer).deploy(
          owner,
          overrides,
        ),
      initialOwner,
    );
  }

  /**
   * Links the contracts the batch contract reads from.
   * @param productPassport - The ProductPassport contract address.
   * @param complexManagement - The ComplexManagement contract address.
   * @param geolocation - The Geolocation contract address.
   */
  async initializeContracts(
    productPassport: string,
    complexManagement: string,
    geolocation: string,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('initialize contracts', (c, overrides) =>
      c.initializeContracts(
        productPassport,
        complexManagement,
        geolocation,
        overrides,
      ),
    );
  }

  /**
   * Creates a batch and mints its NFT to the contract owner. The batch origin is the
   * location of the product's complex.
   * @param batchId - The batch ID, also used as the NFT token ID. Must be unique.
   * @param batch - The batch details.
   */
  async createBatch(
    batchId: ethers.BigNumberish,
    batch: NewBatch,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('create batch', (c, overrides) =>
      c.createBatch(
        batchId,
        batch.amount,
        batch.assemblingTime,
        batch.transportDetails,
        batch.productId,
        overrides,
      ),
    );
  }

  /**
   * Moves a batch to another location.
   *
   * If `geolocationId` does not exist, the contract tries to create it from `location`. That only
   * works when the batch contract owns the Geolocation contract, which is not the case with
   * `deploySystem` (ComplexManagement owns it). In that setup, move batches to existing
   * locations, for example the location of another complex.
   *
   * @param batchId - The batch ID.
   * @param geolocationId - The ID of the new location.
   * @param location - Coordinates used if the location has to be created.
   */
  async updateBatchLocation(
    batchId: ethers.BigNumberish,
    geolocationId: string,
    location: GeoLocation = { latitude: '', longitude: '', additionalInfo: '' },
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('update batch location', (c, overrides) =>
      c.updateBatchLocation(
        batchId,
        geolocationId,
        location.latitude,
        location.longitude,
        location.additionalInfo,
        overrides,
      ),
    );
  }

  /**
   * Retrieves the stored details of a batch. Unknown batches have an `amount` of zero.
   * @param batchId - The batch ID.
   */
  async getBatch(batchId: ethers.BigNumberish): Promise<BatchDetails> {
    return this.read('retrieve batch', async (c) =>
      toBatchDetails(await c.batches(batchId)),
    );
  }

  /**
   * Retrieves a batch together with its product, complex, current location and origin.
   * @param batchId - The batch ID.
   * @param productId - The ID of the product in the batch.
   */
  async getBatchDetails(
    batchId: ethers.BigNumberish,
    productId: ethers.BigNumberish,
  ): Promise<BatchFullDetails> {
    return this.read('retrieve batch details', async (c) => {
      const [batch, product, complex, currentLocation, originLocation] =
        await c.getBatchDetails(batchId, productId);
      return {
        batch: toBatchDetails(batch),
        product: toProductData(product),
        complex: toComplex(complex),
        currentLocation: toGeoLocation(currentLocation),
        originLocation: toGeoLocation(originLocation),
      };
    });
  }

  /**
   * Links a batch NFT to off-chain metadata, for example an IPFS JSON file.
   * @param batchId - The batch ID.
   * @param tokenURI - The metadata URI.
   */
  async setTokenURI(
    batchId: ethers.BigNumberish,
    tokenURI: string,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('set token URI', (c, overrides) =>
      c.setTokenURI(batchId, tokenURI, overrides),
    );
  }

  /**
   * @param batchId - The batch ID.
   * @returns The metadata URI of the batch NFT.
   */
  async tokenURI(batchId: ethers.BigNumberish): Promise<string> {
    return this.read('retrieve token URI', (c) => c.tokenURI(batchId));
  }

  /**
   * @param batchId - The batch ID.
   * @returns The address that holds the batch NFT.
   */
  async ownerOf(batchId: ethers.BigNumberish): Promise<string> {
    return this.read('retrieve batch owner', (c) => c.ownerOf(batchId));
  }
}
