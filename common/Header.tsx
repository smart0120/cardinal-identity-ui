import styled from '@emotion/styled'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
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
        <div className="">
          <img
            className="h-[40px]"
            style={{ position: 'relative', top: '10px' }}
            src="/assets/cardinal-titled.png"
            alt="Cardinal logo"
          />
        </div>
        <div className="flex flex-col justify-end text-[10px] italic text-white">
          <span
            className="rounded-md px-[7px] py-1"
            style={{ background: '#FFFFFF30', transform: 'translateY(20%)' }}
          >
            alpha
          </span>
        </div>
      </div>
      {/* {title && <div className="center">{title}</div>} */}
      <div className="flex flex-row">
        {environment.label !== 'mainnet-beta' && (
          <div
            style={{
              color: 'rgb(101,119,134,1)',
              padding: '4px 6px',
              background: '#DDD',
              borderRadius: '5px',
            }}
          >
            {environment.label}
          </div>
        )}
        <WalletButton />
      </div>
    </div>
  )
}

// .subscript {
//   font-size: 10px;
//   font-style: italic;
//   position: absolute;
//   bottom: -5px;
//   right: -35px;
//   background: rgba(255, 255, 255, 0.3);
//   border-radius: 6px;
//   padding: 3px 5px;
// }
