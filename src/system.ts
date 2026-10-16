import { ethers } from 'ethers';
import type { ContractClientOptions } from './contractClient.js';
import { Geolocation } from './geolocation.js';
import { ComplexManagement } from './complexManagement.js';
import { ProductPassports } from './ProductPassport.js';
import { Batch } from './batch.js';

/**
 * Addresses of a deployed Digital Product Passport system.
 */
export interface SystemAddresses {
  geolocation: string;
  complexManagement: string;
  productPassport: string;
  batch: string;
}

/**
 * Clients connected to every contract of a Digital Product Passport system.
 */
export interface DigitalProductPassportSystem {
  geolocation: Geolocation;
  complexManagement: ComplexManagement;
  productPassport: ProductPassports;
  batch: Batch;
}

/**
 * Options for `deploySystem` and `connectSystem`.
 */
export type SystemOptions = Omit<ContractClientOptions, 'address'>;

/**
 * Creates clients for an already deployed system. Addresses that are not given fall back to
 * the environment variables read by each client.
 * @param signer - The signer used to send transactions.
 * @param addresses - The contract addresses.
 * @param options - Gas price and logger shared by every client.
 */
export const connectSystem = (
  signer: ethers.Signer,
  addresses: Partial<SystemAddresses> = {},
  options: SystemOptions = {},
): DigitalProductPassportSystem => ({
  geolocation: new Geolocation(signer, {
    ...options,
    address: addresses.geolocation,
  }),
  complexManagement: new ComplexManagement(signer, {
    ...options,
    address: addresses.complexManagement,
  }),
  productPassport: new ProductPassports(signer, {
    ...options,
    address: addresses.productPassport,
  }),
  batch: new Batch(signer, { ...options, address: addresses.batch }),
});

/**
 * Deploys and wires the full Digital Product Passport system, like the SmartContracts
 * Ignition module:
 *
 * 1. Deploys Geolocation, ComplexManagement, ProductPassport and IntegratedProductPassportBatch.
 * 2. Links ComplexManagement to Geolocation, ProductPassport to ComplexManagement, and the
 *    batch contract to the other three.
 * 3. Transfers ownership of Geolocation to ComplexManagement, because `addComplex` writes
 *    geolocations through it.
 *
 * @param signer - The deployer. It owns the contracts while they are wired.
 * @param options - Gas price, logger, and `initialOwner` to hand ownership of ComplexManagement,
 *                  ProductPassport and the batch contract to another address after wiring.
 * @returns Clients connected to the deployed contracts, and their addresses.
 */
export const deploySystem = async (
  signer: ethers.Signer,
  options: SystemOptions & { initialOwner?: string } = {},
): Promise<DigitalProductPassportSystem & { addresses: SystemAddresses }> => {
  const { initialOwner, ...clientOptions } = options;
  // Ignore addresses from the environment: every contract is deployed fresh.
  const system = connectSystem(
    signer,
    { geolocation: '', complexManagement: '', productPassport: '', batch: '' },
    clientOptions,
  );
  const { geolocation, complexManagement, productPassport, batch } = system;

  const addresses: SystemAddresses = {
    geolocation: await geolocation.deployGeolocation(),
    complexManagement: await complexManagement.deployComplexManagement(),
    productPassport: await productPassport.deployProductPassport(),
    batch: await batch.deployBatch(),
  };

  await complexManagement.setGeolocationContract(addresses.geolocation);
  await productPassport.setComplexManagement(addresses.complexManagement);
  await batch.initializeContracts(
    addresses.productPassport,
    addresses.complexManagement,
    addresses.geolocation,
  );
  await geolocation.transferOwnership(addresses.complexManagement);

  const deployer = await signer.getAddress();
  if (
    initialOwner &&
    ethers.getAddress(initialOwner) !== ethers.getAddress(deployer)
  ) {
    await complexManagement.transferOwnership(initialOwner);
    await productPassport.transferOwnership(initialOwner);
    await batch.transferOwnership(initialOwner);
  }

  return { ...system, addresses };
};
