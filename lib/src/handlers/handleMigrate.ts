import { AccountData } from '@cardinal/common'
import { ReverseEntryData } from '@cardinal/namespaces'
import type { Wallet } from '@saberhq/solana-contrib'
import { Cluster, Connection, Transaction } from '@solana/web3.js'
import { nameFromMint } from '../components/NameManager'
import { UserTokenData } from '../hooks/useUserNamesForNamespace'
import { handleClaim } from './useHandleClaimTransaction'

import { handleUnlink } from './useHandleUnlink'

export const handleMigrate = async (
  wallet: Wallet,
  connection: Connection,
  cluster: Cluster,
  namespaceName: string,
  userTokenData: UserTokenData,
  globalReverseNameEntryData?: AccountData<ReverseEntryData>,
  namespaceReverseEntry?: AccountData<ReverseEntryData>
): Promise<Transaction> => {
  if (userTokenData.certificate) {
    // unlink
    console.log(`Initiate unlinking`)
    const tx = await handleUnlink(connection, wallet, {
      namespaceName: namespaceName,
      userTokenData: userTokenData,
      globalReverseNameEntryData: globalReverseNameEntryData,
      namespaceReverseEntry: namespaceReverseEntry,
    })
    console.log(`Unlinking txId ${''}`)

    // claim
    console.log(`Initiate claiming`)
    const [, entryName] = nameFromMint(
      userTokenData.metaplexData?.parsed.data.name || '',
      userTokenData.metaplexData?.parsed.data.uri || ''
    )
    const claimTx = await handleClaim(
      wallet,
      cluster || 'devnet',
      entryName,
      'random'
    )
    if (claimTx) {
      tx.instructions = [...tx.instructions, ...claimTx.instructions]
    }
    console.log(`Claiming txId ${''}`)
    return tx
  }
  return new Transaction()
}
