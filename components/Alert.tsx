import { contrastify } from '@cardinal/common'
import { useWalletIdentity } from 'lib/src'
import { FaCheck, FaExclamation } from 'react-icons/fa'

export const Alert = ({ message, type }: { message: string; type: string }) => {
  const { identities } = useWalletIdentity()
  const identity = identities.length === 1 ? identities[0] : undefined
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-light-1 p-2 text-center text-xs text-light-4 border-2 border-[#000]"
    >
      {type === 'success' && <FaCheck />}
      {type === 'warning' && <FaExclamation />}
      <span className="ml-2">{message}</span>
    </div>
  )
}
