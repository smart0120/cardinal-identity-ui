import { Connection, PublicKey } from "@solana/web3.js";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { withReactContext } from "storybook-react-context";

import { DisplayAddress } from "../lib/components/DisplayAddress";
import { WalletIdentityContext } from "../lib/providers/WalletIdentityProvider";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Example/DisplayAddress",
  component: DisplayAddress,
  argTypes: {
    connection: {
      options: ["mainnet", "devnet", "testnet"],
      mapping: {
        mainnet: new Connection("https://api.mainnet-beta.solana.com"),
        devnet: new Connection("https://api.devnet.solana.com"),
        testnet: new Connection("https://api.testnet.solana.com"),
      },
    },
  },
  decorators: [
    withReactContext({
      Context: WalletIdentityContext,
      initialState: {},
    }),
  ],
} as ComponentMeta<typeof DisplayAddress>;

const Template: ComponentStory<typeof DisplayAddress> = (args) => (
  <DisplayAddress {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  address: new PublicKey("3c5mtZ9PpGu3hj1W1a13Hie1CAXKnRyj2xruNxwWcWTz"),
  connection: new Connection("https://api.mainnet-beta.solana.com"),
};
