import type { AccountData, CertificateData } from '@cardinal/certificates'
import { certificateIdForMint, getCertificate } from '@cardinal/certificates'
import { tryGetAccount } from '@cardinal/common'
import type { EntryData } from '@cardinal/namespaces'
import { getNameEntry, NAMESPACES_PROGRAM_ID } from '@cardinal/namespaces'
import * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import * as anchor from '@project-serum/anchor'
import * as splToken from '@solana/spl-token'
import type { Connection, TokenAccountBalancePair } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

export type NameEntryData = {
  nameEntry: AccountData<EntryData>
  certificate?: AccountData<CertificateData>
  metaplexData?: AccountData<metaplex.MetadataData>
  arweaveData?: AccountData<any>
  largestHolders: TokenAccountBalancePair[]
  owner: PublicKey | undefined
  isOwnerPDA: boolean
}

export async function getNameEntryData(
  connection: Connection,
  namespaceName: string,
  entryName: string
): Promise<NameEntryData> {
  const nameEntry = await getNameEntry(connection, namespaceName, entryName)
  const { mint } = nameEntry.parsed

  const [[metaplexId], [certificateId]] = await Promise.all([
    metaplex.MetadataProgram.findMetadataAccount(new PublicKey(mint)),
    certificateIdForMint(mint),
  ])
  const [metaplexData, certificate] = await Promise.all([
    metaplex.Metadata.load(connection, metaplexId),
    tryGetAccount(() => getCertificate(connection, certificateId)),
  ])
  let json
  try {
    json =
      metaplexData.data.data.uri &&
      (await fetch(metaplexData.data.data.uri).then((r) => r.json()))
  } catch (e) {
    console.log('Failed to get json', json)
  }

  const largestHolders = await connection.getTokenLargestAccounts(mint)
  const certificateMintToken = new splToken.Token(
    connection,
    mint,
    splToken.TOKEN_PROGRAM_ID,
    // not used
    anchor.web3.Keypair.generate()
  )

  const largestTokenAccount =
    largestHolders?.value[0]?.address &&
    (await certificateMintToken.getAccountInfo(
      largestHolders?.value[0]?.address
    ))

  let isOwnerPDA = false
  if (largestTokenAccount?.owner) {
    const ownerAccountInfo = await connection.getAccountInfo(
      largestTokenAccount?.owner
    )
    isOwnerPDA =
      ownerAccountInfo?.owner.toString() === NAMESPACES_PROGRAM_ID.toString()
  }

  return {
    nameEntry,
    certificate: certificate ?? undefined,
    metaplexData: { pubkey: metaplexData.pubkey, parsed: metaplexData.data },
    arweaveData: { pubkey: metaplexId, parsed: json },
    largestHolders: largestHolders.value,
    owner: largestTokenAccount?.owner,
    isOwnerPDA,
  }
}

export const useNameEntryData = (
  connection: Connection | undefined,
  namespaceName: string,
  entryName: string | undefined
) => {
  return useQuery<NameEntryData | undefined>(
    ['useNameEntryData', namespaceName, entryName],
    async () => {
      if (!entryName || !connection) return
      return getNameEntryData(connection, namespaceName, entryName)
    },
    {
      enabled: !!entryName && !!connection,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}
