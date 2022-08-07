import type { Connection, PublicKey } from '@solana/web3.js'
import ContentLoader from 'react-content-loader'

import { useAddressName } from '../hooks/useAddressName'
import { formatShortAddress, formatTwitterLink } from '../utils/format'

export const DisplayAddress = ({
  connection,
  address,
  height = '20px',
  width = '100px',
  dark = false,
  style,
}: {
  connection: Connection
  address: PublicKey | undefined
  height?: string
  width?: string
  dark?: boolean
  style?: React.CSSProperties
}) => {
  const addressName = useAddressName(connection, address)

  if (!address) return <></>
  return addressName.isLoading ? (
    <div
      style={{
        ...style,
        height,
        width,
        overflow: 'hidden',
      }}
    >
      <ContentLoader
        backgroundColor={dark ? '#333' : undefined}
        foregroundColor={dark ? '#555' : undefined}
      >
        <rect style={{ ...style }} x={0} y={0} width={width} height={height} />
      </ContentLoader>
    </div>
  ) : (
    <div style={{ display: 'flex', gap: '5px', ...style }}>
      {addressName.data?.includes('@')
        ? formatTwitterLink(addressName.data)
        : addressName.data || formatShortAddress(address)}
    </div>
  )
}
