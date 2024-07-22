import { ethers } from 'ethers';
import { ProductPassport__factory, ProductDetails__factory } from '@digitalproductpassport/smartcontracts/types/factories/contracts';
import { ProductPassport as ProductPassportType } from '@digitalproductpassport/smartcontracts/types/contracts/ProductPassport';
import config from './config';

class ProductPassports {
    private provider: ethers.JsonRpcProvider;
    private signer: ethers.Signer;
    private gweiBid: number;
    private productPassportContract: ProductPassportType | null;

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
