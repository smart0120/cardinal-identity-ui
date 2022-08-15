import type { AccountData } from '@cardinal/common'
import { getQueryParam } from '@cardinal/common'
import type { ReverseEntryData } from '@cardinal/namespaces'
import { breakName } from '@cardinal/namespaces'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection } from '@solana/web3.js'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { AiFillStar } from 'react-icons/ai'
import { BiUnlink } from 'react-icons/bi'
import { FaPlus } from 'react-icons/fa'

import { Alert } from '../common/Alert'
import { ButtonLight } from '../common/Button'
import type { Identity } from '../common/Identities'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { notify } from '../common/Notification'
import { Tooltip } from '../common/Tooltip'
import { TransactionLink } from '../common/TransactionLink'
import { useHandleSetGlobalDefault } from '../handlers/useHandleSetGlobalDefault'
import { useHandleSetNamespaceDefault } from '../handlers/useHandleSetNamespaceDefault'
import { useHandleUnlink } from '../handlers/useHandleUnlink'
import { useAddressName } from '../hooks/useAddressName'
import { useGlobalReverseEntry } from '../hooks/useGlobalReverseEntry'
import { useNamespaceReverseEntries } from '../hooks/useNamespaceReverseEntries'
import { useNamespaceReverseEntry } from '../hooks/useNamespaceReverseEntry'
import type { UserTokenData } from '../hooks/useUserNamesForNamespace'
import { useUserNamesForNamespace } from '../hooks/useUserNamesForNamespace'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { handleError } from '../utils/errors'
import { formatIdentityLink } from '../utils/format'
import { SetDefaultButton } from './SetDefaultButton'

export const nameFromMint = (name: string, uri: string): [string, string] => {
  if (uri.includes('name')) {
    return [name, decodeURIComponent(getQueryParam(uri, 'name') || '')]
  }
  return [
    breakName(name || '')[0],
    decodeURIComponent(breakName(name || '')[1]),
  ]
}

