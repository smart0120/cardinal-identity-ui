import { getNameEntry } from '@cardinal/namespaces'
import { tryPublicKey } from '@cardinal/namespaces-components'
import styled from '@emotion/styled'
import { useWallet } from '@solana/wallet-adapter-react'
import type { PublicKey } from '@solana/web3.js'
import { Header } from 'common/Header'
import { firstParam } from 'common/utils'
import { PlaceholderProfile, Profile } from 'components/Profile'
import { useRouter } from 'next/router'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { useMemo, useState } from 'react'

export const TwitterBackground = styled.div`
  z-index: -1;
  top: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  background: #1da1f2;
  //   background: linear-gradient(-45deg, #23a6d5, #1da1f2);
`

const TwitterClaim = () => {
  const wallet = useWallet()
  const router = useRouter()
  const [address, setAddress] = useState<PublicKey>()
  const { connection } = useEnvironmentCtx()
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
    } else {
      const nameEntry = await getNameEntry(
        connection,
        'twitter',
        firstParam(addressId)
      )
      nameEntry.parsed.data && setAddress(nameEntry.parsed.data as PublicKey)
    }
  }, [wallet.connected, wallet.publicKey, addressId, router])

  return (
    <>
      <Header />
      <div style={{ marginTop: '45vh', transform: 'translateY(-50%)' }}>
        {address ? (
          <div
            style={{
              width: '320px',
              margin: '0px auto',
            }}
          >
            <Profile address={address} />
          </div>
        ) : (
          <div
            style={{
              padding: '20px',
              width: '320px',
              margin: '0px auto',
            }}
          >
            <PlaceholderProfile />
          </div>
        )}
      </div>
      <TwitterBackground />
    </>
  )
}

export default TwitterClaim
