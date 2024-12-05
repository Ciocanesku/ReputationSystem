require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
        optimizer: {
            enabled: true,
            runs: 200,
        },
    },
},

  networks: {
    hardhat: {
      chainId: 1337, // Chain ID pentru rețeaua locală
    },
  },
};