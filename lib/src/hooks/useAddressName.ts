import {
  findNamespaceId,
  formatName,
  getReverseNameEntryForNamespace,
  tryGetName,
} from '@cardinal/namespaces'
import type { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { TWITTER_NAMESPACE_NAME } from '../utils/constants'

export const useAddressName = (
  connection: Connection,
  address: PublicKey | undefined,
  namespaceName = TWITTER_NAMESPACE_NAME
) => {
  const { handle } = useWalletIdentity()

  return useQuery<string | undefined>(
    ['useAddressName', address, namespaceName, handle],
    async () => {
      if (!address || !connection) return
      const [namespaceId] = await findNamespaceId(namespaceName)
      const n = await tryGetNameForNamespace(connection, address, namespaceId)
      return n ? n[0] : undefined
    }
  )
}

export async function tryGetNameForNamespace(
  connection: Connection,
  pubkey: PublicKey,
  namespaceId: PublicKey
): Promise<string[] | undefined> {
  try {
    const reverseEntry = await getReverseNameEntryForNamespace(
      connection,
      pubkey,
      namespaceId
    )
    return [
      formatName(
        reverseEntry.parsed.namespaceName,
        reverseEntry.parsed.entryName
      ),
      reverseEntry.parsed.namespaceName,
    ]
  } catch (e) {
    console.log(e)
  }
  return undefined
}
