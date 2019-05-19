require('dotenv').config();

const contract = require('truffle-contract');
const Main = require('./../build/contracts/Main.json');
const StableToken = require('./../build/contracts/StableToken.json');
const AssetToken = require('./../build/contracts/AssetToken.json');
const getContracts = require('./../src/utils/getContracts');

// let's say every token will be worth 10 cents when asset is first fractionalized
const VALUE_PER_TOKEN_USD_CENTS = 10;

module.exports = async function(callback) {
  console.log('invest.js ------');

  try {
    let contracts = await getContracts();
    let accounts = contracts.accounts;
    console.log('initialized contracts');

    // get first asset to invest in
    assetData = await contracts.assetRegistry.getAssetById(1);
    console.log(assetData);
    assetTokenC = contract({ ...AssetToken, address: assetData.tokenAddress });
    assetTokenC.setProvider(contracts.web3.currentProvider);
    let assetToken = await assetTokenC.deployed();

    // how much does the user want to invest - 10%
    const cap = contracts.web3.utils.fromWei(await assetToken.cap());
    const investingStable = (cap * VALUE_PER_TOKEN_USD_CENTS) * 0.1;
    const investingTokens = contracts.web3.utils.toWei(investingStable.toString(), 'ether')

    // user gets some DAI for that
    await contracts.stableToken.mint(accounts[0], investingTokens);

    // user approves the transfer of DAI
    await contracts.stableToken.approve(contracts.main.address, investingTokens, { from: accounts[0] })

    // user invests
    await contracts.main.invest(investingTokens, assetData.tokenAddress, { from: accounts[0] });

    // more users invest...

    // creator funds the token contract with sponsor money
    let TOTAL_FUNDS = 100000000;
    let CREATOR_ACCOUNT = contracts.accounts[0];
    await contracts.web3.send(assetToken.address, TOTAL_FUNDS, { from: CREATOR_ACCOUNT });

    // all users can now claim their profts at a first come first serve basis
    // profit is calculated on-chain
    // burns their tokens in the process
    await assetToken.claimFundsAndBurn({ from: accounts[0] });
    await assetToken.claimFundsAndBurn({ from: accounts[1] });
    await assetToken.claimFundsAndBurn({ from: accounts[2] });

    // once all profits are claimed, contract selt destructs

    callback();
  } catch(error) {
    console.log(error);
    console.log('see errors --');
    callback();
  }
}
