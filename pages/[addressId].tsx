import { firstParam } from '@cardinal/common'
import { getNameEntry } from '@cardinal/namespaces'
import { useWallet } from '@solana/wallet-adapter-react'
import type { PublicKey } from '@solana/web3.js'
import { Header } from 'common/Header'
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
    <div
      className={`fixed flex h-full w-full flex-col bg-white`}
    >
      <Head>
        {/* <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="twitter.cardinal.so" />
        <meta
          name="twitter:title"
          content={`Claim your ${identity?.displayName} handle on Solana!`}
        />
        <meta
          name="twitter:description"
          content={`Secure your identity on Solana by claiming your ${identity?.displayName} handle as an NFT, powered by Cardinal.`}
        />
        <meta
          name="twitter:image"
          content={`${process.env.NEXT_PUBLIC_BASE_URL
            }/api/twitter-card/${addressId}${router.query.handle ? `?handle=${router.query.handle}` : ''
            }`}
        /> */}
      </Head>
      <Header />
      <div className="p-4 overflow-auto flex h-full md:items-center">
        {wallet.connected && address ? (
          <div className="mx-auto w-full md:w-[510px]">
            <Profile address={address} />
          </div>
        ) : (
          <div className="mx-auto w-full md:w-[510px]">
            <PlaceholderProfile />
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
