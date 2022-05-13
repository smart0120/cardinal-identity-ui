import { WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import type { Transaction } from '@solana/web3.js'
import { Connection, PublicKey } from '@solana/web3.js'
import type { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { AccountPopover } from '../src/components/AccountPopover'
import { WalletIdentityProvider } from '../src/providers/WalletIdentityProvider'

export default {
  title: 'Components/AccountPopover',
  component: AccountPopover,
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
} as ComponentMeta<typeof AccountPopover>

const Template: ComponentStory<typeof AccountPopover> = ({ ...args }) => {
  return (
    <WalletProvider wallets={[]}>
      <WalletModalProvider>
        <WalletIdentityProvider>
          <div className="flex items-center justify-center">
            <AccountPopover
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
