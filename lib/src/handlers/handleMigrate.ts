import type { Wallet } from '@saberhq/solana-contrib'
import { PublicKey, Transaction } from '@solana/web3.js'

import { apiBase } from '../utils/constants'

export const handleMigrate = async (
  wallet: Wallet,
  handle: string,
  namespaceName: string,
  cluster = 'mainnet'
): Promise<{ mintId: PublicKey; transactions: Transaction[] } | undefined> => {
  if (namespaceName !== 'twitter') {
    throw new Error('Cannot migrate handle that is not twitter')
  }
  const response = await fetch(
    `${apiBase(
      cluster === 'devnet'
    )}/twitter/migrate?publicKey=${wallet?.publicKey.toString()}&handle=${handle}${
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
  const serializedTransactions = transactions as string[]
  const txs = serializedTransactions.map((tx) =>
    Transaction.from(Buffer.from(decodeURIComponent(tx), 'base64'))
  )
  return { mintId: new PublicKey(mintId), transactions: txs }
}
