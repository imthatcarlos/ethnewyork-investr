const getContracts = require('./../src/utils/getContracts');

// let's say every token will be worth 10 cents when asset is first fractionalized
const VALUE_PER_TOKEN_USD_CENTS = 10;

function calculateProjectedProfit(value, annualizedROI, timeframeMonths = 12) {
  return (value * (annualizedROI / 100)) * (timeframeMonths / 12);
}

module.exports = async function(callback) {
  console.log('development.js ------');

  try {
    let contracts = await getContracts();
    console.log('initialized contracts');

    const ASSET_NAME = "TEST ASSET 1";
    const VALUE_USD = 100000; // let them all be 100k by default
    const CAP = VALUE_USD / VALUE_PER_TOKEN_USD_CENTS;
    const ANNUALIZED_ROI = 15; // %
    const TIMEFRAME_MONTHS = 12;

    let asset1 = [
      ASSET_NAME,
      VALUE_USD,
      CAP,
      ANNUALIZED_ROI,
      (VALUE_USD + calculateProjectedProfit(VALUE_USD, ANNUALIZED_ROI, TIMEFRAME_MONTHS)),
      TIMEFRAME_MONTHS,
      VALUE_PER_TOKEN_USD_CENTS
    ];

    console.log('adding test assets...');
    await contracts.assetRegistry.addAsset(contracts.accounts[0], ...asset1, { from: contracts.accounts[0] });
    console.log('done');

    // do stuff
    callback();
  } catch(error) {
    console.log(error);
    console.log('see errors --');
    callback();
  }
}
