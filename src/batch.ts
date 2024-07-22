import { ethers } from 'ethers';
import { Batch__factory } from '@digitalproductpassport/smartcontracts/types/factories/contracts';
import { Batch as BatchType } from '@digitalproductpassport/smartcontracts/types/contracts/Batch';
import config from './config';

/**
 * Class representing a Batch contract.
 * This class provides methods to deploy, set, and retrieve batch details from a Batch contract on the Ethereum blockchain.
 */
class Batch {
    private provider: ethers.JsonRpcProvider;
    private signer: ethers.Signer;
    private gweiBid: number;
    private logger: Console;
    private batchContract: BatchType | null;

    /**
     * Creates an instance of the Batch class.
     * @param provider - An ethers provider to interact with the Ethereum network.
     * @param privateKey - The private key used to sign transactions.
     * @param gweiBid - The gas price (in Gwei) to use for transactions.
     */
    constructor(provider: ethers.JsonRpcProvider, privateKey: string, gweiBid: number) {
        this.provider = provider;
        this.signer = new ethers.Wallet(privateKey, provider);
        this.gweiBid = gweiBid;
        this.logger = console;

        const batchContractAddress = config.getBatchContractAddress();
        if (batchContractAddress && ethers.isAddress(batchContractAddress)) {
            this.batchContract = Batch__factory.connect(batchContractAddress, this.signer);
        } else {
            this.batchContract = null;
        }
    }

    /**
     * Deploys a new Batch contract to the Ethereum blockchain.
     * @param initialOwner - The address to be set as the initial owner of the contract.
     * @returns A promise that resolves to the address of the deployed Batch contract.
     */
    async deployBatch(initialOwner?: string): Promise<string> {
        this.logger.info(`Deploying Batch contract from ${await this.signer.getAddress()}`);

        const batchFactory = new Batch__factory(this.signer);
        const contract = await batchFactory.deploy(initialOwner || await this.signer.getAddress());
        await contract.deploymentTransaction();
        await contract.waitForDeployment();
        const address = await contract.getAddress();

        this.batchContract = Batch__factory.connect(address, this.signer);

        this.logger.info(`Batch contract deployed at address: ${address}`);
        return address;
    }

    /**
     * Sets the details of a batch in the Batch contract.
     * @param batchId - The identifier for the batch.
     * @param batchDetails - An object containing details of the batch, including product IDs, production date, expiry date, and location.
     * @throws Error if the Batch contract address is not initialized or the transaction fails.
     */
    async setBatch(batchId: string, batchDetails: any): Promise<void> {
        if (!this.batchContract) {
            throw new Error('Batch contract address is not initialized.');
        }

        try {
            const tx = await this.batchContract.setBatchDetails(
                batchId,
                batchDetails.productIds,
                batchDetails.productionDate,
                batchDetails.expiryDate,
                batchDetails.location
            );
            await tx.wait();
            this.logger.info(`Batch creation transaction receipt: ${tx.hash}`);
        } catch (error: any) {
            this.logger.error(`Failed to create batch: ${error.message}`);
            throw new Error(`Failed to create batch: ${error.message}`);
        }
    }

    /**
     * Retrieves details of a batch from the Batch contract.
     * @param batchId - The identifier for the batch.
     * @returns A promise that resolves to the details of the batch.
     * @throws Error if the Batch contract address is not initialized or the retrieval fails.
     */
    async getBatch(batchId: string): Promise<any> {
        if (!this.batchContract) {
            throw new Error('Batch contract address is not initialized.');
        }

        try {
            const batch = await this.batchContract.getBatchDetails(batchId);
            this.logger.info(`Batch retrieved: ${batch}`);
            return batch;
        } catch (error: any) {
            this.logger.error(`Failed to retrieve batch: ${error.message}`);
            throw new Error(`Failed to retrieve batch: ${error.message}`);
        }
    }
}

export { Batch };
