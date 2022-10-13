import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection } from '@solana/web3.js'
import { useEffect } from 'react'
import { AiFillStar } from 'react-icons/ai'
import { BiUnlink } from 'react-icons/bi'

import { ButtonLight } from '../common/Button'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Tooltip } from '../common/Tooltip'
import { useHandleSetNamespaceDefault } from '../handlers/useHandleSetNamespaceDefault'
import { useHandleUnlink } from '../handlers/useHandleUnlink'
import { useGlobalReverseEntry } from '../hooks/useGlobalReverseEntry'
import { useNamespaceReverseEntry } from '../hooks/useNamespaceReverseEntry'
import type { UserTokenData } from '../hooks/useUserNamesForNamespace'
import { useUserNamesForNamespace } from '../hooks/useUserNamesForNamespace'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { formatIdentityLink } from '../utils/format'
import { isReverseEntry, nameFromMint } from '../utils/nameUtils'

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
            title={`Set handle as your default ${namespaceName} identity`}
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
