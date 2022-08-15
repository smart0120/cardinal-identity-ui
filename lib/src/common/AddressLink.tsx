import type { PublicKey } from '@solana/web3.js'

import { useWalletIdentity } from '../providers/WalletIdentityProvider'

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  address?: PublicKey
  children: React.ReactNode
}

export const AddressLink = ({ children, address }: Props) => {
  const { cluster } = useWalletIdentity()
  if (!address) return children
  return (
    <a
      href={`https://explorer.solana.com/address/${address.toString()}?cluster=${cluster}`}
      target="_blank"
      rel="noopener noreferrer"
      className="cursor-pointer"
    >
      {children}
    </a>
  )
}
