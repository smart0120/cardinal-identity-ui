import { breakName } from '@cardinal/namespaces'
import type { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'

import { tryGetImageUrl } from '../utils/format'
import { tracer, withTrace } from '../utils/trace'
import { useAddressName } from './useAddressName'

export const useAddressImage = (
  connection: Connection,
  address: PublicKey | undefined,
  dev?: boolean
) => {
  const { identity } = useWalletIdentity()
  const addressName = useAddressName(connection, address, identity.name)
  return useQuery<string | undefined>(
    ['useAddressImage', address?.toString(), identity.name, addressName.data],
    async () => {
      const [reverseEntryNamespaceName, reverseEntryHandle] = addressName.data
        ? breakName(addressName.data)
        : []
      if (reverseEntryHandle) {
        const imageUrl = await withTrace(
          () =>
            tryGetImageUrl(
              identity.name === 'default'
                ? reverseEntryNamespaceName
                : identity.name,
              reverseEntryHandle,
              dev || false
            ),
          tracer({ name: 'useAddressImage' })
        )
        return imageUrl
      } else {
        return undefined
      }
    },
    {
      enabled: addressName.isFetched,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}
