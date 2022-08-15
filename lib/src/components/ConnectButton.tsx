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
  ...buttonProps
}: Props) => {
  const { show, identities } = useWalletIdentity()
  const identity = identities.length === 1 ? identities[0] : undefined
  return (
    <Button
      bgColor={identity?.colors.primary || '#000'}
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
            alt={`${identity?.name}-icon`}
            src={identity?.icon}
          />
        </div>
      )}
      <span className="ml-2">Link {identity?.displayName || 'profile'}</span>
    </Button>
  )
}
