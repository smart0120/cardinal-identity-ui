import { withRevokeCertificateV2 } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import type { ReverseEntryData } from '@cardinal/namespaces'
import {
  withInvalidateExpiredNameEntry,
  withInvalidateExpiredReverseEntry,
} from '@cardinal/namespaces'
import * as namespaces from '@cardinal/namespaces'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import { useMutation } from 'react-query'

import { nameFromMint } from '../components/NameManager'
import type { UserTokenData } from '../hooks/useUserNamesForNamespace'
import { executeTransaction } from '../utils/transactions'

export const useHandleUnlink = (
  connection: Connection,
  wallet: Wallet,
  namespaceName: string,
  userTokenData: UserTokenData
) => {
  return useMutation(
    async ({
      reverseNameEntryData,
    }: {
      reverseNameEntryData?: AccountData<ReverseEntryData>
    }): Promise<string> => {
      const [namespaceId] = await namespaces.findNamespaceId(namespaceName)
      const transaction = new Transaction()
      const entryMint = new PublicKey(userTokenData.metaplexData?.parsed.mint!)
      const [, entryName] = nameFromMint(
        userTokenData.metaplexData?.parsed.data.name!,
        userTokenData.metaplexData?.parsed.data.uri!
      )
      if (userTokenData.certificate) {
        await withRevokeCertificateV2(connection, wallet, transaction, {
          certificateMint: entryMint,
          revokeRecipient: namespaceId,
        })
      } else if (userTokenData.tokenManager) {
        // invalidate token manager
      }
      if (reverseNameEntryData) {
        await withInvalidateExpiredReverseEntry(
          transaction,
          connection,
          wallet,
          {
            namespaceName,
            mintId: entryMint,
            entryName: reverseNameEntryData.parsed.entryName,
            reverseEntryId: reverseNameEntryData.pubkey,
          }
        )
      }
      await withInvalidateExpiredNameEntry(transaction, connection, wallet, {
        namespaceName,
        mintId: entryMint,
        entryName,
      })
      transaction.feePayer = wallet.publicKey
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash('max')
      ).blockhash
      return executeTransaction(connection, wallet, transaction, {
        confirmOptions: {
          commitment: 'confirmed',
          maxRetries: 3,
          skipPreflight: true,
        },
        notificationConfig: { message: 'Unlinked handle successfully' },
      })
    }
  )
}
