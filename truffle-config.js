require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

const privateKey = process.env.PRIVATE_KEY;
const infuraKey = process.env.INFURAKEY;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
      from: "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
    },
    mainnet: {
      provider: () =>
        new HDWalletProvider(
          privateKey,
          `https://mainnet.infura.io/v3/${INFURAKEY}`
        ),
      network_id: 1,
      gas: 8000000,
      gasPrice: 240000000000,
      timeoutBlocks: 5000000, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
      // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    bsctestnet: {
      provider: () =>
        new HDWalletProvider(
          privateKey,
          `https://data-seed-prebsc-1-s1.binance.org:8545/`
        ),
      network_id: 97,
      timeoutBlocks: 5000000, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true,
      networkCheckTimeout: 60000
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          privateKey,
          `https://rinkeby.infura.io/v3/${infuraKey}`
        ),
      network_id: 4,
      gas: 8000000,
      gasPrice: 50000000000,
      timeoutBlocks: 5000000, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
    },
  },
  //
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.6.11", // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200,
        },
        //  evmVersion: "byzantium"
      },
    },
    solc: {
      version: "0.8.4", // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200,
        },
        //  evmVersion: "byzantium"
      },
    }
  },
};
