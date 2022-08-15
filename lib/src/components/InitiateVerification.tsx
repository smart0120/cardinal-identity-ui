import type { Wallet } from '@saberhq/solana-contrib'

import { Button } from '../common/Button'
import type { Identity } from '../common/Identities'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'

export const InitiateVerification = ({
  wallet,
  identity,
  disabled,
  callback,
  cluster,
}: {
  wallet?: Wallet
  identity: Identity
  disabled: boolean
  callback?: () => void
  cluster?: string | undefined
}) => {
  const link = useGenerateLink(identity, wallet?.publicKey?.toString(), cluster)
  return (
    <a
      href={link}
      onClick={() => {
        window.open(link, '_blank')
        callback && callback()
      }}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-block"
    >
      <Button
        style={{ marginTop: '5px', padding: '0px 20px 0px 20px' }}
        variant="primary"
        bgColor={identity?.colors.primary}
        disabled={disabled}
      >
        <div style={{ width: '14px' }} className="align-middle">
          <img
            className="text-white "
            alt={`${identity?.name}-icon`}
            src={identity?.icon}
          />
        </div>
        <span style={{ fontSize: '12px' }}>Verify</span>
      </Button>
    </a>
  )
}

const useGenerateLink = (
  identity: Identity,
  pubkey: string | undefined,
  cluster?: string | undefined
): string => {
  const { appInfo } = useWalletIdentity()
  if (!pubkey) return ''
  let link = ''
  const tweetAt = appInfo?.twitter ?? appInfo?.name
  switch (identity.name) {
    case 'twitter': {
      link = [
        `https://twitter.com/intent/tweet?text=`,
        encodeURIComponent(
          [
            `Claiming my Twitter handle as a @Solana NFT${
              tweetAt ? ` on ${tweetAt}` : ''
            } using @cardinal_labs protocol and linking it to my address ${pubkey}\n\n`,
            `Verify and claim yours at https://twitter.cardinal.so${
              cluster === 'devnet' ? '?cluster=devnet' : ''
            }!`,
          ].join('')
        ),
      ].join('')
      break
    }
    case 'discord': {
      link =
        'https://discord.com/oauth2/authorize?response_type=code&client_id=992004845101916191&scope=identify&state=15773059ghq9183habn&redirect_uri=http://localhost:3000/verification?identity=discord&prompt=consent'
      break
    }
    default: {
      throw new Error('Incorrect identity')
    }
  }
  return link
}
