import { shortenAddress } from '@cardinal/namespaces'
import { PublicKey } from '@solana/web3.js'

import { getIdentity } from '../common/Identities'
import { apiBase } from './constants'
import { profileImage } from './profileImage'

export const formatIdentityLink = (
  handle: string | undefined,
  namespace: string | undefined
) => {
  if (!handle || !namespace) return <></>
  return (
    <div
      className="cursor-pointer"
      onClick={() => window.open(getIdentity(namespace)?.nameLink(handle))}
      style={{ color: '#177ddc' }}
    >
      {getIdentity(namespace)?.namePrefix}
      {handle}
    </div>
  )
}

export function shortPubKey(pubkey: PublicKey | string | null | undefined) {
  if (!pubkey) return ''
  return `${pubkey?.toString().substring(0, 4)}..${pubkey
    ?.toString()
    .substring(pubkey?.toString().length - 4)}`
}

export const tryPublicKey = (
  publicKeyString: PublicKey | string | string[] | undefined | null
): PublicKey | null => {
  if (publicKeyString instanceof PublicKey) return publicKeyString
  if (!publicKeyString) return null
  try {
    return new PublicKey(publicKeyString)
  } catch (e) {
    return null
  }
}

export const formatShortAddress = (address: PublicKey | undefined) => {
  if (!address) return <></>
  return (
    <a
      href={`https://explorer.solana.com/address/${address.toString()}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {shortenAddress(address.toString())}
    </a>
  )
}

export async function getImageUrl(
  namespace: string,
  name: string,
  dev?: boolean
): Promise<string | undefined> {
  if (namespace === 'twitter') {
    const response = await fetch(
      `${apiBase(
        dev
      )}/${namespace}/proxy?url=https://api.twitter.com/2/users/by&usernames=${name}&user.fields=profile_image_url`
    )
    const json = (await response.json()) as {
      data: { profile_image_url: string }[]
    }
    return json?.data[0]?.profile_image_url.replace('_normal', '') as string
  }
  return `data:image/svg+xml;utf8,${profileImage(namespace, name)}`
}
