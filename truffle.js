const ProviderEngine = require("web3-provider-engine")
const HDWalletProvider = require("truffle-hdwallet-provider");
const NonceTrackerSubprovider = require("web3-provider-engine/subproviders/nonce-tracker");

require("dotenv").config();

module.exports = {
  mocha: {
    useColors: true
  },
  compilers: {
    solc: {
      version: "^0.5.5"
    }
  },
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    skale: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, process.env.SKALE_URL),
      network_id: "*"
    }
  }
};
