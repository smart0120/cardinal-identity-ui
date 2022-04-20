import { jsx as _jsx, jsxs as _jsxs } from "@emotion/react/jsx-runtime";
import React, { useContext, useState } from "react";
import { ClaimCard } from "..";
import { Modal } from "../modal";
import { withSleep } from "../utils/transactions";
export const WalletIdentityContext = React.createContext(null);
export const WalletIdentityProvider = ({ appName, appTwitter, children, }) => {
    const [wallet, setWallet] = useState(null);
    const [connection, setConnection] = useState(null);
    const [cluster, setCluster] = useState(undefined);
    const [dev, setDev] = useState(undefined);
    const [showIdentityModal, setShowIdentityModal] = useState(false);
    const [handle, setHandle] = useState(undefined);
    return (_jsxs(WalletIdentityContext.Provider, Object.assign({ value: {
            show: (wallet, connection, cluster, dev) => {
                setWallet(wallet);
                setConnection(connection);
                setCluster(cluster);
                setDev(dev);
                setShowIdentityModal(true);
            },
            handle,
            showIdentityModal,
        } }, { children: [_jsx(Modal, Object.assign({ isOpen: showIdentityModal, onDismiss: () => setShowIdentityModal(false), darkenOverlay: true }, { children: _jsx(ClaimCard, { dev: dev, cluster: cluster, wallet: wallet, connection: connection, appName: appName, appTwitter: appTwitter, onComplete: (handle) => {
                        setHandle(handle);
                        withSleep(() => {
                            setShowIdentityModal(false);
                        }, 1000);
                    } }, void 0) }), void 0), children] }), void 0));
};
export const useWalletIdentity = () => {
    const identity = useContext(WalletIdentityContext);
    if (!identity) {
        throw new Error("Not in WalletIdentity context");
    }
    return identity;
};
//# sourceMappingURL=WalletIdentityProvider.js.map