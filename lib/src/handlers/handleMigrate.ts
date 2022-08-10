import type { Wallet } from '@saberhq/solana-contrib'
import {
  Cluster,
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
} from '@solana/web3.js'
import { useMutation } from 'react-query'

import { apiBase } from '../utils/constants'
import { handleError } from '../utils/errors'

export const useHandleMigrate = (
  connection: Connection,
  wallet: Wallet,
  cluster: Cluster
) => {
  return useMutation(
    [wallet.publicKey.toString()],
    async ({ handle }: { handle?: string }): Promise<string | undefined> => {
      if (!handle) return undefined
      const response = await handleMigrate(wallet, handle, cluster)
      const transactions = response?.transactions
      if (!transactions) return ''

      for (const tx of transactions) {
        tx.feePayer = wallet.publicKey
        tx.recentBlockhash = (
          await connection.getRecentBlockhash('max')
        ).blockhash
      }
      await wallet.signAllTransactions(transactions)
      let txId = ''
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i]!
        try {
          const id = await sendAndConfirmRawTransaction(
            connection,
            tx.serialize(),
            {
              skipPreflight: true,
            }
          )
          if (i === 0) {
            txId = id
          }
        } catch (e) {
          const errorMessage = handleError(e, `${e}`)
          throw new Error(errorMessage)
        }
      }
      return txId
    }
  )
}

export const handleMigrate = async (
  wallet: Wallet,
  handle: string,
  cluster = 'mainnet'
): Promise<{ mintId: PublicKey; transactions: Transaction[] } | undefined> => {
  const response = await fetch(
    `${apiBase(
      cluster === 'devnet'
    )}/namespaces/twitter/migrate?publicKey=${wallet?.publicKey.toString()}&handle=${handle}&namespace=twitter${
      cluster === 'devnet' ? `&cluster=${cluster}` : ''
    }`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account: wallet.publicKey.toString(),
      }),
    }
  )
  const json = await response.json()
  if (response.status !== 200 || json.error) throw new Error(json.error)
  const { transactions, mintId } = json
  const [revokeTransaction, migrateTransaction] = transactions as string[]
  const revokeBuffer = Buffer.from(
    decodeURIComponent(revokeTransaction!),
    'base64'
  )
  const migrateBuffer = Buffer.from(
    decodeURIComponent(migrateTransaction!),
    'base64'
  )
  const revokeTx = Transaction.from(revokeBuffer)
  const migrateTx = Transaction.from(migrateBuffer)
  return { mintId: new PublicKey(mintId), transactions: [revokeTx, migrateTx] }
}
