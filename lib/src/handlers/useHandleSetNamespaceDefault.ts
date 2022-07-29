import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import { deprecated, withSetNamespaceReverseEntry } from '@cardinal/namespaces'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, Connection } from '@solana/web3.js'
import {
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
} from '@solana/web3.js'
import { useMutation } from 'react-query'

import { nameFromMint } from '../components/NameManager'
import { useGlobalReverseEntry } from '../hooks/useGlobalReverseEntry'
import { useNamespaceReverseEntry } from '../hooks/useNamespaceReverseEntry'
import { UserTokenData } from '../hooks/useUserNamesForNamespace'
import { handleMigrate } from './handleMigrate'

export interface HandleSetParam {
  metaplexData?: AccountData<metaplex.MetadataData>
  tokenManager?: AccountData<TokenManagerData>
  certificate?: AccountData<CertificateData> | null
}

export const useHandleSetNamespaceDefault = (
  connection: Connection,
  wallet: Wallet,
  namespaceName: string,
  cluster: Cluster
) => {
  const globalReverseEntry = useGlobalReverseEntry(
    connection,
    namespaceName,
    wallet?.publicKey
  )

  const namespaceReverseEntry = useNamespaceReverseEntry(
    connection,
    namespaceName,
    wallet?.publicKey
  )

  return useMutation(
    async ({ tokenData }: { tokenData?: HandleSetParam }): Promise<string> => {
      if (!tokenData) return ''
      let transaction = new Transaction()
      const entryMint = new PublicKey(tokenData.metaplexData?.parsed.mint!)
      const [, entryName] = nameFromMint(
        tokenData.metaplexData?.parsed.data.name || '',
        tokenData.metaplexData?.parsed.data.uri || ''
      )

      if (tokenData.certificate) {
        console.log('Type certificate, migrating ...')
        transaction = await handleMigrate(
          wallet,
          connection,
          cluster,
          namespaceName,
          tokenData as UserTokenData,
          globalReverseEntry.data,
          namespaceReverseEntry.data
        )

        console.log('Migrated')
      }

      await withSetNamespaceReverseEntry(
        transaction,
        connection,
        wallet,
        namespaceName,
        entryName,
        entryMint
      )

      transaction.feePayer = wallet.publicKey
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash('max')
      ).blockhash
      await wallet.signTransaction(transaction)
      const txid = await sendAndConfirmRawTransaction(
        connection,
        transaction.serialize(),
        {
          skipPreflight: true,
        }
      )
      return txid
    }
  )
}
