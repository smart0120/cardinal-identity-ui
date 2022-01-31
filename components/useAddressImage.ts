import { breakName } from '@cardinal/namespaces'
import { tryGetImageUrl } from '@cardinal/namespaces-components'
import type { PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'

import { useAddressName } from './useAddressName'

export const useAddressImage = (
  address: PublicKey | undefined,
  dev?: boolean
): { addressImage: string | undefined; loadingImage: boolean } => {
  const [addressImage, setAddressImage] = useState<string | undefined>(
    undefined
  )
  const [loadingImage, setLoadingImage] = useState<boolean>(true)
  const { displayName, loadingName } = useAddressName(address)

  const refreshImage = async (displayName: string | undefined) => {
    try {
      setLoadingImage(true)
      const [_namespace, handle] = displayName ? breakName(displayName) : []
      if (handle) {
        const imageUrl = await tryGetImageUrl(handle, dev)
        setAddressImage(imageUrl)
      } else {
        setAddressImage(undefined)
      }
    } finally {
      setLoadingImage(false)
    }
  }

  useEffect(() => {
    void refreshImage(displayName)
  }, [displayName])
  return { addressImage, loadingImage: loadingImage || loadingName }
}
