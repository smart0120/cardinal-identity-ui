import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, Connection } from '@solana/web3.js'
import React, { useContext, useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import { ClaimCard } from '..'
import { Modal } from '../modal'
import { withSleep } from '../utils/transactions'

const DEBUG = true

export interface WalletIdentity {
  show: (
    wallet: Wallet,
    connection: Connection,
    cluster: Cluster,
    secondaryConnection?: Connection,
    dev?: boolean
  ) => void
  handle?: string
  wallet?: Wallet
  connection?: Connection
  secondaryConnection?: Connection
  cluster?: Cluster
  dev?: boolean
  showIdentityModal: boolean
}

export const WalletIdentityContext = React.createContext<WalletIdentity | null>(
  null
)

interface Props {
  appName?: string
  appTwitter?: string
  children: React.ReactNode
}

export const WalletIdentityProvider: React.FC<Props> = ({
  appName,
  appTwitter,
  children,
}: Props) => {
  const [wallet, setWallet] = useState<Wallet>()
  const [connection, setConnection] = useState<Connection>()
  const [secondaryConnection, setSecondaryConnection] = useState<Connection>()
  const [cluster, setCluster] = useState<Cluster | undefined>(undefined)
  const [dev, setDev] = useState<boolean | undefined>(undefined)
  const [showIdentityModal, setShowIdentityModal] = useState<boolean>(false)
  const [handle, setHandle] = useState<string | undefined>(undefined)

  return (
    <WalletIdentityContext.Provider
      value={{
        show: (wallet, connection, cluster, secondaryConnection, dev) => {
          setWallet(wallet)
          setConnection(connection)
          setCluster(cluster)
          setSecondaryConnection(secondaryConnection)
          setDev(dev)
          setShowIdentityModal(true)
        },
        handle,
        showIdentityModal,
        wallet,
        connection,
        cluster,
        dev,
      }}
    >
      <QueryClientProvider client={new QueryClient()}>
        <Modal
          isOpen={showIdentityModal}
          onDismiss={() => setShowIdentityModal(false)}
          darkenOverlay={true}
        >
          <ClaimCard
            dev={dev}
            cluster={cluster}
            connection={connection}
            secondaryConnection={secondaryConnection}
            appName={appName}
            appTwitter={appTwitter}
            onComplete={(handle: string) => {
              setHandle(handle)
              withSleep(() => {
                setShowIdentityModal(false)
              }, 1000)
            }}
          />
        </Modal>
        {children}
        {DEBUG && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </WalletIdentityContext.Provider>
  )
}

export const useWalletIdentity = (): WalletIdentity => {
  const identity = useContext(WalletIdentityContext)
  if (!identity) {
    throw new Error('Not in WalletIdentity context')
  }
  return identity
}
