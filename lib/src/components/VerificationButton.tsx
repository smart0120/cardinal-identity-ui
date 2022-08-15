import type { Wallet } from '@saberhq/solana-contrib'

import { Button } from '../common/Button'
import type { Identity } from '../common/Identities'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'

export const VerificationButton = ({
  wallet,
  identity,
  disabled,
  callback,
}: {
  wallet?: Wallet
  identity: Identity
  disabled: boolean
  callback?: () => void
}) => {
  const { appInfo } = useWalletIdentity()
  const link = identity.verificationUrl(wallet?.publicKey.toString(), appInfo)
  return (
    <div
      onClick={() => {
        window.open(link, '_blank')
        callback && callback()
      }}
    >
      <Button
        style={{ marginTop: '5px', padding: '0px 20px 0px 20px' }}
        variant="primary"
        bgColor={identity?.colors.primary}
        disabled={disabled}
      >
        {identity && identity.icon({ variant: 'light', height: 14, width: 14 })}
        <span style={{ fontSize: '12px' }}>Verify</span>
      </Button>
    </div>
  )
}
