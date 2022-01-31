import type { Network } from "@saberhq/solana-contrib";
import { ChainId, networkToChainId } from "@saberhq/token-utils";
import { useConnectionContext } from "@saberhq/use-solana";
import * as Sentry from "@sentry/react";
import { useEffect, useMemo } from "react";
import { createContainer } from "unstated-next";

import { SOLE_NETWORK } from "../providers/WalletConnectorProvider";
import type { IEnvironment } from "./environments";
import { environments } from "./environments";

export const envs = {
  "mainnet-beta": ChainId.MainnetBeta,
  devnet: ChainId.Devnet,
  testnet: ChainId.Testnet,
} as const;

interface UseEnvironment {
  loading: boolean;
  name: string;
  endpoint: string;

  chainId: ChainId | null;
  environments: { [N in Network]: IEnvironment };
}

const useEnvironmentInternal = (): UseEnvironment => {
  const { network, setNetwork } = useConnectionContext();
  useEffect(() => {
    Sentry.setContext("network", {
      network,
    });
  }, [network]);

  useEffect(() => {
    if (SOLE_NETWORK && SOLE_NETWORK !== network) {
      setNetwork(SOLE_NETWORK);
    }
  });

  const environment: IEnvironment = environments[network];
  const chainId: ChainId = useMemo(() => networkToChainId(network), [network]);

  return {
    loading: false,
    name: environment.name,
    endpoint: environment.endpoint,
    chainId,
    environments,
  };
};

export const { Provider: EnvironmentProvider, useContainer: useEnvironment } =
  createContainer(useEnvironmentInternal);
