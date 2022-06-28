import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import type { ClaimRequestData } from '@cardinal/namespaces'
import { deprecated, findNamespaceId } from '@cardinal/namespaces'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection, PublicKey } from '@solana/web3.js'
import {
  Keypair,
  sendAndConfirmRawTransaction,
  Transaction,
} from '@solana/web3.js'
import { useMutation } from 'react-query'

import type { NameEntryData } from '../hooks/useNameEntryData'
import { revokeAndClaim, tryGetNameEntry } from '../utils/api'

export const executeTransaction = async (
  connection: Connection,
  wallet: Wallet,
  transaction: Transaction
) => {
  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash
  await wallet.signTransaction(transaction)
  const txid = await sendAndConfirmRawTransaction(
    connection,
    transaction.serialize()
  )
  return txid
}

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
  namespaceName: string
) => {
  return useMutation(
    async ({
      handle,
      claimRequest,
      nameEntryData,
    }: {
      handle?: string
      claimRequest?: AccountData<ClaimRequestData>
      nameEntryData?: NameEntryData
    }): Promise<string> => {
      if (!handle) return ''
      const checkNameEntry = await tryGetNameEntry(
        connection,
        namespaceName,
        handle
      )
      const [namespaceId] = await findNamespaceId(namespaceName)
      if (!checkNameEntry) {
        console.log('Initializing and claiming entry:', handle)
        const certificateMint = Keypair.generate()
        const transaction = new Transaction()
        await deprecated.withInitEntry(
          connection,
          wallet,
          certificateMint.publicKey,
          namespaceName,
          handle,
          transaction
        )
        await deprecated.withClaimEntry(
          connection,
          wallet,
          namespaceName,
          handle,
          certificateMint.publicKey,
          0,
          transaction
        )
        await deprecated.withSetReverseEntry(
          connection,
          wallet,
          namespaceName,
          handle,
          certificateMint.publicKey,
          transaction
        )
        transaction.feePayer = wallet.publicKey
        transaction.recentBlockhash = (
          await connection.getRecentBlockhash('max')
        ).blockhash
        await wallet.signTransaction(transaction)
        await transaction.partialSign(certificateMint)
        const txid = await sendAndConfirmRawTransaction(
          connection,
          transaction.serialize()
        )
        return txid
      } else if (
        (checkNameEntry && !checkNameEntry.parsed.isClaimed) ||
        nameEntryData?.owner?.toString() === namespaceId.toString()
      ) {
        console.log('Claiming entry:', handle)
        const transaction = new Transaction()
        await deprecated.withClaimEntry(
          connection,
          wallet,
          namespaceName,
          handle,
          checkNameEntry.parsed.mint,
          0,
          transaction
        )
        await deprecated.withSetReverseEntry(
          connection,
          wallet,
          namespaceName,
          handle,
          checkNameEntry.parsed.mint,
          transaction
        )
        const txid = await executeTransaction(connection, wallet, transaction)
        return txid
      } else {
        console.log('Revoking and claiming entry:', handle)
        const txid = await revokeAndClaim(
          connection,
          wallet,
          namespaceName,
          handle,
          null,
          checkNameEntry.parsed.reverseEntry!,
          claimRequest!.pubkey,
          checkNameEntry.parsed.mint,
          nameEntryData!.owner!
        )
        return txid
      }
    },
    {
      onError: async (e: { message?: string }) => {
        if (e.message?.includes('0x1')) {
          return 'Not enough sol!'
        }
        return `Failed to claim: ${e.message}`
      },
    }
  )
}
