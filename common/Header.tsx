import styled from '@emotion/styled'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { LogoTitled } from 'lib/src/common/LogoTitled'
import { lighten } from 'polished'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'

const WalletButton = styled(WalletMultiButton)`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  z-index: 10;
  height: 38px;
  border: none;
  background: none;
  background-color: none;
  &:hover {
    background: none !important;
    background-color: none !important;
  }
`

export const Header = ({ title }: { title?: string }) => {
  const { environment } = useEnvironmentCtx()
  return (
    <div className="flex flex-row justify-between p-10">
      <div className="flex flex-row">
        <div className="my-auto flex flex-col">
          <LogoTitled className="inline-block h-6" />
          {/* <img
            className="h-[40px]"
            style={{ position: 'relative', top: '10px' }}
            src="/assets/cardinal-titled.png"
            alt="Cardinal logo"
          /> */}
        </div>
        <div className="absolute top-[70px] left-[210px] text-[10px] italic text-white">
          <span
            className="mr-2 rounded-md px-[7px] py-1"
            style={{ background: '#FFFFFF30', transform: 'translateY(90%)' }}
          >
            alpha
          </span>
          {environment.label !== 'mainnet-beta' && (
            <span
              className="rounded-md px-[7px] py-1"
              style={{ background: '#FFFFFF30', transform: 'translateY(20%)' }}
            >
              {environment.label}
            </span>
          )}
        </div>
      </div>
      {/* {title && <div className="center">{title}</div>} */}
      <div className="flex flex-row">
        <WalletButton />
      </div>
    </div>
  )
}
