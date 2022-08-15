import type { Connection, PublicKey } from '@solana/web3.js'
import { HiUserCircle } from 'react-icons/hi'

import { useAddressImage } from '../hooks/useAddressImage'

export const AddressImage = ({
  connection,
  address,
  style,
  dev = false,
  height = '150px',
  width = '150px',
  dark = false,
  placeholder,
  loader,
}: {
  connection: Connection
  address: PublicKey | undefined
  dev?: boolean
  height?: string
  width?: string
  dark?: boolean
  placeholder?: React.ReactElement
  loader?: React.ReactElement
  style?: React.CSSProperties
}) => {
  const addressImage = useAddressImage(connection, address)
  return !addressImage.isFetched ? (
    loader ?? (
      <div
        className="animate-pulse rounded-full"
        style={{ backgroundColor: dark ? '#555' : '#DDD', height, width }}
      />
    )
  ) : addressImage.data ? (
    <img
      style={{
        ...style,
        height: height,
        width: width,
        borderRadius: '50%',
      }}
      alt={`profile-${address?.toString()}`}
      src={addressImage.data}
    />
  ) : (
    placeholder ?? (
      <div
        style={{
          color: 'rgb(209, 213, 219)',
          cursor: 'pointer',
          overflow: 'hidden',
          height,
          width,
        }}
      >
        <HiUserCircle
          style={{
            height,
            width,
            transform: 'scale(1.2)',
          }}
        />
      </div>
    )
  )
}
