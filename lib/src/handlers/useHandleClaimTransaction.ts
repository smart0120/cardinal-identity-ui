import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, Connection, PublicKey } from '@solana/web3.js'
import { sendAndConfirmRawTransaction, Transaction } from '@solana/web3.js'
import { useMutation } from 'react-query'

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
  cluster: Cluster
) => {
  return useMutation(
    [wallet.publicKey.toString()],
    async ({
      tweetId,
      handle,
    }: {
      tweetId?: string
      handle?: string
    }): Promise<string> => {
      const tx = await handleClaim(wallet, cluster, handle, tweetId)
      if (!tx) return ''
      await wallet.signTransaction!(tx)
      return sendAndConfirmRawTransaction(connection, tx.serialize(), {
        skipPreflight: true,
      })
    }
  )
}

export async function handleClaim(
  wallet: Wallet,
  cluster: Cluster,
  handle: string | undefined,
  tweetId: string | undefined
): Promise<Transaction | null> {
  if (!handle || !tweetId) return null
  const response = await fetch(
    `${apiBase(
      cluster === 'devnet'
    )}/twitter/claim-v2?tweetId=${tweetId}&publicKey=${wallet?.publicKey.toString()}&handle=${handle}&namespace=twitter${
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
  const { transaction } = json
  const buffer = Buffer.from(decodeURIComponent(transaction), 'base64')
  return Transaction.from(buffer)
}
