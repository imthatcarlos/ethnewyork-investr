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

const axios = require('axios');

// let's say every token will be worth 10 cents when asset is first fractionalized
const VALUE_PER_TOKEN_USD_CENTS = 10;

function calculateProjectedProfit(value, annualizedROI, timeframeMonths = 12) {
  return (value * (annualizedROI / 100)) * (timeframeMonths / 12);
}

// on file load, upload to skale and return the link
// loads from path or URL
async function uploadFile(account, data, accountPriv = null) {
  // unless specified as owned by user, owned by dapp
  let privateKey = accountPriv || process.env.PRIVATE_KEY;

  return new Promise(async(resolve, reject) => {
    let reader = new FileReader();

    const uploadBuffer = (arrayBuffer) => {
      try {
        const bytes = new Uint8Array(arrayBuffer);
        let link = filestorage.uploadFile(
          account,
          data.fileName,
          bytes,
          privateKey
        );
        resolve(link);
      } catch (error) {
        console.log(error);
        resolve();
      }
    };

    reader.onerror = reject;
    reader.onload = async function(e) {
      uploadBuffer(reader.result);
    }

    if (data.fileObj !== undefined) { // for accepting from browser - should be strategy for object
      reader.readAsArrayBuffer(data.fileObj); // => onload
    } else if (data.filePath !== null) {
      reader.readAsArrayBuffer(new File(data.filePath)); // => onload
    } else if (data.fileURL !== null) {
      let response = await axios.get(data.fileURL, { responseType: 'arraybuffer' });
      if (response.status === 200) {
        uploadBuffer(response.data);
      } else {
        resolve();
      }
    } else {
      throw new Error('no file data passed');
    }
  });
}

async function downloadFile(link) {
  let file = await filestorage.downloadToBuffer(link);
  file = 'data:image/png;base64,' + file.toString('base64');
  console.log(file);
}

async function addAsset(contracts, assetName, filePath, fileTag, fileURL = null) {
  let VALUE_USD = 100000; // let them all be 100k by default
  let CAP = VALUE_USD / VALUE_PER_TOKEN_USD_CENTS;
  let ANNUALIZED_ROI = 15; // %
  let TIMEFRAME_MONTHS = 12;

  // upload file to skale
  let fileName = fileTag + '-' + contracts.web3.utils.randomHex(2);
  let link;
  try {
    console.log('uploading file to skale');
    link = await uploadFile(contracts.accounts[0], { fileName: fileName, filePath: filePath, fileURL: fileURL });
    console.log(`link: ${link}`);
  } catch (error) {
    console.log(error);
    throw new Error('error uploading file');
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
  console.log(`adding  asset (${assetName})`);
  // if we initialize Filestorage with the same provider, we can rely on the nonce being updated
  //const nonce = await contracts.web3.eth.getTransactionCount(contracts.accounts[0]);
  const result = await contracts.assetRegistry.addAsset(contracts.accounts[0], ...asset, { from: contracts.accounts[0] });
  const log = result.logs.filter((log) => { return log.event === 'AssetRecordCreated' } );
  const id = log.length ? log[0].args.id.toNumber() : null;
  console.log(`id: ${id} => `);

  const record = await contracts.assetRegistry.getAssetById(id);
  console.log(record);
}

module.exports = async function(callback) {
  console.log('assets.js ------');

  try {
    let contracts = await getContracts();
    console.log('initialized contracts');

    if (contracts.network === 'development') {
      // gotta do this otherwise we run into gas limit errors when uploading to
      filestorage = new Filestorage(process.env.SKALE_URL);
    } else {
      filestorage = new Filestorage(contracts.web3.currentProvider);
    }

    let assets = [
      ['20 Water St New York NY', 'src/assets/asset1.jpeg', 'property'],
      ['Creative Content', 'src/assets/creative.jpeg', 'creative'],
      ['NFT', null, 'nft', 'https://hanezu.github.io/assets/img/avatar.png']
    ];

    console.log('adding assets...');
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
