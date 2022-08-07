import { getNameEntry, ReverseEntryData, withApproveClaimRequest, withMigrateNameEntryMint } from '@cardinal/namespaces'
import { BN } from '@project-serum/anchor'
import type { Wallet } from '@saberhq/solana-contrib'
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import * as splToken from '@solana/spl-token'
import { nameFromMint } from '../components/NameManager'
import { UserTokenData } from '../hooks/useUserNamesForNamespace'

import { handleUnlink } from './useHandleUnlink'
import { AccountData, tryGetAccount } from '@cardinal/token-manager'

export const handleMigrate = async (
  wallet: Wallet,
  connection: Connection,
  namespaceName: string,
  userTokenData: UserTokenData,
  mintKeypair: Keypair,
  globalReverseNameEntryData?: AccountData<ReverseEntryData>,
  namespaceReverseEntry?: AccountData<ReverseEntryData>
): Promise<Transaction[] | undefined> => {
  if (userTokenData.certificate) {
    const [, entryName] = nameFromMint(
      userTokenData.metaplexData?.parsed.data.name || '',
      userTokenData.metaplexData?.parsed.data.uri || ''
    )

    const userNameEntryMintTokenAccount =
      await splToken.Token.getAssociatedTokenAddress(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        userTokenData.certificate.parsed.mint,
        wallet.publicKey,
        true
      )

    const nameEntryData = await tryGetAccount(() =>
      getNameEntry(connection, namespaceName, entryName)
    )

    const revokeTransaction = new Transaction()
    if (
      !nameEntryData ||
      (nameEntryData && nameEntryData.parsed.isClaimed === true)
    ) {
      await withApproveClaimRequest(revokeTransaction, connection, wallet, {
        namespaceName: namespaceName,
        entryName: entryName,
        user: wallet.publicKey,
        userNameEntryMintTokenAccount: userNameEntryMintTokenAccount,
      })

      revokeTransaction.instructions = [
        ...revokeTransaction.instructions,
        ...(
          await handleUnlink(connection, wallet, {
            namespaceName: namespaceName,
            userTokenData: userTokenData,
            globalReverseNameEntryData: globalReverseNameEntryData,
            namespaceReverseEntry: namespaceReverseEntry,
          })
        ).instructions,
      ]
      console.log('Approve claim request and revoke crtificate')
    }

    const migrateTransaction = new Transaction()
    migrateTransaction.add(
      new TransactionInstruction({
        keys: [],
        programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
        data: Buffer.from(
          Uint8Array.of(
            0,
            ...new BN(400000).toArray('le', 4),
            ...new BN(0).toArray('le', 4)
          )
        ),
      })
    )

    await withMigrateNameEntryMint(migrateTransaction, connection, wallet, {
      namespaceName: namespaceName,
      entryName: entryName,
      certificateMint: userTokenData.certificate.parsed.mint,
      mintKeypair: mintKeypair,
    })

    return [revokeTransaction, migrateTransaction]
  }
  return [new Transaction()]
}
