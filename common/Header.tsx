import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GlyphWallet } from 'assets/GlyphWallet'
import { AccountConnect } from 'lib/src'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'

import { ButtonSmall } from './ButtonSmall'
import { asWallet } from './Wallets'

export const Header = () => {
  const wallet = useWallet()
  const walletModal = useWalletModal()
  const { secondaryConnection, environment } = useEnvironmentCtx()

  return (
    <div className="w-full px-4 py-4">
      <div className="flex min-h-[72px] flex-wrap items-center gap-4 md:py-4 md:px-8 justify-between">
        <div className="cursor-pointer">
          <img src="assets/nukepadlogo.png" className='h-[50px] hidden md:block' />
          <img src="favicon.ico" className='h-[50px] md:hidden' />
        </div>
        <div className="flex-5 flex items-center justify-end gap-6">
          {wallet.connected && wallet.publicKey ? (
            <AccountConnect
              dark={true}
              connection={secondaryConnection}
              environment={environment.label}
              handleDisconnect={() => wallet.disconnect()}
              wallet={asWallet(wallet)}
            />
          ) : (
            <ButtonSmall
              className="text-xs text-black"
              onClick={() => walletModal.setVisible(true)}
            >
              <GlyphWallet />
            </ButtonSmall>
          )}
        </div>
      </div>
    </div>
  )
}
