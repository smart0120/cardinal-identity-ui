import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, Connection } from '@solana/web3.js'
import React from 'react'
import { FaPowerOff, FaUser } from 'react-icons/fa'

import { ProfileSmall, useWalletIdentity } from '../'

export const AccountPopover = ({
  connection,
  environment,
  wallet,
  style,
  dark,
  handleDisconnect,
}: {
  connection: Connection
  wallet: Wallet
  environment: Cluster
  handleDisconnect: () => void
  dark?: boolean
  style?: React.CSSProperties
}) => {
  const { show } = useWalletIdentity()
  if (!wallet.publicKey) return <></>
  return (
    <div className="w-screen max-w-[300px] ">
      <div
        className="w-full rounded-lg shadow-2xl"
        style={{
          ...style,
          backgroundColor: dark ? 'rgb(42, 44, 52)' : 'rgb(255, 255, 255)',
          color: dark ? '#fff' : '#333',
        }}
      >
        <div className="flex items-center justify-between p-7 pb-0">
          <div className="grid gap-2 text-base">
            <div className="flex items-center">
              <ProfileSmall
                dark={dark}
                connection={connection}
                address={wallet.publicKey}
              />
            </div>
          </div>
          <div className="flex gap-3"></div>
        </div>
        <div className="flex flex-col gap-1 p-5">
          {wallet && (
            <MenuItem
              dark={dark}
              onClick={async () =>
                show({
                  wallet: wallet as Wallet,
                  connection,
                  cluster: environment,
                })
              }
            >
              <FaUser />
              <span>Edit Profile</span>
            </MenuItem>
          )}
          <MenuItem onClick={handleDisconnect} dark={dark}>
            <FaPowerOff />
            <span>Disconnect</span>
          </MenuItem>
        </div>
      </div>
    </div>
  )
}

const MenuItem = ({
  children,
  onClick,
  dark,
}: {
  children: React.ReactNode
  onClick: () => void
  dark?: boolean
}) => (
  <div
    onClick={onClick}
    className={`flex h-10 w-full cursor-pointer appearance-none items-center gap-3 rounded border-none bg-none p-3 text-base leading-4 outline-none ${
      dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
    }`}
  >
    {children}
  </div>
)
