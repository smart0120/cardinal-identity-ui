import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import { tryPublicKey } from '@cardinal/common'
import type { EntryData } from '@cardinal/namespaces'
import { withSetGlobalReverseEntry } from '@cardinal/namespaces'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection, PublicKey } from '@solana/web3.js'
import { Transaction } from '@solana/web3.js'
import { useMutation, useQueryClient } from 'react-query'

import { nameFromMint } from '../components/NameManager'
import { handleError } from '../utils/errors'
import { tracer, withTrace } from '../utils/trace'
import { executeTransaction } from '../utils/transactions'

export interface HandleSetParam {
  metaplexData?: {
    pubkey: PublicKey
    parsed: metaplex.MetadataData
  } | null
  tokenManager?: AccountData<TokenManagerData>
  certificate?: AccountData<CertificateData> | null
  nameEntryData?: AccountData<EntryData> | null
}

export const useHandleSetGlobalDefault = (
  connection: Connection,
  wallet: Wallet
) => {
  const queryClient = useQueryClient()
  return useMutation(
    async ({
      tokenData,
      namespaceName,
    }: {
      tokenData?: HandleSetParam
      namespaceName?: string
    }): Promise<string> => {
      if (!tokenData || !namespaceName) return ''
      const transaction = new Transaction()
      const entryMint =
        tryPublicKey(tokenData.metaplexData?.parsed.mint) ||
        tokenData.nameEntryData?.parsed.mint
      if (!entryMint) return ''
      const entryName = tokenData.nameEntryData
        ? tokenData.nameEntryData.parsed.name
        : nameFromMint(
            tokenData.metaplexData?.parsed.data.name || '',
            tokenData.metaplexData?.parsed.data.uri || ''
          )[1]
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
      onError: async (e) => handleError(e, `${e}`),
    }
  )
}
