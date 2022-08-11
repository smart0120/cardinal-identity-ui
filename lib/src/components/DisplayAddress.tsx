import type { Connection, PublicKey } from '@solana/web3.js'

import { useAddressName } from '../hooks/useAddressName'
import { formatShortAddress, formatTwitterLink } from '../utils/format'

type Props = {
  connection: Connection
  address: PublicKey | undefined
  dark?: boolean
  style?: React.CSSProperties
  loader?: React.ReactElement
}

export const DisplayAddress: React.FC<Props> = ({
  connection,
  address,
  dark = false,
  style,
  loader,
}: Props) => {
  const addressName = useAddressName(connection, address)

  if (!address) return <></>
  return addressName.isLoading ? (
    loader ?? (
      <div
        className="h-5 w-24 animate-pulse rounded-md"
        style={{ backgroundColor: dark ? '#555' : '#DDD' }}
      />
    )
  ) : (
    <div
      style={{
        display: 'flex',
        gap: '5px',
        color: dark ? 'white' : 'black',
        ...style,
      }}
    >
      {addressName.data?.includes('@')
        ? formatTwitterLink(addressName.data)
        : addressName.data || formatShortAddress(address)}
    </div>
  )
}
