import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import {
  deprecated,
  withSetGlobalReverseEntry,
  withSetNamespaceReverseEntry,
} from '@cardinal/namespaces'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import { Cluster, Connection, Keypair } from '@solana/web3.js'
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
  namespaceName: string
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
      let transactions: Transaction[] | undefined
      const entryMint = new PublicKey(tokenData.metaplexData?.parsed.mint!)
      const [, entryName] = nameFromMint(
        tokenData.metaplexData?.parsed.data.name || '',
        tokenData.metaplexData?.parsed.data.uri || ''
      )

      let mintKeypair: Keypair | undefined
      if (tokenData.certificate) {
        console.log('Type certificate, migrating ...')
        mintKeypair = Keypair.generate()
        transactions = await handleMigrate(
          wallet,
          connection,
          namespaceName,
          tokenData as UserTokenData,
          mintKeypair,
          globalReverseEntry.data &&
            globalReverseEntry.data.parsed.entryName === entryName
            ? globalReverseEntry.data
            : undefined,
          namespaceReverseEntry.data &&
            namespaceReverseEntry.data.parsed.entryName === entryName
            ? namespaceReverseEntry.data
            : undefined
        )

        console.log('Added migration instructino')
      }

      if (!transactions) transactions = [new Transaction()]
      await withSetNamespaceReverseEntry(
        transactions[1] || transactions[0]!,
        connection,
        wallet,
        namespaceName,
        entryName,
        mintKeypair?.publicKey || entryMint
      )

      if (
        globalReverseEntry.data &&
        globalReverseEntry.data.parsed.namespaceName === namespaceName
      ) {
        await withSetGlobalReverseEntry(
          transactions[1] || transactions[0]!,
          connection,
          wallet,
          {
            namespaceName: namespaceName,
            entryName: entryName,
            mintId: entryMint,
          }
        )
      }

      let txId = ''
      for (const tx of transactions) {
        tx.feePayer = wallet.publicKey
        tx.recentBlockhash = (
          await connection.getRecentBlockhash('max')
        ).blockhash
      }
      await wallet.signAllTransactions(transactions)
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i]!
        i == 1 && mintKeypair && tx.partialSign(mintKeypair)
        const id = await sendAndConfirmRawTransaction(
          connection,
          tx.serialize(),
          {
            skipPreflight: true,
          }
        )
        if (i === transactions.length - 1) {
          txId = id
        }
      }
      return txId
    }
  )
}
