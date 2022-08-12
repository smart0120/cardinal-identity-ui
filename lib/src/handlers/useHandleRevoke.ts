import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'

import { apiBase } from '../utils/constants'
import { tweetIdFromUrl } from '../utils/verification'

export interface HandleSetParam {
  metaplexData?: {
    pubkey: PublicKey
    parsed: metaplex.MetadataData
  } | null
  tokenManager?: AccountData<TokenManagerData>
  certificate?: AccountData<CertificateData> | null
}

export const useHandleRevoke = (
  wallet: Wallet,
  cluster: Cluster,
  handle: string,
  accessToken: string
) => {
  const { identity } = useWalletIdentity()

  return useMutation(
    async ({
      verificationUrl,
    }: {
      verificationUrl?: string
    }): Promise<void> => {
      if (!verificationUrl) return
      let requestURL = ''

      const tweetId = tweetIdFromUrl(verificationUrl)
      requestURL = `${apiBase(cluster === 'devnet')}/${
        identity.name
      }/revoke?tweetId=${tweetId}&publicKey=${wallet?.publicKey.toString()}&handle=${handle}&accessToken=${accessToken}${
        cluster && `&cluster=${cluster}`
      }`

      const response = await fetch(requestURL)
      const json = await response.json()
      if (response.status !== 200) throw new Error(json.error)
    }
  )
}
