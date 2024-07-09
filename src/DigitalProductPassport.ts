import { ethers } from 'ethers';
import DigitalProductPassportABI from '@digitalproductpassport/smartcontracts/artifacts/contracts/DigitalProductPassport.json';

export class DigitalProductPassport {
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;

  constructor(providerUrl: string, contractAddress: string) {
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
    this.contract = new ethers.Contract(contractAddress, DigitalProductPassportABI.abi, this.provider);
  }

  async getPassportData(tokenId: number): Promise<any> {
    return await this.contract.getPassportData(tokenId);
  }

  async createPassport(data: any): Promise<any> {
    const signer = this.provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    return await contractWithSigner.createPassport(data);
  }
}