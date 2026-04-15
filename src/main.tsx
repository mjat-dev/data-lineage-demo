import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CodattaConnectContextProvider } from 'codatta-connect'
import 'codatta-connect/dist/codatta-connect.css'
import { baseSepolia } from 'viem/chains'
import './styles/globals.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CodattaConnectContextProvider chains={[baseSepolia]}>
      <App />
    </CodattaConnectContextProvider>
  </StrictMode>,
)
