import type { AccountData } from '@cardinal/common'
import type { EntryData } from '@cardinal/namespaces'
import * as namespaces from '@cardinal/namespaces'
import type { Wallet } from '@saberhq/solana-contrib'
import * as web3 from '@solana/web3.js'

export function apiBase(dev?: boolean): string {
  return `https://${dev ? 'dev-api' : 'api'}.cardinal.so`
}

export async function tryGetNameEntry(
  connection: web3.Connection,
  namespaceName: string,
  entryName: string
): Promise<AccountData<EntryData> | null> {
  try {
    const entry = await namespaces.getNameEntry(
      connection,
      namespaceName,
      entryName
    )
    return entry
  } catch (e) {
    return null
  }
}

export async function revokeAndClaim(
  cluster: string,
  connection: web3.Connection,
  wallet: Wallet,
  namespaceName: string,
  entryName: string,
  duration: number | null,
  reverseEntryId: web3.PublicKey,
  claimRequestId: web3.PublicKey,
  certificateMintId: web3.PublicKey,
  certificateOwnerId: web3.PublicKey
): Promise<string> {
  const entry = await tryGetNameEntry(connection, namespaceName, entryName)
  const transaction = new web3.Transaction()
  if (!entry?.parsed.reverseEntry) {
    // await namespaces.deprecated.withRevokeReverseEntry(
    //   connection,
    //   wallet,
    //   namespaceName,
    //   entryName,
    //   reverseEntryId,
    //   claimRequestId,
    //   transaction
    // )
  }
  await namespaces.deprecated.withRevokeEntry(
    connection,
    wallet,
    namespaceName,
    entryName,
    certificateMintId,
    certificateOwnerId,
    claimRequestId,
    transaction
  )
  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash
  await wallet.signTransaction(transaction)
  const txid = await web3.sendAndConfirmRawTransaction(
    connection,
    transaction.serialize()
  )

  const transaction2 = new web3.Transaction()
  await namespaces.deprecated.withClaimEntry(
    connection,
    wallet,
    namespaceName,
    entryName,
    certificateMintId,
    duration || 0,
    transaction2
  )
  await namespaces.deprecated.withSetReverseEntry(
    connection,
    wallet,
    namespaceName,
    entryName,
    certificateMintId,
    transaction2
  )
  transaction2.feePayer = wallet.publicKey
  transaction2.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash
  await wallet.signTransaction(transaction2)
  return web3.sendAndConfirmRawTransaction(connection, transaction2.serialize())
}

export async function setReverseEntry(
  connection: web3.Connection,
  wallet: Wallet,
  namespaceName: string,
  entryName: string,
  certificateMintId: web3.PublicKey
): Promise<string> {
  const transaction = await namespaces.deprecated.withSetReverseEntry(
    connection,
    wallet,
    namespaceName,
    entryName,
    certificateMintId,
    new web3.Transaction()
  )
  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash
  await wallet.signTransaction(transaction)
  let txid = null
  txid = await web3.sendAndConfirmRawTransaction(
    connection,
    transaction.serialize()
  )
  return txid
}

export async function initAndClaimEntry(
  cluster: string,
  connection: web3.Connection,
  wallet: Wallet,
  namespaceName: string,
  entryName: string,
  duration: number | null
): Promise<string> {
  const certificateMint = web3.Keypair.generate()
  const transaction = new web3.Transaction()
  await namespaces.deprecated.withInitEntry(
    connection,
    wallet,
    certificateMint.publicKey,
    namespaceName,
    entryName,
    transaction
  )
  await namespaces.deprecated.withClaimEntry(
    connection,
    wallet,
    namespaceName,
    entryName,
    certificateMint.publicKey,
    duration || 0,
    transaction
  )
  await namespaces.deprecated.withSetReverseEntry(
    connection,
    wallet,
    namespaceName,
    entryName,
    certificateMint.publicKey,
    transaction
  )
  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash
  await wallet.signTransaction(transaction)
  await transaction.partialSign(certificateMint)
  return web3.sendAndConfirmRawTransaction(connection, transaction.serialize())
}

export async function claimEntry(
  connection: web3.Connection,
  wallet: Wallet,
  namespaceName: string,
  entryName: string,
  certificateMintId: web3.PublicKey,
  duration: number | null
): Promise<string> {
  const transaction = await namespaces.deprecated.withClaimEntry(
    connection,
    wallet,
    namespaceName,
    entryName,
    certificateMintId,
    duration || 0,
    new web3.Transaction()
  )
  await namespaces.deprecated.withSetReverseEntry(
    connection,
    wallet,
    namespaceName,
    entryName,
    certificateMintId,
    transaction
  )
  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash
  await wallet.signTransaction(transaction)
  let txid = null
  txid = await web3.sendAndConfirmRawTransaction(
    connection,
    transaction.serialize()
  )
  return txid
}
