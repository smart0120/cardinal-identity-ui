import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, Connection, PublicKey } from '@solana/web3.js'
import { sendAndConfirmRawTransaction, Transaction } from '@solana/web3.js'
import { useMutation, useQueryClient } from 'react-query'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'

import { apiBase } from '../utils/constants'
import { tracer, withTrace } from '../utils/trace'

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
  dev: boolean,
  accessToken: string,
  handle: string
) => {
  const queryClient = useQueryClient()
  const { identity } = useWalletIdentity()

  return useMutation(
    [wallet.publicKey.toString()],
    async ({
      verificationUrl,
    }: {
      verificationUrl?: string
    }): Promise<string> => {
      if (!verificationUrl) throw new Error('No verification url provided')
      let requestURL = ''
      const trace = tracer({ name: 'useHandleClaim' })
      const transactions = await withTrace(
        () =>
          handleClaim(wallet, cluster, identity.name, handle, verificationUrl),
        trace,
        { op: 'handleClaim' }
      )
      if (!transactions) return ''
      let txId = ''
      await wallet.signAllTransactions(transactions)
      for (const tx of transactions) {
        txId = await withTrace(
          () =>
            sendAndConfirmRawTransaction(connection, tx.serialize(), {
              skipPreflight: true,
            }),
          trace,
          { op: 'sendTransaction' }
        )
      }
      trace?.finish()
      return txId
    },
    {
      onSuccess: () => queryClient.invalidateQueries(),
    }
  )
}

export async function handleClaim(
  wallet: Wallet,
  cluster: Cluster,
  namespace: string,
  handle: string | undefined,
  tweetId: string | undefined,
  dev?: boolean
): Promise<Transaction[] | null> {
  if (!handle || !tweetId) return null
  const response = await fetch(
    `${apiBase(
      dev
    )}/namespaces/${namespace}/claim?tweetId=${tweetId}&publicKey=${wallet?.publicKey.toString()}&handle=${handle}&namespace=twitter${
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
