import type { AccountData } from '@cardinal/common'
import type { ReverseEntryData } from '@cardinal/namespaces'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection } from '@solana/web3.js'
import { useEffect } from 'react'
import { AiFillStar } from 'react-icons/ai'
import { BiUnlink } from 'react-icons/bi'
import { FaPlus } from 'react-icons/fa'

import { Alert } from '../common/Alert'
import { ButtonLight } from '../common/Button'
import type { Identity } from '../common/Identities'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Tooltip } from '../common/Tooltip'
import { useHandleSetNamespaceDefault } from '../handlers/useHandleSetNamespaceDefault'
import { useHandleUnlink } from '../handlers/useHandleUnlink'
import { useGlobalReverseEntry } from '../hooks/useGlobalReverseEntry'
import { useNamespaceReverseEntries } from '../hooks/useNamespaceReverseEntries'
import { useNamespaceReverseEntry } from '../hooks/useNamespaceReverseEntry'
import type { UserTokenData } from '../hooks/useUserNamesForNamespace'
import { useUserNamesForNamespace } from '../hooks/useUserNamesForNamespace'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { formatIdentityLink } from '../utils/format'
import { isReverseEntry, nameFromMint } from '../utils/nameUtils'
import { SetDefaultButton } from './SetDefaultButton'

export const NameEntryRow = ({
  connection,
  wallet,
  namespaceName,
  userTokenData,
}: {
  connection: Connection
  wallet: Wallet
  namespaceName: string
  userTokenData: UserTokenData
}) => {
  const { setMessage } = useWalletIdentity()
  const userNamesForNamespace = useUserNamesForNamespace(
    connection,
    wallet.publicKey
  )
  const globalReverseEntry = useGlobalReverseEntry(connection, wallet.publicKey)
  const namespaceReverseEntry = useNamespaceReverseEntry(
    connection,
    namespaceName,
    wallet.publicKey
  )
  const handleUnlink = useHandleUnlink(
    connection,
    wallet,
    namespaceName,
    userTokenData
  )
  const handleSetNamespacesDefault = useHandleSetNamespaceDefault(
    connection,
    wallet
  )

  useEffect(() => {
    if (handleUnlink.isLoading || handleSetNamespacesDefault.isLoading) {
      setMessage(undefined)
    }
  }, [handleUnlink.isLoading, handleSetNamespacesDefault.isLoading])

  return (
    <div className="flex items-center justify-between gap-5 px-2">
      <div
        className="cursor-point flex cursor-pointer items-center gap-1"
        style={{ fontSize: '14px' }}
      >
        {formatIdentityLink(
          ...nameFromMint(
            userTokenData.metaplexData?.parsed.data.name || '',
            userTokenData.metaplexData?.parsed.data.uri || ''
          )
        )}
        {isReverseEntry(userTokenData, namespaceReverseEntry.data) && (
          <AiFillStar />
        )}
      </div>
      <div className="flex items-center gap-2">
        {!isReverseEntry(userTokenData, namespaceReverseEntry.data) && (
          <Tooltip
            title={`Set handle as you default ${namespaceName} identity`}
          >
            <ButtonLight
              onClick={() =>
                handleSetNamespacesDefault.mutate({
                  tokenData: userTokenData,
                })
              }
            >
              {handleSetNamespacesDefault.isLoading ? (
                <LoadingSpinner height="12px" fill="#000" />
              ) : (
                <AiFillStar />
              )}
            </ButtonLight>
          </Tooltip>
        )}

        <Tooltip title={'Unlink Handle'}>
          <ButtonLight
            className="flex items-center gap-1"
            onClick={async () =>
              handleUnlink.mutate(
                {
                  globalReverseNameEntryData: isReverseEntry(
                    userTokenData,
                    globalReverseEntry.data
                  )
                    ? globalReverseEntry.data
                    : undefined,
                  namespaceReverseEntry: isReverseEntry(
                    userTokenData,
                    namespaceReverseEntry.data
                  )
                    ? namespaceReverseEntry.data
                    : undefined,
                },
                {
                  onSuccess: () => userNamesForNamespace.remove(),
                }
              )
            }
          >
            {handleUnlink.isLoading ? (
              <LoadingSpinner height="12px" fill="#000" />
            ) : (
              <>
                <BiUnlink />
              </>
            )}
          </ButtonLight>
        </Tooltip>
      </div>
    </div>
  )
}

