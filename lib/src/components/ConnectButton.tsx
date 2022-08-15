import { Button } from '../common/Button'
import type { Identity } from '../common/Identities'
import type { ShowParams } from '../providers/WalletIdentityProvider'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'

interface Props
  extends Omit<
      React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
      >,
      'onClick'
    >,
    ShowParams {
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  forceIdentity?: Identity
}

export const ConnectButton: React.FC<Props> = ({
  variant = 'primary',
  dev,
  cluster,
  connection,
  secondaryConnection,
  wallet,
  onClose,
  disabled,
  forceIdentity,
  ...buttonProps
}: Props) => {
  const { show, identities } = useWalletIdentity()
  const identity = identities.length === 1 ? identities[0] : undefined
  return (
    <Button
      bgColor={forceIdentity?.colors.primary || identity?.colors.primary}
      variant={variant}
      disabled={disabled}
      {...buttonProps}
      onClick={() => {
        !disabled &&
          show({
            wallet,
            connection,
            cluster,
            secondaryConnection,
            dev,
            onClose,
            verifyIdentity: identity?.name,
          })
      }}
    >
      {identity && (
        <div style={{ width: '14px' }} className="align-middle">
          <img
            className="text-white "
            alt={`${forceIdentity?.name || identity?.name}-icon`}
            src={forceIdentity?.icon || identity?.icon}
          />
        </div>
      )}
      <span className="ml-2">
        Link {forceIdentity?.displayName || 'Profile'}
      </span>
    </Button>
  )
}
