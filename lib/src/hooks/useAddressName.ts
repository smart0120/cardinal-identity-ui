import {
  findNamespaceId,
  formatName,
  getGlobalReverseNameEntry,
  getReverseNameEntryForNamespace,
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
      const n = await tryGetNameForNamespace(connection, address, namespaceName)
      return n ? n[0] : undefined
    }
  )
}

export async function tryGetNameForNamespace(
  connection: Connection,
  pubkey: PublicKey,
  namespaceName: string
): Promise<string[] | undefined> {
  try {
    const [namespaceId] = await findNamespaceId(namespaceName)
    const namespaceReverseEntry = await getReverseNameEntryForNamespace(
      connection,
      pubkey,
      namespaceId
    )
    return [
      formatName(
        namespaceReverseEntry.parsed.namespaceName,
        namespaceReverseEntry.parsed.entryName
      ),
      namespaceReverseEntry.parsed.namespaceName,
    ]
  } catch (e) {}

  try {
    const globalReverseEntry = await getGlobalReverseNameEntry(
      connection,
      pubkey
    )
    if (
      globalReverseEntry.parsed &&
      globalReverseEntry.parsed.namespaceName === namespaceName
    ) {
      return [
        formatName(
          globalReverseEntry.parsed.namespaceName,
          globalReverseEntry.parsed.entryName
        ),
        globalReverseEntry.parsed.namespaceName,
      ]
    }
  } catch (e) {}

  return undefined
}
