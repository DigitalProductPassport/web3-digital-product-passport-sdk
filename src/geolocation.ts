import { ethers } from 'ethers';
import { Geolocation__factory } from './contracts/factories/Geolocation__factory.js';
import type { Geolocation as GeolocationContract } from './contracts/Geolocation.js';
import {
  ContractClient,
  type ContractClientOptions,
} from './contractClient.js';
import { toGeoLocation, type GeoLocation } from './types.js';
import config from './config.js';

/**
 * Client for the Geolocation contract, which stores locations under a string ID.
 *
 * When deployed with `deploySystem`, the contract is owned by ComplexManagement, so new
 * locations are created through `ComplexManagement.addComplex`.
 */
export class Geolocation extends ContractClient<GeolocationContract> {
  /**
   * @param signer - The signer used to send transactions.
   * @param options - Contract address (defaults to `GEOLOCATION_ADDRESS`), gas price and logger.
   */
  constructor(signer: ethers.Signer, options: ContractClientOptions = {}) {
    super(
      'Geolocation',
      Geolocation__factory.connect,
      signer,
      options,
      config.getGeolocationAddress(),
    );
  }

  /**
   * Deploys a new Geolocation contract and connects the client to it.
   * @param initialOwner - The contract owner. Defaults to the signer address.
   * @returns The address of the deployed contract.
   */
  async deployGeolocation(initialOwner?: string): Promise<string> {
    return this.deployWith(
      (owner, overrides) =>
        new Geolocation__factory(this.signer).deploy(owner, overrides),
      initialOwner,
    );
  }

  /**
   * Stores a location. Overwrites any location with the same ID.
   * @param id - The geolocation ID.
   * @param location - Latitude, longitude (1 to 20 characters each) and additional info.
   */
  async setGeolocation(
    id: string,
    location: GeoLocation,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('set geolocation', (c, overrides) =>
      c.setGeolocation(
        id,
        location.latitude,
        location.longitude,
        location.additionalInfo,
        overrides,
      ),
    );
  }

  /**
   * Updates an existing location.
   * @param id - The geolocation ID.
   * @param location - The new latitude, longitude and additional info.
   */
  async updateGeolocation(
    id: string,
    location: GeoLocation,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('update geolocation', (c, overrides) =>
      c.updateGeolocation(
        id,
        location.latitude,
        location.longitude,
        location.additionalInfo,
        overrides,
      ),
    );
  }

  /**
   * Removes a location.
   * @param id - The geolocation ID.
   */
  async removeGeolocation(
    id: string,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('remove geolocation', (c, overrides) =>
      c.removeGeolocation(id, overrides),
    );
  }

  /**
   * Retrieves a location. The contract returns empty strings for an unknown ID.
   * @param id - The geolocation ID.
   */
  async getGeolocation(id: string): Promise<GeoLocation> {
    return this.read('retrieve geolocation', async (c) =>
      toGeoLocation(await c.getGeolocation(id)),
    );
  }

  /**
   * Checks whether a location exists.
   * @param id - The geolocation ID.
   */
  async geolocationExists(id: string): Promise<boolean> {
    return this.read('check geolocation', (c) => c.geolocationExists(id));
  }
}
