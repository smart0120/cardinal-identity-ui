import { contrastColorMode } from '@cardinal/common'
import { useWalletIdentity } from 'lib/src'
import { darken, lighten } from 'polished'
import { FaCheck, FaExclamation } from 'react-icons/fa'

export const Alert = ({ message, type }: { message: string; type: string }) => {
  const { identities } = useWalletIdentity()
  const identity = identities.length === 1 ? identities[0] : undefined
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-light-1 py-2 text-center text-xs text-light-4"
      style={{
        background: identity?.colors.buttonColor,
        color: identity?.colors.buttonColor
          ? contrastColorMode(identity?.colors.buttonColor)[1]
            ? lighten(0.5, identity?.colors.buttonColor)
            : darken(0.5, identity?.colors.buttonColor)
          : undefined,
      }}
    >
      {type === 'success' && <FaCheck />}
      {type === 'warning' && <FaExclamation />}
      <span className="ml-2">{message}</span>
    </div>
  )
}
