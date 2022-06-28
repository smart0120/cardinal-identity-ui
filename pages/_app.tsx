import './styles.css'
import 'tailwindcss/tailwind.css'

import { WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { getWalletAdapters } from '@solana/wallet-adapter-wallets'
import { WalletIdentityProvider } from 'lib/src'
import type { AppProps } from 'next/app'
import {
  EnvironmentProvider,
  getInitialProps,
} from 'providers/EnvironmentProvider'

import type {
  LinkingFlow} from './providers/LinkingFlowProvider';
import {
  LinkingFlowProvider,
} from './providers/LinkingFlowProvider'

require('@solana/wallet-adapter-react-ui/styles.css')

const App = ({
  Component,
  pageProps,
  linkingFlow,
}: AppProps & { linkingFlow: LinkingFlow }) => (
  <EnvironmentProvider>
    <WalletProvider wallets={getWalletAdapters()}>
      <WalletModalProvider>
        <WalletIdentityProvider>
          <LinkingFlowProvider defaultLinkingFlow={linkingFlow}>
            <Component {...pageProps} />
          </LinkingFlowProvider>
        </WalletIdentityProvider>
      </WalletModalProvider>
    </WalletProvider>
  </EnvironmentProvider>
)

App.getInitialProps = getInitialProps

export default App
