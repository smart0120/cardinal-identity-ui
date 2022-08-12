import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, Connection, PublicKey } from '@solana/web3.js'
import { sendAndConfirmRawTransaction, Transaction } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'

import { apiBase } from '../utils/constants'

export interface HandleSetParam {
  metaplexData?: {
    pubkey: PublicKey
    parsed: metaplex.MetadataData
  } | null
  tokenManager?: AccountData<TokenManagerData>
  certificate?: AccountData<CertificateData> | null
}

export const useHandleClaimTransaction = (
  connection: Connection,
  wallet: Wallet,
  cluster: Cluster,
  handle: string,
  accessToken: string
) => {
  const { identity } = useWalletIdentity()

  return useMutation(
    [wallet.publicKey.toString()],
    async ({
      verificationUrl,
    }: {
      verificationUrl?: string
    }): Promise<string> => {
      if (!verificationUrl) throw new Error('No verification url provided')
      const transactions = await handleClaim(
        wallet,
        cluster,
        identity.name,
        handle,
        verificationUrl
      )
      if (!transactions) return ''
      await wallet.signAllTransactions(transactions)
      let txId = ''
      transactions.forEach(async (tx, index) => {
        const id = await sendAndConfirmRawTransaction(
          connection,
          tx.serialize(),
          {
            skipPreflight: true,
          }
        )
        if (index === transactions.length - 1) {
          txId = id
        }
      })
      return txId
    }
  )
}

export async function handleClaim(
  wallet: Wallet,
  cluster: Cluster,
  namespace: string,
  handle: string | undefined,
  tweetId: string | undefined
): Promise<Transaction[] | null> {
  if (!handle || !tweetId) return null
  const response = await fetch(
    `${apiBase(
      cluster === 'devnet'
    )}/${namespace}/claim?tweetId=${tweetId}&publicKey=${wallet?.publicKey.toString()}&handle=${handle}${
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
  const transactions = json.transactions as string[]
  return transactions.map((tx) =>
    Transaction.from(Buffer.from(decodeURIComponent(tx), 'base64'))
  )
}
