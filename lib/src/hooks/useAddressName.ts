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
import { tracer, withTrace } from '../utils/trace'

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
  const trace = tracer({ name: 'tryGetNameForNamespace' })
  try {
    const [namespaceId] = await findNamespaceId(namespaceName)
    const namespaceReverseEntry = await withTrace(
      () => getReverseNameEntryForNamespace(connection, pubkey, namespaceId),
      trace,
      { op: 'getReverseNameEntryForNamespace' }
    )
    trace.finish()
    return [
      formatName(
        namespaceReverseEntry.parsed.namespaceName,
        namespaceReverseEntry.parsed.entryName
      ),
      namespaceReverseEntry.parsed.namespaceName,
    ]
  } catch (e) {}

  try {
    console.log('No reverse entry for namespace found falling back to global')
    const globalReverseEntry = await withTrace(
      () => getGlobalReverseNameEntry(connection, pubkey),
      trace,
      { op: 'getGlobalReverseNameEntry' }
    )
    if (
      globalReverseEntry.parsed &&
      globalReverseEntry.parsed.namespaceName === namespaceName
    ) {
      trace.finish()
      return [
        formatName(
          globalReverseEntry.parsed.namespaceName,
          globalReverseEntry.parsed.entryName
        ),
        globalReverseEntry.parsed.namespaceName,
      ]
    }
  } catch (e) {}

  trace.finish()
  return undefined
}
