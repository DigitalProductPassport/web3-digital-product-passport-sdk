import Web3 from 'web3';
import config from './config';
import ProductPassportABI from '@digitalproductpassport/smartcontracts/abi/json/contracts/ProductPassport.sol/ProductPassport.json';
import { AbiItem } from 'web3-utils';

interface ProductDetails {
  productId: number;
  description: string;
  manuals: string[];
  specifications: string[];
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  certifications: string;
  warrantyInfo: string;
  materialComposition: string;
  complianceInfo: string;
  ipfs: string;
}

class DigitalProductPassport {
  private web3: Web3;
  private account: string;
  private productPassportContract: Web3['eth']['Contract'] | undefined;

  constructor(contractAddress?: string) {
    const providerUrl = config.getProviderUrl();
    this.web3 = new Web3(providerUrl);

    const privateKey = config.getPrivateKey();
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    this.account = account.address;

    if (contractAddress) {
      // Initialize contract properly
      this.productPassportContract = new this.web3.eth.Contract(
        ProductPassportABI as AbiItem[], // Type assertion to AbiItem[]
        contractAddress,
        { /* Additional options if needed */ }
      ) as unknown as Web3['eth']['Contract']; // Use unknown then as Web3['eth']['Contract']
    }
  }

  async createProductPassport(productDetails: ProductDetails): Promise<void> {
    if (!this.productPassportContract) {
      throw new Error('Product passport contract address is required to create a passport.');
    }

    try {
      const {
        productId, description, manuals, specifications, batchNumber,
        productionDate, expiryDate, certifications, warrantyInfo,
        materialComposition, complianceInfo, ipfs
      } = productDetails;

      const tx = await this.productPassportContract.methods.createProductPassport(
        productId, description, manuals, specifications, batchNumber,
        productionDate, expiryDate, certifications, warrantyInfo,
        materialComposition, complianceInfo, ipfs
      ).send({ from: this.account, gas: 3000000 });

      console.log("Transaction hash:", tx.transactionHash);
      console.log("Product passport created successfully.");
    } catch (error: any) {
      console.error("Error creating product passport:", error);
      throw new Error(`Failed to create product passport: ${error.message}`);
    }
  }

  async getProductPassport(productId: number): Promise<any> {
    if (!this.productPassportContract) {
      throw new Error('Product passport contract address is required to get a passport.');
    }

    try {
      const passport = await this.productPassportContract.methods.getProductPassport(productId).call();
      console.log("Retrieved product passport:", passport);
      return passport;
    } catch (error: any) {
      console.error("Error getting product passport:", error);
      throw new Error(`Failed to retrieve product passport: ${error.message}`);
    }
  }
}

export { DigitalProductPassport };
