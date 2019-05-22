import Web3 from 'web3';

const HDWalletProvider = require('truffle-hdwallet-provider');

function infuraNodeURL(ws, network) {
  if (ws) {
    return 'wss://' + network + '.infura.io/ws/v3/' + process.env.INFURA_API_KEY;
  } else {
    return 'https://' + network + '.infura.io/v3/' + process.env.INFURA_API_KEY;
  }
}

function getHttpProvider() {
  let network = process.env.REACT_APP_ETH_NETWORK;
  console.log(`using http provider on network: ${network}`);
  if (network === 'skale') {
    // need to include private key to access
    let provider = new HDWalletProvider(process.env.REACT_APP_PRIVATE_KEY, process.env.REACT_APP_SKALE_URL);
    return new Web3(provider);
  } else {
    return new Web3(new Web3.providers.HttpProvider(infuraNodeURL(false, network)));
  }
}

const getWeb3 = (httpOnly = false) => {
  return new Promise((resolve, reject) => {
    if (httpOnly) {
      return resolve(getHttpProvider());
    }

    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        console.log('Injected web3 detected. (modern)');
        resolve(web3);
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log('Injected web3 detected.');
        resolve(web3);
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.HttpProvider(
          'http://127.0.0.1:8545'
        );
        const web3 = new Web3(provider);
        console.log('No web3 instance injected, using Local web3.');
        resolve(web3);
      }
    });
  });
}

export default getWeb3;
