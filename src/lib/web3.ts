import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, polygon, arbitrum, base, avalanche, optimism, bsc } from '@reown/appkit/networks'

// 1. Get projectId from https://cloud.reown.com
const projectId = '88f8b929e5f5a3d3c9d7e5f5a3d3c9d7'

// 2. Create a metadata object - optional
const metadata = {
  name: 'Affiliate Tracker',
  description: 'Crypto Affiliate Tracking Platform',
  url: 'https://mywebsite.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 3. Create the AppKit instance
const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet, polygon, arbitrum, base, avalanche, optimism, bsc],
  metadata,
  projectId,
  features: {
    analytics: true
  }
})

export { appKit }