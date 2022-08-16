import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type { Wallet } from '@saberhq/solana-contrib'
import type { PublicKey } from '@solana/web3.js'
import { useMutation } from 'react-query'

import type { Identity } from '../common/Identities'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { tracer, withTrace } from '../utils/trace'

export interface HandleSetParam {
  metaplexData?: {
    pubkey: PublicKey
    parsed: metaplex.MetadataData
  } | null
  tokenManager?: AccountData<TokenManagerData>
  certificate?: AccountData<CertificateData> | null
}

export type VerifyResponse = {
  error?: string
  handle?: string
  accessToken?: string
}

export const useHandleVerify = (
  wallet: Wallet,
  identity: Identity,
  accessToken: string | undefined,
  setAccessToken: (handle: string | undefined) => void,
  setHandle: (handle: string | undefined) => void
) => {
  const { dev, cluster } = useWalletIdentity()
  return useMutation(
    [wallet.publicKey.toString()],
    async ({ proof }: { proof?: string }): Promise<void> => {
      if (!proof || proof.length === 0) return

      const verifierUrl = identity.verifierUrl(
        wallet.publicKey.toString(),
        proof,
        accessToken,
        cluster,
        dev
      )
      const response = await withTrace(
        () => fetch(verifierUrl),
        tracer({ name: 'useHandleVerify' })
      )
      const json = (await response.json()) as VerifyResponse
      if (response.status !== 200) throw new Error(json.error)
      console.log('Verification response: ', JSON.stringify(json))

      setHandle(json.handle)
      setAccessToken(json?.accessToken)
      return
    },
    {
      onError: (e) => {
        console.log(e)
      },
    }
  )
}
