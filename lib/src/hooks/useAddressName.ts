import type { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { useGlobalReverseEntry } from './useGlobalReverseEntry'
import { useNamespaceReverseEntries } from './useNamespaceReverseEntries'

export const useAddressName = (
  connection: Connection,
  address: PublicKey | undefined,
  namespaceNames?: string[] // default to globally supported namespaces
) => {
  const { identities } = useWalletIdentity()
  const namespaces = namespaceNames || identities.map((i) => i.name)
  const namespaceReverseEntries = useNamespaceReverseEntries(
    connection,
    address,
    namespaces
  )
  const globalReverseEntry = useGlobalReverseEntry(connection, address)
  return useQuery<[string, string] | undefined>(
    [
      'useAddressName',
      address?.toString(),
      namespaceReverseEntries.data?.map((i) => i.pubkey.toString()),
    ],
    async () => {
      if (!address || !connection) return
      if (
        globalReverseEntry.data &&
        namespaces?.includes(globalReverseEntry.data.parsed.namespaceName)
      ) {
        return [
          globalReverseEntry.data?.parsed.entryName,
          globalReverseEntry.data?.parsed.namespaceName,
        ]
      }
      const reverseEntryMatch = namespaceReverseEntries.data?.find((r) => [
        r.parsed.entryName,
        r.parsed.namespaceName,
      ])
      if (reverseEntryMatch) {
        return [
          reverseEntryMatch?.parsed.entryName,
          reverseEntryMatch?.parsed.namespaceName,
        ]
      }
    },
    { refetchOnMount: false, refetchOnWindowFocus: false }
  )
}
