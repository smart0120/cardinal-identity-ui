import styled from '@emotion/styled'
import { useWallet } from '@solana/wallet-adapter-react'
import { Header } from 'common/Header'
import Layout from 'common/Layout'
import { PlaceholderProfile } from 'components/Profile'
import { useWalletIdentity } from 'lib/src'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const TwitterBackground = styled.div`
  z-index: -1;
  top: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  background: #1da1f2;
`

const TwitterHome = () => {
  const wallet = useWallet()
  const router = useRouter()
  const { identities } = useWalletIdentity()
  const identity = identities.length === 1 ? identities[0] : undefined
  const dev = router.query['cluster'] === 'devnet'

  useEffect(() => {
    if (wallet.connected) {
      const url = new URL(
        window.location.origin + `/${wallet?.publicKey?.toString()}`
      )
      if (dev) {
        url.searchParams.append('cluster', 'devnet')
      }
      router.push(url, undefined, {
        shallow: true,
      })
    }
  }, [wallet.connected, wallet.publicKey, router])

  return (
    <Layout>
      <PlaceholderProfile />
    </Layout>
  )
}

export default TwitterHome
