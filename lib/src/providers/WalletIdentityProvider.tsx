import type { Wallet } from '@saberhq/solana-contrib'
import type { Cluster, Connection } from '@solana/web3.js'
import React, { useContext, useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import * as Sentry from '@sentry/browser'

import { ClaimCard } from '..'
import { Modal } from '../modal'
import { withSleep } from '../utils/transactions'

const DEBUG = false
const SENTRY_DSN =
  'https://109718d85e0640f0b5f7160e2602b5f0@o1340959.ingest.sentry.io/6625303'

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
  const [showManageDefault, setShowManageDefault] = useState<boolean>(false)
  const [cluster, setCluster] = useState<Cluster | undefined>(undefined)
  const [dev, setDev] = useState<boolean | undefined>(undefined)
  const [onClose, setOnClose] = useState<(() => void) | undefined>()
  const [showIdentityModal, setShowIdentityModal] = useState<boolean>(false)
  const [handle, setHandle] = useState<string | undefined>(undefined)

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
  })

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
          Sentry.configureScope((scope) => {
            scope.setUser({
              username: wallet.publicKey?.toString(),
              wallet: wallet.publicKey?.toString(),
            })
            scope.setTag('wallet', wallet.publicKey?.toString())
          })
        },
        handle,
        wallet,
        connection,
        cluster,
        dev,
        showIdentityModal,
      }}
    >
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: {
              queries: {
                refetchOnMount: false,
                refetchOnWindowFocus: false,
              },
            },
          })
        }
      >
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
