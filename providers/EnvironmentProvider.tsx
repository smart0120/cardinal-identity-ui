import { firstParam } from '@cardinal/common'
import type { Cluster } from '@solana/web3.js'
import { Connection } from '@solana/web3.js'
import type { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import React, { useContext, useMemo, useState } from 'react'

export interface Environment {
  label: Cluster
  primary: string
  secondary?: string
}

export interface EnvironmentContextValues {
  environment: Environment
  setEnvironment: (newEnvironment: Environment) => void
  connection: Connection
  secondaryConnection: Connection
}

export const ENVIRONMENTS: Environment[] = [
  {
    label: 'mainnet-beta',
    primary: process.env.MAINNET_PRIMARY || 'https://ssc-dao.genesysgo.net',
    secondary: 'https://ssc-dao.genesysgo.net',
  },
  {
    label: 'testnet',
    primary: 'https://api.testnet.solana.com',
  },
  {
    label: 'devnet',
    primary: 'https://api.devnet.solana.com',
  },
]

const EnvironmentContext: React.Context<null | EnvironmentContextValues> =
  React.createContext<null | EnvironmentContextValues>(null)

export const getInitialProps = async ({
  ctx,
}: {
  ctx: NextPageContext
}): Promise<{ linkingFlow: string }> => {
  const host = ctx.req?.headers.host || ctx.query.host
  const linkingFlow = host?.includes('discord') ? 'discord' : 'twitter'
  return {
    linkingFlow: linkingFlow,
  }
}

export function EnvironmentProvider({
  children,
}: {
  children: React.ReactChild
}) {
  const { query } = useRouter()
  const cluster = (query.project || query.host)?.includes('dev')
    ? 'devnet'
    : query.host?.includes('test')
    ? 'testnet'
    : query.cluster || process.env.BASE_CLUSTER || 'mainnet-beta'
  const foundEnvironment = ENVIRONMENTS.find((e) => e.label === cluster)
  const [environment, setEnvironment] = useState<Environment>(
    foundEnvironment ?? ENVIRONMENTS[0]!
  )

  useMemo(() => {
    const foundEnvironment = ENVIRONMENTS.find((e) => e.label === cluster)
    setEnvironment(foundEnvironment ?? ENVIRONMENTS[0]!)
  }, [cluster])

  const connection = useMemo(
    () => new Connection(environment.primary, { commitment: 'recent' }),
    [environment]
  )

  const secondaryConnection = useMemo(
    () =>
      new Connection(environment.secondary ?? environment.primary, {
        commitment: 'recent',
      }),
    [environment]
  )

  return (
    <EnvironmentContext.Provider
      value={{
        environment,
        setEnvironment,
        connection,
        secondaryConnection,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  )
}

export function useEnvironmentCtx(): EnvironmentContextValues {
  const context = useContext(EnvironmentContext)
  if (!context) {
    throw new Error('Missing connection context')
  }
  return context
}
