const contract = require('truffle-contract');
const getWeb3 = require('./getWeb3');

const Main = require('./../../build/contracts/Main.json');
const AssetRegistry = require('./../../build/contracts/AssetRegistry.json');
const StableToken = require('./../../build/contracts/StableToken.json');
const contracts = require("./../json/contracts.json");

module.exports = async function getContracts(websocket = false) {
  try {
    // we're providing the web3 object in dev mode + with mnemonic + priv_key
    // should probably swap out for metamask / dapper depending on the view
    // goal being to swap out for server-side solution after
    const web3 = await getWeb3(websocket);

    if (web3.error === null) { reject(web3.web3 !== null) }

    let mainContract = contract({ ...Main, address: contracts[web3.network]["Main"] });
    let assetRegistryContract = contract({ ...AssetRegistry, address: contracts[web3.network]["AssetRegistry"] });
    let stableContract = contract({ ...StableToken, address: contracts[web3.network]["StableToken"] });

    [mainContract, assetRegistryContract, stableContract].forEach((c) => {
      c.setProvider(web3.web3.currentProvider);
    });

    let main = await mainContract.deployed();
    let assetRegistry = await assetRegistryContract.deployed();
    let stableToken = await stableContract.deployed();

    console.log(web3.accounts);

    return {
      network:        web3.network,
      web3:           web3.web3,
      accounts:       web3.accounts,
      coinbase:       web3.coinbase,
      main:           main,
      assetRegistry:  assetRegistry,
      stableToken:    stableToken
    };
  } catch(error) {
    console.log(error);
    console.log('========')
    return;
  }
}
