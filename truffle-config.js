const HDWalletProvider = require('@truffle/hdwallet-provider');

require('dotenv').config();

module.exports = {
  
  networks: {
      development: {
        host: "127.0.0.1",     
        port: 8545,            
        network_id: "*",       
       },
  },

  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions : { 
      gasPrice:1,
      token:'ETH',
      showTimeSpent: true,
    }
  },

  compilers: {
    solc: {
      version: "0.8.18",  
      settings: {          
        optimizer: {
          enabled: true,
          runs: 200
        }, 
      },
    },
  }, 
};
