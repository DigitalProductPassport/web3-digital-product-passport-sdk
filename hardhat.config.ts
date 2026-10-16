import hardhatEthers from '@nomicfoundation/hardhat-ethers';
import hardhatMocha from '@nomicfoundation/hardhat-mocha';
import { defineConfig } from 'hardhat/config';

// Hardhat is only used to run the test suite against an in-process network.
// The SDK deploys contracts from the bytecode bundled in src/contracts.
export default defineConfig({
  plugins: [hardhatEthers, hardhatMocha],
  paths: {
    tests: {
      mocha: './tests',
    },
  },
});
