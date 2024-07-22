import { ethers } from 'ethers';
import { ProductPassport__factory, ProductDetails__factory } from '@digitalproductpassport/smartcontracts/types/factories/contracts';
import { ProductPassport as ProductPassportType } from '@digitalproductpassport/smartcontracts/types/contracts/ProductPassport';
import config from './config';

/**
 * Class representing a ProductPassports.
 * Provides functionality to deploy, manage, and interact with the Product Passport smart contract.
 */
class ProductPassports {
    private provider: ethers.JsonRpcProvider;
    private signer: ethers.Signer;
    private gweiBid: number;
    private productPassportContract: ProductPassportType | null;

    /**
     * Creates an instance of ProductPassports.
     * @param provider - An instance of ethers.JsonRpcProvider.
     * @param privateKey - The private key of the signer.
     * @param gweiBid - The gas bid in Gwei.
     */
    constructor(provider: ethers.JsonRpcProvider, privateKey: string, gweiBid: number) {
        this.provider = provider;
        this.signer = new ethers.Wallet(privateKey, provider);
        this.gweiBid = gweiBid;
        const productPassportAddress = config.getProductPassportAddress();

        if (productPassportAddress && ethers.isAddress(productPassportAddress)) {
            this.productPassportContract = ProductPassport__factory.connect(productPassportAddress, this.signer);
        } else {
            this.productPassportContract = null;
        }
    }

    /**
     * Deploys a new ProductPassport contract.
     * @param initialOwner - The address of the initial owner of the contract.
     * @returns The address of the deployed ProductPassport contract.
     */
    async deployProductPassport(initialOwner?: string): Promise<string> {
        console.info(`Deploying ProductPassport contract from ${await this.signer.getAddress()}`);

        const productPassportFactory = new ProductPassport__factory(this.signer);
        const contract = await productPassportFactory.deploy(initialOwner || await this.signer.getAddress());
        await contract.deploymentTransaction();
        await contract.waitForDeployment();
        const address = await contract.getAddress();

        console.info(`ProductPassport contract deployed at address: ${address}`);
        return address;
    }

    /**
     * Retrieves the product passport for a given product ID.
     * @param productId - The ID of the product.
     * @returns The product passport information.
     * @throws Error if the contract address is not initialized or retrieval fails.
     */
    async getProductPassport(productId: number): Promise<any> {
        if (!this.productPassportContract) {
            throw new Error('ProductPassport contract address is not initialized.');
        }

        try {
            const passport = await this.productPassportContract.getProduct(productId);
            console.info("Retrieved product passport:", passport);
            return passport;
        } catch (error: any) {
            console.error("Error getting product passport:", error);
            throw new Error(`Failed to retrieve product passport: ${error.message}`);
        }
    }

    /**
     * Sets the product passport information for a given contract address and product ID.
     * @param contractAddress - The address of the ProductDetails contract.
     * @param productId - The ID of the product.
     * @param productDetails - An object containing product details.
     * @returns The transaction receipt.
     * @throws Error if the contract address is not initialized or setting data fails.
     */
    async setProductPassportInfo(contractAddress: string, productId: string, productDetails: any): Promise<any> {
        if (!this.productPassportContract) {
            throw new Error('ProductPassport contract address is not initialized.');
        }

        const productDetailsContract = ProductDetails__factory.connect(contractAddress, this.signer);

        try {
            const tx = await productDetailsContract.setProduct(
                productId,
                productDetails.uid,
                productDetails.gtin,
                productDetails.taricCode,
                productDetails.manufacturerInfo,
                productDetails.consumerInfo,
                productDetails.endOfLifeInfo
            );
            await tx.wait();
            console.info(`Product set transaction receipt: ${tx.hash}`);
            return tx;
        } catch (error: any) {
            console.error(`Failed to set product: ${error.message}`);
            throw new Error(`Failed to set product: ${error.message}`);
        }
    }

    /**
     * Retrieves product information for a given product ID.
     * @param productId - The ID of the product.
     * @returns The product information.
     * @throws Error if the contract address is not initialized or retrieval fails.
     */
    async getProduct(productId: string): Promise<any> {
        if (!this.productPassportContract) {
            throw new Error('ProductPassport contract address is not initialized.');
        }

        try {
            const product = await this.productPassportContract.getProduct(productId);
            console.info(`Product retrieved: ${product}`);
            return product;
        } catch (error: any) {
            console.error(`Failed to retrieve product: ${error.message}`);
            throw new Error(`Failed to retrieve product: ${error.message}`);
        }
    }

    /**
     * Sets the product data for a given product ID.
     * @param productId - The ID of the product.
     * @param productData - An object containing product data.
     * @returns The transaction receipt.
     * @throws Error if the contract address is not initialized or setting data fails.
     */
    async setProductData(productId: number, productData: any): Promise<any> {
        if (!this.productPassportContract) {
            throw new Error('ProductPassport contract address is not initialized.');
        }

        try {
            const tx = await this.productPassportContract.setProductData(
                productId,
                productData.description,
                productData.manuals,
                productData.specifications,
                productData.batchNumber,
                productData.productionDate,
                productData.expiryDate,
                productData.certifications,
                productData.warrantyInfo,
                productData.materialComposition,
                productData.complianceInfo
            );
            await tx.wait();
            console.info(`Product data set transaction receipt: ${tx.hash}`);
            return tx;
        } catch (error: any) {
            console.error(`Failed to set product data: ${error.message}`);
            throw new Error(`Failed to set product data: ${error.message}`);
        }
    }

    /**
     * Retrieves the product data for a given product ID.
     * @param productId - The ID of the product.
     * @returns The product data.
     * @throws Error if the contract address is not initialized or retrieval fails.
     */
    async getProductData(productId: number): Promise<any> {
        if (!this.productPassportContract) {
            throw new Error('ProductPassport contract address is not initialized.');
        }

        try {
            const productData = await this.productPassportContract.getProductData(productId);
            console.info(`Product data retrieved: ${productData}`);
            return productData;
        } catch (error: any) {
            console.error(`Failed to retrieve product data: ${error.message}`);
            throw new Error(`Failed to retrieve product data: ${error.message}`);
        }
    }

    /**
     * Authorizes an entity to interact with the ProductPassport contract.
     * @param contractAddress - The address of the ProductPassport contract.
     * @param entityAddress - The address of the entity to be authorized.
     * @returns The transaction receipt.
     * @throws Error if the contract address is not initialized or authorization fails.
     */
    async authorizeEntity(contractAddress: string, entityAddress: string): Promise<any> {
        if (!this.productPassportContract) {
            throw new Error('ProductPassport contract address is not initialized.');
        }

        try {
            const tx = await this.productPassportContract.authorizeEntity(entityAddress);
            await tx.wait();
            console.info(`Entity authorized transaction receipt: ${tx.hash}`);
            return tx;
        } catch (error: any) {
            console.error(`Failed to authorize entity: ${error.message}`);
            throw new Error(`Failed to authorize entity: ${error.message}`);
        }
    }
}

export default ProductPassports;
