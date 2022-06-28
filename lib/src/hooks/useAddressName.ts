import { findNamespaceId, tryGetName } from '@cardinal/namespaces'
import type { Connection, PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'

import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { TWITTER_NAMESPACE_NAME } from '../utils/constants'

export const useAddressName = (
  connection: Connection,
  address: PublicKey | undefined,
  namespaceName = TWITTER_NAMESPACE_NAME
): {
  displayName: string | undefined
  loadingName: boolean
  refreshName: () => void
} => {
  const { handle } = useWalletIdentity()
  const [displayName, setDisplayName] = useState<string | undefined>()
  const [loadingName, setLoadingName] = useState<boolean>(true)

  const refreshName = async () => {
    try {
      setLoadingName(true)
      if (address) {
        const [namespaceId] = await findNamespaceId(namespaceName)
        const n = await tryGetName(connection, address, namespaceId)
        setDisplayName(n)
      }
    } finally {
      setLoadingName(false)
    }
  }

  useMemo(() => {
    void refreshName()
  }, [connection, address?.toString(), namespaceName, handle])

  return { displayName, loadingName, refreshName }
}
