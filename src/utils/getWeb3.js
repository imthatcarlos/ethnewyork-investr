require('dotenv').config();

const Web3 = require('web3');

const HDWalletProvider = require('truffle-hdwallet-provider');
const NonceTrackerSubprovider = require('web3-provider-engine/subproviders/nonce-tracker');
const WebsocketSubprovider = require('web3-provider-engine/subproviders/websocket');

function infuraNodeURL(ws, network) {
  if (ws) {
    return 'wss://' + network + '.infura.io/ws/v3/' + process.env.INFURA_API_KEY;
  } else {
    return 'https://' + network + '.infura.io/v3/' + process.env.INFURA_API_KEY;
  }
}

function addNonceProvider(provider) {
  var nonceTracker = new NonceTrackerSubprovider();
  provider.engine._providers.unshift(nonceTracker);
  nonceTracker.setEngine(provider.engine);
  return provider;
}

function addWebsocketProvider(provider, network) {
  var websocket = new WebsocketSubprovider({ rpcUrl: infuraNodeURL(true, network) });
  provider.engine._providers.unshift(websocket);
  websocket.setEngine(provider.engine);
  return provider;
}

module.exports = async function getWeb3(ws = false) {
  var web3;
  try {
    const networkIdx = process.argv.indexOf('--network');
    const network = networkIdx != -1 ? process.argv[networkIdx + 1] : 'development';

    console.log(`using web3 on network: ${network}`);

    let provider;
    if (network === 'development') {
      console.log('using localhost provider');
      provider = ws ?
        new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545') :
        new Web3.providers.HttpProvider('http://127.0.0.1:8545');
    } else if (process.env.MNEMONIC) {
      provider = new HDWalletProvider(process.env.MNEMONIC, infuraNodeURL(false, network));
      provider = addNonceProvider(provider);
      if (ws) { provider = addWebsocketProvider(provider, network); }
    } else if (process.env.SKALE_URL) {
      provider = new HDWalletProvider(process.env.PRIVATE_KEY, process.env.SKALE_URL);
      if (ws) { provider = addWebsocketProvider(provider, network); }
    } else {
      return { error: true, web3: null };
    }

    web3 = new Web3(provider);

    if (ws) {
      // can't make http request with websocket provider, nor do we need
      return { web3: web3, network: network };
    }
    else {
      const accounts = await web3.eth.getAccounts();
      console.log('setting coinbase as: ' + accounts[0].toLowerCase());

      return {
        web3: web3,
        network: network,
        coinbase: accounts[0].toLowerCase(),
        accounts: accounts
      };
    }
  } catch(error) {
    console.log(error);

    return { web3: web3, error: true }
  }
}
