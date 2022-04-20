import { tryGetName } from '@cardinal/namespaces'
import {
  formatShortAddress,
  useWalletIdentity,
} from '@cardinal/namespaces-components'
import styled from '@emotion/styled'
import type { PublicKey } from '@solana/web3.js'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { useEffect, useState } from 'react'

import { ContentLoader } from './ContentLoader'

const StyledLink = styled.div`
  margin: 0px auto;
  a {
    color: #177ddc;
    text-decoration: none;
    transition: 0.2s all;
    &:hover {
      opacity: 0.6;
    }
  }
`
export const formatTwitterLink = (handle: string | undefined) => {
  if (!handle) return <></>
  return (
    <StyledLink>
      <a
        href={`https://twitter.com/${handle}`}
        target="_blank"
        rel="noreferrer"
      >
        {handle}
      </a>
    </StyledLink>
  )
}

export const useAddressName = (
  address: PublicKey | undefined
): { displayName: string | undefined; loadingName: boolean } => {
  const { connection } = useEnvironmentCtx()
  const { handle } = useWalletIdentity()
  const [displayName, setDisplayName] = useState<string | undefined>()
  const [loadingName, setLoadingName] = useState<boolean>(true)

  const refreshName = async () => {
    try {
      setLoadingName(true)
      if (address) {
        const n = await tryGetName(connection, address)
        setDisplayName(n)
      }
    } finally {
      setLoadingName(false)
    }
  }

  useEffect(() => {
    void refreshName()
    // handle is desired to be in here to enforce refresh of the name when modal closes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, address?.toString(), handle])

  return { displayName, loadingName }
}

export const useAddress = (address: PublicKey | undefined) => {
  const { displayName, loadingName } = useAddressName(address)

  if (!address) return <></>
  return loadingName ? (
    <ContentLoader>
      <rect x="80" y="17" rx="4" ry="4" width="300" height="13" />
    </ContentLoader>
  ) : (
    <div style={{ display: 'flex', gap: '5px' }}>
      {formatTwitterLink(displayName) || formatShortAddress(address)}
    </div>
  )
}
