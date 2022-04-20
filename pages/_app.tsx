import './styles.css'
import 'tailwindcss/tailwind.css'

import { WalletIdentityProvider } from '@cardinal/namespaces-components'
import { WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { getWalletAdapters } from '@solana/wallet-adapter-wallets'
import type { AppProps } from 'next/app'
import { EnvironmentContextProvider } from 'providers/EnvironmentProvider'

require('@solana/wallet-adapter-react-ui/styles.css')

const App = ({ Component, pageProps }: AppProps) => (
  <div>
    <EnvironmentContextProvider>
      <WalletProvider wallets={getWalletAdapters()}>
        <WalletModalProvider>
          <WalletIdentityProvider>
            <Component {...pageProps} />
          </WalletIdentityProvider>
        </WalletModalProvider>
      </WalletProvider>
    </EnvironmentContextProvider>
  </div>
)

export default App
