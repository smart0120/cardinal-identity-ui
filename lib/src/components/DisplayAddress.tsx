import type { Connection, PublicKey } from '@solana/web3.js'

import { getIdentity } from '../common/Identities'
import { useAddressName } from '../hooks/useAddressName'
import { formatIdentityLink, formatShortAddress } from '../utils/format'

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  connection: Connection
  address: PublicKey | undefined
  dark?: boolean
  hideIcon?: boolean
  disableLink?: boolean
  style?: React.CSSProperties
  loader?: React.ReactElement
}

export const DisplayAddress: React.FC<Props> = ({
  connection,
  address,
  dark = false,
  style,
  loader,
  hideIcon,
  disableLink,
  ...props
}: Props) => {
  const addressName = useAddressName(connection, address)
  const identity = addressName.data
    ? getIdentity(addressName.data[1])
    : undefined
  return addressName.isLoading ? (
    loader ?? (
      <div
        className="h-5 w-24 animate-pulse rounded-md"
        style={{ backgroundColor: dark ? '#555' : '#DDD' }}
      />
    )
  ) : (
    <div
      className="flex items-center gap-1"
      style={{
        display: 'flex',
        color: dark ? 'white' : 'black',
        ...style,
      }}
      {...props}
    >
      {addressName.data
        ? formatIdentityLink(addressName.data[0], addressName.data[1])
        : addressName.data || formatShortAddress(address)}
      {!hideIcon &&
        identity &&
        identity.icon &&
        identity.icon({ variant: 'colored', width: 18, height: 18 })}
    </div>
  )
}
