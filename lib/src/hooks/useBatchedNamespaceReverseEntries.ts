import type { AccountData } from '@cardinal/common'
import {
  getReverseNameEntryForNamespace,
  ReverseEntryData,
} from '@cardinal/namespaces'
import { findNamespaceId } from '@cardinal/namespaces'
import type { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

export const useBatchedNamespaceReverseEntries = (
  connection: Connection,
  namespaceNames: string[],
  pubkey: PublicKey | undefined
) => {
  return useQuery<AccountData<ReverseEntryData>[] | undefined>(
    ['useBatchedNamespaceReverseEntries', namespaceNames, pubkey?.toString()],
    async () => {
      if (!pubkey || !connection) return
      const namespaceIds = await Promise.all(
        namespaceNames.map(async (nm) => findNamespaceId(nm))
      )
      const reverseEntryDatas: (
        | AccountData<ReverseEntryData>
        | null
        | undefined
      )[] = await Promise.all(
        namespaceIds.map((nm) =>
          getReverseNameEntryForNamespace(connection, pubkey, nm[0]).catch(
            (e) => undefined
          )
        )
      )
      return reverseEntryDatas.filter((r) => !!r)
    },
    { refetchOnMount: false, refetchOnWindowFocus: false }
  )
}
