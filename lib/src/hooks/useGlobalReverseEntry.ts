import type { AccountData } from '@cardinal/common'
import { tryGetAccount } from '@cardinal/common'
import type { ReverseEntryData } from '@cardinal/namespaces'
import { getGlobalReverseNameEntry } from '@cardinal/namespaces'
import type { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

import { tracer, withTrace } from '../utils/trace'

export const useGlobalReverseEntry = (
  connection: Connection | undefined,
  pubkey: PublicKey | undefined
) => {
  return useQuery<AccountData<ReverseEntryData> | undefined>(
    ['useGlobalReverseEntry', pubkey?.toString()],
    async () => {
      if (!pubkey || !connection) return
      const reverseEntry = await withTrace(
        () =>
          tryGetAccount(() => getGlobalReverseNameEntry(connection, pubkey)),
        tracer({ name: 'getGlobalReverseNameEntry' })
      )
      return reverseEntry ?? undefined
    },
    {
      enabled: !!connection || !!pubkey,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}
