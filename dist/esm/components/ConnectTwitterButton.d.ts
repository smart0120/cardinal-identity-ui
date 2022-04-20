/// <reference types="react" />
import type { web3 } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
interface Props extends Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "onClick"> {
    cluster: string;
    connection: web3.Connection;
    wallet: Wallet;
    address: web3.PublicKey;
    disabled?: boolean;
    dev?: boolean;
    variant?: "primary" | "secondary";
}
export declare const ConnectTwitterButton: React.FC<Props>;
export {};
//# sourceMappingURL=ConnectTwitterButton.d.ts.map