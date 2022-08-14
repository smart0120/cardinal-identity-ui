import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'

import { apiBase } from '../utils/constants'
import { tracer, withTrace } from '../utils/trace'
import { discordCodeFromUrl, handleFromTweetUrl } from '../utils/verification'

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
  dev: boolean,
  accessToken: string,
  setAccessToken: (handle: string) => void,
  setHandle: (handle: string) => void
) => {
  const { identity } = useWalletIdentity()

  return useMutation(
    [wallet.publicKey.toString()],
    async ({
      verificationUrl,
    }: {
      verificationUrl?: string
    }): Promise<void> => {
      if (!verificationUrl) return
      let handle = ''
      let code = ''

      // custom info per identity
      switch (identity.name) {
        case 'twitter': {
          handle = handleFromTweetUrl(verificationUrl)?.toString() || ''
          break
        }
        case 'discord': {
          code = discordCodeFromUrl(verificationUrl)?.toString() || ''
          break
        }
        default: {
          throw new Error('Invalid identity namespace')
        }
      }

      const response = await withTrace(
        () =>
          fetch(
            `${apiBase(dev)}/${
              identity.name
            }/verify?tweetId=${verificationUrl}&publicKey=${wallet?.publicKey.toString()}&handle=${handle}&code=${code}&accessToken=${accessToken}${
              cluster && `&cluster=${cluster}`
            }`
          ),
        tracer({ name: 'useHandleVerify' })
      )
      const json = await response.json()
      if (response.status !== 200) throw new Error(json.error)
      console.log('Verification response: ', json)

      // custom info per identity
      switch (identity.name) {
        case 'twitter': {
          setHandle(json.handle)
          break
        }
        case 'discord': {
          setHandle(json.info.username || '')
          setAccessToken(json.info.accessToken || '')
          break
        }
        default: {
          throw new Error('Invalid identity namespace')
        }
      }
      return
    },
    {
      onError: (e) => {
        console.log(e)
      },
    }
  )
}
