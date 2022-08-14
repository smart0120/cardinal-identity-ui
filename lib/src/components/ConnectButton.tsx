import { Button } from '../common/Button'
import { Identity } from '../common/Identities'
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
  showManage,
  forceIdentity,
  ...buttonProps
}: Props) => {
  const { show, identity, setIdentity } = useWalletIdentity()
  return (
    <Button
      bgColor={forceIdentity?.colors.primary || identity?.colors.primary}
      variant={variant}
      disabled={disabled}
      {...buttonProps}
      onClick={() => {
        if (!forceIdentity) {
          !disabled &&
            show({
              wallet,
              connection,
              cluster,
              secondaryConnection,
              dev,
              onClose,
              showManage,
            })
        } else {
          setIdentity(forceIdentity)
        }
      }}
    >
      {(forceIdentity && forceIdentity.name !== 'default') ||
      identity.name !== 'default' ? (
        <>
          <div style={{ width: '14px' }} className="align-middle">
            <img
              className="text-white "
              alt={`${forceIdentity?.name || identity?.name}-icon`}
              src={forceIdentity?.icon || identity?.icon}
            />
          </div>
          <span className="ml-2">
            Link {forceIdentity?.displayName || 'Profile'}
          </span>
        </>
      ) : (
        <>Link your identities</>
      )}
    </Button>
  )
}
