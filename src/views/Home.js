import React, { Component, Fragment } from 'react';
// import { ThemeProvider } from 'styled-components'
// import theme from './theme'
import { Button } from 'rimble-ui'

import ListingItem from './ListingItem';
import { shortAddress } from './../utils/numbers';

class Home extends Component {
  constructor(props) {
    super(props);

    this._loadAssets = this._loadAssets.bind(this);
    this.enableMetamask = this.enableMetamask.bind(this);

    this.state = {
      coinbase: null,
      assets: null
    };
  }

  componentDidMount() {
    this._loadAssets();
  }

  async _loadAssets() {
    // retrive all assets in the registry
    let count = await this.props.contracts.assetRegistry.getAssetsCount();
    let promises = [...Array(count.toNumber()).keys()].map((i) => {
      return new Promise(async (resolve, reject) => {
        const data = await this.props.contracts.assetRegistry.getAssetById(i + 1); // indexed starting at 1
        resolve(data);
      });
    });

    let records = await Promise.all(promises);
    this.setState({ assets: records });
  }

  async enableMetamask(e) {
    e.preventDefault();

    // if modern dapp browser, must request access
    //if (window.ethereum) { await this.props.web3Context.enable(); }

    this.props.web3Context.setConnector('Metamask');

    console.log(this.props.web3Context.account);
    //this.setState({ coinbase: this.props.web3Context.account });
  }

  render() {
    let mainContent;
    if (this.state.assets === null) {
      mainContent = 'loading assets...'
    } else {
      let items = this.state.assets.map((asset) => {
        return (
          <ListingItem data={asset} filestorage={this.props.filestorage} key={`asset-${asset.tokenAddress}`}/>
        );
      });

      mainContent = (
        <Fragment>
          <div className="items-container">
            { items }
          </div>
        </Fragment>
      );
    }

    let accountInfo;
    if (this.state.coinbase) {
      accountInfo = ( <p>{ shortAddress(this.state.coinbase) }</p> );
    } else {
      accountInfo = (
        <Button size={'small'} onClick={(event) => this.enableMetamask(event)}>
          Enable metamask
        </Button>
      );
    }

    return (
      <Fragment>
        <div className="App">
          <div className="header outer-container">
            <p>Investr</p>
            <div className="account-info">
              { accountInfo }
            </div>
          </div>

          { mainContent }

          <div className="footer outer-container">
            <p>made with solidity, truffle, web3, + skale</p>
          </div>
        </div>
      </Fragment>
    );
  }
}
export default Home;
