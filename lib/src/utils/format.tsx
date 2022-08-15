import { shortenAddress } from '@cardinal/namespaces'
import { PublicKey } from '@solana/web3.js'

import { getIdentity } from '../common/Identities'

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
