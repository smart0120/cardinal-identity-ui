import type { AccountData } from '@cardinal/common'
import { getQueryParam } from '@cardinal/common'
import type { ReverseEntryData } from '@cardinal/namespaces'
import { breakName } from '@cardinal/namespaces'

import type { UserTokenData } from '../hooks/useUserNamesForNamespace'

export const nameFromToken = (
  tokenData: Pick<UserTokenData, 'metaplexData'>
): [string, string] => {
  return nameFromMint(
    tokenData.metaplexData?.parsed.data.name || '',
    tokenData.metaplexData?.parsed.data.uri || ''
  )
}

export const nameFromMint = (name: string, uri: string): [string, string] => {
  if (uri.includes('name')) {
    return [decodeURIComponent(getQueryParam(uri, 'name') || ''), name]
  }
  return [
    decodeURIComponent(breakName(name || '')[1]),
    breakName(name || '')[0],
  ]
}

export const nameFromReverseEntry = (
  reverseEntryData: AccountData<ReverseEntryData> | undefined
): [string, string] | undefined => {
  return reverseEntryData
    ? [reverseEntryData.parsed.entryName, reverseEntryData.parsed.namespaceName]
    : undefined
}

export const isReverseEntry = (
  tokenData: Pick<UserTokenData, 'metaplexData'>,
  reverseEntryData: AccountData<ReverseEntryData> | undefined
): boolean => {
  return (
    nameFromToken(tokenData).join() ===
    nameFromReverseEntry(reverseEntryData)?.join()
  )
}