export const NameManager = ({
  connection,
  wallet,
  setVerifyIdentity,
}: {
  connection: Connection
  wallet: Wallet
  setVerifyIdentity: (arg0: Identity) => void
}) => {
  const { identities, appInfo } = useWalletIdentity()
  const handleSetNamespacesDefault = useHandleSetNamespaceDefault(
    connection,
    wallet
  )
  const namespaceReverseEntries = useNamespaceReverseEntries(
    connection,
    wallet.publicKey
  )
  const userNamesForNamespace = useUserNamesForNamespace(
    connection,
    wallet.publicKey
  )
  const globalReverseEntry = useGlobalReverseEntry(connection, wallet.publicKey)

  return (
    <div>
      <div className="text-dark-6 mb-6 text-center text-2xl">
        {appInfo?.name ? `${appInfo.name} uses` : 'Use'} Cardinal to manage to
        your personal <strong>Solana</strong> identity.
      </div>
      <div className="mb-10 flex flex-col gap-8">
        {identities
          .sort((identity) =>
            globalReverseEntry.data?.parsed.namespaceName === identity.name
              ? -1
              : 1
          )
          .map((identity) => (
            <div key={identity.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="bg-dark-6 flex h-5 w-5 items-center justify-center rounded-full px-1"
                    style={{ background: identity.colors.primary }}
                  >
                    {!!identity.icon &&
                      identity.icon({ variant: 'light', className: 'w-full' })}
                  </div>
                  <div className="text-sm font-semibold text-black">
                    {identity.displayName}
                  </div>
                </div>
                <div className="flex flex-row gap-1">
                  <SetDefaultButton
                    connection={connection}
                    wallet={wallet}
                    identity={identity}
                  />
                  <ButtonLight
                    onClick={() => setVerifyIdentity(identity)}
                    className="flex flex-row items-center gap-1"
                  >
                    Add <FaPlus className="text-[10px]" />
                  </ButtonLight>
                </div>
              </div>
              <div className="my-1 h-[1px] bg-gray-200"></div>
              {!userNamesForNamespace.isFetched ||
              !globalReverseEntry.isFetched ? (
                <>
                  <div className="h-6 w-full animate-pulse rounded-lg bg-gray-200"></div>
                  <div className="h-6 w-full animate-pulse rounded-lg bg-gray-200"></div>
                </>
              ) : userNamesForNamespace.data?.filter(
                  (userTokenData) =>
                    userTokenData.identity.name === identity.name
                ).length === 0 ? (
                <div className="px-2 text-gray-400">No handles found</div>
              ) : (
                <>
                  {userNamesForNamespace.data
                    ?.filter(
                      (userTokenData) =>
                        userTokenData.identity.name === identity.name
                    )
                    ?.sort((userTokenData) =>
                      sortOnReverseEntry(
                        userTokenData,
                        globalReverseEntry.data,
                        namespaceReverseEntries.data
                      )
                    )
                    ?.map((userTokenData) => (
                      <NameEntryRow
                        key={userTokenData.tokenAccount?.pubkey.toString()}
                        namespaceName={userTokenData.identity.name}
                        connection={connection}
                        wallet={wallet}
                        userTokenData={userTokenData}
                      />
                    ))}
                </>
              )}
            </div>
          ))}
        {handleSetNamespacesDefault.error && (
          <Alert
            style={{
              marginTop: '10px',
              height: 'auto',
              wordBreak: 'break-word',
            }}
            message={
              <>
                <div>{`${handleSetNamespacesDefault.error}`}</div>
              </>
            }
            type="error"
            showIcon
          />
        )}
      </div>
    </div>
  )
}

export const sortOnReverseEntry = (
  userTokenData: UserTokenData,
  globalReverseEntry: AccountData<ReverseEntryData> | undefined,
  namespaceReverseEntry: AccountData<ReverseEntryData>[] | undefined
): number =>
  isReverseEntry(userTokenData, globalReverseEntry)
    ? -1
    : namespaceReverseEntry?.some((reverseEntry) =>
        isReverseEntry(userTokenData, reverseEntry)
      )
    ? -1
    : 1
