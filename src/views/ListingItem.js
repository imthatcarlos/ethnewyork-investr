import React, { Component, Fragment } from 'react';
import { Button } from 'rimble-ui'
import { shortAddress } from './../utils/numbers'

const Filestorage = require('@skalenetwork/filestorage.js/src/index');

class ListingItem extends Component {
  constructor(props) {
    super(props);

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);

    this.state = {
      ready: false,
      file: null
    };
  }

  async componentWillMount() {
    let buffer = await this.props.filestorage.downloadToBuffer(this.props.data.fileURL);
    let file = 'data:image/png;base64,' + buffer.toString('base64');

    this.setState({ ready: true, file: file });
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
    if (!this.state.ready) {
      return (
        <Fragment>
          <div>loading asset file...</div>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <div className="item-container">
            <div className="item-photo-container">
              <img style={{maxHeight: '100%', maxWidth: '100%', objectFit: 'contain'}} src={this.state.file}/>
            </div>
            <div className="item-description-container">
              <h2>{this.props.data.name}</h2>
              <p>owned by account: { shortAddress(this.props.data.owner) }</p>
              <p>value USD: { this.props.data.valueUSD.toNumber() }</p>
              <button>Invest</button>
            </div>
          </div>
        </Fragment>
      );
    }
  }
}
export default ListingItem;
