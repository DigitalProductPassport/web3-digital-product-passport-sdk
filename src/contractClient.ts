import { ethers } from 'ethers';
import type {
  NonPayableOverrides,
  TypedContractMethod,
} from './contracts/common.js';

/**
 * Minimal logger interface. `console` satisfies it.
 */
export interface Logger {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

/**
 * Logger that discards every message.
 */
export const silentLogger: Logger = {
  info: () => {},
  error: () => {},
};

/**
 * Options shared by every contract client.
 */
export interface ContractClientOptions {
  /** Address of an already deployed contract. Defaults to the matching environment variable. */
  address?: string;
  /** Gas price (in Gwei) for transactions. When omitted, the network fee data is used. */
  gweiBid?: number | string;
  /** Logger for transaction hashes and errors. Defaults to `console`. */
  logger?: Logger;
}

type Ownable = ethers.BaseContract & {
  owner: TypedContractMethod<[], [string], 'view'>;
  transferOwnership: TypedContractMethod<
    [newOwner: ethers.AddressLike],
    [void],
    'nonpayable'
  >;
};

/**
 * Transaction overrides applied by the clients.
 */
export type TxOverrides = NonPayableOverrides & { from?: string };

/**
 * Extracts the most useful message from an ethers error (the revert reason when there is one).
 */
export const errorMessage = (error: unknown): string => {
  const e = error as {
    reason?: string;
    shortMessage?: string;
    message?: string;
  };
  if (e?.reason) {
    return e.reason;
  }
  // Hardhat signers report reverts as "VM Exception ... reverted with reason string '<reason>'".
  const revert = e?.message?.match(/reverted with reason string '(.*)'/);
  return revert?.[1] ?? e?.shortMessage ?? e?.message ?? String(error);
};

/**
 * Base class for the contract clients. Holds the signer and the connected contract,
 * and wraps transactions and calls with logging and error handling.
 */
export abstract class ContractClient<T extends Ownable> {
  protected readonly signer: ethers.Signer;
  protected readonly logger: Logger;
  private readonly gweiBid?: number | string;
  private readonly contractName: string;
  private readonly connectFn: (address: string, runner: ethers.Signer) => T;
  private contract: T | null = null;

  protected constructor(
    contractName: string,
    connectFn: (address: string, runner: ethers.Signer) => T,
    signer: ethers.Signer,
    options: ContractClientOptions,
    defaultAddress: string,
  ) {
    this.contractName = contractName;
    this.connectFn = connectFn;
    this.signer = signer;
    this.gweiBid = options.gweiBid;
    this.logger = options.logger ?? console;

    const address = options.address || defaultAddress;
    if (address && ethers.isAddress(address)) {
      this.attach(address);
    }
  }

  /**
   * Connects the client to a deployed contract.
   * @param address - The contract address.
   */
  attach(address: string): void {
    if (!ethers.isAddress(address)) {
      throw new Error(
        `Invalid ${this.contractName} contract address: ${address}`,
      );
    }
    this.contract = this.connectFn(address, this.signer);
  }

  /**
   * @returns The address of the connected contract, or `null` if the client is not connected.
   */
  async getAddress(): Promise<string | null> {
    return this.contract ? this.contract.getAddress() : null;
  }

  /**
   * @returns The underlying TypeChain contract, for calls the client does not wrap.
   * @throws Error if the client is not connected to a contract.
   */
  getContract(): T {
    if (!this.contract) {
      throw new Error(
        `${this.contractName} contract address is not initialized.`,
      );
    }
    return this.contract;
  }

  /**
   * @returns The address of the contract owner.
   */
  async owner(): Promise<string> {
    return this.read('get owner', (c) => c.owner());
  }

  /**
   * Transfers ownership of the contract.
   * @param newOwner - The address of the new owner.
   */
  async transferOwnership(
    newOwner: string,
  ): Promise<ethers.ContractTransactionReceipt> {
    return this.write('transfer ownership', (c, overrides) =>
      c.transferOwnership(newOwner, overrides),
    );
  }

  /**
   * Transaction overrides derived from the client options.
   */
  protected overrides(): TxOverrides {
    if (this.gweiBid === undefined || this.gweiBid === '') {
      return {};
    }
    return { gasPrice: ethers.parseUnits(String(this.gweiBid), 'gwei') };
  }

  /**
   * Deploys the contract and connects the client to it.
   * @param deployFn - Deploys the contract with the given owner and overrides.
   * @param initialOwner - The contract owner. Defaults to the signer address.
   * @returns The address of the deployed contract.
   */
  protected async deployWith(
    deployFn: (owner: string, overrides: TxOverrides) => Promise<T>,
    initialOwner?: string,
  ): Promise<string> {
    const deployer = await this.signer.getAddress();
    this.logger.info(
      `Deploying ${this.contractName} contract from ${deployer}`,
    );

    try {
      const contract = await deployFn(
        initialOwner || deployer,
        this.overrides(),
      );
      await contract.waitForDeployment();
      const address = await contract.getAddress();
      this.contract = this.connectFn(address, this.signer);
      this.logger.info(
        `${this.contractName} contract deployed at address: ${address}`,
      );
      return address;
    } catch (error) {
      const message = `Failed to deploy ${this.contractName}: ${errorMessage(error)}`;
      this.logger.error(message);
      throw new Error(message, { cause: error });
    }
  }

  /**
   * Sends a transaction and waits for it to be mined.
   * @param action - Description of the action, used in log and error messages.
   * @param send - Sends the transaction.
   * @returns The transaction receipt.
   */
  protected async write(
    action: string,
    send: (
      contract: T,
      overrides: TxOverrides,
    ) => Promise<ethers.ContractTransactionResponse>,
  ): Promise<ethers.ContractTransactionReceipt> {
    const contract = this.getContract();
    try {
      const tx = await send(contract, this.overrides());
      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error(`Transaction ${tx.hash} was not mined`);
      }
      this.logger.info(`${action} transaction: ${tx.hash}`);
      return receipt;
    } catch (error) {
      const message = `Failed to ${action}: ${errorMessage(error)}`;
      this.logger.error(message);
      throw new Error(message, { cause: error });
    }
  }

  /**
   * Calls a view function.
   * @param action - Description of the action, used in error messages.
   * @param call - Performs the call.
   */
  protected async read<R>(
    action: string,
    call: (contract: T) => Promise<R>,
  ): Promise<R> {
    const contract = this.getContract();
    try {
      return await call(contract);
    } catch (error) {
      const message = `Failed to ${action}: ${errorMessage(error)}`;
      this.logger.error(message);
      throw new Error(message, { cause: error });
    }
  }
}
