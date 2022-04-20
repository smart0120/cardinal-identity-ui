import type { Wallet } from '@saberhq/solana-contrib';
import type { Connection } from '@solana/web3.js';
export declare const NameEntryClaim: ({ dev, cluster, connection, wallet, namespaceName, appName, appTwitter, notify, onComplete, }: {
    dev?: boolean | undefined;
    cluster?: string | undefined;
    connection: Connection | null;
    wallet: Wallet | null;
    namespaceName?: string | undefined;
    appName?: string | undefined;
    appTwitter?: string | undefined;
    notify?: ((arg: {
        message?: string;
        txid?: string;
    }) => void) | undefined;
    onComplete?: ((arg0: string) => void) | undefined;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=NameEntryClaim.d.ts.map