import React, { Component, Fragment, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import Web3Provider, { useWeb3Context, Web3Consumer } from "web3-react";
import Web3 from 'web3'

import './App.css';
import Home from './views/Home';
import connectors from './utils/connectors';
import getContracts from './utils/getContractsWindow';

// skale file storage
import FilestorageClient from '@skalenetwork/filestorage.js'

const web3Consumer = <Web3ConsumerComponent/>;

// This component must be a child of <App> to have access to the appropriate context
function Web3Component () {
  const context = useWeb3Context()

  useEffect(() => {
    context.setConnector('Skale');
  }, [])

  if (!context.active && !context.error) {
    console.log('loading web3 context...');
  } else if (context.error) {
    //error
    console.log(context.error)
  } else {
    context.web3 = context.library;
    console.log('initialized skale network provider');
  }

  return web3Consumer;
}

function Web3ConsumerComponent() {
  return (
    <Web3Consumer>
      {context => {
        const { active } = context;
        let content;

        if (!active) {
          return(
            <Fragment>
              loading web3....
            </Fragment>
          );
        } else {
          return (
            <Views web3Context={context}/>
          );
        }
      }}
    </Web3Consumer>
  );
}

class Views extends Component {
  constructor(props) {
    super(props)

    this._getContracts = this._getContracts.bind(this);

    this.state = {
      contracts: null
    };
  }

  componentDidMount() {
    this._getContracts(); // init contracts deployed on skale
  }

  async _getContracts() {
    // init web3 and contracts
    let contracts = await getContracts(this.props.web3Context.web3);
    let filestorage = new FilestorageClient(this.props.web3Context.web3.currentProvider); // for skale

    this.setState({
      contracts: contracts,
      filestorage: filestorage
    });
  }

  render() {
    if (!this.state.contracts) {
      return (
        <Fragment>
          loading contracts....
        </Fragment>
      );
    } else {
      return (
        <Switch>
          <Fragment>
            <div>
              <Switch>
                <Route
                  exact path='/'
                  render={(props) => <Home
                                      {...props}
                                      web3Context={this.props.web3Context}
                                      contracts={this.state.contracts}
                                      filestorage={this.state.filestorage} />}
                />
              </Switch>
            </div>
          </Fragment>
        </Switch>
      );
    }
  }
}

class App extends Component {
  render() {
    return (
      <Web3Provider connectors={ connectors } libraryName={'web3.js'} web3Api={Web3}>
        <Web3Component />
      </Web3Provider>
    );
  }
}

export default App;
