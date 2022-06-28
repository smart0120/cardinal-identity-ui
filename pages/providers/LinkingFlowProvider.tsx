import type { ReactChild } from 'react'
import React, { useContext, useState } from 'react'

export type LinkingFlow = {
  name: string
  colors: {
    primary: string
    secondary?: string
  }
}

const linkingFlows: { [key: string]: LinkingFlow } = {
  defualt: {
    name: 'default',
    colors: {
      primary: '',
    },
  },
  twitter: {
    name: 'twitter',
    colors: {
      primary: '',
    },
  },
  discord: {
    name: 'discord',
    colors: {
      primary: '',
    },
  },
}

export interface LinkingFlowValues {
  linkingFlow: LinkingFlow
  setLinkingFlow: (s: string) => void
}

const LinkingFlowValues: React.Context<LinkingFlowValues> =
  React.createContext<LinkingFlowValues>({
    linkingFlow: linkingFlows['portals']!,
    setLinkingFlow: () => {},
  })

export function LinkingFlowProvider({
  children,
  defaultLinkingFlow,
}: {
  children: ReactChild
  defaultLinkingFlow: LinkingFlow
}) {
  const [linkingFlow, setLinkingFlow] =
    useState<LinkingFlow>(defaultLinkingFlow)
  return (
    <LinkingFlowValues.Provider
      value={{
        linkingFlow: linkingFlow,
        setLinkingFlow: (project: string) => {
          if (linkingFlows[project]) {
            setLinkingFlow(linkingFlows[project]!)
          }
        },
      }}
    >
      {children}
    </LinkingFlowValues.Provider>
  )
}

export function useLinkingFlow(): LinkingFlowValues {
  return useContext(LinkingFlowValues)
}
