import { css } from '@emotion/react'
import type { Wallet } from '@saberhq/solana-contrib'
import { useWallet } from '@solana/wallet-adapter-react'
import type { PublicKey } from '@solana/web3.js'
import { Connection } from '@solana/web3.js'
import { notify } from 'common/Notification'
import {
  ConnectButton,
  DisplayAddress,
  useAddressImage,
  useAddressName,
  useWalletIdentity,
} from 'lib/src'
import { ButtonLight } from 'lib/src/common/Button'
import { IDENTITIES, isKnownIdentity } from 'lib/src/common/Identities'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { FaShare, FaUserAlt } from 'react-icons/fa'

import { AddressLink } from './AddressLink'
import { Alert } from './Alert'

interface Props {
  address: PublicKey
}

export const Profile: React.FC<Props> = ({ address }: Props) => {
  const { identities, show } = useWalletIdentity()
  const identity = identities.length === 1 ? identities[0] : undefined
  const wallet = useWallet()
  const { connection, environment } = useEnvironmentCtx()
  const addressStr = address.toString()
  const addressName = useAddressName(
    connection,
    address,
    identity?.name ? [identity.name] : undefined
  )
  const addressImage = useAddressImage(
    connection,
    address,
    identity?.name ? [identity.name] : undefined
  )

  return (
    <>
      <div className="mb-4">
        {!addressName.isFetched ? (
          <Alert message={'Loading'} type="warning" />
        ) : addressName.data ? (
          <Alert
            message={`Succesfully linked ${identities.find((id) => id.name === addressName.data![1])
              ?.displayName
              }`}
            type="success"
          />
        ) : (
          <Alert
            message={`Note: Minting on NUKEPad requires your wallet to be enrolled into Proof Of Purity(PoP)`}
            type="warning"
          />
        )}
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col w-full md:w-[200px] gap-4">
          <div className="border-2 border-[#000] rounded-lg px-4 py-2">
            <h3 className="font-bold">Total Users PoP'ed</h3>
            <h1 className="text-2xl font-bold">132</h1>
          </div>
          <div className="border-2 border-[#000] rounded-lg px-4 py-2 bg-yellow-300">
            <h3 className="font-bold">Prewhitelisted Mints</h3>
            <h1 className="text-2xl font-bold">NA</h1>
          </div>
          <div className="border-2 border-[#000] rounded-lg px-4 py-2 bg-amber-500">
            <h3 className="font-bold">Mint Streak</h3>
            <h1 className="text-2xl font-bold">NA</h1>
          </div>
          <div className="border-2 border-[#000] rounded-lg px-4 py-2 bg-rose-500">
            <h3 className="font-bold">Mints Missed</h3>
            <h1 className="text-2xl font-bold">NA</h1>
          </div>
          <div className="border-2 border-[#000] rounded-lg px-4 py-2 bg-pink-300">
            <h3 className="font-bold">Total $SOL Earned</h3>
            <h1 className="text-2xl font-bold">NA</h1>
          </div>
        </div>
        <div className="border-2 border-[#000] rounded-lg p-4 flex flex-col items-center gap-4 w-full md:w-[300px]">
          {!addressImage.isFetched ? (
            <div
              className="bg-gray-200"
              style={{ height: '250px', width: '250px', borderRadius: '50%' }}
            />
          ) : addressImage.data ? (
            <div
              className="relative flex items-center justify-center rounded-full"
              style={{
                height: '250px',
                width: '250px',
                padding: '5px'
              }}
            >
              <img
                className="rounded-full"
                style={{
                  height: '150px',
                  width: '150px',
                  border: '4px solid white',
                  backgroundColor: '#fff',
                }}
                alt={`profile-${addressStr}`}
                src={addressImage.data[0]}
              />
              <div
                // eslint-disable-next-line react/no-unknown-property
                css={css`
                &:hover {
                  transform: scale(1.05);
                }
              `}
                className="absolute -right-3 -bottom-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-border text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  notify({
                    message: 'Share link copied',
                  })
                }}
                style={{
                  color: 'rgb(101,119,134,1)',
                  background: 'rgba(100,116,139,0.1)',
                }}
              >
                <FaShare />
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-full p-[10px] text-light-0"
              style={{
                height: '250px',
                width: '250px',
                background: '#000',
                boxShadow: '0 5px 10px 0 rgb(97 83 202 / 30%)',
              }}
            >
              <FaUserAlt style={{ fontSize: '100px' }} />
            </div>
          )}
          <div className="flex flex-col justify-center text-center">
            <DisplayAddress
              className="mx-auto"
              size={16}
              connection={connection}
              dark={false}
              address={address}
            />
            <AddressLink address={address} />
          </div>
          <ButtonLight
            className="bg-teal-500 hover:bg-teal-600 Get Popped font-bold"
          >
            Get Popped
          </ButtonLight>
          <ConnectButton
            disabled={address?.toString() !== wallet?.publicKey?.toString()}
            dev={environment.label === 'devnet'}
            wallet={wallet as Wallet}
            connection={connection}
            secondaryConnection={
              environment.secondary
                ? new Connection(environment.secondary)
                : connection
            }
            onClose={addressName.refetch}
            cluster={environment.label}
          />
          {/* <ButtonLight
            onClick={() =>
              address?.toString() === wallet?.publicKey?.toString() &&
              show({
                wallet: wallet as Wallet,
                connection: connection,
                cluster: environment.label,
                secondaryConnection: environment.secondary
                  ? new Connection(environment.secondary)
                  : connection,
                dev: environment.label === 'devnet',
              })
            }
          >
            Manage
          </ButtonLight> */}
        </div>
      </div>
    </>
  )
}

export const PlaceholderProfile: React.FC = () => {
  return (
    <>
      <div className="mb-4">
        <Alert message={'Note: Minting on NUKEPad requires your wallet to be enrolled into Proof Of Purity(PoP)'} type="warning" />
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="border-2 border-[#000] rounded-lg px-4 py-2 w-full md:w-[200px]">
          <h3 className="font-bold">Total Users PoP'ed</h3>
          <h1 className="text-2xl font-bold">132</h1>
        </div>
        <div className="border-2 border-[#000]  rounded-lg px-4 py-2 flex justify-between items-center w-full md:w-[300px]">
          <div className="border-2 border-[#000] rounded-full bg-gray-200 w-[56px] h-[56px]" />
          <Alert message={'Connect wallet to continue'} type="warning" />
        </div>
      </div>
    </>
  )
}
