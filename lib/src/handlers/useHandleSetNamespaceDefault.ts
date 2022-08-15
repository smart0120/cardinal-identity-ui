import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import {
  withSetGlobalReverseEntry,
  withSetNamespaceReverseEntry,
} from '@cardinal/namespaces'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection } from '@solana/web3.js'
import {
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
} from '@solana/web3.js'
import { useMutation, useQueryClient } from 'react-query'

import { nameFromMint } from '../components/NameManager'
import { useGlobalReverseEntry } from '../hooks/useGlobalReverseEntry'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { handleError } from '../utils/errors'
import { tracer, withTrace } from '../utils/trace'
import { handleMigrate } from './handleMigrate'

export interface HandleSetParam {
  metaplexData?: AccountData<metaplex.MetadataData>
  tokenManager?: AccountData<TokenManagerData>
  certificate?: AccountData<CertificateData> | null
}

export const useHandleSetNamespaceDefault = (
  connection: Connection,
  wallet: Wallet
) => {
  const { cluster } = useWalletIdentity()
  const queryClient = useQueryClient()
  const { identity } = useWalletIdentity()
  const globalReverseEntry = useGlobalReverseEntry(
    connection,
    wallet?.publicKey
  )

  return useMutation(
    async ({
      tokenData,
      forceMigrate,
    }: {
      tokenData?: HandleSetParam
      forceMigrate?: boolean
    }): Promise<string> => {
      if (!tokenData) return ''
      let newMintId: PublicKey | undefined
      let transactions: Transaction[] = []
      const entryMint = new PublicKey(tokenData.metaplexData?.parsed.mint!)
      const [, entryName] = nameFromMint(
        tokenData.metaplexData?.parsed.data.name || '',
        tokenData.metaplexData?.parsed.data.uri || ''
      )
      const trace = tracer({ name: 'useGlobalReverseEntry' })
      if (tokenData.certificate || forceMigrate) {
        console.log('Type certificate, migrating ...')
        const response = await withTrace(
          () => handleMigrate(wallet, entryName, cluster),
          trace,
          { op: 'handleMigrate' }
        )
        newMintId = response?.mintId
        transactions = response?.transactions || []
        console.log('Added migration instruction')
      }

      const transaction = new Transaction()
      await withTrace(
        () =>
          withSetNamespaceReverseEntry(
            transaction,
            connection,
            wallet,
            identity.name,
            entryName,
            newMintId || entryMint
          ),
        trace,
        { op: 'withSetNamespaceReverseEntry' }
      )

      if (
        globalReverseEntry.data &&
        globalReverseEntry.data.parsed.namespaceName === identity.name
      ) {
        await withTrace(
          () =>
            withSetGlobalReverseEntry(transaction, connection, wallet, {
              namespaceName: identity.name,
              entryName: entryName,
              mintId: newMintId || entryMint,
            }),
          trace,
          { op: 'withSetGlobalReverseEntry' }
        )
      }
      transaction.feePayer = wallet.publicKey
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash('max')
      ).blockhash
      transactions.push(transaction)

      const txId = ''
      await wallet.signAllTransactions(transactions)
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i]!
        let txId = ''
        try {
          const id = await withTrace(
            () =>
              sendAndConfirmRawTransaction(connection, tx.serialize(), {
                skipPreflight: true,
              }),
            trace,
            { op: `sendTransaction ${i}/${transactions.length}` }
          )
          if (i === transactions.length - 1) {
            txId = id
          }
        } catch (e) {
          const errorMessage = handleError(e, `${e}`)
          throw new Error(errorMessage)
        }
      }
      trace?.finish()
      return txId
    },
    {
      onSuccess: () => queryClient.invalidateQueries(),
    }
  )
}
