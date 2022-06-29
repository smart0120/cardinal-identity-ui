import type { AccountData } from '@cardinal/certificates'
import type { ClaimRequestData } from '@cardinal/namespaces'
import { getClaimRequest } from '@cardinal/namespaces'
import type { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

export const useClaimRequest = (
  connection: Connection | undefined,
  namespaceName: string,
  entryName: string | undefined,
  pubkey: PublicKey | undefined
) => {
  return useQuery<AccountData<ClaimRequestData> | undefined>(
    ['useClaimRequest', namespaceName, entryName, pubkey?.toString()],
    async () => {
      if (!pubkey || !entryName || !connection) return
      return getClaimRequest(connection, namespaceName, entryName, pubkey)
    },
    {
      enabled: !!pubkey && !!entryName && !!connection,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}
