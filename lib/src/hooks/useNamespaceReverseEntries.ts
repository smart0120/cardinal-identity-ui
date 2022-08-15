import type { AccountData } from '@cardinal/common'
import type { ReverseEntryData } from '@cardinal/namespaces'
import {
  findNamespaceId,
  getReverseNameEntryForNamespace,
} from '@cardinal/namespaces'
import type { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

import { useWalletIdentity } from '../providers/WalletIdentityProvider'

export const useNamespaceReverseEntries = (
  connection: Connection,
  address: PublicKey | undefined,
  namespaceNames?: string[]
) => {
  const { identities } = useWalletIdentity()
  const namespaces = namespaceNames || identities.map((i) => i.name)
  return useQuery<AccountData<ReverseEntryData>[] | undefined>(
    ['useNamespaceReverseEntries', namespaces, address?.toString()],
    async () => {
      if (!address || !connection) return
      const namespaceIds = await Promise.all(
        namespaces.map(async (nm) => findNamespaceId(nm))
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
