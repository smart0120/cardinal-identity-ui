import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection, PublicKey } from '@solana/web3.js'
import { sendAndConfirmRawTransaction, Transaction } from '@solana/web3.js'
import { useMutation, useQueryClient } from 'react-query'

import { Alert } from '../common/Alert'
import type { Identity } from '../common/Identities'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { handleError } from '../utils/errors'
import { tracer, withTrace } from '../utils/trace'

export interface HandleSetParam {
  metaplexData?: {
    pubkey: PublicKey
    parsed: metaplex.MetadataData
  } | null
  tokenManager?: AccountData<TokenManagerData>
  certificate?: AccountData<CertificateData> | null
}

export const useHandleClaim = (
  connection: Connection,
  wallet: Wallet,
  identity: Identity,
  handle: string | undefined
) => {
  const { setMessage } = useWalletIdentity()
  const queryClient = useQueryClient()
  const { dev, cluster } = useWalletIdentity()

  return useMutation(
    [wallet.publicKey.toString()],
    async ({
      proof,
      accessToken,
    }: {
      proof?: string
      accessToken?: string
    }): Promise<string> => {
      if (!proof) throw new Error('No verification url provided')
      const trace = tracer({ name: 'useHandleClaim' })

      if (!handle) throw new Error('Missing handle')
      const claimUrl = identity.claimUrl(
        handle,
        proof,
        accessToken,
        cluster,
        dev
      )

      // get response
      const response = await withTrace(
        () =>
          fetch(claimUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              account: wallet.publicKey.toString(),
            }),
          }),
        trace,
        { op: 'handleClaim' }
      )

      // handle response
      const json = await response.json()
      if (response.status !== 200 || json.error) {
        throw new Error(json.error ?? json.message)
      }

      const encodedTxs = json.transactions as string[]
      const transactions = encodedTxs.map((tx) =>
        Transaction.from(Buffer.from(decodeURIComponent(tx), 'base64'))
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
