import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import { withSetGlobalReverseEntry } from '@cardinal/namespaces'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import { useMutation, useQueryClient } from 'react-query'

import { nameFromMint } from '../components/NameManager'
import { tracer, withTrace } from '../utils/trace'
import { executeTransaction } from '../utils/transactions'

export interface HandleSetParam {
  metaplexData?: {
    pubkey: PublicKey
    parsed: metaplex.MetadataData
  } | null
  tokenManager?: AccountData<TokenManagerData>
  certificate?: AccountData<CertificateData> | null
}

export const useHandleSetGlobalDefault = (
  connection: Connection,
  wallet: Wallet,
  namespaceName: string
) => {
  const queryClient = useQueryClient()
  return useMutation(
    async ({ tokenData }: { tokenData?: HandleSetParam }): Promise<string> => {
      if (!tokenData) return ''
      const transaction = new Transaction()
      const entryMint = new PublicKey(tokenData.metaplexData?.parsed.mint!)
      const [, entryName] = nameFromMint(
        tokenData.metaplexData?.parsed.data.name || '',
        tokenData.metaplexData?.parsed.data.uri || ''
      )
      const trace = tracer({ name: 'useHandleSetGlobalDefault' })
      await withTrace(
        () =>
          withSetGlobalReverseEntry(transaction, connection, wallet, {
            namespaceName: namespaceName,
            entryName: entryName,
            mintId: entryMint,
          }),
        trace,
        { op: 'getTransaction' }
      )
      transaction.feePayer = wallet.publicKey
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash('max')
      ).blockhash
      const txid = await withTrace(
        () =>
          executeTransaction(connection, wallet, transaction, {
            confirmOptions: {
              commitment: 'confirmed',
              skipPreflight: true,
            },
            notificationConfig: { message: 'Set to default successfully' },
          }),
        trace,
        { op: 'sendTransaction' }
      )
      trace?.finish()
      return txid
    },
    {
      onSuccess: () => queryClient.invalidateQueries(),
    }
  )
}
