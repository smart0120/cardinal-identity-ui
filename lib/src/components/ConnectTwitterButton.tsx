import { Button } from '../common/Button'
import { TwitterIcon } from '../common/TwitterIcon'
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

export const ConnectTwitterButton: React.FC<Props> = ({
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
  const { show } = useWalletIdentity()
  return (
    <Button
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
      <div style={{ height: '14px', width: '20px' }}>
        <TwitterIcon disabled={disabled} height={14} width={20} />
      </div>
      <span>Link Profile</span>
    </Button>
  )
}
