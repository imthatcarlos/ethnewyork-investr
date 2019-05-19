require('dotenv').config();

const Main = require('./../build/contracts/Main.json');
const StableToken = require('./../build/contracts/StableToken.json');

// let's say every token will be worth 10 cents when asset is first fractionalized
const VALUE_PER_TOKEN_USD_CENTS = 10;

module.exports = async function(callback) {
  console.log('invest.js ------');

  try {
    let contracts = await getContracts();
    console.log('initialized contracts');

    // get first asset to invest in
    assetData = await contracts.assetRegistry.getAssetById(1);
    assetToken = await AssetToken.at(assetData.tokenAddress);

    const cap = contracts.web3.utils.fromWei(await assetToken.cap());
    // invest 10%
    const investingStable = (cap * VALUE_PER_TOKEN_USD_CENTS) * 0.1;
    const investingTokens = contracts.web3.utils.toWei(investingStable.toString(), 'ether')

    // user gets some DAI
    await contracts.stableToken.mint(accounts[0], investingTokens);

    // user approves the transfer of DAI
    await contracts.stableToken.approve(contracts.main.address, investingTokens, { from: accounts[0] })

    // user invests
    await contracts.main.invest(investingTokens, assetData.tokenAddress, { from: accounts[0] });

    // do stuff
    callback();
  } catch(error) {
    console.log(error);
    console.log('see errors --');
    callback();
  }
}
