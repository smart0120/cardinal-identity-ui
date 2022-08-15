import { withSetGlobalReverseEntry } from '@cardinal/namespaces'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection, PublicKey } from '@solana/web3.js'
import { Transaction } from '@solana/web3.js'
import { useMutation, useQueryClient } from 'react-query'

import { handleError } from '../utils/errors'
import { tracer, withTrace } from '../utils/trace'
import { executeTransaction } from '../utils/transactions'

export interface HandleSetParam {
  namespaceName: string
  entryName: string
  mint: PublicKey
}

export const useHandleSetGlobalDefault = (
  connection: Connection,
  wallet: Wallet
) => {
  const queryClient = useQueryClient()
  return useMutation(
    async ({
      entryName,
      namespaceName,
      mint,
    }: HandleSetParam): Promise<string> => {
      const transaction = new Transaction()
      const trace = tracer({ name: 'useHandleSetGlobalDefault' })
      await withTrace(
        () =>
          withSetGlobalReverseEntry(transaction, connection, wallet, {
            namespaceName: namespaceName,
            entryName: entryName,
            mintId: mint,
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
