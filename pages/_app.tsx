import './styles.css'
import 'tailwindcss/tailwind.css'

import { WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { getWalletAdapters } from '@solana/wallet-adapter-wallets'
import { ToastContainer } from 'common/Notification'
import { WalletIdentityProvider } from 'lib/src'
import type { IdentityName } from 'lib/src/common/Identities'
import { IDENTITIES } from 'lib/src/common/Identities'
import type { AppProps } from 'next/app'
import {
  EnvironmentProvider,
  getInitialProps,
} from 'providers/EnvironmentProvider'

require('@solana/wallet-adapter-react-ui/styles.css')

const App = ({
  Component,
  pageProps,
  identityName,
  cluster,
}: AppProps & { cluster: string; identityName: IdentityName }) => (
  <EnvironmentProvider defaultCluster={cluster}>
    <WalletProvider wallets={getWalletAdapters()} autoConnect>
      <WalletIdentityProvider
        identities={identityName ? [IDENTITIES[identityName]] : undefined}
      >
        <WalletModalProvider>
          <>
            <ToastContainer />
            <Component {...pageProps} />
          </>
        </WalletModalProvider>
      </WalletIdentityProvider>
    </WalletProvider>
  </EnvironmentProvider>
)

App.getInitialProps = getInitialProps

export default App
