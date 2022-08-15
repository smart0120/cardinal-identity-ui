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
  namespaceName?: string
) => {
  const { dev } = useWalletIdentity()
  const addressName = useAddressName(connection, address, namespaceName)
  return useQuery<string | undefined>(
    ['useAddressImage', address?.toString(), namespaceName, addressName.data],
    async () => {
      const [reverseEntryNamespaceName, reverseEntryHandle] = addressName.data
        ? breakName(addressName.data)
        : []
      if (reverseEntryHandle) {
        const imageUrl = await withTrace(
          () =>
            tryGetImageUrl(
              namespaceName === 'default'
                ? reverseEntryNamespaceName
                : namespaceName,
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
