import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, Connection } from '@solana/web3.js'
import React, { Dispatch, SetStateAction, useContext, useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import { ClaimCard } from '..'
import { identities, Identity } from '../common/Identities'
import { Modal } from '../modal'
import { withSleep } from '../utils/transactions'

const DEBUG = false

export type ShowParams = {
  connection: Connection
  cluster: Cluster
  wallet: Wallet
  showManage?: boolean
  onClose?: () => void
  secondaryConnection?: Connection
  dev?: boolean
}

export interface WalletIdentity {
  show: (arg: ShowParams) => void
  identity: Identity
  setIdentity: Dispatch<SetStateAction<Identity>>
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
  identityKey?: string
  appName?: string
  appTwitter?: string
  flows?: 'discord' | 'twitter'[]
  children: React.ReactNode
}

export const WalletIdentityProvider: React.FC<Props> = ({
  identityKey,
  appName,
  appTwitter,
  children,
}: Props) => {
  const [wallet, setWallet] = useState<Wallet>()
  const [connection, setConnection] = useState<Connection>()
  const [secondaryConnection, setSecondaryConnection] = useState<Connection>()
  const [showManageDefault, setShowManageDefault] = useState<boolean>(false)
  const [cluster, setCluster] = useState<Cluster | undefined>(undefined)
  const [dev, setDev] = useState<boolean | undefined>(undefined)
  const [onClose, setOnClose] = useState<(() => void) | undefined>()
  const [showIdentityModal, setShowIdentityModal] = useState<boolean>(false)
  const [handle, setHandle] = useState<string | undefined>(undefined)
  const [identity, setIdentity] = useState<Identity>(
    identities[identityKey!] || identities['default']!
  )

  return (
    <WalletIdentityContext.Provider
      value={{
        show: ({
          wallet,
          connection,
          cluster,
          secondaryConnection,
          dev,
          onClose,
          showManage: showManageDefault,
        }) => {
          setWallet(wallet)
          setConnection(connection)
          setCluster(cluster)
          setSecondaryConnection(secondaryConnection)
          setDev(dev)
          onClose && setOnClose(() => onClose)
          setShowIdentityModal(true)
          setShowManageDefault(showManageDefault || false)
        },
        handle,
        wallet,
        connection,
        cluster,
        dev,
        showIdentityModal,
        identity,
        setIdentity,
      }}
    >
      <QueryClientProvider client={new QueryClient()}>
        <Modal
          isOpen={showIdentityModal}
          onDismiss={() => {
            setShowIdentityModal(false)
            onClose && onClose()
          }}
          darkenOverlay={true}
        >
          <ClaimCard
            dev={dev}
            cluster={cluster}
            wallet={wallet}
            connection={connection}
            secondaryConnection={secondaryConnection}
            appName={appName}
            namespaceName={identity.name}
            appTwitter={appTwitter}
            showManage={showManageDefault}
            onComplete={(handle: string) => {
              setHandle(handle)
              withSleep(() => {
                setShowIdentityModal(false)
                onClose && onClose()
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
