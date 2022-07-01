import { Button } from '../common/Button'
import { LinkingFlow } from '../common/LinkingFlows'
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
  showManage,
  ...buttonProps
}: Props) => {
  const { show, linkingFlow } = useWalletIdentity()
  return (
    <Button
      bgColor={linkingFlow?.colors.primary}
      variant={variant}
      disabled={disabled}
      {...buttonProps}
      onClick={() =>
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
      }
    >
      <div style={{ width: '14px' }} className="align-middle">
        <img
          className="text-white "
          alt={`${linkingFlow?.name}-icon`}
          src={linkingFlow?.icon}
        />
      </div>
      <span>Link Profile</span>
    </Button>
  )
}
