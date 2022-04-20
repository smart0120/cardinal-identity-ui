import { jsx as _jsx, Fragment as _Fragment } from "@emotion/react/jsx-runtime";
import styled from "@emotion/styled";
import { NameEntryClaim } from "./NameEntryClaim";
export const ClaimCard = ({ appName, appTwitter, dev, cluster, connection, wallet, notify, onComplete, }) => {
    return (_jsx(_Fragment, { children: _jsx(ClaimCardOuter, { children: _jsx(NameEntryClaim, { dev: dev, cluster: cluster, connection: connection, wallet: wallet, appName: appName, appTwitter: appTwitter, notify: notify, onComplete: onComplete }, void 0) }, void 0) }, void 0));
};
export const ClaimCardOuter = styled.div `
  width 100%;
  height: 100%;
  position: relative;
  margin: 0px auto;
  min-height: 200px;
  padding: 0px 20px;
`;
//# sourceMappingURL=ClaimCard.js.map