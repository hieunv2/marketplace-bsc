require("dotenv").config();

const HDWalletProvider = require("truffle-hdwallet-provider-privkey");
const privateKeys =
  "55f5f2ee49da244087d94642dce9bf4341ec17e1d8c5dd590ca8c847329f0fa7";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*", //match any network id
    },
    bsc: {
      provider: function () {
        return new HDWalletProvider(
          privateKeys.split(","), // array of private keys
          `https://data-seed-prebsc-1-s1.binance.org:8545` // Url to an Ethereum node
        );
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 97,
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(
          privateKeys.split(","), // array of private keys
          `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}` // Url to an Ethereum node
        );
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 4,
    },
  },
  contracts_directory: "./src/contracts",
  contracts_build_directory: "./src/abis",

  // Configure your compilers
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      version: "^0.8.0",
    },
  },
};
