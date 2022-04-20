import { jsx as _jsx, jsxs as _jsxs } from "@emotion/react/jsx-runtime";
import { HiUserCircle } from 'react-icons/hi';
import { AddressImage } from '../components/AddressImage';
import { DisplayAddress } from '../components/DisplayAddress';
import { shortPubKey } from '../utils/format';
export const ProfileSmall = ({ connection, address, dark, onClick, placeholder, }) => {
    return (_jsxs("div", Object.assign({ className: "flex cursor-pointer gap-2 text-sm", onClick: onClick }, { children: [_jsx(AddressImage, { connection: connection, address: address || undefined, height: "40px", width: "40px", dark: dark, placeholder: placeholder || (_jsx("div", Object.assign({ className: "text-gray-300", style: {
                        cursor: 'pointer',
                        overflow: 'hidden',
                        height: '40px',
                        width: '40px',
                    } }, { children: _jsx(HiUserCircle, { className: "relative left-[-5px] top-[-5px] h-[50px] w-[50px]" }, void 0) }), void 0)) }, void 0), _jsxs("div", { children: [_jsx("div", Object.assign({ className: `text-${dark ? 'white' : 'black'}` }, { children: _jsx(DisplayAddress, { style: { pointerEvents: 'none' }, connection: connection, address: address || undefined, height: "20px", width: "100px", dark: dark }, void 0) }), void 0), _jsx("div", Object.assign({ className: "text-sm text-gray-500" }, { children: shortPubKey(address) }), void 0)] }, void 0)] }), void 0));
};
//# sourceMappingURL=ProfileSmall.js.map