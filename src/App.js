import './App.css';
import WalletCard from './WalletCard';
import WalletButton from './WalletButton';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'

// 1. Your WalletConnect Cloud project ID
const projectId = '17b8f50d90dd513d6a1590f742810732'

// 2. Set chains
const testnet = {
  chainId: 338,
  name: 'Cronos Testnet',
  currency: 'tCRO',
  explorerUrl: 'https://cronos.org/explorer/testnet3/',
  rpcUrl: 'https://evm-t3.cronos.org'
}

// 2. Set chains
const mainnet = {
  chainId: 25,
  name: 'Cronos Mainnet',
  currency: 'CRO',
  explorerUrl: 'https://cronoscan.com/',
  rpcUrl: 'https://evm.cronos.org'
}

// 3. Create a metadata object
const metadata = {
  name: 'EVO',
  description: 'AppKit Example',
  url: 'https://cyborgbh.io', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [testnet, mainnet],
  projectId,
  enableAnalytics: true // Optional - defaults to your Cloud configuration
})

function App() {
  return (
    <div className="App-corner">
      <WalletButton />
      <div className="App-header">
        <div className="centerCard">
          <div className = "card">
            <div className="App">
              <WalletCard />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
export default App;