import { Connection } from "@solana/web3.js";
import React, { useContext, useMemo, useState } from "react";

export interface Environment {
  label: string;
  value: string;
}

export interface EnvironmentContextValues {
  environment: Environment;
  setEnvironment: (newEnvironment: Environment) => void;
  connection: Connection;
}

export const ENVIRONMENTS: Environment[] = [
  {
    label: "mainnet",
    value: "https://ssc-dao.genesysgo.net/",
  },
  {
    label: "testnet",
    value: "https://api.testnet.solana.com",
  },
  {
    label: "devnet",
    value: "https://api.devnet.solana.com",
  },
  {
    label: "localnet",
    value: "http://127.0.0.1:8899",
  },
];

const EnvironmentContext: React.Context<null | EnvironmentContextValues> =
  React.createContext<null | EnvironmentContextValues>(null);

export function EnvironmentContextProvider({
  children,
}: {
  children: React.ReactChild;
}) {
  // could be used by environment selector
  const [environment, setEnvironment] = useState<Environment>(ENVIRONMENTS[0]!);

  // only update connection if environment changes
  const connection = useMemo(
    () => new Connection(environment.value, "recent"),
    [environment]
  );

  return (
    <EnvironmentContext.Provider
      value={{
        environment,
        setEnvironment,
        connection,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironmentCtx(): EnvironmentContextValues {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error("Missing connection context");
  }
  return context;
}
