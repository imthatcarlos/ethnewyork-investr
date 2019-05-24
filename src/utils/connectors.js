import { Connectors } from 'web3-react'
const { InjectedConnector, NetworkOnlyConnector } = Connectors

const Metamask = new InjectedConnector({ supportedNetworks: [1] })

const Infura = new NetworkOnlyConnector({
  providerURL: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`
})

const Skale = new NetworkOnlyConnector({
  providerURL: process.env.REACT_APP_SKALE_URL
})

export default { Metamask, Infura, Skale };
