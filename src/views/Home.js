import React, { Component, Fragment } from 'react';
import Async from 'react-promise'
import { Button } from 'rimble-ui'
import ListingItem from './ListingItem';

import getWeb3 from './../utils/getWeb3Window';
import getContracts from './../utils/getContractsWindow';

// skale file storage
const Filestorage = require('@skalenetwork/filestorage.js/src/index');

class Home extends Component {
  constructor(props) {
    super(props);

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);

    this.state = {
      web3: null,
      contracts: {},
      assets: []
    };
  }

  // init web3 and contracts
  async componentWillMount() {
    let web3 = await getWeb3(true); // passing true to initialize web3 with http provider (or hdwallet for skale)
    let contracts = await getContracts(web3);
    let filestorage = new Filestorage(web3.currentProvider); // for skale

    // retrive all assets in the registry
    let count = await contracts.assetRegistry.getAssetsCount();
    let promises = [...Array(count.toNumber()).keys()].map((i) => {
      return new Promise(async (resolve, reject) => {
        const data = await contracts.assetRegistry.getAssetById(i + 1); // indexed starting at 1
        resolve(data);
      });
    });

    let records = await Promise.all(promises);
    console.log(records);

    this.setState({
      web3: web3,
      contracts: contracts,
      assets: records,
      filestorage: filestorage
    });

    // to render after downloding
    //<img src={`data:image/jpeg;base64,${data}`} />
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
    let content;
    if (this.state.assets.length) {
      let elements = this.state.assets.map((asset) => {
        return (
          <ListingItem data={asset} filestorage={this.state.filestorage} key={`asset-${asset.tokenAddress}`}/>
        )
      });

      content = (
        <Fragment>
          <div className="items-container">
            { elements }
          </div>
        </Fragment>
      );
    } else {
      content = (
        <Fragment>
          <div>Loading data...</div>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <div className="App">
        <div className="header outer-container">
          <p>Investr</p>
        </div>

        { content }

        <div className="footer outer-container">
          <p>made with solidity, truffle, web3, + skale</p>
        </div>
      </div>
      </Fragment>
    );
  }
}
export default Home;
