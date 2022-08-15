import './styles.css'
import 'tailwindcss/tailwind.css'

import { WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { getWalletAdapters } from '@solana/wallet-adapter-wallets'
import { WalletIdentityProvider } from 'lib/src'
import type { Identity } from 'lib/src/common/Identities'
import type { AppProps } from 'next/app'
import {
  EnvironmentProvider,
  getInitialProps,
} from 'providers/EnvironmentProvider'

require('@solana/wallet-adapter-react-ui/styles.css')

const App = ({
  Component,
  pageProps,
  identity,
  cluster,
}: AppProps & { cluster: string; identity: Identity }) => (
  <EnvironmentProvider defaultCluster={cluster}>
    <WalletProvider wallets={getWalletAdapters()}>
      <WalletModalProvider>
        <WalletIdentityProvider identities={identity ? [identity] : undefined}>
          <Component {...pageProps} />
        </WalletIdentityProvider>
      </WalletModalProvider>
    </WalletProvider>
  </EnvironmentProvider>
)

App.getInitialProps = getInitialProps

export default App
