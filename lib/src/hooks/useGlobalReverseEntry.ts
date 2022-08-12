import type { AccountData } from '@cardinal/common'
import {
  getGlobalReverseNameEntry,
  ReverseEntryData,
} from '@cardinal/namespaces'
import type { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'
import { tracer, withTrace } from '../utils/trace'

export const useGlobalReverseEntry = (
  connection: Connection | undefined,
  namespaceName: string,
  pubkey: PublicKey | undefined
) => {
  return useQuery<AccountData<ReverseEntryData> | undefined>(
    ['useGlobalReverseEntry', namespaceName, pubkey?.toString()],
    async () => {
      if (!pubkey || !connection) return
      const reverseEntry = await withTrace(
        () => getGlobalReverseNameEntry(connection, pubkey),
        tracer({ name: 'getGlobalReverseNameEntry' })
      )
      return reverseEntry || undefined
    },
    { refetchOnMount: false, refetchOnWindowFocus: false }
  )
}
