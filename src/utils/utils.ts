import { ethers } from 'ethers';

/**
 * Checks that an address holds at least the given amount of native currency.
 *
 * @param provider - The provider used to read the balance.
 * @param address - The address to check.
 * @param amount - The minimum balance, in wei.
 * @throws Error if the balance is lower than `amount`.
 */
export const checkFunds = async (
  provider: ethers.Provider,
  address: string,
  amount: ethers.BigNumberish,
): Promise<void> => {
  const balance = await provider.getBalance(address);
  if (balance < BigInt(amount)) {
    throw new Error('Insufficient funds');
  }
};
