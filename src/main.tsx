import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CodattaConnectContextProvider } from 'codatta-connect'
import 'codatta-connect/dist/codatta-connect.css'
import { defineChain } from 'viem'
import './styles/globals.css'
import App from './App.tsx'

const BSC_CHAIN = defineChain({
  id: 56,
  name: 'BNB Smart Chain Mainnet',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://bsc-dataseed1.bnbchain.org'] }
  },
  blockExplorers: {
    default: { name: 'BSCScan', url: 'https://bscscan.com' }
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CodattaConnectContextProvider chains={[BSC_CHAIN]}>
      <App />
    </CodattaConnectContextProvider>
  </StrictMode>,
)
