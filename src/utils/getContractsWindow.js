const contract = require('truffle-contract');
const Main = require('./../json/Main.json');
const AssetRegistry = require('./../json/AssetRegistry.json');
const StableToken = require('./../json/StableToken.json');
const contracts = require('./../json/contracts.json');

const getContracts = async (web3) => {
  try {
    if (web3 === null) { throw new Error('web3 not initialized'); }

    let network = process.env.REACT_APP_ETH_NETWORK;

    let mainContract = contract({ ...Main, address: contracts[network]['Main'] });
    let assetRegistryContract = contract({ ...AssetRegistry, address: contracts[network]['AssetRegistry'] });
    let stableContract = contract({ ...StableToken, address: contracts[network]['StableToken'] });

    [mainContract, assetRegistryContract, stableContract].forEach((c) => {
      c.setProvider(web3.currentProvider);
    });

    let main = await mainContract.deployed();
    let assetRegistry = await assetRegistryContract.deployed();
    let stableToken = await stableContract.deployed();

    return {
      main:           main,
      assetRegistry:  assetRegistry,
      stableToken:    stableToken
    };
  } catch(error) {
    console.log(error);
    return;
  }
}

export default getContracts;
