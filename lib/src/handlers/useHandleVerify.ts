import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation } from 'react-query'

import { apiBase } from '../utils/constants'

export interface HandleSetParam {
  metaplexData?: {
    pubkey: PublicKey
    parsed: metaplex.MetadataData
  } | null
  tokenManager?: AccountData<TokenManagerData>
  certificate?: AccountData<CertificateData> | null
}

export const useHandleVerify = (
  wallet: Wallet,
  cluster: Cluster,
  dev: boolean
) => {
  return useMutation(
    [wallet.publicKey.toString()],
    async ({
      tweetId,
      handle,
    }: {
      tweetId?: string
      handle?: string
    }): Promise<void> => {
      if (!handle || !tweetId) return
      const response = await fetch(
        `${apiBase(
          dev
        )}/namespaces/twitter/verify?tweetId=${tweetId}&publicKey=${wallet?.publicKey.toString()}&handle=${handle}${
          cluster && `&cluster=${cluster}`
        }`
      )
      const json = await response.json()
      if (response.status !== 200) throw new Error(json.message)
      console.log('Verification response: ', json)
      return
    },
    {
      onError: (e) => {
        console.log(e)
      },
    }
  )
}
