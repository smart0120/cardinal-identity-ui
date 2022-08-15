import type { AccountData } from '@cardinal/certificates'
import type { EntryData } from '@cardinal/namespaces'
import { getNameEntry } from '@cardinal/namespaces'
import type { Connection } from '@solana/web3.js'
import { useQuery } from 'react-query'

import { tracer, withTrace } from '../utils/trace'

export const useNameEntry = (
  connection: Connection | undefined,
  namespaceName: string,
  entryName: string | undefined
) => {
  return useQuery<AccountData<EntryData> | undefined>(
    ['useNameEntry', namespaceName, entryName],
    async () => {
      if (!entryName || !connection) return
      return withTrace(
        () => getNameEntry(connection, namespaceName, entryName),
        tracer({ name: 'useNameEntry' })
      )
    },
    {
      enabled: !!entryName && !!connection,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}
