require('dotenv').config();

const getContracts = require('./../src/utils/getContracts');
var FileAPI = require('file-api')
  , File = FileAPI.File
  , FileList = FileAPI.FileList
  , FileReader = FileAPI.FileReader
  ;

// skale file storage
const Filestorage = require('@skalenetwork/filestorage.js/src/index');
let filestorage;

// let's say every token will be worth 10 cents when asset is first fractionalized
const VALUE_PER_TOKEN_USD_CENTS = 10;

function calculateProjectedProfit(value, annualizedROI, timeframeMonths = 12) {
  return (value * (annualizedROI / 100)) * (timeframeMonths / 12);
}

async function uploadFile(account, filePath, fileName) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onerror = reject;

    reader.onload = async function(e) {
      const arrayBuffer = reader.result
      const bytes = new Uint8Array(arrayBuffer);
      let link = filestorage.uploadFile(
        account,
        fileName,
        bytes,
        process.env.PRIVATE_KEY// for these test assets, just use master key
      );

      resolve(link);
    };

    reader.readAsArrayBuffer(new File(filePath));
  });
}

async function downloadFile(link) {
  let file = await filestorage.downloadToBuffer(link);
  file = 'data:image/png;base64,' + file.toString('base64');
  console.log(file);
}

async function addAsset(contracts, assetName, filePath, fileNamePre) {
  let VALUE_USD = 100000; // let them all be 100k by default
  let CAP = VALUE_USD / VALUE_PER_TOKEN_USD_CENTS;
  let ANNUALIZED_ROI = 15; // %
  let TIMEFRAME_MONTHS = 12;

  // upload file to skale
  let fileName = fileNamePre + '-' + contracts.web3.utils.randomHex(2);
  let link;
  try {
    link = await uploadFile(contracts.accounts[0], filePath, fileName);
    console.log(`link to asset image on skale network: ${link}`);
  } catch (error) {
    console.log(error);
    link = "";
  }

  let asset = [
    assetName,
    VALUE_USD,
    CAP,
    ANNUALIZED_ROI,
    (VALUE_USD + calculateProjectedProfit(VALUE_USD, ANNUALIZED_ROI, TIMEFRAME_MONTHS)),
    TIMEFRAME_MONTHS,
    VALUE_PER_TOKEN_USD_CENTS,
    link
  ];

  // add asset
  console.log('adding NFT asset...');
  // if we initialize Filestorage with the same provider, we can rely on the nonce being updated
  //const nonce = await contracts.web3.eth.getTransactionCount(contracts.accounts[0]);
  const result = await contracts.assetRegistry.addAsset(contracts.accounts[0], ...asset, { from: contracts.accounts[0] });
  const log = result.logs.filter((log) => { return log.event === 'AssetRecordCreated' } );
  const id = log.length ? log[0].args.id.toNumber() : null;
  console.log(`added record, id: ${id}`);

  const record = await contracts.assetRegistry.getAssetById(id);
  console.log(record);
}

module.exports = async function(callback) {
  console.log('assets.js ------');

  try {
    let contracts = await getContracts();
    console.log('initialized contracts');

    filestorage = new Filestorage(contracts.web3.currentProvider);
    console.log('initialized filestorage with current provider');

    let assets = [
      ['20 Water St New York NY', 'src/assets/asset1.jpeg', 'property'],
      ['Creative Content', 'src/assets/creative.jpeg', 'creative'],
      ['NFT', 'src/assets/kitty.jpg', 'nft']
    ];

    await addAsset(contracts, ...assets[0]);
    await addAsset(contracts, ...assets[1]);
    await addAsset(contracts, ...assets[2]);

    callback();
  } catch(error) {
    console.log(error);
    console.log('see errors --');
    callback();
  }
}
