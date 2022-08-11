import type { Connection, PublicKey } from '@solana/web3.js'

import { shortPubKey } from '../utils/format'
import { AddressImage } from './AddressImage'
import { DisplayAddress } from './DisplayAddress'

export const ProfileSmall = ({
  connection,
  address,
  dark,
  onClick,
  placeholder,
  className,
  style,
  dev,
}: {
  /** Solana RPC Connection to load this profile  */
  connection: Connection
  /** Address for which this profile is for */
  address: PublicKey | undefined
  /** Boolean for whether this should load dark or light loading bars */
  dark?: boolean
  /** onClick handler for clicking this profile */
  onClick?: () => void
  /** Placeholder for showing while the avatar is loading */
  placeholder?: React.ReactElement
  /** Optional class name to add to the profile div */
  className?: string
  /** Optional style prop to add to the profile div */
  style?: React.CSSProperties
  /** Optional dev environemnt */
  dev?: boolean
}) => {
  return (
    <div
      className={`${className} flex cursor-pointer gap-2 text-sm`}
      style={style}
      onClick={onClick}
    >
      <AddressImage
        connection={connection}
        address={address || undefined}
        dev={dev}
        height="40px"
        width="40px"
        dark={dark}
        placeholder={placeholder}
      />
      <div>
        <div className={`text-${dark ? 'white' : 'black'}`}>
          <DisplayAddress
            style={{ pointerEvents: 'none' }}
            connection={connection}
            address={address || undefined}
            dark={dark}
          />
        </div>
        <div className="text-sm text-gray-500">{shortPubKey(address)}</div>
      </div>
    </div>
  )
}
