import { withSetGlobalReverseEntry } from '@cardinal/namespaces'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection, PublicKey } from '@solana/web3.js'
import { Transaction } from '@solana/web3.js'
import { useMutation, useQueryClient } from 'react-query'

import { Alert } from '../common/Alert'
import { TransactionLink } from '../common/TransactionLink'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { handleError } from '../utils/errors'
import { tracer, withTrace } from '../utils/trace'
import { executeTransaction } from '../utils/transactions'

export const useHandleSetGlobalDefault = (
  connection: Connection,
  wallet: Wallet
) => {
  const { setMessage } = useWalletIdentity()
  const queryClient = useQueryClient()
  return useMutation(
    async ({
      entryName,
      namespaceName,
      mint,
    }: {
      namespaceName: string
      entryName: string
      mint: PublicKey
    }): Promise<{ txid: string; namespaceName: string }> => {
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
      return { txid, namespaceName }
    },
    {
      onSuccess: ({ txid, namespaceName }) => {
        setMessage(
          <Alert
            type="success"
            message={
              <div className="flex w-full flex-col text-center">
                <div>
                  Succesfully set handle as default {namespaceName} identity.
                </div>
                <div>
                  Changes will be reflected <TransactionLink txid={txid} />
                </div>
              </div>
            }
          />
        )
        queryClient.invalidateQueries()
      },

      onError: async (e) => {
        setMessage(
          <Alert
            message={handleError(e, `${e}`)}
            type="error"
            style={{
              margin: '10px 0px',
              height: 'auto',
              wordBreak: 'break-word',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          />
        )
      },
    }
  )
}
