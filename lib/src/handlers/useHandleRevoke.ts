import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, PublicKey } from '@solana/web3.js'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { useMutation, useQueryClient } from 'react-query'
import { apiBase } from '../utils/constants'
import { tracer, withTrace } from '../utils/trace'

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
  dev: boolean,
  handle: string,
  accessToken: string
) => {
  const { identity } = useWalletIdentity()
  const queryClient = useQueryClient()
  return useMutation(
    async ({
      tweetId,
      handle,
    }: {
      tweetId?: string
      handle?: string
    }): Promise<void> => {
      if (!handle || !tweetId) return
      const trace = tracer({ name: 'useHandleRevoke' })
      const response = await withTrace(
        () =>
          fetch(
            `${apiBase(
              dev
            )}/namespaces/twitter/revoke?tweetId=${tweetId}&publicKey=${wallet?.publicKey.toString()}&handle=${handle}${
              cluster && `&cluster=${cluster}`
            }`
          ),
        trace,
        { op: 'getTransaction' }
      )
      trace?.finish()
      const json = await response.json()
      if (response.status !== 200) throw new Error(json.error)
    },
    {
      onSuccess: () => queryClient.invalidateQueries(),
    }
  )
}
