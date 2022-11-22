import { firstParam } from '@cardinal/common'
import { getNameEntry } from '@cardinal/namespaces'
import { useWallet } from '@solana/wallet-adapter-react'
import type { PublicKey } from '@solana/web3.js'
import { Header } from 'common/Header'
import Layout from 'common/Layout'
import { PlaceholderProfile, Profile } from 'components/Profile'
import { tryPublicKey, useWalletIdentity } from 'lib/src'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { useEffect, useMemo, useState } from 'react'

const Home = () => {
  const wallet = useWallet()
  const router = useRouter()
  const [address, setAddress] = useState<PublicKey>()
  const { connection } = useEnvironmentCtx()
  const { identities } = useWalletIdentity()
  const identity = identities.length === 1 ? identities[0] : undefined
  const { addressId } = router.query

  useMemo(async () => {
    if (
      wallet.connected &&
      addressId?.toString() !== wallet.publicKey?.toString()
    ) {
      router.push(`/${wallet?.publicKey?.toString()}`, undefined, {
        shallow: true,
      })
    }

    const tryAddress = tryPublicKey(addressId)
    if (tryAddress) {
      setAddress(tryAddress)
    } else if (identity) {
      const nameEntry = await getNameEntry(
        connection,
        identity?.name,
        firstParam(addressId)
      )
      nameEntry.parsed.data && setAddress(nameEntry.parsed.data)
    }
  }, [wallet.connected, wallet.publicKey, addressId, router])

  useEffect(() => {
    console.log(wallet.connected, router.pathname)
    // if (!wallet.connected) {
    //   router.push('/', undefined, {
    //     shallow: true,
    //   })
    // }
  }, [wallet.connected, router])

  return (
    <Layout>
      {wallet.connected && address ? (
        <Profile address={address} />
      ) : (
        <PlaceholderProfile />
      )}
    </Layout>
  )
}

export default Home
