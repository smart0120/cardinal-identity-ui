import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import { getBatchedMultipleAccounts } from '@cardinal/common'
import { findNamespaceId } from '@cardinal/namespaces'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import * as spl from '@solana/spl-token'
import type {
  AccountInfo,
  Connection,
  ParsedAccountData,
} from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

import { accountDataById } from '../utils/accounts'
import { TWITTER_NAMESPACE_NAME } from '../utils/constants'
import { tryPublicKey } from '../utils/format'
import { tracer, withTrace } from '../utils/trace'

export type UserTokenData = {
  tokenAccount?: {
    pubkey: PublicKey
    account: AccountInfo<ParsedAccountData>
  }
  metaplexData?: AccountData<metaplex.MetadataData>
  tokenManager?: AccountData<TokenManagerData>
  certificate?: AccountData<CertificateData> | null
}

export const useUserNamesForNamespace = (
  connection: Connection,
  walletId: PublicKey | undefined,
  namespaceName: string
) => {
  return useQuery<UserTokenData[]>(
    ['useUserNamesForNamespace', walletId?.toString()],
    async () => {
      if (!walletId) return []
      const trace = tracer({ name: 'useUserNamesForNamespace' })
      const [namespaceId] = await findNamespaceId(namespaceName)

      const allTokenAccounts = await withTrace(
        () =>
          connection.getParsedTokenAccountsByOwner(new PublicKey(walletId), {
            programId: spl.TOKEN_PROGRAM_ID,
          }),
        trace,
        { op: 'getParsedTokenAccountsByOwner' }
      )
      let tokenAccounts = allTokenAccounts.value
        .filter(
          (tokenAccount) =>
            tokenAccount.account.data.parsed.info.tokenAmount.uiAmount > 0
        )
        .sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()))

      // lookup metaplex data
      const metaplexIds = await withTrace(
        () =>
          Promise.all(
            tokenAccounts.map(
              async (tokenAccount) =>
                (
                  await metaplex.MetadataProgram.findMetadataAccount(
                    new PublicKey(tokenAccount.account.data.parsed.info.mint)
                  )
                )[0]
            )
          ),
        trace,
        { op: 'collectMetaplexIds' }
      )

      const metaplexAccountInfos = await withTrace(
        () => getBatchedMultipleAccounts(connection, metaplexIds),
        trace,
        { op: 'getMetaplexAccountInfos' }
      )
      const metaplexData = metaplexAccountInfos.reduce(
        (acc, accountInfo, i) => {
          try {
            acc[tokenAccounts[i]!.pubkey.toString()] = {
              pubkey: metaplexIds[i]!,
              ...accountInfo,
              parsed: metaplex.MetadataData.deserialize(
                accountInfo?.data as Buffer
              ) as metaplex.MetadataData,
            }
          } catch (e) {}
          return acc
        },
        {} as {
          [tokenAccountId: string]: {
            pubkey: PublicKey
            parsed: metaplex.MetadataData
          }
        }
      )

      // filter by creators
      tokenAccounts = tokenAccounts.filter(
        (tokenAccount) =>
          metaplexData[
            tokenAccount.pubkey.toString()
          ]?.parsed?.data?.creators?.some(
            (creator) =>
              creator.address.toString() === namespaceId.toString() &&
              creator.verified
          ) ||
          (metaplexData[tokenAccount.pubkey.toString()]?.parsed?.data
            ?.symbol === 'NAME' &&
            metaplexData[
              tokenAccount.pubkey.toString()
            ]?.parsed?.data?.name.includes(TWITTER_NAMESPACE_NAME))
      )

      // lookup delegates
      const delegateIds = tokenAccounts.map((tokenAccount) =>
        tryPublicKey(tokenAccount.account.data.parsed.info.delegate)
      )
      const accountsById = await withTrace(
        () => accountDataById(connection, delegateIds),
        trace,
        { op: 'getDelegates' }
      )

      return tokenAccounts.map((tokenAccount, i) => {
        const delegateData =
          accountsById[tokenAccount.account.data.parsed.info.delegate]

        let tokenManagerData: AccountData<TokenManagerData> | undefined
        let certificateData: AccountData<CertificateData> | undefined
        if (delegateData?.type === 'tokenManager') {
          tokenManagerData = delegateData as AccountData<TokenManagerData>
        } else if (delegateData?.type === 'certificate') {
          certificateData = delegateData as AccountData<CertificateData>
        }
        return {
          tokenAccount,
          metaplexData: metaplexData[tokenAccount.pubkey.toString()],
          tokenManager: tokenManagerData,
          certificate: certificateData,
        }
      })
    }
  )
}
