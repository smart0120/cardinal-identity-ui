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
      <div className="flex min-h-[72px] flex-wrap items-center justify-center gap-4 py-4 px-8 md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex cursor-pointer items-center">
            <img src="assets/nukepadlogo.png" width="200" />
          </div>
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
