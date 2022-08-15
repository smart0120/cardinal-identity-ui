import styled from '@emotion/styled'
import type { Wallet } from '@saberhq/solana-contrib'
import { useWallet } from '@solana/wallet-adapter-react'
import type { PublicKey } from '@solana/web3.js'
import { Connection } from '@solana/web3.js'
import { notify } from 'common/Notification'
import {
  ConnectButton,
  formatIdentityLink,
  formatShortAddress,
  useAddressImage,
  useAddressName,
  useWalletIdentity,
} from 'lib/src'
import { useGlobalReverseEntry } from 'lib/src/hooks/useGlobalReverseEntry'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { FaShare, FaUserAlt } from 'react-icons/fa'

import { AddressLink } from './AddressLink'
import { Alert } from './Alert'

interface Props {
  address: PublicKey
}

const ShareIcon = styled.div`
  cursor: pointer;
  transition: 0.1s all;
  &: hover {
    transform: scale(1.05);
  }
`

export const Profile: React.FC<Props> = ({ address }: Props) => {
  const { identities, show } = useWalletIdentity()
  const identity = identities.length === 1 ? identities[0] : undefined
  const wallet = useWallet()
  const { connection, environment } = useEnvironmentCtx()
  const addressStr = address.toString()
  const addressName = useAddressName(connection, address, identity?.name)
  const addressImage = useAddressImage(connection, address)
  const globalReverseEntry = useGlobalReverseEntry(
    connection,
    wallet.publicKey ?? undefined
  )

  return (
    <div
      className="bg-dark-3"
      style={{
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 34px rgb(0 0 0 / 30%)',
        background: identity?.colors.secondary,
      }}
    >
      {identity && (
        <div style={{ marginBottom: '30px' }}>
          {addressName.isFetching ? (
            <Alert message={'Loading'} type="warning" />
          ) : addressName.data ? (
            <Alert
              message={`Succesfully linked ${identity?.displayName}`}
              type="success"
            />
          ) : (
            <Alert
              message={`${identity?.displayName} not linked`}
              type="warning"
            />
          )}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          alignItems: 'center',
        }}
      >
        {addressImage.isFetching ? (
          <div
            className="animate-pulse bg-gray-200"
            style={{ height: '156px', width: '156px', borderRadius: '50%' }}
          />
        ) : addressImage.data ? (
          <div
            style={{
              position: 'relative',
              height: '156px',
              width: '156px',
              borderRadius: '50%',
              background: '#fff',
              backgroundImage: `linear-gradient(84.06deg, ${identity?.colors.primary}, ${identity?.colors.primary})`,
              // boxShadow: '0 5px 10px 0 rgb(97 83 202 / 30%)',
              padding: '5px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              style={{
                height: '150px',
                width: '150px',
                borderRadius: '50%',
                border: '4px solid white',
              }}
              alt={`profile-${addressStr}`}
              src={addressImage.data}
            ></img>
            <ShareIcon
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                notify({
                  message: 'Share link copied',
                  placement: 'bottom-right',
                })
              }}
              style={{
                position: 'absolute',
                fontSize: '12px',
                right: '-10px',
                bottom: '-5px',
                color: 'rgb(101,119,134,1)',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'rgba(100,116,139,0.1)',
              }}
            >
              <FaShare />
            </ShareIcon>
          </div>
        ) : (
          <div
            style={{
              height: '156px',
              width: '156px',
              borderRadius: '50%',
              background: '#DDD',
              boxShadow: '0 5px 10px 0 rgb(97 83 202 / 30%)',
              padding: '10px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <FaUserAlt style={{ fontSize: '100px', color: '#FFF' }} />
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '16px' }}>
            {addressName.isFetching ? (
              <div
                style={{ height: '24px', width: '120px' }}
                className="animate-pulse rounded-md bg-gray-200"
              />
            ) : (
              !!globalReverseEntry.data && (
                <div style={{ display: 'flex', gap: '5px' }}>
                  {formatIdentityLink(
                    addressName.data,
                    globalReverseEntry.data.parsed.namespaceName
                  ) || formatShortAddress(address)}
                </div>
              )
            )}
          </span>
          <AddressLink address={address} />
        </div>
        {identity && !!globalReverseEntry.data && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <button
              disabled={address?.toString() !== wallet?.publicKey?.toString()}
              className="rounded-md px-3 py-1 text-sm text-black"
              style={{
                background: identity?.colors.buttonColor,
                color: identity?.colors.secondaryFontColor,
                opacity:
                  address?.toString() !== wallet?.publicKey?.toString()
                    ? 0.5
                    : 1,
              }}
            >
              {globalReverseEntry.data.parsed.namespaceName
                .charAt(0)
                .toUpperCase() +
                globalReverseEntry.data.parsed.namespaceName.slice(1)}
            </button>
          </div>
        )}
        <div className="mt-5">
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
        </div>
        {identity && (
          <button
            disabled={address?.toString() !== wallet?.publicKey?.toString()}
            className="rounded-md px-3 py-1 text-xs text-white"
            onClick={() =>
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
            style={{
              background: identity?.colors.buttonColor,
              color: identity?.colors.secondaryFontColor,
              opacity:
                address?.toString() !== wallet?.publicKey?.toString() ? 0.5 : 1,
            }}
          >
            Manage Profiles
          </button>
        )}
      </div>
    </div>
  )
}

export const PlaceholderProfile: React.FC = () => {
  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 34px rgb(0 0 0 / 8%)',
        background: '#FFF',
      }}
    >
      <div style={{ marginBottom: '40px' }}>
        <Alert message={'Connect wallet to continue'} type="warning" />
      </div>
      <div className="flex flex-col items-center justify-center">
        <div
          className="animate-pulse bg-gray-200"
          style={{
            height: '156px',
            width: '156px',
            borderRadius: '50%',
            marginBottom: '15px',
          }}
        />
        <div
          style={{ height: '24px', width: '120px', marginBottom: '5px' }}
          className="animate-pulse rounded-md bg-gray-200"
        />
        <div
          style={{ height: '24px', width: '100px', marginBottom: '50px' }}
          className="animate-pulse rounded-md bg-gray-200"
        />
      </div>
    </div>
  )
}
