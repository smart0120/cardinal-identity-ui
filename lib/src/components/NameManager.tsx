import { getQueryParam } from '@cardinal/common'
import { breakName, formatName } from '@cardinal/namespaces'
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
import { useHandleSetNamespaceDefault } from '../handlers/useHandleSetNamespaceDefault'
import { useHandleUnlink } from '../handlers/useHandleUnlink'
import { useAddressName } from '../hooks/useAddressName'
import { useGlobalReverseEntry } from '../hooks/useGlobalReverseEntry'
import { useNamespaceReverseEntry } from '../hooks/useNamespaceReverseEntry'
import type { UserTokenData } from '../hooks/useUserNamesForNamespace'
import { useUserNamesForNamespace } from '../hooks/useUserNamesForNamespace'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { formatIdentityLink } from '../utils/format'

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
  setError: (e: unknown) => void
  setSuccess: (e: ReactElement) => void
}) => {
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
          formatName(
            namespaceName,
            namespaceReverseEntry.data.parsed.entryName
          ) ===
            formatName(
              ...nameFromMint(
                userTokenData.metaplexData?.parsed.data.name || '',
                userTokenData.metaplexData?.parsed.data.uri || ''
              )
            ) && <AiFillStar />}
      </div>
      <div className="flex items-center gap-2">
        {!userTokenData.certificate &&
          (!namespaceReverseEntry.data ||
            (namespaceReverseEntry.data &&
              formatName(
                namespaceName,
                namespaceReverseEntry.data.parsed.entryName
              ) !==
                formatName(
                  ...nameFromMint(
                    userTokenData.metaplexData?.parsed.data.name || '',
                    userTokenData.metaplexData?.parsed.data.uri || ''
                  )
                ))) && (
            <Tooltip title={'Set handle as you default twitter identity'}>
              <ButtonLight
                onClick={() => {
                  // set default namespace reverse entry
                  handleSetNamespacesDefault.mutate(
                    {
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
                  <LoadingSpinner height="15px" fill="#000" />
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
                <LoadingSpinner height="15px" fill="#000" />
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
                    formatName(
                      namespaceName,
                      globalReverseEntry.data.parsed.entryName
                    ) ===
                      formatName(
                        ...nameFromMint(
                          userTokenData.metaplexData?.parsed.data.name || '',
                          userTokenData.metaplexData?.parsed.data.uri || ''
                        )
                      )
                      ? globalReverseEntry.data
                      : undefined,
                  namespaceReverseEntry:
                    namespaceReverseEntry.data &&
                    formatName(
                      namespaceName,
                      namespaceReverseEntry.data.parsed.entryName
                    ) ===
                      formatName(
                        ...nameFromMint(
                          userTokenData.metaplexData?.parsed.data.name || '',
                          userTokenData.metaplexData?.parsed.data.uri || ''
                        )
                      )
                      ? namespaceReverseEntry.data
                      : undefined,
                },
                {
                  onSuccess: (txid) => {
                    userNamesForNamespace.remove()
                    globalReverseEntry.refetch()
                    addressName.refetch()
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
              <LoadingSpinner height="15px" fill="#000" />
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
  const [error, setError] = useState<unknown>()
  const [success, setSuccess] = useState<ReactElement>()
  const handleSetNamespacesDefault = useHandleSetNamespaceDefault(
    connection,
    wallet
  )
  const userNamesForNamespace = useUserNamesForNamespace(
    connection,
    wallet.publicKey
  )
  const globalReverseEntry = useGlobalReverseEntry(connection, wallet.publicKey)
  // const namespaceReverseEntry = useNamespaceReverseEntry(
  //   connection,
  //   namespaceName,
  //   wallet.publicKey
  // )

  return (
    <div>
      <div className="text-dark-6 mb-6 text-center text-2xl">
        {appInfo?.name ? `${appInfo.name} uses` : 'Use'} Cardinal to manage to
        your personal <strong>Solana</strong> identity.
      </div>
      <div className="mb-10 flex flex-col gap-8">
        {identities.map((identity) => (
          <div key={identity.name} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-dark-6 flex h-5 w-5 items-center justify-center rounded-full px-1">
                  <img
                    className="w-full"
                    src={identity.icon}
                    alt={identity.name}
                  />
                </div>
                <div className="text-sm font-semibold text-black">
                  Manage {identity.displayName}
                </div>
              </div>
              <ButtonLight
                onClick={() => setVerifyIdentity(identity)}
                className="flex items-center gap-1"
              >
                <div>Add</div> <FaPlus className="text-[10px]" />
              </ButtonLight>
            </div>
            <div className="my-1 h-[1px] bg-gray-200"></div>
            {!userNamesForNamespace.isFetched ||
            !globalReverseEntry.isFetched ? (
              // !namespaceReverseEntry.isFetched ? (
              <>
                <div className="h-8 w-full animate-pulse rounded-lg bg-gray-200"></div>
                <div className="h-8 w-full animate-pulse rounded-lg bg-gray-200"></div>
              </>
            ) : userNamesForNamespace.data?.filter(
                (userTokenData) => userTokenData.identity.name === identity.name
              ).length === 0 ? (
              <div className="px-2 text-gray-400">No handles found</div>
            ) : (
              <>
                {userNamesForNamespace.data
                  ?.filter(
                    (userTokenData) =>
                      userTokenData.identity.name === identity.name
                  )
                  // ?.sort((userTokenData) =>
                  //   (globalReverseEntry.data &&
                  //     formatName(
                  //       namespaceName,
                  //       globalReverseEntry.data.parsed.entryName
                  //     ) ===
                  //       formatName(
                  //         ...nameFromMint(
                  //           userTokenData.metaplexData?.parsed.data.name || '',
                  //           userTokenData.metaplexData?.parsed.data.uri || ''
                  //         )
                  //       )) ||
                  //   (namespaceReverseEntry.data &&
                  //     formatName(
                  //       namespaceName,
                  //       namespaceReverseEntry.data.parsed.entryName
                  //     ) ===
                  //       formatName(
                  //         ...nameFromMint(
                  //           userTokenData.metaplexData?.parsed.data.name || '',
                  //           userTokenData.metaplexData?.parsed.data.uri || ''
                  //         )
                  //       ))
                  //     ? -1
                  //     : 1
                  // )
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
