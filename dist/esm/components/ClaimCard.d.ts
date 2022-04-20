/// <reference types="react" />
import type { Wallet } from "@saberhq/solana-contrib";
import type { Connection } from "@solana/web3.js";
export declare type ClaimCardProps = {
    dev?: boolean;
    cluster?: string;
    connection: Connection | null;
    wallet: Wallet | null;
    appName?: string;
    appTwitter?: string;
    notify?: (arg: {
        message?: string;
        txid?: string;
    }) => void;
    onComplete?: (arg: string) => void;
};
export declare const ClaimCard: ({ appName, appTwitter, dev, cluster, connection, wallet, notify, onComplete, }: ClaimCardProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const ClaimCardOuter: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme | undefined;
    as?: import("react").ElementType<any> | undefined;
}, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
//# sourceMappingURL=ClaimCard.d.ts.map