import { Connection, PublicKey } from '@solana/web3.js'
import type { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { ProfileSmall } from '../lib/components/ProfileSmall'
import { WalletIdentityProvider } from '../lib/providers/WalletIdentityProvider'
import { tryPublicKey } from '../lib/utils/format'

export default {
  title: 'Components/ProfileSmall',
  component: ProfileSmall,
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
} as ComponentMeta<typeof ProfileSmall>

const Template: ComponentStory<typeof ProfileSmall> = ({ ...args }) => {
  const publicKey = tryPublicKey(args.address)
  if (publicKey) {
    return (
      <WalletIdentityProvider>
        <div className="ml-[40%]">
          <ProfileSmall
            address={publicKey}
            connection={
              args.connection ||
              new Connection('https://api.mainnet-beta.solana.com')
            }
          />
        </div>
      </WalletIdentityProvider>
    )
  }
  return <div>Invalid Public Key</div>
}

export const Primary = Template.bind({})
Primary.args = {
  address: new PublicKey('DNVVBNkdyv6tMentHdjVz5cpYmjQYcquLfYkz1fApT7Q'),
  connection: new Connection('https://api.mainnet-beta.solana.com'),
}
