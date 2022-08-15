import type { AccountData } from '@cardinal/common'
import type { ReverseEntryData } from '@cardinal/namespaces'
import {
  findNamespaceId,
  getReverseNameEntryForNamespace,
} from '@cardinal/namespaces'
import type { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

export const useNamespaceReverseEntries = (
  connection: Connection,
  address: PublicKey | undefined,
  namespaceNames: string[]
) => {
  return useQuery<AccountData<ReverseEntryData>[] | undefined>(
    ['useNamespaceReverseEntries', namespaceNames, address?.toString()],
    async () => {
      if (!address || !connection) return
      const namespaceIds = await Promise.all(
        namespaceNames.map(async (nm) => findNamespaceId(nm))
      )
      const reverseEntryDatas: (
        | AccountData<ReverseEntryData>
        | null
        | undefined
      )[] = await Promise.all(
        namespaceIds.map((nm) =>
          getReverseNameEntryForNamespace(connection, address, nm[0]).catch(
            (e) => undefined
          )
        )
      )
      return reverseEntryDatas.filter(
        (r): r is AccountData<ReverseEntryData> => r !== null
      )
    },
    { refetchOnMount: false, refetchOnWindowFocus: false }
  )
}
