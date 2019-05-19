import React, { Component } from 'react';
import Async from 'react-promise'
import { Button } from 'rimble-ui'

import getWeb3 from './../utils/getWeb3Window';

const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const contract = require('truffle-contract');
const Main = require('./../json/Main.json');
const AssetRegistry = require('./../json/AssetRegistry.json');
const StableToken = require('./../json/StableToken.json');
const contracts = require("./../json/contracts.json");

class Home extends Component {
  constructor(props) {
    super(props);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
  }

  // init web3 and contracts
  async componentWillMount() {
    // data provider
    console.log(process.env.REACT_APP_PRIVATE_KEY);
    let provider = new HDWalletProvider(process.env.REACT_APP_PRIVATE_KEY, process.env.REACT_APP_SKALE_URL);
    let web3 = new Web3(provider);

    let assetRegistryContract = contract({ ...AssetRegistry, address: contracts["development"]["AssetRegistry"] });
    assetRegistryContract.setProvider(web3.currentProvider);

    // contract
    let assetRegistry = await assetRegistryContract.deployed();

    // data
    let count = await assetRegistry.getAssetsCount();
    count = count.toNumber();
    console.log(count);

    let promises = [...Array(count).keys()].map((i) => {
      return new Promise(async (resolve, reject) => {
        const data = await assetRegistry.getAssetById(i);
        resolve(data);
      });
    });

    let records = Promise.all(promises);
    console.log(records);
  }

  componentDidUpdate() {
    // window.torus.communicationMux.getStream('status').on('data', function(status) {
    //   if (status.loggedIn) {
    //     console.log('hi!');
    //   }
    //   console.log('==============');
    // });
  }

  render() {
    return (
      <div className="App">
        <h1>eth-invest</h1>

      </div>
    );
  }
}
export default Home;
