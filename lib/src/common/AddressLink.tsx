import type { PublicKey } from '@solana/web3.js'

import { useWalletIdentity } from '../providers/WalletIdentityProvider'

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  address?: PublicKey
  children: React.ReactElement
}

export const AddressLink: React.FC<Props> = ({
  children,
  address,
  ...props
}: Props) => {
  const { cluster } = useWalletIdentity()
  if (!address) return children
  return (
    <div
      onClick={() =>
        window.open(
          `https://explorer.solana.com/address/${address.toString()}?cluster=${cluster}`
        )
      }
      className="cursor-pointer"
      {...props}
    >
      {children}
    </div>
  )
}
