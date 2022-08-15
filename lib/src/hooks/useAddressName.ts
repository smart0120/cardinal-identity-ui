import {
  findNamespaceId,
  getGlobalReverseNameEntry,
  getReverseNameEntryForNamespace,
} from '@cardinal/namespaces'
import type { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

import { tracer, withTrace } from '../utils/trace'

export const useAddressName = (
  connection: Connection,
  address: PublicKey | undefined,
  namespaceName?: string
) => {
  return useQuery<string[] | undefined>(
    ['useAddressName', address?.toString(), namespaceName],
    async () => {
      if (!address || !connection) return
      const n = await tryGetNameForNamespace(connection, address, namespaceName)
      return n ? n : undefined
    },
    { refetchOnMount: false, refetchOnWindowFocus: false }
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
    trace?.finish()
    return [
      namespaceReverseEntry.parsed.entryName,
      namespaceReverseEntry.parsed.namespaceName,
    ]
  } catch (e) {}

  if (!namespaceName) {
    try {
      console.log('No reverse entry for namespace found falling back to global')
      const globalReverseEntry = await withTrace(
        () => getGlobalReverseNameEntry(connection, pubkey),
        trace,
        { op: 'getGlobalReverseNameEntry' }
      )
      if (globalReverseEntry.parsed) {
        trace?.finish()
        return [
          globalReverseEntry.parsed.entryName,
          globalReverseEntry.parsed.namespaceName,
        ]
      }
    } catch (e) {}
  }

  trace?.finish()
  return undefined
}
