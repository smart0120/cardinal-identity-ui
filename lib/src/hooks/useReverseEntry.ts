import type { AccountData } from '@cardinal/common'
import {
  findDeprecatedReverseEntryId,
  findReverseEntryId,
  NAMESPACES_IDL,
  NAMESPACES_PROGRAM,
  NAMESPACES_PROGRAM_ID,
  ReverseEntryData,
} from '@cardinal/namespaces'
import { findNamespaceId } from '@cardinal/namespaces'
import { Program } from '@project-serum/anchor'
import { AnchorProvider } from '@project-serum/anchor/dist/esm'
import type { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

export const useReverseEntry = (
  connection: Connection | undefined,
  namespaceName: string,
  pubkey: PublicKey | undefined
) => {
  return useQuery<AccountData<ReverseEntryData> | undefined>(
    ['useReverseEntry', namespaceName, pubkey?.toString()],
    async () => {
      if (!pubkey || !connection) return
      const [namespaceId] = await findNamespaceId(namespaceName)
      const reverseEntry = await getReverseEntry(
        connection,
        pubkey,
        namespaceId
      )
      return reverseEntry || undefined
    },
    { refetchOnMount: false, refetchOnWindowFocus: false }
  )
}

export async function getReverseEntry(
  connection: Connection,
  pubkey: PublicKey,
  namespace?: PublicKey,
  disallowGlobal?: boolean
): Promise<AccountData<ReverseEntryData>> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new AnchorProvider(connection, null, {})
  const namespacesProgram = new Program<NAMESPACES_PROGRAM>(
    NAMESPACES_IDL,
    NAMESPACES_PROGRAM_ID,
    provider
  )
  try {
    if (!namespace) {
      throw new Error('Skipping to deprecated version')
    }
    const [reverseEntryId] = await findReverseEntryId(namespace, pubkey)
    const parsed = await namespacesProgram.account.reverseEntry.fetch(
      reverseEntryId
    )
    if (!parsed) {
      throw new Error('Failed trying deprecated global reverse entry')
    }
    return {
      parsed,
      pubkey: reverseEntryId,
    }
  } catch (e) {
    if (disallowGlobal) {
      throw new Error(
        'Reverse entry not found and global reverse entry disallowed'
      )
    }
    const [reverseEntryId] = await findDeprecatedReverseEntryId(pubkey)
    const parsed = await namespacesProgram.account.reverseEntry.fetch(
      reverseEntryId
    )
    return {
      parsed,
      pubkey: reverseEntryId,
    }
  }
}
