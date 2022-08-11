import type { AccountData } from '@cardinal/common'
import {
  getReverseNameEntryForNamespace,
  ReverseEntryData,
} from '@cardinal/namespaces'
import { findNamespaceId } from '@cardinal/namespaces'
import type { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'
import { tracer, withTrace } from '../utils/trace'

export const useNamespaceReverseEntry = (
  connection: Connection | undefined,
  namespaceName: string,
  pubkey: PublicKey | undefined
) => {
  return useQuery<AccountData<ReverseEntryData> | undefined>(
    ['useNamespaceReverseEntry', namespaceName, pubkey?.toString()],
    async () => {
      if (!pubkey || !connection) return
      const [namespaceId] = await findNamespaceId(namespaceName)
      let reverseEntry: AccountData<ReverseEntryData> | undefined
      try {
        reverseEntry = await withTrace(
          () =>
            getReverseNameEntryForNamespace(connection, pubkey, namespaceId),
          tracer({ name: 'getReverseNameEntryForNamespace' })
        )
      } catch (e) {
        // no namespace reverse entry found and global not allowed
      }
      return reverseEntry || undefined
    }
  )
}
