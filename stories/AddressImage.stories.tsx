import { Connection, PublicKey } from "@solana/web3.js";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { omit } from "lodash";
import React from "react";
import { withReactContext } from "storybook-react-context";

import { AddressImage } from "../lib/components/AddressImage";
import { WalletIdentityContext } from "../lib/providers/WalletIdentityProvider";
import { tryPublicKey } from "../lib/utils/format";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Example/AddressImage",
  component: AddressImage,
  argTypes: {
    connection: {
      options: ["mainnet", "devnet", "testnet"],
      description: "Solana RPC connection to fetch the mapping from",
      mapping: {
        mainnet: new Connection("https://api.mainnet-beta.solana.com"),
        devnet: new Connection("https://api.devnet.solana.com"),
        testnet: new Connection("https://api.testnet.solana.com"),
      },
      address: {
        control: "text",
      },
    },
  },
  decorators: [
    withReactContext({
      Context: WalletIdentityContext,
      initialState: {},
    }),
  ],
} as ComponentMeta<typeof AddressImage>;

const Template: ComponentStory<typeof AddressImage> = ({ ...args }) => {
  let publicKey = args.address;
  // @ts-ignore
  if (typeof args.address !== PublicKey) {
    // @ts-ignore
    publicKey = tryPublicKey(args.address) || undefined;
  }
  if (publicKey) {
    return (
      <AddressImage
        address={publicKey}
        connection={
          args.connection ||
          new Connection("https://api.mainnet-beta.solana.com")
        }
        {...omit(args, "address", "connection")}
      />
    );
  }
  return <div>Invalid Public Key</div>;
};

export const Primary = Template.bind({});
Primary.args = {
  address: new PublicKey("3c5mtZ9PpGu3hj1W1a13Hie1CAXKnRyj2xruNxwWcWTz"),
  connection: new Connection("https://api.mainnet-beta.solana.com"),
};
