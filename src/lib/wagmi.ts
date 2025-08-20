import { http, createConfig } from 'wagmi'
import { mainnet, polygon, arbitrum, base, avalanche, optimism, bsc } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

const projectId = '88f8b929e5f5a3d3c9d7e5f5a3d3c9d7' // Replace with your actual WalletConnect project ID

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum, base, avalanche, optimism, bsc],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [avalanche.id]: http(),
    [optimism.id]: http(),
    [bsc.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}