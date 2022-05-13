import { WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import type { Transaction } from '@solana/web3.js'
import { Connection, PublicKey } from '@solana/web3.js'
import type { ComponentStory } from '@storybook/react'
import React from 'react'

import { AccountConnect } from '../src/components/AccountConnect'
import { WalletIdentityProvider } from '../src/providers/WalletIdentityProvider'

export default {
  title: 'Components/AccountConnect',
  argTypes: {
    connection: {
      options: ['mainnet', 'devnet', 'testnet'],
      description: 'Solana RPC connection to fetch the mapping from',
      mapping: {
        mainnet: new Connection('https://api.mainnet-beta.solana.com'),
        devnet: new Connection('https://api.devnet.solana.com'),
        testnet: new Connection('https://api.testnet.solana.com'),
      },
      address: {
        control: 'text',
      },
    },
  },
}

const Template: ComponentStory<typeof AccountConnect> = ({ ...args }) => {
  return (
    <WalletProvider wallets={[]}>
      <WalletModalProvider>
        <WalletIdentityProvider>
          <div className="flex items-center justify-center">
            <AccountConnect
              dark={args.dark}
              handleDisconnect={() => {}}
              wallet={{
                signTransaction: async (tx: Transaction) => tx,
                signAllTransactions: async (txs: Transaction[]) => txs,
                publicKey: new PublicKey(
                  'DNVVBNkdyv6tMentHdjVz5cpYmjQYcquLfYkz1fApT7Q'
                ),
              }}
              environment="mainnet-beta"
              connection={
                args.connection ||
                new Connection('https://api.mainnet-beta.solana.com')
              }
              style={args.style}
            />
          </div>
        </WalletIdentityProvider>
      </WalletModalProvider>
    </WalletProvider>
  )
}

export const Light = Template.bind({})
Light.args = {
  connection: new Connection('https://api.mainnet-beta.solana.com'),
}

export const Dark = Template.bind({})
Dark.args = {
  connection: new Connection('https://api.mainnet-beta.solana.com'),
  dark: true,
}
