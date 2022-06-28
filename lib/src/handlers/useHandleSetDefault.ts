import { deprecated, withSetNamespaceReverseEntry } from '@cardinal/namespaces'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection } from '@solana/web3.js'
import {
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
} from '@solana/web3.js'
import { useMutation } from 'react-query'

import { nameFromMint } from '../components/NameManager'
import type { UserTokenData } from '../hooks/useUserNamesForNamespace'

export const useHandleSetDefault = (
  connection: Connection,
  wallet: Wallet,
  namespaceName: string
) => {
  return useMutation(
    async ({
      userTokenData,
    }: {
      userTokenData: UserTokenData
    }): Promise<string> => {
      const transaction = new Transaction()
      const entryMint = new PublicKey(userTokenData.metaplexData?.data.mint!)
      const [, entryName] = nameFromMint(
        userTokenData.metaplexData?.data.data.name || '',
        userTokenData.metaplexData?.data.data.uri || ''
      )
      if (userTokenData.certificate) {
        await deprecated.withSetReverseEntry(
          connection,
          wallet,
          namespaceName,
          entryName,
          entryMint,
          transaction
        )
      } else if (userTokenData.tokenManager) {
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
      await wallet.signTransaction(transaction)
      return sendAndConfirmRawTransaction(connection, transaction.serialize(), {
        skipPreflight: true,
      })
    }
  )
}
