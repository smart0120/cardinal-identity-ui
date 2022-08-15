import { withRevokeCertificateV2 } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import { tryPublicKey } from '@cardinal/common'
import type { ReverseEntryData } from '@cardinal/namespaces'
import {
  withInvalidateExpiredNameEntry,
  withInvalidateExpiredReverseEntry,
} from '@cardinal/namespaces'
import * as namespaces from '@cardinal/namespaces'
import { withInvalidate } from '@cardinal/token-manager'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection } from '@solana/web3.js'
import { sendAndConfirmRawTransaction, Transaction } from '@solana/web3.js'
import { useMutation, useQueryClient } from 'react-query'

import type { UserTokenData } from '../hooks/useUserNamesForNamespace'
import { nameFromToken } from '../utils/nameUtils'
import { tracer, withTrace } from '../utils/trace'

export const useHandleUnlink = (
  connection: Connection,
  wallet: Wallet,
  namespaceName: string,
  userTokenData: UserTokenData
) => {
  const queryClient = useQueryClient()
  return useMutation(
    async ({
      globalReverseNameEntryData,
      namespaceReverseEntry,
    }: {
      globalReverseNameEntryData?: AccountData<ReverseEntryData>
      namespaceReverseEntry?: AccountData<ReverseEntryData>
    }): Promise<string> => {
      const trace = tracer({ name: 'useHandleUnlink' })
      const transaction = await withTrace(
        () =>
          handleUnlink(connection, wallet, {
            namespaceName: namespaceName,
            userTokenData: userTokenData,
            globalReverseNameEntryData: globalReverseNameEntryData,
            namespaceReverseEntry: namespaceReverseEntry,
          }),
        trace,
        { op: 'handleUnlink' }
      )
      transaction.feePayer = wallet.publicKey
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash('max')
      ).blockhash
      await wallet.signTransaction(transaction)
      const txid = withTrace(
        () =>
          sendAndConfirmRawTransaction(connection, transaction.serialize(), {
            skipPreflight: true,
          }),
        trace,
        { op: 'sendTransaction' }
      )
      return txid
    },
    {
      onSuccess: () => queryClient.invalidateQueries(),
    }
  )
}

export async function handleUnlink(
  connection: Connection,
  wallet: Wallet,
  params: {
    namespaceName: string
    userTokenData: UserTokenData
    globalReverseNameEntryData?: AccountData<ReverseEntryData>
    namespaceReverseEntry?: AccountData<ReverseEntryData>
  }
): Promise<Transaction> {
  const [namespaceId] = await namespaces.findNamespaceId(params.namespaceName)
  const transaction = new Transaction()
  const entryMint = tryPublicKey(params.userTokenData.metaplexData?.parsed.mint)
  if (!entryMint) throw new Error('Failed to get mint')
  const [, entryName] = nameFromToken(params.userTokenData)
  if (params.userTokenData.certificate) {
    await withRevokeCertificateV2(connection, wallet, transaction, {
      certificateMint: entryMint,
      revokeRecipient: namespaceId,
    })
  } else if (params.userTokenData.tokenManager) {
    // invalidate token manager
    await withInvalidate(transaction, connection, wallet, entryMint)
  }
  if (params.namespaceReverseEntry) {
    await withInvalidateExpiredReverseEntry(transaction, connection, wallet, {
      namespaceName: params.namespaceName,
      mintId: entryMint,
      entryName: params.namespaceReverseEntry.parsed.entryName,
      reverseEntryId: params.namespaceReverseEntry.pubkey,
    })
  }
  if (params.globalReverseNameEntryData) {
    await withInvalidateExpiredReverseEntry(transaction, connection, wallet, {
      namespaceName: params.namespaceName,
      mintId: entryMint,
      entryName: params.globalReverseNameEntryData.parsed.entryName,
      reverseEntryId: params.globalReverseNameEntryData.pubkey,
    })
  }
  await withInvalidateExpiredNameEntry(transaction, connection, wallet, {
    namespaceName: params.namespaceName,
    mintId: entryMint,
    entryName,
  })
  return transaction
}
