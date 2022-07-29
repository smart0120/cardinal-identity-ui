import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import { deprecated, withSetNamespaceReverseEntry } from '@cardinal/namespaces'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import { useMutation } from 'react-query'

import { nameFromMint } from '../components/NameManager'
import { executeTransaction } from '../utils/transactions'

export interface HandleSetParam {
  metaplexData?: {
    pubkey: PublicKey
    parsed: metaplex.MetadataData
  } | null
  tokenManager?: AccountData<TokenManagerData>
  certificate?: AccountData<CertificateData> | null
}

export const useHandleSetDefault = (
  connection: Connection,
  wallet: Wallet,
  namespaceName: string
) => {
  return useMutation(
    async ({ tokenData }: { tokenData?: HandleSetParam }): Promise<string> => {
      if (!tokenData) return ''
      const transaction = new Transaction()
      const entryMint = new PublicKey(tokenData.metaplexData?.parsed.mint!)
      const [, entryName] = nameFromMint(
        tokenData.metaplexData?.parsed.data.name || '',
        tokenData.metaplexData?.parsed.data.uri || ''
      )
      if (tokenData.certificate) {
        await deprecated.withSetReverseEntry(
          connection,
          wallet,
          namespaceName,
          entryName,
          entryMint,
          transaction
        )
      } else if (tokenData.tokenManager) {
        await withSetNamespaceReverseEntry(
          transaction,
          connection,
          wallet,
          namespaceName,
          entryName,
          entryMint
        )
      }
      transaction.feePayer = wallet.publicKey
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash('max')
      ).blockhash
      const txid = await executeTransaction(connection, wallet, transaction, {
        confirmOptions: {
          commitment: 'confirmed',
          maxRetries: 3,
          skipPreflight: true,
        },
        notificationConfig: { message: 'Set to default successfully' },
      })
      return txid
    }
  )
}
