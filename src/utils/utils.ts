import Web3 from 'web3';

export const checkFunds = async (web3: Web3, address: string, amount: number) => {
    const balance = await web3.eth.getBalance(address);
    if (Number(balance) < amount) {
        throw new Error("Insufficient funds");
    }
};