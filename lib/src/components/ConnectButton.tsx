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
  forceFlow?: Identity
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
  forceFlow,
  ...buttonProps
}: Props) => {
  const { show, identity, setIdentity } = useWalletIdentity()
  return (
    <Button
      bgColor={forceFlow?.colors.primary || identity?.colors.primary}
      variant={variant}
      disabled={disabled}
      {...buttonProps}
      onClick={() => {
        if (!forceFlow) {
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
          setIdentity(forceFlow)
        }
      }}
    >
      {(forceFlow && forceFlow.name !== 'default') ||
      identity.name !== 'default' ? (
        <>
          <div style={{ width: '14px' }} className="align-middle">
            <img
              className="text-white "
              alt={`${forceFlow?.name || identity?.name}-icon`}
              src={forceFlow?.icon || identity?.icon}
            />
          </div>
          <span className="ml-2">
            Link {forceFlow?.displayName || 'Profile'}
          </span>
        </>
      ) : (
        <>Link your identities</>
      )}
    </Button>
  )
}
