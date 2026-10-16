import { ethers } from 'ethers';
import { ComplexManagement__factory } from './contracts/factories/ComplexManagement__factory.js';
import type { ComplexManagement as ComplexManagementContract } from './contracts/ComplexManagement.js';
import {
  ContractClient,
  type ContractClientOptions,
} from './contractClient.js';
import {
  toComplex,
  toGeoLocation,
  type Complex,
  type ComplexUpdate,
  type GeoLocation,
  type NewComplex,
} from './types.js';
import config from './config.js';

/**
 * Client for the ComplexManagement contract, which registers production sites ("complexes").
 *
 * `addComplex` stores the complex location in the Geolocation contract, so ComplexManagement
 * must own the Geolocation contract. `deploySystem` sets this up.
 */
export class ComplexManagement extends ContractClient<ComplexManagementContract> {
  /**
   * @param signer - The signer used to send transactions.
   * @param options - Contract address (defaults to `COMPLEX_MANAGEMENT_ADDRESS`), gas price and logger.
   */
  constructor(signer: ethers.Signer, options: ContractClientOptions = {}) {
    super(
      'ComplexManagement',
      ComplexManagement__factory.connect,
      signer,
      options,
      config.getComplexManagementAddress(),
    );
  }

  /**
   * Deploys a new ComplexManagement contract and connects the client to it.
   * @param initialOwner - The contract owner. Defaults to the signer address.
   * @returns The address of the deployed contract.
   */
  async deployComplexManagement(initialOwner?: string): Promise<string> {
    return this.deployWith(
      (owner, overrides) =>
        new ComplexManagement__factory(this.signer).deploy(owner, overrides),
      initialOwner,
    );
  }

  /**
   * Links the Geolocation contract used to store complex locations.
   * @param geolocationAddress - The Geolocation contract address.
   */
  async setGeolocationContract(
    geolocationAddress: string,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('set geolocation contract', (c, overrides) =>
      c.setGeolocationContract(geolocationAddress, overrides),
    );
  }

  /**
   * @returns The address of the linked Geolocation contract (the zero address if not set).
   */
  async getGeolocationContract(): Promise<string> {
    return this.read('get geolocation contract', (c) =>
      c.geolocationContract(),
    );
  }

  /**
   * Registers a new complex and stores its location.
   * @param complexId - The complex ID. Must be unique and not empty.
   * @param complex - The complex details and its location.
   */
  async addComplex(
    complexId: string,
    complex: NewComplex,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('add complex', (c, overrides) =>
      c.addComplex(
        complexId,
        complex.complexName,
        complex.complexCountry,
        complex.complexAddress,
        complex.geolocationId,
        complex.complexSiteType,
        complex.complexIndustry,
        complex.latitude,
        complex.longitude,
        complex.additionalInfo,
        overrides,
      ),
    );
  }

  /**
   * Updates an existing complex. Its geolocation is not changed.
   * @param complexId - The complex ID.
   * @param complex - The new complex details.
   */
  async updateComplex(
    complexId: string,
    complex: ComplexUpdate,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('update complex', (c, overrides) =>
      c.updateComplex(
        complexId,
        complex.complexName,
        complex.complexCountry,
        complex.complexAddress,
        complex.complexSiteType,
        complex.complexIndustry,
        overrides,
      ),
    );
  }

  /**
   * Removes a complex.
   * @param complexId - The complex ID.
   */
  async removeComplex(
    complexId: string,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('remove complex', (c, overrides) =>
      c.removeComplex(complexId, overrides),
    );
  }

  /**
   * Retrieves a complex.
   * @param complexId - The complex ID.
   */
  async getComplex(complexId: string): Promise<Complex> {
    return this.read('retrieve complex', async (c) =>
      toComplex(await c.getComplex(complexId)),
    );
  }

  /**
   * Retrieves the location of a complex.
   * @param complexId - The complex ID.
   */
  async getComplexGeolocation(complexId: string): Promise<GeoLocation> {
    return this.read('retrieve complex geolocation', async (c) =>
      toGeoLocation(await c.getComplexGeolocation(complexId)),
    );
  }

  /**
   * Checks whether a complex exists.
   * @param complexId - The complex ID.
   */
  async complexExists(complexId: string): Promise<boolean> {
    return this.read('check complex', (c) => c.complexExists(complexId));
  }
}
