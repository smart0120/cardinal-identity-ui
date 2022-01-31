export type IEnvironment = Readonly<{
  name: string;
  endpoint: string;
}>;

export const environments = {
  "mainnet-beta": {
    name: "Mainnet Beta",
    endpoint: "https://api.mainnet-beta.solana.com",
  },
  devnet: {
    name: "Devnet",
    endpoint: "https://api.devnet.solana.com/",
  },
  testnet: {
    name: "Testnet",
    endpoint: "https://api.testnet.solana.com/",
  },
  localnet: {
    name: "Localnet",
    endpoint: "http://localhost:8899/",
  },
} as const;