export const NameEntryRow = ({
  connection,
  wallet,
  namespaceName,
  userTokenData,
  setError,
  setSuccess,
}: {
  connection: Connection
  wallet: Wallet
  namespaceName: string
  userTokenData: UserTokenData
  setError: (e: string | undefined) => void
  setSuccess: (e: ReactElement) => void
}) => {
  const { identities } = useWalletIdentity()
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

  const addressName = useAddressName(
    connection,
    wallet.publicKey,
    namespaceName
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

  const namespaceReverseEntries = useNamespaceReverseEntries(
    connection,
    wallet.publicKey,
    identities.map((idn) => idn.name)
  )

  useEffect(() => {
    if (handleUnlink.isLoading || handleSetNamespacesDefault.isLoading) {
      setError(undefined)
    }
  }, [handleUnlink.isLoading, handleSetNamespacesDefault.isLoading])
  return (
    <div className="flex items-center justify-between gap-5 px-2">
      <div
        className="cursor-point flex cursor-pointer items-center gap-1"
        style={{ fontSize: '14px' }}
      >
        {formatIdentityLink(
          nameFromMint(
            userTokenData.metaplexData?.parsed.data.name || '',
            userTokenData.metaplexData?.parsed.data.uri || ''
          )[1],
          namespaceName
        )}
        {namespaceReverseEntry.data &&
          namespaceReverseEntry.data.parsed.entryName ===
            nameFromMint(
              userTokenData.metaplexData?.parsed.data.name || '',
              userTokenData.metaplexData?.parsed.data.uri || ''
            )[1] && <AiFillStar />}
      </div>
      <div className="flex items-center gap-2">
        {!userTokenData.certificate &&
          (!namespaceReverseEntry.data ||
            (namespaceReverseEntry.data &&
              namespaceReverseEntry.data.parsed.entryName !==
                nameFromMint(
                  userTokenData.metaplexData?.parsed.data.name || '',
                  userTokenData.metaplexData?.parsed.data.uri || ''
                )[1])) && (
            <Tooltip title={'Set handle as you default twitter identity'}>
              <ButtonLight
                onClick={() => {
                  // set default namespace reverse entry
                  handleSetNamespacesDefault.mutate(
                    {
                      namespaceName: userTokenData.identity.name,
                      tokenData: userTokenData,
                    },
                    {
                      onSuccess: (txid) => {
                        userNamesForNamespace.remove()
                        namespaceReverseEntry.refetch()
                        globalReverseEntry.refetch()
                        addressName.refetch()
                        setSuccess(
                          <div className="flex w-full flex-col text-center">
                            <div>
                              Succesfully set handle as default twitter
                              identity.
                            </div>
                            <div>
                              Changes will be reflected{' '}
                              <TransactionLink txid={txid} />
                            </div>
                          </div>
                        )
                      },
                      onError: (e) =>
                        notify({
                          message: `Failed Transaction`,
                          description: e as string,
                        }),
                    }
                  )
                }}
              >
                {handleSetNamespacesDefault.isLoading ? (
                  <LoadingSpinner height="12px" fill="#000" />
                ) : (
                  <AiFillStar />
                )}
              </ButtonLight>
            </Tooltip>
          )}
        {userTokenData.certificate && (
          <Tooltip title={'Set handle as you default twitter identity'}>
            <ButtonLight
              onClick={() =>
                handleSetNamespacesDefault.mutate(
                  {
                    namespaceName: userTokenData.identity.name,
                    tokenData: userTokenData,
                  },
                  {
                    onSuccess: (txid) => {
                      userNamesForNamespace.remove()
                      namespaceReverseEntry.refetch()
                      setSuccess(
                        <div className="flex w-full flex-col text-center">
                          <div>
                            Succesfully updated handle to new identity version.
                          </div>
                          <div>
                            Changes will be reflected{' '}
                            <TransactionLink txid={txid} />
                          </div>
                        </div>
                      )
                    },
                    onError: (e) =>
                      notify({
                        message: `Failed Transaction`,
                        description: e as string,
                      }),
                  }
                )
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
                  globalReverseNameEntryData:
                    globalReverseEntry.data &&
                    globalReverseEntry.data.parsed?.entryName ===
                      nameFromMint(
                        userTokenData.metaplexData?.parsed.data.name || '',
                        userTokenData.metaplexData?.parsed.data.uri || ''
                      )[1]
                      ? globalReverseEntry.data
                      : undefined,
                  namespaceReverseEntry:
                    namespaceReverseEntry.data &&
                    namespaceReverseEntry.data.parsed.entryName ===
                      nameFromMint(
                        userTokenData.metaplexData?.parsed.data.name || '',
                        userTokenData.metaplexData?.parsed.data.uri || ''
                      )[1]
                      ? namespaceReverseEntry.data
                      : undefined,
                },
                {
                  onSuccess: (txid) => {
                    userNamesForNamespace.remove()
                    globalReverseEntry.refetch()
                    addressName.refetch()
                    namespaceReverseEntries.refetch()
                    setSuccess(
                      <div className="flex w-full flex-col text-center">
                        <div>
                          Succesfully unlinked{' '}
                          {formatIdentityLink(
                            nameFromMint(
                              userTokenData.metaplexData?.parsed.data.name ||
                                '',
                              userTokenData.metaplexData?.parsed.data.uri || ''
                            )[1],
                            namespaceName
                          )}
                          .
                        </div>
                        <div>
                          Changes will be reflected{' '}
                          <TransactionLink txid={txid} />
                        </div>
                      </div>
                    )
                  },
                  onError: (e) =>
                    notify({
                      message: `Failed Transaction`,
                      description: e as string,
                    }),
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
  const [topError, setTopError] = useState<string>()
  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState<ReactElement>()
  const handleSetNamespacesDefault = useHandleSetNamespaceDefault(
    connection,
    wallet
  )

  const namespaceReverseEntries = useNamespaceReverseEntries(
    connection,
    wallet.publicKey,
    identities.map((idn) => idn.name)
  )
  const userNamesForNamespace = useUserNamesForNamespace(
    connection,
    wallet.publicKey
  )
  const globalReverseEntry = useGlobalReverseEntry(connection, wallet.publicKey)
  const handleSetGlobalDefault = useHandleSetGlobalDefault(connection, wallet)

  return (
    <div>
      <div className="text-dark-6 mb-6 text-center text-2xl">
        {appInfo?.name ? `${appInfo.name} uses` : 'Use'} Cardinal to manage to
        your personal <strong>Solana</strong> identity.
      </div>
      {(handleSetGlobalDefault.error || topError) && (
        <Alert
          message={
            topError ||
            handleError(
              handleSetGlobalDefault.error,
              `${handleSetGlobalDefault.error}`
            )
          }
          type="error"
          style={{
            margin: '10px 0px',
            height: 'auto',
            wordBreak: 'break-word',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        />
      )}
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
                    <img
                      className="w-full"
                      src={identity.icon}
                      alt={identity.name}
                    />
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
                    setError={setTopError}
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
                // !namespaceReverseEntry.isFetched ? (
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
                        setError={setError}
                        setSuccess={setSuccess}
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
        {error && (
          <Alert
            style={{
              marginTop: '10px',
              height: 'auto',
              wordBreak: 'break-word',
            }}
            message={
              <>
                <div>{`${error}`}</div>
              </>
            }
            type="error"
            showIcon
          />
        )}
        {success && (
          <Alert
            style={{
              marginTop: '10px',
              height: 'auto',
              wordBreak: 'break-word',
            }}
            message={success}
            type="success"
            showIcon
          />
        )}
      </div>
    </div>
  )
}

export function sortOnReverseEntry(
  userTokenData: UserTokenData,
  globalReverseEntry: AccountData<ReverseEntryData> | undefined,
  namespaceReverseEntry: AccountData<ReverseEntryData>[] | undefined
): number {
  const entryName = nameFromMint(
    userTokenData.metaplexData?.parsed.data.name || '',
    userTokenData.metaplexData?.parsed.data.uri || ''
  )[1]
  if (globalReverseEntry?.parsed?.entryName === entryName) {
    return -1
  }
  if (
    namespaceReverseEntry
      ?.map((reverseEntry) => reverseEntry?.parsed.entryName)
      .includes(entryName)
  ) {
    return -1
  }
  return 1
}
