import type { Connection, PublicKey } from '@solana/web3.js'
import ContentLoader from 'react-content-loader'
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
}: {
  connection: Connection
  address: PublicKey | undefined
  dev?: boolean
  height?: string
  width?: string
  dark?: boolean
  placeholder?: React.ReactNode
  style?: React.CSSProperties
}) => {
  const addressImage = useAddressImage(connection, address, dev)

  if (!address) return <></>
  return addressImage.isLoading ? (
    <div
      style={{
        ...style,
        height,
        width,
        borderRadius: '50%',
        overflow: 'hidden',
      }}
    >
      <ContentLoader
        backgroundColor={dark ? '#333' : undefined}
        foregroundColor={dark ? '#555' : undefined}
      >
        <rect
          x="0"
          y="0"
          rx={width}
          ry={height}
          width={width}
          height={height}
        />
      </ContentLoader>
    </div>
  ) : addressImage.data ? (
    <img
      style={{
        ...style,
        height: height,
        width: width,
        borderRadius: '50%',
      }}
      alt={`profile-${address.toString()}`}
      src={addressImage.data}
    ></img>
  ) : (
    <>{placeholder}</> || (
      <HiUserCircle style={{ width, height }} className="text-gray-300" />
    )
  )
}
